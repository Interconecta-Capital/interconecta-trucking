
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, MapPin, User, Calendar, Clock, Eye, Edit, Trash2, Route } from 'lucide-react';
import { useViajes } from '@/hooks/useViajes';
import { BorradoresSection } from '@/components/viajes/BorradoresSection';
import { ViajeWizardModalProvider, useViajeWizardModal } from '@/contexts/ViajeWizardModalProvider';
import { ViajeWizardModal } from '@/components/viajes/ViajeWizardModal';
import { ViajeCardCollapsible } from '@/components/viajes/ViajeCardCollapsible';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<string>('todos');
  
  // Abrir modal del último viaje creado automáticamente
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

  // Filtrar viajes por búsqueda y estado
  const viajesFiltrados = viajes.filter(viaje => {
    const query = searchQuery.toLowerCase();
    const trackingData = viaje.tracking_data || {};
    
    const matchSearch = searchQuery === '' || 
      viaje.origen.toLowerCase().includes(query) ||
      viaje.destino.toLowerCase().includes(query) ||
      trackingData.cliente?.nombre_razon_social?.toLowerCase().includes(query) ||
      trackingData.cliente?.rfc?.toLowerCase().includes(query) ||
      trackingData.conductor?.nombre?.toLowerCase().includes(query) ||
      trackingData.conductor?.num_licencia?.toLowerCase().includes(query) ||
      trackingData.vehiculo?.placa?.toLowerCase().includes(query) ||
      trackingData.vehiculo?.marca?.toLowerCase().includes(query) ||
      trackingData.remolque?.placa?.toLowerCase().includes(query) ||
      trackingData.socio?.nombre?.toLowerCase().includes(query) ||
      viaje.id.toLowerCase().includes(query);
    
    let matchEstado = false;
    if (estadoFiltro === 'todos') {
      matchEstado = true;
    } else if (estadoFiltro === 'activos') {
      matchEstado = ['en_transito', 'retrasado'].includes(viaje.estado);
    } else {
      matchEstado = viaje.estado === estadoFiltro;
    }
    
    return matchSearch && matchEstado;
  });

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

  const handleEditarViaje = (viaje: Viaje) => {
    navigate(`/viajes/editar/${viaje.id}`);
  };

  useEffect(() => {
    setFABConfig({
      icon: <Route className="fab-icon" />,
      text: 'Nuevo',
      onClick: openViajeWizard,
      isVisible: !isLoading
    });
    return () => setFABConfig({ isVisible: false });
  }, [isLoading]);

  const renderViajesList = (viajesList: Viaje[], emptyMessage: string) => {
    if (viajesList.length === 0) {
      return (
        <div className="empty-state-container text-center py-12">
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
        {viajesList.map((viaje) => (
          <ViajeCardCollapsible
            key={viaje.id}
            viaje={viaje}
            onVerViaje={handleVerViaje}
            onEditarViaje={handleEditarViaje}
            onEliminarViaje={handleEliminarViaje}
          />
        ))}
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

      {/* Barra de búsqueda y filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por cliente, operador, conductor, socio, remolque, número de viaje..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="activos">Activos</SelectItem>
                <SelectItem value="programado">Programados</SelectItem>
                <SelectItem value="en_transito">En Tránsito</SelectItem>
                <SelectItem value="completado">Completados</SelectItem>
                <SelectItem value="retrasado">Retrasados</SelectItem>
                <SelectItem value="cancelado">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Viajes */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Route className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">
              {estadoFiltro === 'todos' ? 'Todos los Viajes' :
               estadoFiltro === 'activos' ? 'Viajes Activos' :
               estadoFiltro === 'programado' ? 'Viajes Programados' :
               estadoFiltro === 'en_transito' ? 'Viajes En Tránsito' :
               estadoFiltro === 'completado' ? 'Viajes Completados' :
               estadoFiltro === 'retrasado' ? 'Viajes Retrasados' :
               estadoFiltro === 'cancelado' ? 'Viajes Cancelados' :
               'Viajes'}
            </h2>
            <Badge variant="secondary">{viajesFiltrados.length}</Badge>
            {searchQuery && (
              <Badge variant="outline" className="ml-2">
                {viajesFiltrados.length} resultado{viajesFiltrados.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {renderViajesList(viajesFiltrados, "No hay viajes que coincidan con los filtros")}
        </CardContent>
      </Card>

      <ViajeTrackingModal
        viaje={selectedViaje}
        open={showTrackingModal}
        onOpenChange={setShowTrackingModal}
      />

      {showDiagnostic && (
        <DiagnosticPanel
          onClose={() => setShowDiagnostic(false)}
        />
      )}
    </div>
  );
}

export default function ViajesOptimized() {
  return (
    <ViajeWizardModalProvider>
      <ViajesContent />
      <ViajeWizardModal />
    </ViajeWizardModalProvider>
  );
}
