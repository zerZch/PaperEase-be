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
    
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    
// Mapeo de categorías a colores - CORREGIDO
const coloresCategorias = {
    'Programa de Salud': '#c084fc',
    'Promoción Social': '#fde047',
    'default': '#007bff', // ✅ AGREGADO: Color por defecto
    // Puedes agregar más categorías aquí
    'programa de salud': '#c084fc', // ✅ AGREGADO: Versión en minúsculas
    'promoción social': '#fde047',  // ✅ AGREGADO: Versión en minúsculas
    'promocion social': '#fde047',  // ✅ AGREGADO: Sin tilde
};

// Función inversa: de color a nombre de categoría
function obtenerCategoriaPorColor(color) {
    for (const [categoria, hex] of Object.entries(coloresCategorias)) {
        if (hex === color && categoria !== 'default') return categoria;
    }
    return 'Sin categoría';
}

// Function to get color by category MEJORADA
function obtenerColorPorCategoria(categoria) {
    console.log('🎨 Categoria recibida:', categoria, 'Tipo:', typeof categoria);
    
    if (!categoria || typeof categoria !== 'string') {
        console.log('🎨 Usando color por defecto - categoria vacía o inválida');
        return coloresCategorias['default'];
    }

    const categoriaNormalizada = categoria.trim();
    console.log('🎨 Categoria normalizada:', categoriaNormalizada);

    // Si ya es un color hexadecimal válido
    if (/^#[0-9A-Fa-f]{6}$/.test(categoriaNormalizada)) {
        console.log('🎨 Es color hex válido:', categoriaNormalizada);
        return categoriaNormalizada;
    }

    // ✅ MEJORADO: Buscar con diferentes variaciones
    let colorEncontrado = null;
    
    // 1. Buscar exacto
    colorEncontrado = coloresCategorias[categoriaNormalizada];
    
    // 2. Si no encuentra, buscar en minúsculas
    if (!colorEncontrado) {
        colorEncontrado = coloresCategorias[categoriaNormalizada.toLowerCase()];
    }
    
    // 3. Si no encuentra, buscar sin tildes
    if (!colorEncontrado) {
        const sinTildes = categoriaNormalizada.toLowerCase()
            .replace(/á/g, 'a')
            .replace(/é/g, 'e')
            .replace(/í/g, 'i')
            .replace(/ó/g, 'o')
            .replace(/ú/g, 'u')
            .replace(/ñ/g, 'n');
        colorEncontrado = coloresCategorias[sinTildes];
    }
    
    // 4. Si aún no encuentra, usar default
    if (!colorEncontrado) {
        colorEncontrado = coloresCategorias['default'];
        console.log('⚠️ Categoria no encontrada, usando default para:', categoriaNormalizada);
    }
    
    console.log('🎨 Color final encontrado:', colorEncontrado);
    return colorEncontrado;
}

