// login.js - Lógica para el formulario de login de PaperEase

document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM
  const loginForm = document.getElementById('loginForm');
  const messageContainer = document.getElementById('messageContainer');
  const btnLogin = document.getElementById('btnLogin');
  const rememberMeCheckbox = document.getElementById('rememberMe');

  // Función para mostrar mensajes
  function showMessage(message, type = 'error') {
    messageContainer.textContent = message;
    messageContainer.className = `message ${type} show`;

    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
      messageContainer.classList.remove('show');
    }, 5000);
  }

  // Función para validar email
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Verificar si hay sesión guardada
  const savedEmail = localStorage.getItem('rememberedEmail');
  if (savedEmail) {
    document.getElementById('email').value = savedEmail;
    rememberMeCheckbox.checked = true;
  }

  // Manejo del envío del formulario
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener valores del formulario
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = rememberMeCheckbox.checked;

    // Validaciones
    if (!validateEmail(email)) {
      showMessage('Por favor, ingresa un correo electrónico válido', 'error');
      return;
    }

    if (!password) {
      showMessage('Por favor, ingresa tu contraseña', 'error');
      return;
    }

    if (password.length < 6) {
      showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    // Deshabilitar botón mientras se procesa
    btnLogin.disabled = true;
    btnLogin.classList.add('loading');
    btnLogin.textContent = 'Iniciando sesión...';

    try {
      // Aquí se haría la llamada al backend para autenticar
      // Por ahora, simulamos una autenticación exitosa

      // Simulación de llamada al servidor
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Verificar si el usuario existe en localStorage (simulación)
      const currentUser = localStorage.getItem('currentUser');

      let userData;
      if (currentUser) {
        userData = JSON.parse(currentUser);

        // Verificar que el email coincida
        if (userData.email !== email) {
          showMessage('Correo electrónico o contraseña incorrectos', 'error');
          btnLogin.disabled = false;
          btnLogin.classList.remove('loading');
          btnLogin.textContent = 'Iniciar Sesión';
          return;
        }
      } else {
        // Si no hay usuario registrado, crear uno temporal
        // En producción, esto debería fallar y pedir registro
        userData = {
          email: email,
          rol: 'estudiante', // Por defecto estudiante
          nombre: email.split('@')[0]
        };
      }

      // Guardar estado de sesión
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', userData.rol);

      // Recordar email si está marcado
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Mostrar mensaje de éxito
      showMessage('¡Inicio de sesión exitoso! Redirigiendo...', 'success');

      // Esperar un momento antes de redirigir
      setTimeout(() => {
        // Redirigir según el rol del usuario
        if (userData.rol === 'estudiante') {
          window.location.href = 'MenuPE.html';
        } else if (userData.rol === 'trabajadora') {
          window.location.href = 'gestion.html';
        } else {
          // Por defecto, ir al menú principal
          window.location.href = 'MenuPE.html';
        }
      }, 1500);

    } catch (error) {
      console.error('Error en el login:', error);
      showMessage('Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo.', 'error');

      // Rehabilitar botón
      btnLogin.disabled = false;
      btnLogin.classList.remove('loading');
      btnLogin.textContent = 'Iniciar Sesión';
    }
  });

  // Prevenir envío con Enter en campos de texto (opcional)
  const inputs = loginForm.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        loginForm.dispatchEvent(new Event('submit'));
      }
    });
  });

  console.log('Script de login cargado correctamente');
});
