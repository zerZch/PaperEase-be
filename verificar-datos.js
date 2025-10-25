const mysql = require('mysql2/promise');

// Configuración de conexión
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'paperease'
};

async function verificarDatos() {
  console.log('\n🔍 VERIFICACIÓN DE BASE DE DATOS Y DATOS\n');
  console.log('=' .repeat(60));

  let connection;

  try {
    // 1. Verificar conexión a MySQL
    console.log('\n1️⃣  Verificando conexión a MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('   ✅ Conexión exitosa a MySQL');

    // 2. Verificar base de datos
    console.log('\n2️⃣  Verificando base de datos "paperease"...');
    const [databases] = await connection.query("SHOW DATABASES LIKE 'paperease'");
    if (databases.length > 0) {
      console.log('   ✅ Base de datos "paperease" existe');
    } else {
      console.log('   ❌ Base de datos "paperease" NO existe');
      return;
    }

    // 3. Verificar tabla formulario_estudiante
    console.log('\n3️⃣  Verificando tabla "formulario_estudiante"...');
    const [tables] = await connection.query("SHOW TABLES LIKE 'formulario_estudiante'");
    if (tables.length > 0) {
      console.log('   ✅ Tabla "formulario_estudiante" existe');
    } else {
      console.log('   ❌ Tabla "formulario_estudiante" NO existe');
      return;
    }

    // 4. Contar registros
    console.log('\n4️⃣  Contando solicitudes en la tabla...');
    const [countResult] = await connection.query('SELECT COUNT(*) as total FROM formulario_estudiante');
    const total = countResult[0].total;
    console.log(`   📊 Total de solicitudes: ${total}`);

    // 5. Mostrar últimas 5 solicitudes
    if (total > 0) {
      console.log('\n5️⃣  Últimas 5 solicitudes registradas:');
      console.log('   ' + '-'.repeat(58));

      const [solicitudes] = await connection.query(`
        SELECT
          fe.id_formulario,
          fe.Nombre,
          fe.Apellido,
          fe.Cedula,
          g.Genero,
          f.Facultad,
          p.Programa,
          tp.TipoPrograma
        FROM formulario_estudiante fe
        LEFT JOIN genero g ON fe.IdGenero = g.IdGenero
        LEFT JOIN facultad f ON fe.IdFacultad = f.IdFacultad
        LEFT JOIN programa p ON fe.IdPrograma = p.IdPrograma
        LEFT JOIN tipoprograma tp ON fe.IdTipoP = tp.IdTipoP
        ORDER BY fe.id_formulario DESC
        LIMIT 5
      `);

      solicitudes.forEach((sol, index) => {
        console.log(`\n   ${index + 1}. ID: ${sol.id_formulario}`);
        console.log(`      Nombre: ${sol.Nombre} ${sol.Apellido}`);
        console.log(`      Cédula: ${sol.Cedula}`);
        console.log(`      Facultad: ${sol.Facultad || 'N/A'}`);
        console.log(`      Programa: ${sol.Programa || 'N/A'} (${sol.TipoPrograma || 'N/A'})`);
      });
    } else {
      console.log('\n   ℹ️  No hay solicitudes registradas todavía');
    }

    // 6. Verificar tablas relacionadas
    console.log('\n6️⃣  Verificando tablas relacionadas:');

    const [generos] = await connection.query('SELECT COUNT(*) as total FROM genero');
    console.log(`   - Géneros: ${generos[0].total} registros ✅`);

    const [facultades] = await connection.query('SELECT COUNT(*) as total FROM facultad');
    console.log(`   - Facultades: ${facultades[0].total} registros ✅`);

    const [programas] = await connection.query('SELECT COUNT(*) as total FROM programa');
    console.log(`   - Programas: ${programas[0].total} registros ✅`);

    const [tiposPrograma] = await connection.query('SELECT COUNT(*) as total FROM tipoprograma');
    console.log(`   - Tipos de Programa: ${tiposPrograma[0].total} registros ✅`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ VERIFICACIÓN COMPLETADA\n');

  } catch (error) {
    console.log('\n❌ ERROR EN LA VERIFICACIÓN:');

    if (error.code === 'ECONNREFUSED') {
      console.log('\n   🔴 MySQL/MariaDB NO está corriendo');
      console.log('\n   💡 SOLUCIÓN:');
      console.log('      - Windows (XAMPP): Inicia XAMPP y arranca MySQL');
      console.log('      - Linux: sudo service mysql start');
      console.log('      - macOS: brew services start mysql');
      console.log('      - Docker: docker-compose up -d mysql\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n   🔴 Credenciales incorrectas');
      console.log('\n   💡 SOLUCIÓN:');
      console.log('      - Verifica el usuario y contraseña en backend/conexion.js');
      console.log(`      - Usuario actual: ${dbConfig.user}`);
      console.log(`      - Contraseña actual: ${dbConfig.password ? '***' : '(vacía)'}\n`);
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n   🔴 Base de datos "paperease" no existe');
      console.log('\n   💡 SOLUCIÓN:');
      console.log('      - Importa el archivo SQL de la base de datos');
      console.log('      - mysql -u root -p < archivo_base_datos.sql\n');
    } else {
      console.log(`\n   Error: ${error.message}`);
      console.log(`   Código: ${error.code || 'N/A'}\n`);
    }

    console.log('='.repeat(60) + '\n');

  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar verificación
verificarDatos();
