import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, DollarSign, Clock, Fuel, Route, Filter } from 'lucide-react';

interface VehiculoHistorialViajesProps {
  vehiculoId: string;
  limit?: number;
}

interface ViajeHistorial {
  id: string;
  origen: string;
  destino: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'completado' | 'cancelado' | 'en_transito';
  distanciaKm: number;
  horasDuracion: number;
  costoTotal: number;
  ingresoTotal: number;
  eficienciaCombustible: number;
  conductor?: string;
}

export function VehiculoHistorialViajes({ vehiculoId, limit }: VehiculoHistorialViajesProps) {
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  
  // Simulamos datos para demostración
  const viajes: ViajeHistorial[] = [
    {
      id: '1',
      origen: 'Ciudad de México, CDMX',
      destino: 'Guadalajara, JAL',
      fechaInicio: '2024-01-15T08:00:00Z',
      fechaFin: '2024-01-15T16:30:00Z',
      estado: 'completado',
      distanciaKm: 540,
      horasDuracion: 8.5,
      costoTotal: 4500,
      ingresoTotal: 7200,
      eficienciaCombustible: 8.2,
      conductor: 'Juan Pérez'
    },
    {
      id: '2',
      origen: 'Guadalajara, JAL',
      destino: 'Monterrey, NL',
      fechaInicio: '2024-01-18T06:00:00Z',
      fechaFin: '2024-01-18T14:00:00Z',
      estado: 'completado',
      distanciaKm: 380,
      horasDuracion: 8,
      costoTotal: 3200,
      ingresoTotal: 5400,
      eficienciaCombustible: 9.1,
      conductor: 'Juan Pérez'
    },
    {
      id: '3',
      origen: 'Monterrey, NL',
      destino: 'Tijuana, BC',
      fechaInicio: '2024-01-20T05:30:00Z',
      fechaFin: '2024-01-21T18:00:00Z',
      estado: 'completado',
      distanciaKm: 1200,
      horasDuracion: 36.5,
      costoTotal: 8900,
      ingresoTotal: 14500,
      eficienciaCombustible: 7.8,
      conductor: 'María García'
    }
  ];

  const viajesFiltrados = viajes.filter(viaje => 
    filtroEstado === 'todos' || viaje.estado === filtroEstado
  ).slice(0, limit || viajes.length);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <Badge className="bg-success text-success-foreground">Completado</Badge>;
      case 'cancelado':
        return <Badge className="bg-destructive text-destructive-foreground">Cancelado</Badge>;
      case 'en_transito':
        return <Badge className="bg-info text-info-foreground">En Tránsito</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularMargen = (ingreso: number, costo: number) => {
    return Math.round(((ingreso - costo) / ingreso) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Historial de Viajes
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltroEstado('todos')}
              className={filtroEstado === 'todos' ? 'bg-muted' : ''}
            >
              Todos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltroEstado('completado')}
              className={filtroEstado === 'completado' ? 'bg-muted' : ''}
            >
              Completados
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viajesFiltrados.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay viajes registrados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {viajesFiltrados.map((viaje) => (
              <div
                key={viaje.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors animate-fade-in"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium">{viaje.origen}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium">{viaje.destino}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(viaje.fechaInicio)} {formatTime(viaje.fechaInicio)}
                      </div>
                      {viaje.conductor && (
                        <span>Conductor: {viaje.conductor}</span>
                      )}
                    </div>
                  </div>
                  {getEstadoBadge(viaje.estado)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Route className="h-3 w-3 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Distancia</p>
                      <p className="font-medium">{viaje.distanciaKm} km</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Duración</p>
                      <p className="font-medium">{viaje.horasDuracion}h</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Fuel className="h-3 w-3 text-warning" />
                    <div>
                      <p className="text-muted-foreground">Eficiencia</p>
                      <p className="font-medium">{viaje.eficienciaCombustible} km/L</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3 text-success" />
                    <div>
                      <p className="text-muted-foreground">Ingreso</p>
                      <p className="font-medium text-success">
                        ${viaje.ingresoTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Margen</p>
                    <p className={`font-medium ${
                      calcularMargen(viaje.ingresoTotal, viaje.costoTotal) > 30 
                        ? 'text-success' 
                        : calcularMargen(viaje.ingresoTotal, viaje.costoTotal) > 15 
                          ? 'text-warning' 
                          : 'text-destructive'
                    }`}>
                      {calcularMargen(viaje.ingresoTotal, viaje.costoTotal)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}