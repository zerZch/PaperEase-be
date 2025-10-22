// authHelper.js - Helper de autenticación para el frontend

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean}
 */
function isAuthenticated() {
  const token = localStorage.getItem('authToken');
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  return token && isLoggedIn === 'true';
}

/**
 * Obtiene el token de autenticación
 * @returns {string|null}
 */
function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * Obtiene la información del usuario actual
 * @returns {object|null}
 */
function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error al parsear usuario:', error);
    return null;
  }
}

/**
 * Obtiene el rol del usuario
 * @returns {number|null} 1 = Estudiante, 2 = Trabajador Social
 */
function getUserRole() {
  const user = getCurrentUser();
  return user ? user.rol : null;
}

/**
 * Verifica si el usuario es estudiante
 * @returns {boolean}
 */
function isEstudiante() {
  return getUserRole() === 1;
}

/**
 * Verifica si el usuario es trabajador social
 * @returns {boolean}
 */
function isTrabajadorSocial() {
  return getUserRole() === 2;
}

/**
 * Redirige al login si no está autenticado
 */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'LogIn.html';
  }
}

/**
 * Redirige al login si no es estudiante
 */
function requireEstudiante() {
  if (!isAuthenticated()) {
    window.location.href = 'LogIn.html';
    return;
  }

  if (!isEstudiante()) {
    alert('Acceso denegado. Solo estudiantes pueden acceder a esta página.');
    window.location.href = 'gestion.html';
  }
}

/**
 * Redirige al login si no es trabajador social
 */
function requireTrabajadorSocial() {
  if (!isAuthenticated()) {
    window.location.href = 'LogIn.html';
    return;
  }

  if (!isTrabajadorSocial()) {
    alert('Acceso denegado. Solo trabajadores sociales pueden acceder a esta página.');
    window.location.href = 'MenuPE.html';
  }
}

/**
 * Cierra la sesión del usuario
 */
async function logout() {
  const token = getAuthToken();

  if (token) {
    try {
      // Llamar al backend para cerrar sesión
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
    }
  }

  // Limpiar localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userRole');

  // Redirigir al login
  window.location.href = 'LogIn.html';
}

/**
 * Verifica la sesión con el servidor
 * @returns {Promise<boolean>}
 */
async function verificarSesion() {
  const token = getAuthToken();

  if (!token) {
    return false;
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/verificar', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.autenticado) {
      // Actualizar datos del usuario en localStorage
      localStorage.setItem('currentUser', JSON.stringify(data.usuario));
      return true;
    } else {
      // Sesión inválida, limpiar localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      return false;
    }
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    return false;
  }
}

/**
 * Realiza una petición autenticada al servidor
 * @param {string} url - URL del endpoint
 * @param {object} options - Opciones de fetch
 * @returns {Promise<Response>}
 */
async function authenticatedFetch(url, options = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  // Agregar header de autorización
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  // Si la respuesta es 401, la sesión expiró
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    window.location.href = 'LogIn.html';
  }

  return response;
}

// Exportar funciones para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isAuthenticated,
    getAuthToken,
    getCurrentUser,
    getUserRole,
    isEstudiante,
    isTrabajadorSocial,
    requireAuth,
    requireEstudiante,
    requireTrabajadorSocial,
    logout,
    verificarSesion,
    authenticatedFetch
  };
}
