// ============================================
// SOLICITUDES.JS - Dashboard del Estudiante
// ============================================

const API_URL = 'http://localhost:3000/api';

// Estado de la aplicación
let solicitudes = [];
let solicitudesFiltradas = [];
let cedulaEstudiante = '';

// Elementos del DOM
const loginModal = document.getElementById('loginModal');
const cedulaInput = document.getElementById('cedulaInput');
const btnLogin = document.getElementById('btnLogin');
const filtersSection = document.getElementById('filtersSection');
const statsSection = document.getElementById('statsSection');
const solicitudesContainer = document.getElementById('solicitudesContainer');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const searchInput = document.getElementById('searchInput');
const detalleModal = document.getElementById('detalleModal');
const btnCloseDetalle = document.getElementById('btnCloseDetalle');
const detalleContent = document.getElementById('detalleContent');

// Estadísticas
const statTotal = document.getElementById('statTotal');
const statPendiente = document.getElementById('statPendiente');
const statAprobada = document.getElementById('statAprobada');
const statRechazada = document.getElementById('statRechazada');

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Iniciando Dashboard de Solicitudes del Estudiante...');

  // Cargar iconos de Lucide
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Event listeners
  configurarEventListeners();

  // Verificar si hay cédula guardada en sessionStorage
  const cedulaGuardada = sessionStorage.getItem('cedulaEstudiante');
  if (cedulaGuardada) {
    cedulaInput.value = cedulaGuardada;
    autenticarEstudiante();
  }
});

// ============================================
// CONFIGURAR EVENT LISTENERS
// ============================================
function configurarEventListeners() {
  // Login
  btnLogin.addEventListener('click', autenticarEstudiante);

  cedulaInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      autenticarEstudiante();
    }
  });

  // Búsqueda
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      buscarSolicitudes(e.target.value);
    });
  }

  // Filtros
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      aplicarFiltro(filter);
    });
  });

  // Cerrar modal de detalle
  if (btnCloseDetalle) {
    btnCloseDetalle.addEventListener('click', cerrarModalDetalle);
  }

  if (detalleModal) {
    detalleModal.addEventListener('click', (e) => {
      if (e.target === detalleModal) {
        cerrarModalDetalle();
      }
    });
  }
}

// ============================================
// AUTENTICAR ESTUDIANTE
// ============================================
function autenticarEstudiante() {
  const cedula = cedulaInput.value.trim();

  if (!cedula) {
    mostrarToast('Por favor, ingresa tu cédula', 'error');
    return;
  }

  // Validar formato básico de cédula
  const cedulaRegex = /^[\d\-]+$/;
  if (!cedulaRegex.test(cedula)) {
    mostrarToast('Formato de cédula inválido', 'error');
    return;
  }

  cedulaEstudiante = cedula;
  sessionStorage.setItem('cedulaEstudiante', cedula);

  // Ocultar modal de login
  loginModal.classList.remove('active');

  // Cargar solicitudes
  cargarSolicitudes();
}

