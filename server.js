
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const { connectDB } = require('./config/database');
const createSessionMiddleware = require('./config/session');

//extrategia de header para verificar el token en cada peticion
const passport = require('./config/passport'); 

const authRoutes = require('./routes/auth.routes');
const googleLoginRoutes = require('./routes/loginGooglePaciente.routes');

const passportRoutes = require('./routes/passport.routes');
const protectedRoutes = require('./routes/protected.routes');
const medicalFollowUpRoutes = require('./routes/doctor/medical-follow-up.routes');



const app = express();


app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));


app.use(express.json());
app.use(cookieParser());
app.use(createSessionMiddleware());

app.use(express.static(path.join(__dirname, 'public')));


app.use(passport.initialize());
app.use(passport.session());


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Mongoose conectado'))
  .catch(err => console.log('❌ Error Mongoose:', err.message));


app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor funcionando correctamente.',
    sessionStore: process.env.SESSION_STORE || 'memory',
  });
});

app.use('/api/v1/auth', authRoutes);  
app.use('/api/v1/auth', googleLoginRoutes);
app.use('/api/v1', protectedRoutes);
app.use('/api/v1/passport', passportRoutes);
app.use('/api/v1', medicalFollowUpRoutes);


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
