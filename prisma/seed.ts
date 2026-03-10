import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando datos iniciales...');

  // Crear configuración inicial
  const config = await prisma.configuracion.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      nombreNegocio: 'Barbería Premium',
      lema: 'Estilo y elegencia para caballeros',
      telefono: '+52 123 456 7890',
      whatsapp: '521234567890',
      email: 'contacto@barberiapremium.com',
      direccion: 'Av. Principal #123, Centro',
      horarioLunes: '9:00 AM - 7:00 PM',
      horarioMartes: '9:00 AM - 7:00 PM',
      horarioMiercoles: '9:00 AM - 7:00 PM',
      horarioJueves: '9:00 AM - 7:00 PM',
      horarioViernes: '9:00 AM - 7:00 PM',
      horarioSabado: '9:00 AM - 5:00 PM',
      horarioDomingo: 'Cerrado',
      colorPrimario: '#2d2d2d',
      colorSecundario: '#c9a227',
      colorFondo: '#1a1a1a',
      mensajeWhatsapp: '¡Hola! Me gustaría agendar una cita.',
    }
  });
  console.log('✅ Configuración creada');

  // Crear servicios de ejemplo
  const servicios = [
    { nombre: 'Corte de Cabello', precio: 15, duracion: 30, descripcion: 'Corte clásico o moderno según tu preferencia', orden: 1 },
    { nombre: 'Barba', precio: 10, duracion: 20, descripcion: 'Recorte y perfilado de barba con navaja', orden: 2 },
    { nombre: 'Corte + Barba', precio: 22, duracion: 45, descripcion: 'Combo completo: corte de cabello + barba', orden: 3 },
    { nombre: 'Afeitado Clásico', precio: 12, duracion: 30, descripcion: 'Afeitado tradicional con toalla caliente', orden: 4 },
    { nombre: 'Corte Niños', precio: 10, duracion: 25, descripcion: 'Corte para niños menores de 12 años', orden: 5 },
    { nombre: 'Lavado + Peinado', precio: 8, duracion: 15, descripcion: 'Lavado profesional y peinado', orden: 6 },
  ];

  for (const servicio of servicios) {
    await prisma.servicio.create({
      data: servicio
    });
  }
  console.log('✅ Servicios creados');

  // Crear admin por defecto
  const hashedPassword = crypto.createHash('sha256').update('admin123').digest('hex');
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      nombre: 'Administrador',
    }
  });
  console.log('✅ Admin creado (usuario: admin, contraseña: admin123)');

  console.log('🎉 Datos iniciales completados');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
