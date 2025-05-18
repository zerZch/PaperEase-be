import express from 'express';

const app  = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_, res) => {
  res.send('PaperEase API en línea ✔️');
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀  Servidor escuchando en http://localhost:${PORT}`);
  });
}

export { app };
