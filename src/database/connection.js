const mysql = require('mysql2');
const databaseConfig = require('../../config/database');

const poolConfig = databaseConfig.url
  ? { uri: databaseConfig.url, ...databaseConfig.pool }
  : {
      host: databaseConfig.host,
      port: databaseConfig.port,
      user: databaseConfig.user,
      password: databaseConfig.password,
      database: databaseConfig.database,
      ...databaseConfig.pool,
    };

const pool = mysql.createPool(poolConfig);

pool.getConnection((error, connection) => {
  if (error) {
    console.error('Error al conectar a MySQL:', error.message);
    return;
  }
  console.log('Conexión a MySQL establecida');
  connection.release();
});

module.exports = pool;
