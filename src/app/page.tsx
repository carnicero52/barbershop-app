'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Phone, MessageCircle, Calendar, Clock, MapPin, Mail, 
  Instagram, Facebook, Scissors, ChevronRight, X, Upload,
  Settings, LogOut, Users, Image as ImageIcon, Check, AlertCircle,
  Menu, Edit2, Trash2, Plus, Save, Bell, ExternalLink
} from 'lucide-react';

// ============== TIPOS ==============
interface Configuracion {
  id: string;
  nombreNegocio: string;
  lema: string;
  logoUrl: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  direccion: string | null;
  mapaUrl: string | null;
  horarioLunes: string;
  horarioMartes: string;
  horarioMiercoles: string;
  horarioJueves: string;
  horarioViernes: string;
  horarioSabado: string;
  horarioDomingo: string;
  colorPrimario: string;
  colorSecundario: string;
  colorFondo: string;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  telegramBotToken: string | null;
  telegramChatId: string | null;
  notificacionesActivas: boolean;
  mensajeWhatsapp: string;
}

interface Servicio {
  id: string;
  nombre: string;
  precio: number;
  duracion: number;
  descripcion: string | null;
  imagenUrl: string | null;
  activo: boolean;
  orden: number;
}

interface Corte {
  id: string;
  titulo: string;
  descripcion: string | null;
  imagenUrl: string | null;
  activo: boolean;
  orden: number;
}

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail: string | null;
  estado: string;
  notas: string | null;
  servicio: Servicio;
}

// ============== COMPONENTE PRINCIPAL ==============
export default function BarberiaApp() {
  // Estados globales
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cortes, setCortes] = useState<Corte[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navegación
  const [vista, setVista] = useState<'publica' | 'admin' | 'login'>('publica');
  const [adminLogueado, setAdminLogueado] = useState(false);
  const [seccionAdmin, setSeccionAdmin] = useState<'citas' | 'servicios' | 'galeria' | 'config'>('citas');
  
  // Refs para scroll
  const serviciosRef = useRef<HTMLDivElement>(null);
  const galeriaRef = useRef<HTMLDivElement>(null);
  const contactoRef = useRef<HTMLDivElement>(null);
  const citaRef = useRef<HTMLDivElement>(null);
  
  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
    
    // Verificar si hay sesión de admin
    const token = localStorage.getItem('adminToken');
    if (token) {
      setAdminLogueado(true);
    }
  }, []);
  
  const cargarDatos = async () => {
    try {
      const [configRes, serviciosRes, cortesRes] = await Promise.all([
        fetch('/api/configuracion'),
        fetch('/api/servicios'),
        fetch('/api/cortes')
      ]);
      
      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData);
        
        // Aplicar colores CSS
        document.documentElement.style.setProperty('--color-primario', configData.colorPrimario);
        document.documentElement.style.setProperty('--color-secundario', configData.colorSecundario);
        document.documentElement.style.setProperty('--color-fondo', configData.colorFondo);
      }
      
      if (serviciosRes.ok) setServicios(await serviciosRes.json());
      if (cortesRes.ok) setCortes(await cortesRes.json());
      
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Funciones de scroll
  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Funciones de contacto
  const llamar = () => {
    if (config?.telefono) {
      window.location.href = `tel:${config.telefono}`;
    }
  };
  
  const abrirWhatsApp = () => {
    if (config?.whatsapp) {
      const numero = config.whatsapp.replace(/\D/g, '');
      const mensaje = encodeURIComponent(config.mensajeWhatsapp || 'Hola! Me gustaría agendar una cita.');
      window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank');
    }
  };
  
  const abrirMaps = () => {
    if (config?.mapaUrl) {
      window.open(config.mapaUrl, '_blank');
    } else if (config?.direccion) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.direccion)}`, '_blank');
    }
  };
  
  const abrirInstagram = () => {
    if (config?.instagram) {
      window.open(config.instagram.startsWith('http') ? config.instagram : `https://instagram.com/${config.instagram}`, '_blank');
    }
  };
  
  const enviarEmail = () => {
    if (config?.email) {
      window.location.href = `mailto:${config.email}`;
    }
  };
  
  // Logout admin
  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdminLogueado(false);
    setVista('publica');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: config?.colorFondo || '#1a1a1a' }}>
        <div className="text-center">
          <Scissors className="w-12 h-12 animate-pulse mx-auto mb-4" style={{ color: config?.colorSecundario || '#c9a227' }} />
          <p style={{ color: config?.colorSecundario || '#c9a227' }}>Cargando...</p>
        </div>
      </div>
    );
  }
  
  // ============== VISTA PÚBLICA ==============
  if (vista === 'publica') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: config?.colorFondo || '#1a1a1a' }}>
        <PaginaPublica
          config={config}
          servicios={servicios}
          cortes={cortes}
          serviciosRef={serviciosRef}
          galeriaRef={galeriaRef}
          contactoRef={contactoRef}
          citaRef={citaRef}
          scrollTo={scrollTo}
          llamar={llamar}
          abrirWhatsApp={abrirWhatsApp}
          abrirMaps={abrirMaps}
          abrirInstagram={abrirInstagram}
          enviarEmail={enviarEmail}
          setVista={setVista}
          cargarDatos={cargarDatos}
        />
      </div>
    );
  }
  
  // ============== VISTA LOGIN ==============
  if (vista === 'login') {
    return (
      <LoginAdmin
        setVista={setVista}
        setAdminLogueado={setAdminLogueado}
        config={config}
      />
    );
  }
  
  // ============== VISTA ADMIN ==============
  if (vista === 'admin' && adminLogueado) {
    return (
      <PanelAdmin
        config={config}
        setConfig={setConfig}
        servicios={servicios}
        setServicios={setServicios}
        cortes={cortes}
        setCortes={setCortes}
        seccionAdmin={seccionAdmin}
        setSeccionAdmin={setSeccionAdmin}
        logout={logout}
        cargarDatos={cargarDatos}
      />
    );
  }
  
  return null;
}

