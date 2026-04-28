const router = require('express').Router();
const { getAllProducts, createProduct, updateProduct } = require('../controllers/product.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

// GET /api/products — Público: catálogo de productos
router.get('/', getAllProducts);

// POST /api/products — Ventas, Admin: crear producto
router.post('/', authenticate, authorizeRoles(['ventas', 'admin']), createProduct);

// PUT /api/products/:id — Ventas, Admin: actualizar producto
router.put('/:id', authenticate, authorizeRoles(['ventas', 'admin']), updateProduct);

module.exports = router;
