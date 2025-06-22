// archivo: novedades.js (por ejemplo)

async function cargarNovedades() {
  try {
    const respuesta = await fetch('http://localhost:3000/api/eventos');
    if (!respuesta.ok) throw new Error('Error al cargar novedades');
    const eventos = await respuesta.json();

    const contenedor = document.querySelector('.novedades-grid');
    contenedor.innerHTML = ''; // limpia contenido previo

    eventos.forEach((evento, index) => {
      // Crear el div de la tarjeta
      const card = document.createElement('div');
      card.classList.add('novedad-card', `card${index + 1}`);

      // Imagen
      const img = document.createElement('img');
      img.src = evento.Imagen; // asume ruta correcta
      img.alt = evento.Titulo;

      // Título con número y texto
      const titulo = document.createElement('h4');
      titulo.textContent = `${(index + 1).toString().padStart(2, '0')}/ ${evento.Titulo}`;

      card.appendChild(img);
      card.appendChild(titulo);

      contenedor.appendChild(card);
    });

  } catch (error) {
    console.error('Error cargando novedades:', error);
  }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarNovedades);
