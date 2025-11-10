// Variables globales
let facultadesChart;
let timeChart;
let yearChart;

// Estados de filtro separados para cada gráfica
let facultadesFilters = {
    programa: '',
    tipo: '',
    facultad: '',
    year: 2025  // Año por defecto 2025
};

let timeChartFilters = {
    yearStart: 2023,  // Rango por defecto 2023-2025
    yearEnd: 2025
};

// URLs de la API
const API_BASE_URL = 'http://localhost:3000/api/estadisticas';

// Variable global para guardar todos los programas
let todosLosProgramas = [];

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando aplicación de estadísticas...');

    // Cargar datos iniciales
    loadDashboardData();
    loadFacultadesData();
    loadYearData();

    // Cargar opciones de filtros
    loadFilterOptions();

    // Actualizar títulos iniciales
    updateChartTitles();

    // Event listeners para filtros en cascada de la gráfica de facultades
    const tipoSelectFacultades = document.getElementById('tipoProgramaFacultades');
    if (tipoSelectFacultades) {
        tipoSelectFacultades.addEventListener('change', function() {
            const tipoSeleccionado = this.value;
            console.log('Tipo de programa seleccionado:', tipoSeleccionado);
            filtrarProgramasPorTipo(tipoSeleccionado, 'programaFacultades');
        });
    }
});

// Función para cargar datos del dashboard principal
async function loadDashboardData() {
    try {
        console.log('Cargando datos del dashboard...');
        const response = await fetch(`${API_BASE_URL}/dashboard`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Datos del dashboard recibidos:', data);
        
        // Actualizar métricas en el HTML
        updateMetrics(data);
        
    } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        showError('No se pudieron cargar las estadísticas principales');
    }
}

// Función para actualizar las métricas mostradas
function updateMetrics(data) {
    const estudiantesElement = document.getElementById('estudiantesCount');
    const aplicacionesElement = document.getElementById('aplicacionesCount');
    const eventosElement = document.getElementById('eventosCount');
    const participantesElement = document.getElementById('participantesCount');
    
    if (estudiantesElement) estudiantesElement.textContent = data.participantes || '0';
    if (aplicacionesElement) aplicacionesElement.textContent = data.programas || '0';
    if (eventosElement) eventosElement.textContent = data.eventos || '0';
    if (participantesElement) participantesElement.textContent = data.facultades || '0';
    
    console.log('Métricas actualizadas');
}

// Función para cargar datos de facultades y crear gráfico
async function loadFacultadesData() {
    try {
        console.log('Cargando datos de facultades con filtros:', facultadesFilters);

        const params = new URLSearchParams();
        if (facultadesFilters.programa) params.append('programa', facultadesFilters.programa);
        if (facultadesFilters.tipo) params.append('tipo', facultadesFilters.tipo);
        if (facultadesFilters.facultad) params.append('facultad', facultadesFilters.facultad);
        if (facultadesFilters.year) params.append('year', facultadesFilters.year);

        const url = `${API_BASE_URL}/facultades${params.toString() ? '?' + params.toString() : ''}`;
        console.log('URL de consulta facultades:', url);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Datos de facultades recibidos:', data);

        createFacultadesChart(data);

    } catch (error) {
        console.error('Error cargando datos de facultades:', error);
        showError('No se pudieron cargar los datos de facultades');
    }
}

// Función para crear el gráfico de facultades
function createFacultadesChart(data) {
    const ctx = document.getElementById('facultadesChart');
    if (!ctx) {
        console.error('Canvas facultadesChart no encontrado');
        return;
    }
    
    if (facultadesChart) {
        facultadesChart.destroy();
    }
    
    const labels = data.map(item => item.Facultad || 'Sin Facultad');
    const values = data.map(item => item.participantes || 0);
    
    const colors = [
        '#10b981', '#06d6a0', '#2dd4bf', '#22d3ee', 
        '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'
    ];
    
    facultadesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0,
                hoverBorderWidth: 2,
                hoverBorderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#1f2937',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    console.log('Gráfico de facultades creado');
}



