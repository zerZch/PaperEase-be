// test-conexion.js - Script para probar la conexión a MySQL

const conexion = require('./backend/conexion');

console.log('🔍 Probando conexión a MySQL...\n');

// Probar query simple
conexion.promise().query('SELECT 1 + 1 AS resultado')
  .then(([rows]) => {
    console.log('✅ Conexión exitosa!');
    console.log('✅ Query de prueba funcionó:', rows);

    // Probar que las tablas existen
    return conexion.promise().query('SHOW TABLES');
  })
  .then(([tables]) => {
    console.log('\n📋 Tablas en la base de datos paperease:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log('  ✓', tableName);
    });

    // Verificar tabla estudiante
    return conexion.promise().query('DESCRIBE estudiante');
  })
  .then(([columns]) => {
    console.log('\n📊 Estructura de tabla estudiante:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    // Verificar tabla trabajador_social
    return conexion.promise().query('DESCRIBE trabajador_social');
  })
  .then(([columns]) => {
    console.log('\n📊 Estructura de tabla trabajador_social:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    console.log('\n✅ ¡Todo está bien! La base de datos está lista.');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ ERROR:', error.message);
    console.error('\n💡 SOLUCIONES:');

    if (error.code === 'ECONNREFUSED') {
      console.error('  1. MySQL/MariaDB no está corriendo');
      console.error('  2. Inicia MySQL con uno de estos comandos:');
      console.error('     - Windows: Inicia XAMPP y activa MySQL');
      console.error('     - Mac: brew services start mysql');
      console.error('     - Linux: sudo systemctl start mysql');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('  1. La base de datos "paperease" no existe');
      console.error('  2. Créala en phpMyAdmin o con:');
      console.error('     CREATE DATABASE paperease;');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('  1. Usuario o contraseña incorrectos');
      console.error('  2. Revisa backend/conexion.js');
      console.error('     user: "root"');
      console.error('     password: "" (vacío por defecto en XAMPP)');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('  1. Las tablas no existen en la base de datos');
      console.error('  2. Ejecuta los scripts SQL de la FASE 1 en phpMyAdmin');
    } else {
      console.error('  Error desconocido. Revisa la configuración.');
    }

    process.exit(1);
  });
