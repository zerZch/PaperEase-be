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
};

// Función para obtener color por categoría
function obtenerColorPorCategoria(categoria) {
    return coloresCategorias[categoria] || coloresCategorias['Promoción Social'];
}

// Función para formatear fecha
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

// Función para cerrar paneles
function cerrarPaneles() {
    const panelOverlay = document.getElementById('panelOverlay');
    const panelDetalle = document.getElementById('panelEventoDetalle');
    const panelFormulario = document.getElementById('panelEventoFormulario');
    
    panelOverlay?.classList.remove('active');
    panelDetalle?.classList.remove('open');
    panelFormulario?.classList.remove('open');
    
    // Limpiar datos de edición
    if (formCrearEvento) {
        delete formCrearEvento.dataset.editMode;
        delete formCrearEvento.dataset.editId;
    }
}

// Función para mostrar detalles del evento
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
    
    if (eventoTitulo) eventoTitulo.textContent = evento.titulo;
    if (eventoFecha) eventoFecha.textContent = formatearFecha(fecha);
    if (eventoHorario) eventoHorario.textContent = `${evento.horaInicio || ''} - ${evento.horaFin || ''}`;
    if (eventoLugar) eventoLugar.textContent = evento.lugar || 'Sin especificar';
    if (eventoDescripcion) eventoDescripcion.textContent = evento.descripcion || 'Sin descripción';
    if (eventoCategoria) eventoCategoria.style.backgroundColor = evento.color;
    if (eventoCategoriaTexto) eventoCategoriaTexto.textContent = evento.categoria || 'Sin categoría';
    
    // Mostrar panel
    const panelOverlay = document.getElementById('panelOverlay');
    const panelEventoDetalle = document.getElementById('panelEventoDetalle');
    
    if (panelOverlay && panelEventoDetalle) {
        panelOverlay.classList.add('active');
        panelEventoDetalle.classList.add('open');
    }
    
    // Cerrar modal del calendario si está abierto
    if (modal) {
        modal.style.display = 'none';
    }
}

// Función para renderizar el calendario
function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const diasEnMes = new Date(year, month + 1, 0).getDate();
    
    monthTitle.textContent = `${meses[month]} ${year}`;
    calendarDaysContainer.innerHTML = '';
    
    // Ajustar para semana que comienza en lunes
    const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    
    // Días vacíos al inicio
    for (let i = 0; i < offset; i++) {
        const empty = document.createElement('li');
        empty.classList.add('calendar-day');
        calendarDaysContainer.appendChild(empty);
    }
    
    // Días del mes
    for (let day = 1; day <= diasEnMes; day++) {
        const li = document.createElement('li');
        li.classList.add('calendar-day');
        li.dataset.day = day;
        
        const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        // Crear estructura del día
        const dayInfo = document.createElement('div');
        dayInfo.className = 'day-info';
        dayInfo.innerHTML = `<h5>${day}</h5>`;
        li.appendChild(dayInfo);
        
        // Agregar marcadores de eventos
        if (eventosPorDia[dateKey]) {
            li.classList.add('eventos');
            
            eventosPorDia[dateKey].forEach(ev => {
                const mark = document.createElement('span');
                mark.className = 'event-marker';
                mark.style.backgroundColor = ev.color;
                mark.title = ev.titulo;
                li.appendChild(mark);
            });
        }
        
        // Event listener para el día
        li.addEventListener('click', () => {
            const eventos = eventosPorDia[dateKey] || [];
            fechaActualSeleccionada = dateKey;
            
            if (eventos.length === 1) {
                // Si solo hay un evento, mostrar directamente los detalles
                mostrarDetalleEvento(eventos[0], dateKey, 0);
            } else if (eventos.length > 1) {
                // Si hay múltiples eventos, mostrar modal para seleccionar
                listaEventos.innerHTML = '';
                eventos.forEach((evento, index) => {
                    const li = document.createElement('li');
                    li.style.cssText = `
                        border-left: 4px solid ${evento.color}; 
                        padding: 8px; 
                        margin-bottom: 8px; 
                        cursor: pointer;
                        border-radius: 4px;
                        transition: background-color 0.2s;
                    `;
                    li.innerHTML = `
                        <strong>${evento.titulo}</strong><br>
                        ${evento.descripcion ? `<em>${evento.descripcion}</em><br>` : ''}
                        ${evento.horaInicio ? `Hora: ${evento.horaInicio}` : ''} ${evento.horaFin ? `- ${evento.horaFin}` : ''}<br>
                        ${evento.lugar ? `Lugar: ${evento.lugar}<br>` : ''}
                        Categoría: ${evento.categoria || 'N/A'}
                    `;
                    
                    li.addEventListener('click', () => {
                        mostrarDetalleEvento(evento, dateKey, index);
                    });
                    
                    li.addEventListener('mouseenter', () => {
                        li.style.backgroundColor = 'rgba(0,0,0,0.1)';
                    });
                    
                    li.addEventListener('mouseleave', () => {
                        li.style.backgroundColor = 'transparent';
                    });
                    
                    listaEventos.appendChild(li);
                });
                modal.style.display = 'flex';
            } else {
                // No hay eventos
                listaEventos.innerHTML = '<li>No hay eventos programados para este día.</li>';
                modal.style.display = 'flex';
            }
        });
        
        calendarDaysContainer.appendChild(li);
    }
}

