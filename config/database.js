const { getEnv } = require('./env');

const DATABASE_URL = getEnv('DATABASE_URL', '') || getEnv('MYSQL_URL', '');

const database = {
  url: DATABASE_URL || null,

  host: getEnv('DB_HOST', '') || getEnv('MYSQLHOST', '') || 'localhost',
  port: parseInt(getEnv('DB_PORT', '') || getEnv('MYSQLPORT', '') || '3306', 10),
  user: getEnv('DB_USER', '') || getEnv('MYSQLUSER', '') || 'root',
  password: getEnv('DB_PASSWORD', '') || getEnv('MYSQLPASSWORD', '') || '',
  database: getEnv('DB_NAME', '') || getEnv('MYSQL_DATABASE', '') || 'paperease',

  pool: {
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: 'Z',
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  },
};

module.exports = database;
