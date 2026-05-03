
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
        res.status(500).json({ error: 'Error en registro' });
    }
});


router.post('/passport-login',
    passport.authenticate('local', { session: false }),
    (req, res) => {

        const user = req.user;

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login exitoso',
            user,
            token
        });
    }
);



module.exports = router;