// Función para cargar eventos desde el backend
async function cargarEventos() {
    try {
        console.log('Cargando eventos desde el backend...');
        const res = await fetch('http://localhost:3000/api/eventos');
        
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        
        const eventos = await res.json();
        console.log('Eventos cargados:', eventos);

        // Limpiar eventos existentes
        eventosPorDia = {};

        // Procesar eventos de la base de datos
        eventos.forEach(ev => {
            const yearRaw = ev.year || ev.Year || ev.Año || '2025';
            const year = yearRaw.toString().padStart(4, '0');
            const mes = ev.Mes.toString().padStart(2, '0');
            const dia = ev.Dia.toString().padStart(2, '0');
            const fechaKey = `${year}-${mes}-${dia}`;

            if (!eventosPorDia[fechaKey]) eventosPorDia[fechaKey] = [];

            // Obtener color basado en la categoría
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

        console.log('Eventos procesados:', eventosPorDia);
        renderCalendar(currentDate);
        
    } catch (error) {
        console.error('Error cargando eventos:', error);
        
        // Mostrar mensaje de error al usuario
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
    console.log('DOM cargado, inicializando eventos...');
    
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
    
    // Verificar que los elementos existen
    if (!modal || !calendarDaysContainer || !monthTitle) {
        console.error('Error: Elementos del DOM no encontrados');
        return;
    }
    
    // Event listeners para navegación del calendario
    nextMonthBtn?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    previousMonthBtn?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    // Event listeners para el modal
    closeModal?.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Event listeners para crear evento
    btnCrearEvento?.addEventListener("click", () => {
        panelEvento?.classList.add("open");
        document.getElementById('panelOverlay')?.classList.add('active');
    });

    btnCancelar?.addEventListener("click", cerrarPaneles);

    // Event listener para el formulario
    formCrearEvento?.addEventListener('submit', async (e) => {
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
        const categoria = formData.get('color'); // Ahora es la categoría
        
        // Validación básica
        if (!fecha || !titulo) {
            alert('Por favor completa la fecha y el título del evento');
            return;
        }
        
        // Parsear fecha
        const fechaObj = new Date(fecha);
        const dia = fechaObj.getDate();
        const mes = fechaObj.getMonth() + 1;
        const year = fechaObj.getFullYear();
        
        // Preparar datos para enviar al backend
        const eventoData = {
            Titulo: titulo,
            Descripcion: descripcion || '',
            Lugar: lugar || '',
            HoraInicio: horaInicio || '',
            HoraFin: horaFin || '',
            Categoria: categoria || 'Promoción Social',
            Dia: dia,
            Mes: mes,
            year: year,
            Facultad: null,
            Programa: null,
            Imagen: null
        };
        
        try {
            const isEditMode = formCrearEvento.dataset.editMode === 'true';
            let response;
            
            if (isEditMode) {
                // Actualizar evento existente
                const eventId = formCrearEvento.dataset.editId;
                response = await fetch(`http://localhost:3000/api/eventos/${eventId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventoData)
                });
            } else {
                // Crear nuevo evento
                response = await fetch('http://localhost:3000/api/eventos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventoData)
                });
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // Recargar eventos y actualizar calendario
                await cargarEventos();
                
                // Resetear formulario
                formCrearEvento.reset();
                cerrarPaneles();
                
                // Mostrar toast
                mostrarToast(`Evento "${titulo}" ${isEditMode ? 'actualizado' : 'creado'} con éxito`);
            } else {
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

    // Cargar eventos desde backend
    async function cargarEventos() {
        try {
            const res = await fetch('http://localhost:3000/api/eventos');
            if (!res.ok) throw new Error('Error cargando eventos');
            const eventos = await res.json();

            eventosPorDia = {};

            // Procesar eventos de la base de datos
            eventos.forEach(ev => {
                // Usar el año correcto del campo 'year'
                const yearRaw = ev.year || ev.Year || ev.Año || '2025';
                const year = yearRaw.toString().padStart(4, '0');
                const mes = ev.Mes.toString().padStart(2, '0');
                const dia = ev.Dia.toString().padStart(2, '0');
                const fechaKey = `${year}-${mes}-${dia}`;

                if (!eventosPorDia[fechaKey]) eventosPorDia[fechaKey] = [];

                // Obtener color basado en la categoría
                const colorEvento = obtenerColorPorCategoria(ev.Categoria);

                eventosPorDia[fechaKey].push({
                    id: ev.Id_Eventos,
                    html: `${ev.Titulo} – ${ev.HoraInicio || ''} a ${ev.HoraFin || ''}<br>${ev.Lugar || ''}<br>${ev.Descripcion || ''}`,
                    color: colorEvento,
                    titulo: ev.Titulo,
                    lugar: ev.Lugar,
                    horaInicio: ev.HoraInicio,
                    horaFin: ev.HoraFin,
                    descripcion: ev.Descripcion,
                    categoria: ev.Categoria,
                    facultad: ev.Facultad,
                    programa: ev.Programa,
                    imagen: ev.Imagen,
                    fecha: fechaKey
                });
            });

            renderCalendar(currentDate);
        } catch (error) {
            console.error('Error cargando eventos:', error);
            // Mostrar mensaje de error al usuario
            const toast = document.getElementById('toast');
            if (toast) {
                toast.textContent = 'Error cargando eventos. Verifica la conexión al servidor.';
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 5000);
            }
        }
    }

    // Función para formatear fecha
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

    // Función para mostrar detalles del evento
    function mostrarDetalleEvento(evento, fecha, index = 0) {
        eventoActualSeleccionado = { ...evento, index, fecha };
        
        // Actualizar contenido del panel si existe
        const eventoTitulo = document.getElementById('eventoTitulo');
        const eventoFecha = document.getElementById('eventoFecha');
        const eventoHorario = document.getElementById('eventoHorario');
        const eventoLugar = document.getElementById('eventoLugar');
        const eventoDescripcion = document.getElementById('eventoDescripcion');
        const eventoCategoria = document.getElementById('eventoCategoria');
        
        if (eventoTitulo) eventoTitulo.textContent = evento.titulo;
        if (eventoFecha) eventoFecha.textContent = formatearFecha(fecha);
        if (eventoHorario) eventoHorario.textContent = `${evento.horaInicio || ''} - ${evento.horaFin || ''}`;
        if (eventoLugar) eventoLugar.textContent = evento.lugar || 'Sin especificar';
        if (eventoDescripcion) eventoDescripcion.textContent = evento.descripcion || 'Sin descripción';
        if (eventoCategoria) eventoCategoria.style.backgroundColor = evento.color;
        
        // Mostrar panel si existe
        const panelOverlay = document.getElementById('panelOverlay');
        const panelEventoDetalle = document.getElementById('panelEventoDetalle');
        
        if (panelOverlay && panelEventoDetalle) {
            panelOverlay.classList.add('active');
            panelEventoDetalle.classList.add('open');
        }
        
        // Cerrar modal del calendario si está abierto
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Función para cerrar paneles
    function cerrarPaneles() {
        const panelOverlay = document.getElementById('panelOverlay');
        const panelDetalle = document.getElementById('panelEventoDetalle');
        const panelFormulario = document.getElementById('panelEventoFormulario');
        
        panelOverlay?.classList.remove('active');
        panelDetalle?.classList.remove('open');
        panelFormulario?.classList.remove('open');
        
        // Limpiar datos de edición
        if (formCrearEvento) {
            delete formCrearEvento.dataset.editMode;
            delete formCrearEvento.dataset.editId;
        }
    }

    // Renderizar calendario
    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDayIndex = new Date(year, month, 1).getDay();
        const diasEnMes = new Date(year, month + 1, 0).getDate();

        monthTitle.textContent = `${meses[month]} ${year}`;
        calendarDaysContainer.innerHTML = '';

        // Ajustar para semana que comienza en lunes
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

            if (eventosPorDia[dateKey]) {
    li.classList.add('eventos');

    eventosPorDia[dateKey].forEach(ev => {
        const mark = document.createElement('span');
        mark.className = 'event-marker';
        mark.style.backgroundColor = ev.color;
        li.appendChild(mark);
    });
}

            li.addEventListener('click', () => {
                const eventos = eventosPorDia[dateKey] || [];

                if (eventos.length === 1) {
                    // Si solo hay un evento, mostrar directamente los detalles
                    mostrarDetalleEvento(eventos[0], dateKey, 0);
                } else if (eventos.length > 1) {
                    // Si hay múltiples eventos, mostrar modal para seleccionar
                    listaEventos.innerHTML = '';
                    eventos.forEach((evento, index) => {
                        const li = document.createElement('li');
                        li.style.cssText = `
                            border-left: 4px solid ${evento.color}; 
                            padding: 8px; 
                            margin-bottom: 8px; 
                            cursor: pointer;
                            border-radius: 4px;
                            transition: background-color 0.2s;
                        `;
                        li.innerHTML = `
                            <strong>${evento.titulo}</strong><br>
                            ${evento.descripcion ? `<em>${evento.descripcion}</em><br>` : ''}
                            ${evento.horaInicio ? `Hora: ${evento.horaInicio}` : ''} ${evento.horaFin ? `- ${evento.horaFin}` : ''}<br>
                            ${evento.lugar ? `Lugar: ${evento.lugar}<br>` : ''}
                            Categoría: ${evento.categoria || 'N/A'}
                        `;
                        
                        li.addEventListener('click', () => {
                            mostrarDetalleEvento(evento, dateKey, index);
                        });
                        
                        li.addEventListener('mouseenter', () => {
                            li.style.backgroundColor = 'rgba(0,0,0,0.1)';
                        });
                        
                        li.addEventListener('mouseleave', () => {
                            li.style.backgroundColor = 'transparent';
                        });
                        
                        listaEventos.appendChild(li);
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

    // Inicializar calendario cargando eventos
    cargarEventos();
});