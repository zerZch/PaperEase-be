// Variables globales para los charts
let facultadesChart;
let timeChart;

// Datos simulados para diferentes programas
const dataByProgram = {
    'todos': {
        facultades: {
            labels: ['Civil', 'Mecánica', 'Eléctrica', 'Sistemas', 'C&T', 'Industrial'],
            data: [45, 85, 95, 70, 48, 38],
            colors: ['#C084FC', '#F472B6', '#60A5FA', '#34D399', '#FBBF24', '#FCD34D']
        },
        tiempo: {
            labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
            hombres: [50, 95, 30, 60, 100, 80, 40],
            mujeres: [45, 70, 25, 50, 85, 65, 30]
        },
        stats: { estudiantes: 1000, aplicaciones: 500, eventos: 700, participantes: 8000 }
    },
    'sangre': {
        facultades: {
            labels: ['Civil', 'Mecánica', 'Eléctrica', 'Sistemas', 'C&T', 'Industrial'],
            data: [25, 65, 85, 50, 28, 18],
            colors: ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2']
        },
        tiempo: {
            labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
            hombres: [30, 55, 20, 40, 70, 60, 25],
            mujeres: [25, 40, 15, 30, 55, 45, 20]
        },
        stats: { estudiantes: 350, aplicaciones: 280, eventos: 12, participantes: 2800 }
    },
    'feria_empleo': {
        facultades: {
            labels: ['Civil', 'Mecánica', 'Eléctrica', 'Sistemas', 'C&T', 'Industrial'],
            data: [35, 75, 65, 90, 55, 45],
            colors: ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5']
        },
        tiempo: {
            labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
            hombres: [40, 70, 25, 55, 85, 70, 35],
            mujeres: [35, 60, 20, 45, 75, 60, 30]
        },
        stats: { estudiantes: 650, aplicaciones: 420, eventos: 8, participantes: 4200 }
    },
    'canasta': {
        facultades: {
            labels: ['Civil', 'Mecánica', 'Eléctrica', 'Sistemas', 'C&T', 'Industrial'],
            data: [55, 45, 35, 25, 65, 75],
            colors: ['#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7']
        },
        tiempo: {
            labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
            hombres: [20, 40, 15, 25, 45, 35, 20],
            mujeres: [35, 55, 20, 40, 65, 50, 25]
        },
        stats: { estudiantes: 300, aplicaciones: 250, eventos: 5, participantes: 1250 }
    },
    'salud': {
        facultades: {
            labels: ['Civil', 'Mecánica', 'Eléctrica', 'Sistemas', 'C&T', 'Industrial'],
            data: [30, 50, 70, 40, 35, 25],
            colors: ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2']
        },
        tiempo: {
            labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
            hombres: [35, 65, 25, 45, 75, 65, 30],
            mujeres: [30, 50, 20, 35, 60, 50, 25]
        },
        stats: { estudiantes: 600, aplicaciones: 450, eventos: 25, participantes: 4500 }
    },
    'promocion_social': {
        facultades: {
            labels: ['Civil', 'Mecánica', 'Eléctrica', 'Sistemas', 'C&T', 'Industrial'],
            data: [40, 60, 55, 80, 45, 50],
            colors: ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5']
        },
        tiempo: {
            labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
            hombres: [45, 80, 30, 65, 90, 75, 40],
            mujeres: [40, 70, 25, 55, 80, 65, 35]
        },
        stats: { estudiantes: 750, aplicaciones: 520, eventos: 18, participantes: 5200 }
    }
};

// Nombres de programas para mostrar
const programNames = {
    'consejeria': 'Consejería Personal',
    'sangre': 'Banco de Sangre',
    'gastos_medicos': 'Ayuda en Gastos Médicos',
    'feria_salud': 'Feria de Salud',
    'gafas': 'Compra de Lentes',
    'medicina': 'Apoyo en Medicamentos',
    'poliza': 'Póliza de Salud',
    'canasta': 'Canasta Navideña',
    'valores': 'Campaña de Fortalecimiento de Valores',
    'concienciacion': 'Campaña de Concienciación de Instalaciones',
    'feria_empleo': 'Feria de Empleo',
    'siniestros': 'Apoyo en Casos de Siniestros',
    'salud': 'Programas de Salud',
    'promocion_social': 'Promoción Social'
};

