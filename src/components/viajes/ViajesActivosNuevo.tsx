
import { useState } from 'react';
import { ResponsiveCard, ResponsiveCardContent, ResponsiveCardHeader, ResponsiveCardTitle } from '@/components/ui/responsive-card';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  MapPin, 
  Clock, 
  Truck, 
  User, 
  Navigation,
  Search,
  Filter,
  MoreHorizontal,
  AlertTriangle,
  Package,
  Edit,
  UserCheck,
  TruckIcon,
  CheckCircle,
  XCircle,
  PlayCircle
} from 'lucide-react';
import { useViajesCompletos, ViajeCompleto } from '@/hooks/useViajesCompletos';
import { ViajeTrackingModal } from '@/components/modals/ViajeTrackingModal';
import { useIsMobile } from '@/hooks/use-mobile';

export const ViajesActivosNuevo = () => {
  const isMobile = useIsMobile();
  const { viajesActivos, isLoading, actualizarEstadoViaje } = useViajesCompletos();
  const [selectedViaje, setSelectedViaje] = useState<ViajeCompleto | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar viajes por búsqueda
  const viajesFiltrados = viajesActivos.filter(viaje => 
    viaje.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    viaje.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
    viaje.carta_porte_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    viaje.conductor?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    viaje.vehiculo?.placa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerTracking = (viaje: ViajeCompleto) => {
    setSelectedViaje(viaje);
    setShowTrackingModal(true);
  };

  const handleCambiarEstado = (viajeId: string, nuevoEstado: string) => {
    actualizarEstadoViaje({ id: viajeId, nuevoEstado });
  };

  const getEstadoBadge = (estado: string) => {
    const configs = {
      programado: { label: 'Programado', className: 'bg-blue-100 text-blue-800' },
      en_transito: { label: 'En Tránsito', className: 'bg-green-100 text-green-800' },
      retrasado: { label: 'Retrasado', className: 'bg-orange-100 text-orange-800' }
    };
    
    const config = configs[estado as keyof typeof configs] || 
                  { label: estado, className: 'bg-gray-100 text-gray-800' };
    
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

  const getProgresoViaje = (viaje: ViajeCompleto) => {
    if (viaje.estado === 'completado') return 100;
    if (viaje.estado === 'programado') return 10;
    
    if (viaje.fecha_inicio_real && viaje.fecha_fin_programada) {
      const inicio = new Date(viaje.fecha_inicio_real).getTime();
      const fin = new Date(viaje.fecha_fin_programada).getTime();
      const ahora = new Date().getTime();
      
      const tiempoTotal = fin - inicio;
      const tiempoTranscurrido = ahora - inicio;
      
      return Math.min(Math.max((tiempoTranscurrido / tiempoTotal) * 100, 20), 95);
    }
    
    return 50;
  };

  const calcularPesoTotal = (mercancias: any[]) => {
    return mercancias?.reduce((total, m) => total + (m.peso_kg * m.cantidad || 0), 0) || 0;
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
      {/* Filtros y búsqueda */}
      <div className={`flex gap-4 bg-gray-05 p-4 rounded-2xl ${isMobile ? 'flex-col' : 'flex-row'}`}>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-50 h-4 w-4" />
          <Input
            placeholder="Buscar por origen, destino, carta porte, conductor o placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-12 border-0 bg-pure-white shadow-sm ${isMobile ? 'h-12 text-base' : 'h-12'}`}
          />
        </div>
        <Button 
          variant="outline"
          className={`bg-pure-white shadow-sm border-0 ${isMobile ? 'h-12 w-full justify-center' : 'h-12 px-6'}`}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Lista de viajes */}
      {viajesFiltrados.length === 0 ? (
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
          {viajesFiltrados.map((viaje) => (
            <ResponsiveCard key={viaje.id} className="group hover:shadow-lg transition-all duration-200">
              <ResponsiveCardHeader>
                <div className="flex items-center justify-between">
                  <ResponsiveCardTitle className="group-hover:text-blue-interconecta transition-colors">
                    {viaje.carta_porte_id}
                  </ResponsiveCardTitle>
                  <div className="flex items-center gap-2">
                    {getEstadoBadge(viaje.estado)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleVerTracking(viaje)}>
                          <Navigation className="h-4 w-4 mr-2" />
                          Ver Tracking
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {}}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Viaje
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {}}>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Asignar Recursos
                        </DropdownMenuItem>
                        {viaje.estado === 'programado' && (
                          <DropdownMenuItem onClick={() => handleCambiarEstado(viaje.id, 'en_transito')}>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Iniciar Viaje
                          </DropdownMenuItem>
                        )}
                        {viaje.estado === 'en_transito' && (
                          <DropdownMenuItem onClick={() => handleCambiarEstado(viaje.id, 'completado')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Completar Viaje
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleCambiarEstado(viaje.id, 'cancelado')}
                          className="text-red-600"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancelar Viaje
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </ResponsiveCardHeader>
              
              <ResponsiveCardContent className={`space-y-4 ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
                {/* Ruta */}
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

                {/* Cliente y carga */}
                {(viaje.cliente || viaje.mercancias?.length) && (
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">Carga</span>
                    </div>
                    {viaje.cliente && (
                      <p className="text-sm font-medium text-gray-90 mb-1">
                        Cliente: {viaje.cliente.nombre}
                      </p>
                    )}
                    {viaje.mercancias?.length > 0 && (
                      <div className="text-sm text-gray-70">
                        <p>{viaje.mercancias.length} tipo(s) de mercancía</p>
                        <p>Peso total: {calcularPesoTotal(viaje.mercancias).toFixed(0)} kg</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Progreso */}
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

                {/* Información temporal */}
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

                {/* Recursos asignados - CON NOMBRES REALES */}
                <div className="flex items-center justify-between p-3 bg-gray-05 rounded-xl">
                  <div className={`flex items-center gap-4 ${isMobile ? 'flex-wrap' : ''}`}>
                    {viaje.vehiculo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-interconecta rounded-lg flex items-center justify-center">
                          <Truck className="h-4 w-4 text-pure-white" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-gray-90">{viaje.vehiculo.placa}</p>
                          <p className="text-xs text-gray-60">{viaje.vehiculo.marca} {viaje.vehiculo.modelo}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-50">Sin vehículo asignado</div>
                    )}
                    
                    {viaje.conductor ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                          <User className="h-4 w-4 text-pure-white" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-gray-90">{viaje.conductor.nombre}</p>
                          <p className="text-xs text-gray-60">Lic. {viaje.conductor.tipo_licencia || 'N/A'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-50">Sin conductor asignado</div>
                    )}
                  </div>
                </div>

                {/* Acciones principales */}
                <div className={`flex gap-3 pt-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
                  <Button 
                    onClick={() => handleVerTracking(viaje)}
                    className={`h-11 ${isMobile ? 'w-full' : 'flex-1'}`}
                    size="sm"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Ver Tracking
                  </Button>
                </div>

                {/* Alertas */}
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
    </div>
  );
};
