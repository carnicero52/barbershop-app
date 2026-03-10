'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Users, UserPlus, QrCode, Camera, CameraOff, Clock, CheckCircle,
  RefreshCw, Download, Trash2, X, Send, Bell, GraduationCap,
  User, Phone, Hash, BookOpen, Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Html5Qrcode } from 'html5-qrcode';

interface Estudiante {
  id: string;
  codigo: string;
  nombre: string;
  apellido: string;
  grado: string;
  seccion: string;
  padreNombre: string;
  padreTelefono: string;
  padreChatId: string | null;
  activo: boolean;
  _count?: { asistencias: number };
}

interface Asistencia {
  id: string;
  tipo: string;
  hora: string;
  fecha: string;
  estudiante: Estudiante;
}

export default function PanelEscolar() {
  // Estados
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [asistenciasHoy, setAsistenciasHoy] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [seccion, setSeccion] = useState<'dashboard' | 'estudiantes' | 'escanear'>('dashboard');
  
  // Formulario estudiante
  const [modalEstudiante, setModalEstudiante] = useState(false);
  const [formEstudiante, setFormEstudiante] = useState({
    nombre: '', apellido: '', grado: '', seccion: 'A',
    padreNombre: '', padreTelefono: '', padreChatId: ''
  });
  const [guardando, setGuardando] = useState(false);
  
  // QR Scanner
  const [cameraActive, setCameraActive] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error' | 'info'; texto: string } | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Cargar datos
  const cargarDatos = async () => {
    try {
      const [estRes, asisRes] = await Promise.all([
        fetch('/api/estudiantes'),
        fetch('/api/asistencia')
      ]);
      
      if (estRes.ok) setEstudiantes(await estRes.json());
      if (asisRes.ok) setAsistenciasHoy(await asisRes.json());
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Guardar estudiante
  const guardarEstudiante = async () => {
    if (!formEstudiante.nombre || !formEstudiante.apellido || !formEstudiante.padreNombre) {
      setMensaje({ tipo: 'error', texto: 'Nombre, apellido y nombre del padre son obligatorios' });
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch('/api/estudiantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEstudiante)
      });

      if (res.ok) {
        setMensaje({ tipo: 'success', texto: 'Estudiante registrado correctamente' });
        setModalEstudiante(false);
        setFormEstudiante({ nombre: '', apellido: '', grado: '', seccion: 'A', padreNombre: '', padreTelefono: '', padreChatId: '' });
        cargarDatos();
      } else {
        const data = await res.json();
        setMensaje({ tipo: 'error', texto: data.error || 'Error al guardar' });
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    } finally {
      setGuardando(false);
    }
    setTimeout(() => setMensaje(null), 3000);
  };

  // Eliminar estudiante
  const eliminarEstudiante = async (id: string) => {
    if (!confirm('¿Desactivar este estudiante?')) return;
    try {
      await fetch(`/api/estudiantes?id=${id}`, { method: 'DELETE' });
      cargarDatos();
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al eliminar' });
    }
  };

  // Generar y descargar QR
  const descargarQR = (estudiante: Estudiante) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(estudiante.codigo)}`;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR_${estudiante.nombre}_${estudiante.apellido}.png`;
    link.click();
  };

  // Scanner QR
  const startScanner = useCallback(async () => {
    if (!scannerRef.current) return;
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      }

      html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText: string) => {
          try {
            await html5QrCodeRef.current?.stop();
            setCameraActive(false);
          } catch {}
          await registrarAsistencia(decodedText);
        },
        () => {}
      );
      setCameraActive(true);
    } catch (err) {
      console.error('Error iniciando cámara:', err);
      setMensaje({ tipo: 'error', texto: 'No se pudo acceder a la cámara' });
    }
  }, []);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch {}
      html5QrCodeRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (seccion === 'escanear') {
      const timer = setTimeout(() => startScanner(), 300);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }
  }, [seccion, startScanner, stopScanner]);

  // Registrar asistencia
  const registrarAsistencia = async (codigo: string) => {
    try {
      const res = await fetch('/api/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const emoji = data.tipo === 'entrada' ? '✅' : '👋';
        setMensaje({
          tipo: 'success',
          texto: `${emoji} ${data.tipo.toUpperCase()}\n${data.asistencia.estudiante.nombre} ${data.asistencia.estudiante.apellido}\n${data.mensajePadre}`
        });
        cargarDatos();
        if (navigator.vibrate) navigator.vibrate(200);
      } else {
        setMensaje({ tipo: 'error', texto: data.error || 'Error al registrar' });
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    }
    setTimeout(() => setMensaje(null), 5000);
  };

  // Estadísticas
  const totalEstudiantes = estudiantes.length;
  const entradasHoy = asistenciasHoy.filter(a => a.tipo === 'entrada').length;
  const salidasHoy = asistenciasHoy.filter(a => a.tipo === 'salida').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-emerald-500 text-white p-4 shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8" />
            <div>
              <h1 className="font-bold text-lg">Control de Asistencia Escolar</h1>
              <p className="text-sm opacity-80">Notificaciones por Telegram</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <span className="text-sm">{totalEstudiantes} estudiantes</span>
          </div>
        </div>
      </header>

      {/* Navegación */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 py-2 overflow-x-auto">
            {[
              { id: 'dashboard', icon: Clock, label: 'Hoy' },
              { id: 'escanear', icon: QrCode, label: 'Escanear QR' },
              { id: 'estudiantes', icon: Users, label: 'Estudiantes' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setSeccion(item.id as typeof seccion)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  seccion === item.id
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mensaje */}
      {mensaje && (
        <div className="p-4 max-w-6xl mx-auto">
          <div className={`p-4 rounded-lg ${
            mensaje.tipo === 'success' ? 'bg-green-100 text-green-800 border border-green-300' :
            mensaje.tipo === 'info' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
            'bg-red-100 text-red-800 border border-red-300'
          }`}>
            <p className="font-medium whitespace-pre-line">{mensaje.texto}</p>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-4">
        {/* Dashboard */}
        {seccion === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-2xl font-bold">{totalEstudiantes}</p>
                  <p className="text-sm text-gray-500">Estudiantes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                  <p className="text-2xl font-bold">{entradasHoy}</p>
                  <p className="text-sm text-gray-500">Entradas Hoy</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                  <p className="text-2xl font-bold">{salidasHoy}</p>
                  <p className="text-sm text-gray-500">Salidas Hoy</p>
                </CardContent>
              </Card>
            </div>

            {/* Últimos movimientos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-500" />
                  Últimos Movimientos Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {asistenciasHoy.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No hay registros hoy</p>
                  ) : (
                    asistenciasHoy.map(a => (
                      <div key={a.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            a.tipo === 'entrada' ? 'bg-green-100' : 'bg-orange-100'
                          }`}>
                            <span className="text-xl">{a.tipo === 'entrada' ? '✅' : '👋'}</span>
                          </div>
                          <div>
                            <p className="font-medium">{a.estudiante.nombre} {a.estudiante.apellido}</p>
                            <p className="text-xs text-gray-500">{a.estudiante.grado} - "{a.estudiante.seccion}"</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            a.tipo === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {a.tipo === 'entrada' ? 'ENTRADA' : 'SALIDA'}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">{a.hora}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Escanear QR */}
        {seccion === 'escanear' && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div id="qr-reader" ref={scannerRef} className="w-full min-h-[300px] bg-gray-100 rounded-lg overflow-hidden" />
                <div className="flex gap-2 mt-4">
                  {!cameraActive ? (
                    <Button onClick={startScanner} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                      <Camera className="w-4 h-4 mr-2" /> Iniciar Cámara
                    </Button>
                  ) : (
                    <Button onClick={stopScanner} variant="outline" className="flex-1">
                      <CameraOff className="w-4 h-4 mr-2" /> Detener Cámara
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Últimos registros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {asistenciasHoy.slice(0, 5).map(a => (
                    <div key={a.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div>
                        <p className="font-medium text-sm">{a.estudiante.nombre} {a.estudiante.apellido}</p>
                        <p className="text-xs text-gray-500">{a.estudiante.grado}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg">{a.tipo === 'entrada' ? '✅' : '👋'}</span>
                        <p className="text-sm text-gray-600">{a.hora}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Estudiantes */}
        {seccion === 'estudiantes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Estudiantes Registrados</h2>
              <Button onClick={() => setModalEstudiante(true)} className="bg-emerald-500 hover:bg-emerald-600">
                <UserPlus className="w-4 h-4 mr-2" /> Nuevo Estudiante
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {estudiantes.map(e => (
                <Card key={e.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold">{e.nombre} {e.apellido}</p>
                          <p className="text-sm text-gray-500">{e.grado} - "{e.seccion}"</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Hash className="w-4 h-4" />
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{e.codigo}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Padre: {e.padreNombre}</span>
                      </div>
                      {e.padreTelefono && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{e.padreTelefono}</span>
                        </div>
                      )}
                      {e.padreChatId && (
                        <div className="flex items-center gap-2 text-green-600">
                          <Send className="w-4 h-4" />
                          <span className="text-xs">Telegram configurado ✓</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => descargarQR(e)} variant="outline" size="sm" className="flex-1">
                        <QrCode className="w-4 h-4 mr-1" /> QR
                      </Button>
                      <Button onClick={() => eliminarEstudiante(e.id)} variant="outline" size="sm">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {estudiantes.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay estudiantes registrados</p>
                  <p className="text-sm">Haz clic en "Nuevo Estudiante" para agregar</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Modal Nuevo Estudiante */}
      {modalEstudiante && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Nuevo Estudiante</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setModalEstudiante(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-gray-500">Nombre *</label>
                  <input
                    type="text"
                    value={formEstudiante.nombre}
                    onChange={(ev) => setFormEstudiante({ ...formEstudiante, nombre: ev.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Apellido *</label>
                  <input
                    type="text"
                    value={formEstudiante.apellido}
                    onChange={(ev) => setFormEstudiante({ ...formEstudiante, apellido: ev.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-gray-500">Grado</label>
                  <input
                    type="text"
                    value={formEstudiante.grado}
                    onChange={(ev) => setFormEstudiante({ ...formEstudiante, grado: ev.target.value })}
                    placeholder="Ej: 3ro"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Sección</label>
                  <select
                    value={formEstudiante.seccion}
                    onChange={(ev) => setFormEstudiante({ ...formEstudiante, seccion: ev.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="font-medium mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> Datos del Padre/Tutor
                </p>
                
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-500">Nombre completo *</label>
                    <input
                      type="text"
                      value={formEstudiante.padreNombre}
                      onChange={(ev) => setFormEstudiante({ ...formEstudiante, padreNombre: ev.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Teléfono</label>
                    <input
                      type="tel"
                      value={formEstudiante.padreTelefono}
                      onChange={(ev) => setFormEstudiante({ ...formEstudiante, padreTelefono: ev.target.value })}
                      placeholder="+52 123 456 7890"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Chat ID Telegram</label>
                    <input
                      type="text"
                      value={formEstudiante.padreChatId}
                      onChange={(ev) => setFormEstudiante({ ...formEstudiante, padreChatId: ev.target.value })}
                      placeholder="Ej: 5743796914"
                      className="w-full border rounded px-3 py-2"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      El padre puede obtener su Chat ID enviando /start a @userinfobot en Telegram
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={guardarEstudiante}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button variant="outline" onClick={() => setModalEstudiante(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
