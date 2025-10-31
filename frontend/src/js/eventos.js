// ============================
// Variables globales
// ============================
let currentDate = new Date();
let eventoActualSeleccionado = null;
let fechaActualSeleccionada = null;
let eventosPorDia = {};

// ============================
// Variables del DOM
// ============================
let modal, closeModal, listaEventos, calendarDaysContainer, monthTitle;
let nextMonthBtn, previousMonthBtn;
let btnCrearEvento, panelFormulario, panelDetalle, panelOverlay;
let btnCancelar, formCrearEvento;

// ============================
// Constantes
// ============================
const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const coloresCategorias = {
  'Programa de Salud': '#c084fc',
  'Promoción Social': '#fde047',
  'Deportivo': '#fb923c',
  'Académico': '#60a5fa',
  'Feria': '#ec4899',
  'programa de salud': '#c084fc',
  'promoción social': '#fde047',
  'promocion social': '#fde047',
  'deportivo': '#fb923c',
  'académico': '#60a5fa',
  'academico': '#60a5fa',
  'feria': '#ec4899',
  'default': '#4d869c'
};

// ============================
// Utilidades
// ============================
function obtenerColorPorCategoria(categoria) {
  if (!categoria || typeof categoria !== 'string') {
    return coloresCategorias['default'];
  }
  
  const normalizado = categoria.trim().toLowerCase();
  return coloresCategorias[normalizado] || coloresCategorias['default'];
}

function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr + 'T00:00:00');
  const opciones = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return fecha.toLocaleDateString('es-ES', opciones);
}

function mostrarToast(mensaje, duracion = 3000) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = mensaje;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duracion);
  }
}

// ============================
// Gestión de Paneles
// ============================
function cerrarPaneles() {
  if (panelOverlay) panelOverlay.classList.remove('active');
  if (panelDetalle) panelDetalle.classList.remove('open');
  if (panelFormulario) panelFormulario.classList.remove('open');

  // Limpiar modo edición
  if (formCrearEvento) {
    delete formCrearEvento.dataset.editMode;
    delete formCrearEvento.dataset.editId;
  }
  
  // Cerrar modal de lista de eventos
  if (modal) modal.style.display = 'none';
}

function abrirPanelFormulario() {
  if (panelOverlay) panelOverlay.classList.add('active');
  if (panelFormulario) panelFormulario.classList.add('open');
}

function abrirPanelDetalle() {
  if (panelOverlay) panelOverlay.classList.add('active');
  if (panelDetalle) panelDetalle.classList.add('open');
}

// ============================
// Mostrar Detalle de Evento
// ============================
function mostrarDetalleEvento(evento, fecha, index = 0) {
  eventoActualSeleccionado = { ...evento, index, fecha };

  // Actualizar contenido del panel
  const eventoTitulo = document.getElementById('eventoTitulo');
  const eventoFecha = document.getElementById('eventoFecha');
  const eventoHorario = document.getElementById('eventoHorario');
  const eventoLugar = document.getElementById('eventoLugar');
  const eventoDescripcion = document.getElementById('eventoDescripcion');
  const eventoCategoria = document.getElementById('eventoCategoria');
  const eventoCategoriaTexto = document.getElementById('eventoCategoriaTexto');
  const eventoImagenContainer = document.getElementById('eventoImagenContainer');
  const eventoImagen = document.getElementById('eventoImagen');

  if (eventoTitulo) eventoTitulo.textContent = evento.titulo || 'Sin título';
  if (eventoFecha) eventoFecha.textContent = formatearFecha(fecha);
  
  const horarioTexto = `${evento.horaInicio || '--:--'} - ${evento.horaFin || '--:--'}`;
  if (eventoHorario) eventoHorario.textContent = horarioTexto;
  
  if (eventoLugar) eventoLugar.textContent = evento.lugar || 'Sin especificar';
  if (eventoDescripcion) eventoDescripcion.textContent = evento.descripcion || 'Sin descripción';
  
  if (eventoCategoria) eventoCategoria.style.backgroundColor = evento.color;
  if (eventoCategoriaTexto) eventoCategoriaTexto.textContent = evento.categoria || 'Sin categoría';

  // Mostrar imagen si existe
  if (evento.imagen && eventoImagen && eventoImagenContainer) {
    eventoImagen.src = evento.imagen;
    eventoImagenContainer.style.display = 'block';
  } else if (eventoImagenContainer) {
    eventoImagenContainer.style.display = 'none';
  }

  // Cerrar modal de lista y abrir panel de detalle
  if (modal) modal.style.display = 'none';
  abrirPanelDetalle();
}

