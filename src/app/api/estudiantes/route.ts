import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

// GET - Listar estudiantes
export async function GET() {
  try {
    const estudiantes = await db.estudiante.findMany({
      where: { activo: true },
      include: {
        _count: { select: { asistencias: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(estudiantes);
  } catch (error) {
    console.error('Error listando estudiantes:', error);
    return NextResponse.json({ error: 'Error al obtener estudiantes' }, { status: 500 });
  }
}

// POST - Crear estudiante
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, apellido, grado, seccion, padreNombre, padreTelefono, padreChatId } = body;

    if (!nombre || !apellido || !padreNombre) {
      return NextResponse.json({ error: 'Nombre, apellido y nombre del padre son requeridos' }, { status: 400 });
    }

    // Generar código único
    const codigo = `EST-${nanoid(6).toUpperCase()}`;

    // Generar código QR (usamos el código del estudiante)
    const codigoQr = codigo;

    const estudiante = await db.estudiante.create({
      data: {
        codigo,
        nombre,
        apellido,
        grado: grado || 'Sin asignar',
        seccion: seccion || 'A',
        padreNombre,
        padreTelefono: padreTelefono || '',
        padreChatId: padreChatId || null,
      }
    });

    return NextResponse.json(estudiante);
  } catch (error) {
    console.error('Error creando estudiante:', error);
    return NextResponse.json({ error: 'Error al crear estudiante' }, { status: 500 });
  }
}

// DELETE - Eliminar estudiante
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await db.estudiante.update({
      where: { id },
      data: { activo: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando estudiante:', error);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