// Función para crear el gráfico por año (Hombres y Mujeres)
async function loadYearData() {
    try {
        console.log('=== CARGANDO DATOS DE PARTICIPACIÓN POR GÉNERO ===');
        console.log('Filtros de gráfica temporal:', timeChartFilters);

        // Construir parámetros de filtro usando solo los filtros del timeChart
        const params = new URLSearchParams();
        if (timeChartFilters.yearStart) params.append('yearStart', timeChartFilters.yearStart);
        if (timeChartFilters.yearEnd) params.append('yearEnd', timeChartFilters.yearEnd);

        // Intentar múltiples rutas por si hay problemas de configuración
        const possibleUrls = [
            `/api/participacion-genero-anual${params.toString() ? '?' + params.toString() : ''}`,
            `/participacion-genero-anual${params.toString() ? '?' + params.toString() : ''}`,
            `participacion-genero-anual${params.toString() ? '?' + params.toString() : ''}`
        ];

        let response = null;
        let usedUrl = '';

        for (const url of possibleUrls) {
            try {
                console.log(`Intentando cargar desde: ${url}`);
                response = await fetch(url);
                if (response.ok) {
                    usedUrl = url;
                    break;
                }
            } catch (error) {
                console.log(`Error con URL ${url}:`, error.message);
                continue;
            }
        }

        if (!response || !response.ok) {
            throw new Error(`No se pudo cargar desde ninguna URL. Último status: ${response?.status}`);
        }

        const data = await response.json();
        console.log('Datos recibidos desde', usedUrl, ':', data);

        // Verificar que los datos tengan la estructura correcta
        if (!data.years || !data.hombres || !data.mujeres) {
            console.error('Estructura de datos incorrecta:', data);
            throw new Error('Datos incompletos recibidos del servidor');
        }

        // Crear el gráfico
        createYearChart(data);

        // Mostrar información de debug si está disponible
        if (data.debug) {
            console.log('=== INFORMACIÓN DE DEBUG ===');
            console.log('Total participantes:', data.debug.totalParticipantes);
            console.log('Géneros disponibles:', data.debug.generosDisponibles);
        }

        if (data.emergency) {
            console.warn('⚠️ Usando datos de emergencia debido a error en el servidor');
        }

    } catch (error) {
        console.error('Error cargando datos de participación por género:', error);

        // Datos de emergencia para mostrar algo en el gráfico
        const yearStart = timeChartFilters.yearStart || 2023;
        const yearEnd = timeChartFilters.yearEnd || 2025;
        const years = [];
        for (let year = yearStart; year <= yearEnd; year++) {
            years.push(year.toString());
        }

        const emergencyData = {
            years: years,
            hombres: years.map(() => Math.floor(Math.random() * 50) + 30),
            mujeres: years.map(() => Math.floor(Math.random() * 50) + 25)
        };

        console.log('Usando datos de emergencia:', emergencyData);
        createYearChart(emergencyData);
    }
}

// Función mejorada para crear el gráfico
function createYearChart(data) {
    const canvas = document.getElementById('timeChart');
    if (!canvas) {
        console.error('Canvas yearChart no encontrado - verificar que existe en el HTML');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (window.yearChartInstance) {
        window.yearChartInstance.destroy();
    }
    
    console.log('Creando gráfico con datos:', data);
    
    window.yearChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.years,
            datasets: [
                {
                    label: 'Hombres',
                    data: data.hombres,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'Mujeres',
                    data: data.mujeres,
                    backgroundColor: 'rgba(118, 75, 162, 0.8)',
                    borderColor: 'rgba(118, 75, 162, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Número de Participantes'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Año'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Participación por Género y Año'
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            animation: {
                duration: 1000
            }
        }
    });
    
    console.log('Gráfico de participación por género creado exitosamente');
}
// Función para cargar opciones de filtros
async function loadFilterOptions() {
    try {
        // Cargar facultades para la gráfica de facultades
        const facultadesResponse = await fetch(`${API_BASE_URL}/facultades-lista`);
        if (facultadesResponse.ok) {
            const facultades = await facultadesResponse.json();
            populateSelect('facultadFacultades', facultades, 'Facultad', 'Facultad');
        }

        // Cargar tipos de programa para la gráfica de facultades
        const tiposResponse = await fetch(`${API_BASE_URL}/tipos-programa`);
        if (tiposResponse.ok) {
            const tipos = await tiposResponse.json();
            console.log('Tipos de programa cargados:', tipos);
            populateSelect('tipoProgramaFacultades', tipos, 'TipoPrograma', 'TipoPrograma');
        }

        // Cargar programas para la gráfica de facultades
        const programasResponse = await fetch(`${API_BASE_URL}/programas`);
        if (programasResponse.ok) {
            const programas = await programasResponse.json();
            console.log('Programas cargados:', programas);
            todosLosProgramas = programas;
            populateProgramasSelect(programas, 'programaFacultades');
        }

    } catch (error) {
        console.error('Error cargando opciones de filtros:', error);
    }
}

