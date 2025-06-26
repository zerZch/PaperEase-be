document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  const modal = document.getElementById('calendarModalOverlay');
  const closeModal = document.getElementById('calendarCloseModal');
  const listaEventos = document.getElementById('calendarModalEventosLista');
  const calendarDaysContainer = document.querySelector('.calendar-days');
  const monthTitle = document.getElementById('calendarMonthTitle');
  const nextMonthBtn = document.querySelector('.calendar-button-next');
  const previousMonthBtn = document.querySelector('.calendar-button-previous');

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  let currentDate = new Date();
  let eventosPorDia = {};

  async function cargarEventos() {
    try {
      const res = await fetch('http://localhost:3000/api/eventos');
      if (!res.ok) throw new Error('Error cargando eventos');
      const eventos = await res.json();

      // Convertir eventos a un objeto donde la clave es la fecha en formato YYYY-MM-DD
      eventosPorDia = {};
      eventos.forEach(ev => {
        // Aquí asumo que tienes los campos Dia y Mes para construir la fecha, 
        // si tienes un campo de fecha directa usa ese.
        // Para tu ejemplo, uso Fecha en formato YYYY-MM-DD si existe:
        // Pero en tu DB, usa Dia y Mes para formar la fecha del evento para el año actual:
        const year = currentDate.getFullYear();
        const mesNum = ev.Mes.toString().padStart(2, '0');
        const diaNum = ev.Dia.toString().padStart(2, '0');
        const fechaKey = `${year}-${mesNum}-${diaNum}`;

        if (!eventosPorDia[fechaKey]) {
          eventosPorDia[fechaKey] = [];
        }
        eventosPorDia[fechaKey].push(ev);
      });

      renderCalendar(currentDate);
      console.log('Eventos cargados:', eventosPorDia);
    } catch (err) {
      console.error('Error al cargar eventos:', err);
    }
  }

  function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const diasEnMes = new Date(year, month + 1, 0).getDate();

    monthTitle.textContent = `${meses[month]} ${year}`;
    calendarDaysContainer.innerHTML = '';

    // Ajuste para que la semana comience en lunes (offset)
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
      }

      li.addEventListener('click', () => {
        const eventos = eventosPorDia[dateKey] || [];
        if (eventos.length === 0) {
          listaEventos.innerHTML = '<li>No hay eventos programados.</li>';
        } else {
          listaEventos.innerHTML = eventos.map(ev => `
            <li>
              <strong>${ev.Titulo}</strong><br>
              ${ev.Descripcion ? `<em>${ev.Descripcion}</em><br>` : ''}
              ${ev.HoraInicio ? `Hora: ${ev.HoraInicio}` : ''} ${ev.HoraFin ? `- ${ev.HoraFin}` : ''}<br>
              ${ev.Lugar ? `Lugar: ${ev.Lugar}<br>` : ''}
              ${ev.Categoria ? `Categoría: ${ev.Categoria}<br>` : ''}
              ${ev.Facultad ? `Facultad: ${ev.Facultad}<br>` : ''}
              ${ev.Imagen ? `<img src="${ev.Imagen}" alt="Imagen evento" style="max-width:100px;max-height:100px;">` : ''}
            </li>
          `).join('');
        }
        modal.style.display = 'flex';
      });

      calendarDaysContainer.appendChild(li);
    }
  }

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

  cargarEventos(); // carga eventos al iniciar
});
