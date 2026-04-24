
const { MongoClient } = require('mongodb');

let db = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI no esta definida en el archivo .env');
  }

  const client = new MongoClient(uri);
  await client.connect();
  db = client.db();

  console.log(`Conectado a MongoDB - base de datos: ${db.databaseName}`);
  return db;
}

function getDB() {
  if (!db) {
    throw new Error('No hay conexion a MongoDB. Llama a connectDB() primero.');
  }
  return db;
}

module.exports = { connectDB, getDB };