// ============================
// Render del Calendario
// ============================
function renderCalendar(date) {
  if (!calendarDaysContainer || !monthTitle) {
    console.error('Contenedores del calendario no encontrados');
    return;
  }

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const diasEnMes = new Date(year, month + 1, 0).getDate();

  monthTitle.textContent = `${meses[month]} ${year}`;
  calendarDaysContainer.innerHTML = '';

  // Calcular offset (lunes como primer día)
  const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // Días vacíos iniciales
  for (let i = 0; i < offset; i++) {
    const emptyDay = document.createElement('li');
    emptyDay.classList.add('calendar-day');
    calendarDaysContainer.appendChild(emptyDay);
  }

  // Días del mes
  for (let day = 1; day <= diasEnMes; day++) {
    const dayElement = document.createElement('li');
    dayElement.classList.add('calendar-day');
    dayElement.dataset.day = day;

    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    dayElement.innerHTML = `<div class="day-info"><h5>${day}</h5></div>`;

    // Verificar si hay eventos
    if (eventosPorDia[dateKey] && eventosPorDia[dateKey].length > 0) {
      dayElement.classList.add('eventos');
      
      const markersContainer = document.createElement('div');
      markersContainer.style.cssText = 'display: flex; gap: 3px; margin-top: 4px; flex-wrap: wrap;';

      const eventosVisibles = eventosPorDia[dateKey].slice(0, 4);
      const eventosRestantes = eventosPorDia[dateKey].length - eventosVisibles.length;

      // Crear marcadores de eventos
      eventosVisibles.forEach((ev) => {
        const marker = document.createElement('span');
        marker.className = 'event-marker';
        marker.style.backgroundColor = ev.color;
        marker.title = ev.titulo;
        markersContainer.appendChild(marker);
      });

      // Indicador de eventos adicionales
      if (eventosRestantes > 0) {
        const moreIndicator = document.createElement('span');
        moreIndicator.className = 'event-more-indicator';
        moreIndicator.textContent = `+${eventosRestantes}`;
        moreIndicator.title = `${eventosRestantes} evento(s) más`;
        markersContainer.appendChild(moreIndicator);
      }

      dayElement.querySelector('.day-info').appendChild(markersContainer);
    }

    // Click handler para cada día
    dayElement.addEventListener('click', (e) => {
      e.stopPropagation();
      manejarClickDia(dateKey);
    });

    calendarDaysContainer.appendChild(dayElement);
  }

  console.log(`Calendario renderizado: ${meses[month]} ${year}`);
}

// ============================
// Manejar Click en Día
// ============================
function manejarClickDia(dateKey) {
  const eventos = eventosPorDia[dateKey] || [];

  if (eventos.length === 0) {
    mostrarToast('No hay eventos programados para este día');
    return;
  }

  if (eventos.length === 1) {
    // Un solo evento: abrir directamente el panel de detalle
    mostrarDetalleEvento(eventos[0], dateKey, 0);
  } else {
    // Múltiples eventos: mostrar modal con lista
    mostrarModalEventos(eventos, dateKey);
  }
}

