# Instrucciones para Activar el Sistema de Notificaciones

## 1. Crear la tabla de notificaciones en la base de datos

Ejecuta el siguiente script SQL en tu base de datos MySQL:

```bash
mysql -u root -p paperease < backend/notificaciones_schema.sql
```

O si prefieres, copia y pega el contenido del archivo `backend/notificaciones_schema.sql` directamente en tu cliente MySQL (phpMyAdmin, MySQL Workbench, etc.).

## 2. Reiniciar el servidor

Después de crear la tabla, reinicia el servidor para que los cambios surtan efecto:

```bash
npm start
```

## 3. Funcionalidades implementadas

### Sistema de Notificaciones
- ✅ Los estudiantes reciben notificaciones en tiempo real cuando su solicitud es aprobada o rechazada
- ✅ Ícono de campana en la esquina superior derecha con badge que muestra el número de notificaciones no leídas
- ✅ Panel de notificaciones con lista completa
- ✅ Marcar notificaciones como leídas individualmente o todas a la vez
- ✅ Eliminar notificaciones
- ✅ Conexión en tiempo real vía Socket.IO

### Botón de Cerrar Sesión
- ✅ Botón "Cerrar Sesión" en la esquina superior derecha del navbar
- ✅ Finaliza la sesión y redirige al login

### Corrección de Formularios
- ✅ Los datos del usuario (nombre, apellido, cédula, género, facultad) se cargan automáticamente desde la sesión
- ✅ Los campos se llenan automáticamente y se mantienen durante la sesión
- ✅ Corrección del bug donde el nombre y apellido no se guardaban correctamente en el registro
- ✅ El formulario ahora vincula correctamente el IdEstudiante con las solicitudes

## 4. Endpoints API creados

### Notificaciones
- `GET /api/notificaciones/:idEstudiante` - Obtener todas las notificaciones de un estudiante
- `GET /api/notificaciones/:idEstudiante/conteo` - Obtener conteo de notificaciones no leídas
- `PUT /api/notificaciones/:id/leer` - Marcar una notificación como leída
- `PUT /api/notificaciones/estudiante/:idEstudiante/leer-todas` - Marcar todas como leídas
- `DELETE /api/notificaciones/:id` - Eliminar una notificación
- `DELETE /api/notificaciones/estudiante/:idEstudiante/eliminar-todas` - Eliminar todas

### Autenticación
- `GET /api/auth/me` - Obtener datos completos del usuario autenticado (incluyendo cédula)

## 5. Archivos modificados

### Backend
- `backend/index.js` - Configuración de Socket.IO
- `backend/notificaciones.js` - Rutas de notificaciones (NUEVO)
- `backend/gestion.js` - Integración de notificaciones en aprobación/rechazo
- `backend/auth.js` - Nuevo endpoint /me y mejoras en /verificar
- `backend/formulario.js` - Vinculación correcta del IdEstudiante
- `backend/notificaciones_schema.sql` - Script SQL para crear la tabla (NUEVO)

### Frontend
- `frontend/src/MenuPE.html` - Botón de cerrar sesión e ícono de notificaciones
- `frontend/src/Formulario.html` - Carga automática de datos del usuario
- `frontend/src/js/notificaciones.js` - Lógica del sistema de notificaciones (NUEVO)
- `frontend/src/js/registro.js` - Corrección del bug de idFacultad

## 6. Dependencias agregadas

```json
{
  "socket.io": "^4.x.x"
}
```

Ya instalada vía `npm install socket.io`.

## 7. Probar el sistema

1. Inicia sesión como estudiante
2. Crea una solicitud desde el formulario
3. Inicia sesión como trabajador social en otra pestaña
4. Aprueba o rechaza la solicitud
5. Vuelve a la cuenta del estudiante y verás la notificación en tiempo real

---

**Nota:** El sistema está completamente funcional. Solo necesitas ejecutar el script SQL para crear la tabla de notificaciones.
