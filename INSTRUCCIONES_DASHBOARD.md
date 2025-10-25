# 📋 Instrucciones para Configurar el Dashboard de Gestión

## 🔴 Problemas Identificados

### 1. MySQL/MariaDB NO está corriendo
**Por eso:**
- ✅ Los logs muestran "inserción exitosa"
- ❌ Pero NO se guarda realmente en la base de datos
- ❌ El dashboard no muestra solicitudes

### 2. Ruta del endpoint corregida
- **Antes:** `/api/formulario/solicitudes` ❌
- **Ahora:** `/api/solicitudes` ✅

---

## ✅ SOLUCIÓN PASO A PASO

### Paso 1: Iniciar MySQL/MariaDB

Elige según tu sistema operativo:

#### Windows (XAMPP)
1. Abre el panel de control de XAMPP
2. Haz clic en "Start" en la fila de MySQL
3. Espera a que aparezca el fondo verde

#### Linux
```bash
sudo service mysql start
# O si usas systemd:
sudo systemctl start mysql
```

#### macOS
```bash
# Si instalaste con Homebrew:
brew services start mysql
# O manualmente:
mysql.server start
```

#### Docker
```bash
docker-compose up -d mysql
# O si no tienes docker-compose:
docker run -d -p 3306:3306 --name mysql-paperease \
  -e MYSQL_ROOT_PASSWORD="" \
  -e MYSQL_DATABASE=paperease \
  -e MYSQL_ALLOW_EMPTY_PASSWORD=yes \
  mysql:8.0
```

### Paso 2: Verificar que MySQL está corriendo

Ejecuta el script de verificación:

```bash
node verificar-datos.js
```

**Resultado esperado:**
```
✅ Conexión exitosa a MySQL
✅ Base de datos "paperease" existe
✅ Tabla "formulario_estudiante" existe
📊 Total de solicitudes: X
```

**Si ves errores:**
- `ECONNREFUSED`: MySQL no está corriendo (repite Paso 1)
- `ER_ACCESS_DENIED_ERROR`: Credenciales incorrectas (ve al Paso 3)
- `ER_BAD_DB_ERROR`: Base de datos no existe (ve al Paso 4)

### Paso 3: Configurar Credenciales (si es necesario)

Edita el archivo `backend/conexion.js`:

```javascript
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',        // 👈 TU USUARIO
  password: '',        // 👈 TU CONTRASEÑA (vacío si no tiene)
  database: 'paperease',
  // ...
});
```

### Paso 4: Importar Base de Datos (si no existe)

Si la base de datos no existe, impórtala:

```bash
# Método 1: Desde la terminal
mysql -u root -p < tu_archivo_sql.sql

# Método 2: Con phpMyAdmin
# 1. Abre http://localhost/phpmyadmin
# 2. Crea una base de datos llamada "paperease"
# 3. Ve a la pestaña "Importar"
# 4. Selecciona tu archivo SQL y haz clic en "Continuar"
```

### Paso 5: Iniciar el Servidor Backend

```bash
node backend/index.js
```

**Resultado esperado:**
```
🚀 Servidor corriendo en http://localhost:3000
✅ Conexión exitosa a MySQL
```

**Si ves:**
```
❌ Error al conectar a MySQL: connect ECONNREFUSED
```
Regresa al Paso 1.

### Paso 6: Abrir el Dashboard

1. Con el servidor corriendo, abre tu navegador
2. Ve a: `http://localhost:3000/gestion.html`
3. Deberías ver las solicitudes cargadas automáticamente

---

## 🧪 PROBAR TODO EL FLUJO

### 1. Enviar una Solicitud

1. Abre: `http://localhost:3000/Formulario.html`
2. Completa el formulario con datos de prueba:
   - Nombre: Juan
   - Apellido: Pérez
   - Cédula: 8-1234-567
   - Género: Masculino
   - Facultad: Sistema
   - Tipo de Programa: Promoción Social
   - Programa: Canasta Navideña
3. Adjunta un archivo PDF (opcional)
4. Haz clic en "Enviar Solicitud"

**Resultado esperado:**
```
✅ ¡Solicitud registrada exitosamente!
📝 ID: FORM_1234567890_XXXXX
```

### 2. Verificar en la Base de Datos

**Opción A: Desde la terminal**
```bash
node verificar-datos.js
```

**Opción B: phpMyAdmin**
1. Abre: `http://localhost/phpmyadmin`
2. Selecciona la base de datos `paperease`
3. Haz clic en la tabla `formulario_estudiante`
4. Deberías ver tu solicitud

### 3. Ver en el Dashboard

1. Abre: `http://localhost:3000/gestion.html`
2. **Deberías ver la solicitud inmediatamente**
3. Haz clic en la solicitud para ver los detalles

