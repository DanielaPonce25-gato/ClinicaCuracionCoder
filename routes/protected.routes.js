const { Router } = require('express');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const { hasRole } = require('../middlewares/role.middleware');

const {
  getPlataforma,
  getPacientes,
  createPaciente,
  updatePaciente,
  deletePaciente
} = require('../controllers/platform.controller');

const router = Router();

// plataforma admin
router.get('/plataforma',
  isAuthenticated,
  hasRole(['admin']),
  getPlataforma
);

// listar pacientes
router.get('/pacientes',
  isAuthenticated,
  hasRole(['admin', 'doctor', 'enfermero']),
  getPacientes
);

// crear paciente
router.post('/admin/pacientes',
  isAuthenticated,
  hasRole(['admin']),
  createPaciente
);

// actualizar paciente
router.put('/admin/pacientes/:id',
  isAuthenticated,
  hasRole(['admin']),
  updatePaciente
);

// eliminar paciente
router.delete('/admin/pacientes/:id',
  isAuthenticated,
  hasRole(['admin']),
  deletePaciente
);


module.exports = router;