// Definir los programas por categoría
const programsByCategory = {
    'salud': [
        { value: 'consejeria', text: 'Consejería Personal' },
        { value: 'sangre', text: 'Banco de Sangre' },
        { value: 'gastos_medicos', text: 'Ayuda en Gastos Médicos' },
        { value: 'feria_salud', text: 'Feria de Salud' },
        { value: 'gafas', text: 'Compra de Lentes' },
        { value: 'medicina', text: 'Apoyo en Medicamentos' },
        { value: 'poliza', text: 'Póliza de Salud' }
    ],
    'promocion_social': [
        { value: 'canasta', text: 'Canasta Navideña' },
        { value: 'valores', text: 'Campaña de Fortalecimiento de Valores' },
        { value: 'concienciacion', text: 'Campaña de Concienciación de Instalaciones' },
        { value: 'feria_empleo', text: 'Feria de Empleo' },
        { value: 'siniestros', text: 'Apoyo en Casos de Siniestros' }
    ]
};

// Funciones del Modal
function openModal() {
    const modal = document.getElementById('filterModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal() {
    const modal = document.getElementById('filterModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function applyFilters() {
    // Lógica para aplicar filtros ya existe en los event listeners
    closeModal();
}

// Función para resetear filtros
function resetFilters() {
    const tipoProgramaSelect = document.getElementById('tipoPrograma');
    const programaSelect = document.getElementById('programa');
    
    if (tipoProgramaSelect) tipoProgramaSelect.value = '';
    if (programaSelect) programaSelect.value = '';
    
    filterProgramOptions('');
    updateLabels('', '');
    updateCharts('todos');
}

// Inicializar charts
function initCharts() {
    const ctx1 = document.getElementById('facultadesChart');
    const ctx2 = document.getElementById('timeChart');
    
    if (!ctx1 || !ctx2) {
        console.error('No se encontraron los elementos canvas para los gráficos');
        return;
    }

    facultadesChart = new Chart(ctx1.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: dataByProgram.todos.facultades.labels,
            datasets: [{
                label: 'Participación',
                data: dataByProgram.todos.facultades.data,
                backgroundColor: dataByProgram.todos.facultades.colors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            },
            animation: {
                animateRotate: true,
                duration: 1000
            }
        }
    });

    timeChart = new Chart(ctx2.getContext('2d'), {
        type: 'bar',
        data: {
            labels: dataByProgram.todos.tiempo.labels,
            datasets: [
                {
                    label: 'Hombres',
                    data: dataByProgram.todos.tiempo.hombres,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'Mujeres',
                    data: dataByProgram.todos.tiempo.mujeres,
                    backgroundColor: 'rgba(118, 75, 162, 0.8)',
                    borderColor: 'rgba(118, 75, 162, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000
            }
        }
    });
}

// Actualizar gráficas y estadísticas
function updateCharts(programKey = 'todos') {
    const data = dataByProgram[programKey] || dataByProgram.todos;

    if (facultadesChart) {
        // Actualizar gráfica de facultades
        facultadesChart.data.labels = data.facultades.labels;
        facultadesChart.data.datasets[0].data = data.facultades.data;
        facultadesChart.data.datasets[0].backgroundColor = data.facultades.colors;
        facultadesChart.update();
    }

    if (timeChart) {
        // Actualizar gráfica de tiempo
        timeChart.data.labels = data.tiempo.labels;
        timeChart.data.datasets[0].data = data.tiempo.hombres;
        timeChart.data.datasets[1].data = data.tiempo.mujeres;
        timeChart.update();
    }

    // Actualizar estadísticas
    const estudiantesCount = document.getElementById('estudiantesCount');
    const aplicacionesCount = document.getElementById('aplicacionesCount');
    const eventosCount = document.getElementById('eventosCount');
    const participantesCount = document.getElementById('participantesCount');

    if (estudiantesCount) estudiantesCount.textContent = data.stats.estudiantes.toLocaleString();
    if (aplicacionesCount) aplicacionesCount.textContent = data.stats.aplicaciones.toLocaleString();
    if (eventosCount) eventosCount.textContent = data.stats.eventos.toLocaleString();
    if (participantesCount) participantesCount.textContent = data.stats.participantes.toLocaleString();
}

// Actualizar badges y títulos
function updateLabels(tipoPrograma, programa) {
    const badgesContainer = document.getElementById('chartBadges');
    const chartTitle = document.getElementById('chartTitle');
    const timeChartTitle = document.getElementById('timeChartTitle');

    if (badgesContainer) {
        badgesContainer.innerHTML = '';

        if (programa && programNames[programa]) {
            const badge = document.createElement('div');
            badge.className = 'badge';
            badge.textContent = programNames[programa];
            badgesContainer.appendChild(badge);
            
            if (chartTitle) chartTitle.textContent = `Facultades - ${programNames[programa]}`;
            if (timeChartTitle) timeChartTitle.textContent = `${programNames[programa]} por Año`;
        } else if (tipoPrograma && programNames[tipoPrograma]) {
            const badge = document.createElement('div');
            badge.className = 'badge';
            badge.textContent = programNames[tipoPrograma];
            badgesContainer.appendChild(badge);
            
            if (chartTitle) chartTitle.textContent = `Facultades - ${programNames[tipoPrograma]}`;
            if (timeChartTitle) timeChartTitle.textContent = `${programNames[tipoPrograma]} por Año`;
        } else {
            const badge = document.createElement('div');
            badge.className = 'badge';
            badge.textContent = 'Todos los Programas';
            badgesContainer.appendChild(badge);
            
            if (chartTitle) chartTitle.textContent = 'Facultades - Participación General';
            if (timeChartTitle) timeChartTitle.textContent = 'Participación por Año';
        }
    }
}

// Filtrar programas específicos según el tipo - FUNCIÓN CORREGIDA
function filterProgramOptions(tipoPrograma) {
    const programSelect = document.getElementById('programa');
    if (!programSelect) return;

    // Limpiar todas las opciones excepto la primera
    programSelect.innerHTML = '<option value="">Seleccione una opción</option>';

    if (!tipoPrograma) {
        // Si no hay tipo seleccionado, mostrar todos los programas organizados por categoría
        const saludOptgroup = document.createElement('optgroup');
        saludOptgroup.label = 'Salud';
        programsByCategory.salud.forEach(program => {
            const option = document.createElement('option');
            option.value = program.value;
            option.textContent = program.text;
            saludOptgroup.appendChild(option);
        });
        programSelect.appendChild(saludOptgroup);

        const promocionOptgroup = document.createElement('optgroup');
        promocionOptgroup.label = 'Promoción Social';
        programsByCategory.promocion_social.forEach(program => {
            const option = document.createElement('option');
            option.value = program.value;
            option.textContent = program.text;
            promocionOptgroup.appendChild(option);
        });
        programSelect.appendChild(promocionOptgroup);
    } else {
        // Si hay un tipo seleccionado, mostrar solo los programas de ese tipo
        if (programsByCategory[tipoPrograma]) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = tipoPrograma === 'salud' ? 'Salud' : 'Promoción Social';
            
            programsByCategory[tipoPrograma].forEach(program => {
                const option = document.createElement('option');
                option.value = program.value;
                option.textContent = program.text;
                optgroup.appendChild(option);
            });
            
            programSelect.appendChild(optgroup);
        }
    }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar gráficos
    initCharts();
    updateLabels('', '');
    
    // Inicializar las opciones del select de programas
    filterProgramOptions('');
    
    // Event listeners para filtros
    const tipoProgramaSelect = document.getElementById('tipoPrograma');
    const programaSelect = document.getElementById('programa');

    if (tipoProgramaSelect) {
        tipoProgramaSelect.addEventListener('change', function() {
            const tipoPrograma = this.value;
            
            // Filtrar las opciones de programa
            filterProgramOptions(tipoPrograma);
            
            // Resetear la selección del programa específico
            if (programaSelect) {
                programaSelect.value = '';
            }

            // Determinar qué datos usar
            let dataKey = 'todos';
            if (tipoPrograma && dataByProgram[tipoPrograma]) {
                dataKey = tipoPrograma;
            }

            updateLabels(tipoPrograma, '');
            updateCharts(dataKey);
        });
    }

    if (programaSelect) {
        programaSelect.addEventListener('change', function() {
            const programa = this.value;
            const tipoPrograma = tipoProgramaSelect ? tipoProgramaSelect.value : '';

            // Determinar qué datos usar
            let dataKey = 'todos';
            if (programa && dataByProgram[programa]) {
                dataKey = programa;
            } else if (tipoPrograma && dataByProgram[tipoPrograma]) {
                dataKey = tipoPrograma;
            }

            updateLabels(tipoPrograma, programa);
            updateCharts(dataKey);
        });
    }
    
    // Configurar modal event listeners
    const modalOverlay = document.getElementById('filterModal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }

    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});