---

## 🔍 VERIFICAR FUNCIONAMIENTO

### A. Consola del Backend (Terminal)

Cuando envíes un formulario, deberías ver:

```
🚀 === INICIO DE PROCESAMIENTO DEL FORMULARIO ===
✅ Formato de cédula válido
✅ IDs convertidos correctamente
✅ Cédula disponible
✅ género válido
✅ facultad válido
✅ tipo de programa válido
✅ programa válido
✅ Solicitud insertada exitosamente
🎉 === FIN DE PROCESAMIENTO EXITOSO ===
```

### B. Consola del Navegador (F12 > Consola)

Cuando abras `gestion.html`, deberías ver:

```
🚀 Iniciando Dashboard de Gestión...
📥 Cargando solicitudes desde el backend...
✅ 5 solicitudes cargadas
🎨 Renderizando 5 solicitudes
```

**Si ves errores:**
```
❌ Error al cargar solicitudes
```
- Verifica que MySQL esté corriendo
- Verifica que el backend esté corriendo
- Abre la pestaña "Network" en DevTools para ver la petición

---

## 🚀 FUNCIONALIDADES DEL DASHBOARD

### Búsqueda
- Escribe en el campo de búsqueda para filtrar por:
  - Nombre
  - Apellido
  - Cédula
  - Programa
  - Facultad

### Filtros
- Haz clic en el botón "Filtrar"
- Selecciona filtros de programa
- Haz clic en "Aplicar Filtros"

### Detalles
- Haz clic en cualquier solicitud de la lista
- Se mostrará el panel de detalles a la derecha con:
  - Información del estudiante
  - Programa solicitado
  - Documentos adjuntos (si los hay)
  - Botones de acción (preparados para futuras funciones)

### Vistas
- **Vista Pendientes**: Muestra solo solicitudes pendientes (todas por ahora)
- **Vista Todas**: Muestra todas las solicitudes

---

## ⚠️ PROBLEMAS COMUNES

### "No se encontraron solicitudes"

**Posibles causas:**
1. MySQL no está corriendo → Ejecuta `node verificar-datos.js`
2. La tabla está vacía → Envía una solicitud desde el formulario
3. Error en el endpoint → Revisa la consola del navegador

### "Error al cargar las solicitudes"

**Solución:**
1. Verifica que el backend esté corriendo
2. Verifica que MySQL esté corriendo
3. Abre DevTools (F12) > Network > Busca la petición a `/api/solicitudes`
4. Si ves status 500, revisa la consola del backend

### Solicitud se envía pero no aparece en el dashboard

**Solución:**
1. Ejecuta `node verificar-datos.js` para confirmar que se guardó
2. Si no se guardó: MySQL no estaba corriendo cuando enviaste el formulario
3. Si sí se guardó pero no aparece: Refresca el navegador (F5)

### Solicitud aparece en el backend pero no en phpMyAdmin

**Causa:** MySQL no está corriendo durante el envío del formulario

**Solución:**
1. Inicia MySQL (Paso 1)
2. Reinicia el backend
3. Envía el formulario de nuevo

---

## 📝 ARCHIVOS MODIFICADOS

### Archivos nuevos:
- ✅ `frontend/src/js/gestion.js` - Script del dashboard
- ✅ `verificar-datos.js` - Script de verificación

### Archivos modificados:
- ✅ `frontend/src/js/gestion.js` - Ruta corregida de `/api/formulario/solicitudes` a `/api/solicitudes`

### Endpoints disponibles:
- `POST /api/formulario` - Enviar solicitud
- `GET /api/solicitudes` - Obtener todas las solicitudes
- `GET /api/count` - Contar solicitudes
- `GET /api/config` - Obtener configuración (géneros, facultades, programas)

---

## 🎯 PRÓXIMOS PASOS (Opcional)

Si quieres agregar estados a las solicitudes (pendiente, aprobada, rechazada):

### 1. Modificar la tabla:
```sql
ALTER TABLE formulario_estudiante
ADD COLUMN Estado ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
ADD COLUMN Prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
ADD COLUMN FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

### 2. Crear endpoints para aprobar/rechazar:
- `PUT /api/solicitud/:id/aprobar`
- `PUT /api/solicitud/:id/rechazar`

### 3. Implementar generación de PDFs

---

## 💬 ¿Necesitas Ayuda?

Si sigues teniendo problemas:
1. Ejecuta `node verificar-datos.js` y copia el resultado
2. Revisa los logs del backend (terminal donde corre `node backend/index.js`)
3. Revisa la consola del navegador (F12 > Consola)
4. Comparte los mensajes de error para ayudarte mejor

---

**Última actualización:** 2025-10-25
**Versión:** 1.0
