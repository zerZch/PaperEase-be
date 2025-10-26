// Variables globales
let currentDate = new Date();
let eventoActualSeleccionado = null;
let fechaActualSeleccionada = null;
let eventosPorDia = {};

// Variables del DOM
let modal, closeModal, listaEventos, calendarDaysContainer, monthTitle, nextMonthBtn, previousMonthBtn;
let btnCrearEvento, panelEvento, btnCancelar, formCrearEvento;

// Constantes
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

// Función para obtener color por categoría
function obtenerColorPorCategoria(categoria) {
    if (!categoria || typeof categoria !== 'string') return coloresCategorias['default'];
    const normal = categoria.trim();
    return coloresCategorias[normal] ||
           coloresCategorias[normal.toLowerCase()] ||
           coloresCategorias[normal.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')] ||
           coloresCategorias['default'];
}

// Función para formatear fecha
function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr + 'T00:00:00');
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return fecha.toLocaleDateString('es-ES', opciones);
}

// Función para cerrar paneles
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

// Función para mostrar detalles del evento
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

    // Mostrar imagen si existe
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

// Función para renderizar el calendario
function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const diasEnMes = new Date(year, month + 1, 0).getDate();
    monthTitle.textContent = `${meses[month]} ${year}`;
    calendarDaysContainer.innerHTML = '';
    const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    for (let i = 0; i < offset; i++) {
        const empty = document.createElement('li');
        empty.classList.add('calendar-day');
        calendarDaysContainer.appendChild(empty);
    }
    for (let day = 1; day <= diasEnMes; day++) {
        const li = document.createElement('li');
        li.classList.add('calendar-day');
        li.dataset.day = day;
        const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        li.innerHTML = `<div class="day-info"><h5>${day}</h5></div>`;
        if (eventosPorDia[dateKey] && eventosPorDia[dateKey].length > 0) {
            li.classList.add('eventos');
            const markersContainer = document.createElement('div');
            markersContainer.style.display = 'flex';
            markersContainer.style.gap = '2px';
            const eventosVisibles = eventosPorDia[dateKey].slice(0, 4);
            const eventosRestantes = eventosPorDia[dateKey].length - eventosVisibles.length;
            eventosVisibles.forEach(ev => {
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
            } else if (eventos.length > 1) {
                listaEventos.innerHTML = '';
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
                        ${evento.horaInicio ? `Hora: ${evento.horaInicio}` : ''} ${evento.horaFin ? `- ${evento.horaFin}` : ''}<br>
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
                modal.style.display = 'flex';
            } else if (eventos.length === 0) {
                listaEventos.innerHTML = '<li>No hay eventos programados.</li>';
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
// Función para cargar eventos desde el backend
async function cargarEventos() {
    try {
        const res = await fetch('http://localhost:3000/api/eventos');
        addEventWithAnimation(fecha); // esto llama la animación del día afectado
        if (!res.ok) throw new Error('Error cargando eventos');
        const eventos = await res.json();
        eventosPorDia = {};
        eventos.forEach(ev => {
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
                fecha: fechaKey
            });
        });
        renderCalendar(currentDate);
    } catch (error) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = 'Error cargando eventos. Verifica la conexión al servidor.';
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 5000);
        }
    }
}

// Función para mostrar toast
function mostrarToast(mensaje) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = mensaje;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

