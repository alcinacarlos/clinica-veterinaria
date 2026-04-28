const router = require('express').Router();
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/order.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// POST /api/orders — Clientela: crear orden (descuento adoptante automático)
router.post('/', authenticate, authorizeRoles(['clientela']), createOrder);

// GET /api/orders — Clientela: sus órdenes. Ventas/Admin: todas.
router.get('/', authenticate, authorizeRoles(['clientela', 'ventas', 'admin']), getOrders);

// PUT /api/orders/:id/status — Ventas, Admin: actualizar estado de envío
router.put('/:id/status', authenticate, authorizeRoles(['ventas', 'admin']), updateOrderStatus);

module.exports = router;
