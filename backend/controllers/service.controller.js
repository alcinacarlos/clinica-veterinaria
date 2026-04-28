const supabase = require('../config/supabase');

/**
 * GET /api/services
 * Público: catálogo de servicios veterinarios activos.
 */
const getAllServices = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ services: data });
  } catch (err) {
    console.error('Error en getAllServices:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * POST /api/services
 * Admin: crear un nuevo servicio veterinario.
 */
const createService = async (req, res) => {
  try {
    const { name, description, price, duration_minutes } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'name y price son obligatorios.' });
    }

    const { data, error } = await supabase
      .from('services')
      .insert({ name, description, price, duration_minutes })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({ message: 'Servicio creado.', service: data });
  } catch (err) {
    console.error('Error en createService:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { getAllServices, createService };