// ============================
// Modal de Lista de Eventos
// ============================
function mostrarModalEventos(eventos, dateKey) {
  if (!listaEventos || !modal) return;

  listaEventos.innerHTML = '';

  eventos.forEach((evento, index) => {
    const li = document.createElement('li');
    li.style.cssText = `
      border-left: 4px solid ${evento.color};
      padding: 12px;
      margin-bottom: 10px;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s ease;
      background: #f9fafb;
    `;

    li.innerHTML = `
      <strong style="color: #333; font-size: 1.05rem;">${evento.titulo}</strong><br>
      ${evento.descripcion ? `<em style="color: #666; font-size: 0.9rem;">${evento.descripcion}</em><br>` : ''}
      ${evento.horaInicio ? `<span style="color: #666;"><i data-lucide="clock" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle;"></i> ${evento.horaInicio}${evento.horaFin ? ` - ${evento.horaFin}` : ''}</span><br>` : ''}
      ${evento.lugar ? `<span style="color: #666;"><i data-lucide="map-pin" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle;"></i> ${evento.lugar}</span><br>` : ''}
      <span style="color: #999; font-size: 0.85rem;">Categoría: ${evento.categoria || 'N/A'}</span>
    `;

    li.addEventListener('click', () => {
      mostrarDetalleEvento(evento, dateKey, index);
      // Reinicializar iconos de Lucide en el modal
      if (typeof lucide !== 'undefined') {
        setTimeout(() => lucide.createIcons(), 50);
      }
    });

    li.addEventListener('mouseenter', () => {
      li.style.backgroundColor = '#e5e7eb';
      li.style.transform = 'translateX(4px)';
    });

    li.addEventListener('mouseleave', () => {
      li.style.backgroundColor = '#f9fafb';
      li.style.transform = 'translateX(0)';
    });

    listaEventos.appendChild(li);
  });

  modal.style.display = 'flex';
  
  // Inicializar iconos de Lucide en el modal
  if (typeof lucide !== 'undefined') {
    setTimeout(() => lucide.createIcons(), 50);
  }
}

// ============================
// Cargar Eventos del Backend
// ============================
async function cargarEventos() {
  try {
    const response = await fetch('http://localhost:3000/api/eventos');
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const eventos = await response.json();
    eventosPorDia = {};

    eventos.forEach((ev) => {
      const year = String(ev.year || ev.Year || 2025).padStart(4, '0');
      const mes = String(ev.Mes || ev.mes || 1).padStart(2, '0');
      const dia = String(ev.Dia || ev.dia || 1).padStart(2, '0');
      const fechaKey = `${year}-${mes}-${dia}`;

      if (!eventosPorDia[fechaKey]) {
        eventosPorDia[fechaKey] = [];
      }

      const colorEvento = obtenerColorPorCategoria(ev.Categoria);
      
      eventosPorDia[fechaKey].push({
        id: ev.Id_Eventos,
        titulo: ev.Titulo,
        lugar: ev.Lugar || '',
        horaInicio: ev.HoraInicio || '',
        horaFin: ev.HoraFin || '',
        descripcion: ev.Descripcion || '',
        categoria: ev.Categoria || '',
        color: colorEvento,
        facultad: ev.Facultad,
        programa: ev.Programa,
        imagen: ev.Imagen,
        fecha: fechaKey
      });
    });

    renderCalendar(currentDate);
    console.log(`${eventos.length} eventos cargados`);
    
  } catch (error) {
    console.error('Error cargando eventos:', error);
    mostrarToast('Error al cargar eventos. Verifica la conexión al servidor.', 5000);
  }
}

// ============================
// Navegación de Meses
// ============================
function irMesSiguiente(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
  
  console.log(`Siguiente: ${meses[currentDate.getMonth()]} ${currentDate.getFullYear()}`);
}

function irMesAnterior(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
  
  console.log(`Anterior: ${meses[currentDate.getMonth()]} ${currentDate.getFullYear()}`);
}

// ============================
// Gestión del Formulario
// ============================
async function guardarEvento(e) {
  e.preventDefault();

  const formData = new FormData(formCrearEvento);
  
  const fecha = formData.get('fecha');
  const titulo = formData.get('titulo');
  const lugar = formData.get('lugar');
  const horaInicio = formData.get('horaInicio');
  const horaFin = formData.get('horaFin');
  const descripcion = formData.get('descripcion');
  const categoria = formData.get('color');
  const imagenFile = formData.get('imagen');

  // Validación básica
  if (!fecha || !titulo) {
    mostrarToast('Por favor completa la fecha y el título del evento', 4000);
    return;
  }

  const [year, mes, dia] = fecha.split('-').map(x => parseInt(x, 10));

  // Preparar datos para enviar
  const submitFormData = new FormData();
  submitFormData.append('Titulo', titulo);
  submitFormData.append('Descripcion', descripcion || '');
  submitFormData.append('Lugar', lugar || '');
  submitFormData.append('HoraInicio', horaInicio || '');
  submitFormData.append('HoraFin', horaFin || '');
  submitFormData.append('Categoria', categoria || '');
  submitFormData.append('Dia', dia);
  submitFormData.append('Mes', mes);
  submitFormData.append('year', year);
  submitFormData.append('Facultad', '');
  submitFormData.append('Programa', '');
  
  if (imagenFile && imagenFile.size > 0) {
    submitFormData.append('imagen', imagenFile);
  }

  try {
    const isEditMode = formCrearEvento.dataset.editMode === 'true';
    let response;
    let url;

    if (isEditMode) {
      const eventId = formCrearEvento.dataset.editId;
      url = `http://localhost:3000/api/eventos/${eventId}`;
      response = await fetch(url, {
        method: 'PUT',
        body: submitFormData
      });
    } else {
      url = 'http://localhost:3000/api/eventos';
      response = await fetch(url, {
        method: 'POST',
        body: submitFormData
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      await cargarEventos();
      
      // Limpiar formulario y modo edición
      formCrearEvento.reset();
      delete formCrearEvento.dataset.editMode;
      delete formCrearEvento.dataset.editId;
      
      // Limpiar preview de imagen
      const previewContainer = document.getElementById('preview-imagen');
      if (previewContainer) previewContainer.style.display = 'none';
      
      cerrarPaneles();
      
      const accion = isEditMode ? 'actualizado' : 'creado';
      mostrarToast(`Evento "${titulo}" ${accion} con éxito`);
      
    } else {
      throw new Error('El servidor no pudo procesar la solicitud');
    }
    
  } catch (error) {
    console.error('Error al guardar evento:', error);
    mostrarToast(`Error: ${error.message}`, 5000);
  }
}

// ============================
// Editar Evento
// ============================
function editarEvento() {
  if (!eventoActualSeleccionado || !formCrearEvento) return;

  const evento = eventoActualSeleccionado;

  // Llenar formulario con datos del evento
  formCrearEvento.querySelector('[name="fecha"]').value = evento.fecha;
  formCrearEvento.querySelector('[name="titulo"]').value = evento.titulo;
  formCrearEvento.querySelector('[name="lugar"]').value = evento.lugar || '';
  formCrearEvento.querySelector('[name="horaInicio"]').value = evento.horaInicio || '';
  formCrearEvento.querySelector('[name="horaFin"]').value = evento.horaFin || '';
  formCrearEvento.querySelector('[name="descripcion"]').value = evento.descripcion || '';

  // Seleccionar radio button de categoría
  const colorRadios = formCrearEvento.querySelectorAll('[name="color"]');
  colorRadios.forEach((radio) => {
    radio.checked = radio.value === evento.categoria;
  });

  // Activar modo edición
  formCrearEvento.dataset.editMode = 'true';
  formCrearEvento.dataset.editId = evento.id;

  // Cambiar título del formulario
  const tituloFormulario = panelFormulario.querySelector('h2');
  if (tituloFormulario) {
    tituloFormulario.textContent = 'Editar Evento';
  }

  cerrarPaneles();
  
  setTimeout(() => {
    abrirPanelFormulario();
  }, 150);
}

// ============================
// Duplicar Evento
// ============================
async function duplicarEvento() {
  if (!eventoActualSeleccionado) return;

  const evento = eventoActualSeleccionado;

  const eventoData = {
    Titulo: evento.titulo + ' (Copia)',
    Descripcion: evento.descripcion,
    Lugar: evento.lugar,
    HoraInicio: evento.horaInicio,
    HoraFin: evento.horaFin,
    Categoria: evento.categoria,
    Dia: parseInt(evento.fecha.split('-')[2]),
    Mes: parseInt(evento.fecha.split('-')[1]),
    year: parseInt(evento.fecha.split('-')[0]),
    Facultad: evento.facultad || '',
    Programa: evento.programa || '',
    Imagen: evento.imagen || ''
  };

  try {
    const response = await fetch('http://localhost:3000/api/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventoData)
    });

    if (response.ok) {
      await cargarEventos();
      cerrarPaneles();
      mostrarToast(`Evento "${evento.titulo}" duplicado con éxito`);
    } else {
      throw new Error('Error al duplicar evento');
    }
    
  } catch (error) {
    console.error('Error duplicando evento:', error);
    mostrarToast('Error al duplicar el evento', 4000);
  }
}

// ============================
// Eliminar Evento
// ============================
async function eliminarEvento() {
  if (!eventoActualSeleccionado) return;

  const confirmar = confirm(`¿Estás seguro de que quieres eliminar el evento "${eventoActualSeleccionado.titulo}"?`);
  
  if (!confirmar) return;

  try {
    const response = await fetch(
      `http://localhost:3000/api/eventos/${eventoActualSeleccionado.id}`,
      { method: 'DELETE' }
    );

    if (response.ok) {
      await cargarEventos();
      cerrarPaneles();
      mostrarToast(`Evento "${eventoActualSeleccionado.titulo}" eliminado con éxito`);
    } else {
      throw new Error('Error al eliminar evento');
    }
    
  } catch (error) {
    console.error('Error eliminando evento:', error);
    mostrarToast('Error al eliminar el evento', 4000);
  }
}

// ============================
// Inicialización
// ============================
document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando calendario...');

  // Mapear elementos del DOM
  modal = document.getElementById('calendarModalOverlay');
  closeModal = document.getElementById('calendarCloseModal');
  listaEventos = document.getElementById('calendarModalEventosLista');
  calendarDaysContainer = document.querySelector('.calendar-days');
  monthTitle = document.getElementById('calendarMonthTitle');
  nextMonthBtn = document.getElementById('nextMonth');
  previousMonthBtn = document.getElementById('prevMonth');
  btnCrearEvento = document.getElementById('crearEvento');
  panelFormulario = document.getElementById('panelEventoFormulario');
  panelDetalle = document.getElementById('panelEventoDetalle');
  panelOverlay = document.getElementById('panelOverlay');
  btnCancelar = document.querySelector('.btn-cancelar');
  formCrearEvento = document.getElementById('formCrearEvento');

  // Verificar elementos críticos
  if (!calendarDaysContainer || !monthTitle) {
    console.error('Elementos críticos del calendario no encontrados');
    return;
  }

  // === EVENTOS DE NAVEGACIÓN ===
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', irMesSiguiente);
    console.log('Botón siguiente mes vinculado');
  }

  if (previousMonthBtn) {
    previousMonthBtn.addEventListener('click', irMesAnterior);
    console.log('Botón mes anterior vinculado');
  }

  // === EVENTOS DEL MODAL ===
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  // === EVENTOS DE OVERLAY ===
  if (panelOverlay) {
    panelOverlay.addEventListener('click', cerrarPaneles);
  }

  // === BOTÓN CREAR EVENTO ===
  if (btnCrearEvento) {
    btnCrearEvento.addEventListener('click', () => {
      // Resetear formulario y modo edición
      if (formCrearEvento) {
        formCrearEvento.reset();
        delete formCrearEvento.dataset.editMode;
        delete formCrearEvento.dataset.editId;
        
        const tituloFormulario = panelFormulario.querySelector('h2');
        if (tituloFormulario) {
          tituloFormulario.textContent = 'Añadir Evento';
        }
      }
      
      abrirPanelFormulario();
    });
  }

  // === BOTÓN CANCELAR ===
  if (btnCancelar) {
    btnCancelar.addEventListener('click', cerrarPaneles);
  }

  // === FORMULARIO ===
  if (formCrearEvento) {
    formCrearEvento.addEventListener('submit', guardarEvento);
  }

  // === PREVIEW DE IMAGEN ===
  const inputImagen = document.getElementById('imagen');
  const previewContainer = document.getElementById('preview-imagen');
  const imgPreview = document.getElementById('img-preview');

  if (inputImagen && previewContainer && imgPreview) {
    inputImagen.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          imgPreview.src = event.target.result;
          previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        previewContainer.style.display = 'none';
      }
    });
  }

  // === BOTONES DEL PANEL DE DETALLE ===
  const btnCerrarDetalle = document.getElementById('btnCerrarDetalle');
  const btnEditarEvento = document.getElementById('btnEditarEvento');
  const btnDuplicarEvento = document.getElementById('btnDuplicarEvento');
  const btnEliminarEvento = document.getElementById('btnEliminarEvento');

  if (btnCerrarDetalle) {
    btnCerrarDetalle.addEventListener('click', cerrarPaneles);
  }

  if (btnEditarEvento) {
    btnEditarEvento.addEventListener('click', editarEvento);
  }

  if (btnDuplicarEvento) {
    btnDuplicarEvento.addEventListener('click', duplicarEvento);
  }

  if (btnEliminarEvento) {
    btnEliminarEvento.addEventListener('click', eliminarEvento);
  }

  // === TECLA ESCAPE ===
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cerrarPaneles();
    }
  });

  // === CARGAR EVENTOS Y RENDERIZAR ===
  cargarEventos();

  // === INICIALIZAR ICONOS LUCIDE ===
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
    console.log('Iconos Lucide inicializados');
  }

  console.log('Calendario inicializado correctamente');
});