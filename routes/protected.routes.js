const { Router } = require('express');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const { hasRole } = require('../middlewares/role.middleware');
const { getDB } = require('../config/database');

const router = Router();

// GET - (Panel de administracion)
// localhost:3000/api/plataforma
// Solo requiere autenticación del rol admin
router.get('/plataforma', isAuthenticated, hasRole(['admin']), (req, res) => {
  
  const user = req.user; // req.user viene de passport, contiene info del usuario autenticado 

  // Opciones disponibles para admin
  const options = [
    'Ver lista de pacientes, GET',
    'Crear nuevo paciente, POST',
    'Modificar paciente, PUT',
    'Eliminar paciente, DELETE'
  ];

  return res.json({
    message: `Bienvenido a la plataforma, tu correo es ${user.email}. Tu rol es: ${user.role}`,
    user: {
      email: user.email,
      role: user.role
    },
    options: options
  });
});

// get - Lista de pacientes
// localhost:3000/api/pacientes
router.get('/pacientes',
  isAuthenticated,
  hasRole(['admin', 'doctor', 'enfermero']),
  async (req, res) => {
    try {

      const pacientesCollection = getDB().collection('pacientes');
      const pacientes = await pacientesCollection.find({}).toArray();

      const user = req.user;

      const pacientesFiltrados = pacientes.map(p => {

        if (user.role  === 'admin') {
          return { id: p._id.toString(), ...p }; // ve todo
        }

        // doctor/enfermero → solo datos básicos
        return {
          id: p._id.toString(),
          nombre: p.nombre,
          apellido: p.apellido,
          edad: p.edad,
          motivo: p.motivo,
          cuarto: p.cuarto
        };
      });

      return res.json({
        message: `perfil  ${user.email}, acá están los pacientes.`,
        pacientes: pacientesFiltrados
      });
    } catch (error) {
      console.error('Error al obtener pacientes:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// POST - crear paciente
// localhost:3000/api/v1/admin/pacientes
router.post('/admin/pacientes',
  isAuthenticated,
  hasRole(['admin']),
  async (req, res) => {
    try {
      const {
        nombre, apellido, edad, motivo, cuarto,
        dni, tel, telacargo, sexo, gmail, direccion
      } = req.body;
      
      // Validación
      if (!nombre || !apellido || !edad || !motivo || !cuarto || !dni 
        || !tel || !telacargo || !sexo || !gmail || !direccion) {
          
        return res.status(400).json({ error: 'Faltan datos requeridos.' });
      }

      const pacientesCollection = getDB().collection('pacientes');
      const nuevoPaciente = {
        nombre,
        apellido,
        edad,
        motivo,
        cuarto,
        dni,
        tel,
        telacargo,
        sexo,
        gmail,
        direccion
      };

      const result = await pacientesCollection.insertOne(nuevoPaciente);
      nuevoPaciente.id = result.insertedId.toString(); // or keep as ObjectId

      return res.status(201).json({
        message: 'Paciente creado exitosamente.',
        paciente: nuevoPaciente,
      });
    } catch (error) {
      console.error('Error al crear paciente:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// PUT - Modificar paciente
// localhost:3000/api/v1/admin/pacientes/:id

const { ObjectId } = require('mongodb');

router.put('/admin/pacientes/:id', isAuthenticated, hasRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, edad, motivo, cuarto , tel , telacargo , direccion } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const updateFields = {};
    if (nombre) updateFields.nombre = nombre;
    if (apellido) updateFields.apellido = apellido;
    if (edad) updateFields.edad = edad;
    if (motivo) updateFields.motivo = motivo;
    if (cuarto) updateFields.cuarto = cuarto;
    if (tel) updateFields.tel = tel;
    if (telacargo) updateFields.telacargo = telacargo;
    if (direccion) updateFields.direccion = direccion;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No hay datos para actualizar' });
    }

    const pacientesCollection = getDB().collection('pacientes');

    const result = await pacientesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado.' });
    }

    return res.json({
      message: 'Paciente actualizado exitosamente.',
      modified: result.modifiedCount
    });


  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});


// DELETE - Eliminar paciente
// localhost:3000/api/v1/admin/pacientes/:id
router.delete('/admin/pacientes/:id', isAuthenticated, hasRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const pacientesCollection = getDB().collection('pacientes');

    const result = await pacientesCollection.deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado.' });
    }

    return res.json({
      message: 'Paciente eliminado exitosamente.',
    });
    
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
