// ================================
// NOVEDADES PAGE - JavaScript
// ================================

let todosLosEventos = [];
let eventosFiltrados = [];

// Mapeo de iconos por categoría
const iconosPorCategoria = {
  'Programa de Salud': 'heart-pulse',
  'Promoción Social': 'users',
  'Deportivo': 'trophy',
  'Académico': 'graduation-cap',
  'Feria': 'store'
};

// Nombres de los meses
const nombresMeses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Cargar eventos desde la API
async function cargarEventos() {
  const eventosGrid = document.getElementById('eventosGrid');
  const noResultados = document.getElementById('noResultados');

  try {
    // Mostrar loading
    eventosGrid.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Cargando eventos...</p>
      </div>
    `;

    const response = await fetch('http://localhost:3000/api/novedades');
    if (!response.ok) throw new Error('Error al cargar eventos');

    todosLosEventos = await response.json();

    // Filtrar eventos futuros y ordenar por fecha
    const fechaActual = new Date();
    todosLosEventos = todosLosEventos
      .filter(evento => {
        const fechaEvento = new Date(evento.year || 2025, evento.Mes - 1, evento.Dia);
        return fechaEvento >= fechaActual;
      })
      .sort((a, b) => {
        const fechaA = new Date(a.year || 2025, a.Mes - 1, a.Dia);
        const fechaB = new Date(b.year || 2025, b.Mes - 1, b.Dia);
        return fechaA - fechaB;
      });

    eventosFiltrados = [...todosLosEventos];
    renderizarEventos();

  } catch (error) {
    console.error('Error cargando eventos:', error);
    eventosGrid.innerHTML = `
      <div class="loading">
        <p style="color: #dc2626;">Error al cargar los eventos. Por favor, intenta de nuevo más tarde.</p>
      </div>
    `;
  }
}

// Renderizar eventos en el grid
function renderizarEventos() {
  const eventosGrid = document.getElementById('eventosGrid');
  const noResultados = document.getElementById('noResultados');

  if (eventosFiltrados.length === 0) {
    eventosGrid.style.display = 'none';
    noResultados.style.display = 'flex';
    noResultados.style.flexDirection = 'column';
    noResultados.style.alignItems = 'center';
    noResultados.style.justifyContent = 'center';
    lucide.createIcons();
    return;
  }

  noResultados.style.display = 'none';
  eventosGrid.style.display = 'grid';

  eventosGrid.innerHTML = eventosFiltrados.map(evento => {
    const categoria = evento.Categoria || 'Feria';
    const icono = iconosPorCategoria[categoria] || 'calendar';
    const nombreMes = nombresMeses[evento.Mes - 1] || 'Desconocido';
    const imagenUrl = evento.Imagen || 'https://via.placeholder.com/400x200?text=Sin+Imagen';

    return `
      <div class="evento-card" data-categoria="${categoria}">
        <img src="${imagenUrl}" alt="${evento.Titulo}" class="evento-imagen" onerror="this.src='https://via.placeholder.com/400x200?text=Sin+Imagen'">
        <div class="evento-content">
          <div class="evento-fecha">
            <i data-lucide="calendar-days" class="fecha-icon"></i>
            <span>${evento.Dia} de ${nombreMes} ${evento.year || 2025}</span>
          </div>
          <h3 class="evento-titulo">${evento.Titulo}</h3>
          <p class="evento-descripcion">${evento.Descripcion || 'Descripción no disponible'}</p>
          <div class="evento-footer">
            <div class="evento-categoria">
              <i data-lucide="${icono}" class="categoria-icon"></i>
              <span>${categoria}</span>
            </div>
            ${evento.Lugar ? `
              <div class="evento-ubicacion">
                <i data-lucide="map-pin" class="ubicacion-icon"></i>
                <span>${evento.Lugar}</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Reinicializar los iconos de Lucide
  lucide.createIcons();
}

// Filtrar eventos
function filtrarEventos() {
  const categoriaSeleccionada = document.getElementById('filtroCategoria').value;
  const mesSeleccionado = document.getElementById('filtroMes').value;

  eventosFiltrados = todosLosEventos.filter(evento => {
    const cumpleCategoria = categoriaSeleccionada === 'todos' ||
                           evento.Categoria === categoriaSeleccionada;
    const cumpleMes = mesSeleccionado === 'todos' ||
                     evento.Mes.toString() === mesSeleccionado;

    return cumpleCategoria && cumpleMes;
  });

  renderizarEventos();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  cargarEventos();

  // Filtros
  document.getElementById('filtroCategoria').addEventListener('change', filtrarEventos);
  document.getElementById('filtroMes').addEventListener('change', filtrarEventos);
});

// Recargar al volver a la pestaña
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    cargarEventos();
  }
});
