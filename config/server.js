const { getEnv, isProduction } = require('./env');
const path = require('path');

const FRONTEND_URL = getEnv('FRONTEND_URL', '');
const PORT = parseInt(getEnv('PORT', '3000'), 10);

const server = {
  port: PORT,
  frontendDir: path.resolve(__dirname, '..', 'public'),
  uploadsDir: path.resolve(__dirname, '..', 'data', 'uploads'),

  trustProxy: 1,

  cors: {
    origins: FRONTEND_URL
      ? [FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500']
      : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500'],
    credentials: true,
  },

  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdn.jsdelivr.net", "https://cdn.socket.io"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "wss:", "ws:"],
        fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  },

  baseUrl: getEnv('BASE_URL', 'https://paperease.up.railway.app'),

  auth: {
    saltRounds: 10,
    tokenBytes: 64,
    tokenExpiryHours: 24,
    minPasswordLength: 6,
  },

  upload: {
    maxFileSize: 5 * 1024 * 1024,
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    imageMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  },

  logging: {
    requests: !isProduction,
  },
};

module.exports = server;
