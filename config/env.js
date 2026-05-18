const NODE_ENV = process.env.NODE_ENV || 'development';

function getEnv(key, defaultValue) {
  const value = process.env[key];
  return value !== undefined && value !== '' ? value : defaultValue;
}

function requireEnv(key) {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(`La variable de entorno ${key} es obligatoria`);
  }
  return value;
}

module.exports = {
  NODE_ENV,
  isProduction: NODE_ENV === 'production',
  isDevelopment: NODE_ENV === 'development',
  getEnv,
  requireEnv,
};
