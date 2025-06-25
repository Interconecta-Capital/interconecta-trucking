import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveCard, ResponsiveCardContent, ResponsiveCardHeader, ResponsiveCardTitle } from '@/components/ui/responsive-card';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Truck,
  User,
  Navigation,
  MoreHorizontal,
  Pencil,
  Ban,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useViajes, type Viaje } from '@/hooks/useViajes';
import { ViajeTrackingModal } from '@/components/modals/ViajeTrackingModal';
import { useIsMobile } from '@/hooks/use-mobile';

interface ViajesActivosProps {
  searchTerm: string;
}

export const ViajesActivos = ({ searchTerm }: ViajesActivosProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { viajes, isLoading, cancelarViaje, eliminarViaje } = useViajes();
  const [selectedViaje, setSelectedViaje] = useState<Viaje | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [viajeAccion, setViajeAccion] = useState<Viaje | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Filtrar viajes activos (en_transito, programado, retrasado)
  const viajesActivos = viajes.filter(viaje => 
    ['en_transito', 'programado', 'retrasado'].includes(viaje.estado) &&
    (viaje.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
     viaje.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
     viaje.carta_porte_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleVerTracking = (viaje: Viaje) => {
    setSelectedViaje(viaje);
    setShowTrackingModal(true);
  };

  const handleEdit = (viaje: Viaje) => {
    navigate(`/viajes/editar/${viaje.id}`);
  };

  const openCancelDialog = (viaje: Viaje) => {
    setViajeAccion(viaje);
    setCancelDialogOpen(true);
  };

  const openDeleteDialog = (viaje: Viaje) => {
    setViajeAccion(viaje);
    setDeleteDialogOpen(true);
  };

  const confirmCancel = () => {
    if (viajeAccion) cancelarViaje(viajeAccion.id);
    setCancelDialogOpen(false);
  };

  const confirmDelete = () => {
    if (viajeAccion) eliminarViaje(viajeAccion.id);
    setDeleteDialogOpen(false);
  };

  const getEstadoBadge = (estado: string) => {
    const configs = {
      programado: { label: 'Programado', className: 'bg-blue-500 text-white' },
      en_transito: { label: 'En Tránsito', className: 'bg-green-500 text-white' },
      retrasado: { label: 'Retrasado', className: 'bg-orange-500 text-white' }
    };
    
    const config = configs[estado as keyof typeof configs] || 
                  { label: estado, className: 'bg-gray-500 text-white' };
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularTiempoRestante = (fechaFin: string) => {
    const ahora = new Date();
    const fin = new Date(fechaFin);
    const diferencia = fin.getTime() - ahora.getTime();
    
    if (diferencia <= 0) return 'Vencido';
    
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(horas / 24);
    
    if (dias > 0) return `${dias}d ${horas % 24}h`;
    return `${horas}h`;
  };

  const getProgresoViaje = (viaje: Viaje) => {
    if (viaje.estado === 'completado') return 100;
    if (viaje.estado === 'programado') return 10;
    
    // Calcular progreso basado en tiempo para viajes en tránsito
    if (viaje.fecha_inicio_real && viaje.fecha_fin_programada) {
      const inicio = new Date(viaje.fecha_inicio_real).getTime();
      const fin = new Date(viaje.fecha_fin_programada).getTime();
      const ahora = new Date().getTime();
      
      const tiempoTotal = fin - inicio;
      const tiempoTranscurrido = ahora - inicio;
      
      return Math.min(Math.max((tiempoTranscurrido / tiempoTotal) * 100, 20), 95);
    }
    
    return 50; // Valor por defecto
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-interconecta mx-auto"></div>
          <p className="mt-2 text-gray-60">Cargando viajes activos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Lista de viajes responsiva */}
      {viajesActivos.length === 0 ? (
        <ResponsiveCard className="border-0 shadow-sm bg-gradient-to-br from-gray-05 to-gray-10">
          <ResponsiveCardContent className={isMobile ? "p-8" : "p-16"}>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="h-8 w-8 text-gray-50" />
              </div>
              <h3 className={`font-semibold text-gray-90 mb-3 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                No hay viajes activos
              </h3>
              <p className="text-gray-60 max-w-md mx-auto">
                {searchTerm ? 'No se encontraron viajes con ese criterio de búsqueda' : 'Todos los viajes están completados o no hay viajes programados'}
              </p>
            </div>
          </ResponsiveCardContent>
        </ResponsiveCard>
      ) : (
        <ResponsiveGrid 
          cols={{ default: 1, lg: 2 }} 
          gap={{ default: 4, sm: 6 }}
        >
          {viajesActivos.map((viaje) => (
            <ResponsiveCard key={viaje.id} className="group hover:shadow-lg transition-all duration-200">
              <ResponsiveCardHeader>
                <div className="flex items-center justify-between">
                  <ResponsiveCardTitle className="group-hover:text-blue-interconecta transition-colors">
                    {viaje.carta_porte_id}
                  </ResponsiveCardTitle>
                  {getEstadoBadge(viaje.estado)}
                </div>
              </ResponsiveCardHeader>
              
              <ResponsiveCardContent className={`space-y-4 ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
                {/* Ruta optimizada para móvil */}
                <div className="space-y-3 p-4 bg-gray-05 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-gray-60 uppercase tracking-wider">Origen</span>
                      <p className={`font-medium text-gray-90 truncate ${isMobile ? 'text-sm' : 'text-sm'}`}>{viaje.origen}</p>
                    </div>
                  </div>
                  
                  <div className="ml-1.5 border-l-2 border-dashed border-gray-20 h-4"></div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-gray-60 uppercase tracking-wider">Destino</span>
                      <p className={`font-medium text-gray-90 truncate ${isMobile ? 'text-sm' : 'text-sm'}`}>{viaje.destino}</p>
                    </div>
                  </div>
                </div>

                {/* Progreso visual */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-70">Progreso del viaje</span>
                    <span className="text-sm font-bold text-gray-90">{Math.round(getProgresoViaje(viaje))}%</span>
                  </div>
                  <Progress 
                    value={getProgresoViaje(viaje)} 
                    className="h-2 bg-gray-10"
                  />
                </div>

                {/* Información temporal responsiva */}
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  <div className="p-3 bg-blue-light rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-blue-interconecta" />
                      <span className="text-xs font-medium text-blue-interconecta uppercase tracking-wider">Inicio</span>
                    </div>
                    <p className="text-sm font-medium text-gray-90">
                      {formatDateTime(viaje.fecha_inicio_programada)}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-xs font-medium text-orange-600 uppercase tracking-wider">Restante</span>
                    </div>
                    <p className={`text-sm font-bold ${
                      calcularTiempoRestante(viaje.fecha_fin_programada) === 'Vencido' 
                        ? 'text-red-600' : 'text-gray-90'
                    }`}>
                      {calcularTiempoRestante(viaje.fecha_fin_programada)}
                    </p>
                  </div>
                </div>

                {/* Recursos asignados responsivos */}
                <div className="flex items-center justify-between p-3 bg-gray-05 rounded-xl">
                  <div className={`flex items-center gap-4 ${isMobile ? 'flex-wrap' : ''}`}>
                    {viaje.vehiculo_id && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-interconecta rounded-lg flex items-center justify-center">
                          <Truck className="h-4 w-4 text-pure-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-70">V-{viaje.vehiculo_id.slice(-6)}</span>
                      </div>
                    )}
                    {viaje.conductor_id && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                          <User className="h-4 w-4 text-pure-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-70">C-{viaje.conductor_id.slice(-6)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones responsivas */}
                <div className={`flex gap-3 pt-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
                  <Button
                    onClick={() => handleVerTracking(viaje)}
                    className={`h-11 ${isMobile ? 'w-full' : 'flex-1'}`}
                    size="sm"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Ver Tracking
                  </Button>
                  {!isMobile && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-11 px-4">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => handleEdit(viaje)}
                          disabled={['completado', 'cancelado'].includes(viaje.estado)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar Viaje
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => openCancelDialog(viaje)}
                          disabled={['completado', 'cancelado'].includes(viaje.estado)}
                          className="cursor-pointer"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Cancelar Viaje
                        </DropdownMenuItem>
                        {viaje.estado === 'borrador' && (
                          <DropdownMenuItem
                            onSelect={() => openDeleteDialog(viaje)}
                            className="cursor-pointer text-red-600 focus:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar Viaje
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Alertas específicas */}
                {viaje.estado === 'retrasado' && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Viaje con retraso reportado</span>
                    </div>
                  </div>
                )}

                {viaje.fecha_inicio_real && viaje.estado === 'en_transito' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Truck className="h-4 w-4 text-green-600" />
                      <div>
                        <span className="text-sm font-medium text-green-800">Viaje iniciado</span>
                        <p className="text-xs text-green-700">{formatDateTime(viaje.fecha_inicio_real)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </ResponsiveCardContent>
            </ResponsiveCard>
          ))}
        </ResponsiveGrid>
      )}

      {/* Modal de tracking */}
      <ViajeTrackingModal
        viaje={selectedViaje}
        open={showTrackingModal}
        onOpenChange={setShowTrackingModal}
      />

      {/* Dialogo cancelar viaje */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que deseas cancelar este viaje?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará el viaje como cancelado. Si ya se ha timbrado una Carta Porte para este viaje, deberás realizar el proceso de cancelación correspondiente ante el SAT. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogo eliminar viaje */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este borrador de viaje?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar este borrador permanentemente. Esta acción es irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={confirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
