import TelegramBot from 'node-telegram-bot-api';

// Token del bot
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8518192400:AAFqTyWwzwHVN6kiFOn_9Kughixi_fCc0Q0';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '5743796914';

// Crear el bot
const bot = new TelegramBot(TOKEN, { polling: true });

// Almacenamiento en memoria
const usuarios = new Map<string, { nombre: string; notificaciones: boolean }>();
const cotizacionesPendientes: any[] = [];

console.log('🤖 Bot iniciado correctamente!');
console.log('📱 Admin Chat ID:', ADMIN_CHAT_ID);

// ============================================
// COMANDO /START - MENÚ PRINCIPAL
// ============================================
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id.toString();
  const nombre = msg.from?.first_name || 'Usuario';

  // Guardar usuario
  usuarios.set(chatId, { nombre, notificaciones: false });
  console.log(`👤 Usuario inició: ${nombre} (${chatId})`);

  const mensaje = `¡Hola *${nombre}*! 👋

Soy el asistente de *Soluciones Digitales*.

🤖 Desarrollo de Chat Bots
🤖 Asistentes Virtuales con IA
🌐 Páginas Web Profesionales
📱 Aplicaciones Móviles

¿En qué puedo ayudarte?`;

  bot.sendMessage(chatId, mensaje, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🛠️ Servicios', callback_data: 'servicios' }],
        [{ text: '📋 Portafolio', callback_data: 'portafolio' }],
        [{ text: '💰 Precios', callback_data: 'precios' }],
        [{ text: '📞 Contacto', callback_data: 'contacto' }],
        [{ text: '🔔 Activar Notificaciones', callback_data: 'activar_notif' }]
      ]
    }
  });
});

// ============================================
// MANEJAR CALLBACKS DE BOTONES
// ============================================
bot.on('callback_query', async (query) => {
  const chatId = query.message?.chat.id.toString();
  const data = query.data;

  if (!chatId) return;

  switch (data) {
    case 'servicios':
      await mostrarServicios(chatId);
      break;
    case 'portafolio':
      await mostrarPortafolio(chatId);
      break;
    case 'precios':
      await mostrarPrecios(chatId);
      break;
    case 'contacto':
      await mostrarContacto(chatId);
      break;
    case 'activar_notif':
      await activarNotificaciones(chatId);
      break;
    case 'serv_chatbots':
    case 'serv_asistentes':
    case 'serv_webs':
    case 'serv_apps':
      await mostrarDetalleServicio(chatId, data.replace('serv_', ''));
      break;
    case 'cotizar_chatbots':
    case 'cotizar_asistentes':
    case 'cotizar_webs':
    case 'cotizar_apps':
      await iniciarCotizacion(chatId, data.replace('cotizar_', ''));
      break;
    case 'volver_menu':
      await mostrarMenuPrincipal(chatId);
      break;
  }

  bot.answerCallbackQuery(query.id);
});

// ============================================
// FUNCIONES DE MENÚS
// ============================================
async function mostrarMenuPrincipal(chatId: string) {
  const usuario = usuarios.get(chatId);
  const nombre = usuario?.nombre || 'Usuario';

  await bot.sendMessage(chatId, `🏠 *Menú Principal*\n\n¿En qué puedo ayudarte, *${nombre}*?`, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🛠️ Servicios', callback_data: 'servicios' }],
        [{ text: '📋 Portafolio', callback_data: 'portafolio' }],
        [{ text: '💰 Precios', callback_data: 'precios' }],
        [{ text: '📞 Contacto', callback_data: 'contacto' }],
        [{ text: '🔔 Notificaciones', callback_data: 'activar_notif' }]
      ]
    }
  });
}

async function mostrarServicios(chatId: string) {
  await bot.sendMessage(chatId, '🛠️ *Nuestros Servicios*\n\nSelecciona uno para ver detalles:', {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🤖 Chat Bots', callback_data: 'serv_chatbots' }],
        [{ text: '🤖 Asistentes Virtuales', callback_data: 'serv_asistentes' }],
        [{ text: '🌐 Páginas Web', callback_data: 'serv_webs' }],
        [{ text: '📱 Aplicaciones', callback_data: 'serv_apps' }],
        [{ text: '◀️ Volver', callback_data: 'volver_menu' }]
      ]
    }
  });
}

