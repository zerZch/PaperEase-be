async function cargarEventos() {
  try {
    const res = await fetch('/api/novedades');
    const eventos = await res.json();

    const tarjetas = document.querySelectorAll('.novedades-grid .novedad-card');

    eventos.forEach((evento, index) => {
      const tarjeta = tarjetas[index];
      if (!tarjeta) return;

      tarjeta.innerHTML = '';

      const imagen = document.createElement('img');
      imagen.src = `/public/${evento.Imagen}`; // 👈 ruta ajustada
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
