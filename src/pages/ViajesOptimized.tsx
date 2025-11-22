
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, MapPin, User, Calendar, Clock, Eye, Edit, Trash2, Route } from 'lucide-react';
import { useViajes } from '@/hooks/useViajes';
import { BorradoresSection } from '@/components/viajes/BorradoresSection';
import { ViajeWizardModalProvider, useViajeWizardModal } from '@/contexts/ViajeWizardModalProvider';
import { ViajeWizardModal } from '@/components/viajes/ViajeWizardModal';
import { toast } from 'sonner';
import { Viaje } from '@/types/viaje';
import { ViajeTrackingModal } from '@/components/modals/ViajeTrackingModal';
import { useNavigate } from 'react-router-dom';
import { useFAB } from '@/contexts/FABContext';
import { DiagnosticPanel } from '@/components/viajes/diagnostic/DiagnosticPanel';
import { usePermissions } from '@/hooks/usePermissions';

const estadoColors = {
  programado: 'bg-blue-100 text-blue-800',
  en_transito: 'bg-yellow-100 text-yellow-800',
  completado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
  retrasado: 'bg-orange-100 text-orange-800',
  borrador: 'bg-gray-100 text-gray-800'
};

const estadoLabels = {
  programado: 'Programado',
  en_transito: 'En Tránsito',
  completado: 'Completado',
  cancelado: 'Cancelado',
  retrasado: 'Retrasado',
  borrador: 'Borrador'
};

