import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Datos del bot en memoria (en producción usar base de datos)
// Estos datos se sincronizarán con el mini-servicio del bot

interface Usuario {
  chatId: string;
  nombre: string;
  notificaciones: boolean;
}

interface Cotizacion {
  chatId: string;
  servicio: string;
  nombre: string;
  telefono: string;
  email: string;
  mensaje?: string;
  fecha: string;
}

// Storage compartido vía API
let datosBot = {
  usuarios: [] as Usuario[],
  cotizaciones: [] as Cotizacion[]
};

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    usuarios: datosBot.usuarios,
    cotizaciones: datosBot.cotizaciones,
    totalUsuarios: datosBot.usuarios.length,
    totalCotizaciones: datosBot.cotizaciones.length
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (body.tipo === 'nuevo_usuario') {
    const existe = datosBot.usuarios.find(u => u.chatId === body.usuario.chatId);
    if (!existe) {
      datosBot.usuarios.push(body.usuario);
    }
  }

  if (body.tipo === 'nueva_cotizacion') {
    datosBot.cotizaciones.push(body.cotizacion);
  }

  if (body.tipo === 'actualizar_usuario') {
    const idx = datosBot.usuarios.findIndex(u => u.chatId === body.chatId);
    if (idx !== -1) {
      datosBot.usuarios[idx] = { ...datosBot.usuarios[idx], ...body.datos };
    }
  }

  return NextResponse.json({ ok: true });
}
