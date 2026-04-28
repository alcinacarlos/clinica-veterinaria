const supabase = require('../config/supabase');

/**
 * POST /api/appointments
 * Clientela: agendar una cita veterinaria.
 *
 * ⚡ LÓGICA CRÍTICA:
 * Si req.user.is_adopter === true, se aplica ADOPTER_DISCOUNT_PERCENT% sobre el precio del servicio.
 *
 * Body esperado:
 * {
 *   service_id: UUID,
 *   pet_id: UUID (opcional),
 *   scheduled_at: ISO 8601 datetime,
 *   vet_id: UUID (opcional, puede asignarse después),
 *   notes: string (opcional)
 * }
 */
const createAppointment = async (req, res) => {
  try {
    const { service_id, pet_id, scheduled_at, vet_id, notes } = req.body;

    if (!service_id || !scheduled_at) {
      return res.status(400).json({ error: 'service_id y scheduled_at son obligatorios.' });
    }

    // Obtener el servicio para tomar su precio base
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, name, price, is_active')
      .eq('id', service_id)
      .single();

    if (serviceError || !service) {
      return res.status(404).json({ error: 'Servicio no encontrado.' });
    }
    if (!service.is_active) {
      return res.status(400).json({ error: 'Este servicio no está disponible actualmente.' });
    }

    // ⚡ Calcular precio con descuento de adoptante
    const discountPercent = req.user.is_adopter
      ? parseFloat(process.env.ADOPTER_DISCOUNT_PERCENT || 15)
      : 0;

    const basePrice = parseFloat(service.price);
    const discountAmount = parseFloat(((basePrice * discountPercent) / 100).toFixed(2));
    const pricePaid = parseFloat((basePrice - discountAmount).toFixed(2));

    // Si se proporciona vet_id, verificar que existe y tiene rol veterinario
    if (vet_id) {
      const { data: vet } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', vet_id)
        .single();

      if (!vet || vet.role !== 'veterinario') {
        return res.status(400).json({ error: 'El vet_id proporcionado no corresponde a un veterinario.' });
      }
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        user_id: req.user.id,
        vet_id: vet_id || null,
        service_id,
        pet_id: pet_id || null,
        scheduled_at,
        base_price: basePrice,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        price_paid: pricePaid,
        notes: notes || null,
      })
      .select(`
        *,
        service:services(id, name, duration_minutes)
      `)
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({
      message: '✅ Cita agendada exitosamente.',
      appointment: data,
      discount_applied: discountPercent > 0,
    });
  } catch (err) {
    console.error('Error en createAppointment:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/appointments
 * Clientela: sus propias citas.
 * Veterinario: su agenda (citas donde vet_id = req.user.id).
 * Admin: todas las citas.
 */
const getAppointments = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { status, date } = req.query;

    let query = supabase
      .from('appointments')
      .select(`
        *,
        user:users!appointments_user_id_fkey(id, email, full_name),
        vet:users!appointments_vet_id_fkey(id, email, full_name),
        service:services(id, name, price, duration_minutes),
        pet:pets(id, name, species)
      `)
      .order('scheduled_at', { ascending: true });

    // Filtrar por rol
    if (role === 'clientela') {
      query = query.eq('user_id', userId);
    } else if (role === 'veterinario') {
      query = query.eq('vet_id', userId);
    }
    // Admin ve todas

    if (status) query = query.eq('status', status);
    if (date) {
      // Filtrar por día: scheduled_at entre inicio y fin del día
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query = query.gte('scheduled_at', startOfDay.toISOString()).lte('scheduled_at', endOfDay.toISOString());
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ appointments: data });
  } catch (err) {
    console.error('Error en getAppointments:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * PUT /api/appointments/:id/status
 * Veterinario, Admin: marcar cita como completada o cancelada.
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['scheduled', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `status inválido. Válidos: ${validStatuses.join(', ')}.` });
    }

    // Veterinario solo puede actualizar sus propias citas
    let query = supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (req.user.role === 'veterinario') {
      query = query.eq('vet_id', req.user.id);
    }

    const { data, error } = await query.select().single();

    if (error || !data) {
      return res.status(404).json({ error: 'Cita no encontrada o sin permiso para modificarla.' });
    }

    return res.status(200).json({ message: 'Estado de la cita actualizado.', appointment: data });
  } catch (err) {
    console.error('Error en updateAppointmentStatus:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { createAppointment, getAppointments, updateAppointmentStatus };
