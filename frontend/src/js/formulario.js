const form = document.querySelector('.formulario');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  try {
    const res = await fetch('http://localhost:3000/api/formulario', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errorText = await res.text(); // Captura respuesta como texto si no es JSON
      throw new Error(errorText);
    }

    const result = await res.json();

    alert('✅ Solicitud enviada correctamente');
    form.reset();

  } catch (err) {
    alert('❌ Error: ' + err.message);
    console.error('Error al enviar solicitud:', err);
  }
});

