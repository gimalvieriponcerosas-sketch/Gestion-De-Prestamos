 estructura-proyecto
Updated upstream
 HEAD
"# Gestion De Prestamos" 

# Gestion-De-Prestamos
 a795ea097d6d99a3a2165c5b5b7c77e35f2c16bd

# Sistema de Control de Prestamos de Equipos de Laboratorio

Backend REST desarrollado para el trabajo practico de SENATI. Permite registrar usuarios, autenticarse con JWT, administrar el inventario de equipos de laboratorio y controlar los prestamos y devoluciones de cada equipo.

La disponibilidad de un equipo se calcula a partir de la tabla `prestamos`: si un prestamo tiene `fecha_devolucion = NULL`, esta activo y el equipo no puede volver a prestarse.

## Tecnologias utilizadas

- Node.js
- Express
- MySQL 8
- Sequelize ORM
- Sequelize CLI (migraciones y seeders)
- JSON Web Token (JWT)
- bcryptjs
- dotenv
- cors
- nodemon (desarrollo)

## Estructura del proyecto

```text
Gestion-De-Prestamos/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── equipoController.js
│   └── prestamoController.js
├── middlewares/
│   └── authMiddleware.js
├── migrations/
│   ├── 20261101000001-create-usuarios.js
│   ├── 20261101000002-create-equipos.js
│   └── 20261101000003-create-prestamos.js
├── models/
│   ├── index.js
│   ├── Usuario.js
│   ├── Equipo.js
│   └── Prestamo.js
├── routes/
│   ├── authRoutes.js
│   ├── equipoRoutes.js
│   └── prestamoRoutes.js
├── seeders/
│   └── 20261101000001-datos-demo.js
├── .env.example
├── .gitignore
├── .sequelizerc
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

## Requisitos

- Node.js 18 o superior.
- npm.
- MySQL 8 en ejecucion (por ejemplo, mediante Laragon o XAMPP).
- Un cliente de MySQL o phpMyAdmin para crear la base de datos.
- Git, unicamente si se va a clonar el repositorio.

## Instalacion desde una copia limpia

1. Clonar el repositorio:

```bash
git clone https://github.com/gimalvieriponcerosas-sketch/Gestion-De-Prestamos.git
cd Gestion-De-Prestamos
```

2. Instalar las dependencias:

```bash
npm install
```

3. Crear la base de datos en MySQL:

```sql
CREATE DATABASE gestion_prestamos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Tambien se puede ejecutar desde la terminal:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS gestion_prestamos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

4. Copiar el archivo de variables de entorno.

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

En Linux/macOS:

```bash
cp .env.example .env
```

5. Editar `.env` con los datos reales de la instalacion local de MySQL. El archivo `.env` no se sube a GitHub.

6. Ejecutar las migraciones:

```bash
npm run db:migrate
```

7. Cargar los datos de demostracion:

```bash
npm run db:seed
```

8. Iniciar el servidor:

```bash
npm run dev
```

Para ejecutarlo sin nodemon:

```bash
npm start
```

El servidor queda disponible en `http://localhost:3000` (o en el puerto definido en `PORT`).

## Configuracion de MySQL

Las tablas se crean exclusivamente con las migraciones. El proyecto no usa `sequelize.sync()`.

Si se necesita reiniciar la base de datos desde cero, se pueden deshacer las migraciones y volver a ejecutarlas:

```bash
npm run db:migrate:undo
npm run db:migrate
```

Nota: `db:migrate:undo` deshace solamente la ultima migracion. Para eliminar todas las tablas se debe ejecutar una vez por cada migracion, en orden inverso.

Tambien es posible eliminar la base de datos, volver a crearla y ejecutar las migraciones de nuevo. Esto elimina todos los datos.

## Variables de entorno

