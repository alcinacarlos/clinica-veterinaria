require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// ─── Importar rutas ──────────────────────────────────────────
const authRoutes          = require('./routes/auth.routes');
const userRoutes          = require('./routes/user.routes');
const petRoutes           = require('./routes/pet.routes');
const adoptionRoutes      = require('./routes/adoption.routes');
const productRoutes       = require('./routes/product.routes');
const orderRoutes         = require('./routes/order.routes');
const serviceRoutes       = require('./routes/service.routes');
const appointmentRoutes   = require('./routes/appointment.routes');
const medicalRecordRoutes = require('./routes/medicalRecord.routes');

const app = express();

// ─── Middlewares globales ────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ─── Health check ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Clínica Veterinaria API',
    timestamp: new Date().toISOString(),
  });
});

// ─── Rutas de la API ─────────────────────────────────────────
app.use('/api/auth',            authRoutes);
app.use('/api/users',           userRoutes);
app.use('/api/pets',            petRoutes);
app.use('/api/adoptions',       adoptionRoutes);
app.use('/api/products',        productRoutes);
app.use('/api/orders',          orderRoutes);
app.use('/api/services',        serviceRoutes);
app.use('/api/appointments',    appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);

// ─── Manejador de rutas no encontradas ──────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.originalUrl} no encontrada.` });
});

// ─── Manejador global de errores ─────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

// ─── Arranque del servidor ───────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🐾 Clínica Veterinaria API corriendo en http://localhost:${PORT}`);
  console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Descuento adoptante: ${process.env.ADOPTER_DISCOUNT_PERCENT || 15}%`);
});

module.exports = app;