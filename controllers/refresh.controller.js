const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} = require('../config/jwt');

const User = require('../models/User');

const refreshTokenController = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                ok: false,
                error: 'No hay refresh token'
            });
        }

        const decoded = verifyRefreshToken(refreshToken);

        if (!decoded) {
            return res.status(403).json({
                ok: false,
                error: 'Token inválido o expirado'
            });
        }

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                ok: false,
                error: 'Usuario no encontrado'
            });
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // 🔥 actualizar cookies
        res.cookie('token', newAccessToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });

        return res.json({
            ok: true,
            message: 'Token renovado'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            error: 'Error del servidor'
        });
    }
};


module.exports = { refreshTokenController };