// registro.js - Lógica para el formulario de registro de PaperEase

document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM
  const roleBtns = document.querySelectorAll('.role-btn');
  const registroForm = document.getElementById('registroForm');
  const messageContainer = document.getElementById('messageContainer');
  const btnRegistro = document.getElementById('btnRegistro');

  let selectedRole = 'estudiante'; // Rol por defecto

  // Manejo de selección de rol
  roleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      // Remover clase active de todos los botones
      roleBtns.forEach(b => b.classList.remove('active'));

      // Agregar clase active al botón seleccionado
      btn.classList.add('active');

      // Guardar rol seleccionado
      selectedRole = btn.getAttribute('data-role');

      console.log('Rol seleccionado:', selectedRole);

      // Actualizar texto descriptivo según el rol
      const roleDesc = document.getElementById('roleDesc');
      if (selectedRole === 'estudiante') {
        roleDesc.textContent = 'Regístrate como estudiante para acceder a programas y servicios';
      } else {
        roleDesc.textContent = 'Regístrate como trabajadora social para gestionar programas';
      }
    });
  });

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

  // Función para validar contraseña
  function validatePassword(password) {
    // Mínimo 6 caracteres
    return password.length >= 6;
  }

  // Manejo del envío del formulario
  registroForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener valores del formulario
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validaciones
    if (!nombre) {
      showMessage('Por favor, ingresa tu nombre completo', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showMessage('Por favor, ingresa un correo electrónico válido', 'error');
      return;
    }

    if (!validatePassword(password)) {
      showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showMessage('Las contraseñas no coinciden', 'error');
      return;
    }

    // Deshabilitar botón mientras se procesa
    btnRegistro.disabled = true;
    btnRegistro.classList.add('loading');
    btnRegistro.textContent = 'Creando cuenta...';

    try {
      // Aquí se haría la llamada al backend para registrar el usuario
      // Por ahora, simulamos un registro exitoso

      // Simulación de llamada al servidor
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Crear objeto de usuario
      const userData = {
        nombre: nombre,
        email: email,
        rol: selectedRole,
        fechaRegistro: new Date().toISOString()
      };

      // Guardar en localStorage (temporal, en producción se guardaría en el servidor)
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', selectedRole);

      // Mostrar mensaje de éxito
      showMessage('¡Cuenta creada exitosamente! Redirigiendo...', 'success');

      // Esperar un momento antes de redirigir
      setTimeout(() => {
        // Redirigir según el rol seleccionado
        if (selectedRole === 'estudiante') {
          // Redirigir al menú principal para estudiantes
          window.location.href = 'MenuPE.html';
        } else if (selectedRole === 'trabajadora') {
          // Redirigir a la página de gestión para trabajadoras sociales
          window.location.href = 'gestion.html';
        }
      }, 1500);

    } catch (error) {
      console.error('Error en el registro:', error);
      showMessage('Ocurrió un error al crear la cuenta. Por favor, intenta de nuevo.', 'error');

      // Rehabilitar botón
      btnRegistro.disabled = false;
      btnRegistro.classList.remove('loading');
      btnRegistro.textContent = 'Crear Cuenta';
    }
  });

  // Validación en tiempo real de confirmación de contraseña
  const confirmPasswordInput = document.getElementById('confirmPassword');
  confirmPasswordInput.addEventListener('input', () => {
    const password = document.getElementById('password').value;
    const confirmPassword = confirmPasswordInput.value;

    if (confirmPassword && password !== confirmPassword) {
      confirmPasswordInput.style.borderColor = '#dc2626';
    } else {
      confirmPasswordInput.style.borderColor = '#e5e7eb';
    }
  });

  console.log('Script de registro cargado correctamente');
});
