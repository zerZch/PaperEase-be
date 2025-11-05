/**
 * PaperEase Student Navigation Chatbot
 * Chatbot asistente virtual para guiar a los estudiantes en la navegación del sitio web
 */

class StudentChatbot {
  constructor() {
    this.isOpen = false;
    this.conversationHistory = [];
    this.audioContext = null;
    this.init();
  }

  init() {
    this.createChatbotUI();
    this.attachEventListeners();
    this.initAudioContext();
    this.addWelcomeMessage();
  }

  /**
   * Inicializa el contexto de audio para reproducir sonidos
   */
  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API no soportada en este navegador');
    }
  }

  /**
   * Reproduce un sonido de notificación cuando el bot responde
   * Sonido estilo WhatsApp: corto, agudo y limpio
   */
  playNotificationSound() {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configuración del sonido tipo WhatsApp (más agudo y corto)
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime); // Tono más agudo

      // Control de volumen (fade rápido, sonido más corto)
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

      // Reproducir (más corto: 0.15 segundos)
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.15);
    } catch (e) {
      console.warn('Error al reproducir sonido de notificación:', e);
    }
  }

  createChatbotUI() {
    // Contenedor principal del chatbot
    const chatbotContainer = document.createElement('div');
    chatbotContainer.id = 'chatbot-container';
    chatbotContainer.className = 'chatbot-container';
    chatbotContainer.innerHTML = `
      <!-- Botón flotante para abrir el chatbot -->
      <button id="chatbot-toggle" class="chatbot-toggle" aria-label="Abrir asistente virtual">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      <!-- Ventana del chatbot -->
      <div id="chatbot-window" class="chatbot-window">
        <!-- Header -->
        <div class="chatbot-header">
          <div class="chatbot-header-info">
            <div class="chatbot-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 8V4H8"></path>
                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
              </svg>
            </div>
            <div>
              <h3 class="chatbot-title">Asistente PaperEase</h3>
              <p class="chatbot-status">En línea</p>
            </div>
          </div>
          <button id="chatbot-close" class="chatbot-close-btn" aria-label="Cerrar chatbot">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Mensajes -->
        <div id="chatbot-messages" class="chatbot-messages">
          <!-- Los mensajes se agregarán dinámicamente aquí -->
        </div>

        <!-- Input -->
        <div class="chatbot-input-container">
          <input
            type="text"
            id="chatbot-input"
            class="chatbot-input"
            placeholder="Escribe tu pregunta aquí..."
            aria-label="Mensaje para el asistente"
          />
          <button id="chatbot-send" class="chatbot-send-btn" aria-label="Enviar mensaje">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(chatbotContainer);
  }

  attachEventListeners() {
    const toggleBtn = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chatbot-close');
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');

    toggleBtn.addEventListener('click', () => this.toggleChatbot());
    closeBtn.addEventListener('click', () => this.toggleChatbot());
    sendBtn.addEventListener('click', () => this.handleUserMessage());

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleUserMessage();
      }
    });
  }

  toggleChatbot() {
    this.isOpen = !this.isOpen;
    const window = document.getElementById('chatbot-window');
    const toggle = document.getElementById('chatbot-toggle');

    if (this.isOpen) {
      window.classList.add('open');
      toggle.classList.add('hidden');
      document.getElementById('chatbot-input').focus();

      // Reproducir sonido cuando se abre el chat
      this.playNotificationSound();
    } else {
      window.classList.remove('open');
      toggle.classList.remove('hidden');
    }
  }

  addWelcomeMessage() {
    const welcomeMessage = {
      text: '¡Hola! Soy tu asistente virtual de PaperEase. Estoy aquí para ayudarte a navegar por el sitio y entender cómo usar las funciones principales.',
      isBot: true,
      playSound: false, // No reproducir sonido en el mensaje de bienvenida
      quickReplies: [
        { text: 'Ver Programas', action: 'ver_programas' },
        { text: 'Mis Solicitudes', action: 'mis_solicitudes' },
        { text: '¿Cómo aplicar?', action: 'como_aplicar' },
        { text: 'Ayuda', action: 'ayuda' }
      ]
    };
    this.addMessage(welcomeMessage);
  }

  handleUserMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();

    if (!message) return;

    // Agregar mensaje del usuario
    this.addMessage({ text: message, isBot: false });
    input.value = '';

    // Procesar y responder
    setTimeout(() => {
      const response = this.processUserIntent(message);
      this.addMessage(response);
    }, 600);
  }

  processUserIntent(message) {
    const lowerMessage = message.toLowerCase();

    // Detectar intención: Ver programas
    if (this.matchIntent(lowerMessage, ['programa', 'programas', 'ver programa', 'qué programa', 'que programa', 'mostrar programa'])) {
      return {
        text: 'Puedes ver todos los programas disponibles en la sección <strong>Programas</strong>. Ahí encontrarás los requisitos y descripción de cada uno.',
        isBot: true,
        quickReplies: [
          { text: 'Ir a Programas', action: 'navigate', url: 'Programas.html' }
        ]
      };
    }

    // Detectar intención: Aplicar a programa
    if (this.matchIntent(lowerMessage, ['aplicar', 'aplico', 'solicitar', 'solicito', 'como aplicar', 'cómo aplicar', 'postular'])) {
      return {
        text: 'Para aplicar a un programa: <br>1. Selecciona el programa que te interesa<br>2. Revisa los requisitos<br>3. Pulsa "Aplicar"<br>4. Completa el formulario con tus datos y archivos<br><br>Recuerda que debes estar registrado para aplicar.',
        isBot: true,
        quickReplies: [
          { text: 'Ver Programas', action: 'navigate', url: 'Programas.html' },
          { text: 'Formulario', action: 'navigate', url: 'Formulario.html' }
        ]
      };
    }

    // Detectar intención: Mis solicitudes / estado
    if (this.matchIntent(lowerMessage, ['solicitud', 'solicitudes', 'mi solicitud', 'mis solicitudes', 'estado', 'aprobada', 'aprobado', 'rechazada', 'rechazado', 'pendiente', 'en revisión', 'en revision'])) {
      return {
        text: 'Puedes ver el estado de tus solicitudes en la sección <strong>Mis Solicitudes</strong>. Los estados posibles son:<br><br>• <strong>Pendiente:</strong> En espera de revisión<br>• <strong>En revisión:</strong> Siendo evaluada<br>• <strong>Aprobada:</strong> Solicitud aceptada<br>• <strong>Rechazada:</strong> No cumple requisitos<br><br>Necesitas estar registrado para ver tus solicitudes.',
        isBot: true,
        quickReplies: [
          { text: 'Ir a Mis Solicitudes', action: 'navigate', url: 'Solicitudes.html' }
        ]
      };
    }

    // Detectar intención: Requisitos
    if (this.matchIntent(lowerMessage, ['requisito', 'requisitos', 'documentos', 'qué necesito', 'que necesito', 'qué documento', 'que documento'])) {
      return {
        text: 'Cada programa tiene requisitos específicos. Para conocer los requisitos:<br><br>1. Ve a la sección <strong>Programas</strong><br>2. Selecciona el programa que te interesa<br>3. Lee la descripción y requisitos<br><br>Los documentos comunes incluyen: cédula, certificado de matrícula, comprobantes, etc.',
        isBot: true,
        quickReplies: [
          { text: 'Ver Programas', action: 'navigate', url: 'Programas.html' }
        ]
      };
    }

    // Detectar intención: Notificaciones
    if (this.matchIntent(lowerMessage, ['notificacion', 'notificaciones', 'aviso', 'avisos', 'alerta', 'alertas', 'me llegó', 'me llego'])) {
      return {
        text: 'Las notificaciones te informan sobre el estado de tus solicitudes y eventos importantes. Puedes:<br><br>• Ver todas tus notificaciones en el panel superior<br>• Marcarlas como leídas<br>• Algunas te llevan directamente a tu solicitud<br><br>Revisa regularmente tus notificaciones para estar al día.',
        isBot: true,
        quickReplies: [
          { text: 'Entendido', action: 'understood' }
        ]
      };
    }

    // Detectar intención: Mensajería / contacto
    if (this.matchIntent(lowerMessage, ['mensaje', 'mensajería', 'mensajeria', 'hablar', 'escribir', 'contactar', 'comunicar', 'trabajadora social', 'trabajador social'])) {
      return {
        text: 'Puedes comunicarte con tu trabajadora social asignada desde la sección <strong>Mensajería</strong>. Ahí podrás:<br><br>• Ver mensajes enviados y recibidos<br>• Saber cuándo fueron leídos<br>• Enviar nuevos mensajes<br><br>Es importante que mantengas comunicación activa.',
        isBot: true,
        quickReplies: [
          { text: 'Entendido', action: 'understood' }
        ]
      };
    }

    // Detectar intención: Calendario / eventos
    if (this.matchIntent(lowerMessage, ['calendario', 'evento', 'eventos', 'actividad', 'actividades', 'fecha', 'fechas'])) {
      return {
        text: 'En el <strong>Calendario de Eventos</strong> puedes consultar todas las actividades programadas de Bienestar Estudiantil. Encontrarás:<br><br>• Ferias de empleo<br>• Ferias de salud<br>• Charlas y talleres<br>• Otros eventos importantes<br><br>Mantente informado de las próximas actividades.',
        isBot: true,
        quickReplies: [
          { text: 'Ver Eventos', action: 'navigate', url: 'Eventos.html' }
        ]
      };
    }

    // Detectar intención: Registro / Login
    if (this.matchIntent(lowerMessage, ['registro', 'registrar', 'registrarme', 'crear cuenta', 'login', 'iniciar sesión', 'iniciar sesion', 'entrar', 'ingresar'])) {
      return {
        text: 'Para usar todas las funciones de PaperEase necesitas tener una cuenta:<br><br>• <strong>Registrarse:</strong> Si eres nuevo, crea tu cuenta con tus datos<br>• <strong>Iniciar sesión:</strong> Si ya tienes cuenta, ingresa con tu correo y contraseña<br><br>Una vez dentro, podrás aplicar a programas y ver tus solicitudes.',
        isBot: true,
        quickReplies: [
          { text: 'Registrarme', action: 'navigate', url: 'Registro.html' },
          { text: 'Iniciar Sesión', action: 'navigate', url: 'LogIn.html' }
        ]
      };
    }

    // Detectar intención: Ayuda general
    if (this.matchIntent(lowerMessage, ['ayuda', 'ayúdame', 'ayudame', 'no sé', 'no se', 'no entiendo', 'cómo funciona', 'como funciona', 'qué puedo hacer', 'que puedo hacer'])) {
      return {
        text: 'Estoy aquí para ayudarte. Las cosas principales que puedes hacer en PaperEase son:<br><br>• Ver programas disponibles<br>• Aplicar a programas<br>• Revisar tus solicitudes<br>• Comunicarte con trabajadoras sociales<br>• Ver eventos y calendario<br><br>¿Con cuál necesitas ayuda?',
        isBot: true,
        quickReplies: [
          { text: 'Ver Programas', action: 'ver_programas' },
          { text: 'Mis Solicitudes', action: 'mis_solicitudes' },
          { text: 'Aplicar', action: 'como_aplicar' }
        ]
      };
    }

    // Detectar saludos
    if (this.matchIntent(lowerMessage, ['hola', 'buenas', 'buenos días', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos', 'hey', 'ey'])) {
      return {
        text: '¡Hola! ¿En qué puedo ayudarte hoy?',
        isBot: true,
        quickReplies: [
          { text: 'Ver Programas', action: 'ver_programas' },
          { text: 'Mis Solicitudes', action: 'mis_solicitudes' },
          { text: 'Ayuda', action: 'ayuda' }
        ]
      };
    }

    // Detectar despedidas
    if (this.matchIntent(lowerMessage, ['gracias', 'graciass', 'ok', 'vale', 'perfecto', 'entendido', 'listo', 'chao', 'adiós', 'adios', 'hasta luego', 'bye'])) {
      return {
        text: '¡De nada! Si necesitas más ayuda, estaré aquí. ¡Mucho éxito en tus gestiones!',
        isBot: true
      };
    }

    // Si no se reconoce la intención
    return {
      text: 'Hmm, no estoy seguro de cómo ayudarte con eso. Pero puedo guiarte en estas opciones:',
      isBot: true,
      quickReplies: [
        { text: 'Ver Programas', action: 'ver_programas' },
        { text: 'Mis Solicitudes', action: 'mis_solicitudes' },
        { text: 'Cómo Aplicar', action: 'como_aplicar' },
        { text: 'Ayuda General', action: 'ayuda' }
      ]
    };
  }

  matchIntent(message, keywords) {
    return keywords.some(keyword => message.includes(keyword));
  }

  addMessage(messageObj) {
    const messagesContainer = document.getElementById('chatbot-messages');

    // Crear elemento de mensaje
    const messageEl = document.createElement('div');
    messageEl.className = `chatbot-message ${messageObj.isBot ? 'bot-message' : 'user-message'}`;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = messageObj.text;

    messageEl.appendChild(messageContent);

    // Agregar botones de respuesta rápida si existen
    if (messageObj.quickReplies && messageObj.quickReplies.length > 0) {
      const quickRepliesContainer = document.createElement('div');
      quickRepliesContainer.className = 'quick-replies';

      messageObj.quickReplies.forEach(reply => {
        const button = document.createElement('button');
        button.className = 'quick-reply-btn';
        button.textContent = reply.text;

        button.addEventListener('click', () => {
          this.handleQuickReply(reply);
        });

        quickRepliesContainer.appendChild(button);
      });

      messageEl.appendChild(quickRepliesContainer);
    }

    messagesContainer.appendChild(messageEl);

    // Scroll al último mensaje
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Reproducir sonido de notificación si es un mensaje del bot
    // Solo si playSound no está explícitamente establecido en false
    if (messageObj.isBot && messageObj.playSound !== false) {
      this.playNotificationSound();
    }

    // Guardar en historial
    this.conversationHistory.push(messageObj);
  }

  handleQuickReply(reply) {
    // Agregar el mensaje del usuario
    this.addMessage({ text: reply.text, isBot: false });

    // Manejar la acción
    if (reply.action === 'navigate' && reply.url) {
      setTimeout(() => {
        this.addMessage({
          text: `Te estoy redirigiendo a ${reply.url.replace('.html', '')}...`,
          isBot: true
        });
        setTimeout(() => {
          window.location.href = reply.url;
        }, 1000);
      }, 500);
    } else if (reply.action === 'ver_programas') {
      setTimeout(() => {
        const response = this.processUserIntent('ver programas');
        this.addMessage(response);
      }, 500);
    } else if (reply.action === 'mis_solicitudes') {
      setTimeout(() => {
        const response = this.processUserIntent('mis solicitudes');
        this.addMessage(response);
      }, 500);
    } else if (reply.action === 'como_aplicar') {
      setTimeout(() => {
        const response = this.processUserIntent('cómo aplicar');
        this.addMessage(response);
      }, 500);
    } else if (reply.action === 'ayuda') {
      setTimeout(() => {
        const response = this.processUserIntent('ayuda');
        this.addMessage(response);
      }, 500);
    } else if (reply.action === 'understood') {
      // No hacer nada, solo cerrar la conversación
    }
  }
}

// Inicializar el chatbot cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Solo inicializar el chatbot en MenuPE.html (página principal)
  if (window.location.pathname.includes('MenuPE.html') || window.location.pathname === '/' || window.location.pathname === '/frontend/src/' || window.location.pathname === '/frontend/src/index.html') {
    const chatbot = new StudentChatbot();
    // Hacer el chatbot disponible globalmente para debug
    window.papereaseChatbot = chatbot;
  }
});
