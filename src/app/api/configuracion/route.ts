import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Obtener configuración
export async function GET() {
  try {
    let config = await db.configuracion.findFirst();
    
    // Si no existe, crear una configuración por defecto
    if (!config) {
      config = await db.configuracion.create({
        data: {}
      });
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 });
  }
}

// PUT - Actualizar configuración
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    let config = await db.configuracion.findFirst();
    
    if (!config) {
      config = await db.configuracion.create({ data: body });
    } else {
      config = await db.configuracion.update({
        where: { id: config.id },
        data: body
      });
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}
