const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configuración de conexión
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'paperease',
  multipleStatements: true
};

async function aplicarCambios() {
  console.log('\n🔧 APLICANDO CAMBIOS A LA BASE DE DATOS\n');
  console.log('=' .repeat(60));

  let connection;

  try {
    // 1. Conectar a MySQL
    console.log('\n1️⃣  Conectando a MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('   ✅ Conexión exitosa');

    // 2. Leer el archivo SQL
    console.log('\n2️⃣  Leyendo archivo SQL...');
    const sqlPath = path.join(__dirname, 'agregar-campos-gestion.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    console.log('   ✅ Archivo leído correctamente');

    // 3. Verificar campos actuales
    console.log('\n3️⃣  Verificando campos actuales...');
    const [currentFields] = await connection.query('DESCRIBE formulario_estudiante');
    const fieldNames = currentFields.map(f => f.Field);

    console.log('   Campos actuales:');
    fieldNames.forEach(field => console.log(`     - ${field}`));

    // Verificar si ya existen los nuevos campos
    const hasEstado = fieldNames.includes('Estado');
    const hasPrioridad = fieldNames.includes('Prioridad');
    const hasFechaCreacion = fieldNames.includes('FechaCreacion');

    if (hasEstado && hasPrioridad && hasFechaCreacion) {
      console.log('\n   ⚠️  Los campos ya existen. No es necesario aplicar cambios.');
      console.log('   ✅ La tabla ya está actualizada.\n');
      return;
    }

    // 4. Aplicar cambios
    console.log('\n4️⃣  Aplicando cambios a la tabla...');
    console.log('   📝 Agregando campos: Estado, Prioridad, FechaCreacion, FechaModificacion, NotasTrabajador');

    // Ejecutar el script SQL
    await connection.query(sqlScript);

    console.log('   ✅ Campos agregados exitosamente');

    // 5. Verificar nuevos campos
    console.log('\n5️⃣  Verificando nuevos campos...');
    const [newFields] = await connection.query('DESCRIBE formulario_estudiante');

    console.log('   Campos después de la modificación:');
    newFields.forEach(field => {
      const isNew = !fieldNames.includes(field.Field);
      const marker = isNew ? '✨ NUEVO' : '';
      console.log(`     - ${field.Field} ${marker}`);
    });

    // 6. Actualizar solicitudes existentes
    console.log('\n6️⃣  Actualizando solicitudes existentes...');
    const [updateResult] = await connection.query(`
      UPDATE formulario_estudiante
      SET
        Estado = 'pendiente',
        Prioridad = 'media',
        FechaCreacion = NOW()
      WHERE Estado IS NULL
    `);

    console.log(`   ✅ ${updateResult.affectedRows} solicitudes actualizadas con valores por defecto`);

    // 7. Resumen final
    console.log('\n7️⃣  Resumen:');
    const [count] = await connection.query('SELECT COUNT(*) as total FROM formulario_estudiante');
    const [estados] = await connection.query(`
      SELECT Estado, COUNT(*) as cantidad
      FROM formulario_estudiante
      GROUP BY Estado
    `);

    console.log(`   📊 Total de solicitudes: ${count[0].total}`);
    console.log('   📊 Por estado:');
    estados.forEach(e => {
      console.log(`      - ${e.Estado}: ${e.cantidad}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ CAMBIOS APLICADOS EXITOSAMENTE\n');

  } catch (error) {
    console.log('\n❌ ERROR AL APLICAR CAMBIOS:');

    if (error.code === 'ECONNREFUSED') {
      console.log('\n   🔴 MySQL/MariaDB NO está corriendo');
      console.log('   💡 Inicia MySQL primero y vuelve a ejecutar este script\n');
    } else if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('\n   ⚠️  Los campos ya existen en la tabla');
      console.log('   ✅ No es necesario hacer nada\n');
    } else {
      console.log(`\n   Error: ${error.message}`);
      console.log(`   Código: ${error.code || 'N/A'}\n`);
      if (error.sql) {
        console.log(`   SQL: ${error.sql}\n`);
      }
    }

    console.log('='.repeat(60) + '\n');

  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar
aplicarCambios();
