/******************************
 *  CALENDARIO DE EVENTOS
 *  (PaperEase - Eventos)
 *  Versión: 2025-10-26
 ******************************/

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
let modal, closeModal, listaEventos, calendarDaysContainer, monthTitle, nextMonthBtn, previousMonthBtn;
let btnCrearEvento, panelEvento, btnCancelar, formCrearEvento;

// ============================
// Constantes
// ============================
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const coloresCategorias = {
  'Programa de Salud': '#c084fc',
  'Promoción Social': '#fde047',
  'default': '#007bff',
  'programa de salud': '#c084fc',
  'promoción social': '#fde047',
  'promocion social': '#fde047',
};

// ============================
// Utilidades
// ============================
function obtenerColorPorCategoria(categoria) {
  if (!categoria || typeof categoria !== 'string') return coloresCategorias['default'];
  const normal = categoria.trim();
  return (
    coloresCategorias[normal] ||
    coloresCategorias[normal.toLowerCase()] ||
    coloresCategorias[
      normal.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    ] ||
    coloresCategorias['default']
  );
}

function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr + 'T00:00:00');
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return fecha.toLocaleDateString('es-ES', opciones);
}

function mostrarToast(mensaje, dur = 3000) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = mensaje;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), dur);
  }
}

// ============================
// Paneles (detalle / formulario)
// ============================
function cerrarPaneles() {
  const panelOverlay = document.getElementById('panelOverlay');
  const panelDetalle = document.getElementById('panelEventoDetalle');
  const panelFormulario = document.getElementById('panelEventoFormulario');

  panelOverlay?.classList.remove('active');
  panelDetalle?.classList.remove('open');
  panelFormulario?.classList.remove('open');

  if (formCrearEvento) {
    delete formCrearEvento.dataset.editMode;
    delete formCrearEvento.dataset.editId;
  }
}

function mostrarDetalleEvento(evento, fecha, index = 0) {
  eventoActualSeleccionado = { ...evento, index, fecha };

  const eventoTitulo = document.getElementById('eventoTitulo');
  const eventoFecha = document.getElementById('eventoFecha');
  const eventoHorario = document.getElementById('eventoHorario');
  const eventoLugar = document.getElementById('eventoLugar');
  const eventoDescripcion = document.getElementById('eventoDescripcion');
  const eventoCategoria = document.getElementById('eventoCategoria');
  const eventoCategoriaTexto = document.getElementById('eventoCategoriaTexto');
  const eventoImagenContainer = document.getElementById('eventoImagenContainer');
  const eventoImagen = document.getElementById('eventoImagen');

  if (eventoTitulo) eventoTitulo.textContent = evento.titulo;
  if (eventoFecha) eventoFecha.textContent = formatearFecha(fecha);
  if (eventoHorario) eventoHorario.textContent = `${evento.horaInicio || ''} - ${evento.horaFin || ''}`;
  if (eventoLugar) eventoLugar.textContent = evento.lugar || 'Sin especificar';
  if (eventoDescripcion) eventoDescripcion.textContent = evento.descripcion || 'Sin descripción';
  if (eventoCategoria) eventoCategoria.style.backgroundColor = evento.color;
  if (eventoCategoriaTexto) eventoCategoriaTexto.textContent = evento.categoria || 'Sin categoría';

  if (evento.imagen && eventoImagen && eventoImagenContainer) {
    eventoImagen.src = evento.imagen;
    eventoImagenContainer.style.display = 'block';
  } else if (eventoImagenContainer) {
    eventoImagenContainer.style.display = 'none';
  }

  const panelOverlay = document.getElementById('panelOverlay');
  const panelEventoDetalle = document.getElementById('panelEventoDetalle');
  if (panelOverlay && panelEventoDetalle) {
    panelOverlay.classList.add('active');
    panelEventoDetalle.classList.add('open');
  }
  if (modal) modal.style.display = 'none';
}

