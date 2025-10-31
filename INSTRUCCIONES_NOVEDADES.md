# Página de Novedades - Instrucciones de Implementación

## Resumen de Cambios

Se ha creado una nueva sección completa de **Novedades** para mostrar los próximos eventos relacionados con los programas de Salud y Promoción Social de Bienestar Estudiantil.

## Archivos Creados

### Frontend
1. **`/frontend/src/Novedades.html`** - Página principal de novedades
2. **`/frontend/src/css/novedades.css`** - Estilos personalizados para la página
3. **`/frontend/src/js/novedadesPage.js`** - JavaScript para cargar y filtrar eventos

### Base de Datos
4. **`/nuevos_eventos.sql`** - Script SQL con 25+ nuevos eventos

## Archivos Modificados

1. **`/frontend/src/MenuPE.html`** - Agregado enlace a Novedades en la navegación
2. **`/frontend/src/css/style.css`** - Estilos mejorados para las tarjetas de novedades

## Características Implementadas

### Diseño Minimalista
- ✅ Paleta de colores consistente con el sistema de diseño existente
- ✅ Uso de iconos de Lucide para mejorar la experiencia visual
- ✅ Espaciados y márgenes apropiados
- ✅ Diseño responsive para móviles y tablets

### Funcionalidades
- ✅ Carga dinámica de eventos desde la API
- ✅ Filtros por categoría (Salud, Promoción Social, Deportivo, Académico, Feria)
- ✅ Filtros por mes
- ✅ Tarjetas de evento con información completa:
  - Imagen
  - Fecha
  - Título
  - Descripción
  - Categoría con icono
  - Ubicación
- ✅ Solo muestra eventos futuros
- ✅ Ordenados cronológicamente
- ✅ Mensaje cuando no hay resultados

### Categorías de Eventos
Los eventos están organizados en las siguientes categorías:
- **Programa de Salud**: Eventos relacionados con bienestar físico y mental
- **Promoción Social**: Actividades de desarrollo personal y comunitario
- **Deportivo**: Competencias y actividades físicas
- **Académico**: Conferencias, talleres y seminarios
- **Feria**: Exposiciones y eventos especiales

## Instrucciones de Instalación

### Paso 1: Agregar Eventos a la Base de Datos

Ejecuta el archivo `nuevos_eventos.sql` en tu base de datos:

#### Opción A: phpMyAdmin
1. Abre phpMyAdmin
2. Selecciona la base de datos `paperease`
3. Ve a la pestaña "SQL"
4. Copia y pega el contenido de `nuevos_eventos.sql`
5. Haz clic en "Continuar" o "Ejecutar"

#### Opción B: MySQL Workbench
1. Abre MySQL Workbench
2. Conecta a tu servidor
3. Abre el archivo `nuevos_eventos.sql`
4. Ejecuta el script (⚡ icono o Ctrl+Shift+Enter)

#### Opción C: Línea de comandos
```bash
mysql -u tu_usuario -p paperease < nuevos_eventos.sql
```

### Paso 2: Verificar el Backend

El endpoint ya existe y funciona:
- **Ruta**: `http://localhost:3000/api/novedades`
- **Método**: GET
- **Retorna**: Array de todos los eventos

No se requieren cambios en el backend.

### Paso 3: Probar la Aplicación

1. Inicia el servidor backend:
```bash
cd backend
node index.js
```

2. Abre el navegador y visita:
   - Página principal: `http://localhost:3000/MenuPE.html`
   - Página de novedades: `http://localhost:3000/Novedades.html`

3. Verifica que:
   - Los eventos se cargan correctamente
   - Los filtros funcionan
   - Las imágenes se muestran
   - El diseño es responsive

## Estructura de la Base de Datos

### Tabla: `eventos`

Campos utilizados en la página de novedades:
- `Id_Eventos` - ID único del evento
- `Titulo` - Nombre del evento
- `Descripcion` - Descripción detallada
- `HoraInicio` - Hora de inicio (formato TIME)
- `HoraFin` - Hora de finalización (formato TIME)
- `Lugar` - Ubicación del evento
- `Imagen` - URL de la imagen (Unsplash)
- `Dia` - Día del mes (1-31)
- `Mes` - Mes del año (1-12)
- `Categoria` - Tipo de evento
- `year` - Año del evento (2025)
- `Programa` - Programa asociado

## Eventos Agregados

El script SQL agrega **27 nuevos eventos** distribuidos así:

- **Promoción Social**: 6 eventos
- **Programa de Salud**: 7 eventos
- **Deportivo**: 4 eventos
- **Académico**: 5 eventos
- **Feria**: 3 eventos

Todos los eventos están programados para **Noviembre y Diciembre 2025**.

## Personalización

### Agregar Más Eventos

Para agregar nuevos eventos, ejecuta un INSERT en la tabla `eventos`:

```sql
INSERT INTO `eventos` (
  `Titulo`,
  `Descripcion`,
  `HoraInicio`,
  `HoraFin`,
  `Lugar`,
  `Imagen`,
  `Dia`,
  `Mes`,
  `Categoria`,
  `year`,
  `Programa`
) VALUES (
  'Título del Evento',
  'Descripción del evento...',
  '09:00:00',
  '17:00:00',
  'Ubicación',
  'https://imagen-url.com/imagen.jpg',
  15,
  12,
  'Promoción Social',
  2025,
  'Promoción Social'
);
```

### Modificar Colores por Categoría

Edita el archivo `/frontend/src/css/novedades.css`:

```css
.evento-card[data-categoria="TuCategoria"] .evento-categoria {
  --categoria-bg: #color-fondo;
  --categoria-color: #color-texto;
}
```

### Agregar Nuevas Categorías

1. Agrega la categoría al select en `Novedades.html`:
```html
<option value="Nueva Categoria">Nueva Categoria</option>
```

2. Agrega el icono correspondiente en `novedadesPage.js`:
```javascript
const iconosPorCategoria = {
  'Nueva Categoria': 'nombre-icono-lucide',
  // ...
};
```

## Iconos Disponibles

Se utilizan iconos de [Lucide Icons](https://lucide.dev/icons/):
- `heart-pulse` - Salud
- `users` - Promoción Social
- `trophy` - Deportivo
- `graduation-cap` - Académico
- `store` - Feria
- `calendar-days` - Fecha
- `map-pin` - Ubicación
- `filter` - Filtro

## Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Diseño responsive con Grid y Flexbox
- **JavaScript (ES6+)** - Programación asíncrona con async/await
- **Lucide Icons** - Biblioteca de iconos
- **Express.js** - Backend API
- **MySQL** - Base de datos

## Soporte

Para cualquier problema o pregunta:
1. Verifica que el servidor backend esté corriendo
2. Revisa la consola del navegador para errores
3. Verifica que los eventos estén en la base de datos
4. Asegúrate de que las URLs de las imágenes sean accesibles

## Notas Adicionales

- Las imágenes utilizan URLs de Unsplash para demostración
- Los eventos futuros se muestran automáticamente
- El sistema filtra eventos pasados
- Los filtros funcionan de manera combinada (categoría + mes)
- El diseño es completamente responsive

---

**Desarrollado para PaperEase - Bienestar Estudiantil UTP**
