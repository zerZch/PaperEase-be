// navRBAC.js - Control de navegación por rol
// Rol 1 = Estudiante, Rol 2 = Trabajador Social

(function() {
  'use strict';

  // Mapa de permisos: define qué enlaces ve cada rol
  const permisosPorRol = {
    1: { // Estudiante
      paginasPermitidas: [
        'menupe.html', 'programas.html', 'novedades.html',
        'solicitudes.html', 'formulario.html', 'ayuda.html',
        'privacidad.html', 'terminos.html', 'contacto.html'
      ],
      redireccionDefault: 'menupe.html'
    },
    2: { // Trabajador Social
      paginasPermitidas: [
        'gestion.html', 'estadisticas_dashboard.html', 'eventos.html',
        'ayuda.html', 'privacidad.html', 'terminos.html', 'contacto.html'
      ],
      redireccionDefault: 'gestion.html'
    }
  };

  function aplicarFiltroNav() {
    if (typeof getUserRole !== 'function') return;

    const rol = getUserRole();
    if (!rol) return;

    const permisos = permisosPorRol[rol];
    if (!permisos) return;

    // Filtrar enlaces del nav
    const navLinks = document.querySelectorAll('nav.nav a');
    navLinks.forEach(function(link) {
      const href = link.getAttribute('href');
      if (!href) return;

      // Extraer nombre de archivo de la URL
      const pagina = href.split('?')[0].split('/').pop();

      // Siempre permitir enlaces a la página actual o al home
      if (pagina === '' || pagina === '/') return;

      // Ocultar si no está en la lista de permitidos
      if (!permisos.paginasPermitidas.includes(pagina)) {
        link.style.display = 'none';
      }
    });

    // Protección de acceso directo por URL
    const paginaActual = window.location.pathname.split('/').pop() || 'index.html';
    
    // Solo verificar en páginas que requieren autenticación
    const paginasProtegidas = [
      'menupe.html', 'programas.html', 'novedades.html',
      'solicitudes.html', 'formulario.html',
      'gestion.html', 'estadisticas_dashboard.html', 'eventos.html'
    ];

    if (paginasProtegidas.includes(paginaActual) && !permisos.paginasPermitidas.includes(paginaActual)) {
      // Redirigir a la página default del rol
      window.location.href = permisos.redireccionDefault;
    }
  }

  // Ejecutar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aplicarFiltroNav);
  } else {
    aplicarFiltroNav();
  }
})();
