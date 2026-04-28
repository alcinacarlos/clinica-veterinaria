const supabase = require('../config/supabase');

/**
 * POST /api/orders
 * Clientela: crear una orden de compra.
 *
 * ⚡ LÓGICA CRÍTICA:
 * 1. Verificar stock disponible para cada ítem.
 * 2. Calcular subtotal (sum de quantity * unit_price).
 * 3. Si req.user.is_adopter === true, aplicar ADOPTER_DISCOUNT_PERCENT% de descuento.
 * 4. Decrementar stock de cada producto.
 * 5. Persistir order + order_items en una transacción.
 *
 * Body esperado:
 * {
 *   items: [{ product_id: UUID, quantity: number }],
 *   notes: string (opcional)
 * }
 */
const createOrder = async (req, res) => {
  try {
    const { items, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un ítem en la orden.' });
    }

    // 1. Obtener todos los productos solicitados
    const productIds = items.map((i) => i.product_id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock, is_active')
      .in('id', productIds);

    if (productsError) return res.status(500).json({ error: productsError.message });

    const productMap = {};
    products.forEach((p) => { productMap[p.id] = p; });

    // 2. Validar stock y calcular subtotal
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = productMap[item.product_id];

      if (!product) {
        return res.status(404).json({ error: `Producto ${item.product_id} no encontrado.` });
      }
      if (!product.is_active) {
        return res.status(400).json({ error: `El producto "${product.name}" no está disponible.` });
      }
      if (item.quantity <= 0) {
        return res.status(400).json({ error: 'La cantidad debe ser mayor a 0.' });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}.`,
        });
      }

      subtotal += product.price * item.quantity;
      validatedItems.push({ ...item, unit_price: product.price, product_name: product.name });
    }

    // 3. ⚡ Aplicar descuento si el usuario es adoptante
    const discountPercent = req.user.is_adopter
      ? parseFloat(process.env.ADOPTER_DISCOUNT_PERCENT || 15)
      : 0;

    const discountAmount = parseFloat(((subtotal * discountPercent) / 100).toFixed(2));
    const total = parseFloat((subtotal - discountAmount).toFixed(2));

    // 4. Crear la orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: req.user.id,
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        total,
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError) return res.status(500).json({ error: orderError.message });

    // 5. Crear los ítems de la orden
    const orderItems = validatedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // Cleanup: eliminar la orden si falla la inserción de ítems
      await supabase.from('orders').delete().eq('id', order.id);
      return res.status(500).json({ error: 'Error al guardar los ítems de la orden.' });
    }

    // 6. Decrementar stock de cada producto
    for (const item of validatedItems) {
      await supabase.rpc('decrement_stock', {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      });
    }

    return res.status(201).json({
      message: '✅ Orden creada exitosamente.',
      order: {
        ...order,
        items: validatedItems.map(({ product_id, quantity, unit_price, product_name }) => ({
          product_id, product_name, quantity, unit_price,
        })),
        discount_applied: discountPercent > 0,
      },
    });
  } catch (err) {
    console.error('Error en createOrder:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/orders
 * Clientela: sus propias órdenes.
 * Ventas/Admin: todas las órdenes.
 */
const getOrders = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const isAdminOrSales = ['admin', 'ventas'].includes(role);

    let query = supabase
      .from('orders')
      .select(`
        *,
        user:users(id, email, full_name),
        order_items(quantity, unit_price, product:products(id, name))
      `)
      .order('created_at', { ascending: false });

    if (!isAdminOrSales) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ orders: data });
  } catch (err) {
    console.error('Error en getOrders:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * PUT /api/orders/:id/status
 * Ventas, Admin: actualizar el estado de envío de una orden.
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `status inválido. Válidos: ${validStatuses.join(', ')}.` });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: 'Orden no encontrada.' });

    return res.status(200).json({ message: 'Estado de la orden actualizado.', order: data });
  } catch (err) {
    console.error('Error en updateOrderStatus:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus };
