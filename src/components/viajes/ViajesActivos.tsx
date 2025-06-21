
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Clock, 
  Truck, 
  User, 
  Navigation,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { useViajes } from '@/hooks/useViajes';
import { ViajeTrackingModal } from '@/components/modals/ViajeTrackingModal';
import { Viaje } from '@/hooks/useViajes';

export const ViajesActivos = () => {
  const { viajes, isLoading } = useViajes();
  const [selectedViaje, setSelectedViaje] = useState<Viaje | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando viajes activos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por origen, destino o carta porte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Lista de viajes */}
      {viajesActivos.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No hay viajes activos
              </h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No se encontraron viajes con ese criterio de búsqueda' : 'Todos los viajes están completados o no hay viajes programados'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {viajesActivos.map((viaje) => (
            <Card key={viaje.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {viaje.carta_porte_id}
                  </CardTitle>
                  {getEstadoBadge(viaje.estado)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Ruta */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Origen:</span>
                    <span className="text-sm">{viaje.origen}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="font-medium">Destino:</span>
                    <span className="text-sm">{viaje.destino}</span>
                  </div>
                </div>

                {/* Progreso visual */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span>{Math.round(getProgresoViaje(viaje))}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        viaje.estado === 'retrasado' ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${getProgresoViaje(viaje)}%` }}
                    />
                  </div>
                </div>

                {/* Información temporal */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Inicio programado
                    </div>
                    <div className="font-medium">
                      {formatDateTime(viaje.fecha_inicio_programada)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Tiempo restante
                    </div>
                    <div className={`font-medium ${
                      calcularTiempoRestante(viaje.fecha_fin_programada) === 'Vencido' 
                        ? 'text-red-600' : ''
                    }`}>
                      {calcularTiempoRestante(viaje.fecha_fin_programada)}
                    </div>
                  </div>
                </div>

                {/* Recursos asignados */}
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-4">
                    {viaje.vehiculo_id && (
                      <div className="flex items-center gap-1">
                        <Truck className="h-3 w-3 text-muted-foreground" />
                        <span>V-{viaje.vehiculo_id.slice(-6)}</span>
                      </div>
                    )}
                    {viaje.conductor_id && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span>C-{viaje.conductor_id.slice(-6)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => handleVerTracking(viaje)}
                    className="flex-1"
                    size="sm"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Ver Tracking
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Alertas específicas */}
                {viaje.estado === 'retrasado' && (
                  <div className="p-2 bg-orange-100 border border-orange-200 rounded text-sm text-orange-800">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Viaje con retraso reportado
                    </div>
                  </div>
                )}

                {viaje.fecha_inicio_real && viaje.estado === 'en_transito' && (
                  <div className="p-2 bg-green-100 border border-green-200 rounded text-sm text-green-800">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Iniciado: {formatDateTime(viaje.fecha_inicio_real)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
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