Ejemplo de `.env.example`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gestion_prestamos
DB_USER=root
DB_PASSWORD=
JWT_SECRET=CAMBIAR_POR_UN_SECRETO_SEGURO
JWT_EXPIRES_IN=1d
PORT=3000
```

| Variable | Descripcion |
|---|---|
| `DB_HOST` | Host de MySQL. |
| `DB_PORT` | Puerto de MySQL. |
| `DB_NAME` | Nombre de la base de datos. |
| `DB_USER` | Usuario de MySQL. |
| `DB_PASSWORD` | Contrasena de MySQL. Puede quedar vacia en instalaciones locales. |
| `JWT_SECRET` | Clave privada usada para firmar los tokens. Debe cambiarse por un valor seguro. |
| `JWT_EXPIRES_IN` | Vigencia del token, por ejemplo `1d`, `12h` o `30m`. |
| `PORT` | Puerto del servidor Express. |

No se deben subir credenciales reales ni el archivo `.env` al repositorio.

## Migraciones

Las migraciones crean las tablas en el orden requerido por las claves foraneas:

1. `usuarios`.
2. `equipos`.
3. `prestamos`.

Comandos disponibles:

```bash
npm run db:migrate        # Ejecuta las migraciones pendientes
npm run db:migrate:undo   # Deshace la ultima migracion
```

Relaciones implementadas:

- Un usuario tiene muchos prestamos.
- Un equipo tiene muchos prestamos.
- Cada prestamo pertenece a un usuario y a un equipo.
- `equipo_id`: `ON DELETE RESTRICT`, `ON UPDATE CASCADE`.
- `usuario_id`: `ON DELETE CASCADE`, `ON UPDATE CASCADE`.

## Seeders

El seeder inserta los datos de demostracion y usa `findOrCreate`, por lo que puede ejecutarse nuevamente sin duplicar registros:

```bash
npm run db:seed
```

Datos creados:

Usuario:

- Nombre: Darwin Uzuriaga
- Correo: `darwin@senati.pe`
- Contrasena: `demo1234`
- La contrasena se guarda con hash bcrypt, nunca en texto plano.

Equipos:

- `EQ-001`: Multimetro Digital Fluke 117.
- `EQ-002`: Osciloscopio Digital Rigol.

## Autenticacion JWT

1. El usuario se registra con `POST /api/auth/registro`.
2. Inicia sesion con `POST /api/auth/login`.
3. El login devuelve un token JWT.
4. Las rutas de equipos y prestamos requieren el token en el encabezado:

```http
Authorization: Bearer <token>
```

5. El `usuario_id` de cada prestamo se obtiene del token, nunca del cuerpo de la peticion.

## Rutas de la API

### Autenticacion

| Metodo | Ruta | Descripcion | Token |
|---|---|---|---|
| POST | `/api/auth/registro` | Registra un usuario. | No |
| POST | `/api/auth/login` | Inicia sesion y devuelve un JWT. | No |

### Equipos

Todas estas rutas requieren JWT.

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/equipos` | Lista todos los equipos. |
| GET | `/api/equipos/:id` | Obtiene un equipo por id. |
| POST | `/api/equipos` | Crea un equipo. |
| PUT | `/api/equipos/:id` | Actualiza uno o mas campos del equipo. |
| DELETE | `/api/equipos/:id` | Elimina un equipo solo si no tiene historial de prestamos. |

### Prestamos

Todas estas rutas requieren JWT.

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/prestamos` | Lista prestamos. Admite filtros. |
| POST | `/api/prestamos` | Registra un prestamo. |
| PUT | `/api/prestamos/:id/devolucion` | Registra la devolucion del prestamo. |

Filtros de `GET /api/prestamos`:

- `/api/prestamos?activo=true`: prestamos activos (sin devolucion).
- `/api/prestamos?activo=false`: prestamos ya devueltos.
- `/api/prestamos?equipo_id=1`: prestamos de un equipo especifico.
- Los filtros se pueden combinar: `/api/prestamos?activo=true&equipo_id=1`.

## Ejemplos de uso

### Registrar un usuario

```http
POST /api/auth/registro
Content-Type: application/json
```

```json
{
  "nombre": "Darwin Uzuriaga",
  "correo": "darwin@senati.pe",
  "contrasena": "demo1234"
}
```

Respuesta `201`:

```json
{
  "mensaje": "Usuario registrado correctamente.",
  "datos": {
    "id": 1,
    "nombre": "Darwin Uzuriaga",
    "correo": "darwin@senati.pe",
    "createdAt": "2026-11-02T15:00:00.000Z",
    "updatedAt": "2026-11-02T15:00:00.000Z"
  }
}
```

La respuesta nunca incluye la contrasena ni su hash.

### Iniciar sesion

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "correo": "darwin@senati.pe",
  "contrasena": "demo1234"
}
```

Respuesta `200`:

```json
{
  "mensaje": "Inicio de sesion exitoso.",
  "datos": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "nombre": "Darwin Uzuriaga",
      "correo": "darwin@senati.pe",
      "createdAt": "2026-11-02T15:00:00.000Z",
      "updatedAt": "2026-11-02T15:00:00.000Z"
    }
  }
}
```

### Crear un equipo

```http
POST /api/equipos
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "codigo": "EQ-003",
  "nombre": "Fuente de alimentacion DC",
  "categoria": "Instrumentos de laboratorio",
  "condicion": "Bueno"
}
```

Respuesta `201`:

```json
{
  "mensaje": "Equipo registrado correctamente.",
  "datos": {
    "id": 3,
    "codigo": "EQ-003",
    "nombre": "Fuente de alimentacion DC",
    "categoria": "Instrumentos de laboratorio",
    "condicion": "Bueno",
    "createdAt": "2026-11-02T15:05:00.000Z",
    "updatedAt": "2026-11-02T15:05:00.000Z"
  }
}
```

### Actualizar un equipo

```http
PUT /api/equipos/3
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "condicion": "Regular"
}
```

### Registrar un prestamo