async function mostrarDetalleServicio(chatId: string, servicio: string) {
  const servicios: Record<string, { titulo: string; desc: string; precio: string }> = {
    chatbots: {
      titulo: '🤖 Chat Bots',
      desc: 'Bots para WhatsApp, Telegram, Facebook Messenger.\n\n• Respuestas automáticas 24/7\n• Menús interactivos\n• Integración con sistemas\n• Notificaciones automáticas',
      precio: 'Desde $150 USD'
    },
    asistentes: {
      titulo: '🤖 Asistentes Virtuales',
      desc: 'Asistentes con IA para atención al cliente.\n\n• Procesamiento de lenguaje natural\n• Respuestas inteligentes\n• Integración con bases de datos\n• Multi-plataforma',
      precio: 'Desde $300 USD'
    },
    webs: {
      titulo: '🌐 Páginas Web',
      desc: 'Sitios web modernos y responsivos.\n\n• Diseño profesional\n• Optimizado SEO\n• Panel de administración\n• Hosting incluido',
      precio: 'Desde $200 USD'
    },
    apps: {
      titulo: '📱 Aplicaciones',
      desc: 'Apps móviles para iOS y Android.\n\n• Diseño nativo\n• Notificaciones push\n• Sincronización en la nube\n• Publicación en stores',
      precio: 'Desde $500 USD'
    }
  };

  const s = servicios[servicio];

  await bot.sendMessage(chatId, `${s.titulo}\n\n${s.desc}\n\n💰 *${s.precio}*`, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '📝 Solicitar Cotización', callback_data: `cotizar_${servicio}` }],
        [{ text: '◀️ Volver a Servicios', callback_data: 'servicios' }]
      ]
    }
  });
}

async function mostrarPortafolio(chatId: string) {
  await bot.sendMessage(chatId, `📋 *Portafolio*\n\nAlgunos de nuestros trabajos:\n\n🤖 *Chat Bots*\n• Bot para restaurante (pedidos automáticos)\n• Bot para inmobiliaria (citas)\n\n🌐 *Páginas Web*\n• Tienda online de ropa\n• Sitio corporativo constructora\n\n📱 *Aplicaciones*\n• App de delivery\n• App de reservaciones`, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '◀️ Volver', callback_data: 'volver_menu' }]
      ]
    }
  });
}

async function mostrarPrecios(chatId: string) {
  await bot.sendMessage(chatId, `💰 *Lista de Precios*\n\n🤖 *Chat Bots*\nDesde $150 USD\n\n🤖 *Asistentes Virtuales con IA*\nDesde $300 USD\n\n🌐 *Páginas Web*\nDesde $200 USD\n\n📱 *Aplicaciones Móviles*\nDesde $500 USD\n\n📝 _Los precios son referenciales. Cada proyecto se cotiza según requerimientos._`, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '📝 Solicitar Cotización', callback_data: 'servicios' }],
        [{ text: '◀️ Volver', callback_data: 'volver_menu' }]
      ]
    }
  });
}

async function mostrarContacto(chatId: string) {
  await bot.sendMessage(chatId, `📞 *Contacto*\n\n📧 Email: contacto@tudominio.com\n📱 WhatsApp: +52 123 456 7890\n🌐 Web: www.tudominio.com\n\nO envíanos un mensaje directamente aquí.`, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '◀️ Volver', callback_data: 'volver_menu' }]
      ]
    }
  });
}

async function activarNotificaciones(chatId: string) {
  const usuario = usuarios.get(chatId);

  if (usuario) {
    if (usuario.notificaciones) {
      await bot.sendMessage(chatId, '🔔 Ya tienes las notificaciones *activadas*.\n\nTe avisaremos de ofertas y novedades.', { parse_mode: 'Markdown' });
    } else {
      usuario.notificaciones = true;
      await bot.sendMessage(chatId, '✅ *¡Notificaciones activadas!*\n\nTe avisaremos de:\n• Ofertas especiales\n• Nuevos servicios\n• Novedades', { parse_mode: 'Markdown' });
    }
  }

  setTimeout(async () => {
    await bot.sendMessage(chatId, '¿Qué más puedo hacer por ti?', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '◀️ Volver al menú', callback_data: 'volver_menu' }]
        ]
      }
    });
  }, 500);
}

