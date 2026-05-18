function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    socket.on('registrar_estudiante', (cedula) => {
      socket.join(`estudiante_${cedula}`);
      console.log(`Estudiante con cédula ${cedula} registrado en la sala`);
    });

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });
}

module.exports = { setupSocketHandlers };