// ============== COMPONENTE PÁGINA PÚBLICA ==============
function PaginaPublica({
  config, servicios, cortes,
  serviciosRef, galeriaRef, contactoRef, citaRef,
  scrollTo, llamar, abrirWhatsApp, abrirMaps, abrirInstagram, enviarEmail,
  setVista, cargarDatos
}: {
  config: Configuracion | null;
  servicios: Servicio[];
  cortes: Corte[];
  serviciosRef: React.RefObject<HTMLDivElement | null>;
  galeriaRef: React.RefObject<HTMLDivElement | null>;
  contactoRef: React.RefObject<HTMLDivElement | null>;
  citaRef: React.RefObject<HTMLDivElement | null>;
  scrollTo: (ref: React.RefObject<HTMLDivElement | null>) => void;
  llamar: () => void;
  abrirWhatsApp: () => void;
  abrirMaps: () => void;
  abrirInstagram: () => void;
  enviarEmail: () => void;
  setVista: (v: 'publica' | 'admin' | 'login') => void;
  cargarDatos: () => void;
}) {
  const [modalCita, setModalCita] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  
  const colorPrimario = config?.colorPrimario || '#2d2d2d';
  const colorSecundario = config?.colorSecundario || '#c9a227';
  const colorFondo = config?.colorFondo || '#1a1a1a';
  
  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 shadow-lg" style={{ backgroundColor: colorPrimario }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {config?.logoUrl ? (
              <img src={config.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
            ) : (
              <Scissors className="w-8 h-8" style={{ color: colorSecundario }} />
            )}
            <div>
              <h1 className="font-bold text-white text-lg">{config?.nombreNegocio || 'Barbería'}</h1>
              <p className="text-xs" style={{ color: colorSecundario }}>{config?.lema}</p>
            </div>
          </div>
          
          {/* Botones desktop */}
          <div className="hidden md:flex items-center gap-2">
            <button onClick={llamar} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:opacity-80 transition" style={{ backgroundColor: colorSecundario }}>
              <Phone className="w-4 h-4" /> Llamar
            </button>
            <button onClick={() => scrollTo(citaRef)} className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-white hover:bg-white hover:bg-opacity-10 transition" style={{ borderColor: colorSecundario, color: colorSecundario }}>
              <Calendar className="w-4 h-4" /> Agendar
            </button>
          </div>
          
          {/* Menú móvil */}
          <button onClick={() => setMenuAbierto(!menuAbierto)} className="md:hidden p-2 text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        {/* Menú móvil expandido */}
        {menuAbierto && (
          <div className="md:hidden px-4 pb-4 space-y-2" style={{ backgroundColor: colorPrimario }}>
            <button onClick={() => { llamar(); setMenuAbierto(false); }} className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-white" style={{ backgroundColor: colorSecundario }}>
              <Phone className="w-4 h-4" /> Llamar
            </button>
            <button onClick={() => { scrollTo(citaRef); setMenuAbierto(false); }} className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border-2 text-white" style={{ borderColor: colorSecundario }}>
              <Calendar className="w-4 h-4" /> Agendar Cita
            </button>
            <button onClick={() => { scrollTo(serviciosRef); setMenuAbierto(false); }} className="w-full text-left px-4 py-2 text-white">Servicios</button>
            <button onClick={() => { scrollTo(galeriaRef); setMenuAbierto(false); }} className="w-full text-left px-4 py-2 text-white">Galería</button>
            <button onClick={() => { scrollTo(contactoRef); setMenuAbierto(false); }} className="w-full text-left px-4 py-2 text-white">Contacto</button>
          </div>
        )}
      </header>
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4" style={{ backgroundColor: colorFondo }}>
        <div className="max-w-6xl mx-auto text-center py-16">
          {config?.logoUrl ? (
            <img src={config.logoUrl} alt="Logo" className="w-24 h-24 mx-auto mb-6 object-contain rounded-full shadow-lg" />
          ) : (
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: colorPrimario }}>
              <Scissors className="w-12 h-12" style={{ color: colorSecundario }} />
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            {config?.nombreNegocio || 'Barbería'}
          </h1>
          <p className="text-xl md:text-2xl mb-8" style={{ color: colorSecundario }}>
            {config?.lema || 'Estilo y elegencia'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => scrollTo(serviciosRef)} className="px-8 py-4 rounded-lg text-lg font-semibold text-white hover:opacity-90 transition shadow-lg" style={{ backgroundColor: colorSecundario }}>
              Ver Servicios
            </button>
            <button onClick={() => scrollTo(citaRef)} className="px-8 py-4 rounded-lg text-lg font-semibold border-2 text-white hover:bg-white hover:bg-opacity-10 transition" style={{ borderColor: colorSecundario }}>
              Agendar Cita
            </button>
          </div>
        </div>
      </section>
      
      {/* Servicios */}
      <section ref={serviciosRef} className="py-16 px-4" style={{ backgroundColor: colorPrimario }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">Nuestros Servicios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicios.map(servicio => (
              <div 
                key={servicio.id}
                className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
                style={{ backgroundColor: colorFondo }}
                onClick={() => { setServicioSeleccionado(servicio); setModalCita(true); }}
              >
                <div className="h-48 bg-gray-800 relative overflow-hidden">
                  {servicio.imagenUrl ? (
                    <img src={servicio.imagenUrl} alt={servicio.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Scissors className="w-16 h-16" style={{ color: colorSecundario }} />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{servicio.nombre}</h3>
                  <p className="text-gray-400 text-sm mb-4">{servicio.descripcion}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold" style={{ color: colorSecundario }}>${servicio.precio}</span>
                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                      <Clock className="w-4 h-4" /> {servicio.duracion} min
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Galería */}
      <section ref={galeriaRef} className="py-16 px-4" style={{ backgroundColor: colorFondo }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">Nuestros Trabajos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cortes.map(corte => (
              <div 
                key={corte.id}
                className="aspect-square rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                {corte.imagenUrl ? (
                  <img src={corte.imagenUrl} alt={corte.titulo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: colorPrimario }}>
                    <Scissors className="w-12 h-12" style={{ color: colorSecundario }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Formulario de Citas */}
      <section ref={citaRef} className="py-16 px-4" style={{ backgroundColor: colorPrimario }}>
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-8">Agenda tu Cita</h2>
          <FormularioCita 
            config={config} 
            servicios={servicios} 
            servicioPreseleccionado={servicioSeleccionado}
            onClose={() => setModalCita(false)}
          />
        </div>
      </section>
      
      {/* Contacto */}
      <section ref={contactoRef} className="py-16 px-4" style={{ backgroundColor: colorFondo }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">Encuéntranos</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Info */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: colorPrimario }}>
                  <MapPin className="w-6 h-6" style={{ color: colorSecundario }} />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Ubicación</h3>
                  <p className="text-gray-400 cursor-pointer hover:underline" onClick={abrirMaps}>{config?.direccion || 'Dirección no configurada'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: colorPrimario }}>
                  <Phone className="w-6 h-6" style={{ color: colorSecundario }} />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Teléfono</h3>
                  <p className="text-gray-400 cursor-pointer hover:underline" onClick={llamar}>{config?.telefono || 'No configurado'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: colorPrimario }}>
                  <Mail className="w-6 h-6" style={{ color: colorSecundario }} />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Email</h3>
                  <p className="text-gray-400 cursor-pointer hover:underline" onClick={enviarEmail}>{config?.email || 'No configurado'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: colorPrimario }}>
                  <Clock className="w-6 h-6" style={{ color: colorSecundario }} />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">Horarios</h3>
                  <div className="text-gray-400 text-sm space-y-1">
                    <p>Lunes: {config?.horarioLunes}</p>
                    <p>Martes: {config?.horarioMartes}</p>
                    <p>Miércoles: {config?.horarioMiercoles}</p>
                    <p>Jueves: {config?.horarioJueves}</p>
                    <p>Viernes: {config?.horarioViernes}</p>
                    <p>Sábado: {config?.horarioSabado}</p>
                    <p>Domingo: {config?.horarioDomingo}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Redes sociales */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <h3 className="font-bold text-white text-xl">Síguenos</h3>
              <div className="flex gap-4">
                {config?.instagram && (
                  <button onClick={abrirInstagram} className="p-4 rounded-full hover:opacity-80 transition" style={{ backgroundColor: colorPrimario }}>
                    <Instagram className="w-8 h-8" style={{ color: colorSecundario }} />
                  </button>
                )}
                {config?.facebook && (
                  <button className="p-4 rounded-full hover:opacity-80 transition" style={{ backgroundColor: colorPrimario }}>
                    <Facebook className="w-8 h-8" style={{ color: colorSecundario }} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 text-center" style={{ backgroundColor: colorPrimario }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            {config?.logoUrl ? (
              <img src={config.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
            ) : (
              <Scissors className="w-6 h-6" style={{ color: colorSecundario }} />
            )}
            <span className="font-bold text-white">{config?.nombreNegocio || 'Barbería'}</span>
          </div>
          <p style={{ color: colorSecundario }} className="mb-2">{config?.lema}</p>
          <p className="text-gray-400 text-sm">{config?.horarioLunes} - {config?.horarioSabado}</p>
          <button onClick={() => setVista('login')} className="mt-4 text-gray-500 text-xs hover:underline">
            Acceso administrativo
          </button>
        </div>
      </footer>
      
      {/* WhatsApp flotante */}
      {config?.whatsapp && (
        <button 
          onClick={abrirWhatsApp}
          className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg hover:scale-110 transition z-40"
          style={{ backgroundColor: '#25D366' }}
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </button>
      )}
      
      {/* Modal de cita */}
      {modalCita && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-xl overflow-hidden" style={{ backgroundColor: config?.colorPrimario }}>
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Agendar Cita</h3>
              <button onClick={() => setModalCita(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <FormularioCita 
                config={config} 
                servicios={servicios} 
                servicioPreseleccionado={servicioSeleccionado}
                onClose={() => setModalCita(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============== COMPONENTE FORMULARIO CITA ==============
function FormularioCita({ 
  config, servicios, servicioPreseleccionado, onClose 
}: { 
  config: Configuracion | null;
  servicios: Servicio[];
  servicioPreseleccionado: Servicio | null;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    clienteNombre: '',
    clienteTelefono: '',
    clienteEmail: '',
    servicioId: servicioPreseleccionado?.id || '',
    fecha: '',
    hora: '',
    notas: ''
  });
  
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);
  
  const colorSecundario = config?.colorSecundario || '#c9a227';
  
  // Horarios disponibles
  const horarios = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00'
  ];
  
  // Cargar horas ocupadas cuando cambia la fecha
  useEffect(() => {
    if (formData.fecha) {
      fetch(`/api/citas?fecha=${formData.fecha}`)
        .then(res => res.json())
        .then(data => {
          const ocupadas = data
            .filter((c: Cita) => c.estado !== 'cancelada')
            .map((c: Cita) => c.hora);
          setHorasOcupadas(ocupadas);
        });
    }
  }, [formData.fecha]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setExito(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        alert(data.error || 'Error al agendar');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };
  
  if (exito) {
    return (
      <div className="text-center py-8">
        <Check className="w-16 h-16 mx-auto mb-4" style={{ color: colorSecundario }} />
        <h3 className="text-xl font-bold text-white mb-2">¡Cita Agendada!</h3>
        <p className="text-gray-400">Te esperamos en la fecha seleccionada</p>
      </div>
    );
  }
  
  // Obtener fecha mínima (hoy)
  const hoy = new Date().toISOString().split('T')[0];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Nombre *</label>
        <input
          type="text"
          required
          value={formData.clienteNombre}
          onChange={e => setFormData({ ...formData, clienteNombre: e.target.value })}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none"
          style={{ borderColor: formData.clienteNombre ? colorSecundario : undefined }}
          placeholder="Tu nombre completo"
        />
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-1">Teléfono *</label>
        <input
          type="tel"
          required
          value={formData.clienteTelefono}
          onChange={e => setFormData({ ...formData, clienteTelefono: e.target.value })}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none"
          placeholder="+52 123 456 7890"
        />
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-1">Email (opcional)</label>
        <input
          type="email"
          value={formData.clienteEmail}
          onChange={e => setFormData({ ...formData, clienteEmail: e.target.value })}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none"
          placeholder="correo@ejemplo.com"
        />
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-1">Servicio *</label>
        <select
          required
          value={formData.servicioId}
          onChange={e => setFormData({ ...formData, servicioId: e.target.value })}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none"
        >
          <option value="">Selecciona un servicio</option>
          {servicios.map(s => (
            <option key={s.id} value={s.id}>{s.nombre} - ${s.precio}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Fecha *</label>
          <input
            type="date"
            required
            min={hoy}
            value={formData.fecha}
            onChange={e => setFormData({ ...formData, fecha: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Hora *</label>
          <select
            required
            value={formData.hora}
            onChange={e => setFormData({ ...formData, hora: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none"
          >
            <option value="">Selecciona</option>
            {horarios.map(h => (
              <option key={h} value={h} disabled={horasOcupadas.includes(h)}>
                {h} {horasOcupadas.includes(h) ? '(ocupado)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-1">Notas</label>
        <textarea
          value={formData.notas}
          onChange={e => setFormData({ ...formData, notas: e.target.value })}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none resize-none"
          rows={2}
          placeholder="Comentarios adicionales..."
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-lg font-bold text-white transition hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: colorSecundario }}
      >
        {loading ? 'Agendando...' : 'Confirmar Cita'}
      </button>
    </form>
  );
}

// ============== COMPONENTE LOGIN ADMIN ==============
function LoginAdmin({ 
  setVista, setAdminLogueado, config 
}: { 
  setVista: (v: 'publica' | 'admin' | 'login') => void;
  setAdminLogueado: (v: boolean) => void;
  config: Configuracion | null;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setAdminLogueado(true);
        setVista('admin');
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };
  
  const colorPrimario = config?.colorPrimario || '#2d2d2d';
  const colorSecundario = config?.colorSecundario || '#c9a227';
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: config?.colorFondo || '#1a1a1a' }}>
      <div className="w-full max-w-md rounded-xl p-8" style={{ backgroundColor: colorPrimario }}>
        <div className="text-center mb-8">
          <Scissors className="w-12 h-12 mx-auto mb-4" style={{ color: colorSecundario }} />
          <h1 className="text-2xl font-bold text-white">Panel Administrativo</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none"
              required
            />
          </div>
          
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-white transition"
            style={{ backgroundColor: colorSecundario }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          
          <button
            type="button"
            onClick={() => setVista('publica')}
            className="w-full py-2 text-gray-400 hover:text-white transition"
          >
            ← Volver
          </button>
        </form>
      </div>
    </div>
  );
}

// ============== COMPONENTE PANEL ADMIN ==============
function PanelAdmin({
  config, setConfig, servicios, setServicios, cortes, setCortes,
  seccionAdmin, setSeccionAdmin, logout, cargarDatos
}: {
  config: Configuracion | null;
  setConfig: (c: Configuracion | null) => void;
  servicios: Servicio[];
  setServicios: (s: Servicio[]) => void;
  cortes: Corte[];
  setCortes: (c: Corte[]) => void;
  seccionAdmin: 'citas' | 'servicios' | 'galeria' | 'config';
  setSeccionAdmin: (s: 'citas' | 'servicios' | 'galeria' | 'config') => void;
  logout: () => void;
  cargarDatos: () => void;
}) {
  const colorPrimario = config?.colorPrimario || '#2d2d2d';
  const colorSecundario = config?.colorSecundario || '#c9a227';
  const colorFondo = config?.colorFondo || '#1a1a1a';
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: colorFondo }}>
      {/* Header Admin */}
      <header className="shadow-lg" style={{ backgroundColor: colorPrimario }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6" style={{ color: colorSecundario }} />
            <h1 className="font-bold text-white">Panel Administrativo</h1>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-white">
            <LogOut className="w-5 h-5" /> Salir
          </button>
        </div>
      </header>
      
      {/* Navegación */}
      <nav className="shadow" style={{ backgroundColor: colorPrimario }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-2">
            {[
              { id: 'citas', label: 'Citas', icon: Calendar },
              { id: 'servicios', label: 'Servicios', icon: Scissors },
              { id: 'galeria', label: 'Galería', icon: ImageIcon },
              { id: 'config', label: 'Configuración', icon: Settings },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setSeccionAdmin(item.id as typeof seccionAdmin)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  seccionAdmin === item.id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                style={seccionAdmin === item.id ? { backgroundColor: colorSecundario } : {}}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Contenido */}
      <main className="max-w-6xl mx-auto p-4">
        {seccionAdmin === 'citas' && (
          <AdminCitas config={config} />
        )}
        {seccionAdmin === 'servicios' && (
          <AdminServicios servicios={servicios} setServicios={setServicios} config={config} cargarDatos={cargarDatos} />
        )}
        {seccionAdmin === 'galeria' && (
          <AdminGaleria cortes={cortes} setCortes={setCortes} config={config} cargarDatos={cargarDatos} />
        )}
        {seccionAdmin === 'config' && (
          <AdminConfig config={config} setConfig={setConfig} cargarDatos={cargarDatos} />
        )}
      </main>
    </div>
  );
}

// ============== ADMIN CITAS ==============
function AdminCitas({ config }: { config: Configuracion | null }) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    cargarCitas();
  }, [fechaFiltro]);
  
  const cargarCitas = async () => {
    const res = await fetch(`/api/citas?fecha=${fechaFiltro}`);
    if (res.ok) setCitas(await res.json());
  };
  
  const actualizarEstado = async (id: string, estado: string) => {
    await fetch('/api/citas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estado })
    });
    cargarCitas();
  };
  
  const colorSecundario = config?.colorSecundario || '#c9a227';
  
  const estadoColors: Record<string, string> = {
    pendiente: 'bg-yellow-500',
    confirmada: 'bg-green-500',
    completada: 'bg-blue-500',
    cancelada: 'bg-red-500'
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Citas del día</h2>
        <input
          type="date"
          value={fechaFiltro}
          onChange={e => setFechaFiltro(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
        />
      </div>
      
      <div className="space-y-3">
        {citas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay citas para esta fecha</p>
          </div>
        ) : (
          citas.map(cita => (
            <div key={cita.id} className="p-4 rounded-lg" style={{ backgroundColor: config?.colorPrimario }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{cita.hora}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(cita.fecha).toLocaleDateString('es-ES', { weekday: 'short' })}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-white">{cita.clienteNombre}</p>
                    <p className="text-sm text-gray-400">{cita.clienteTelefono}</p>
                    <p className="text-sm" style={{ color: colorSecundario }}>
                      {cita.servicio.nombre} - ${cita.servicio.precio}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs text-white ${estadoColors[cita.estado]}`}>
                    {cita.estado}
                  </span>
                  <select
                    value={cita.estado}
                    onChange={e => actualizarEstado(cita.id, e.target.value)}
                    className="px-2 py-1 rounded bg-gray-700 text-white text-sm"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============== ADMIN SERVICIOS ==============
function AdminServicios({ servicios, setServicios, config, cargarDatos }: {
  servicios: Servicio[];
  setServicios: (s: Servicio[]) => void;
  config: Configuracion | null;
  cargarDatos: () => void;
}) {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Servicio | null>(null);
  const [form, setForm] = useState({ nombre: '', precio: '', duracion: '30', descripcion: '', imagenUrl: '' });
  const [subiendo, setSubiendo] = useState(false);
  
  const colorSecundario = config?.colorSecundario || '#c9a227';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...form,
      precio: parseFloat(form.precio),
      duracion: parseInt(form.duracion),
      ...(editando && { id: editando.id })
    };
    
    const method = editando ? 'PUT' : 'POST';
    
    await fetch('/api/servicios', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    setModal(false);
    setEditando(null);
    setForm({ nombre: '', precio: '', duracion: '30', descripcion: '', imagenUrl: '' });
    cargarDatos();
  };
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSubiendo(true);
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    
    if (data.url) {
      setForm({ ...form, imagenUrl: data.url });
    }
    setSubiendo(false);
  };
  
  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    await fetch(`/api/servicios?id=${id}`, { method: 'DELETE' });
    cargarDatos();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Servicios</h2>
        <button
          onClick={() => { setModal(true); setEditando(null); setForm({ nombre: '', precio: '', duracion: '30', descripcion: '', imagenUrl: '' }); }}
          className="px-4 py-2 rounded-lg text-white flex items-center gap-2"
          style={{ backgroundColor: colorSecundario }}
        >
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {servicios.map(s => (
          <div key={s.id} className="p-4 rounded-lg" style={{ backgroundColor: config?.colorPrimario }}>
            <div className="h-32 rounded-lg overflow-hidden mb-3 bg-gray-700">
              {s.imagenUrl ? (
                <img src={s.imagenUrl} alt={s.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Scissors className="w-12 h-12 text-gray-600" />
                </div>
              )}
            </div>
            <h3 className="font-bold text-white">{s.nombre}</h3>
            <p className="text-sm text-gray-400 mb-2">{s.descripcion}</p>
            <p className="text-xl font-bold" style={{ color: colorSecundario }}>${s.precio}</p>
            <p className="text-sm text-gray-500">{s.duracion} min</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { setEditando(s); setForm({ nombre: s.nombre, precio: s.precio.toString(), duracion: s.duracion.toString(), descripcion: s.descripcion || '', imagenUrl: s.imagenUrl || '' }); setModal(true); }}
                className="p-2 rounded bg-gray-700 text-white hover:bg-gray-600"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => eliminar(s.id)}
                className="p-2 rounded bg-red-600 text-white hover:bg-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-xl p-6" style={{ backgroundColor: config?.colorPrimario }}>
            <h3 className="text-xl font-bold text-white mb-4">{editando ? 'Editar' : 'Nuevo'} Servicio</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Precio ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.precio}
                    onChange={e => setForm({ ...form, precio: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Duración (min)</label>
                  <input
                    type="number"
                    value={form.duracion}
                    onChange={e => setForm({ ...form, duracion: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 resize-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Imagen</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                    id="img-servicio"
                  />
                  <label htmlFor="img-servicio" className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 cursor-pointer text-center">
                    {subiendo ? 'Subiendo...' : 'Subir imagen'}
                  </label>
                </div>
                {form.imagenUrl && (
                  <img src={form.imagenUrl} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded" />
                )}
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 rounded-lg text-white" style={{ backgroundColor: colorSecundario }}>
                  {editando ? 'Guardar' : 'Crear'}
                </button>
                <button type="button" onClick={() => setModal(false)} className="px-4 py-2 rounded-lg bg-gray-700 text-white">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== ADMIN GALERÍA ==============
function AdminGaleria({ cortes, setCortes, config, cargarDatos }: {
  cortes: Corte[];
  setCortes: (c: Corte[]) => void;
  config: Configuracion | null;
  cargarDatos: () => void;
}) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ titulo: '', descripcion: '', imagenUrl: '' });
  const [subiendo, setSubiendo] = useState(false);
  
  const colorSecundario = config?.colorSecundario || '#c9a227';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await fetch('/api/cortes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    
    setModal(false);
    setForm({ titulo: '', descripcion: '', imagenUrl: '' });
    cargarDatos();
  };
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSubiendo(true);
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    
    if (data.url) {
      setForm({ ...form, imagenUrl: data.url });
    }
    setSubiendo(false);
  };
  
  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta foto?')) return;
    await fetch(`/api/cortes?id=${id}`, { method: 'DELETE' });
    cargarDatos();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Galería de Trabajos</h2>
        <button
          onClick={() => setModal(true)}
          className="px-4 py-2 rounded-lg text-white flex items-center gap-2"
          style={{ backgroundColor: colorSecundario }}
        >
          <Plus className="w-4 h-4" /> Agregar Foto
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cortes.map(c => (
          <div key={c.id} className="aspect-square rounded-lg overflow-hidden relative group" style={{ backgroundColor: config?.colorPrimario }}>
            {c.imagenUrl ? (
              <img src={c.imagenUrl} alt={c.titulo} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <button
                onClick={() => eliminar(c.id)}
                className="p-2 rounded-full bg-red-600 text-white"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-xl p-6" style={{ backgroundColor: config?.colorPrimario }}>
            <h3 className="text-xl font-bold text-white mb-4">Agregar Foto</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={form.titulo}
                  onChange={e => setForm({ ...form, titulo: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Imagen *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                  id="img-corte"
                />
                <label htmlFor="img-corte" className="block w-full px-4 py-8 rounded-lg bg-gray-800 text-white border border-gray-700 cursor-pointer text-center">
                  {subiendo ? 'Subiendo...' : form.imagenUrl ? '✓ Imagen cargada' : 'Click para subir'}
                </label>
                {form.imagenUrl && (
                  <img src={form.imagenUrl} alt="Preview" className="mt-2 w-full h-32 object-cover rounded" />
                )}
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={!form.imagenUrl} className="flex-1 py-2 rounded-lg text-white disabled:opacity-50" style={{ backgroundColor: colorSecundario }}>
                  Guardar
                </button>
                <button type="button" onClick={() => setModal(false)} className="px-4 py-2 rounded-lg bg-gray-700 text-white">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== ADMIN CONFIGURACIÓN ==============
function AdminConfig({ config, setConfig, cargarDatos }: {
  config: Configuracion | null;
  setConfig: (c: Configuracion | null) => void;
  cargarDatos: () => void;
}) {
  const [form, setForm] = useState({
    nombreNegocio: '',
    lema: '',
    logoUrl: '',
    telefono: '',
    whatsapp: '',
    email: '',
    direccion: '',
    mapaUrl: '',
    horarioLunes: '',
    horarioMartes: '',
    horarioMiercoles: '',
    horarioJueves: '',
    horarioViernes: '',
    horarioSabado: '',
    horarioDomingo: '',
    colorPrimario: '',
    colorSecundario: '',
    colorFondo: '',
    instagram: '',
    facebook: '',
    mensajeWhatsapp: '',
    telegramBotToken: '',
    telegramChatId: '',
    notificacionesActivas: false
  });
  
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  
  // Cargar datos en el form
  useEffect(() => {
    if (config) {
      setForm({
        nombreNegocio: config.nombreNegocio || '',
        lema: config.lema || '',
        logoUrl: config.logoUrl || '',
        telefono: config.telefono || '',
        whatsapp: config.whatsapp || '',
        email: config.email || '',
        direccion: config.direccion || '',
        mapaUrl: config.mapaUrl || '',
        horarioLunes: config.horarioLunes || '',
        horarioMartes: config.horarioMartes || '',
        horarioMiercoles: config.horarioMiercoles || '',
        horarioJueves: config.horarioJueves || '',
        horarioViernes: config.horarioViernes || '',
        horarioSabado: config.horarioSabado || '',
        horarioDomingo: config.horarioDomingo || '',
        colorPrimario: config.colorPrimario || '#2d2d2d',
        colorSecundario: config.colorSecundario || '#c9a227',
        colorFondo: config.colorFondo || '#1a1a1a',
        instagram: config.instagram || '',
        facebook: config.facebook || '',
        mensajeWhatsapp: config.mensajeWhatsapp || '',
        telegramBotToken: config.telegramBotToken || '',
        telegramChatId: config.telegramChatId || '',
        notificacionesActivas: config.notificacionesActivas || false
      });
    }
  }, [config]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    
    try {
      const res = await fetch('/api/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        alert('¡Configuración guardada!');
        cargarDatos();
      }
    } catch {
      alert('Error al guardar');
    } finally {
      setGuardando(false);
    }
  };
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSubiendo(true);
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    
    if (data.url) {
      setForm({ ...form, logoUrl: data.url });
    }
    setSubiendo(false);
  };
  
  const colorSecundario = config?.colorSecundario || '#c9a227';
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Configuración</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos del negocio */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: config?.colorPrimario }}>
          <h3 className="text-lg font-bold text-white mb-4">Datos del Negocio</h3>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Scissors className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <div>
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id="logo-upload" />
              <label htmlFor="logo-upload" className="px-4 py-2 rounded-lg bg-gray-700 text-white cursor-pointer hover:bg-gray-600 transition">
                {subiendo ? 'Subiendo...' : 'Subir Logo'}
              </label>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nombre del negocio</label>
              <input
                type="text"
                value={form.nombreNegocio}
                onChange={e => setForm({ ...form, nombreNegocio: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Lema / Eslogan</label>
              <input
                type="text"
                value={form.lema}
                onChange={e => setForm({ ...form, lema: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
              />
            </div>
          </div>
        </div>
        
        {/* Contacto */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: config?.colorPrimario }}>
          <h3 className="text-lg font-bold text-white mb-4">Contacto</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
              <input
                type="tel"
                value={form.telefono}
                onChange={e => setForm({ ...form, telefono: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                placeholder="+52 123 456 7890"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">WhatsApp</label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                placeholder="521234567890"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Instagram</label>
              <input
                type="text"
                value={form.instagram}
                onChange={e => setForm({ ...form, instagram: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                placeholder="@usuario"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Dirección</label>
              <input
                type="text"
                value={form.direccion}
                onChange={e => setForm({ ...form, direccion: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">URL de Google Maps</label>
              <input
                type="url"
                value={form.mapaUrl}
                onChange={e => setForm({ ...form, mapaUrl: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                placeholder="https://maps.google.com/..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Mensaje de WhatsApp predefinido</label>
              <textarea
                value={form.mensajeWhatsapp}
                onChange={e => setForm({ ...form, mensajeWhatsapp: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 resize-none"
                rows={2}
              />
            </div>
          </div>
        </div>
        
        {/* Horarios */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: config?.colorPrimario }}>
          <h3 className="text-lg font-bold text-white mb-4">Horarios</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'].map(dia => {
              const key = `horario${dia}` as keyof typeof form;
              return (
                <div key={dia}>
                  <label className="block text-sm text-gray-400 mb-1">{dia}</label>
                  <input
                    type="text"
                    value={form[key] as string}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                  />
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Colores */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: config?.colorPrimario }}>
          <h3 className="text-lg font-bold text-white mb-4">Colores</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Color Primario</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.colorPrimario}
                  onChange={e => setForm({ ...form, colorPrimario: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={form.colorPrimario}
                  onChange={e => setForm({ ...form, colorPrimario: e.target.value })}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Color Secundario (Dorado)</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.colorSecundario}
                  onChange={e => setForm({ ...form, colorSecundario: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={form.colorSecundario}
                  onChange={e => setForm({ ...form, colorSecundario: e.target.value })}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Color Fondo</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.colorFondo}
                  onChange={e => setForm({ ...form, colorFondo: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={form.colorFondo}
                  onChange={e => setForm({ ...form, colorFondo: e.target.value })}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Notificaciones Telegram */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: config?.colorPrimario }}>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notificaciones Telegram
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Recibe una notificación en Telegram cada vez que alguien agenda una cita.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Bot Token</label>
              <input
                type="text"
                value={form.telegramBotToken}
                onChange={e => setForm({ ...form, telegramBotToken: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                placeholder="123456789:ABCdefGHI..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Chat ID</label>
              <input
                type="text"
                value={form.telegramChatId}
                onChange={e => setForm({ ...form, telegramChatId: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                placeholder="5743796914"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <input
              type="checkbox"
              id="notif-activas"
              checked={form.notificacionesActivas}
              onChange={e => setForm({ ...form, notificacionesActivas: e.target.checked })}
              className="w-5 h-5"
            />
            <label htmlFor="notif-activas" className="text-white">
              Activar notificaciones
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Para obtener tu token, crea un bot con @BotFather en Telegram. Para obtener tu Chat ID, usa @userinfobot.
          </p>
        </div>
        
        {/* Botón guardar */}
        <button
          type="submit"
          disabled={guardando}
          className="w-full py-4 rounded-lg font-bold text-white transition disabled:opacity-50"
          style={{ backgroundColor: colorSecundario }}
        >
          {guardando ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </form>
    </div>
  );
}
