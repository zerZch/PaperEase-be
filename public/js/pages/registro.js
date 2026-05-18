document.addEventListener('DOMContentLoaded', async () => {
  const API_BASE_URL = window.location.origin;

  const roleBtns = document.querySelectorAll('.role-btn');
  const registroForm = document.getElementById('registroForm');
  const messageContainer = document.getElementById('messageContainer');
  const btnRegistro = document.getElementById('btnRegistro');

  let selectedRole = 'estudiante';
  let catalogosCargados = false;

  async function cargarCatalogos() {
    if (catalogosCargados) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/config`);
      const data = await res.json();

      const generoSelect = document.getElementById('idGenero');
      if (generoSelect && data.generos && !data.generos.error) {
        generoSelect.innerHTML = '<option value="">Selecciona tu género</option>';
        data.generos.forEach(g => {
          generoSelect.innerHTML += `<option value="${g.IdGenero}">${g.Genero}</option>`;
        });
      }

      const facultadSelect = document.getElementById('facultad');
      if (facultadSelect && data.facultades && !data.facultades.error) {
        facultadSelect.innerHTML = '<option value="">Selecciona tu facultad</option>';
        data.facultades.forEach(f => {
          facultadSelect.innerHTML += `<option value="${f.IdFacultad}">${f.Facultad}</option>`;
        });
      }

      catalogosCargados = true;
    } catch (err) {
      console.error('Error al cargar catálogos:', err);

      const generoSelect = document.getElementById('idGenero');
      if (generoSelect) generoSelect.innerHTML = '<option value="">Error al cargar</option>';

      const facultadSelect = document.getElementById('facultad');
      if (facultadSelect) facultadSelect.innerHTML = '<option value="">Error al cargar</option>';
    }
  }

  await cargarCatalogos();

  roleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      roleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedRole = btn.getAttribute('data-role');

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
        facultadSelect.value = '';
      }
    });
  });

  function showMessage(message, type = 'error') {
    messageContainer.textContent = message;
    messageContainer.className = `message ${type} show`;
    setTimeout(() => {
      messageContainer.classList.remove('show');
    }, 5000);
  }

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@utp\.ac\.pa$/;
    return emailRegex.test(email);
  }

  function validateCedula(cedula) {
    const cedulaRegex = /^\d{1,2}-\d{1,5}-\d{1,6}$/;
    return cedulaRegex.test(cedula.trim());
  }

  function validatePassword(password) {
    return password.length >= 6;
  }

  registroForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const cedula = document.getElementById('cedula').value.trim();
    const idGenero = document.getElementById('idGenero').value;
    const facultad = document.getElementById('facultad').value;
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!nombre) { showMessage('Por favor, ingresa tu nombre', 'error'); return; }
    if (!apellido) { showMessage('Por favor, ingresa tu apellido', 'error'); return; }
    if (!idGenero) { showMessage('Por favor, selecciona tu género', 'error'); return; }
    if (!cedula) { showMessage('Por favor, ingresa tu cédula', 'error'); return; }
    if (!validateCedula(cedula)) { showMessage('Por favor, ingresa una cédula válida (formato: 8-123-4567)', 'error'); return; }

    if (selectedRole === 'estudiante' && !facultad) {
      showMessage('Por favor, selecciona tu facultad', 'error');
      return;
    }

    if (!validateEmail(email)) { showMessage('Por favor, ingresa un correo electrónico institucional válido (@utp.ac.pa)', 'error'); return; }
    if (!validatePassword(password)) { showMessage('La contraseña debe tener al menos 6 caracteres', 'error'); return; }
    if (password !== confirmPassword) { showMessage('Las contraseñas no coinciden', 'error'); return; }

    btnRegistro.disabled = true;
    btnRegistro.classList.add('loading');
    btnRegistro.textContent = 'Creando cuenta...';

    try {
      const datosRegistro = {
        nombre,
        apellido,
        cedula,
        email,
        password,
        rol: selectedRole === 'estudiante' ? 1 : 2,
        idGenero: parseInt(idGenero)
      };

      if (selectedRole === 'estudiante') {
        datosRegistro.idFacultad = parseInt(facultad);
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosRegistro)
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.message || data.error || 'Error al crear la cuenta', 'error');
        btnRegistro.disabled = false;
        btnRegistro.classList.remove('loading');
        btnRegistro.textContent = 'Crear Cuenta';
        return;
      }

      showMessage('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.', 'success');
      setTimeout(() => { window.location.href = 'login.html'; }, 2000);

    } catch (error) {
      console.error('Error en el registro:', error);
      showMessage('Ocurrió un error al crear la cuenta. Por favor, intenta de nuevo.', 'error');
      btnRegistro.disabled = false;
      btnRegistro.classList.remove('loading');
      btnRegistro.textContent = 'Crear Cuenta';
    }
  });

  const confirmPasswordInput = document.getElementById('confirmPassword');
  confirmPasswordInput.addEventListener('input', () => {
    const password = document.getElementById('password').value;
    const confirmPassword = confirmPasswordInput.value;
    confirmPasswordInput.style.borderColor = (confirmPassword && password !== confirmPassword) ? '#dc2626' : '#e5e7eb';
  });
});