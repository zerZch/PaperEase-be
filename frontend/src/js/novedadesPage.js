// ================================
// NOVEDADES PAGE - JavaScript
// ================================

let todosLosEventos = [];
let eventosFiltrados = [];
let eventoSeleccionado = null;

// Mapeo de iconos por categoría
const iconosPorCategoria = {
  'Programa de Salud': 'heart-pulse',
  'Promoción Social': 'users',
  'Deportivo': 'trophy',
  'Académico': 'graduation-cap',
  'Feria': 'store'
};

// Colores consistentes con el calendario
const coloresCategorias = {
  'Programa de Salud': '#c084fc',
  'Promoción Social': '#fde047',
  'Deportivo': '#fb923c',
  'Académico': '#60a5fa',
  'Feria': '#ec4899'
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

    const response = await fetch('http://localhost:3000/api/eventos');
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

  eventosGrid.innerHTML = eventosFiltrados.map((evento, index) => {
    const categoria = evento.Categoria || 'Feria';
    const icono = iconosPorCategoria[categoria] || 'calendar';
    const nombreMes = nombresMeses[evento.Mes - 1] || 'Desconocido';
    const imagenUrl = evento.Imagen || 'https://via.placeholder.com/400x200?text=Sin+Imagen';

    return `
      <div class="evento-card" data-categoria="${categoria}" data-index="${index}">
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

  // Agregar event listeners a las tarjetas
  document.querySelectorAll('.evento-card').forEach((card, index) => {
    card.addEventListener('click', () => {
      abrirModal(eventosFiltrados[index]);
    });

    // Efecto hover mejorado
    card.addEventListener('mouseenter', () => {
      card.style.cursor = 'pointer';
    });
  });

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

// ================================
// FUNCIONES DEL MODAL
// ================================

function abrirModal(evento) {
  eventoSeleccionado = evento;
  const modal = document.getElementById('eventoModalOverlay');
  const categoria = evento.Categoria || 'Feria';
  const nombreMes = nombresMeses[evento.Mes - 1] || 'Desconocido';

  // Llenar datos del modal
  document.getElementById('modalTitulo').textContent = evento.Titulo;
  document.getElementById('modalFecha').textContent = `${evento.Dia} de ${nombreMes} ${evento.year || 2025}`;

  // Categoría con color
  const modalCategoria = document.getElementById('modalCategoria');
  const color = coloresCategorias[categoria] || '#4d869c';
  modalCategoria.style.backgroundColor = color;
  modalCategoria.style.color = categoria === 'Promoción Social' ? '#000' : '#fff';
  document.getElementById('modalCategoriaTexto').textContent = categoria;

  // Horario
  const horarioItem = document.getElementById('modalHorarioItem');
  if (evento.HoraInicio && evento.HoraFin) {
    document.getElementById('modalHorario').textContent = `${evento.HoraInicio} - ${evento.HoraFin}`;
    horarioItem.style.display = 'flex';
  } else {
    horarioItem.style.display = 'none';
  }

  // Lugar
  const lugarItem = document.getElementById('modalLugarItem');
  if (evento.Lugar) {
    document.getElementById('modalLugar').textContent = evento.Lugar;
    lugarItem.style.display = 'flex';
  } else {
    lugarItem.style.display = 'none';
  }

  // Descripción
  const descripcionItem = document.getElementById('modalDescripcionItem');
  if (evento.Descripcion) {
    document.getElementById('modalDescripcion').textContent = evento.Descripcion;
    descripcionItem.style.display = 'flex';
  } else {
    descripcionItem.style.display = 'none';
  }

  // Imagen
  const imagenContainer = document.getElementById('modalImagenContainer');
  const modalImagen = document.getElementById('modalImagen');
  if (evento.Imagen) {
    modalImagen.src = evento.Imagen;
    modalImagen.onerror = function() {
      this.src = 'https://via.placeholder.com/700x300?text=Sin+Imagen';
    };
    imagenContainer.style.display = 'block';
  } else {
    imagenContainer.style.display = 'none';
  }

  // Mostrar modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevenir scroll del body

  // Reinicializar iconos de Lucide
  lucide.createIcons();
}

function cerrarModal() {
  const modal = document.getElementById('eventoModalOverlay');
  modal.classList.remove('active');
  document.body.style.overflow = ''; // Restaurar scroll del body
  eventoSeleccionado = null;
}

// Event listeners para cerrar el modal
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('eventoModalOverlay');
  const closeBtn = document.getElementById('modalCloseBtn');

  // Cerrar con botón X
  if (closeBtn) {
    closeBtn.addEventListener('click', cerrarModal);
  }

  // Cerrar al hacer clic fuera del modal
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cerrarModal();
      }
    });
  }

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      cerrarModal();
    }
  });
});
