# 🎯 Guía Completa de Funcionalidades de Gestión

## 📋 TABLA DE CONTENIDOS

1. [Configuración Inicial](#configuración-inicial)
2. [Funcionalidades Implementadas](#funcionalidades-implementadas)
3. [Instrucciones de Uso](#instrucciones-de-uso)
4. [Pruebas](#pruebas)
5. [Solución de Problemas](#solución-de-problemas)

---

## 🚀 CONFIGURACIÓN INICIAL

### Paso 1: Aplicar Cambios a la Base de Datos

Las nuevas funcionalidades requieren campos adicionales en la tabla `formulario_estudiante`. Ejecuta este comando:

```bash
node aplicar-campos-gestion.js
```

**Resultado esperado:**
```
✅ Conexión exitosa
✅ Campos agregados exitosamente
📊 Total de solicitudes: X
```

**¿Qué hace este script?**
- Agrega campos: `Estado`, `Prioridad`, `FechaCreacion`, `FechaModificacion`, `NotasTrabajador`
- Actualiza solicitudes existentes con valores por defecto
- Verifica que todo funcione correctamente

**Alternativa manual:**
Si prefieres hacerlo manualmente, ejecuta:
```bash
mysql -u root -p paperease < agregar-campos-gestion.sql
```

### Paso 2: Instalar Dependencias

Si aún no lo has hecho:
```bash
npm install
```

Esto instalará PDFKit y otras dependencias necesarias.

### Paso 3: Iniciar el Servidor

```bash
node backend/index.js
```

**Debes ver:**
```
🚀 Servidor corriendo en http://localhost:3000
✅ Conexión exitosa a MySQL
```

---

## ✨ FUNCIONALIDADES IMPLEMENTADAS

### 1. ✅ Aprobar Solicitudes

**Cómo usar:**
1. Abre el dashboard: `http://localhost:3000/gestion.html`
2. Selecciona una solicitud pendiente
3. Haz clic en el botón verde **"Aprobar"**
4. (Opcional) Agrega notas del trabajador social
5. La solicitud cambia a estado "Aprobada"

**Características:**
- Solo disponible para solicitudes pendientes
- Permite agregar notas opcionales
- Actualiza automáticamente las estadísticas
- Badge visual cambia a verde
- Actualización en tiempo real

**Endpoint backend:**
```
PUT /api/gestion/solicitud/:id/aprobar
Body: { "notas": "Texto opcional" }
```

### 2. ❌ Rechazar Solicitudes

**Cómo usar:**
1. Selecciona una solicitud pendiente
2. Haz clic en el botón rojo **"Rechazar"**
3. (Opcional) Agrega motivo del rechazo
4. La solicitud cambia a estado "Rechazada"

**Características:**
- Solo disponible para solicitudes pendientes
- Permite agregar motivo del rechazo
- Badge visual cambia a rojo
- Se ocultan botones de acción para solicitudes ya procesadas

**Endpoint backend:**
```
PUT /api/gestion/solicitud/:id/rechazar
Body: { "notas": "Motivo del rechazo" }
```

### 3. 🔔 Gestión de Prioridad

**Niveles de prioridad:**
- 🔴 **Alta** - Para casos urgentes
- 🟡 **Media** - Prioridad normal (por defecto)
- 🟢 **Baja** - Casos no urgentes

**Cómo usar:**
1. Selecciona cualquier solicitud
2. En la sección "Prioridad" haz clic en uno de los tres botones:
   - **Alta** (rojo)
   - **Media** (amarillo)
   - **Baja** (verde)
3. La prioridad se actualiza inmediatamente

**Características:**
- Botón activo se resalta en azul
- Icono de prioridad alta aparece en la lista
- Se puede cambiar en cualquier momento
- Actualiza estadísticas de "Prioridad Alta"

**Endpoint backend:**
```
PUT /api/gestion/solicitud/:id/prioridad
Body: { "prioridad": "alta" | "media" | "baja" }
```

### 4. 📄 Generar y Descargar PDF

**Cómo usar:**
1. Selecciona cualquier solicitud
2. Haz clic en el botón **"Descargar PDF"**
3. El PDF se genera automáticamente y se descarga

**Contenido del PDF:**
- Header oficial de la UTP
- ID de solicitud
- Fecha de solicitud
- Estado y Prioridad
- Datos completos del estudiante
- Programa solicitado
- Documentos adjuntos
- Notas del trabajador social (si existen)
- Footer con fecha de generación

**Características:**
- Generación automática desde el backend
- Diseño profesional
- Formato Letter (8.5" x 11")
- Nombre del archivo: `solicitud-[ID].pdf`

**Endpoint backend:**
```
GET /api/gestion/solicitud/:id/pdf
```

### 5. 📊 Estadísticas en Tiempo Real

**Ubicación:** Parte superior del dashboard

**Estadísticas mostradas:**
- ⏳ **Pendientes** - Solicitudes en espera
- ✅ **Aprobadas** - Solicitudes aprobadas
- ❌ **Rechazadas** - Solicitudes rechazadas
- 🔴 **Prioridad Alta** - Solicitudes urgentes

**Actualización:**
- Se actualizan automáticamente al aprobar/rechazar
- Se actualizan al cambiar prioridad
- Reflejan el estado actual en tiempo real

### 6. 🔍 Filtros Avanzados

**Cómo usar:**
1. Haz clic en el botón **"Filtrar"**
2. Selecciona criterios:
   - **Estado:** Pendiente, Aprobada, Rechazada
   - **Prioridad:** Alta, Media, Baja
   - **Programa:** Nombre del programa
3. Haz clic en **"Aplicar Filtros"**

**Características:**
- Combina múltiples filtros
- Muestra contador de resultados
- Botón "Reiniciar" para limpiar filtros
- Toast notification con cantidad de resultados

### 7. 🔎 Búsqueda en Tiempo Real

**Cómo usar:**
1. Escribe en el campo de búsqueda (parte superior)
2. Los resultados se filtran automáticamente

**Busca por:**
- Nombre del estudiante
- Apellido
- Cédula
- Nombre del programa
- Facultad

**Características:**
- Búsqueda instantánea (sin necesidad de presionar Enter)
- Case-insensitive (mayúsculas/minúsculas no importan)
- Resalta coincidencias visualmente

### 8. 👁️ Vistas Personalizadas

**Botones de vista (parte superior de la lista):**

- ⏱️ **Pendientes** - Solo muestra solicitudes pendientes
- 📋 **Todas** - Muestra todas las solicitudes

**Uso:**
- Haz clic en el icono correspondiente
- La vista se actualiza inmediatamente
- El botón activo se resalta en azul

---

## 📖 INSTRUCCIONES DE USO

### Flujo Completo de Gestión de una Solicitud

#### 1. **Ver Solicitudes Nuevas**

```
Dashboard → Ver lista → Filtro "Pendientes"
```

- Las solicitudes nuevas aparecen con badge amarillo "Pendiente"
- Por defecto, la prioridad es "Media"

#### 2. **Revisar Detalles**

```
Click en solicitud → Panel derecho muestra detalles
```

**Información visible:**
- Datos personales del estudiante
- Programa solicitado
- Archivos adjuntos (si hay)
- Estado y prioridad actual

#### 3. **Evaluar Prioridad**

```
Sección "Prioridad" → Seleccionar: Alta | Media | Baja
```

**Criterios sugeridos:**
- **Alta:** Casos urgentes, problemas de salud críticos
- **Media:** Solicitudes normales
- **Baja:** Solicitudes no urgentes

#### 4. **Tomar Decisión**

```
Botón "Aprobar" o "Rechazar"
```

**Para aprobar:**
1. Click en **"Aprobar"**
2. Agregar notas (opcional): "Aprobado según criterios del programa"
3. Click OK
4. ✅ Solicitud aprobada

**Para rechazar:**
1. Click en **"Rechazar"**
2. Agregar motivo: "No cumple requisitos de ingreso familiar"
3. Click OK
4. ❌ Solicitud rechazada

#### 5. **Generar Documentación**

```
Botón "Descargar PDF" → PDF se descarga automáticamente
```

- Útil para archivo físico
- Incluye toda la información y decisión tomada

---

## 🧪 PRUEBAS

### Prueba 1: Aprobar una Solicitud

```bash
# 1. Abrir dashboard
http://localhost:3000/gestion.html

# 2. Seleccionar una solicitud pendiente
# 3. Click "Aprobar"
# 4. Agregar nota: "Aprobado - cumple requisitos"
# 5. Verificar:
   - Badge cambia a verde "Aprobada"
   - Contador "Aprobadas" aumenta en 1
   - Contador "Pendientes" disminuye en 1
   - Botones Aprobar/Rechazar desaparecen
```

### Prueba 2: Cambiar Prioridad

```bash
# 1. Seleccionar cualquier solicitud
# 2. Click en "Alta" en sección Prioridad
# 3. Verificar:
   - Botón "Alta" se resalta en azul
   - Icono rojo aparece en la lista junto al nombre
   - Contador "Prioridad Alta" aumenta
   - Toast: "Prioridad cambiada a alta"
```

### Prueba 3: Generar PDF

```bash
# 1. Seleccionar cualquier solicitud
# 2. Click "Descargar PDF"
# 3. Verificar:
   - PDF se descarga automáticamente
   - Nombre: solicitud-[ID].pdf
   - Contiene toda la información
   - Formato profesional con header UTP
```

### Prueba 4: Filtros

```bash
# 1. Click en "Filtrar"
# 2. Seleccionar:
   - Estado: Aprobada
   - Prioridad: Alta
# 3. Click "Aplicar Filtros"
# 4. Verificar:
   - Solo muestra solicitudes aprobadas con prioridad alta
   - Toast muestra cantidad de resultados
```

### Prueba 5: Búsqueda

```bash
# 1. Escribir en campo de búsqueda: "juan"
# 2. Verificar:
   - Solo muestra solicitudes de estudiantes llamados Juan
   - Búsqueda en nombre, apellido, cédula, programa, facultad
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Problema: "No se aplican los cambios de la base de datos"

**Síntomas:**
- Errores al cargar solicitudes
- Campos undefined en consola
- No aparecen estados ni prioridades

**Solución:**
```bash
# 1. Verificar que los campos existen
node verificar-datos.js

# 2. Si no existen, aplicar cambios
node aplicar-campos-gestion.js

# 3. Reiniciar servidor
# Ctrl+C en terminal del servidor
node backend/index.js
```

### Problema: "Error al aprobar/rechazar solicitud"

**Síntomas:**
- Toast de error rojo
- Consola muestra error 500

**Solución:**
```bash
# 1. Verificar que MySQL está corriendo
node verificar-datos.js

# 2. Verificar logs del backend
# En la terminal donde corre el servidor
# Buscar mensajes de error

# 3. Verificar que el endpoint está montado
curl http://localhost:3000/api/gestion/estadisticas
# Debe retornar JSON con estadísticas
```

### Problema: "PDF no se genera o da error"

**Síntomas:**
- Click en "Descargar PDF" no hace nada
- Error 500 en consola

**Solución:**
```bash
# 1. Verificar que PDFKit está instalado
npm list pdfkit
# Debe mostrar pdfkit@0.x.x

# 2. Si no está instalado
npm install pdfkit --save

# 3. Reiniciar servidor
node backend/index.js
```

### Problema: "Estadísticas no se actualizan"

**Síntomas:**
- Contadores muestran 0 siempre
- No cambian al aprobar/rechazar

**Solución:**
```bash
# 1. Verificar en consola del navegador (F12)
# Buscar errores JavaScript

# 2. Verificar que los campos existen
node verificar-datos.js

# 3. Refrescar página (F5)
```

### Problema: "Filtros no funcionan"

**Síntomas:**
- Modal se abre pero no filtra
- Resultados incorrectos

**Solución:**
```bash
# 1. Abrir consola del navegador (F12)
# 2. Verificar errores JavaScript
# 3. Verificar que los campos Estado/Prioridad existen
# 4. Limpiar caché del navegador (Ctrl+Shift+Del)
# 5. Refrescar página (F5)
```

---

## 📊 ENDPOINTS DISPONIBLES

### Gestión de Solicitudes

```
PUT    /api/gestion/solicitud/:id/aprobar
PUT    /api/gestion/solicitud/:id/rechazar
PUT    /api/gestion/solicitud/:id/prioridad
PUT    /api/gestion/solicitud/:id/notas
GET    /api/gestion/solicitud/:id
GET    /api/gestion/solicitud/:id/pdf
GET    /api/gestion/estadisticas
```

### Formularios (existentes)

```
POST   /api/formulario
GET    /api/solicitudes
GET    /api/count
GET    /api/config
```

---

## 🎨 BADGES Y COLORES

### Estados

- 🟡 **Pendiente** - Amarillo (#fef3c7)
- 🟢 **Aprobada** - Verde (#d1fae5)
- 🔴 **Rechazada** - Rojo (#fee2e2)

### Prioridades

- 🔴 **Alta** - Rojo (#ef4444)
- 🟡 **Media** - Amarillo (sin icono)
- 🟢 **Baja** - Verde (#10b981)

---

## 📝 NOTAS IMPORTANTES

### Seguridad

- **Autenticación:** Actualmente no implementada
- **Autorización:** No hay control de roles
- **TODO:** Implementar autenticación antes de producción

### Rendimiento

- Las estadísticas se calculan en el frontend
- Para miles de solicitudes, considerar endpoint dedicado
- PDFs se generan on-demand (puede ser lento con muchas solicitudes)

### Mejoras Futuras

- [ ] Autenticación y autorización
- [ ] Historial de cambios de estado
- [ ] Notificaciones por email
- [ ] Dashboard de analíticas
- [ ] Exportar a Excel
- [ ] Filtros por fecha
- [ ] Asignación de trabajadores sociales

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

Antes de usar en producción, verifica:

- [ ] Base de datos actualizada (node aplicar-campos-gestion.js)
- [ ] Dependencias instaladas (npm install)
- [ ] MySQL corriendo
- [ ] Servidor backend funcionando
- [ ] Todas las pruebas pasando
- [ ] Estadísticas mostrando datos correctos
- [ ] PDFs generándose correctamente
- [ ] Filtros funcionando
- [ ] Búsqueda funcionando
- [ ] Aprobar/Rechazar funcionando

---

## 🎯 RESUMEN RÁPIDO

**Para gestionar una solicitud:**
1. Abrir `http://localhost:3000/gestion.html`
2. Seleccionar solicitud
3. Revisar detalles
4. Cambiar prioridad si es necesario
5. Aprobar o Rechazar (con notas opcionales)
6. Descargar PDF si es necesario

**Para buscar solicitudes:**
- Usar campo de búsqueda en la parte superior
- O usar filtros (botón "Filtrar")
- O usar vistas (Pendientes/Todas)

**Para ver estadísticas:**
- Mirar parte superior del dashboard
- Se actualizan automáticamente

---

**¡Todo listo!** 🎉

Las funcionalidades están completamente implementadas y listas para usar.

Si tienes dudas o problemas:
1. Revisa la sección [Solución de Problemas](#solución-de-problemas)
2. Verifica los logs del backend
3. Revisa la consola del navegador (F12)

**Última actualización:** 2025-10-25
**Versión:** 1.0
