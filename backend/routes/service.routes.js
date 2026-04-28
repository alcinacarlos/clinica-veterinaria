const router = require('express').Router();
const { getAllServices, createService } = require('../controllers/service.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// GET /api/services — Público: catálogo de servicios clínicos
router.get('/', getAllServices);

// POST /api/services — Admin: crear servicio
router.post('/', authenticate, authorizeRoles(['admin']), createService);

module.exports = router;
