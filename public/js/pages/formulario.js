(function () {
  if (window.PaperEaseFormularioManaged) return;
  window.PaperEaseFormularioManaged = true;

  const API_URL = window.location.origin + '/api';
  const PROGRAM_NAME_OVERRIDES = {
    6: 'Apoyo en Medicamento'
  };

  const FALLBACK_CONFIG = {
    tiposPrograma: [
      { IdTipoP: 1, TipoPrograma: 'Salud' },
      { IdTipoP: 2, TipoPrograma: 'Promocion Social' }
    ],
    programas: [
      { IdPrograma: 1, Programa: 'Consejeria Personal', IdTipoP: 1 },
      { IdPrograma: 2, Programa: 'Banco de Sangre', IdTipoP: 1 },
      { IdPrograma: 3, Programa: 'Ayuda en Gastos Medicos', IdTipoP: 1 },
      { IdPrograma: 4, Programa: 'Feria de Salud', IdTipoP: 1 },
      { IdPrograma: 5, Programa: 'Compra de Lentes', IdTipoP: 1 },
      { IdPrograma: 6, Programa: 'Apoyo en Medicamento', IdTipoP: 1 },
      { IdPrograma: 7, Programa: 'Poliza de Salud', IdTipoP: 1 },
      { IdPrograma: 8, Programa: 'Matricula', IdTipoP: 1 },
      { IdPrograma: 9, Programa: 'Canasta Navidena', IdTipoP: 2 },
      { IdPrograma: 10, Programa: 'Campana de Fortalecimiento de Valores', IdTipoP: 2 },
      { IdPrograma: 11, Programa: 'Campana de Concienciacion de Instalaciones', IdTipoP: 2 },
      { IdPrograma: 12, Programa: 'Feria de Empleo', IdTipoP: 2 },
      { IdPrograma: 13, Programa: 'Apoyo en Casos de Siniestros', IdTipoP: 2 }
    ]
  };

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function getToken() {
    return typeof getAuthToken === 'function' ? getAuthToken() : localStorage.getItem('authToken');
  }

  function showMessage(message, isError) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;

    messageDiv.style.display = 'block';
    messageDiv.textContent = message;
    messageDiv.style.backgroundColor = isError ? '#fee2e2' : '#dcfce7';
    messageDiv.style.color = isError ? '#dc2626' : '#166534';
    messageDiv.style.border = isError ? '1px solid #fca5a5' : '1px solid #86efac';
  }

  function setLoading(show) {
    const loadingDiv = document.getElementById('loading');
    if (!loadingDiv) return;

    loadingDiv.style.display = show ? 'block' : 'none';
    loadingDiv.textContent = show ? 'Enviando solicitud...' : '';
  }

  function displayProgramName(programa) {
    return PROGRAM_NAME_OVERRIDES[Number(programa.IdPrograma)] || programa.Programa;
  }

  function renderMissingSelection() {
    const missingParamsDiv = document.getElementById('missingParams');
    const btnEnviar = document.getElementById('btnEnviar');
    if (btnEnviar) btnEnviar.disabled = true;
    if (!missingParamsDiv) return;

    missingParamsDiv.style.display = 'block';
    missingParamsDiv.innerHTML = [
      '<div class="error-missing-params">',
      '<h3>Debes seleccionar un programa primero</h3>',
      '<p>Para hacer una solicitud, elige una categoria y un programa desde la pagina de Programas.</p>',
      '<a href="/programas.html" class="cta-primary" style="display:inline-block; text-decoration:none; padding:10px 24px; background:#4D869C; color:white; border-radius:6px;">Ver Programas</a>',
      '</div>'
    ].join('');
  }

  function renderSelection(tipo, programa) {
    const tipoHidden = document.getElementById('tipoProgramaHidden');
    const programaHidden = document.getElementById('programaHidden');
    const btnEnviar = document.getElementById('btnEnviar');
    const bannerDiv = document.getElementById('bannerPrograma');

    if (tipoHidden) tipoHidden.value = String(tipo.IdTipoP);
    if (programaHidden) programaHidden.value = String(programa.IdPrograma);
    if (btnEnviar) btnEnviar.disabled = false;

    if (!bannerDiv) return;

    const nombrePrograma = displayProgramName(programa);
    bannerDiv.style.display = 'block';
    bannerDiv.innerHTML = [
      '<div class="solicitud-meta">',
      '<span class="meta-badge">' + tipo.TipoPrograma + '</span>',
      '<h3 class="meta-title">' + nombrePrograma + '</h3>',
      '<p class="meta-note">Esta selecci&oacute;n no se puede cambiar en este paso. Si necesitas modificarla, cancela y vuelve a seleccionar desde la p&aacute;gina de Programas.</p>',
      '</div>'
    ].join('');
  }

  async function loadConfig() {
    try {
      const response = await fetch(API_URL + '/config');
      if (!response.ok) throw new Error('No se pudo cargar la configuracion');
      return await response.json();
    } catch (error) {
      console.warn('Usando configuracion local del formulario:', error);
      return FALLBACK_CONFIG;
    }
  }

  async function loadProfile() {
    const token = getToken();
    if (!token) {
      showMessage('Debes iniciar sesion para hacer una solicitud.', true);
      window.setTimeout(() => { window.location.href = '/login.html'; }, 1200);
      return;
    }

    try {
      const response = await fetch(API_URL + '/auth/me', {
        headers: { Authorization: 'Bearer ' + token }
      });
      const data = await response.json();

      if (!response.ok || !data.autenticado) {
        showMessage('Debes iniciar sesion para hacer una solicitud.', true);
        window.setTimeout(() => { window.location.href = '/login.html'; }, 1200);
        return;
      }

      // Datos del perfil ya no se muestran en un bloque separado;
      // se integran directamente en el banner por el script inline.
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      showMessage('No se pudo verificar tu sesion. Intenta iniciar sesion nuevamente.', true);
    }
  }

  async function submitForm(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const token = getToken();
    const tipoHidden = document.getElementById('tipoProgramaHidden');
    const programaHidden = document.getElementById('programaHidden');
    const fileInput = document.getElementById('archivo');
    const btnEnviar = document.getElementById('btnEnviar');

    if (!token) {
      showMessage('Debes iniciar sesion para enviar esta solicitud.', true);
      return;
    }

    if (!tipoHidden?.value || !programaHidden?.value) {
      showMessage('Selecciona un programa desde la pagina de Programas antes de enviar.', true);
      return;
    }

    const formData = new FormData();
    formData.set('tipoPrograma', tipoHidden.value);
    formData.set('programa', programaHidden.value);
    if (fileInput?.files?.length) formData.set('archivo', fileInput.files[0]);

    if (btnEnviar) btnEnviar.disabled = true;
    setLoading(true);

    try {
      const response = await fetch(API_URL + '/formulario', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: formData
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'No se pudo registrar la solicitud.');
      }

      showMessage('Solicitud registrada exitosamente. ID: ' + data.id, false);
      window.setTimeout(() => { window.location.href = '/solicitudes.html'; }, 1200);
    } catch (error) {
      showMessage(error.message || 'Error al enviar la solicitud. Intenta nuevamente.', true);
      if (btnEnviar) btnEnviar.disabled = false;
    } finally {
      setLoading(false);
    }
  }

  ready(async function () {
    const form = document.getElementById('formulario');
    const btnCancelar = document.getElementById('btnCancelar');

    form?.addEventListener('submit', submitForm, true);
    btnCancelar?.addEventListener('click', function (event) {
      event.preventDefault();
      window.location.href = '/programas.html';
    });

    const params = new URLSearchParams(window.location.search);
    const tipoId = Number(params.get('tipo'));
    const programaId = Number(params.get('programa'));

    if (!tipoId || !programaId) {
      renderMissingSelection();
      await loadProfile();
      return;
    }

    const config = await loadConfig();
    const tipo = (config.tiposPrograma || []).find(item => Number(item.IdTipoP) === tipoId);
    const programa = (config.programas || []).find(item => Number(item.IdPrograma) === programaId);

    if (!tipo || !programa || Number(programa.IdTipoP) !== Number(tipo.IdTipoP)) {
      renderMissingSelection();
      await loadProfile();
      return;
    }

    renderSelection(tipo, programa);
    await loadProfile();
  });
})();
