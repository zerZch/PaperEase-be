// notificaciones.js - Sistema de notificaciones en tiempo real para PaperEase

(function() {
  'use strict';

  // ============================================
  // VARIABLES GLOBALES
  // ============================================
  let socket = null;
  let cedulaEstudiante = null;  // CAMBIO: Ahora usamos cedula en vez de idEstudiante
  const API_BASE = 'http://localhost:3000';

  // Elementos del DOM
  const btnNotificaciones = document.getElementById('btnNotificaciones');
  const panelNotificaciones = document.getElementById('panelNotificaciones');
  const listaNotificaciones = document.getElementById('listaNotificaciones');
  const badgeNotificaciones = document.getElementById('badgeNotificaciones');
  const btnMarcarTodasLeidas = document.getElementById('btnMarcarTodasLeidas');

  // ============================================
  // INICIALIZACIÓN
  // ============================================
  document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔔 Inicializando sistema de notificaciones...');

    // Verificar que el usuario está autenticado
    if (typeof getCurrentUser !== 'function' || typeof getAuthToken !== 'function') {
      console.warn('⚠️ authHelper.js no está cargado');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      console.warn('⚠️ Usuario no autenticado');
      return;
    }

    // CAMBIO: Obtener la cédula del usuario desde el endpoint /api/auth/me
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:3000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        cedulaEstudiante = userData.Cedula;
        console.log('✅ Usuario autenticado con cédula:', cedulaEstudiante);
      } else {
        console.warn('⚠️ No se pudo obtener la cédula del usuario');
        return;
      }
    } catch (error) {
      console.error('❌ Error al obtener datos del usuario:', error);
      return;
    }

    // Solo inicializar notificaciones para estudiantes (rol 1)
    if (user.rol !== 1) {
      console.log('ℹ️ Usuario no es estudiante, notificaciones deshabilitadas');
      if (btnNotificaciones) {
        btnNotificaciones.style.display = 'none';
      }
      return;
    }

    // Inicializar Socket.IO
    inicializarSocketIO();

    // Cargar notificaciones iniciales
    cargarNotificaciones();

    // Configurar eventos del DOM
    configurarEventos();
  });

  // ============================================
  // SOCKET.IO
  // ============================================
  function inicializarSocketIO() {
    try {
      socket = io(API_BASE, {
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        console.log('🔌 Conectado a Socket.IO');
        // CAMBIO: Registrar al estudiante en su sala usando cedula
        socket.emit('registrar_estudiante', cedulaEstudiante);
      });

      socket.on('disconnect', () => {
        console.log('🔌 Desconectado de Socket.IO');
      });

      // Escuchar nuevas notificaciones
      socket.on('nueva_notificacion', (notificacion) => {
        console.log('🔔 Nueva notificación recibida:', notificacion);

        // Actualizar el badge
        actualizarConteo();

        // Mostrar notificación en el navegador si está permitido
        mostrarNotificacionNavegador(notificacion);

        // Reproducir sonido (opcional)
        reproducirSonido();

        // Si el panel está abierto, agregar la notificación
        if (panelNotificaciones && panelNotificaciones.style.display !== 'none') {
          agregarNotificacionAlPanel(notificacion);
        }
      });

    } catch (error) {
      console.error('❌ Error al inicializar Socket.IO:', error);
    }
  }

  // ============================================
  // CONFIGURAR EVENTOS
  // ============================================
  function configurarEventos() {
    // Toggle del panel de notificaciones
    if (btnNotificaciones) {
      btnNotificaciones.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePanel();
      });
    }

    // Cerrar panel al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (panelNotificaciones &&
          panelNotificaciones.style.display !== 'none' &&
          !panelNotificaciones.contains(e.target) &&
          !btnNotificaciones.contains(e.target)) {
        cerrarPanel();
      }
    });

    // Marcar todas como leídas
    if (btnMarcarTodasLeidas) {
      btnMarcarTodasLeidas.addEventListener('click', marcarTodasComoLeidas);
    }
  }

  // ============================================
  // FUNCIONES DEL PANEL
  // ============================================
  function togglePanel() {
    if (panelNotificaciones.style.display === 'none') {
      abrirPanel();
    } else {
      cerrarPanel();
    }
  }

  function abrirPanel() {
    panelNotificaciones.style.display = 'block';
    cargarNotificaciones();
  }

  function cerrarPanel() {
    panelNotificaciones.style.display = 'none';
  }

  // ============================================
  // CARGAR NOTIFICACIONES
  // ============================================
  async function cargarNotificaciones() {
    try {
      const token = getAuthToken();
      // CAMBIO: Usar cedula en vez de idEstudiante
      const response = await fetch(`${API_BASE}/api/notificaciones/${cedulaEstudiante}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar notificaciones');
      }

      const notificaciones = await response.json();
      console.log(`✅ ${notificaciones.length} notificaciones cargadas`);

      renderizarNotificaciones(notificaciones);
      actualizarConteo();

    } catch (error) {
      console.error('❌ Error al cargar notificaciones:', error);
      listaNotificaciones.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 20px;">Error al cargar notificaciones</p>';
    }
  }

  // ============================================
  // RENDERIZAR NOTIFICACIONES
  // ============================================
  function renderizarNotificaciones(notificaciones) {
    if (notificaciones.length === 0) {
      listaNotificaciones.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 20px;">No tienes notificaciones</p>';
      return;
    }

    listaNotificaciones.innerHTML = '';

    notificaciones.forEach(notif => {
      agregarNotificacionAlPanel(notif);
    });
  }

  function agregarNotificacionAlPanel(notif) {
    const notifElement = document.createElement('div');
    notifElement.className = 'notificacion-item';
    notifElement.dataset.id = notif.id_notificacion;
    notifElement.style.cssText = `
      padding: 15px;
      border-bottom: 1px solid #e5e7eb;
      background: ${notif.leida ? '#ffffff' : '#eff6ff'};
      cursor: pointer;
      transition: background 0.2s;
    `;

    // Determinar el icono según el tipo
    let icono = 'info';
    let colorIcono = '#3b82f6';
    if (notif.tipo === 'aprobada') {
      icono = 'check-circle';
      colorIcono = '#10b981';
    } else if (notif.tipo === 'rechazada') {
      icono = 'x-circle';
      colorIcono = '#ef4444';
    }

    notifElement.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
            <i data-lucide="${icono}" style="width: 20px; height: 20px; color: ${colorIcono};"></i>
            <strong style="font-size: 14px; color: #111827;">${notif.titulo}</strong>
            ${!notif.leida ? '<span style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; display: inline-block;"></span>' : ''}
          </div>
          <p style="margin: 5px 0; font-size: 13px; color: #6b7280;">${notif.mensaje}</p>
          <span style="font-size: 11px; color: #9ca3af;">${formatearFecha(notif.fecha_creacion)}</span>
        </div>
        <button class="btn-eliminar-notif" data-id="${notif.id_notificacion}" style="background: none; border: none; cursor: pointer; padding: 4px; color: #9ca3af; transition: color 0.2s;">
          <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
        </button>
      </div>
    `;

    // Evento: marcar como leída al hacer clic
    notifElement.addEventListener('click', (e) => {
      if (!e.target.closest('.btn-eliminar-notif') && !notif.leida) {
        marcarComoLeida(notif.id_notificacion, notifElement);
      }
    });

    // Evento: eliminar notificación
    const btnEliminar = notifElement.querySelector('.btn-eliminar-notif');
    btnEliminar.addEventListener('click', (e) => {
      e.stopPropagation();
      eliminarNotificacion(notif.id_notificacion, notifElement);
    });

    // Insertar al principio de la lista
    listaNotificaciones.insertBefore(notifElement, listaNotificaciones.firstChild);

    // Inicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // ============================================
  // MARCAR COMO LEÍDA
  // ============================================
  async function marcarComoLeida(id, element) {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/api/notificaciones/${id}/leer`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al marcar como leída');
      }

      // Actualizar visualmente
      element.style.background = '#ffffff';
      const badge = element.querySelector('span[style*="background: #3b82f6"]');
      if (badge) badge.remove();

      actualizarConteo();
      console.log(`✅ Notificación ${id} marcada como leída`);

    } catch (error) {
      console.error('❌ Error al marcar como leída:', error);
    }
  }

  // ============================================
  // MARCAR TODAS COMO LEÍDAS
  // ============================================
  async function marcarTodasComoLeidas() {
    try {
      const token = getAuthToken();
      // CAMBIO: Usar cedula en vez de idEstudiante
      const response = await fetch(`${API_BASE}/api/notificaciones/estudiante/${cedulaEstudiante}/leer-todas`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al marcar todas como leídas');
      }

      console.log('✅ Todas las notificaciones marcadas como leídas');
      cargarNotificaciones();

    } catch (error) {
      console.error('❌ Error al marcar todas como leídas:', error);
    }
  }

  // ============================================
  // ELIMINAR NOTIFICACIÓN
  // ============================================
  async function eliminarNotificacion(id, element) {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/api/notificaciones/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar notificación');
      }

      // Animación de salida
      element.style.opacity = '0';
      element.style.transform = 'translateX(100%)';
      element.style.transition = 'all 0.3s';

      setTimeout(() => {
        element.remove();
        actualizarConteo();

        // Si no quedan notificaciones, mostrar mensaje
        if (listaNotificaciones.children.length === 0) {
          listaNotificaciones.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 20px;">No tienes notificaciones</p>';
        }
      }, 300);

      console.log(`✅ Notificación ${id} eliminada`);

    } catch (error) {
      console.error('❌ Error al eliminar notificación:', error);
    }
  }

  // ============================================
  // ACTUALIZAR CONTEO
  // ============================================
  async function actualizarConteo() {
    try {
      const token = getAuthToken();
      // CAMBIO: Usar cedula en vez de idEstudiante
      const response = await fetch(`${API_BASE}/api/notificaciones/${cedulaEstudiante}/conteo`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener conteo');
      }

      const data = await response.json();
      const noLeidas = data.no_leidas;

      if (noLeidas > 0) {
        badgeNotificaciones.textContent = noLeidas > 99 ? '99+' : noLeidas;
        badgeNotificaciones.style.display = 'block';
      } else {
        badgeNotificaciones.style.display = 'none';
      }

    } catch (error) {
      console.error('❌ Error al actualizar conteo:', error);
    }
  }

  // ============================================
  // UTILIDADES
  // ============================================
  function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    const ahora = new Date();
    const diff = ahora - fecha;

    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas} h`;
    if (dias < 7) return `Hace ${dias} días`;

    return fecha.toLocaleDateString('es-PA');
  }

  function mostrarNotificacionNavegador(notificacion) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notificacion.titulo, {
        body: notificacion.mensaje,
        icon: '/imagenes/logo.png'
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(notificacion.titulo, {
            body: notificacion.mensaje,
            icon: '/imagenes/logo.png'
          });
        }
      });
    }
  }

  function reproducirSonido() {
    // Opcional: reproducir un sonido de notificación
    // const audio = new Audio('/sounds/notification.mp3');
    // audio.play().catch(e => console.log('No se pudo reproducir sonido'));
  }

})();