// ============================================
// SISTEMA DE COTIZACIÓN
// ============================================
const sesionesCotizacion = new Map<string, { paso: string; servicio: string; datos: any }>();

async function iniciarCotizacion(chatId: string, servicio: string) {
  sesionesCotizacion.set(chatId, {
    paso: 'nombre',
    servicio,
    datos: {}
  });

  const servicioNombre: Record<string, string> = {
    chatbots: 'Chat Bots',
    asistentes: 'Asistentes Virtuales',
    webs: 'Páginas Web',
    apps: 'Aplicaciones'
  };

  await bot.sendMessage(chatId, `📝 *Solicitar Cotización*\n\nServicio: *${servicioNombre[servicio]}*\n\nPor favor, escribe tu *nombre completo*:`, {
    parse_mode: 'Markdown'
  });
}

// Manejar mensajes de texto para cotizaciones
bot.on('message', async (msg) => {
  const chatId = msg.chat.id.toString();
  const texto = msg.text;

  if (texto?.startsWith('/')) return;

  const sesion = sesionesCotizacion.get(chatId);
  if (!sesion) return;

  switch (sesion.paso) {
    case 'nombre':
      sesion.datos.nombre = texto;
      sesion.paso = 'telefono';
      await bot.sendMessage(chatId, '📱 Ahora escribe tu *número de teléfono* (con código de país):', { parse_mode: 'Markdown' });
      break;

    case 'telefono':
      sesion.datos.telefono = texto;
      sesion.paso = 'email';
      await bot.sendMessage(chatId, '📧 Escribe tu *correo electrónico*:', { parse_mode: 'Markdown' });
      break;

    case 'email':
      sesion.datos.email = texto;
      sesion.paso = 'mensaje';
      await bot.sendMessage(chatId, '💬 Describe brevemente lo que necesitas (opcional):\n\nO escribe "skip" para omitir:', { parse_mode: 'Markdown' });
      break;

    case 'mensaje':
      if (texto?.toLowerCase() !== 'skip') {
        sesion.datos.mensaje = texto;
      }

      const cotizacion = {
        chatId,
        servicio: sesion.servicio,
        ...sesion.datos,
        fecha: new Date().toISOString()
      };
      cotizacionesPendientes.push(cotizacion);

      console.log('📋 Nueva cotización:', cotizacion);

      await bot.sendMessage(chatId, `✅ *¡Cotización enviada!*\n\n📋 Resumen:\n• Servicio: ${sesion.servicio}\n• Nombre: ${sesion.datos.nombre}\n• Teléfono: ${sesion.datos.telefono}\n• Email: ${sesion.datos.email}\n\nNos pondremos en contacto contigo pronto.`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏠 Menú Principal', callback_data: 'volver_menu' }]
          ]
        }
      });

      // Notificar al admin
      try {
        await bot.sendMessage(ADMIN_CHAT_ID, `🆕 *NUEVA COTIZACIÓN*\n\n• Servicio: ${sesion.servicio}\n• Nombre: ${sesion.datos.nombre}\n• Teléfono: ${sesion.datos.telefono}\n• Email: ${sesion.datos.email}\n• Mensaje: ${sesion.datos.mensaje || 'N/A'}`, {
          parse_mode: 'Markdown'
        });
        console.log('✅ Notificación enviada al admin');
      } catch (e) {
        console.error('Error notificando al admin:', e);
      }

      sesionesCotizacion.delete(chatId);
      break;
  }
});

// ============================================
// FUNCIONES EXPORTADAS
// ============================================
export function enviarNotificacionATodos(mensaje: string) {
  let enviados = 0;
  usuarios.forEach((usuario, chatId) => {
    if (usuario.notificaciones) {
      bot.sendMessage(chatId, mensaje, { parse_mode: 'Markdown' });
      enviados++;
    }
  });
  return enviados;
}

export { bot, usuarios, cotizacionesPendientes };
