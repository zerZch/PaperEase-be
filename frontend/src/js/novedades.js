// Mapeo de iconos por categoría
const iconosPorCategoria = {
  'Programa de Salud': 'heart-pulse',
  'Promoción Social': 'users',
  'Deportivo': 'trophy',
  'Académico': 'graduation-cap',
  'Feria': 'store'
};

// Colores por categoría
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

let eventosCargadosMenu = [];

async function cargarEventos() {
  try {
    const res = await fetch('http://localhost:3000/api/eventos');
    const eventos = await res.json();

    // Filtrar solo eventos futuros
    const fechaActual = new Date();
    const eventosFuturos = eventos
      .filter(evento => {
        const fechaEvento = new Date(evento.year || 2025, evento.Mes - 1, evento.Dia);
        return fechaEvento >= fechaActual;
      })
      .sort((a, b) => {
        const fechaA = new Date(a.year || 2025, a.Mes - 1, a.Dia);
        const fechaB = new Date(b.year || 2025, b.Mes - 1, b.Dia);
        return fechaA - fechaB;
      })
      .slice(0, 5); // Solo los primeros 5 para el grid original

    eventosCargadosMenu = eventosFuturos;

    const tarjetas = document.querySelectorAll('#novedadesGrid .novedad-card');

    eventosFuturos.forEach((evento, index) => {
      const tarjeta = tarjetas[index];
      if (!tarjeta) return;

      const nombreMes = nombresMeses[evento.Mes - 1] || 'Desconocido';
      const imagenUrl = evento.Imagen || 'https://via.placeholder.com/400x200?text=Sin+Imagen';

      // Limpiar tarjeta
      tarjeta.innerHTML = '';
      tarjeta.style.cursor = 'pointer';

      // Agregar imagen
      const imagen = document.createElement('img');
      imagen.src = imagenUrl;
      imagen.alt = evento.Titulo;
      imagen.onerror = function() {
        this.src = 'https://via.placeholder.com/400x200?text=Sin+Imagen';
      };
      tarjeta.appendChild(imagen);

      // Agregar título con fecha
      const titulo = document.createElement('h4');
      titulo.textContent = `${evento.Dia}/${evento.Mes} - ${evento.Titulo}`;
      tarjeta.appendChild(titulo);

      // Agregar event listener para abrir modal
      tarjeta.addEventListener('click', () => {
        abrirModalMenu(evento);
      });
    });

    // Reinicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  } catch (error) {
    console.error('Error cargando eventos:', error);
  }
}

// Funciones del modal para MenuPE
function abrirModalMenu(evento) {
  const modal = document.getElementById('eventoModalOverlayMenu');
  const categoria = evento.Categoria || 'Feria';
  const nombreMes = nombresMeses[evento.Mes - 1] || 'Desconocido';

  // Llenar datos del modal
  document.getElementById('modalTituloMenu').textContent = evento.Titulo;
  document.getElementById('modalFechaMenu').textContent = `${evento.Dia} de ${nombreMes} ${evento.year || 2025}`;

  // Categoría con color
  const modalCategoria = document.getElementById('modalCategoriaMenu');
  const color = coloresCategorias[categoria] || '#4d869c';
  modalCategoria.style.backgroundColor = color;
  modalCategoria.style.color = categoria === 'Promoción Social' ? '#000' : '#fff';
  document.getElementById('modalCategoriaTextoMenu').textContent = categoria;

  // Horario
  const horarioItem = document.getElementById('modalHorarioItemMenu');
  if (evento.HoraInicio && evento.HoraFin) {
    document.getElementById('modalHorarioMenu').textContent = `${evento.HoraInicio} - ${evento.HoraFin}`;
    horarioItem.style.display = 'flex';
  } else {
    horarioItem.style.display = 'none';
  }

  // Lugar
  const lugarItem = document.getElementById('modalLugarItemMenu');
  if (evento.Lugar) {
    document.getElementById('modalLugarMenu').textContent = evento.Lugar;
    lugarItem.style.display = 'flex';
  } else {
    lugarItem.style.display = 'none';
  }

  // Descripción
  const descripcionItem = document.getElementById('modalDescripcionItemMenu');
  if (evento.Descripcion) {
    document.getElementById('modalDescripcionMenu').textContent = evento.Descripcion;
    descripcionItem.style.display = 'flex';
  } else {
    descripcionItem.style.display = 'none';
  }

  // Imagen
  const imagenContainer = document.getElementById('modalImagenContainerMenu');
  const modalImagen = document.getElementById('modalImagenMenu');
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
  document.body.style.overflow = 'hidden';

  // Reinicializar iconos de Lucide
  lucide.createIcons();
}

function cerrarModalMenu() {
  const modal = document.getElementById('eventoModalOverlayMenu');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Event listeners para el modal
document.addEventListener('DOMContentLoaded', () => {
  cargarEventos();

  const modal = document.getElementById('eventoModalOverlayMenu');
  const closeBtn = document.getElementById('modalCloseBtnMenu');

  // Cerrar con botón X
  if (closeBtn) {
    closeBtn.addEventListener('click', cerrarModalMenu);
  }

  // Cerrar al hacer clic fuera del modal
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cerrarModalMenu();
      }
    });
  }

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      cerrarModalMenu();
    }
  });
});

window.addEventListener('focus', cargarEventos);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) cargarEventos();
});
