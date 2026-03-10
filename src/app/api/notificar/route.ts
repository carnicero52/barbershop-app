import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const { mensaje, chatIds } = await request.json();

    if (!mensaje) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ error: 'Token no configurado' }, { status: 500 });
    }

    // Si hay chatIds específicos, enviar solo a esos
    // Si no, enviar a todos (esto requiere una lista de usuarios)
    const destinatarios = chatIds || [];

    if (destinatarios.length === 0) {
      return NextResponse.json({
        error: 'No hay destinatarios',
        mensaje: 'Los usuarios deben activar notificaciones primero'
      });
    }

    const resultados = [];

    for (const chatId of destinatarios) {
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

        const data = await response.json();
        resultados.push({ chatId, success: data.ok });
      } catch (error) {
        resultados.push({ chatId, success: false, error: 'Error enviando' });
      }
    }

    const exitosos = resultados.filter(r => r.success).length;

    return NextResponse.json({
      ok: true,
      enviados: exitosos,
      total: destinatarios.length,
      resultados
    });

  } catch (error) {
    console.error('Error enviando notificación:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
