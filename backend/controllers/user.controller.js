const supabase = require('../config/supabase');

/**
 * GET /api/users
 * Solo Admin: lista todos los usuarios con su rol.
 */
const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_adopter, phone, created_at')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ users: data });
  } catch (err) {
    console.error('Error en getAllUsers:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * PUT /api/users/:id/role
 * Solo Admin: asigna un nuevo rol a un usuario.
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['admin', 'clientela', 'veterinario', 'ventas'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ error: `Rol inválido. Roles válidos: ${validRoles.join(', ')}.` });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select('id, email, full_name, role')
      .single();

    if (error) return res.status(404).json({ error: 'Usuario no encontrado.' });

    return res.status(200).json({ message: 'Rol actualizado.', user: data });
  } catch (err) {
    console.error('Error en updateUserRole:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { getAllUsers, updateUserRole };
