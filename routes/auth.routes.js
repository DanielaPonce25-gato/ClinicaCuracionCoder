const { Router } = require('express');

const {
    register,
    login,
    logout
} = require('../controllers/auth.controller');

const {
    refreshTokenController
} = require('../controllers/refresh.controller');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshTokenController);

module.exports = router;
