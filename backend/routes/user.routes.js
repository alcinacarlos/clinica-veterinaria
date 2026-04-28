const router = require('express').Router();
const { getAllUsers, updateUserRole } = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// GET /api/users — Solo Admin: listar todos los usuarios
router.get('/', authenticate, authorizeRoles(['admin']), getAllUsers);

// PUT /api/users/:id/role — Solo Admin: asignar rol a un usuario
router.put('/:id/role', authenticate, authorizeRoles(['admin']), updateUserRole);

module.exports = router;