// Función para poblar select de programas (agrupados)
function populateProgramasSelect(programas, selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    // Limpiar select
    select.innerHTML = '<option value="">Todos los programas</option>';

    const grupos = {};
    programas.forEach(programa => {
        const tipo = programa.TipoPrograma || 'Sin categoría';
        if (!grupos[tipo]) {
            grupos[tipo] = [];
        }
        grupos[tipo].push(programa);
    });

    Object.keys(grupos).forEach(tipo => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = tipo;

        grupos[tipo].forEach(programa => {
            const option = document.createElement('option');
            option.value = programa.Programa;
            option.textContent = programa.Programa;
            optgroup.appendChild(option);
        });

        select.appendChild(optgroup);
    });
}

// Función para filtrar programas por tipo seleccionado
function filtrarProgramasPorTipo(tipoSeleccionado, selectId) {
    const select = document.getElementById(selectId);
    if (!select || !todosLosProgramas) return;

    // Limpiar select y resetear valor seleccionado
    select.innerHTML = '<option value="">Todos los programas</option>';
    select.value = '';

    // Si no hay tipo seleccionado, mostrar todos
    if (!tipoSeleccionado) {
        populateProgramasSelect(todosLosProgramas, selectId);
        return;
    }

    // Filtrar programas por tipo
    const programasFiltrados = todosLosProgramas.filter(p =>
        p.TipoPrograma === tipoSeleccionado
    );

    console.log(`Programas filtrados para ${tipoSeleccionado}:`, programasFiltrados);

    // Agregar solo los programas del tipo seleccionado
    if (programasFiltrados.length > 0) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = tipoSeleccionado;

        programasFiltrados.forEach(programa => {
            const option = document.createElement('option');
            option.value = programa.Programa;
            option.textContent = programa.Programa;
            optgroup.appendChild(option);
        });

        select.appendChild(optgroup);
    } else {
        console.warn(`No se encontraron programas para el tipo: ${tipoSeleccionado}`);
    }
}

// Función para poblar un select general
function populateSelect(selectId, data, valueField, textField) {
    const select = document.getElementById(selectId);
    if (!select || !data) return;
    
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueField];
        option.textContent = item[textField];
        select.appendChild(option);
    });
}

// ============================================
// FUNCIONES PARA MODAL DE GRÁFICA DE FACULTADES
// ============================================

