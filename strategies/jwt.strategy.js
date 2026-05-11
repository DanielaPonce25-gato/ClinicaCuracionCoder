
const passport = require('passport');

const { ExtractJwt, Strategy: JwtStrategy } = require('passport-jwt');


// configuración de la estrategia JWT para Passport
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

// verificar el token JWT para proteger las rutas que requieren autenticación
passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
        try {

            if (!jwt_payload) {
                return done(null, false, {
                    message: 'Token no proporcionado'
                });
            }

            return done(null, jwt_payload);

        } catch (error) {
            return done(error, false);
        }
    })
);

