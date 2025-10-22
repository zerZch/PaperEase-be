const mysql = require('mysql2');

// Crear pool de conexiones (mejor para múltiples queries)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',        // tu usuario MySQL
  password: '',        // tu contraseña MySQL
  database: 'paperease',// tu base de datos
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

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