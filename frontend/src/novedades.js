async function cargarEventos() {
  try {
    const res = await fetch('http://localhost:3000/api/novedades');
    const eventos = await res.json();
    
    const tarjetas = document.querySelectorAll('.novedades-grid .novedad-card');
    
    eventos.forEach((evento, index) => {
      const tarjeta = tarjetas[index];
      if (!tarjeta) return;
      
      // Limpiar todo el contenido
      tarjeta.innerHTML = '';
      
      // Crear la imagen con la URL de la base de datos
      const imagen = document.createElement('img');
      imagen.src = evento.Imagen;
      imagen.alt = evento.Titulo;
      tarjeta.appendChild(imagen);
      
      // Crear solo el título con fecha
      const titulo = document.createElement('h4');
      titulo.textContent = `${evento.Dia}/${evento.Mes} - ${evento.Titulo}`;
      
      tarjeta.appendChild(titulo);
    });
  } catch (error) {
    console.error('Error cargando eventos:', error);
  }
}

// Cargar eventos al inicio
document.addEventListener('DOMContentLoaded', cargarEventos);

// Actualizar cuando el usuario regrese a la ventana
window.addEventListener('focus', cargarEventos);

// También actualizar cuando la página se vuelve visible
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    cargarEventos();
  }
});