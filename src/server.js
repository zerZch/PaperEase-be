const http = require('http');
const socketIO = require('socket.io');
const serverConfig = require('../config/server');
const { createApp } = require('./app');
const { setupSocketHandlers } = require('./socket/notification.handler');
const notificationService = require('./services/notification.service');

const app = createApp();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: serverConfig.cors.origins,
    credentials: true
  }
});

notificationService.setSocketIO(io);
setupSocketHandlers(io);

const PORT = serverConfig.port;
server.listen(PORT, () => {
  console.log(`PaperEase corriendo en http://localhost:${PORT}`);
});

module.exports = app;
