const router = require('express').Router();
const {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
} = require('../controllers/appointment.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// POST /api/appointments — Clientela: agendar cita (descuento adoptante automático)
router.post('/', authenticate, authorizeRoles(['clientela']), createAppointment);

// GET /api/appointments — Filtrado por rol (clientela/vet/admin)
router.get('/', authenticate, authorizeRoles(['clientela', 'veterinario', 'admin']), getAppointments);

// PUT /api/appointments/:id/status — Veterinario, Admin: actualizar estado de cita
router.put('/:id/status', authenticate, authorizeRoles(['veterinario', 'admin']), updateAppointmentStatus);

module.exports = router;
