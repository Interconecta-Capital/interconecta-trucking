
import React, { Suspense, lazy } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, User, Calendar, Clock, Eye, Edit, Trash2, Route } from 'lucide-react';
import { useViajes } from '@/hooks/useViajes';
import { BorradoresSection } from '@/components/viajes/BorradoresSection';
import { ViajeWizardModalProvider, useViajeWizardModal } from '@/contexts/ViajeWizardModalProvider';
import { ViajeWizardModal } from '@/components/viajes/ViajeWizardModal';
import { toast } from 'sonner';
import { Viaje } from '@/types/viaje';

// Lazy load components with proper default export handling
const ViajesAnalytics = lazy(async () => {
  const module = await import('@/components/analytics/ViajesAnalytics');
  return { default: module.default };
});

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
  const { viajes, isLoading, eliminarViaje } = useViajes();
  const { openViajeWizard } = useViajeWizardModal();

  const handleEliminarViaje = (viaje: Viaje) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el viaje ${viaje.origen} → ${viaje.destino}?`)) {
      eliminarViaje(viaje.id);
    }
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
        <Button onClick={openViajeWizard} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Programar Viaje
        </Button>
      </div>

      {/* Sección de Borradores */}
      <BorradoresSection />

      {/* Analytics */}
      <Suspense fallback={
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      }>
        <ViajesAnalytics />
      </Suspense>

      {/* Lista de Viajes */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Route className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Viajes Activos</h2>
            <Badge variant="secondary">{viajes.length}</Badge>
          </div>

          {viajes.length === 0 ? (
            <div className="text-center py-12">
              <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No hay viajes programados</p>
              <p className="text-gray-600 mb-4">
                Comienza creando tu primer viaje para gestionar tus operaciones de transporte
              </p>
              <Button onClick={openViajeWizard} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Programar Primer Viaje
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {viajes.map((viaje) => (
                <Card key={viaje.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="font-medium text-lg truncate">
                            {viaje.origen} → {viaje.destino}
                          </span>
                          <Badge className={estadoColors[viaje.estado]}>
                            {estadoLabels[viaje.estado]}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
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

                          {viaje.tracking_data?.cliente && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="truncate">
                                {viaje.tracking_data.cliente.nombre_razon_social}
                              </span>
                            </div>
                          )}
                        </div>

                        {viaje.observaciones && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {viaje.observaciones}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
