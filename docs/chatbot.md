# Chatbot de Navegación Estudiantil - PaperEase

## 📋 Descripción General

El **Chatbot de Navegación Estudiantil** es un asistente virtual inteligente integrado en PaperEase que guía a los estudiantes en la navegación del sitio web y les ayuda a entender cómo usar las funciones principales del sistema de Bienestar Estudiantil.

**Propósito:** No es un chatbot para "charlar" ni ejecutar tareas automáticas, sino un **guía inteligente** que orienta al estudiante paso a paso en las acciones más comunes del portal con mensajes simples y rutas claras.

---

## 🎯 Funcionalidades Principales

El chatbot ayuda a los estudiantes en las siguientes áreas:

### 1. **Ver Programas Disponibles**
- Explica cómo acceder a la sección de Programas
- Informa qué encontrarán (listado, descripción, requisitos)
- Proporciona enlace directo a la página

### 2. **Conocer Requisitos y Aplicar**
- Explica los pasos para aplicar a un programa
- Menciona posibles errores comunes
- Guía sobre documentos necesarios

### 3. **Consultar Estado de Solicitudes**
- Explica cómo acceder a "Mis Solicitudes"
- Aclara el significado de cada estado (Pendiente, En revisión, Aprobada, Rechazada)
- Recuerda iniciar sesión si es necesario

### 4. **Gestionar Notificaciones**
- Indica cómo acceder al panel de notificaciones
- Explica las acciones disponibles
- Menciona que algunas notificaciones llevan a solicitudes o calendario

### 5. **Usar Mensajería**
- Explica cómo comunicarse con trabajadoras sociales
- Informa sobre estados de lectura de mensajes
- Guía hacia la sección de mensajería

### 6. **Consultar Calendario y Eventos**
- Informa sobre eventos disponibles
- Explica cómo acceder al calendario
- Menciona tipos de eventos (ferias, talleres, etc.)

### 7. **Ayuda General**
- Proporciona orientación cuando no entiende la consulta
- Ofrece opciones principales de navegación
- Guía hacia la sección de ayuda

---

## 🏗️ Estructura de Archivos

```
frontend/src/
├── css/
│   └── chatbot.css          # Estilos del chatbot (responsive, animaciones)
├── js/
│   └── chatbot.js           # Lógica del chatbot (clase StudentChatbot)
└── MenuPE.html              # Página principal (integración del chatbot)
```

### **chatbot.js** (Lógica Principal)
- **Clase:** `StudentChatbot`
- **Métodos principales:**
  - `init()`: Inicializa el chatbot
  - `createChatbotUI()`: Crea la interfaz HTML
  - `processUserIntent()`: Procesa y reconoce intenciones del usuario
  - `matchIntent()`: Compara mensaje con palabras clave
  - `addMessage()`: Agrega mensajes a la conversación
  - `handleQuickReply()`: Maneja botones de respuesta rápida

### **chatbot.css** (Estilos)
- Variables CSS personalizadas que coinciden con el diseño de PaperEase
- Diseño responsive para móviles, tablets y desktop
- Animaciones suaves y modernas
- Soporte opcional para modo oscuro
- Accesibilidad (prefers-reduced-motion)

---

## 🧠 Sistema de Reconocimiento de Intenciones

El chatbot utiliza un sistema de **matching basado en palabras clave** para identificar la intención del usuario:

### Intenciones Soportadas

| Intención | Palabras Clave | Acción |
|-----------|----------------|--------|
| **Ver Programas** | programa, programas, ver programa, qué programa | Redirige a Programas.html |
| **Aplicar** | aplicar, aplico, solicitar, cómo aplicar, postular | Explica pasos y redirige a Programas/Formulario |
| **Estado de Solicitudes** | solicitud, solicitudes, estado, aprobada, rechazada, pendiente | Redirige a Solicitudes.html |
| **Requisitos** | requisito, requisitos, documentos, qué necesito | Explica requisitos y redirige a Programas |
| **Notificaciones** | notificación, notificaciones, aviso, alerta | Explica sistema de notificaciones |
| **Mensajería** | mensaje, mensajería, hablar, trabajadora social | Explica sistema de mensajería |
| **Calendario/Eventos** | calendario, evento, eventos, actividad, fecha | Explica calendario y redirige a Eventos.html |
| **Registro/Login** | registro, registrar, login, iniciar sesión, entrar | Redirige a Registro.html o Login.html |
| **Ayuda General** | ayuda, no sé, no entiendo, cómo funciona | Muestra opciones principales |
| **Saludos** | hola, buenas, buenos días, hey | Saluda y muestra opciones |
| **Despedidas** | gracias, ok, entendido, adiós, bye | Se despide amablemente |

