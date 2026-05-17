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
      database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'paperease',
      ...baseConfig
    };

async function main() {
  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const connection = await mysql.createConnection(config);
  try {
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
