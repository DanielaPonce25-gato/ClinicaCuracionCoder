
const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const { getDB } = require('../config/database');

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;

if (!googleClientId) {
    throw new Error('GOOGLE_CLIENT_ID no está configurado en las variables de entorno');
}

const client = new OAuth2Client(googleClientId);

async function processGoogleLogin(req, res, credential, dni) {
    if (!credential || !dni) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: googleClientId,
        });

        const payload = ticket.getPayload();


        if (!payload?.email) {
            return res.status(401).json({ error: 'Token inválido' });
        }

        const gmail = payload.email.toLowerCase().trim();

        console.log("EMAIL GOOGLE:", gmail);

        const pacientesCollection = getDB().collection('pacientes');

        // ✔ búsqueda correcta en Mongo (campo gmail)
        const paciente = await pacientesCollection.findOne({
            gmail: { $regex: new RegExp(`^${escapeRegExp(gmail)}$`, "i") }
        });

        console.log("PACIENTE ENCONTRADO:", paciente);

        if (!paciente) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        if (String(paciente.dni).trim() !== String(dni).trim()) {
            return res.status(403).json({ error: 'DNI incorrecto' });
        }

        // sesión
        req.session.user = {
            id: paciente._id.toString(),
            gmail: paciente.gmail,
            dni: paciente.dni,
            rol: 'paciente'
        };

        const loginCollection = getDB().collection('PacientesLogins');

        await loginCollection.insertOne({
            userId: paciente._id,
            gmail: paciente.gmail,
            timestamp: new Date()
        });

        req.session.save((err) => {
            if (err) {
                return res.status(500).json({ error: 'Error de sesión' });
            }

            return res.json({
                ok: true,
                user: {
                    gmail: paciente.gmail,
                    rol: 'paciente',
                },
                message: 'Login exitoso'
            });
        });

    } catch (error) {
        console.error('Error en login Google:', error);

        return res.status(401).json({
            error: 'Login inválido',
            detail: error.message
        });
    }
}

router.post('/login-google', (req, res) => {
    const { credential, dni } = req.body;
    processGoogleLogin(req, res, credential, dni);
});

module.exports = router;
