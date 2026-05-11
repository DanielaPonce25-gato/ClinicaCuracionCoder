const express = require('express');
const { ObjectId } = require('mongodb'); // para validar los id de mongo
const { getDB } = require('../../config/database');

const { isAuthenticated } = require('../../middlewares/auth.middleware');
const { hasRole } = require('../../middlewares/role.middleware');

const router = express.Router();

// POST - Crear seguimiento médico para un paciente
// Endpoint: POST /api/v1/doctor/seguimiento/:pacienteId
router.post('/doctor/seguimiento/:pacienteId',
    isAuthenticated,
    hasRole(['doctor']),
    async (req, res) => {
    try {
        const { pacienteId } = req.params;
        const { diagnostico, tratamiento, notas, motivo, edad } = req.body;

        if (!ObjectId.isValid(pacienteId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        if (!diagnostico || !tratamiento) {
            return res.status(400).json({ error: 'Faltan datos médicos.' });
        }

        const pacientesCollection = getDB().collection('pacientes');
        const paciente = await pacientesCollection.findOne({
            _id: new ObjectId(pacienteId)
        });

        if (!paciente) {
            return res.status(404).json({ error: 'Paciente no encontrado.' });
        }

        const seguimientoCollection = getDB().collection('seguimientos');

        const nuevoSeguimiento = {
            pacienteId: new ObjectId(pacienteId),
            doctorId: new ObjectId(req.user.userId),
            diagnostico,
            tratamiento,
            motivo: motivo || paciente.motivo, 
            edad: edad || paciente.edad,       
            notas: notas || '',
            fecha: new Date()
        };

        const result = await seguimientoCollection.insertOne(nuevoSeguimiento);

      // sincronizar con paciente
        const pacienteUpdates = {};
        if (motivo) pacienteUpdates.motivo = motivo;
        if (edad) pacienteUpdates.edad = edad;

        if (Object.keys(pacienteUpdates).length > 0) {
            await pacientesCollection.updateOne(
                { _id: new ObjectId(pacienteId) },
                { $set: pacienteUpdates }
            );
        }

        return res.status(201).json({
            message: 'Seguimiento creado.',
            paciente: {
                nombre: paciente.nombre,
                dni: paciente.dni,
                tel: paciente.tel,
                motivo: motivo || paciente.motivo,
                edad: edad || paciente.edad
            },
            seguimiento: {
                ...nuevoSeguimiento,
                id: result.insertedId.toString()
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno.' });
    }
});

// PUT - Actualizar seguimiento médico
// Endpoint: PUT /api/v1/doctor/seguimiento/:id
router.put('/doctor/seguimiento/:id',
    isAuthenticated,
    hasRole(['doctor']),
    async (req, res) => {
    try {
        const { id } = req.params;
        const { diagnostico, tratamiento, notas, motivo, edad } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        
        const seguimientoCollection = getDB().collection('seguimientos');
        const pacienteCollection = getDB().collection('pacientes');

        const seguimiento = await seguimientoCollection.findOne({
            _id: new ObjectId(id),
            doctorId: new ObjectId(req.user.userId)
        });

        if (!seguimiento) {
            return res.status(404).json({
                error: 'Seguimiento no encontrado o no autorizado.'
            });
        }

        // sincronizar el seguimiento con el paciente

      // Actualización de seguimiento
        const updateFields = {};
        if (diagnostico) updateFields.diagnostico = diagnostico;
        if (tratamiento) updateFields.tratamiento = tratamiento;
        if (notas) updateFields.notas = notas;
        if (motivo) updateFields.motivo = motivo; 
        if (edad) updateFields.edad = edad;       

      //    Actualización de paciente
        const pacienteUpdates = {};
        if (motivo) pacienteUpdates.motivo = motivo;
        if (edad) pacienteUpdates.edad = edad;

        if (
            Object.keys(updateFields).length === 0 && 
            Object.keys(pacienteUpdates).length === 0
        ) {
            return res.status(400).json({ error: 'No hay datos para actualizar.' });
        }


        // sube datos al seguimiento
        if (Object.keys(updateFields).length > 0) {
            await seguimientoCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateFields }
            );
        }


        // sube datos al paciente
        if (Object.keys(pacienteUpdates).length > 0) {
            await pacienteCollection.updateOne(
                { _id: new ObjectId(seguimiento.pacienteId) },
                { $set: pacienteUpdates }
            );
        }

        return res.json({
            message: 'Seguimiento y paciente actualizados.',
            paciente: {
                motivo: motivo || seguimiento.motivo,
                edad: edad || seguimiento.edad
            },
            seguimiento: {
                ...seguimiento,
                ...updateFields,
                id: seguimiento._id.toString()
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno.' });
    }
});


// GET - Ver el seguimientos del paciente
// Endpoint: GET /api/v1/doctor/seguimiento/:pacienteId
router.get('/doctor/seguimiento/:pacienteId',
    isAuthenticated,
    hasRole(['doctor', 'admin', 'enfermero']),
    async (req, res) => {
    try {
        const { pacienteId } = req.params;

        if (!ObjectId.isValid(pacienteId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const seguimientoCollection = getDB().collection('seguimientos');

        const pacienteIdObject = new ObjectId(pacienteId);
        const seguimientos = await seguimientoCollection.find({
            $or: [
                { pacienteId: pacienteIdObject },
                { pacienteId: pacienteId }
            ]
        }).toArray();

        return res.json({ seguimientos });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error interno.' });
        }
});


// busca el historial de seguimientos del paciente con su dni
router.get('/seguimiento', async (req, res) => {

    try {

        // verifica que el usuario esté autenticado y tenga rol de paciente
        if (!req.session.user || req.session.user.rol !== 'paciente') { 
            return res.status(401).json({ error: 'No autenticado' });
        }
        
        // verifica que el paciente tenga un dni registrado
        if (!req.session.user.dni) {
            return res.status(400).json({ error: 'DNI no disponible' });
        }

    
        const db = getDB(); // obtiene la base de datos  

        const dni = String(req.session.user.dni).trim(); // convierte el dni a string y elimina espacios

        // obtiene el dni del paciente en la colección de pacientes
        const paciente = await db.collection('pacientes').findOne({ dni }); 

        if (!paciente) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        // obtiene el historial del paciente odenado por fecha descendente
        const seguimientos = await db.collection('seguimientos')
            .find({ pacienteId: paciente._id })  // Obtiene el id del paciente por el dni registrado en la sesión
            .sort({ fecha: -1 })
            .toArray();



        // obtiene los ids de los doctores que realizaron los seguimientos
        const doctorIds = [
            ...new Set(
                seguimientos
                    .map(s => s.doctorId) 
                    .filter(Boolean)  
                    .map(id => typeof id === 'string' ? new ObjectId(id) : id) 
            )
        ];

        // obtiene los datos del doctor basado por su id
        const doctors = doctorIds.length
            ? await db.collection('users') // busca en la colección de usuarios para obtener los datos 
                .find({ _id: { $in: doctorIds } }) 
                .toArray() 
            : [];

        const doctorsMap = Object.fromEntries( 
            doctors.map(doc => [doc._id.toString(), doc]) 
        );


        const historial = seguimientos.map(seg => {

            // mapa crado para acceder a los datos del doctor por su id
            const doctor = doctorsMap[seg.doctorId?.toString()] || {};  

            return {  // inyecta los datos almacenados en la base de datos
                id: seg._id,
                fecha: seg.fecha,
                diagnostico: seg.diagnostico || '',
                tratamiento: seg.tratamiento || '',
                notas: seg.notas || '',
                motivo: seg.motivo || '',

                doctor: { 
                    nombre: doctor.first_name || '',
                    apellido: doctor.last_name || '',
                    email: doctor.email || ''
                }
            };
        });


        return res.json({
            paciente: {
                nombre: paciente.nombre || paciente.first_name || '',
                apellido: paciente.apellido || paciente.last_name || '',
                dni: paciente.dni || '',
                edad: paciente.edad || '',
                gmail: paciente.gmail || paciente.email || ''
            },
            seguimientos: historial
        });

    } catch (error) {

        console.error('ERROR SEGUIMIENTO:', error);

        return res.status(500).json({
            error: 'Error servidor'
        });
    }
});


module.exports = router;