function ViajesContent() {
  const navigate = useNavigate();
  const { viajes, isLoading, eliminarViaje } = useViajes();
  const { openViajeWizard } = useViajeWizardModal();
  const { setFABConfig } = useFAB();
  const { isSuperuser } = usePermissions();
  const [selectedViaje, setSelectedViaje] = useState<Viaje | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  
  // ✅ NUEVO: Abrir modal del último viaje creado automáticamente
  useEffect(() => {
    const ultimoViajeId = sessionStorage.getItem('ultimo_viaje_creado');
    if (ultimoViajeId && viajes.length > 0 && !isLoading) {
      const viajeCreado = viajes.find(v => v.id === ultimoViajeId);
      if (viajeCreado) {
        setSelectedViaje(viajeCreado);
        setShowTrackingModal(true);
        sessionStorage.removeItem('ultimo_viaje_creado');
      }
    }
  }, [viajes, isLoading]);

  const handleEliminarViaje = async (viaje: Viaje) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el viaje ${viaje.origen} → ${viaje.destino}?`)) {
      return;
    }

    try {
      eliminarViaje(viaje.id);
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar el viaje');
    }
  };

  const handleVerViaje = (viaje: Viaje) => {
    setSelectedViaje(viaje);
    setShowTrackingModal(true);
  };

  useEffect(() => {
    // FASE 3: Ocultar botón FAB durante creación de viaje
    const isCreating = isLoading; // Usar estado de loading para detectar creación
    setFABConfig({
      icon: <Route className="fab-icon" />,
      text: 'Nuevo',
      onClick: openViajeWizard,
      isVisible: !isCreating // Ocultar si está creando
    })
    return () => setFABConfig({ isVisible: false })
  }, [isLoading])

  const handleEditarViaje = (viaje: Viaje) => {
    navigate(`/viajes/editar/${viaje.id}`);
  };
  
  // ✅ NUEVO: Filtrar viajes por búsqueda y estado
  // Filtrar por estado para las pestañas
  const viajesActivos = viajes.filter(v => ['en_transito', 'retrasado'].includes(v.estado));
  const viajesProgramados = viajes.filter(v => v.estado === 'programado');
  const viajesCancelados = viajes.filter(v => v.estado === 'cancelado');
  const viajesCompletados = viajes.filter(v => v.estado === 'completado');
  const viajesHistorial = viajes.filter(v => ['completado', 'cancelado'].includes(v.estado));

  const renderViajesList = (viajesList: Viaje[], emptyMessage: string) => {
    if (viajesList.length === 0) {
      return (
        <div className="empty-state-container text-center">
          <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</p>
          <Button onClick={openViajeWizard} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Programar Primer Viaje
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {viajesList.map((viaje) => {
          const conductor = viaje.tracking_data?.conductor;
          const vehiculo = viaje.tracking_data?.vehiculo;
          const cliente = viaje.tracking_data?.cliente;
          const mercancias = viaje.tracking_data?.mercancias || [];
          const totalMercancias = mercancias.length;
          
          return (
            <Card key={viaje.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between viaje-card">
                  <div className="flex-1 min-w-0">
                    {/* Encabezado con ruta y estado */}
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="font-medium text-lg address-text">
                        {viaje.origen} → {viaje.destino}
                      </span>
                      <Badge className={`viaje-card-status ${estadoColors[viaje.estado]}`}>
                        {estadoLabels[viaje.estado]}
                      </Badge>
                    </div>

                    {/* Grid con información detallada */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      {/* Conductor */}
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">Conductor</p>
                          <p className="text-gray-600 truncate">
                            {conductor?.nombre || 'No asignado'}
                          </p>
                        </div>
                      </div>

                      {/* Vehículo */}
                      <div className="flex items-start gap-2">
                        <svg className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">Vehículo</p>
                          <p className="text-gray-600 truncate">
                            {vehiculo ? `${vehiculo.placa} - ${vehiculo.marca || ''} ${vehiculo.modelo || ''}`.trim() : 'No asignado'}
                          </p>
                        </div>
                      </div>

                      {/* Cliente */}
                      <div className="flex items-start gap-2">
                        <svg className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">Cliente</p>
                          <p className="text-gray-600 truncate">
                            {cliente?.nombre_razon_social || 'No especificado'}
                          </p>
                        </div>
                      </div>

                      {/* Carga/Mercancías */}
                      <div className="flex items-start gap-2">
                        <svg className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">Carga</p>
                          <p className="text-gray-600 truncate">
                            {totalMercancias > 0 
                              ? `${totalMercancias} mercancía${totalMercancias > 1 ? 's' : ''}`
                              : 'Sin mercancías'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Fechas en una fila separada */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Inicio: {new Date(viaje.fecha_inicio_programada).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          Fin: {new Date(viaje.fecha_fin_programada).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    {viaje.observaciones && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                        {viaje.observaciones}
                      </p>
                    )}
                  </div>

                <div className="flex items-center gap-2 ml-4 viaje-card-actions">
                  <Button variant="outline" size="sm" onClick={() => handleVerViaje(viaje)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditarViaje(viaje)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEliminarViaje(viaje)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  </div>

                  <div className="flex items-center gap-2 ml-4 viaje-card-actions">
                    <Button variant="outline" size="sm" onClick={() => handleVerViaje(viaje)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/viajes/editar/${viaje.id}`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEliminarViaje(viaje)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>

        {/* Cards skeleton */}
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Viajes</h1>
          <p className="text-muted-foreground mt-2">
            Administra y da seguimiento a todos tus viajes de transporte
          </p>
        </div>
        <div className="flex gap-2">
          {isSuperuser && (
            <Button 
              onClick={() => setShowDiagnostic(true)} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              🔧 Diagnóstico
            </Button>
          )}
          <Button onClick={openViajeWizard} className="flex items-center gap-2 desktop-programar-button">
            <Plus className="h-4 w-4" />
            Programar Viaje
          </Button>
        </div>
      </div>

      {/* Sección de Borradores */}
      <BorradoresSection />

      {/* Lista de Viajes con Pestañas */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Route className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Viajes</h2>
            <Badge variant="secondary">{viajes.length}</Badge>
          </div>

          <Tabs defaultValue="todos" className="w-full">
            <div className="scrollable-tabs-container-wrapper">
              <TabsList className="grid w-full grid-cols-5 scrollable-tabs-container">
              <TabsTrigger value="todos">
                Todos
                <Badge variant="secondary" className="ml-2">
                  {viajes.length}
                </Badge>
              </TabsTrigger>
                <TabsTrigger value="activos">
                  Activos
                  <Badge variant="secondary" className="ml-2">
                    {viajesActivos.length}
                  </Badge>
                </TabsTrigger>
              <TabsTrigger value="programados">
                Programados
                <Badge variant="secondary" className="ml-2">
                  {viajesProgramados.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completados">
                Completados
                <Badge variant="secondary" className="ml-2">
                  {viajesCompletados.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="cancelados">
                Cancelados
                <Badge variant="secondary" className="ml-2">
                  {viajesCancelados.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            </div>
            
            <TabsContent value="todos" className="mt-6">
              {renderViajesList(viajes, "No hay viajes")}
            </TabsContent>

            <TabsContent value="activos" className="mt-6">
              {renderViajesList(viajesActivos, "No hay viajes activos")}
            </TabsContent>

            <TabsContent value="programados" className="mt-6">
              {renderViajesList(viajesProgramados, "No hay viajes programados")}
            </TabsContent>
            
            <TabsContent value="completados" className="mt-6">
              {renderViajesList(viajesCompletados, "No hay viajes completados")}
            </TabsContent>

            <TabsContent value="cancelados" className="mt-6">
              {renderViajesList(viajesCancelados, "No hay viajes cancelados")}
            </TabsContent>

            <TabsContent value="historial" className="mt-6">
              {renderViajesList(viajesHistorial, "No hay viajes en el historial")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ViajeTrackingModal
        viaje={selectedViaje}
        open={showTrackingModal}
        onOpenChange={setShowTrackingModal}
      />

      {showDiagnostic && (
        <DiagnosticPanel onClose={() => setShowDiagnostic(false)} />
      )}
    </div>
  );
}

export default function ViajesOptimized() {
  return (
    <ViajeWizardModalProvider>
      <div className="container mx-auto py-6">
        <ViajesContent />
        <ViajeWizardModal />
      </div>
    </ViajeWizardModalProvider>
  );
}
