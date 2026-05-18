const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const databaseConfig = require('../config/database');

async function main() {
  const seedPath = path.join(__dirname, '..', 'data', 'seeds', 'eventos.sql');

  if (!fs.existsSync(seedPath)) {
    console.error(`Archivo de semilla no encontrado: ${seedPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(seedPath, 'utf8');
  const poolConfig = databaseConfig.url
    ? { uri: databaseConfig.url, ...databaseConfig.pool, multipleStatements: true }
    : {
        host: databaseConfig.host, port: databaseConfig.port,
        user: databaseConfig.user, password: databaseConfig.password,
        database: databaseConfig.database,
        ...databaseConfig.pool, multipleStatements: true
      };

  const connection = await mysql.createConnection(poolConfig);

  try {
    await connection.query(sql);
    console.log('Datos semilla cargados exitosamente.');
  } catch (error) {
    console.error('Error al cargar datos semilla:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
