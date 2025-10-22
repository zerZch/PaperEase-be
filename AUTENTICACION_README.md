# Sistema de Autenticación - PaperEase

## 📋 Descripción

Sistema completo de autenticación para PaperEase con soporte para dos tipos de usuarios:
- **Estudiantes** (Rol 1)
- **Trabajadores Sociales** (Rol 2)

---

## 🗄️ Base de Datos

### Tablas Creadas

1. **roles** - Catálogo de roles
   - IdRol: 1 = Estudiante, 2 = Trabajador Social

2. **estudiante** - Usuarios estudiantes con autenticación
   - Campos: Email, Password (hash), Nombre, Apellido, Cedula, IdGenero, IdFacultad, FechaNacimiento, etc.

3. **trabajador_social** - Usuarios trabajadores sociales con autenticación
   - Campos: Email, Password (hash), Nombre, Apellido, Cedula, IdGenero, Departamento, Oficina, etc.

4. **sesiones** - Control de sesiones activas
   - Tokens de sesión con expiración de 24 horas

5. **auditoria_acceso** - Registro de acciones de seguridad
   - Login, logout, registros, intentos fallidos

---

## 🔧 Dependencias Instaladas

```bash
npm install bcrypt express-session
```

- **bcrypt**: Hash seguro de contraseñas (10 rounds)
- **express-session**: Gestión de sesiones en el servidor

---

## 🚀 Endpoints de la API

### Base URL: `http://localhost:3000/api/auth`

### 1. Registro de Usuario

```http
POST /api/auth/register
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@utp.ac.pa",
  "password": "Pass123!",
  "rol": 1,  // 1 = Estudiante, 2 = Trabajador Social
  "cedula": "8-999-9999",  // Opcional
  "idGenero": 1,  // Opcional
  "idFacultad": 4  // Opcional (solo para estudiantes)
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Estudiante registrado exitosamente",
  "usuario": {
    "id": 1,
    "email": "juan.perez@utp.ac.pa",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rol": 1,
    "tipoUsuario": "estudiante"
  }
}
```

### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan.perez@utp.ac.pa",
  "password": "Pass123!"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "token": "abc123def456...",
  "usuario": {
    "id": 1,
    "email": "juan.perez@utp.ac.pa",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rol": 1,
    "tipoUsuario": "estudiante"
  }
}
```

### 3. Logout

```http
POST /api/auth/logout
Authorization: Bearer {token}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

### 4. Verificar Sesión

```http
GET /api/auth/verificar
Authorization: Bearer {token}
```

**Respuesta exitosa (200):**
```json
{
  "autenticado": true,
  "usuario": {
    "id": 1,
    "email": "juan.perez@utp.ac.pa",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rol": 1,
    "tipoUsuario": "estudiante"
  }
}
```

---

## 💻 Frontend

### Archivos Modificados/Creados

1. **frontend/src/js/registro.js** - Formulario de registro
   - Conecta con `/api/auth/register`
   - Valida campos
   - Redirige según rol

2. **frontend/src/js/login.js** - Formulario de login
   - Conecta con `/api/auth/login`
   - Guarda token en localStorage
   - Redirige según rol

3. **frontend/src/js/authHelper.js** - Helper de autenticación
   - Funciones reutilizables para verificar autenticación
   - Control de acceso por rol

### Uso del AuthHelper

Agregar en páginas que requieren autenticación:

```html
<script src="js/authHelper.js"></script>
<script>
  // Verificar autenticación al cargar la página
  requireAuth();  // Redirige a login si no está autenticado

  // O verificar rol específico
  requireEstudiante();  // Solo estudiantes
  requireTrabajadorSocial();  // Solo trabajadores sociales
</script>
```

### Funciones Disponibles

```javascript
// Verificar si está autenticado
if (isAuthenticated()) {
  console.log('Usuario autenticado');
}

// Obtener usuario actual
const user = getCurrentUser();
console.log(user.nombre);

// Verificar rol
if (isEstudiante()) {
  console.log('Es estudiante');
}

if (isTrabajadorSocial()) {
  console.log('Es trabajador social');
}

// Cerrar sesión
logout();

// Hacer petición autenticada
authenticatedFetch('http://localhost:3000/api/algun-endpoint', {
  method: 'GET'
})
.then(response => response.json())
.then(data => console.log(data));
```

---

## 🔐 Seguridad Implementada

### Backend

1. **Hash de contraseñas** con bcrypt (10 rounds)
2. **Validación de datos** de entrada
3. **Protección contra SQL Injection** (prepared statements)
4. **Tokens de sesión** únicos y aleatorios
5. **Expiración de sesiones** (24 horas)
6. **Auditoría completa** de accesos y acciones
7. **Control de acceso** por rol (middleware)

