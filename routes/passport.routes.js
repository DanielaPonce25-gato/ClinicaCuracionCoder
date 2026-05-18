
const { Router } = require('express');
const passport = require('../config/passport');


const {
    register,
    login
} = require('../controllers/passport.controller'); 

const router = Router();

router.post('/passport-register', register);

router.post(
    '/passport-login',
    passport.authenticate('local', { session: false }),  
    login
);



module.exports = router;