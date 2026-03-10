import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Función para enviar mensaje por Telegram
async function enviarTelegram(chatId: string, mensaje: string) {
  if (!TELEGRAM_BOT_TOKEN || !chatId) return false;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: mensaje,
          parse_mode: 'Markdown'
        })
      }
    );
    return response.ok;
  } catch (error) {
    console.error('Error enviando Telegram:', error);
    return false;
  }
}

// GET - Ver asistencias del día
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get('fecha') || new Date().toISOString().split('T')[0];

    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);
    
    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    const asistencias = await db.asistencia.findMany({
      where: {
        fecha: {
          gte: inicioDia,
          lte: finDia
        }
      },
      include: {
        estudiante: true
      },
      orderBy: { fecha: 'desc' }
    });

    return NextResponse.json(asistencias);
  } catch (error) {
    console.error('Error obteniendo asistencias:', error);
    return NextResponse.json({ error: 'Error al obtener asistencias' }, { status: 500 });
  }
}

// POST - Registrar entrada/salida (escaneando QR)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { codigo } = body;

    if (!codigo) {
      return NextResponse.json({ error: 'Código requerido' }, { status: 400 });
    }

    // Buscar estudiante por código
    const estudiante = await db.estudiante.findFirst({
      where: { codigo, activo: true }
    });

    if (!estudiante) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    }

    // Verificar última asistencia para determinar si es entrada o salida
    const ultimaAsistencia = await db.asistencia.findFirst({
      where: { estudianteId: estudiante.id },
      orderBy: { fecha: 'desc' }
    });

    // Determinar tipo (alternar entrada/salida)
    let tipo: 'entrada' | 'salida';
    
    if (!ultimaAsistencia) {
      tipo = 'entrada';
    } else {
      // Si la última fue hoy, verificar si fue entrada o salida
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (ultimaAsistencia.fecha >= hoy) {
        // Si la última de hoy fue entrada, ahora es salida
        tipo = ultimaAsistencia.tipo === 'entrada' ? 'salida' : 'entrada';
      } else {
        // Si fue de otro día, es entrada
        tipo = 'entrada';
      }
    }

    // Crear registro de asistencia
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const asistencia = await db.asistencia.create({
      data: {
        estudianteId: estudiante.id,
        tipo,
        hora,
        fecha: ahora
      }
    });

    // Enviar notificación al padre por Telegram
    let notificacionEnviada = false;
    if (estudiante.padreChatId) {
      const emoji = tipo === 'entrada' ? '✅' : '👋';
      const accion = tipo === 'entrada' ? 'ha llegado a la escuela' : 'ha salido de la escuela';
      
      const mensaje = `${emoji} *Notificación Escolar*

👤 *${estudiante.nombre} ${estudiante.apellido}*
📚 Grado: ${estudiante.grado} - "${estudiante.seccion}"

🕐 *${tipo.toUpperCase()}* a las *${hora}*

${emoji === '✅' ? 'Tu hijo(a) ha llegado a la escuela.' : 'Tu hijo(a) ha salido de la escuela.'}`;

      notificacionEnviada = await enviarTelegram(estudiante.padreChatId, mensaje);
    }

    return NextResponse.json({
      success: true,
      asistencia: {
        ...asistencia,
        estudiante
      },
      tipo,
      notificacionEnviada,
      mensajePadre: estudiante.padreChatId ? 
        `Notificación enviada al padre` : 
        'Padre sin Chat ID registrado'
    });

  } catch (error) {
    console.error('Error registrando asistencia:', error);
    return NextResponse.json({ error: 'Error al registrar asistencia' }, { status: 500 });
  }
}
