
const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const { getDB } = require('../config/database');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function processGoogleLogin(req, res, credential, dni) {
    if (!credential || !dni) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload?.email) {
            return res.status(401).json({ error: 'Token inválido' });
        }

        const email = payload.email.toLowerCase().trim();

        const pacientesCollection = getDB().collection('pacientes');
        const paciente = await pacientesCollection.findOne({ email });

        if (!paciente) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        if (String(paciente.dni) !== String(dni)) {
            return res.status(403).json({ error: 'DNI incorrecto' });
        }

        req.session.user = {
            id: paciente._id.toString(),
            email: paciente.email,
            rol: 'paciente',
        };

        return req.session.save((err) => {
            if (err) {
                return res.status(500).json({ error: 'Error de sesión' });
            }

            return res.json({
                ok: true,
                user: {
                    email: paciente.email,
                    rol: 'paciente',
                },
                message: 'Login exitoso'
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: 'Login inválido' });
    }
}

router.post('/login-google', async (req, res) => {
    const { credential, dni } = req.body;
    return processGoogleLogin(req, res, credential, dni);
});

module.exports = router;
