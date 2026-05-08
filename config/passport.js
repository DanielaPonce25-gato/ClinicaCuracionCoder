const { ExtractJwt, Strategy: JwtStrategy } = require('passport-jwt');


const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};



// callback de autenticacion para verificar el email y password del usuario en la base de datos
passport.use(new LocalStrategy(
    { usernameField: 'email' },

    async (email, password, done) => { 
        
        try {
            const user = await User.findOne({ email });

            if (!user) return done(null, false); // si no se encuentra el usuario, se devuelve false

            // done : credencial 

            const match = await bcrypt.compare(password, user.password);

        if (!match) return done(null, false, { message: 'Contraseña incorrecta' });

            return done(null, user, { message: 'Login exitoso' }); 


        } catch (err) {
            console.error('No autorizado', err);
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

module.exports = passport;