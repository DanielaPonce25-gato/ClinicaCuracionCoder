
const User = require('../models/User');
const bcrypt = require('bcrypt');

const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} = require('../config/jwt');



async function register(req, res) {

    try {
        const { first_name, last_name, email, password, role } = req.body;

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            first_name,
            last_name,
            email,
            password: hashed,
            role
        });

        res.json(user);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            error: 'Error interno. Error en registro passport' 
        });
    }
};


function login(req, res) {

        try {
            const user = req.user;

            // ACCESS TOKEN
            const token = generateAccessToken(user);

            // REFRESH TOKEN
            const refreshToken = generateRefreshToken(user);


            // Crear token

            res.cookie('token', token, {
                httpOnly: true, // Solo accesible por HTTP, no JavaScript
                sameSite: 'strict', // protege contra CSRF
                secure: process.env.NODE_ENV === 'production', 
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true, // Solo accesible por HTTP, no JavaScript
                sameSite: 'strict', // protege contra CSRF
                secure: process.env.NODE_ENV === 'production', 
            });

            res.json({
                message: 'Login exitoso'
            });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            error: 'Error interno. Error en login passport' 
        });
    }
};


module.exports = {
    register,
    login
};