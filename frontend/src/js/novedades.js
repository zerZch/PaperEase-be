async function cargarEventos() {
  try {
    const res = await fetch('http://localhost:3000/api/novedades');
    const eventos = await res.json();

    const tarjetas = document.querySelectorAll('.novedades-grid .novedad-card');

    eventos.forEach((evento, index) => {
      const tarjeta = tarjetas[index];
      if (!tarjeta) return;

      tarjeta.innerHTML = '';

      const imagen = document.createElement('img');
      imagen.src = evento.Imagen;  // usa la URL completa directamente
      imagen.alt = evento.Titulo;
      tarjeta.appendChild(imagen);


      const titulo = document.createElement('h4');
      titulo.textContent = `${evento.Dia}/${evento.Mes} - ${evento.Titulo}`;
      tarjeta.appendChild(titulo);
    });
  } catch (error) {
    console.error('Error cargando eventos:', error);
  }
}

document.addEventListener('DOMContentLoaded', cargarEventos);
window.addEventListener('focus', cargarEventos);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) cargarEventos();
});
