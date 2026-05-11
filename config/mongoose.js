const mongoose = require('mongoose');

async function connectDB() {
    try {

        await mongoose.connect(process.env.MONGODB_URI);

        console.log('✅ Conectado con Mongoose');

    } catch (error) {

        console.error('❌ Error conectando con MongoDB:', error);

        process.exit(1);  // Finaliza la aplicación cuando no puede conectarse a la base de datos.
        
        //  evita levantar el servidor en un estado inválido.
    }
}

module.exports = connectDB;