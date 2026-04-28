const router = require('express').Router();
const { getAllPets, getPetById, createPet, updatePet } = require('../controllers/pet.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// GET /api/pets — Público: listar mascotas
router.get('/', getAllPets);

// GET /api/pets/:id — Público: detalle de mascota
router.get('/:id', getPetById);

// POST /api/pets — Admin: crear mascota
router.post('/', authenticate, authorizeRoles(['admin']), createPet);

// PUT /api/pets/:id — Admin: actualizar mascota
router.put('/:id', authenticate, authorizeRoles(['admin']), updatePet);

module.exports = router;