---

## 💬 Comportamiento del Chatbot

### Principios de Diseño

1. **Tono Amigable:** Habla como un asistente universitario cercano
2. **Respuestas Breves:** Mensajes concisos y fáciles de entender
3. **Orientación, No Ejecución:** Guía al usuario, no procesa datos ni formularios
4. **Botones de Acción Rápida:** Proporciona botones para facilitar la navegación
5. **Privacidad:** No solicita datos personales

### Flujo de Conversación

```
Usuario escribe mensaje
    ↓
Chatbot detecta intención (matchIntent)
    ↓
Chatbot genera respuesta contextual
    ↓
Muestra botones de acción rápida (quick replies)
    ↓
Usuario hace clic en botón o escribe nuevo mensaje
    ↓
Si es navegación → Redirige a la página correspondiente
Si es otra consulta → Vuelve a procesar intención
```

### Ejemplo de Interacción

```
👤 Usuario: "¿Dónde veo los programas?"

🤖 Chatbot: "Puedes ver todos los programas disponibles en la
            sección Programas. Ahí encontrarás los requisitos
            de cada uno."
            [Ir a Programas]

👤 Usuario: *Hace clic en "Ir a Programas"*

🤖 Chatbot: "Te estoy redirigiendo a Programas..."
            → Navega a Programas.html
```

---

## 🛠️ Cómo Expandir el Chatbot

### 1. Agregar Nuevas Intenciones

Para agregar una nueva intención, modifica el método `processUserIntent()` en `chatbot.js`:

```javascript
// Ejemplo: Agregar intención para "Becas"
if (this.matchIntent(lowerMessage, ['beca', 'becas', 'apoyo económico', 'ayuda económica'])) {
  return {
    text: 'Las becas están disponibles en la sección de Programas...',
    isBot: true,
    quickReplies: [
      { text: 'Ver Becas', action: 'navigate', url: 'Programas.html?tipo=becas' }
    ]
  };
}
```

### 2. Modificar Respuestas Existentes

Busca la intención en el método `processUserIntent()` y edita el texto de respuesta:

```javascript
// Encontrar:
if (this.matchIntent(lowerMessage, ['programa', 'programas', ...])) {
  return {
    text: 'Nuevo texto de respuesta...',  // Modificar aquí
    isBot: true,
    quickReplies: [...]
  };
}
```

### 3. Agregar Nuevos Botones de Acción Rápida

Los botones se definen en el array `quickReplies`:

```javascript
quickReplies: [
  { text: 'Texto del Botón', action: 'navigate', url: 'Pagina.html' },
  { text: 'Otro Botón', action: 'custom_action' }
]
```

**Tipos de acciones:**
- `navigate`: Redirige a una URL
- `ver_programas`, `mis_solicitudes`, `como_aplicar`, `ayuda`: Acciones predefinidas
- `understood`: No hace nada (solo cierra la interacción)

### 4. Personalizar Estilos

Modifica las variables CSS en `chatbot.css`:

```css
:root {
  --chatbot-primary: #4D869C;        /* Color principal */
  --chatbot-secondary: #7AB2B2;      /* Color secundario */
  --chatbot-bg: #ffffff;             /* Fondo del chatbot */
  --chatbot-user-bg: #EEF7FF;        /* Fondo mensajes usuario */
  /* ... más variables ... */
}
```

### 5. Activar en Otras Páginas

Por defecto, el chatbot solo aparece en `MenuPE.html`. Para activarlo en otras páginas:

```javascript
// En chatbot.js, modificar la condición de inicialización:
document.addEventListener('DOMContentLoaded', () => {
  // Activar en múltiples páginas
  const allowedPages = ['MenuPE.html', 'Programas.html', 'Solicitudes.html'];
  const currentPage = window.location.pathname.split('/').pop();

  if (allowedPages.includes(currentPage) || currentPage === '') {
    const chatbot = new StudentChatbot();
    window.papereaseChatbot = chatbot;
  }
});
```

---

## 🎨 Personalización de Estilos

### Cambiar Colores del Chatbot

```css
/* En chatbot.css */
.chatbot-toggle {
  background: linear-gradient(135deg, #TU-COLOR-1 0%, #TU-COLOR-2 100%);
}
```

### Ajustar Tamaño del Chatbot

