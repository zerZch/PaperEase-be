const express = require('express');
const app = express();
const port = 3000;

// Simulamos datos para prueba (más adelante conecta a BD)
const eventos = [
  {
    Id_Eventos: 1,
    Titulo: "Próxima feria de empleo",
    Imagen: "/Novedades/empleo.avif"
  },
  {
    Id_Eventos: 2,
    Titulo: "Feria de Salud",
    Imagen: "/Novedades/feriadesalud.jpeg"
  },
  // Agrega más eventos aquí...
];

// Endpoint para eventos
app.get('/api/eventos', (req, res) => {
  res.json(eventos);
});

// Para servir archivos estáticos (imágenes, CSS, etc.)
app.use(express.static('frontend/public'));

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
