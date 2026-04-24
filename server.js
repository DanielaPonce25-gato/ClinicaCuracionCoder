
require('dotenv').config();

const express = require('express');
const { connectDB } = require('./config/database');
const createSessionMiddleware = require('./config/session');
const authRoutes = require('./routes/auth.routes');
const protectedRoutes = require('./routes/protected.routes');

const app = express();

app.use(express.json());
app.use(createSessionMiddleware());


app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor funcionando correctamente.',
    sessionStore: process.env.SESSION_STORE || 'memory',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Session store: ${process.env.SESSION_STORE || 'memory'}`);
      console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo conectar a MongoDB:', err.message);
    process.exit(1);
  });
