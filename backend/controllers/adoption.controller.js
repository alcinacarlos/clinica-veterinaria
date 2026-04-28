const supabase = require('../config/supabase');

/**
 * POST /api/adoptions
 * Clientela: enviar solicitud de adopción.
 */
const createAdoption = async (req, res) => {
  try {
    const { pet_id, notes } = req.body;

    if (!pet_id) {
      return res.status(400).json({ error: 'pet_id es obligatorio.' });
    }

    // Verificar que la mascota existe y está disponible
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('id, status')
      .eq('id', pet_id)
      .single();

    if (petError || !pet) {
      return res.status(404).json({ error: 'Mascota no encontrada.' });
    }
    if (pet.status !== 'available') {
      return res.status(400).json({ error: 'Esta mascota no está disponible para adopción.' });
    }

    // Verificar que no existe ya una solicitud pendiente del mismo usuario para esta mascota
    const { data: existing } = await supabase
      .from('adoptions')
      .select('id, status')
      .eq('user_id', req.user.id)
      .eq('pet_id', pet_id)
      .in('status', ['pending', 'approved'])
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'Ya tienes una solicitud activa para esta mascota.' });
    }

    const { data, error } = await supabase
      .from('adoptions')
      .insert({ user_id: req.user.id, pet_id, notes: notes || null })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({ message: 'Solicitud de adopción enviada.', adoption: data });
  } catch (err) {
    console.error('Error en createAdoption:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/adoptions
 * Admin: lista todas las solicitudes con datos de usuario y mascota.
 */
const getAllAdoptions = async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('adoptions')
      .select(`
        *,
        user:users(id, email, full_name),
        pet:pets(id, name, species, breed)
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ adoptions: data });
  } catch (err) {
    console.error('Error en getAllAdoptions:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * PUT /api/adoptions/:id/status
 * Admin: aprobar o rechazar una solicitud de adopción.
 *
 * ⚡ LÓGICA CRÍTICA:
 * Si status === 'approved':
 *   1. Actualizar mascota a status = 'adopted'
 *   2. Actualizar usuario a is_adopter = true
 *   3. Rechazar automáticamente otras solicitudes pendientes para la misma mascota
 */
const updateAdoptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const validStatuses = ['approved', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `status debe ser 'approved' o 'rejected'.` });
    }

    // Obtener la solicitud actual
    const { data: adoption, error: fetchError } = await supabase
      .from('adoptions')
      .select('id, status, user_id, pet_id')
      .eq('id', id)
      .single();

    if (fetchError || !adoption) {
      return res.status(404).json({ error: 'Solicitud de adopción no encontrada.' });
    }
    if (adoption.status !== 'pending') {
      return res.status(400).json({ error: 'Esta solicitud ya fue procesada.' });
    }

    // Actualizar la solicitud
    const { data: updatedAdoption, error: updateError } = await supabase
      .from('adoptions')
      .update({ status, admin_notes: admin_notes || null })
      .eq('id', id)
      .select()
      .single();

    if (updateError) return res.status(500).json({ error: updateError.message });

    // ⚡ LÓGICA CRÍTICA: Si se APRUEBA la adopción
    if (status === 'approved') {
      // 1. Marcar mascota como adoptada
      await supabase
        .from('pets')
        .update({ status: 'adopted' })
        .eq('id', adoption.pet_id);

      // 2. El adoptante obtiene el flag is_adopter = true
      await supabase
        .from('users')
        .update({ is_adopter: true })
        .eq('id', adoption.user_id);

      // 3. Rechazar todas las demás solicitudes pendientes para esta mascota
      await supabase
        .from('adoptions')
        .update({ status: 'rejected', admin_notes: 'Mascota adoptada por otro solicitante.' })
        .eq('pet_id', adoption.pet_id)
        .eq('status', 'pending')
        .neq('id', id);

      return res.status(200).json({
        message: '✅ Adopción aprobada. Usuario marcado como adoptante y mascota actualizada.',
        adoption: updatedAdoption,
      });
    }

    return res.status(200).json({ message: 'Solicitud rechazada.', adoption: updatedAdoption });
  } catch (err) {
    console.error('Error en updateAdoptionStatus:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { createAdoption, getAllAdoptions, updateAdoptionStatus };
