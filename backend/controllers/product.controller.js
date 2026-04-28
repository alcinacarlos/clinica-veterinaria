const supabase = require('../config/supabase');

/**
 * GET /api/products
 * Público: lista todos los productos activos.
 */
const getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;

    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (category) query = query.ilike('category', `%${category}%`);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ products: data });
  } catch (err) {
    console.error('Error en getAllProducts:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * POST /api/products
 * Ventas, Admin: crear un nuevo producto.
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, image_url } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'name y price son obligatorios.' });
    }
    if (price < 0) return res.status(400).json({ error: 'El precio no puede ser negativo.' });
    if (stock < 0) return res.status(400).json({ error: 'El stock no puede ser negativo.' });

    const { data, error } = await supabase
      .from('products')
      .insert({ name, description, price, stock: stock || 0, category, image_url })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({ message: 'Producto creado.', product: data });
  } catch (err) {
    console.error('Error en createProduct:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * PUT /api/products/:id
 * Ventas, Admin: actualizar un producto.
 */
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, image_url, is_active } = req.body;

    const { data, error } = await supabase
      .from('products')
      .update({ name, description, price, stock, category, image_url, is_active })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: 'Producto no encontrado.' });

    return res.status(200).json({ message: 'Producto actualizado.', product: data });
  } catch (err) {
    console.error('Error en updateProduct:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { getAllProducts, createProduct, updateProduct };
