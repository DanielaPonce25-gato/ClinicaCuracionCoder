## Descripcion

Este proyecto es una API REST desarrollada con Node.js y Express que permite administrar pacientes dentro de una plataforma médica. El sistema incluye autenticación mediante JWT y sesiones, además de un control de acceso basado en roles (admin, doctor y enfermero).

Los usuarios pueden registrarse, iniciar sesión y acceder a diferentes funcionalidades según su rol. El administrador tiene permisos completos (crear, editar y eliminar pacientes), mientras que doctor y enfermero pueden consultar información basica de los pacientes con acceso limitado.

Además, el proyecto utiliza MongoDB como base de datos y bcrypt para el cifrado de contraseñas, asegurando una gestión segura de los datos.

## Objetivo

El objetivo principal es garantizar una gestión segura de los datos, aplicando buenas prácticas como el uso de contraseñas encriptadas (bcrypt), validación de tokens y protección de rutas. y manejo de información sensible.

## Autenticación y Seguridad

El sistema implementa:

JWT para validación de usuarios
Sesiones para mantener el login
bcrypt para el cifrado de contraseñas
Middleware de autenticación y autorización

## Roles de Usuario

admin: acceso total (crear, editar, eliminar y ver pacientes)
doctor: acceso a listado de pacientes con información limitada
enfermero: acceso a listado de pacientes con información limitada

## Funcionalidades

Registro de usuarios
Inicio de sesión con generación de token
Cierre de sesión
Panel de administración (solo admin)
Listado de pacientes según su rol
Creación de pacientes (admin)
Edición de pacientes (admin)
Eliminación de pacientes (admin)

## Estructura del proyecto
```
ClinicaCuracionCoder/
├── config/
│   ├── database.js          # Conexion a MongoDB
│   └── session.js           # Configuracion de express-session y stores
├── middlewares/
│   ├── auth.middleware.js    # Middleware isAuthenticated
│   └── role.middleware.js    # Middleware hasRole (autorizacion por rol)
    └── role.middleware.js    # Middleware Role (roles permitidos)
├── routes/
│   ├── auth.routes.js       # Registro, login y logout
│   └── protected.routes.js  # Rutas protegidas (/pacientes, /admin/pacientes)
├── .env.example             # Plantilla de variables de entorno
├── .gitignore
├── package.json
├── ClinicaCuracionCoder.postman_collection.json  # Coleccion de Postman lista para importar 
├── server.js                # Punto de entrada de la aplicacion
└── README.md
```

## Endpoints

| Metodo| Ruta | Descripcion | Proteccion |
|---|---|---|---|
| GET | `/` | Healthcheck del servidor | Ninguna |
| POST | `/api/auth/register` | Registrar un usuario nuevo | Ninguna |
| POST | `/api/auth/login` | Iniciar sesion | Genera token del usuario |
| POST | `/api/auth/logout` | Cerrar sesion | Destruye token |
| GET | `/api/pacientes` | Listar pacientes | Requiere sesion | Requiere token|
| GET | `/api/admin` | Panel de administracion | Requiere sesion + token y rol `admin` |
| POST   | `/api/admin/pacientes`     | Crear paciente             | Solo `admin`                          |
| PUT    | `/api/admin/pacientes/:id` | Modificar paciente         | Solo `admin`                          |
| DELETE | `/api/admin/pacientes/:id` | Eliminar paciente          | Solo `admin`                          |


### Ejemplos de request body

**Registro de usuario**

POST /api/auth/register

```json
{
  "username": "juan",
  "password": "123456",
  "role": "doctor"
}
```
**Roles permitidos**
admin
enfermero
doctor


**Login:**
```json
POST /api/auth/login
{
  "username": "juan",
  "password": "123456"
}
```

## Probar con Postman

1. Abrir Postman
2. Ir a **File > Import** e importar el archivo `ClinicaCuracionCoder.postman_collection.json`
3. Ejecutar los requests en este orden:
   - **Register** - Crear un usuario
   - **Login** - Iniciar sesion (esto genera la cookie de sesion)
   - **Lista de Pacientes** - Acceder a ruta protegida (funciona por que enviaste el token y tenes sesion )
   - **Plataforma Admin** - Probar acceso de admin (va a fallar si el usuario no tiene rol `admin`)
   - **Admin crea Paciente** - Probar acceso de admin (va a fallar si el usuario no tiene rol `admin`)
   - **Admin actualiza Paciente** - Probar acceso de admin (va a fallar si el usuario no tiene rol `admin`)
   - **Admin elimina Paciente** - Probar acceso de admin (va a fallar si el usuario no tiene rol `admin`)
   - **Logout** - Cerrar sesion y destruye token
   - **Pacientes** - Intentar de nuevo (va a fallar porque ya no hay sesion y no hay token)

> **Tip:** Postman maneja las cookies automaticamente. Despues del login, la cookie `connect.sid` se envia en cada request.

## Tipos de Session Store

El proyecto soporta 3 formas de almacenar las sesiones. Se configura con la variable `SESSION_STORE` en el `.env`:

| Store | Variable | Descripcion | Uso recomendado |
|---|---|---|---|
| **Memory** | `SESSION_STORE=memory` | Se guarda en la RAM del servidor | Solo desarrollo. Se pierden al reiniciar |
| **File** | `SESSION_STORE=file` | Se guarda en archivos JSON en `./sessions/` | Desarrollo. Persisten al reiniciar |
| **MongoDB** | `SESSION_STORE=mongo` | Se guarda en MongoDB (coleccion `sessions`) | Produccion. Persisten y escalan |

## Troubleshooting

| Problema | Solucion |
|---|---|
| `MONGODB_URI no esta definida` | Asegurate de tener el archivo `.env` con la variable `MONGODB_URI` |
| `No se pudo conectar a MongoDB` | Verifica que tu IP este habilitada en Atlas y que usuario/password sean correctos |
| `Cannot find module 'xxx'` | Ejecuta `npm install` para instalar las dependencias |
| Las rutas protegidas devuelven 401 | Tenes que hacer login primero. Si usas Postman, verifica que las cookies esten habilitadas |
| El servidor no reinicia con los cambios | Usa `npm run dev` en vez de `npm start` |

## Tecnologias utilizadas

- [Express](https://expressjs.com/) - Framework web para Node.js
- [express-session](https://www.npmjs.com/package/express-session) - Manejo de sesiones
- [bcrypt](https://www.npmjs.com/package/bcrypt) - Hashing de contraseñas
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - Autenticación basada en tokens (JWT)
- [connect-mongo](https://www.npmjs.com/package/connect-mongo) - Almacenamiento de sesiones en MongoDB
- [session-file-store](https://www.npmjs.com/package/session-file-store) - Almacenamiento de sesiones en archivos
- [dotenv](https://www.npmjs.com/package/dotenv) - Manejo de variables de entorno
