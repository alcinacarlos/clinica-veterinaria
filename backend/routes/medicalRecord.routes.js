const router = require('express').Router();
const { getMedicalRecords, createMedicalRecord } = require('../controllers/medicalRecord.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// GET /api/medical-records/:petId — Veterinario o clientela dueña de la mascota
router.get('/:petId', authenticate, authorizeRoles(['veterinario', 'clientela']), getMedicalRecords);

// POST /api/medical-records — Solo Veterinario: añadir registro médico
router.post('/', authenticate, authorizeRoles(['veterinario']), createMedicalRecord);

module.exports = router;
