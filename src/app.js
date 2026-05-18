const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const serverConfig = require('../config/server');
const { errorHandler } = require('./middleware/errorHandler');
const { mountAllRoutes, mountNotFound } = require('./routes/index');

function createApp() {
  const app = express();

  app.use(cors({
    origin: serverConfig.cors.origins,
    credentials: serverConfig.cors.credentials
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(helmet(serverConfig.helmet));
  app.set('trust proxy', serverConfig.trustProxy);

  if (serverConfig.logging.requests) {
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });
  }

  mountAllRoutes(app);

  app.get('/api/test', (req, res) => {
    res.json({ message: 'Servidor funcionando correctamente', timestamp: new Date().toISOString() });
  });

  mountNotFound(app);

  app.use(errorHandler());

  return app;
}

module.exports = { createApp };