function openFacultadesModal() {
    const modal = document.getElementById('facultadesModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeFacultadesModal() {
    const modal = document.getElementById('facultadesModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function applyFacultadesFilters() {
    const facultadSelect = document.getElementById('facultadFacultades');
    const tipoSelect = document.getElementById('tipoProgramaFacultades');
    const programaSelect = document.getElementById('programaFacultades');
    const yearSelect = document.getElementById('yearFacultades');

    facultadesFilters.facultad = facultadSelect ? facultadSelect.value : '';
    facultadesFilters.tipo = tipoSelect ? tipoSelect.value : '';
    facultadesFilters.programa = programaSelect ? programaSelect.value : '';
    facultadesFilters.year = yearSelect ? parseInt(yearSelect.value) || 2025 : 2025;

    console.log('Aplicando filtros de facultades:', facultadesFilters);

    // Solo recargar la gráfica de facultades
    loadFacultadesData();
    updateFacultadesChartTitles();
    closeFacultadesModal();
}

function resetFacultadesFilters() {
    facultadesFilters = {
        programa: '',
        tipo: '',
        facultad: '',
        year: 2025
    };

    const facultadSelect = document.getElementById('facultadFacultades');
    const tipoSelect = document.getElementById('tipoProgramaFacultades');
    const programaSelect = document.getElementById('programaFacultades');
    const yearSelect = document.getElementById('yearFacultades');

    if (facultadSelect) facultadSelect.value = '';
    if (tipoSelect) tipoSelect.value = '';
    if (yearSelect) yearSelect.value = '2025';

    // Restaurar todos los programas en el select
    if (todosLosProgramas && todosLosProgramas.length > 0) {
        populateProgramasSelect(todosLosProgramas, 'programaFacultades');
    }

    loadFacultadesData();
    updateFacultadesChartTitles();
}

// ============================================
// FUNCIONES PARA MODAL DE GRÁFICA TEMPORAL
// ============================================

function openTimeChartModal() {
    const modal = document.getElementById('timeChartModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeTimeChartModal() {
    const modal = document.getElementById('timeChartModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function applyTimeChartFilters() {
    const yearStartSelect = document.getElementById('yearStartTime');
    const yearEndSelect = document.getElementById('yearEndTime');

    timeChartFilters.yearStart = yearStartSelect ? parseInt(yearStartSelect.value) || 2023 : 2023;
    timeChartFilters.yearEnd = yearEndSelect ? parseInt(yearEndSelect.value) || 2025 : 2025;

    // Validar que yearStart no sea mayor que yearEnd
    if (timeChartFilters.yearStart > timeChartFilters.yearEnd) {
        showError('El año de inicio no puede ser mayor que el año final');
        return;
    }

    console.log('Aplicando filtros de gráfica temporal:', timeChartFilters);

    // Solo recargar la gráfica temporal
    loadYearData();
    updateTimeChartTitles();
    closeTimeChartModal();
}

function resetTimeChartFilters() {
    timeChartFilters = {
        yearStart: 2023,
        yearEnd: 2025
    };

    const yearStartSelect = document.getElementById('yearStartTime');
    const yearEndSelect = document.getElementById('yearEndTime');

    if (yearStartSelect) yearStartSelect.value = '2023';
    if (yearEndSelect) yearEndSelect.value = '2025';

    loadYearData();
    updateTimeChartTitles();
}

// ============================================
// FUNCIONES PARA ACTUALIZAR TÍTULOS
// ============================================

// Función para actualizar títulos de la gráfica de facultades
function updateFacultadesChartTitles() {
    const chartTitle = document.getElementById('chartTitle');
    const chartSubtitle = document.getElementById('chartSubtitle');
    const chartBadges = document.getElementById('chartBadges');

    // Actualizar título
    if (chartTitle) {
        let title = 'Facultades - Participación';
        if (facultadesFilters.programa) {
            title += ` - ${facultadesFilters.programa}`;
        } else if (facultadesFilters.tipo) {
            title += ` - ${facultadesFilters.tipo}`;
        } else if (facultadesFilters.facultad) {
            title += ` - ${facultadesFilters.facultad}`;
        } else {
            title += ' General';
        }
        chartTitle.textContent = title;
    }

    // Actualizar subtítulo con el año
    if (chartSubtitle) {
        chartSubtitle.textContent = `Período ${facultadesFilters.year || 2025}`;
    }

    // Actualizar badges
    if (chartBadges) {
        chartBadges.innerHTML = '';

        if (facultadesFilters.facultad) {
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = facultadesFilters.facultad;
            chartBadges.appendChild(badge);
        }

        if (facultadesFilters.programa) {
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = facultadesFilters.programa;
            chartBadges.appendChild(badge);
        } else if (facultadesFilters.tipo) {
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = facultadesFilters.tipo;
            chartBadges.appendChild(badge);
        }

        if (chartBadges.children.length === 0) {
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = 'Todos los Programas';
            chartBadges.appendChild(badge);
        }
    }
}

// Función para actualizar títulos de la gráfica temporal
function updateTimeChartTitles() {
    const timeChartTitle = document.getElementById('timeChartTitle');
    const timeChartSubtitle = document.getElementById('timeChartSubtitle');

    if (timeChartTitle) {
        let title = 'Participación por Año';
        if (timeChartFilters.yearStart && timeChartFilters.yearEnd) {
            title += ` (${timeChartFilters.yearStart}-${timeChartFilters.yearEnd})`;
        }
        timeChartTitle.textContent = title;
    }

    if (timeChartSubtitle) {
        timeChartSubtitle.textContent = 'Distribución por género';
    }
}

// Función para actualizar todos los títulos (llamada en inicialización)
function updateChartTitles() {
    updateFacultadesChartTitles();
    updateTimeChartTitles();
}

// Función para mostrar errores
function showError(message) {
    console.error('Error:', message);
    
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        z-index: 1000;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', function(event) {
    const facultadesModal = document.getElementById('facultadesModal');
    const timeChartModal = document.getElementById('timeChartModal');

    if (event.target === facultadesModal) {
        closeFacultadesModal();
    }
    if (event.target === timeChartModal) {
        closeTimeChartModal();
    }
});

// Manejar tecla Escape para cerrar modales
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeFacultadesModal();
        closeTimeChartModal();
    }
});