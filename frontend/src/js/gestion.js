// ============================================
// GESTIÓN DE SOLICITUDES - DASHBOARD
// ============================================

const API_URL = 'http://localhost:3000/api';

// Estado de la aplicación
let solicitudes = [];
let solicitudesFiltradas = [];
let solicitudSeleccionada = null;

// Elementos del DOM
const solicitudesList = document.getElementById('solicitudesList');
const detailContent = document.getElementById('detailContent');
const searchInput = document.getElementById('searchInput');
const btnFiltros = document.getElementById('btnFiltros');
const filterModal = document.getElementById('filterModal');
const btnCloseFilterModal = document.getElementById('btnCloseFilterModal');
const btnApplyFilters = document.getElementById('btnApplyFilters');
const btnResetFilters = document.getElementById('btnResetFilters');
const btnCloseDetail = document.getElementById('btnCloseDetail');

// Contadores
const countPending = document.getElementById('countPending');
const countApproved = document.getElementById('countApproved');
const countRejected = document.getElementById('countRejected');
const countHighPriority = document.getElementById('countHighPriority');

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Iniciando Dashboard de Gestión...');

  // Cargar iconos de Lucide
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Cargar solicitudes
  cargarSolicitudes();

  // Event listeners
  configurarEventListeners();
});

// ============================================
// CONFIGURAR EVENT LISTENERS
// ============================================
function configurarEventListeners() {
  // Búsqueda
  searchInput.addEventListener('input', (e) => {
    buscarSolicitudes(e.target.value);
  });

  // Modal de filtros
  btnFiltros.addEventListener('click', () => {
    filterModal.classList.add('active');
  });

  btnCloseFilterModal.addEventListener('click', () => {
    filterModal.classList.remove('active');
  });

  filterModal.addEventListener('click', (e) => {
    if (e.target === filterModal) {
      filterModal.classList.remove('active');
    }
  });

  // Aplicar filtros
  btnApplyFilters.addEventListener('click', () => {
    aplicarFiltros();
    filterModal.classList.remove('active');
  });

  // Resetear filtros
  btnResetFilters.addEventListener('click', () => {
    resetearFiltros();
  });

  // Cerrar panel de detalle
  btnCloseDetail.addEventListener('click', () => {
    cerrarDetalle();
  });

  // Botones de vista
  const viewButtons = document.querySelectorAll('.view-btn');
  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      viewButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const view = btn.getAttribute('data-view');
      if (view === 'pendientes') {
        mostrarSoloPendientes();
      } else {
        renderizarSolicitudes(solicitudes);
      }
    });
  });
}

