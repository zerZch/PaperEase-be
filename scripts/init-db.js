const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

const baseConfig = {
  charset: 'utf8mb4',
  timezone: 'Z',
  multipleStatements: true
};

const config = databaseUrl
  ? { uri: databaseUrl, ...baseConfig }
  : {
      host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
      port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
      user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
      password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
      ...baseConfig
    };

async function main() {
  const schemaPath = path.join(__dirname, '..', 'data', 'migrations', '001_schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  const databaseName = process.env.DB_NAME || process.env.MYSQL_DATABASE || 'paperease';

  const connection = await mysql.createConnection(config);
  try {
    if (!databaseUrl) {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await connection.query(`USE \`${databaseName}\``);
    }

    await connection.query(sql);
    console.log('Database schema initialized successfully.');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('Failed to initialize database schema:', error.message);
  process.exit(1);
});