### Frontend

1. **Validación de formularios** antes de enviar
2. **Almacenamiento seguro** de tokens en localStorage
3. **Verificación automática** de sesión expirada
4. **Redirección automática** según rol

---

## 🧪 Pruebas

### 1. Probar Registro

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "apellido": "Usuario",
    "email": "test@utp.ac.pa",
    "password": "Test123!",
    "rol": 1
  }'
```

### 2. Probar Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@utp.ac.pa",
    "password": "Test123!"
  }'
```

### 3. Probar Verificación (reemplazar TOKEN)

```bash
curl -X GET http://localhost:3000/api/auth/verificar \
  -H "Authorization: Bearer TOKEN_AQUI"
```

---

## 🎯 Flujo de Autenticación

### Registro

1. Usuario accede a `http://localhost:3000` → `Registro.html`
2. Completa formulario y selecciona rol
3. Frontend envía datos a `/api/auth/register`
4. Backend:
   - Valida datos
   - Verifica que email no exista
   - Hashea contraseña con bcrypt
   - Inserta en tabla `estudiante` o `trabajador_social`
   - Registra en auditoría
5. Frontend recibe respuesta y redirige:
   - Rol 1 → `MenuPE.html`
   - Rol 2 → `gestion.html`

### Login

1. Usuario accede a `LogIn.html`
2. Ingresa email y contraseña
3. Frontend envía a `/api/auth/login`
4. Backend:
   - Busca usuario en ambas tablas
   - Verifica contraseña con bcrypt.compare()
   - Genera token de sesión
   - Guarda sesión en BD
   - Actualiza último acceso
   - Registra en auditoría
5. Frontend recibe token y redirige según rol

### Verificación de Sesión

1. Página protegida carga `authHelper.js`
2. Llama a `requireAuth()` o `requireEstudiante()`/`requireTrabajadorSocial()`
3. Verifica token en localStorage
4. Opcionalmente verifica con servidor (`verificarSesion()`)
5. Si no es válido, redirige a login

---

## 📁 Estructura de Archivos

```
PaperEase-be/
├── backend/
│   ├── auth.js                    ← Rutas de autenticación
│   ├── conexion.js               ← Conexión a MySQL
│   ├── index.js                  ← Servidor principal (actualizado)
│   └── middleware/
│       └── authMiddleware.js     ← Middleware de autenticación
├── frontend/
│   └── src/
│       ├── LogIn.html
│       ├── Registro.html
│       └── js/
│           ├── login.js          ← Login (actualizado)
│           ├── registro.js       ← Registro (actualizado)
│           └── authHelper.js     ← Helper de autenticación
└── package.json                  ← Dependencias actualizadas
```

---

## ⚠️ Notas Importantes

### Producción

Antes de llevar a producción:

1. **Cambiar el secret de sesión** en `backend/index.js`
2. **Habilitar HTTPS** y cambiar `cookie.secure` a `true`
3. **Configurar CORS** para dominios específicos
4. **Variables de entorno** para credenciales de BD
5. **Aumentar rounds de bcrypt** a 12 si es posible

### Roles

- **Rol 1 = Estudiante**: Fijo, NO cambiar
- **Rol 2 = Trabajador Social**: Fijo, NO cambiar

El código depende de estos valores específicos.

### Tokens

- Los tokens de sesión expiran en **24 horas**
- Se almacenan en tabla `sesiones` en BD
- Se envían en header `Authorization: Bearer {token}`

### LocalStorage

Se guarda:
- `authToken`: Token de sesión
- `currentUser`: Objeto JSON con datos del usuario
- `isLoggedIn`: 'true' o no existe
- `userRole`: 'estudiante' o 'trabajadora'

---

## 🐛 Troubleshooting

### Error: "Email ya está registrado"

El email ya existe en la BD. Usar otro email o recuperar contraseña.

### Error: "Credenciales inválidas"

Email o contraseña incorrectos. Verificar datos.

### Error: "Sesión inválida o expirada"

El token expiró. Hacer login nuevamente.

### Error al conectar con BD

Verificar que:
1. MySQL esté corriendo
2. Base de datos `paperease` exista
3. Credenciales en `backend/conexion.js` sean correctas
4. Tablas estén creadas (ejecutar scripts SQL)

---

## 📞 Soporte

Para problemas o preguntas:
1. Verificar logs del servidor (consola)
2. Revisar tabla `auditoria_acceso` en la BD
3. Verificar que las tablas SQL estén creadas

---

**Desarrollado para PaperEase - Sistema de Bienestar Estudiantil UTP**
