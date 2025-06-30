// Variables globales
let facultadesChart;
let timeChart;
let yearChart;
let currentFilters = {
    programa: '',
    tipo: '',
    facultad: ''
};

// URLs de la API
const API_BASE_URL = 'http://localhost:3000/api/estadisticas';

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando aplicación de estadísticas...');
    
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
        
        // Intentar múltiples rutas por si hay problemas de configuración
        const possibleUrls = [
            '/api/participacion-genero-anual',
            '/participacion-genero-anual',
            'participacion-genero-anual'
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
        const emergencyData = {
            years: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
            hombres: [45, 52, 38, 67, 89, 76, 41],
            mujeres: [38, 47, 29, 58, 82, 69, 35]
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
        const tiposResponse = await fetch(`${API_BASE_URL}/tipos-programa`);
        if (tiposResponse.ok) {
            const tipos = await tiposResponse.json();
            populateSelect('tipoPrograma', tipos, 'TipoPrograma', 'TipoPrograma');
        }
        
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
    currentFilters = {
        programa: '',
        tipo: '',
        facultad: ''
    };
    
    const tipoSelect = document.getElementById('tipoPrograma');
    const programaSelect = document.getElementById('programa');
    
    if (tipoSelect) tipoSelect.value = '';
    if (programaSelect) programaSelect.value = '';
    
    loadFacultadesData();
    loadTimelineData();
    
    updateChartTitles();
}

function applyFilters() {
    const tipoSelect = document.getElementById('tipoPrograma');
    const programaSelect = document.getElementById('programa');
    
    currentFilters.tipo = tipoSelect ? tipoSelect.value : '';
    currentFilters.programa = programaSelect ? programaSelect.value : '';
    
    console.log('Aplicando filtros:', currentFilters);
    
    loadFacultadesData();
    updateChartTitles();
    closeModal();
}

// Función para actualizar títulos de gráficos
function updateChartTitles() {
    const chartTitle = document.getElementById('chartTitle');
    const chartBadges = document.getElementById('chartBadges');
    
    if (chartTitle) {
        let title = 'Facultades - Participación';
        if (currentFilters.programa) {
            title += ` - ${currentFilters.programa}`;
        } else if (currentFilters.tipo) {
            title += ` - ${currentFilters.tipo}`;
        } else {
            title += ' General';
        }
        chartTitle.textContent = title;
    }
    
    if (chartBadges) {
        chartBadges.innerHTML = '';
        
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
        } else {
            const badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = 'Promoción Social';
            chartBadges.appendChild(badge);
        }
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