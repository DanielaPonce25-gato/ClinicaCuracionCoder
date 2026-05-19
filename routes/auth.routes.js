const { Router } = require('express');

const {
  register,
  login,
  logout
} = require('../controllers/auth.controller');

const router = Router();

router.post('/register', register);
router.post('/login', login);


const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} = require('../config/jwt');


// REFRESH TOKEN
//  localhost:3000/api/v1/auth/refresh-token
router.post('/refresh-token', async (req, res) => {  

  try {

    const { refreshToken } = req.body;  // envio el token vencido 

    if (!refreshToken) {  // esta el token?
      return res.status(401).json({
        error: 'Refresh token requerido'
      });
    }

    // Verifica el refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // user reconstruido desde el payload
    const user = {
      _id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    // Genera nuevamente tokens
    const newAccessToken = generateAccessToken(user);

    const newRefreshToken = generateRefreshToken(user);

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {

    console.error('Error refresh token:', error);

    return res.status(403).json({
      error: 'Refresh token inválido o expirado'
    });
  }
});


router.post('/logout', logout);


module.exports = router;