// ============================
// Render del calendario
// ============================
function renderCalendar(date) {
  if (!calendarDaysContainer || !monthTitle) return;

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Domingo
  const diasEnMes = new Date(year, month + 1, 0).getDate();

  monthTitle.textContent = `${meses[month]} ${year}`;
  calendarDaysContainer.innerHTML = '';

  // Offset para empezar el lunes (si getDay devuelve 0=Domingo)
  const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // Huecos iniciales
  for (let i = 0; i < offset; i++) {
    const empty = document.createElement('li');
    empty.classList.add('calendar-day');
    calendarDaysContainer.appendChild(empty);
  }

  // Días
  for (let day = 1; day <= diasEnMes; day++) {
    const li = document.createElement('li');
    li.classList.add('calendar-day');
    li.dataset.day = day;

    const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${day
      .toString()
      .padStart(2, '0')}`;

    li.innerHTML = `<div class="day-info"><h5>${day}</h5></div>`;

    if (eventosPorDia[dateKey] && eventosPorDia[dateKey].length > 0) {
      li.classList.add('eventos');
      const markersContainer = document.createElement('div');
      markersContainer.style.display = 'flex';
      markersContainer.style.gap = '2px';

      const eventosVisibles = eventosPorDia[dateKey].slice(0, 4);
      const eventosRestantes = eventosPorDia[dateKey].length - eventosVisibles.length;

      eventosVisibles.forEach((ev) => {
        const mark = document.createElement('span');
        mark.className = 'event-marker';
        mark.style.cssText = `
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: ${ev.color};
          display: inline-block;
          border: 1px solid rgba(255,255,255,0.8);
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        `;
        markersContainer.appendChild(mark);
      });

      if (eventosRestantes > 0) {
        const moreIndicator = document.createElement('span');
        moreIndicator.className = 'event-more-indicator';
        moreIndicator.textContent = `+${eventosRestantes}`;
        moreIndicator.style.cssText = `
          font-size: 8px;
          color: #666;
          font-weight: bold;
          background: rgba(255,255,255,0.8);
          border-radius: 8px;
          padding: 1px 3px;
          margin-left: 2px;
        `;
        markersContainer.appendChild(moreIndicator);
      }

      li.querySelector('.day-info').appendChild(markersContainer);
    }

    li.addEventListener('click', () => {
      const eventos = eventosPorDia[dateKey] || [];
      if (eventos.length === 1) {
        mostrarDetalleEvento(eventos[0], dateKey, 0);
      } else {
        listaEventos.innerHTML = '';
        if (eventos.length > 1) {
          eventos.forEach((evento, index) => {
            const liEvento = document.createElement('li');
            liEvento.style.cssText = `
              border-left: 4px solid ${evento.color};
              padding: 8px;
              margin-bottom: 8px;
              cursor: pointer;
              border-radius: 4px;
              transition: background-color 0.2s;
            `;
            liEvento.innerHTML = `
              <strong>${evento.titulo}</strong><br>
              ${evento.descripcion ? `<em>${evento.descripcion}</em><br>` : ''}
              ${evento.horaInicio ? `Hora: ${evento.horaInicio}` : ''} ${
                evento.horaFin ? `- ${evento.horaFin}` : ''
              }<br>
              ${evento.lugar ? `Lugar: ${evento.lugar}<br>` : ''}
              Categoría: ${evento.categoria || 'N/A'}
            `;
            liEvento.addEventListener('click', () => {
              mostrarDetalleEvento(evento, dateKey, index);
            });
            liEvento.addEventListener('mouseenter', () => {
              liEvento.style.backgroundColor = 'rgba(0,0,0,0.1)';
            });
            liEvento.addEventListener('mouseleave', () => {
              liEvento.style.backgroundColor = 'transparent';
            });
            listaEventos.appendChild(liEvento);
          });
        } else {
          listaEventos.innerHTML = '<li>No hay eventos programados.</li>';
        }
        modal.style.display = 'flex';
      }
    });

    calendarDaysContainer.appendChild(li);
  }
}

function addEventWithAnimation(dateKey) {
  setTimeout(() => {
    const day = dateKey.split('-')[2];
    const dayElement = document.querySelector(`[data-day="${parseInt(day)}"]`);
    if (dayElement) {
      const eventIndicators = dayElement.querySelectorAll('.event-marker');
      const lastIndicator = eventIndicators[eventIndicators.length - 1];
      if (lastIndicator) {
        lastIndicator.style.transform = 'scale(1.6)';
        lastIndicator.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
          lastIndicator.style.transform = 'scale(1)';
        }, 300);
      }
    }
  }, 100);
}

// ============================
// Cargar eventos del backend
// ============================
async function cargarEventos() {
  try {
    const res = await fetch('http://localhost:3000/api/eventos');
    if (!res.ok) throw new Error('Error cargando eventos');

    const eventos = await res.json();
    eventosPorDia = {};

    eventos.forEach((ev) => {
      const year = (ev.year || ev.Year || '2025').toString().padStart(4, '0');
      const mes = (ev.Mes || ev.mes || 1).toString().padStart(2, '0');
      const dia = (ev.Dia || ev.dia || 1).toString().padStart(2, '0');
      const fechaKey = `${year}-${mes}-${dia}`;

      if (!eventosPorDia[fechaKey]) eventosPorDia[fechaKey] = [];

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
        fecha: fechaKey,
      });
    });

    renderCalendar(currentDate);
  } catch (error) {
    console.error(error);
    mostrarToast('Error cargando eventos. Verifica la conexión al servidor.', 5000);
  }
}

// ============================
// Listeners y bootstrapping
// ============================
document.addEventListener('DOMContentLoaded', () => {
  // Mapear DOM
  modal = document.getElementById('calendarModalOverlay');
  closeModal = document.getElementById('calendarCloseModal');
  listaEventos = document.getElementById('calendarModalEventosLista');
  calendarDaysContainer = document.querySelector('.calendar-days');
  monthTitle = document.getElementById('calendarMonthTitle');

  // Soporta tanto IDs como clases (para máxima compatibilidad con tu HTML)
  nextMonthBtn =
    document.getElementById('nextMonth') ||
    document.querySelector('.calendar-button-next');
  previousMonthBtn =
    document.getElementById('prevMonth') ||
    document.querySelector('.calendar-button-previous');

  btnCrearEvento = document.getElementById('crearEvento');
  panelEvento = document.getElementById('panelEventoFormulario');
  btnCancelar = document.querySelector('.btn-cancelar');
  formCrearEvento = document.getElementById('formCrearEvento');

  // Vista previa de imagen
  const inputImagen = document.getElementById('imagen');
  const previewContainer = document.getElementById('preview-imagen');
  const imgPreview = document.getElementById('img-preview');

  if (inputImagen) {
    inputImagen.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          imgPreview.src = event.target.result;
          previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        previewContainer.style.display = 'none';
      }
    });
  }

  // ---- FIX PRINCIPAL: Navegación robusta de meses ----
  const goNextMonth = (e) => {
    if (e) e.preventDefault();
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
    // Si el botón está dentro de un form, evita submit accidental
    if (e?.currentTarget && e.currentTarget.blur) e.currentTarget.blur();
    console.log('Mes siguiente:', meses[currentDate.getMonth()], currentDate.getFullYear());
  };

  const goPrevMonth = (e) => {
    if (e) e.preventDefault();
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
    if (e?.currentTarget && e.currentTarget.blur) e.currentTarget.blur();
    console.log('Mes anterior:', meses[currentDate.getMonth()], currentDate.getFullYear());
  };

  // Listeners directos (si existen los nodos)
  nextMonthBtn?.addEventListener('click', goNextMonth);
  previousMonthBtn?.addEventListener('click', goPrevMonth);

  // Delegación global (plan B): por si el DOM de los botones se re-renderiza
  document.addEventListener('click', (e) => {
    // Si un overlay activo tapara los clicks, ignora
    const overlay = document.getElementById('panelOverlay');
    if (overlay?.classList.contains('active')) return;

    const next = e.target.closest('#nextMonth, .calendar-button-next');
    const prev = e.target.closest('#prevMonth, .calendar-button-previous');

    if (next) {
      e.preventDefault();
      goNextMonth(e);
    } else if (prev) {
      e.preventDefault();
      goPrevMonth(e);
    }
  });

  // Modal de lista de eventos
  closeModal?.addEventListener('click', () => {
    if (modal) modal.style.display = 'none';
  });
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Abrir formulario de creación
  btnCrearEvento?.addEventListener('click', () => {
    panelEvento?.classList.add('open');
    document.getElementById('panelOverlay')?.classList.add('active');
  });
  btnCancelar?.addEventListener('click', cerrarPaneles);

// ----- Formulario crear/editar (con imagen) -----
if (formCrearEvento) {
  formCrearEvento.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(formCrearEvento);

    const fecha = formData.get('fecha');
    const titulo = formData.get('titulo');
    const lugar = formData.get('lugar');
    const horaInicio = formData.get('horaInicio');
    const horaFin = formData.get('horaFin');
    const descripcion = formData.get('descripcion');
    const color = formData.get('color');
    const imagenFile = formData.get('imagen');

    // Validar campos obligatorios
    if (!fecha || !titulo) {
      alert('Por favor completa la fecha y el título del evento');
      return;
    }

    // Dividir la fecha en año, mes y día
    const [year, mes, dia] = fecha.split('-').map((x) => parseInt(x, 10));

    // Crear un nuevo FormData para enviar los datos
    const submitFormData = new FormData();
    submitFormData.append('Titulo', titulo);
    submitFormData.append('Descripcion', descripcion || '');
    submitFormData.append('Lugar', lugar || '');
    submitFormData.append('HoraInicio', horaInicio || '');
    submitFormData.append('HoraFin', horaFin || '');
    submitFormData.append('Categoria', color || '');
    submitFormData.append('Dia', dia);
    submitFormData.append('Mes', mes);
    submitFormData.append('year', year);
    submitFormData.append('Facultad', '');
    submitFormData.append('Programa', '');
    
    if (imagenFile && imagenFile.size > 0) {
      submitFormData.append('imagen', imagenFile);
    }

    try {
      // Verificar si estamos en modo edición
      const isEditMode = formCrearEvento.dataset.editMode === 'true';
      let response;
      let url;

      if (isEditMode) {
        // Si estamos en modo edición, hacemos PUT a la API con el ID del evento
        const eventId = formCrearEvento.dataset.eventId;  // Obtener el ID del evento
        url = `http://localhost:3000/api/eventos/${eventId}`;  // Cambia la URL si es necesario
        response = await fetch(url, { method: 'PUT', body: submitFormData });
      } else {
        // Si estamos creando un nuevo evento, hacemos POST
        url = 'http://localhost:3000/api/eventos';  // Cambia la URL si es necesario
        response = await fetch(url, { method: 'POST', body: submitFormData });
      }

      if (!response.ok) {
        alert('Error al guardar el evento');
      } else {
        alert('Evento guardado correctamente');
        // Después de guardar, puedes recargar los eventos si lo deseas
        cargarEventos();  // Asegúrate de tener esta función para cargar los eventos
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un problema al guardar el evento');
    }
  });
}

          // Limpiar ANTES de cerrar paneles
          if (isEditMode) {
            delete formCrearEvento.dataset.editMode;
            delete formCrearEvento.dataset.editId;
            console.log('✅ Modo edición limpiado');
          }

          formCrearEvento.reset();
          if (previewContainer) previewContainer.style.display = 'none';

          cerrarPaneles();

          mostrarToast(`Evento "${titulo}" ${isEditMode ? 'actualizado' : 'creado'} con éxito`);
        } else {
          alert('Error: El servidor no pudo procesar la solicitud');
        }
      } catch (error) {
        console.error('Error completo:', error);
        alert(`Error al guardar el evento: ${error.message}`);
      }
    });
  }

  // ----- Acciones desde el panel de detalle -----
  const panelOverlay = document.getElementById('panelOverlay');
  const btnCerrarDetalle = document.getElementById('btnCerrarDetalle');

  btnCerrarDetalle?.addEventListener('click', cerrarPaneles);
  panelOverlay?.addEventListener('click', cerrarPaneles);

  document.getElementById('btnEditarEvento')?.addEventListener('click', () => {
    if (!eventoActualSeleccionado) return;
    const form = document.getElementById('formCrearEvento');
    if (!form) return;

    form.querySelector('[name="fecha"]').value = eventoActualSeleccionado.fecha;
    form.querySelector('[name="titulo"]').value = eventoActualSeleccionado.titulo;
    form.querySelector('[name="lugar"]').value = eventoActualSeleccionado.lugar || '';
    form.querySelector('[name="horaInicio"]').value = eventoActualSeleccionado.horaInicio || '';
    form.querySelector('[name="horaFin"]').value = eventoActualSeleccionado.horaFin || '';
    form.querySelector('[name="descripcion"]').value = eventoActualSeleccionado.descripcion || '';

    const colorRadios = form.querySelectorAll('[name="color"]');
    colorRadios.forEach((radio) => {
      radio.checked = radio.value === eventoActualSeleccionado.categoria;
    });

    form.dataset.editMode = 'true';
    form.dataset.editId = eventoActualSeleccionado.id;

    cerrarPaneles();
    setTimeout(() => {
      document.getElementById('panelEventoFormulario')?.classList.add('open');
      document.getElementById('panelOverlay')?.classList.add('active');
    }, 100);
  });

  document.getElementById('btnDuplicarEvento')?.addEventListener('click', async () => {
    if (!eventoActualSeleccionado) return;

    const eventoData = {
      Titulo: eventoActualSeleccionado.titulo + ' (Copia)',
      Descripcion: eventoActualSeleccionado.descripcion,
      Lugar: eventoActualSeleccionado.lugar,
      HoraInicio: eventoActualSeleccionado.horaInicio,
      HoraFin: eventoActualSeleccionado.horaFin,
      Categoria: eventoActualSeleccionado.categoria,
      Dia: parseInt(eventoActualSeleccionado.fecha.split('-')[2]),
      Mes: parseInt(eventoActualSeleccionado.fecha.split('-')[1]),
      year: parseInt(eventoActualSeleccionado.fecha.split('-')[0]),
      Facultad: eventoActualSeleccionado.facultad,
      Programa: eventoActualSeleccionado.programa,
      Imagen: eventoActualSeleccionado.imagen,
    };

    try {
      const response = await fetch('http://localhost:3000/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventoData),
      });

      if (response.ok) {
        await cargarEventos();
        cerrarPaneles();
        mostrarToast(`Evento "${eventoActualSeleccionado.titulo}" duplicado con éxito`);
      }
    } catch (error) {
      console.error('Error duplicando evento:', error);
      alert('Error al duplicar el evento');
    }
  });

  document.getElementById('btnEliminarEvento')?.addEventListener('click', async () => {
    if (!eventoActualSeleccionado) return;
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/eventos/${eventoActualSeleccionado.id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await cargarEventos();
        cerrarPaneles();
        mostrarToast(`Evento "${eventoActualSeleccionado.titulo}" eliminado con éxito`);
      }
    } catch (error) {
      console.error('Error eliminando evento:', error);
      alert('Error al eliminar el evento');
    }
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cerrarPaneles();
      if (modal) modal.style.display = 'none';
    }
  });

  // Cargar datos y dibujar
  cargarEventos();

  // Lucide (iconos)
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
    console.log('Iconos de Lucide inicializados');
  }

  // Debug
  console.log('Botón siguiente:', nextMonthBtn);
  console.log('Botón anterior:', previousMonthBtn);
});
