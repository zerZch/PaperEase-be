const mysql = require('mysql2');

const conexion = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // tu usuario MySQL
  password: '',        // tu contraseña MySQL
  database: 'paperease'// tu base de datos
});

conexion.connect((error) => {
  if (error) {
    console.error('❌ Error al conectar a MySQL:', error.message);
    return;
  }
  console.log('✅ Conexión exitosa a MySQL');
});

module.exports = conexion;
