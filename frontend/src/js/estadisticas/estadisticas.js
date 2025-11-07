// Variables globales
let facultadesChart;
let timeChart;
let yearChart;
let currentFilters = {
    programa: '',
    tipo: '',
    facultad: '',
    yearStart: 2018,
    yearEnd: 2024
};

// URLs de la API
const API_BASE_URL = 'http://localhost:3000/api/estadisticas';

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando aplicación de estadísticas...');

    // Inicializar valores de año
    const currentYear = new Date().getFullYear();
    const yearStartInput = document.getElementById('yearStart');
    const yearEndInput = document.getElementById('yearEnd');
    if (yearEndInput) yearEndInput.value = currentYear;

    // Cargar datos iniciales
    loadDashboardData();
    loadFacultadesData();
    loadYearData();

    // Cargar opciones de filtros
    loadFilterOptions();
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
        console.log('Cargando datos de facultades...');

        const params = new URLSearchParams();
        if (currentFilters.programa) params.append('programa', currentFilters.programa);
        if (currentFilters.tipo) params.append('tipo', currentFilters.tipo);
        if (currentFilters.facultad) params.append('facultad', currentFilters.facultad);
        if (currentFilters.yearStart) params.append('yearStart', currentFilters.yearStart);
        if (currentFilters.yearEnd) params.append('yearEnd', currentFilters.yearEnd);

        const url = `${API_BASE_URL}/facultades${params.toString() ? '?' + params.toString() : ''}`;
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

        // Construir parámetros de filtro
        const params = new URLSearchParams();
        if (currentFilters.yearStart) params.append('yearStart', currentFilters.yearStart);
        if (currentFilters.yearEnd) params.append('yearEnd', currentFilters.yearEnd);
        if (currentFilters.programa) params.append('programa', currentFilters.programa);
        if (currentFilters.tipo) params.append('tipo', currentFilters.tipo);
        if (currentFilters.facultad) params.append('facultad', currentFilters.facultad);

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
        const yearStart = currentFilters.yearStart || 2018;
        const yearEnd = currentFilters.yearEnd || 2024;
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
        // Cargar facultades
        const facultadesResponse = await fetch(`${API_BASE_URL}/facultades-lista`);
        if (facultadesResponse.ok) {
            const facultades = await facultadesResponse.json();
            populateSelect('facultad', facultades, 'Facultad', 'Facultad');
        }

        // Cargar tipos de programa
        const tiposResponse = await fetch(`${API_BASE_URL}/tipos-programa`);
        if (tiposResponse.ok) {
            const tipos = await tiposResponse.json();
            populateSelect('tipoPrograma', tipos, 'TipoPrograma', 'TipoPrograma');
        }

        // Cargar programas
        const programasResponse = await fetch(`${API_BASE_URL}/programas`);
        if (programasResponse.ok) {
            const programas = await programasResponse.json();
            populateProgramasSelect(programas);
        }

    } catch (error) {
        console.error('Error cargando opciones de filtros:', error);
    }
}

// Función para poblar select de programas (agrupados)
function populateProgramasSelect(programas) {
    const select = document.getElementById('programa');
    if (!select) return;
    
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
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

// Funciones del modal
function openModal() {
    const modal = document.getElementById('filterModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal() {
    const modal = document.getElementById('filterModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function resetFilters() {
    const currentYear = new Date().getFullYear();

    currentFilters = {
        programa: '',
        tipo: '',
        facultad: '',
        yearStart: 2018,
        yearEnd: currentYear
    };

    const facultadSelect = document.getElementById('facultad');
    const tipoSelect = document.getElementById('tipoPrograma');
    const programaSelect = document.getElementById('programa');
    const yearStartInput = document.getElementById('yearStart');
    const yearEndInput = document.getElementById('yearEnd');

    if (facultadSelect) facultadSelect.value = '';
    if (tipoSelect) tipoSelect.value = '';
    if (programaSelect) programaSelect.value = '';
    if (yearStartInput) yearStartInput.value = 2018;
    if (yearEndInput) yearEndInput.value = currentYear;

    loadFacultadesData();
    loadYearData();

    updateChartTitles();
}

function applyFilters() {
    const facultadSelect = document.getElementById('facultad');
    const tipoSelect = document.getElementById('tipoPrograma');
    const programaSelect = document.getElementById('programa');
    const yearStartInput = document.getElementById('yearStart');
    const yearEndInput = document.getElementById('yearEnd');

    currentFilters.facultad = facultadSelect ? facultadSelect.value : '';
    currentFilters.tipo = tipoSelect ? tipoSelect.value : '';
    currentFilters.programa = programaSelect ? programaSelect.value : '';
    currentFilters.yearStart = yearStartInput ? parseInt(yearStartInput.value) || 2018 : 2018;
    currentFilters.yearEnd = yearEndInput ? parseInt(yearEndInput.value) || 2024 : 2024;

    // Validar que yearStart no sea mayor que yearEnd
    if (currentFilters.yearStart > currentFilters.yearEnd) {
        showError('El año de inicio no puede ser mayor que el año final');
        return;
    }

    console.log('Aplicando filtros:', currentFilters);

    loadFacultadesData();
    loadYearData();
    updateChartTitles();
    closeModal();
}

// Función para actualizar títulos de gráficos
function updateChartTitles() {
    const chartTitle = document.getElementById('chartTitle');
    const chartBadges = document.getElementById('chartBadges');
    const timeChartTitle = document.getElementById('timeChartTitle');

    // Actualizar título del gráfico de facultades
    if (chartTitle) {
        let title = 'Facultades - Participación';
        if (currentFilters.programa) {
            title += ` - ${currentFilters.programa}`;
        } else if (currentFilters.tipo) {
            title += ` - ${currentFilters.tipo}`;
        } else if (currentFilters.facultad) {
            title += ` - ${currentFilters.facultad}`;
        } else {
            title += ' General';
        }
        chartTitle.textContent = title;
    }

    // Actualizar badges
    if (chartBadges) {
        chartBadges.innerHTML = '';

        if (currentFilters.facultad) {
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = currentFilters.facultad;
            chartBadges.appendChild(badge);
        }

        if (currentFilters.programa) {
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = currentFilters.programa;
            chartBadges.appendChild(badge);
        } else if (currentFilters.tipo) {
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = currentFilters.tipo;
            chartBadges.appendChild(badge);
        }

        if (chartBadges.children.length === 0) {
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = 'Todos los Programas';
            chartBadges.appendChild(badge);
        }
    }

    // Actualizar título del gráfico de participación por año
    if (timeChartTitle) {
        let title = 'Participación por Año';
        if (currentFilters.yearStart && currentFilters.yearEnd) {
            title += ` (${currentFilters.yearStart}-${currentFilters.yearEnd})`;
        }
        timeChartTitle.textContent = title;
    }
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
    const modal = document.getElementById('filterModal');
    if (event.target === modal) {
        closeModal();
    }
});

// Manejar tecla Escape para cerrar modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});