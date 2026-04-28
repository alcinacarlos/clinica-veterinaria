const supabase = require('../config/supabase');

/**
 * GET /api/medical-records/:petId
 * Acceso:
 *   - Veterinario: acceso total al historial de cualquier mascota.
 *   - Clientela: solo puede ver el historial de mascotas que ha adoptado.
 */
const getMedicalRecords = async (req, res) => {
  try {
    const { petId } = req.params;
    const { role, id: userId } = req.user;

    // Si es clientela, verificar que la mascota fue adoptada por el usuario
    if (role === 'clientela') {
      const { data: adoption } = await supabase
        .from('adoptions')
        .select('id')
        .eq('user_id', userId)
        .eq('pet_id', petId)
        .eq('status', 'approved')
        .maybeSingle();

      if (!adoption) {
        return res.status(403).json({
          error: 'No tienes permiso para ver el historial de esta mascota.',
        });
      }
    }

    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        vet:users(id, email, full_name),
        appointment:appointments(id, scheduled_at, service:services(name))
      `)
      .eq('pet_id', petId)
      .order('recorded_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ pet_id: petId, medical_records: data });
  } catch (err) {
    console.error('Error en getMedicalRecords:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * POST /api/medical-records
 * Veterinario: añadir un registro médico tras una consulta.
 *
 * Body esperado:
 * {
 *   pet_id: UUID,
 *   appointment_id: UUID (opcional),
 *   diagnosis: string,
 *   treatment: string (opcional),
 *   notes: string (opcional)
 * }
 */
const createMedicalRecord = async (req, res) => {
  try {
    const { pet_id, appointment_id, diagnosis, treatment, notes } = req.body;

    if (!pet_id || !diagnosis) {
      return res.status(400).json({ error: 'pet_id y diagnosis son obligatorios.' });
    }

    // Verificar que la mascota existe
    const { data: pet } = await supabase
      .from('pets')
      .select('id, name')
      .eq('id', pet_id)
      .single();

    if (!pet) return res.status(404).json({ error: 'Mascota no encontrada.' });

    // Si se proporciona appointment_id, verificar que pertenece al veterinario
    if (appointment_id) {
      const { data: appointment } = await supabase
        .from('appointments')
        .select('id, vet_id')
        .eq('id', appointment_id)
        .single();

      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada.' });
      }
      if (appointment.vet_id !== req.user.id) {
        return res.status(403).json({ error: 'Esta cita no está asignada a tu usuario.' });
      }
    }

    const { data, error } = await supabase
      .from('medical_records')
      .insert({
        pet_id,
        vet_id: req.user.id,
        appointment_id: appointment_id || null,
        diagnosis,
        treatment: treatment || null,
        notes: notes || null,
      })
      .select(`
        *,
        vet:users(id, full_name),
        pet:pets(id, name)
      `)
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({ message: 'Registro médico añadido.', medical_record: data });
  } catch (err) {
    console.error('Error en createMedicalRecord:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { getMedicalRecords, createMedicalRecord };
