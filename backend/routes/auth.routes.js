const router = require('express').Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// POST /api/auth/register — Registro de nuevo usuario
router.post('/register', register);

// POST /api/auth/login — Login con email y password
router.post('/login', login);

// GET /api/auth/me — Obtener perfil del usuario autenticado
router.get('/me', authenticate, getMe);

module.exports = router;