El `usuario_id` no se envia: se obtiene del token. `fecha_prestamo` tambien se registra automaticamente con la fecha y hora actuales.

```http
POST /api/prestamos
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "equipo_id": 1,
  "prestatario": "Juan Perez",
  "fecha_prevista": "2026-11-05T15:30:00"
}
```

Respuesta `201`:

```json
{
  "mensaje": "Prestamo registrado correctamente.",
  "datos": {
    "id": 1,
    "equipo_id": 1,
    "usuario_id": 1,
    "prestatario": "Juan Perez",
    "fecha_prestamo": "2026-11-02T15:10:00.000Z",
    "fecha_prevista": "2026-11-05T15:30:00.000Z",
    "fecha_devolucion": null,
    "createdAt": "2026-11-02T15:10:00.000Z",
    "updatedAt": "2026-11-02T15:10:00.000Z",
    "equipo": {
      "id": 1,
      "codigo": "EQ-001",
      "nombre": "Multimetro Digital Fluke 117",
      "categoria": "Instrumentos de medicion",
      "condicion": "Bueno"
    },
    "usuario": {
      "id": 1,
      "nombre": "Darwin Uzuriaga",
      "correo": "darwin@senati.pe"
    }
  }
}
```

Las fechas de los prestamos incluyen fecha y hora. `fecha_prevista` debe enviarse en formato ISO 8601, por ejemplo `2026-11-05T15:30:00`, y debe ser posterior a `fecha_prestamo`, que se registra automaticamente con la fecha y hora actuales. Sequelize devuelve las fechas como ISO 8601; el sufijo `Z` indica que el valor esta expresado en UTC.

Si el equipo ya tiene un prestamo activo, la respuesta es `409`:

```json
{
  "mensaje": "El equipo ya tiene un prestamo activo y no esta disponible."
}
```

La creacion se ejecuta dentro de una transaccion Sequelize con bloqueo `SELECT ... FOR UPDATE` sobre la fila del equipo. Esto evita que dos solicitudes simultaneas registren prestamos activos del mismo equipo.

### Listar prestamos activos de un equipo

```http
GET /api/prestamos?activo=true&equipo_id=1
Authorization: Bearer <token>
```

### Registrar una devolucion

```http
PUT /api/prestamos/1/devolucion
Authorization: Bearer <token>
```

Respuesta `200`:

```json
{
  "mensaje": "Devolucion registrada correctamente. El equipo esta disponible nuevamente.",
  "datos": {
    "id": 1,
    "equipo_id": 1,
    "usuario_id": 1,
    "prestatario": "Juan Perez",
    "fecha_prestamo": "2026-11-02T15:10:00.000Z",
    "fecha_prevista": "2026-11-05T15:30:00.000Z",
    "fecha_devolucion": "2026-11-05T18:00:00.000Z",
    "equipo": {
      "id": 1,
      "codigo": "EQ-001",
      "nombre": "Multimetro Digital Fluke 117",
      "categoria": "Instrumentos de medicion",
      "condicion": "Bueno"
    },
    "usuario": {
      "id": 1,
      "nombre": "Darwin Uzuriaga",
      "correo": "darwin@senati.pe"
    }
  }
}
```

Una vez registrada la devolucion, el equipo puede prestarse nuevamente. Si se intenta devolver dos veces el mismo prestamo, se responde `409`.

## Codigos HTTP utilizados

| Codigo | Significado |
|---|---|
| `200` | Operacion exitosa. |
| `201` | Registro creado correctamente. |
| `400` | Datos incorrectos, incompletos o con formato invalido. |
| `401` | Token ausente, invalido, expirado o credenciales incorrectas. |
| `404` | Recurso inexistente. |
| `409` | Conflicto: codigo o correo duplicado, equipo ocupado, equipo con historial o prestamo ya devuelto. |
| `500` | Error interno del servidor. |

Todas las respuestas son JSON. Los errores tienen la forma:

```json
{
  "mensaje": "Descripcion clara del error."
}
```

## Scripts disponibles

| Comando | Descripcion |
|---|---|
| `npm start` | Inicia el servidor con Node.js. |
| `npm run dev` | Inicia el servidor con nodemon. |
| `npm run db:migrate` | Ejecuta las migraciones pendientes. |
| `npm run db:migrate:undo` | Deshace la ultima migracion. |
| `npm run db:seed` | Ejecuta los seeders de datos de demostracion. |

## Notas academicas

- No se incluye frontend. La API se prueba con Postman, Thunder Client, Insomnia o `curl`.
- No se agregaron roles ni permisos: todo usuario autenticado puede administrar equipos y prestamos.
- Las contrasenas se almacenan unicamente como hash bcrypt.
- Las consultas se realizan mediante Sequelize, sin concatenar SQL con datos del usuario.
- No se usa `sequelize.sync()`; el esquema se controla con migraciones.
 Stashed changed
# Gestión-De-Prestamos
main
