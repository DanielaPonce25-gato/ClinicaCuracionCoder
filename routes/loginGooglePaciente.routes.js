
const express = require('express');
const router = express.Router();

const {
    loginGoogle
} = require('../controllers/google.controller');


router.post('/login-google', loginGoogle);


module.exports = router;
