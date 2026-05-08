const jwt = require('jsonwebtoken');

function isAuthenticated(req, res, next) {

  // extrae el header del token , Busca el header
  const authHeader = req.headers['authorization'];


  if (!authHeader || !authHeader.startsWith('Bearer ')) { // verifica el header 
  // ( || es token obligatorio , && token opcional)
    return res.status(401).json({
      error: 'Token requerido. No autorizado.',
    });
  }

  const token = authHeader.split(' ')[1]; // lo separa Bearer TOKEN

  try { 
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // verifica el token

    req.user = decoded;  // guardás datos del token

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