// ============================================
// CARGAR SOLICITUDES DESDE EL BACKEND
// ============================================
async function cargarSolicitudes() {
  try {
    console.log('📥 Cargando solicitudes desde el backend...');
    mostrarCargando(true);

    const response = await fetch(`${API_URL}/solicitudes`);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ ${data.length} solicitudes cargadas`);

    solicitudes = data;
    solicitudesFiltradas = [...solicitudes];

    renderizarSolicitudes(solicitudesFiltradas);
    actualizarEstadisticas();

    mostrarCargando(false);

  } catch (error) {
    console.error('❌ Error al cargar solicitudes:', error);
    mostrarError('Error al cargar las solicitudes. Por favor, recarga la página.');
    mostrarCargando(false);
  }
}

// ============================================
// RENDERIZAR LISTA DE SOLICITUDES
// ============================================
function renderizarSolicitudes(lista) {
  console.log(`🎨 Renderizando ${lista.length} solicitudes`);

  if (lista.length === 0) {
    solicitudesList.innerHTML = `
      <div class="empty-state">
        <svg data-lucide="inbox"></svg>
        <p>No se encontraron solicitudes</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  solicitudesList.innerHTML = lista.map(solicitud => {
    // Determinar clase de badge según el estado
    const estadoBadge = solicitud.Estado === 'aprobada' ? 'badge-aprobada'
      : solicitud.Estado === 'rechazada' ? 'badge-rechazada'
      : 'badge-pendiente';

    const estadoTexto = solicitud.Estado === 'aprobada' ? 'Aprobada'
      : solicitud.Estado === 'rechazada' ? 'Rechazada'
      : 'Pendiente';

    // Determinar icono de prioridad
    const prioridadIcon = solicitud.Prioridad === 'alta'
      ? '<svg data-lucide="alert-circle" class="priority-icon priority-alta"></svg>'
      : solicitud.Prioridad === 'baja'
      ? '<svg data-lucide="circle" class="priority-icon priority-baja"></svg>'
      : '';

    return `
    <div class="solicitud-card ${solicitud.Estado}" data-id="${solicitud.id_formulario}" onclick="seleccionarSolicitud('${solicitud.id_formulario}')">
      <div class="solicitud-header">
        <div class="solicitud-info">
          <h3 class="solicitud-nombre">
            ${prioridadIcon}
            ${solicitud.Nombre} ${solicitud.Apellido}
          </h3>
          <p class="solicitud-cedula">${solicitud.Cedula}</p>
        </div>
        <span class="badge ${estadoBadge}">${estadoTexto}</span>
      </div>

      <div class="solicitud-details">
        <div class="detail-item">
          <svg data-lucide="book-open"></svg>
          <span>${solicitud.Programa || 'No especificado'}</span>
        </div>
        <div class="detail-item">
          <svg data-lucide="building"></svg>
          <span>${solicitud.Facultad || 'No especificado'}</span>
        </div>
        <div class="detail-item">
          <svg data-lucide="tag"></svg>
          <span>${solicitud.TipoPrograma || 'No especificado'}</span>
        </div>
      </div>

      <div class="solicitud-footer">
        <span class="solicitud-id">${solicitud.id_formulario}</span>
        <div class="footer-icons">
          ${solicitud.Archivo ? '<svg data-lucide="paperclip" class="has-attachment"></svg>' : ''}
        </div>
      </div>
    </div>
  `}).join('');

  lucide.createIcons();
}

// ============================================
// SELECCIONAR SOLICITUD
// ============================================
function seleccionarSolicitud(id) {
  console.log('👉 Solicitud seleccionada:', id);

  const solicitud = solicitudes.find(s => s.id_formulario === id);
  if (!solicitud) {
    console.error('❌ Solicitud no encontrada:', id);
    return;
  }

  solicitudSeleccionada = solicitud;
  mostrarDetalle(solicitud);

  // Marcar como activa en la lista
  document.querySelectorAll('.solicitud-card').forEach(card => {
    card.classList.remove('active');
  });
  document.querySelector(`[data-id="${id}"]`)?.classList.add('active');
}

// ============================================
// MOSTRAR DETALLE DE SOLICITUD
// ============================================
function mostrarDetalle(solicitud) {
  console.log('📄 Mostrando detalle de solicitud:', solicitud);

  const estadoBadge = solicitud.Estado === 'aprobada' ? 'badge-aprobada'
    : solicitud.Estado === 'rechazada' ? 'badge-rechazada'
    : 'badge-pendiente';

  const estadoTexto = solicitud.Estado === 'aprobada' ? 'Aprobada'
    : solicitud.Estado === 'rechazada' ? 'Rechazada'
    : 'Pendiente';

  const prioridadBadge = solicitud.Prioridad === 'alta' ? 'badge-prioridad-alta'
    : solicitud.Prioridad === 'baja' ? 'badge-prioridad-baja'
    : 'badge-prioridad-media';

  const prioridadTexto = solicitud.Prioridad === 'alta' ? 'Alta'
    : solicitud.Prioridad === 'baja' ? 'Baja'
    : 'Media';

  const fecha = solicitud.FechaCreacion
    ? new Date(solicitud.FechaCreacion).toLocaleDateString('es-PA')
    : 'N/A';

  detailContent.innerHTML = `
    <div class="detail-scroll">
      <!-- Encabezado -->
      <div class="detail-section">
        <div class="detail-section-header">
          <h3>Información del Estudiante</h3>
          <div class="badges-group">
            <span class="badge ${estadoBadge}">${estadoTexto}</span>
            <span class="badge ${prioridadBadge}">${prioridadTexto}</span>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <label>Nombre Completo</label>
            <p>${solicitud.Nombre} ${solicitud.Apellido}</p>
          </div>
          <div class="info-item">
            <label>Cédula</label>
            <p>${solicitud.Cedula}</p>
          </div>
          <div class="info-item">
            <label>Género</label>
            <p>${solicitud.Genero || 'No especificado'}</p>
          </div>
          <div class="info-item">
            <label>Facultad</label>
            <p>${solicitud.Facultad || 'No especificado'}</p>
          </div>
          <div class="info-item">
            <label>Fecha de Solicitud</label>
            <p>${fecha}</p>
          </div>
        </div>
      </div>

      <!-- Programa solicitado -->
      <div class="detail-section">
        <div class="detail-section-header">
          <h3>Programa Solicitado</h3>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <label>Tipo de Programa</label>
            <p>${solicitud.TipoPrograma || 'No especificado'}</p>
          </div>
          <div class="info-item">
            <label>Programa</label>
            <p>${solicitud.Programa || 'No especificado'}</p>
          </div>
        </div>
      </div>

      <!-- Gestión de Prioridad -->
      <div class="detail-section">
        <div class="detail-section-header">
          <h3>Prioridad</h3>
        </div>

        <div class="priority-controls">
          <button class="btn-priority ${solicitud.Prioridad === 'alta' ? 'active' : ''}"
                  onclick="cambiarPrioridad('${solicitud.id_formulario}', 'alta')">
            <svg data-lucide="alert-circle"></svg>
            Alta
          </button>
          <button class="btn-priority ${solicitud.Prioridad === 'media' ? 'active' : ''}"
                  onclick="cambiarPrioridad('${solicitud.id_formulario}', 'media')">
            <svg data-lucide="minus-circle"></svg>
            Media
          </button>
          <button class="btn-priority ${solicitud.Prioridad === 'baja' ? 'active' : ''}"
                  onclick="cambiarPrioridad('${solicitud.id_formulario}', 'baja')">
            <svg data-lucide="circle"></svg>
            Baja
          </button>
        </div>
      </div>

      <!-- Documentos adjuntos -->
      <div class="detail-section">
        <div class="detail-section-header">
          <h3>Documentos</h3>
        </div>

        ${solicitud.Archivo ? `
          <div class="file-item">
            <svg data-lucide="file-text"></svg>
            <div class="file-info">
              <p class="file-name">${solicitud.Archivo}</p>
              <p class="file-size">Archivo adjunto</p>
            </div>
            <a href="${API_URL}/../uploads/${solicitud.Archivo}"
               target="_blank"
               class="btn-download"
               title="Ver archivo">
              <svg data-lucide="download"></svg>
            </a>
          </div>
        ` : `
          <p class="text-muted">No hay archivos adjuntos</p>
        `}
      </div>

      <!-- Notas del Trabajador Social -->
      ${solicitud.NotasTrabajador ? `
        <div class="detail-section">
          <div class="detail-section-header">
            <h3>Notas del Trabajador Social</h3>
          </div>
          <p class="notes-text">${solicitud.NotasTrabajador}</p>
        </div>
      ` : ''}

      <!-- Acciones -->
      <div class="detail-actions">
        ${solicitud.Estado === 'pendiente' ? `
          <button class="btn-action btn-approve" onclick="aprobarSolicitud('${solicitud.id_formulario}')">
            <svg data-lucide="check"></svg>
            Aprobar
          </button>
          <button class="btn-action btn-reject" onclick="rechazarSolicitud('${solicitud.id_formulario}')">
            <svg data-lucide="x"></svg>
            Rechazar
          </button>
        ` : ''}
        <button class="btn-action btn-secondary" onclick="descargarPDF('${solicitud.id_formulario}')">
          <svg data-lucide="file-down"></svg>
          Descargar PDF
        </button>
      </div>
    </div>
  `;

  lucide.createIcons();
}

// ============================================
// CERRAR PANEL DE DETALLE
// ============================================
function cerrarDetalle() {
  detailContent.innerHTML = `
    <div class="empty-state">
      <svg data-lucide="inbox"></svg>
      <p>Selecciona una solicitud para ver los detalles</p>
    </div>
  `;

  solicitudSeleccionada = null;

  document.querySelectorAll('.solicitud-card').forEach(card => {
    card.classList.remove('active');
  });

  lucide.createIcons();
}

// ============================================
// BÚSQUEDA DE SOLICITUDES
// ============================================
function buscarSolicitudes(termino) {
  const terminoLower = termino.toLowerCase().trim();

  if (terminoLower === '') {
    solicitudesFiltradas = [...solicitudes];
  } else {
    solicitudesFiltradas = solicitudes.filter(s => {
      return (
        s.Nombre.toLowerCase().includes(terminoLower) ||
        s.Apellido.toLowerCase().includes(terminoLower) ||
        s.Cedula.toLowerCase().includes(terminoLower) ||
        (s.Programa && s.Programa.toLowerCase().includes(terminoLower)) ||
        (s.Facultad && s.Facultad.toLowerCase().includes(terminoLower))
      );
    });
  }

  renderizarSolicitudes(solicitudesFiltradas);
}

// ============================================
// APLICAR FILTROS
// ============================================
function aplicarFiltros() {
  const filterStatus = document.getElementById('filterStatus').value;
  const filterPriority = document.getElementById('filterPriority').value;
  const filterPrograma = document.getElementById('filterPrograma').value;

  solicitudesFiltradas = solicitudes.filter(s => {
    let cumpleFiltros = true;

    if (filterStatus && s.Estado !== filterStatus) {
      cumpleFiltros = false;
    }

    if (filterPriority && s.Prioridad !== filterPriority) {
      cumpleFiltros = false;
    }

    if (filterPrograma && s.Programa !== filterPrograma) {
      cumpleFiltros = false;
    }

    return cumpleFiltros;
  });

  renderizarSolicitudes(solicitudesFiltradas);
  mostrarToast(`Filtros aplicados: ${solicitudesFiltradas.length} solicitudes`);
}

// ============================================
// RESETEAR FILTROS
// ============================================
function resetearFiltros() {
  document.getElementById('filterStatus').value = '';
  document.getElementById('filterPriority').value = '';
  document.getElementById('filterPrograma').value = '';

  solicitudesFiltradas = [...solicitudes];
  renderizarSolicitudes(solicitudesFiltradas);

  mostrarToast('Filtros reseteados');
}

// ============================================
// MOSTRAR SOLO PENDIENTES
// ============================================
function mostrarSoloPendientes() {
  solicitudesFiltradas = solicitudes.filter(s => s.Estado === 'pendiente');
  renderizarSolicitudes(solicitudesFiltradas);
}

// ============================================
// ACTUALIZAR ESTADÍSTICAS
// ============================================
function actualizarEstadisticas() {
  const totalPendientes = solicitudes.filter(s => s.Estado === 'pendiente').length;
  const totalAprobadas = solicitudes.filter(s => s.Estado === 'aprobada').length;
  const totalRechazadas = solicitudes.filter(s => s.Estado === 'rechazada').length;
  const totalPrioridad = solicitudes.filter(s => s.Prioridad === 'alta').length;

  countPending.textContent = totalPendientes;
  countApproved.textContent = totalAprobadas;
  countRejected.textContent = totalRechazadas;
  countHighPriority.textContent = totalPrioridad;
}

// ============================================
// APROBAR SOLICITUD
// ============================================
async function aprobarSolicitud(id) {
  const notas = prompt('Notas (opcional):');

  try {
    console.log('✅ Aprobando solicitud:', id);

    const response = await fetch(`${API_URL}/gestion/solicitud/${id}/aprobar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ notas })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al aprobar solicitud');
    }

    mostrarToast('✅ Solicitud aprobada exitosamente');

    // Actualizar localmente
    const solicitud = solicitudes.find(s => s.id_formulario === id);
    if (solicitud) {
      solicitud.Estado = 'aprobada';
      if (notas) solicitud.NotasTrabajador = notas;
    }

    // Refrescar vista
    renderizarSolicitudes(solicitudesFiltradas);
    actualizarEstadisticas();
    if (solicitudSeleccionada && solicitudSeleccionada.id_formulario === id) {
      mostrarDetalle(solicitud);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    mostrarToast('❌ ' + error.message, true);
  }
}

// ============================================
// RECHAZAR SOLICITUD
// ============================================
async function rechazarSolicitud(id) {
  const notas = prompt('Motivo del rechazo (opcional):');

  try {
    console.log('❌ Rechazando solicitud:', id);

    const response = await fetch(`${API_URL}/gestion/solicitud/${id}/rechazar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ notas })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al rechazar solicitud');
    }

    mostrarToast('❌ Solicitud rechazada');

    // Actualizar localmente
    const solicitud = solicitudes.find(s => s.id_formulario === id);
    if (solicitud) {
      solicitud.Estado = 'rechazada';
      if (notas) solicitud.NotasTrabajador = notas;
    }

    // Refrescar vista
    renderizarSolicitudes(solicitudesFiltradas);
    actualizarEstadisticas();
    if (solicitudSeleccionada && solicitudSeleccionada.id_formulario === id) {
      mostrarDetalle(solicitud);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    mostrarToast('❌ ' + error.message, true);
  }
}

