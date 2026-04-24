const jwt = require('jsonwebtoken');

function isAuthenticated(req, res, next) {

  // 1. Verificar que exista sesión
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      error: 'No autenticado. Iniciá sesión.',
    });
  }

  // extrae el header del token , Busca el header
  const authHeader = req.headers['authorization'];


  if (!authHeader || !authHeader.startsWith('Bearer ')) { // verifica el header 
  // ( || es token obligatorio , && token opcional)
    return res.status(401).json({
      error: 'Token requerido.',
    });
  }

  const token = authHeader.split(' ')[1]; // lo separa Bearer TOKEN

  try { 
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // verifica el token

    //  Unifica usuario 
    req.user = {
      ...req.session.user, // sesion
      ...decoded,  // guardás datos del token
    };

    next();

  } catch (err) {

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