```css
/* En chatbot.css */
.chatbot-window {
  width: 420px;           /* Ancho (default: 380px) */
  height: 650px;          /* Alto (default: 600px) */
}
```

### Cambiar Animaciones

```css
/* Desactivar animación de pulso */
.chatbot-toggle {
  animation: none;  /* Quitar: animation: pulse 2s ease-in-out infinite; */
}
```

---

## 🔒 Reglas de Negocio

### Restricciones del Chatbot

1. ✅ **SÍ puede:**
   - Guiar y orientar al estudiante
   - Explicar cómo usar las funciones
   - Redirigir a páginas específicas
   - Aclarar significados de estados y términos

2. ❌ **NO puede:**
   - Solicitar datos personales
   - Procesar formularios ni adjuntos
   - Modificar datos del estudiante
   - Aprobar o rechazar solicitudes
   - Enviar mensajes a trabajadoras sociales directamente

### Manejo de Autenticación

Cuando una acción requiere estar autenticado (ej: ver solicitudes), el chatbot debe indicarlo:

```javascript
// Ejemplo en processUserIntent():
return {
  text: 'Para ver tus solicitudes necesitas iniciar sesión.',
  isBot: true,
  quickReplies: [
    { text: 'Iniciar Sesión', action: 'navigate', url: 'Login.html' }
  ]
};
```

---

## 📱 Responsive Design

El chatbot está completamente optimizado para:

- **Desktop:** Ventana flotante en esquina inferior derecha (380x600px)
- **Tablet:** Ajuste automático de tamaño
- **Mobile:** Ocupa casi toda la pantalla con márgenes pequeños

### Breakpoints

```css
/* Mobile pequeño: < 360px */
@media (max-width: 360px) { ... }

/* Mobile: < 480px */
@media (max-width: 480px) { ... }

/* Tablet: 481px - 768px */
/* (estilos por defecto) */

/* Desktop: > 768px */
/* (estilos por defecto) */
```

---

## 🐛 Debugging y Testing

### Acceder al Chatbot en la Consola

El chatbot está disponible globalmente para debugging:

```javascript
// En la consola del navegador:
console.log(window.papereaseChatbot);

// Ver historial de conversación:
console.log(window.papereaseChatbot.conversationHistory);

// Simular mensaje:
window.papereaseChatbot.addMessage({
  text: 'Mensaje de prueba',
  isBot: true
});
```

### Probar Intenciones

```javascript
// Probar detección de intenciones:
const response = window.papereaseChatbot.processUserIntent('ver programas');
console.log(response);
```

---

## ✅ Checklist de Implementación

- [x] Crear archivo `chatbot.js` con lógica de intenciones
- [x] Crear archivo `chatbot.css` con estilos responsive
- [x] Integrar chatbot en `MenuPE.html`
- [x] Implementar sistema de reconocimiento de intenciones
- [x] Agregar botones de respuesta rápida (quick replies)
- [x] Diseñar interfaz moderna y amigable
- [x] Optimizar para dispositivos móviles
- [x] Documentar funcionamiento y extensibilidad

---

## 🚀 Próximas Mejoras (Futuro)

### Posibles Expansiones:

1. **Integración con Backend:**
   - Almacenar historial de conversaciones
   - Análisis de métricas de uso
   - Respuestas personalizadas según perfil del estudiante

2. **IA Avanzada:**
   - Implementar NLP (procesamiento de lenguaje natural)
   - Usar APIs de OpenAI, Dialogflow o similares
   - Reconocimiento de intenciones más robusto

3. **Funcionalidades Adicionales:**
   - Búsqueda en tiempo real de programas
   - Responder preguntas frecuentes desde una base de conocimiento
   - Notificaciones proactivas del chatbot
   - Soporte multiidioma (español/inglés)

4. **Mejoras de UX:**
   - Indicador de "escribiendo..."
   - Sugerencias automáticas mientras el usuario escribe
   - Historial persistente (localStorage)
   - Modo de voz (speech-to-text)

---

## 📞 Soporte

Para preguntas o problemas con el chatbot:

- **Repositorio:** [PaperEase GitHub](https://github.com/zerZch/PaperEase-be)
- **Documentación:** Este archivo README
- **Contacto:** Equipo de desarrollo de PaperEase

---

## 📄 Licencia

Este chatbot es parte del proyecto PaperEase y está sujeto a la misma licencia del proyecto principal.

---

**Última actualización:** Noviembre 2025
**Versión:** 1.0.0
**Autor:** PaperEase Development Team