// ============================================
// CAMBIAR PRIORIDAD
// ============================================
async function cambiarPrioridad(id, prioridad) {
  try {
    console.log(`🔔 Cambiando prioridad de ${id} a: ${prioridad}`);

    const response = await fetch(`${API_URL}/gestion/solicitud/${id}/prioridad`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prioridad })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al cambiar prioridad');
    }

    mostrarToast(`Prioridad cambiada a ${prioridad}`);

    // Actualizar localmente
    const solicitud = solicitudes.find(s => s.id_formulario === id);
    if (solicitud) {
      solicitud.Prioridad = prioridad;
    }

    // Refrescar vista
    renderizarSolicitudes(solicitudesFiltradas);
    actualizarEstadisticas();
    if (solicitudSeleccionada && solicitudSeleccionada.id_formulario === id) {
      mostrarDetalle(solicitud);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    mostrarToast('❌ ' + error.message, true);
  }
}

// ============================================
// DESCARGAR PDF
// ============================================
function descargarPDF(id) {
  console.log('📄 Descargando PDF de solicitud:', id);
  window.open(`${API_URL}/gestion/solicitud/${id}/pdf`, '_blank');
  mostrarToast('📄 Generando PDF...');
}

// ============================================
// UTILIDADES
// ============================================
function mostrarCargando(mostrar) {
  if (mostrar) {
    solicitudesList.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Cargando solicitudes...</p>
      </div>
    `;
  }
}

function mostrarError(mensaje) {
  solicitudesList.innerHTML = `
    <div class="error-state">
      <svg data-lucide="alert-triangle"></svg>
      <p>${mensaje}</p>
      <button onclick="cargarSolicitudes()" class="btn-retry">Reintentar</button>
    </div>
  `;
  lucide.createIcons();
}

function mostrarToast(mensaje, esError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = mensaje;
  toast.classList.add('show');
  if (esError) {
    toast.classList.add('error');
  } else {
    toast.classList.remove('error');
  }

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ============================================
// ESTILOS ADICIONALES NECESARIOS
// ============================================
if (!document.querySelector('#gestion-dynamic-styles')) {
  const style = document.createElement('style');
  style.id = 'gestion-dynamic-styles';
  style.textContent = `
    .solicitud-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .solicitud-card:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .solicitud-card.active {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .solicitud-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .solicitud-nombre {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .priority-icon {
      width: 16px;
      height: 16px;
    }

    .priority-icon.priority-alta {
      color: #ef4444;
    }

    .priority-icon.priority-baja {
      color: #10b981;
    }

    .solicitud-cedula {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #6b7280;
    }

    .badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .badge-pendiente {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-aprobada {
      background: #d1fae5;
      color: #065f46;
    }

    .badge-rechazada {
      background: #fee2e2;
      color: #991b1b;
    }

    .badge-prioridad-alta {
      background: #fee2e2;
      color: #991b1b;
    }

    .badge-prioridad-media {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-prioridad-baja {
      background: #d1fae5;
      color: #065f46;
    }

    .badges-group {
      display: flex;
      gap: 8px;
    }

    .solicitud-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #4b5563;
    }

    .detail-item svg {
      width: 16px;
      height: 16px;
      color: #9ca3af;
    }

    .solicitud-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }

    .solicitud-id {
      font-size: 12px;
      color: #9ca3af;
      font-family: monospace;
    }

    .footer-icons {
      display: flex;
      gap: 8px;
    }

    .has-attachment {
      width: 16px;
      height: 16px;
      color: #3b82f6;
    }

    .priority-controls {
      display: flex;
      gap: 12px;
    }

    .btn-priority {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      border: 2px solid #e5e7eb;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
      font-weight: 500;
    }

    .btn-priority svg {
      width: 16px;
      height: 16px;
    }

    .btn-priority:hover {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .btn-priority.active {
      border-color: #3b82f6;
      background: #3b82f6;
      color: white;
    }

    .notes-text {
      padding: 12px;
      background: #f9fafb;
      border-radius: 6px;
      color: #374151;
      line-height: 1.6;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: #9ca3af;
    }

    .empty-state svg {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      opacity: 0.5;
    }

    .loading-state {
      text-align: center;
      padding: 48px 24px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 16px;
      border: 4px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-state {
      text-align: center;
      padding: 48px 24px;
      color: #dc2626;
    }

    .error-state svg {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
    }

    .btn-retry {
      margin-top: 16px;
      padding: 8px 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    .detail-scroll {
      overflow-y: auto;
      max-height: calc(100vh - 200px);
    }

    .detail-section {
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .detail-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .detail-section h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .info-item label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .info-item p {
      margin: 0;
      font-size: 14px;
      color: #111827;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 6px;
    }

    .file-item svg {
      width: 32px;
      height: 32px;
      color: #3b82f6;
    }

    .file-info {
      flex: 1;
    }

    .file-name {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      color: #111827;
    }

    .file-size {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #6b7280;
    }

    .btn-download {
      padding: 8px;
      background: #3b82f6;
      color: white;
      border-radius: 6px;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-download svg {
      width: 16px;
      height: 16px;
    }

    .text-muted {
      color: #9ca3af;
      font-size: 14px;
    }

    .detail-actions {
      display: flex;
      gap: 12px;
      padding: 24px;
    }

    .btn-action {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-action svg {
      width: 16px;
      height: 16px;
    }

    .btn-approve {
      background: #10b981;
      color: white;
    }

    .btn-approve:hover {
      background: #059669;
    }

    .btn-reject {
      background: #ef4444;
      color: white;
    }

    .btn-reject:hover {
      background: #dc2626;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .toast-notification {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #111827;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3);
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s;
      z-index: 1000;
    }

    .toast-notification.show {
      transform: translateY(0);
      opacity: 1;
    }

    .toast-notification.error {
      background: #dc2626;
    }

    .modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
      align-items: center;
      justify-content: center;
    }

    .modal-overlay.active {
      display: flex;
    }
  `;
  document.head.appendChild(style);
}

console.log('✅ Módulo de gestión cargado con todas las funcionalidades');
