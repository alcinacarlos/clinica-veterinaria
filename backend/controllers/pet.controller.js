const supabase = require('../config/supabase');

/**
 * GET /api/pets
 * Público: lista todas las mascotas disponibles.
 */
const getAllPets = async (req, res) => {
  try {
    const { status, species } = req.query;

    let query = supabase
      .from('pets')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (species) query = query.ilike('species', `%${species}%`);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ pets: data });
  } catch (err) {
    console.error('Error en getAllPets:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/pets/:id
 * Público: detalle de una mascota.
 */
const getPetById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Mascota no encontrada.' });

    return res.status(200).json({ pet: data });
  } catch (err) {
    console.error('Error en getPetById:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * POST /api/pets
 * Admin: crear una nueva mascota.
 */
const createPet = async (req, res) => {
  try {
    const { name, species, breed, age_years, description, image_url, status } = req.body;

    if (!name || !species) {
      return res.status(400).json({ error: 'name y species son obligatorios.' });
    }

    const { data, error } = await supabase
      .from('pets')
      .insert({ name, species, breed, age_years, description, image_url, status: status || 'available' })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({ message: 'Mascota creada.', pet: data });
  } catch (err) {
    console.error('Error en createPet:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * PUT /api/pets/:id
 * Admin: actualizar datos de una mascota.
 */
const updatePet = async (req, res) => {
  try {
    const { name, species, breed, age_years, description, image_url, status } = req.body;

    const { data, error } = await supabase
      .from('pets')
      .update({ name, species, breed, age_years, description, image_url, status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: 'Mascota no encontrada.' });

    return res.status(200).json({ message: 'Mascota actualizada.', pet: data });
  } catch (err) {
    console.error('Error en updatePet:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { getAllPets, getPetById, createPet, updatePet };
