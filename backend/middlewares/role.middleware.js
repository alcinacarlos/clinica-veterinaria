/**
 * Middleware de autorización basado en roles (RBAC).
 *
 * Uso: router.get('/ruta', authenticate, authorizeRoles(['admin', 'ventas']), controller)
 *
 * @param {string[]} allowedRoles - Array de roles permitidos para acceder a la ruta.
 * @returns {Function} Middleware de Express.
 */
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}.`,
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
