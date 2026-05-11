const jwt = require('jsonwebtoken');
const User = require('../models/User'); 


function getToken(req) {

  // extrae el token de la cookie, si existe
  const cookieToken = req.cookies?.token;

  // extrae el header del token , Busca el header
  const authHeader = req.headers['authorization'];
  const headerToken =
    
  authHeader && authHeader.startsWith('Bearer ') // verifica el header , && token opcional
  ? authHeader.split(' ')[1] // lo separa Bearer TOKEN
  : null;

  return cookieToken || headerToken; // da prioridad al token de la cookie, si no existe, usa el del header
}



async function isAuthenticated(req, res, next) {

  const token = getToken(req); // obtiene el token de la cookie o del header
  
  if (!token) { // verifica si hay token
    return res.status(401).json({
      error: 'Token requerido. No autorizado.',
    });

  }
  
  try { 
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // verifica el token

    if (!decoded?.userId) return res.status(401).json({ error: 'Token inválido' });

    // verifica que el usuario exista en la base de datos 
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: 'Usuario no válido o eliminado.',
      });
    }

    // abjunta la informacion del usuario desde el token 
    // al objeto req para que esté disponible en las rutas protegidas

    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };


    next();

  } catch (error) {

    // destruir sesión si el token expiró
    req.session.destroy(() => {});
  
    return res.status(403).json({
      error: 'Token inválido o expirado.',
    });
  }
}

// autenticacion 
// (verifica si el usuario está logueado antes de permitir el acceso a rutas protegidas.)

module.exports = { isAuthenticated };

// Este método no es vulnerable a CSRF, pero el token suele estar accesible desde JS → mayor exposición a XSS