// Event listeners principales
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar variables del DOM
    modal = document.getElementById('calendarModalOverlay');
    closeModal = document.getElementById('calendarCloseModal');
    listaEventos = document.getElementById('calendarModalEventosLista');
    calendarDaysContainer = document.querySelector('.calendar-days');
    monthTitle = document.getElementById('calendarMonthTitle');
    nextMonthBtn = document.querySelector('.calendar-button-next');
    previousMonthBtn = document.querySelector('.calendar-button-previous');
    btnCrearEvento = document.getElementById("crearEvento");
    panelEvento = document.getElementById("panelEventoFormulario");
    btnCancelar = document.querySelector(".btn-cancelar");
    formCrearEvento = document.getElementById('formCrearEvento');

    // Vista previa de imagen
    const inputImagen = document.getElementById('imagen');
    const previewContainer = document.getElementById('preview-imagen');
    const imgPreview = document.getElementById('img-preview');

    if (inputImagen) {
        inputImagen.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    imgPreview.src = event.target.result;
                    previewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                previewContainer.style.display = 'none';
            }
        });
    }

    nextMonthBtn?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
        console.log('Mes siguiente:', meses[currentDate.getMonth()], currentDate.getFullYear());
    });
    previousMonthBtn?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
        console.log('Mes anterior:', meses[currentDate.getMonth()], currentDate.getFullYear());
    });
    closeModal?.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
    btnCrearEvento?.addEventListener("click", () => {
        panelEvento?.classList.add("open");
        document.getElementById('panelOverlay')?.classList.add('active');
    });
    btnCancelar?.addEventListener("click", cerrarPaneles);

    // Event listener para el formulario - CON SOPORTE DE IMÁGENES
    formCrearEvento.addEventListener('submit', async (e) => {
        e.preventDefault();

        console.log('Formulario enviado');

        const formData = new FormData(formCrearEvento);

        // Obtener valores del formulario
        const fecha = formData.get('fecha');
        const titulo = formData.get('titulo');
        const lugar = formData.get('lugar');
        const horaInicio = formData.get('horaInicio');
        const horaFin = formData.get('horaFin');
        const descripcion = formData.get('descripcion');
        const color = formData.get('color');
        const imagenFile = formData.get('imagen');

        console.log('Datos del formulario:', {
            fecha, titulo, lugar, horaInicio, horaFin, descripcion, color, imagen: imagenFile?.name
        });

        // Validación básica
        if (!fecha || !titulo) {
            alert('Por favor completa la fecha y el título del evento');
            return;
        }

        // Parsear fecha correctamente
        const fechaParts = fecha.split('-');
        const year = parseInt(fechaParts[0]);
        const mes = parseInt(fechaParts[1]);
        const dia = parseInt(fechaParts[2]);

        console.log('Fecha parseada:', { dia, mes, year });

        // Preparar FormData para enviar (incluyendo archivo)
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

        // Solo agregar imagen si se seleccionó una
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
                console.log('Actualizando evento ID:', eventId);

                response = await fetch(url, {
                    method: 'PUT',
                    body: submitFormData // Enviar como FormData, no JSON
                });
            } else {
                url = 'http://localhost:3000/api/eventos';
                console.log('Creando nuevo evento');

                response = await fetch(url, {
                    method: 'POST',
                    body: submitFormData // Enviar como FormData, no JSON
                });
            }

            console.log('Respuesta del servidor:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error del servidor:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();
            console.log('Resultado:', result);

            if (result.success) {
                console.log('Evento guardado exitosamente');

                // Recargar eventos y actualizar calendario
                await cargarEventos();

                // Resetear formulario y vista previa
                formCrearEvento.reset();
                const previewContainer = document.getElementById('preview-imagen');
                if (previewContainer) previewContainer.style.display = 'none';

                // Cerrar paneles
                cerrarPaneles();

                // Limpiar modo de edición
                if (isEditMode) {
                    delete formCrearEvento.dataset.editMode;
                    delete formCrearEvento.dataset.editId;
                }

                // Mostrar el toast
                const toast = document.getElementById('toast');
                if (toast) {
                    toast.textContent = `Evento "${titulo}" ${isEditMode ? 'actualizado' : 'creado'} con éxito`;
                    toast.classList.add('show');
                    setTimeout(() => {
                        toast.classList.remove('show');
                    }, 3000);
                }
            } else {
                console.error('El servidor respondió pero no fue exitoso');
                alert('Error: El servidor no pudo procesar la solicitud');
            }

        } catch (error) {
            console.error('Error completo:', error);
            alert(`Error al guardar el evento: ${error.message}`);
        }
    });

    // Event listeners para cerrar paneles
    const panelOverlay = document.getElementById('panelOverlay');
    const btnCerrarDetalle = document.getElementById('btnCerrarDetalle');
    
    btnCerrarDetalle?.addEventListener('click', cerrarPaneles);
    panelOverlay?.addEventListener('click', cerrarPaneles);
    
    // Event listeners para acciones de eventos
    document.getElementById('btnEditarEvento')?.addEventListener('click', () => {
        if (eventoActualSeleccionado) {
            const form = document.getElementById('formCrearEvento');
            if (form) {
                // Precargar formulario con datos del evento
                form.querySelector('[name="fecha"]').value = eventoActualSeleccionado.fecha;
                form.querySelector('[name="titulo"]').value = eventoActualSeleccionado.titulo;
                form.querySelector('[name="lugar"]').value = eventoActualSeleccionado.lugar || '';
                form.querySelector('[name="horaInicio"]').value = eventoActualSeleccionado.horaInicio || '';
                form.querySelector('[name="horaFin"]').value = eventoActualSeleccionado.horaFin || '';
                form.querySelector('[name="descripcion"]').value = eventoActualSeleccionado.descripcion || '';
                
                // Seleccionar la categoría correcta
                const colorRadios = form.querySelectorAll('[name="color"]');
                colorRadios.forEach(radio => {
                    radio.checked = radio.value === eventoActualSeleccionado.categoria;
                });
                
                // Cambiar a modo edición
                form.dataset.editMode = 'true';
                form.dataset.editId = eventoActualSeleccionado.id;
                
                // Cerrar panel de detalles y abrir formulario
                cerrarPaneles();
                setTimeout(() => {
                    document.getElementById('panelEventoFormulario')?.classList.add('open');
                    document.getElementById('panelOverlay')?.classList.add('active');
                }, 100);
            }
        }
    });
    
    // Duplicar evento
    document.getElementById('btnDuplicarEvento')?.addEventListener('click', async () => {
        if (eventoActualSeleccionado) {
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
                Imagen: eventoActualSeleccionado.imagen
            };
            
            try {
                const response = await fetch('http://localhost:3000/api/eventos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(eventoData)
                });
                
                if (response.ok) {
                    await cargarEventos();
                    cerrarPaneles();
                    
                    // Mostrar toast
                    const toast = document.getElementById('toast');
                    if (toast) {
                        toast.textContent = `Evento "${eventoActualSeleccionado.titulo}" duplicado con éxito`;
                        toast.classList.add('show');
                        setTimeout(() => toast.classList.remove('show'), 3000);
                    }
                }
            } catch (error) {
                console.error('Error duplicando evento:', error);
                alert('Error al duplicar el evento');
            }
        }
    });


    // Eliminar evento
    document.getElementById('btnEliminarEvento')?.addEventListener('click', async () => {
        if (eventoActualSeleccionado && confirm('¿Estás seguro de que quieres eliminar este evento?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/eventos/${eventoActualSeleccionado.id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    await cargarEventos();
                    cerrarPaneles();
                    
                    // Mostrar toast
                    const toast = document.getElementById('toast');
                    if (toast) {
                        toast.textContent = `Evento "${eventoActualSeleccionado.titulo}" eliminado con éxito`;
                        toast.classList.add('show');
                        setTimeout(() => toast.classList.remove('show'), 3000);
                    }
                }
            } catch (error) {
                console.error('Error eliminando evento:', error);
                alert('Error al eliminar el evento');
            }
        }
    });
    
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarPaneles();
            modal.style.display = 'none';
        }
    });
    
    // Inicializar calendario cargando eventos
    cargarEventos();

    // Inicializar iconos de Lucide después de cargar el DOM
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
        console.log('Iconos de Lucide inicializados');
    }

    // Debug: verificar que los botones existen
    console.log('Botón siguiente:', nextMonthBtn);
    console.log('Botón anterior:', previousMonthBtn);
});