// ============================================
// CARGAR SOLICITUDES
// ============================================
async function cargarSolicitudes() {
  try {
    console.log(`📥 Cargando solicitudes del estudiante: ${cedulaEstudiante}`);

    // Mostrar loading
    mostrarEstado('loading');

    const response = await fetch(`${API_URL}/mis-solicitudes/${cedulaEstudiante}`);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ ${data.length} solicitudes cargadas`);

    solicitudes = data;
    solicitudesFiltradas = [...solicitudes];

    if (solicitudes.length === 0) {
      mostrarEstado('empty');
    } else {
      mostrarEstado('success');
      renderizarSolicitudes(solicitudesFiltradas);
      actualizarEstadisticas();
    }

  } catch (error) {
    console.error('❌ Error al cargar solicitudes:', error);
    mostrarEstado('error', error.message);
  }
}

// ============================================
// RENDERIZAR SOLICITUDES
// ============================================
function renderizarSolicitudes(lista) {
  console.log(`🎨 Renderizando ${lista.length} solicitudes`);

  if (lista.length === 0) {
    mostrarEstado('empty');
    return;
  }

  solicitudesContainer.innerHTML = lista.map(solicitud => {
    const fecha = solicitud.FechaCreacion
      ? new Date(solicitud.FechaCreacion).toLocaleDateString('es-PA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'Fecha no disponible';

    const estadoClase = solicitud.Estado || 'pendiente';
    const estadoTexto = solicitud.Estado === 'aprobada' ? 'Aprobada'
      : solicitud.Estado === 'rechazada' ? 'Rechazada'
      : 'Pendiente';

    const prioridadIcon = solicitud.Prioridad === 'alta'
      ? '<svg data-lucide="alert-circle" style="color: #ef4444; width: 18px; height: 18px;"></svg>'
      : '';

    return `
      <div class="solicitud-item ${estadoClase}" onclick="verDetalle('${solicitud.id_formulario}')">
        <div class="solicitud-header-card">
          <div class="solicitud-info-card">
            <h3 class="solicitud-programa">
              ${prioridadIcon}
              ${solicitud.Programa || 'Programa no especificado'}
            </h3>
            <p class="solicitud-tipo">${solicitud.TipoPrograma || 'Tipo no especificado'}</p>
          </div>
          <span class="solicitud-badge ${estadoClase}">${estadoTexto}</span>
        </div>

        <div class="solicitud-details-card">
          <div class="detail-item-card">
            <svg data-lucide="calendar"></svg>
            <span>Fecha: ${fecha}</span>
          </div>
          <div class="detail-item-card">
            <svg data-lucide="building"></svg>
            <span>${solicitud.Facultad || 'N/A'}</span>
          </div>
          ${solicitud.Archivo ? `
            <div class="detail-item-card">
              <svg data-lucide="paperclip"></svg>
              <span>Documento adjunto</span>
            </div>
          ` : ''}
          ${solicitud.NotasTrabajador ? `
            <div class="detail-item-card">
              <svg data-lucide="message-square"></svg>
              <span>Con observaciones</span>
            </div>
          ` : ''}
        </div>

        <div class="solicitud-footer-card">
          <span class="solicitud-id">${solicitud.id_formulario}</span>
          <button class="btn-ver-detalle" onclick="verDetalle('${solicitud.id_formulario}'); event.stopPropagation();">
            <svg data-lucide="eye"></svg>
            Ver Detalle
          </button>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

// ============================================
// VER DETALLE
// ============================================
function verDetalle(id) {
  console.log('👉 Mostrando detalle de solicitud:', id);

  const solicitud = solicitudes.find(s => s.id_formulario === id);
  if (!solicitud) {
    console.error('❌ Solicitud no encontrada:', id);
    mostrarToast('Solicitud no disponible', 'error');
    return;
  }

  const fecha = solicitud.FechaCreacion
    ? new Date(solicitud.FechaCreacion).toLocaleDateString('es-PA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Fecha no disponible';

  const estadoBadge = solicitud.Estado === 'aprobada' ? 'solicitud-badge aprobada'
    : solicitud.Estado === 'rechazada' ? 'solicitud-badge rechazada'
    : 'solicitud-badge pendiente';

  const estadoTexto = solicitud.Estado === 'aprobada' ? 'Aprobada'
    : solicitud.Estado === 'rechazada' ? 'Rechazada'
    : 'Pendiente';

  const prioridadTexto = solicitud.Prioridad === 'alta' ? 'Alta'
    : solicitud.Prioridad === 'baja' ? 'Baja'
    : 'Media';

  detalleContent.innerHTML = `
    <div class="detail-section">
      <h4>
        <svg data-lucide="info"></svg>
        Información General
      </h4>
      <div class="detail-grid">
        <div class="detail-field">
          <label>ID de Solicitud</label>
          <span>${solicitud.id_formulario}</span>
        </div>
        <div class="detail-field">
          <label>Estado</label>
          <span class="${estadoBadge}">${estadoTexto}</span>
        </div>
        <div class="detail-field">
          <label>Prioridad</label>
          <span>${prioridadTexto}</span>
        </div>
        <div class="detail-field">
          <label>Fecha de Solicitud</label>
          <span>${fecha}</span>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <h4>
        <svg data-lucide="user"></svg>
        Datos del Solicitante
      </h4>
      <div class="detail-grid">
        <div class="detail-field">
          <label>Nombre</label>
          <span>${solicitud.Nombre} ${solicitud.Apellido}</span>
        </div>
        <div class="detail-field">
          <label>Cédula</label>
          <span>${solicitud.Cedula}</span>
        </div>
        <div class="detail-field">
          <label>Género</label>
          <span>${solicitud.Genero || 'No especificado'}</span>
        </div>
        <div class="detail-field">
          <label>Facultad</label>
          <span>${solicitud.Facultad || 'No especificado'}</span>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <h4>
        <svg data-lucide="book-open"></svg>
        Programa Solicitado
      </h4>
      <div class="detail-grid">
        <div class="detail-field">
          <label>Tipo de Programa</label>
          <span>${solicitud.TipoPrograma || 'No especificado'}</span>
        </div>
        <div class="detail-field">
          <label>Programa</label>
          <span>${solicitud.Programa || 'No especificado'}</span>
        </div>
      </div>
    </div>

    ${solicitud.Archivo ? `
      <div class="detail-section">
        <h4>
          <svg data-lucide="paperclip"></svg>
          Documento Adjunto
        </h4>
        <div class="detail-field">
          <span>${solicitud.Archivo}</span>
          <a href="${API_URL}/../uploads/${solicitud.Archivo}"
             target="_blank"
             class="btn-ver-detalle"
             style="display: inline-flex; margin-top: 8px;">
            <svg data-lucide="download"></svg>
            Descargar Archivo
          </a>
        </div>
      </div>
    ` : ''}

    ${solicitud.NotasTrabajador ? `
      <div class="detail-section">
        <h4>
          <svg data-lucide="message-square"></svg>
          Observaciones del Trabajador Social
        </h4>
        <div class="notas-box">
          <p>${solicitud.NotasTrabajador}</p>
        </div>
      </div>
    ` : ''}

    ${solicitud.Estado === 'pendiente' ? `
      <div class="detail-section">
        <div class="notas-box" style="border-left-color: #f59e0b; background: #fef3c7;">
          <p style="color: #92400e;">
            <strong>⏳ Tu solicitud está en revisión.</strong><br>
            El personal de Bienestar Estudiantil la está evaluando.
            Te notificaremos cuando haya una actualización.
          </p>
        </div>
      </div>
    ` : ''}

    ${solicitud.Estado === 'aprobada' ? `
      <div class="detail-section">
        <div class="notas-box" style="border-left-color: #10b981; background: #d1fae5;">
          <p style="color: #065f46;">
            <strong>✅ ¡Tu solicitud ha sido aprobada!</strong><br>
            Por favor, acércate a la Oficina de Bienestar Estudiantil
            para completar el proceso.
          </p>
        </div>
      </div>
    ` : ''}

    ${solicitud.Estado === 'rechazada' ? `
      <div class="detail-section">
        <div class="notas-box" style="border-left-color: #ef4444; background: #fee2e2;">
          <p style="color: #991b1b;">
            <strong>❌ Tu solicitud ha sido rechazada.</strong><br>
            ${solicitud.NotasTrabajador
              ? 'Revisa las observaciones arriba para más detalles.'
              : 'Contacta con Bienestar Estudiantil para más información.'
            }
          </p>
        </div>
      </div>
    ` : ''}
  `;

  detalleModal.classList.add('active');
  lucide.createIcons();
}

// ============================================
// CERRAR MODAL DETALLE
// ============================================
function cerrarModalDetalle() {
  detalleModal.classList.remove('active');
}

// ============================================
// BUSCAR SOLICITUDES
// ============================================
function buscarSolicitudes(termino) {
  const terminoLower = termino.toLowerCase().trim();

  if (terminoLower === '') {
    // Si no hay término, aplicar el filtro activo
    const filtroActivo = document.querySelector('.filter-btn.active');
    const filter = filtroActivo ? filtroActivo.getAttribute('data-filter') : 'todas';
    aplicarFiltro(filter);
  } else {
    solicitudesFiltradas = solicitudes.filter(s => {
      return (
        (s.Programa && s.Programa.toLowerCase().includes(terminoLower)) ||
        (s.TipoPrograma && s.TipoPrograma.toLowerCase().includes(terminoLower)) ||
        (s.Facultad && s.Facultad.toLowerCase().includes(terminoLower)) ||
        (s.id_formulario && s.id_formulario.toLowerCase().includes(terminoLower))
      );
    });

    renderizarSolicitudes(solicitudesFiltradas);
  }
}

// ============================================
// APLICAR FILTRO
// ============================================
function aplicarFiltro(filter) {
  if (filter === 'todas') {
    solicitudesFiltradas = [...solicitudes];
  } else {
    solicitudesFiltradas = solicitudes.filter(s => s.Estado === filter);
  }

  renderizarSolicitudes(solicitudesFiltradas);
}

// ============================================
// ACTUALIZAR ESTADÍSTICAS
// ============================================
function actualizarEstadisticas() {
  const total = solicitudes.length;
  const pendiente = solicitudes.filter(s => s.Estado === 'pendiente' || !s.Estado).length;
  const aprobada = solicitudes.filter(s => s.Estado === 'aprobada').length;
  const rechazada = solicitudes.filter(s => s.Estado === 'rechazada').length;

  statTotal.textContent = total;
  statPendiente.textContent = pendiente;
  statAprobada.textContent = aprobada;
  statRechazada.textContent = rechazada;
}

// ============================================
// MOSTRAR ESTADO
// ============================================
function mostrarEstado(estado, mensaje = '') {
  // Ocultar todo
  filtersSection.style.display = 'none';
  statsSection.style.display = 'none';
  solicitudesContainer.style.display = 'none';
  emptyState.style.display = 'none';
  loadingState.style.display = 'none';
  errorState.style.display = 'none';

  switch (estado) {
    case 'loading':
      loadingState.style.display = 'block';
      break;

    case 'success':
      filtersSection.style.display = 'flex';
      statsSection.style.display = 'grid';
      solicitudesContainer.style.display = 'grid';
      break;

    case 'empty':
      filtersSection.style.display = 'flex';
      statsSection.style.display = 'grid';
      emptyState.style.display = 'block';
      actualizarEstadisticas();
      break;

    case 'error':
      errorState.style.display = 'block';
      if (mensaje) {
        errorMessage.textContent = mensaje;
      }
      break;
  }
}

// ============================================
// MOSTRAR TOAST
// ============================================
function mostrarToast(mensaje, tipo = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = mensaje;
  toast.classList.remove('error', 'success');

  if (tipo === 'error') {
    toast.classList.add('error');
  } else if (tipo === 'success') {
    toast.classList.add('success');
  }

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

console.log('✅ Módulo de solicitudes del estudiante cargado');
