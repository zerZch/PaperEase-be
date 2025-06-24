
  const form = document.querySelector('.formulario');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form); // Captura todos los campos, incluido el archivo

    try {
      const res = await fetch('http://localhost:3000/api/solicitud', {
        method: 'POST',
        body: formData, // Aquí se envían los datos + archivo
      });

      const result = await res.json();

      if (res.ok) {
        alert('✅ Solicitud enviada correctamente');
        form.reset();
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (err) {
      alert('❌ Error de conexión con el servidor');
    }
  });
