const router = require('express').Router();
const { createAdoption, getAllAdoptions, updateAdoptionStatus } = require('../controllers/adoption.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// POST /api/adoptions — Clientela: solicitar adopción
router.post('/', authenticate, authorizeRoles(['clientela']), createAdoption);

// GET /api/adoptions — Admin: ver todas las solicitudes
router.get('/', authenticate, authorizeRoles(['admin']), getAllAdoptions);

// PUT /api/adoptions/:id/status — Admin: aprobar o rechazar (LÓGICA CRÍTICA)
router.put('/:id/status', authenticate, authorizeRoles(['admin']), updateAdoptionStatus);

module.exports = router;
