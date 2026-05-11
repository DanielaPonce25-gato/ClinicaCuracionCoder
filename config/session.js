const session = require('express-session');

function getStore() {
  const storeType = process.env.SESSION_STORE || 'memory';

  switch (storeType) {
    
    case 'file': {
      const FileStore = require('session-file-store')(session);  
      console.log('Usando session-file-store (archivos en disco)');
      return new FileStore({ path: './sessions', ttl: 3600 });
    }

    case 'mongo': {
      const MongoStore = require('connect-mongo');
      const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/ClinicaCuracionCoder';
      console.log('Usando connect-mongo (MongoDB)');

      const store = MongoStore.create({ mongoUrl, ttl: 3600 });

      store.on('error', (error) => {
        console.error('Error en el session store de MongoDB:', error.message);
      });

      return store;
    }

    case 'memory':
    default:
      console.log('Usando MemoryStore (RAM - solo para desarrollo)');
      return undefined;
  }
}

function createSessionMiddleware() {
  const store = getStore();

  const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'secreto_por_defecto',
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: 'Strict', // Protege contra ataques CSRF (Cross-Site Request Forgery)
      httpOnly: true,  // la cookie no es accesible desde JavaScript del navegador | Protege contra ataques XSS (scripts maliciosos)
      secure: process.env.NODE_ENV === 'production', // secure = solo con HTTPS
      maxAge: 3600000 // 1 hora // Tiempo de vida
    },
  };

  if (store) {
    sessionConfig.store = store;
  }

  return session(sessionConfig);
}

module.exports = createSessionMiddleware;