// ✅ NUEVA: Función para verificar y mostrar todas las categorías encontradas
function analizarCategoriasEnDatos(eventos) {
    console.log('📊 ANÁLISIS DE CATEGORÍAS EN LA BASE DE DATOS:');
    const categoriasEncontradas = new Set();
    
    eventos.forEach(ev => {
        const programa = ev.Programa || ev.programa || '';
        const categoria = ev.Categoria || ev.categoria || '';
        
        if (programa) categoriasEncontradas.add(programa);
        if (categoria) categoriasEncontradas.add(categoria);
    });
    
    console.log('📊 Categorías únicas encontradas:', Array.from(categoriasEncontradas));
    console.log('📊 Colores disponibles:', Object.keys(coloresCategorias));
    
    // Verificar cuáles no tienen color asignado
    Array.from(categoriasEncontradas).forEach(cat => {
        const color = obtenerColorPorCategoria(cat);
        const tieneColorEspecifico = color !== coloresCategorias['default'];
        console.log(`📊 "${cat}" → ${color} ${tieneColorEspecifico ? '✅' : '⚠️ (usando default)'}`);
    });
}
    let currentDate = new Date();
    let eventosPorDia = {};
    let eventoActualSeleccionado = null;

    // Event listeners para navegación del calendario
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    previousMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Event listeners para crear evento
    btnCrearEvento.addEventListener("click", () => {
        panelEvento.classList.add("open");
        document.getElementById('panelOverlay').classList.add('active');
    });

    btnCancelar.addEventListener("click", () => {
        cerrarPaneles();
    });

    // Event listener para el formulario - VERSIÓN CORREGIDA CON MEJOR MANEJO DE FECHAS
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
        
        console.log('Datos del formulario:', {
            fecha, titulo, lugar, horaInicio, horaFin, descripcion, color
        });
        
        // Validación básica
        if (!fecha || !titulo) {
            alert('Por favor completa la fecha y el título del evento');
            return;
        }
        
        // CORREGIDO: Parsear fecha correctamente
        const fechaParts = fecha.split('-'); // formato YYYY-MM-DD
        const year = parseInt(fechaParts[0]);
        const mes = parseInt(fechaParts[1]); // Ya viene en formato 1-12
        const dia = parseInt(fechaParts[2]);
        
        console.log('Fecha parseada CORREGIDA:', { dia, mes, year });
        
        // Preparar datos para enviar al backend
        const eventoData = {
            Titulo: titulo,
            Descripcion: descripcion || '',
            Lugar: lugar || '',
            HoraInicio: horaInicio || '',
            HoraFin: horaFin || '',
            Categoria: color || '',
            Dia: dia,
            Mes: mes, // Sin sumar 1 porque ya viene correcto del input date
            year: year,
            Facultad: null,
            Programa: null,
            Imagen: null
        };
        
        console.log('Datos a enviar CORREGIDOS:', eventoData);
        
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
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(eventoData)
                });
            } else {
                url = 'http://localhost:3000/api/eventos';
                console.log('Creando nuevo evento');
                
                response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(eventoData)
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
                if (typeof cargarEventos === 'function') {
                    await cargarEventos();
                }
                
                // Resetear formulario
                formCrearEvento.reset();
                
                // Cerrar paneles si existe la función
                if (typeof cerrarPaneles === 'function') {
                    cerrarPaneles();
                }
                
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
                } else {
                    alert(`Evento "${titulo}" ${isEditMode ? 'actualizado' : 'creado'} con éxito`);
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
    
    // Editar evento
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
                
                // Seleccionar el color correcto
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
                    document.getElementById('panelEventoFormulario').classList.add('open');
                    document.getElementById('panelOverlay').classList.add('active');
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
async function cargarEventos() {
    try {
        console.log('Cargando eventos...');
        const res = await fetch('http://localhost:3000/api/eventos');
        if (!res.ok) throw new Error('Error cargando eventos');
        const eventos = await res.json();
        console.log('Eventos recibidos:', eventos);

        // ✅ NUEVO: Analizar categorías antes de procesar
        analizarCategoriasEnDatos(eventos);

        eventosPorDia = {};

        eventos.forEach(ev => {
            console.log('--- Procesando evento:', ev.Titulo || ev.titulo);
            
            // Construir fecha
            const yearRaw = ev.year || ev.Year || ev.Año || new Date().getFullYear();
            const year = yearRaw.toString();
            const mes = (ev.Mes || ev.mes || 1).toString().padStart(2, '0');
            const dia = (ev.Dia || ev.dia || 1).toString().padStart(2, '0');
            const fechaKey = `${year}-${mes}-${dia}`;
            
            if (!eventosPorDia[fechaKey]) eventosPorDia[fechaKey] = [];

            // Obtener categoría/programa
            const programa = ev.Programa || ev.programa || '';
            const categoria = ev.Categoria || ev.categoria || '';
            
            // Usar categoría si existe, sino programa, sino default
            const categoriaFinal = categoria || programa || 'default';
            console.log('🏷️ Categoría final para colorear:', categoriaFinal);
            
            // Obtener color
            const colorEvento = obtenerColorPorCategoria(categoriaFinal);
            console.log('🎨 Color asignado:', colorEvento);

            // Obtener nombre legible
            const nombreCategoria = /^#[0-9A-Fa-f]{6}$/.test(categoriaFinal)
                ? obtenerCategoriaPorColor(categoriaFinal)
                : categoriaFinal;

            const eventoFormateado = {
                id: ev.Id_Eventos || ev.id,
                html: `
                    <strong>${ev.Titulo || ev.titulo}</strong><br>
                    ${ev.Descripcion ? `<em>${ev.Descripcion}</em><br>` : ''}
                    ${ev.HoraInicio ? `Hora: ${ev.HoraInicio}` : ''} ${ev.HoraFin ? `- ${ev.HoraFin}` : ''}<br>
                    ${ev.Lugar ? `Lugar: ${ev.Lugar}<br>` : ''}
                    ${programa ? `Programa: ${programa}<br>` : ''}
                    Categoría: ${nombreCategoria}
                `,
                color: colorEvento,
                titulo: ev.Titulo || ev.titulo,
                lugar: ev.Lugar || ev.lugar,
                horaInicio: ev.HoraInicio || ev.horaInicio,
                horaFin: ev.HoraFin || ev.horaFin,
                descripcion: ev.Descripcion || ev.descripcion,
                categoria: nombreCategoria,
                facultad: ev.Facultad || ev.facultad,
                programa: programa,
                imagen: ev.Imagen || ev.imagen,
                fecha: fechaKey
            };
            
            console.log('✅ Evento formateado con color:', {
                titulo: eventoFormateado.titulo,
                categoria: eventoFormateado.categoria,
                color: eventoFormateado.color
            });
            
            eventosPorDia[fechaKey].push(eventoFormateado);
        });

        console.log('📅 Eventos por día final:', eventosPorDia);
        renderCalendar(currentDate);
    } catch (error) {
        console.error('Error cargando eventos:', error);
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

    // Renderizar calendario MEJORADO - CORREGIDO
    function renderCalendar(date) {
        console.log('Renderizando calendario para:', date);
        console.log('Eventos disponibles:', eventosPorDia);
        
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
            console.log('Verificando fecha:', dateKey);
            
            li.innerHTML = `<div class="day-info"><h5>${day}</h5></div>`;

            // CORREGIDO: Mostrar indicadores de eventos
            if (eventosPorDia[dateKey] && eventosPorDia[dateKey].length > 0) {
                console.log('Eventos encontrados para', dateKey, ':', eventosPorDia[dateKey]);
                li.classList.add('eventos');

                // Crear contenedor para los puntos
                const markersContainer = document.createElement('div');
                markersContainer.className = 'event-markers-container';
                markersContainer.style.cssText = `
                    display: flex;
                    flex-wrap: wrap;
                    gap: 2px;
                    justify-content: center;
                    margin-top: 2px;
                    max-width: 100%;
                `;

                // Limitar a máximo 4 puntos visibles
                const eventosVisibles = eventosPorDia[dateKey].slice(0, 4);
                const eventosRestantes = eventosPorDia[dateKey].length - eventosVisibles.length;

                eventosVisibles.forEach(ev => {
                    console.log('Creando marcador para evento:', ev.titulo, 'Color:', ev.color);
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
                        flex-shrink: 0;
                    `;
                    markersContainer.appendChild(mark);
                });

                // Si hay más eventos, mostrar un indicador "+N"
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
                        flex-shrink: 0;
                    `;
                    markersContainer.appendChild(moreIndicator);
                }

                li.appendChild(markersContainer);
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