# PaperEase - Sistema de Bienestar Estudiantil UTP

Sistema completo de autenticación y gestión para el Bienestar Estudiantil de la Universidad Tecnológica de Panamá.

---

## Tabla de Contenidos

- [Requisitos del Sistema](#requisitos-del-sistema)
- [Instalación de WAMP Server](#instalación-de-wamp-server)
- [Configuración de MySQL](#configuración-de-mysql)
- [Instalación del Proyecto](#instalación-del-proyecto)
- [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
- [Ejecución del Servidor](#ejecución-del-servidor)
- [Uso del Sistema](#uso-del-sistema)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Troubleshooting](#troubleshooting)
- [Colaboración en Equipo](#colaboración-en-equipo)

---

## Requisitos del Sistema

### Software Requerido

- **WAMP Server** (Windows) / **MAMP** (Mac) / **LAMP** (Linux)
  - Incluye Apache, MySQL/MariaDB y PHP
  - Versión recomendada: WAMP 3.2.0 o superior
- **Node.js** versión 14.0 o superior
  - Incluye npm (Node Package Manager)
  - Descargar desde: https://nodejs.org/
- **Git** para control de versiones
  - Descargar desde: https://git-scm.com/
- **Navegador Web** moderno (Chrome, Firefox, Edge)

### Especificaciones Mínimas

- Sistema Operativo: Windows 10/11, macOS 10.15+, o Linux
- RAM: 4 GB mínimo (8 GB recomendado)
- Espacio en Disco: 500 MB para el proyecto + 2 GB para WAMP
- Procesador: Dual Core 2.0 GHz o superior

---

## Instalación de WAMP Server

### Windows (WAMP)

1. **Descargar WAMP Server**
   - Visita: https://www.wampserver.com/en/
   - Descarga la versión de 64 bits (recomendado)
   - Ejecuta el instalador `.exe`

2. **Instalación**
   - Acepta los términos y condiciones
   - Ruta de instalación recomendada: `C:\wamp64`
   - Selecciona tu navegador predeterminado
   - Selecciona tu editor de texto predeterminado
   - Completa la instalación

3. **Verificar Instalación**
   - Abre WAMP desde el menú Inicio
   - El icono de WAMP aparecerá en la bandeja del sistema
   - Espera a que el icono se ponga **verde** (indica que todos los servicios están corriendo)
   - Si está **amarillo**: Algunos servicios no están corriendo
   - Si está **rojo**: Los servicios están detenidos

4. **Configurar Puertos (si es necesario)**
   - Puerto MySQL por defecto: `3306`
   - Puerto Apache por defecto: `80`
   - Si hay conflictos de puerto, click derecho en icono WAMP → Tools → Port used

### macOS (MAMP)

1. **Descargar MAMP**
   - Visita: https://www.mamp.info/en/downloads/
   - Descarga la versión gratuita
   - Arrastra MAMP a la carpeta Aplicaciones

2. **Iniciar MAMP**
   - Abre MAMP desde Aplicaciones
   - Click en "Start Servers"
   - Verifica que Apache y MySQL estén en verde

### Linux (Ubuntu/Debian)

```bash
# Actualizar repositorios
sudo apt update

# Instalar Apache
sudo apt install apache2

# Instalar MySQL
sudo apt install mysql-server

# Instalar PHP
sudo apt install php libapache2-mod-php php-mysql

# Iniciar servicios
sudo systemctl start apache2
sudo systemctl start mysql
```

---

## Configuración de MySQL

### 1. Acceder a phpMyAdmin

#### En WAMP (Windows)
- Click izquierdo en el icono de WAMP en la bandeja
- Selecciona "phpMyAdmin"
- O abre tu navegador y visita: `http://localhost/phpmyadmin`

#### En MAMP (Mac)
- Abre tu navegador
- Visita: `http://localhost:8888/phpMyAdmin/`

#### En Linux
```bash
# Instalar phpMyAdmin
sudo apt install phpmyadmin

# Acceder desde navegador
http://localhost/phpmyadmin
```

### 2. Credenciales por Defecto

**WAMP/LAMP:**
- Usuario: `root`
- Contraseña: `` (vacío - dejar en blanco)

**MAMP:**
- Usuario: `root`
- Contraseña: `root`

### 3. Crear la Base de Datos

1. En phpMyAdmin, haz click en "Nueva" en el panel izquierdo
2. Nombre de la base de datos: `paperease`
3. Cotejamiento: `utf8mb4_general_ci`
4. Click en "Crear"

---

## Instalación del Proyecto

### 1. Clonar el Repositorio

```bash
# Navega a tu carpeta de proyectos
cd C:\Users\TuUsuario\Documents  # Windows
# o
cd ~/Documents  # Mac/Linux

# Clona el repositorio
git clone https://github.com/tuusuario/PaperEase-be.git

# Entra al directorio del proyecto
cd PaperEase-be
```

### 2. Instalar Dependencias de Node.js

```bash
# Asegúrate de estar en la raíz del proyecto
npm install
```

Esto instalará las siguientes dependencias:
- `express` (v5.1.0) - Framework web
- `mysql2` (v3.11.5) - Driver de MySQL
- `cors` (v2.8.5) - Middleware CORS
- `bcrypt` (v5.1.1) - Hash de contraseñas
- `express-session` (v1.18.1) - Gestión de sesiones

### 3. Verificar Instalación

```bash
# Verificar que node_modules se creó
ls node_modules  # Mac/Linux
dir node_modules  # Windows

# Deberías ver carpetas como: express, mysql2, bcrypt, cors, etc.
```

---

## Configuración de la Base de Datos

### Opción A: Importar desde Archivo SQL (Recomendado)

Si tienes un archivo `.sql` con toda la estructura:

1. Abre phpMyAdmin
2. Selecciona la base de datos `paperease` en el panel izquierdo
3. Ve a la pestaña "Importar"
4. Click en "Seleccionar archivo"
5. Selecciona tu archivo `.sql`
6. Click en "Continuar"

### Opción B: Crear Tablas Manualmente

1. Abre phpMyAdmin
2. Selecciona la base de datos `paperease`
3. Ve a la pestaña "SQL"
4. Ejecuta los siguientes scripts en orden:

#### Tabla: roles

```sql
CREATE TABLE roles (
  IdRol INT PRIMARY KEY,
  Rol VARCHAR(50) NOT NULL
);

INSERT INTO roles (IdRol, Rol) VALUES
(1, 'estudiante'),
(2, 'trabajadora');
```

#### Tabla: genero

```sql
CREATE TABLE genero (
  IdGenero INT PRIMARY KEY AUTO_INCREMENT,
  Genero VARCHAR(50) NOT NULL
);

INSERT INTO genero (Genero) VALUES
('Masculino'),
('Femenino'),
('Otro'),
('Prefiero no decir');
```

#### Tabla: facultad

```sql
CREATE TABLE facultad (
  IdFacultad INT PRIMARY KEY AUTO_INCREMENT,
  Facultad VARCHAR(100) NOT NULL
);

INSERT INTO facultad (Facultad) VALUES
('Facultad de Ingeniería de Sistemas Computacionales'),
('Facultad de Ingeniería Civil'),
('Facultad de Ingeniería Eléctrica'),
('Facultad de Ingeniería Mecánica'),
('Facultad de Ingeniería Industrial');
```

#### Tabla: estudiante

```sql
CREATE TABLE estudiante (
  IdEstudiante INT PRIMARY KEY AUTO_INCREMENT,
  Email VARCHAR(100) NOT NULL UNIQUE,
  Password VARCHAR(255) NOT NULL,
  Nombre VARCHAR(100) NOT NULL,
  Apellido VARCHAR(100) NOT NULL,
  Cedula VARCHAR(20) UNIQUE,
  IdGenero INT,
  IdFacultad INT,
  FechaNacimiento DATE,
  Telefono VARCHAR(20),
  Direccion TEXT,
  FechaRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UltimoAcceso TIMESTAMP NULL,
  FOREIGN KEY (IdGenero) REFERENCES genero(IdGenero),
  FOREIGN KEY (IdFacultad) REFERENCES facultad(IdFacultad)
);
```

#### Tabla: trabajador_social

```sql
CREATE TABLE trabajador_social (
  IdTrabajador INT PRIMARY KEY AUTO_INCREMENT,
  Email VARCHAR(100) NOT NULL UNIQUE,
  Password VARCHAR(255) NOT NULL,
  Nombre VARCHAR(100) NOT NULL,
  Apellido VARCHAR(100) NOT NULL,
  Cedula VARCHAR(20) UNIQUE,
  IdGenero INT,
  Departamento VARCHAR(100),
  Oficina VARCHAR(50),
  Telefono VARCHAR(20),
  Extension VARCHAR(10),
  FechaRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UltimoAcceso TIMESTAMP NULL,
  FOREIGN KEY (IdGenero) REFERENCES genero(IdGenero)
);
```

#### Tabla: sesiones

```sql
CREATE TABLE sesiones (
  IdSesion INT PRIMARY KEY AUTO_INCREMENT,
  TokenSesion VARCHAR(255) NOT NULL UNIQUE,
  TipoUsuario ENUM('estudiante', 'trabajadora') NOT NULL,
  IdUsuario INT NOT NULL,
  FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FechaExpiracion TIMESTAMP NOT NULL,
  DireccionIP VARCHAR(45),
  UserAgent TEXT,
  INDEX idx_token (TokenSesion),
  INDEX idx_usuario (TipoUsuario, IdUsuario)
);
```

#### Tabla: auditoria_acceso

```sql
CREATE TABLE auditoria_acceso (
  IdAuditoria INT PRIMARY KEY AUTO_INCREMENT,
  TipoUsuario ENUM('estudiante', 'trabajadora'),
  IdUsuario INT,
  Email VARCHAR(100),
  Accion ENUM('login', 'logout', 'registro', 'intento_fallido') NOT NULL,
  Exitoso BOOLEAN DEFAULT TRUE,
  DireccionIP VARCHAR(45),
  UserAgent TEXT,
  FechaHora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_fecha (FechaHora),
  INDEX idx_usuario (TipoUsuario, IdUsuario)
);
```

### Verificar que las Tablas se Crearon

1. En phpMyAdmin, selecciona la base de datos `paperease`
2. Deberías ver las siguientes tablas:
   - auditoria_acceso
   - estudiante
   - facultad
   - genero
   - roles
   - sesiones
   - trabajador_social

---

## Configuración de Conexión a la Base de Datos

### Verificar Credenciales

Abre el archivo `backend/conexion.js` y verifica que las credenciales coincidan con tu configuración:

```javascript
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',           // ← Tu usuario de MySQL
  password: '',           // ← Tu contraseña de MySQL (vacío por defecto en WAMP)
  database: 'paperease',  // ← Nombre de la base de datos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

**Valores comunes:**
- **WAMP (Windows)**: `user: 'root'`, `password: ''` (vacío)
- **MAMP (Mac)**: `user: 'root'`, `password: 'root'`
- **LAMP (Linux)**: `user: 'root'`, `password: 'tu_contraseña'`

### Probar la Conexión

Antes de iniciar el servidor, prueba la conexión a MySQL:

```bash
node test-conexion.js
```

**Salida esperada:**

```
🔍 Probando conexión a MySQL...

✅ Conexión exitosa!
✅ Query de prueba funcionó

📋 Tablas en la base de datos paperease:
  ✓ auditoria_acceso
  ✓ estudiante
  ✓ facultad
  ✓ genero
  ✓ roles
  ✓ sesiones
  ✓ trabajador_social

📊 Estructura de tabla estudiante:
  - IdEstudiante (int)
  - Email (varchar(100))
  - Password (varchar(255))
  - Nombre (varchar(100))
  - Apellido (varchar(100))
  ...

✅ ¡Todo está bien! La base de datos está lista.
```

**Si hay errores**, consulta la sección [Troubleshooting](#troubleshooting).

---

## Ejecución del Servidor

### 1. Asegurarse de que MySQL esté Corriendo

**WAMP (Windows):**
- El icono de WAMP debe estar **verde**
- Si no, click derecho → Start All Services

**MAMP (Mac):**
- Click en "Start Servers" en MAMP

**Linux:**
```bash
sudo systemctl status mysql
# Si no está corriendo:
sudo systemctl start mysql
```

### 2. Iniciar el Servidor de Node.js

Desde la raíz del proyecto:

```bash
node backend/index.js
```

**Salida esperada:**

```
✅ Conexión exitosa a MySQL
🚀 Servidor corriendo en http://localhost:3000
```

### 3. Acceder a la Aplicación

Abre tu navegador y visita:

```
http://localhost:3000
```

Deberías ver la página de registro de PaperEase.

---

## Uso del Sistema

### Registro de Usuarios

1. **Accede a**: `http://localhost:3000`
2. Serás redirigido automáticamente a `Registro.html`
3. Completa el formulario:
   - Nombre
   - Apellido
   - Correo electrónico (formato: usuario@utp.ac.pa)
   - Contraseña (mínimo 6 caracteres)
   - Confirmar contraseña
4. Selecciona tu rol:
   - **Estudiante**: Acceso a programas y servicios
   - **Trabajadora Social**: Gestión de programas
5. Click en "Crear Cuenta"
6. Serás redirigido automáticamente:
   - Estudiantes → `MenuPE.html`
   - Trabajadoras Sociales → `gestion.html`

### Iniciar Sesión

1. **Accede a**: `http://localhost:3000/LogIn.html`
2. Ingresa:
   - Correo electrónico
   - Contraseña
3. Click en "Iniciar Sesión"
4. Serás redirigido según tu rol

### API Endpoints

El sistema expone los siguientes endpoints:

#### Registro
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@utp.ac.pa",
  "password": "Pass123!",
  "rol": 1
}
```

#### Login
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "juan.perez@utp.ac.pa",
  "password": "Pass123!"
}
```

#### Verificar Sesión
```http
GET http://localhost:3000/api/auth/verificar
Authorization: Bearer {token}
```

#### Logout
```http
POST http://localhost:3000/api/auth/logout
Authorization: Bearer {token}
```

---

## Estructura del Proyecto

```
PaperEase-be/
├── backend/
│   ├── index.js                      # Servidor principal
│   ├── conexion.js                   # Conexión a MySQL
│   ├── auth.js                       # Rutas de autenticación
│   └── middleware/
│       └── authMiddleware.js         # Middleware de autenticación
├── frontend/
│   └── src/
│       ├── LogIn.html                # Página de login
│       ├── Registro.html             # Página de registro
│       ├── MenuPE.html               # Menú para estudiantes
│       ├── gestion.html              # Panel para trabajadoras sociales
│       ├── css/
│       │   └── style.css             # Estilos centralizados
│       └── js/
│           ├── login.js              # Lógica de login
│           ├── registro.js           # Lógica de registro
│           └── authHelper.js         # Utilidades de autenticación
├── test-conexion.js                  # Script de prueba de conexión
├── package.json                      # Dependencias de Node.js
├── package-lock.json                 # Lockfile de dependencias
├── README.md                         # Este archivo
├── AUTENTICACION_README.md           # Documentación de autenticación
└── SOLUCION_MYSQL.md                 # Guía de troubleshooting MySQL
```

---

## Troubleshooting

### Error: `ECONNREFUSED 127.0.0.1:3306`

**Causa:** MySQL no está corriendo.

**Solución:**

**Windows (WAMP):**
1. Abre XAMPP/WAMP Control Panel
2. Click en "Start" junto a MySQL
3. Espera a que el icono se ponga verde

**Mac (MAMP):**
```bash
brew services start mysql
# o
mysql.server start
```

**Linux:**
```bash
sudo systemctl start mysql
sudo systemctl status mysql
```

### Error: `ER_BAD_DB_ERROR: Unknown database 'paperease'`

**Causa:** La base de datos no existe.

**Solución:**
1. Abre phpMyAdmin: `http://localhost/phpmyadmin`
2. Click en "Nueva" en el panel izquierdo
3. Nombre: `paperease`
4. Cotejamiento: `utf8mb4_general_ci`
5. Click "Crear"

### Error: `ER_ACCESS_DENIED_ERROR`

**Causa:** Usuario o contraseña incorrectos.

**Solución:**
1. Verifica las credenciales en `backend/conexion.js`
2. Para WAMP: `user: 'root'`, `password: ''`
3. Para MAMP: `user: 'root'`, `password: 'root'`

### Error: `ER_NO_SUCH_TABLE: Table 'paperease.estudiante' doesn't exist`

**Causa:** Las tablas no se han creado.

**Solución:**
1. Ejecuta los scripts SQL en phpMyAdmin (ver sección [Configuración de la Base de Datos](#configuración-de-la-base-de-datos))
2. Verifica que todas las tablas existen

### Error: `Cannot find module 'express-session'`

**Causa:** Dependencias no instaladas.

**Solución:**
```bash
npm install
```

### Error: `Port 3000 is already in use`

**Causa:** Otro proceso está usando el puerto 3000.

**Solución:**

**Opción 1: Cambiar el puerto**

Edita `backend/index.js`:
```javascript
const PORT = 3001; // Cambiar a otro puerto
```

**Opción 2: Liberar el puerto**

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -i :3000
kill -9 <PID>
```

### Error: "Usuario no se guarda en la base de datos"

**Solución:**
1. Verifica que MySQL esté corriendo (icono verde en WAMP)
2. Ejecuta `node test-conexion.js` para diagnosticar
3. Revisa los logs del servidor en la consola
4. Consulta `SOLUCION_MYSQL.md` para más detalles

### El formulario de registro siempre muestra error

**Causa:** Campos faltantes en el formulario.

**Solución:**
1. Verifica que `Registro.html` tenga campos separados para `nombre` y `apellido`
2. Verifica que `registro.js` esté capturando ambos valores
3. Revisa la consola del navegador (F12) para ver errores de JavaScript

### La sesión expira inmediatamente

**Causa:** Configuración incorrecta de cookies o sesiones.

**Solución:**
1. Verifica que `express-session` esté configurado en `backend/index.js`
2. Asegúrate de que el token se guarde correctamente en localStorage
3. Revisa la tabla `sesiones` en phpMyAdmin para ver si se crean registros

---

## Colaboración en Equipo

### Workflow de Git

#### 1. Antes de Empezar a Trabajar

```bash
# Actualiza tu rama local
git pull origin main

# Crea una nueva rama para tu feature
git checkout -b feature/nombre-de-tu-feature
```

#### 2. Mientras Trabajas

```bash
# Verifica cambios
git status

# Agrega archivos modificados
git add .

# Haz commit con mensaje descriptivo
git commit -m "Descripción clara de los cambios"
```

#### 3. Antes de Hacer Push

```bash
# Actualiza tu rama con los últimos cambios de main
git checkout main
git pull origin main
git checkout feature/nombre-de-tu-feature
git merge main

# Resuelve conflictos si los hay
```

#### 4. Push y Pull Request

```bash
# Sube tu rama
git push origin feature/nombre-de-tu-feature

# Crea un Pull Request en GitHub
# Espera la revisión del equipo antes de hacer merge
```

### Convenciones de Código

#### Nombres de Variables
- **JavaScript**: camelCase (`nombreCompleto`, `idEstudiante`)
- **SQL**: PascalCase para tablas (`Estudiante`, `TrabajadorSocial`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_INTENTOS`)

#### Nombres de Archivos
- **HTML**: PascalCase (`Registro.html`, `MenuPE.html`)
- **JavaScript**: camelCase (`registro.js`, `authHelper.js`)
- **CSS**: kebab-case (`style.css`, `login-form.css`)

#### Comentarios
```javascript
// Comentarios en español
// Explicar el "por qué", no el "qué"

/**
 * Función para validar email
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido
 */
function validateEmail(email) {
  // ...
}
```

### Comunicación

- **Slack/Discord**: Para discusiones diarias
- **GitHub Issues**: Para reportar bugs
- **GitHub Pull Requests**: Para revisión de código
- **Reuniones semanales**: Para sincronización del equipo

### Responsabilidades por Rol

- **Frontend**: `frontend/` - HTML, CSS, JavaScript del cliente
- **Backend**: `backend/` - API, rutas, lógica de negocio
- **Base de Datos**: Scripts SQL, estructura de tablas
- **Testing**: Pruebas de endpoints, validaciones

---

## Documentación Adicional

- **AUTENTICACION_README.md**: Documentación completa del sistema de autenticación
- **SOLUCION_MYSQL.md**: Guía de troubleshooting para problemas de MySQL
- **test-conexion.js**: Script para probar la conexión a la base de datos

---

## Seguridad

### Buenas Prácticas

1. **Nunca** subas credenciales a Git
2. Usa `.gitignore` para excluir archivos sensibles
3. Las contraseñas se hashean con bcrypt (10 rounds)
4. Los tokens de sesión expiran en 24 horas
5. Todas las acciones se registran en `auditoria_acceso`

### Antes de Producción

- [ ] Cambiar secret de sesión en `backend/index.js`
- [ ] Habilitar HTTPS
- [ ] Configurar CORS para dominios específicos
- [ ] Usar variables de entorno para credenciales
- [ ] Aumentar rounds de bcrypt a 12
- [ ] Configurar límite de intentos de login

---

## Soporte

Si tienes problemas:

1. Revisa la sección [Troubleshooting](#troubleshooting)
2. Consulta `SOLUCION_MYSQL.md` para problemas de base de datos
3. Revisa los logs del servidor en la consola
4. Verifica la tabla `auditoria_acceso` en phpMyAdmin
5. Contacta al equipo en Slack/Discord

---

## Licencia

Este proyecto es parte del curso de Desarrollo de Software de la UTP.

---

**Desarrollado por el Equipo de PaperEase - Universidad Tecnológica de Panamá**

Última actualización: Octubre 2025
