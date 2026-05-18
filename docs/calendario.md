# Sistema de Calendario de Eventos - PaperEase

## Descripción
Sistema completo de gestión de eventos para el calendario de PaperEase con operaciones CRUD (Crear, Leer, Actualizar, Eliminar) integrado con la base de datos MySQL.

## Funcionalidades Implementadas

### 1. **Visualizar Eventos en el Calendario**
- Calendario mensual interactivo
- Indicadores visuales de eventos por día (hasta 4 puntos de colores)
- Contador de eventos adicionales (+N)
- Navegación entre meses con botones de anterior/siguiente
- Colores por categoría:
  - 🟣 Morado (#c084fc): Programa de Salud
  - 🟡 Amarillo (#fde047): Promoción Social

### 2. **Añadir Eventos**
- Formulario completo para crear eventos
- Campos: Título, Lugar, Fecha, Hora Inicio, Hora Fin, Descripción, Categoría
- Validación de campos requeridos
- Guardado en la base de datos MySQL
- Notificación toast de confirmación

### 3. **Ver Detalles de Eventos**
- Panel lateral izquierdo con información completa del evento
- Muestra: Título, Fecha, Horario, Lugar, Descripción, Categoría
- Se abre al hacer clic en un evento individual
- Modal de lista cuando hay múltiples eventos en un día

### 4. **Editar Eventos**
- Botón de edición en el panel de detalles
- Pre-carga los datos del evento en el formulario
- Actualización en la base de datos
- Confirmación visual con toast

### 5. **Eliminar Eventos**
- Botón de eliminación en el panel de detalles
- Confirmación antes de eliminar
- Eliminación de la base de datos
- Actualización automática del calendario

### 6. **Duplicar Eventos** (Bonus)
- Función para duplicar eventos existentes
- Añade "(Copia)" al título
- Útil para eventos recurrentes

## Estructura de Archivos

### Backend
```
backend/
├── index.js          # Servidor principal con rutas
├── conexion.js       # Configuración de MySQL
└── eventos.js        # Endpoints CRUD de eventos
```

### Frontend
```
frontend/src/
├── Eventos.html      # Página del calendario
└── js/
    └── eventos.js    # Lógica del calendario y eventos
```

## Endpoints API

### GET /api/eventos
Obtiene todos los eventos ordenados por fecha.
```bash
curl http://localhost:3000/api/eventos
```

### GET /api/eventos/:id
Obtiene un evento específico por ID.
```bash
curl http://localhost:3000/api/eventos/1
```

### POST /api/eventos
Crea un nuevo evento.
```bash
curl -X POST http://localhost:3000/api/eventos \
  -H "Content-Type: application/json" \
  -d '{
    "Titulo": "Conferencia Tech",
    "Descripcion": "Evento de tecnología",
    "Lugar": "Auditorio Principal",
    "HoraInicio": "09:00:00",
    "HoraFin": "17:00:00",
    "Categoria": "Programa de Salud",
    "Dia": 15,
    "Mes": 7,
    "year": 2025
  }'
```

### PUT /api/eventos/:id
Actualiza un evento existente.
```bash
curl -X PUT http://localhost:3000/api/eventos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "Titulo": "Conferencia Tech (Actualizado)",
    "Dia": 16,
    "Mes": 7,
    "year": 2025
  }'
```

### DELETE /api/eventos/:id
Elimina un evento.
```bash
curl -X DELETE http://localhost:3000/api/eventos/1
```

## Configuración y Uso

### Requisitos Previos
- Node.js instalado
- MySQL/MariaDB instalado y corriendo
- Base de datos `paperease` creada con la tabla `eventos`

### Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar la base de datos:**
   - Asegúrate de que MySQL esté corriendo
   - Verifica la configuración en `backend/conexion.js`:
     ```javascript
     host: 'localhost',
     user: 'root',
     password: '',  // Tu contraseña
     database: 'paperease'
     ```

3. **Iniciar el servidor:**
```bash
npm start
# o
node backend/index.js
```

4. **Abrir en el navegador:**
   - Ir a: `http://localhost:3000/Eventos.html`
   - O usar Live Server en VSCode

### Verificar que MySQL está corriendo

**Windows:**
```bash
# Iniciar MySQL
net start mysql

# Verificar estado
mysql -u root -p -e "SHOW DATABASES;"
```

**Linux/Mac:**
```bash
# Iniciar MySQL
sudo systemctl start mysql
# o
sudo service mysql start

# Verificar estado
sudo systemctl status mysql
```

## Estructura de la Tabla `eventos`

```sql
CREATE TABLE eventos (
  Id_Eventos INT AUTO_INCREMENT PRIMARY KEY,
  Titulo VARCHAR(100) NOT NULL,
  Descripcion TEXT,
  HoraInicio TIME,
  HoraFin TIME,
  Lugar VARCHAR(100),
  Imagen VARCHAR(250),
  Dia INT,
  Mes INT,
  year INT DEFAULT 2025,
  Categoria VARCHAR(50),
  Facultad VARCHAR(45),
  Programa VARCHAR(100)
);
```

## Flujo de Uso

1. **Ver eventos:** Abre el calendario y navega entre meses
2. **Crear evento:** Click en "Crear evento" → Llena el formulario → Guardar
3. **Ver detalles:** Click en un día con eventos → Ver panel de detalles
4. **Editar:** En el panel de detalles → Click en ícono de editar → Modificar → Guardar
5. **Eliminar:** En el panel de detalles → Click en ícono de eliminar → Confirmar
6. **Duplicar:** En el panel de detalles → Click en ícono de duplicar

## Mejoras Implementadas

✅ Endpoint GET /:id para obtener evento específico
✅ Script "start" agregado al package.json
✅ Eliminado script duplicado en HTML
✅ Validación de campos en el formulario
✅ Notificaciones toast para todas las acciones
✅ Animaciones visuales al crear eventos
✅ Manejo de errores en todas las operaciones

## Problemas Comunes

### "Error al conectar a MySQL"
- Verifica que MySQL esté corriendo
- Verifica usuario y contraseña en `backend/conexion.js`

### "Cannot find module 'express'"
- Ejecuta: `npm install`

### "Port 3000 already in use"
- Mata el proceso: `lsof -ti:3000 | xargs kill -9` (Mac/Linux)
- O cambia el puerto en `backend/index.js`

## Tecnologías Utilizadas

- **Backend:** Node.js, Express.js, MySQL2
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Base de Datos:** MySQL
- **Iconos:** Lucide Icons

## Autor

Desarrollado para el proyecto PaperEase - Universidad Tecnológica de Panamá

---

**Fecha de última actualización:** 22 de Octubre, 2025
