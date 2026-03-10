import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 });
    }
    
    // Hashear contraseña
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    // Buscar admin
    const admin = await db.admin.findFirst({
      where: {
        username,
        password: hashedPassword,
        activo: true
      }
    });
    
    if (!admin) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }
    
    // Generar token simple
    const token = crypto.randomBytes(32).toString('hex');
    
    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        nombre: admin.nombre
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}

// GET - Verificar sesión
export async function GET(request: NextRequest) {
  try {
    // En este sistema simple, el cliente verifica localmente
    // El token se guarda en localStorage
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

// POST - Crear admin inicial (solo si no existe ninguno)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, nombre } = body;
    
    // Verificar si ya existe un admin
    const existingAdmin = await db.admin.findFirst();
    
    if (existingAdmin) {
      return NextResponse.json({ error: 'Ya existe un administrador' }, { status: 400 });
    }
    
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    const admin = await db.admin.create({
      data: {
        username,
        password: hashedPassword,
        nombre
      }
    });
    
    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        nombre: admin.nombre
      }
    });
    
  } catch (error) {
    console.error('Error creando admin:', error);
    return NextResponse.json({ error: 'Error al crear admin' }, { status: 500 });
  }
}
