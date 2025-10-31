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
      .slice(0, 6); // Solo los primeros 6

    const grid = document.getElementById('novedadesGrid');
    if (!grid) return;

    grid.innerHTML = eventosFuturos.map(evento => {
      const categoria = evento.Categoria || 'Feria';
      const icono = iconosPorCategoria[categoria] || 'calendar';
      const color = coloresCategorias[categoria] || '#4d869c';
      const nombreMes = nombresMeses[evento.Mes - 1] || 'Desconocido';
      const imagenUrl = evento.Imagen || 'https://via.placeholder.com/400x200?text=Sin+Imagen';

      return `
        <a href="Novedades.html" class="novedad-card-home">
          <img src="${imagenUrl}" alt="${evento.Titulo}" class="novedad-imagen-home" onerror="this.src='https://via.placeholder.com/400x200?text=Sin+Imagen'">
          <div class="novedad-content-home">
            <div class="novedad-fecha-home">
              <i data-lucide="calendar-days"></i>
              <span>${evento.Dia} de ${nombreMes}</span>
            </div>
            <h3 class="novedad-titulo-home">${evento.Titulo}</h3>
            <div class="novedad-categoria-home" style="background-color: ${color}; color: ${categoria === 'Promoción Social' ? '#000' : '#fff'};">
              <i data-lucide="${icono}"></i>
              <span>${categoria}</span>
            </div>
          </div>
        </a>
      `;
    }).join('');

    // Reinicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  } catch (error) {
    console.error('Error cargando eventos:', error);
    const grid = document.getElementById('novedadesGrid');
    if (grid) {
      grid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1 / -1;">Error al cargar eventos</p>';
    }
  }
}

document.addEventListener('DOMContentLoaded', cargarEventos);
window.addEventListener('focus', cargarEventos);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) cargarEventos();
});
