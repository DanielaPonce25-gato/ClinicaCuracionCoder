const express = require('express');
const router = express.Router();

const { isAuthenticated } = require('../../middlewares/auth.middleware');
const { hasRole } = require('../../middlewares/role.middleware');


const {
    createSeguimiento,
    updateSeguimiento,
    getSeguimientoPaciente,
    getHistorialPaciente
} = require('../../controllers/doctor.controller');


// crear seguimiento
router.post(
    '/doctor/seguimiento/:pacienteId',
    isAuthenticated,
    hasRole(['doctor']),
    createSeguimiento
);

// actualizar seguimiento
router.put(
    '/doctor/seguimiento/:id',
    isAuthenticated,
    hasRole(['doctor']),
    updateSeguimiento
);

// ver seguimientos por paciente
router.get(
    '/doctor/seguimiento/:pacienteId',
    isAuthenticated,
    hasRole(['doctor', 'admin', 'enfermero']),
    getSeguimientoPaciente
);

// historial paciente (login paciente)
router.get(
    '/seguimiento',
    getHistorialPaciente
);

module.exports = router;
