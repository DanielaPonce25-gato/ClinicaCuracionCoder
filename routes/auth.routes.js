const { Router } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getDB } = require('../config/database');
const { allowedRoles } = require('../middlewares/roles');

const passport = require('../config/passport');
const User = require('../models/User');


const router = Router();

// El registro crea la cuenta del usuario en la base de datos, 

// POST /api/v1/auth/register
// localhost:3000/api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const {first_name,last_name,email, password, role } = req.body;

    if (!first_name || !last_name || !email || !password || !role) {
      return res.status(400).json({
        error: 'Faltan datos',
        recibido: req.body
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Rol no permitido.' });
    }

    const usersCollection = getDB().collection('users');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'El usuario ya existe.' });
    }
                         //bcrypt.hash(password, saltRounds) -> devuelve password hasheado
    const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

    const newUser = {
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: role,
    };

    const result = await usersCollection.insertOne(newUser);

    return res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      user: {
        id: result.insertedId,
        email: newUser.email,
        role: newUser.role,
      },
    });
    
  } catch (error) {
    console.error('Error en /register:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});


// POST /api/v1/auth/login
// localhost:3000/api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos.' });
    }

    const usersCollection = getDB().collection('users');

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    // compara correctamente la contraseña de entrada con el hash almacenado 
    // en la base de datos usando bcrypt.compare
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales invalidas.' });
    }

    // Crear token
    const token = jwt.sign(  // sign genera el token, recibe la informacion 
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // el tiempo de expiracion del token
    );

    // Guarda sesión
    req.session.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    return res.json({
      message: 'Login exitoso.',
      user: req.session.user,
      token, 
    });
    

  } catch (error) {
    console.error('Error en /login:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});


// POST /api/v1/auth/logout
// localhost:3000/api/v1/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al destruir la sesion:', err);
      return res.status(500).json({ error: 'Error al cerrar sesion.' });
    }

    res.clearCookie('connect.sid');
    res.clearCookie('token'); // Limpia el token del cliente
    
    return res.json({ message: 'Sesion cerrada exitosamente.' });
  });

});


module.exports = router;
