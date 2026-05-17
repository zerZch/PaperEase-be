const mysql = require('mysql2');

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

const baseConfig = {
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'Z',
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

const poolConfig = databaseUrl
  ? {
      uri: databaseUrl,
      ...baseConfig
    }
  : {
      host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
      port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
      user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
      password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
      database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'paperease',
      ...baseConfig
    };

const pool = mysql.createPool(poolConfig);

// Verificar conexión
pool.getConnection((error, connection) => {
  if (error) {
    console.error('❌ Error al conectar a MySQL:', error.message);
    console.error('💡 Asegúrate de que MySQL/MariaDB esté corriendo');
    return;
  }
  console.log('✅ Conexión exitosa a MySQL');
  connection.release();
});

// Exportar el pool con soporte de promesas
module.exports = pool;
