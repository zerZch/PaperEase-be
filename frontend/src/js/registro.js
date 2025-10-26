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
      const facultadGroup = document.getElementById('facultadGroup');
      const facultadSelect = document.getElementById('facultad');

      if (selectedRole === 'estudiante') {
        roleDesc.textContent = 'Regístrate como estudiante para acceder a programas y servicios';
        facultadGroup.style.display = 'block';
        facultadSelect.required = true;
      } else {
        roleDesc.textContent = 'Regístrate como trabajadora social para gestionar programas';
        facultadGroup.style.display = 'none';
        facultadSelect.required = false;
        facultadSelect.value = ''; // Limpiar selección
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

  // Función para validar email institucional
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@utp\.ac\.pa$/;
    return emailRegex.test(email);
  }

  // Función para validar formato de cédula
  function validateCedula(cedula) {
    // Formato: N-NNN-NNNN o NN-NNNN-NNNN o variantes similares
    const cedulaRegex = /^\d{1,2}-\d{1,5}-\d{1,6}$/;
    return cedulaRegex.test(cedula.trim());
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
    const apellido = document.getElementById('apellido').value.trim();
    const cedula = document.getElementById('cedula').value.trim();
    const facultad = document.getElementById('facultad').value;
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validaciones
    if (!nombre) {
      showMessage('Por favor, ingresa tu nombre', 'error');
      return;
    }

    if (!apellido) {
      showMessage('Por favor, ingresa tu apellido', 'error');
      return;
    }

    if (!cedula) {
      showMessage('Por favor, ingresa tu cédula', 'error');
      return;
    }

    if (!validateCedula(cedula)) {
      showMessage('Por favor, ingresa una cédula válida (formato: 8-123-4567)', 'error');
      return;
    }

    // Validar facultad solo si es estudiante
    if (selectedRole === 'estudiante' && !facultad) {
      showMessage('Por favor, selecciona tu facultad', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showMessage('Por favor, ingresa un correo electrónico institucional válido (@utp.ac.pa)', 'error');
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
      // Preparar datos para enviar
      const datosRegistro = {
        nombre: nombre,
        apellido: apellido,
        cedula: cedula,
        email: email,
        password: password,
        rol: selectedRole === 'estudiante' ? 1 : 2
      };

      // Agregar facultad solo si es estudiante
      if (selectedRole === 'estudiante') {
        datosRegistro.facultad = parseInt(facultad);
      }

      // Llamada al backend para registrar el usuario
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosRegistro)
      });

      const data = await response.json();

      if (!response.ok) {
        // Si hay error, mostrar mensaje
        showMessage(data.error || 'Error al crear la cuenta', 'error');

        // Rehabilitar botón
        btnRegistro.disabled = false;
        btnRegistro.classList.remove('loading');
        btnRegistro.textContent = 'Crear Cuenta';
        return;
      }

      // Registro exitoso - Guardar datos en localStorage
      localStorage.setItem('authToken', data.token || '');
      localStorage.setItem('currentUser', JSON.stringify(data.usuario));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', data.usuario.tipoUsuario);

      // Mostrar mensaje de éxito
      showMessage('¡Cuenta creada exitosamente! Redirigiendo...', 'success');

      // Esperar un momento antes de redirigir
      setTimeout(() => {
        // Redirigir según el rol seleccionado
        if (data.usuario.rol === 1) {
          // Redirigir al menú principal para estudiantes
          window.location.href = 'MenuPE.html';
        } else if (data.usuario.rol === 2) {
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
