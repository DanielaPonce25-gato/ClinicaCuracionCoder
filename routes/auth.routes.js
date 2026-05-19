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

router.post('/refresh-token', (req, res) => {
  try {
    const refreshToken = req.body?.refreshToken;

    // 1. Validación fuerte
    if (!refreshToken || typeof refreshToken !== 'string') {
      return res.status(400).json({
        ok: false,
        error: 'Refresh token inválido'
      });
    }

    const token = refreshToken.trim();

    // 2. Verificación segura (SIN split)
    let decoded;

    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      console.log("JWT ERROR:", err.message);
      return res.status(403).json({
        ok: false,
        error: 'Token inválido o expirado'
      });
    }

    if (!decoded) {
      return res.status(403).json({
        ok: false,
        error: 'Token inválido o expirado'
      });
    }

    // 3. Usuario reconstruido desde token
    const user = {
      _id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    // 4. Nuevos tokens
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    return res.json({
      ok: true,
      accessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error("ERROR REFRESH:", error);

    return res.status(500).json({
      ok: false,
      error: 'Error del servidor'
    });
  }
});
module.exports = router;
