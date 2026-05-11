
const { Router } = require('express');
const router = Router();

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');


router.post('/passport-register', async (req, res) => {
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
        res.status(500).json({ error: 'Error interno. Error en registro passport' });
    }
});


router.post('/passport-login',
    passport.authenticate('local', { session: false }),
    (req, res) => {

        try {
            const user = req.user;

            const token = jwt.sign(
                {
                    userId: user._id,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { 
                    expiresIn: '1h', // tiempo de expiración del token
                }
            );

            res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
            });

            res.json({
                message: 'Login exitoso'
            });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno. Error en login passport' });
    }
});



module.exports = router;