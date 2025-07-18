import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Truck, 
  Star, 
  Clock, 
  Award, 
  TrendingUp,
  MapPin,
  Phone,
  Filter,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// Hook simulado para obtener datos de conductores
const useConductoresData = () => {
  // En la implementación real, esto vendría de useQuery con Supabase
  return {
    conductores: [
      {
        id: '1',
        nombre: 'Juan Pérez',
        telefono: '+52 555 1234',
        email: 'juan.perez@email.com',
        estado: 'disponible',
        calificacion: 4.8,
        viajesCompletados: 156,
        kmRecorridos: 45230,
        eficienciaCombustible: 8.2,
        puntualidad: 94,
        ubicacionActual: 'Ciudad de México',
        vehiculoAsignado: 'Camión - ABC123',
        ultimoViaje: '2024-01-15',
        ingresosMes: 35000,
        costosMantenimiento: 2500
      },
      {
        id: '2',
        nombre: 'María González',
        telefono: '+52 555 5678',
        email: 'maria.gonzalez@email.com',
        estado: 'en_transito',
        calificacion: 4.9,
        viajesCompletados: 203,
        kmRecorridos: 67890,
        eficienciaCombustible: 8.7,
        puntualidad: 97,
        ubicacionActual: 'En ruta a Guadalajara',
        vehiculoAsignado: 'Camión - DEF456',
        ultimoViaje: '2024-01-16',
        ingresosMes: 42000,
        costosMantenimiento: 1800
      },
      {
        id: '3',
        nombre: 'Carlos Rodríguez',
        telefono: '+52 555 9012',
        email: 'carlos.rodriguez@email.com',
        estado: 'descanso',
        calificacion: 4.6,
        viajesCompletados: 89,
        kmRecorridos: 23450,
        eficienciaCombustible: 7.9,
        puntualidad: 89,
        ubicacionActual: 'Monterrey',
        vehiculoAsignado: 'Camión - GHI789',
        ultimoViaje: '2024-01-14',
        ingresosMes: 28000,
        costosMantenimiento: 3200
      }
    ],
    isLoading: false
  };
};

const ESTADOS_CONDUCTOR = {
  disponible: { label: 'Disponible', color: 'bg-green-500' },
  en_transito: { label: 'En Tránsito', color: 'bg-yellow-500' },
  descanso: { label: 'En Descanso', color: 'bg-blue-500' },
  mantenimiento: { label: 'Mantenimiento', color: 'bg-red-500' }
};

export default function ConductoresDashboard() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [ordenPor, setOrdenPor] = useState('calificacion');
  
  const { conductores, isLoading } = useConductoresData();

  // Filtrar y ordenar conductores
  const conductoresFiltrados = conductores
    .filter(conductor => {
      const matchBusqueda = conductor.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                           conductor.telefono.includes(busqueda);
      const matchEstado = filtroEstado === 'todos' || conductor.estado === filtroEstado;
      return matchBusqueda && matchEstado;
    })
    .sort((a, b) => {
      switch (ordenPor) {
        case 'calificacion':
          return b.calificacion - a.calificacion;
        case 'viajes':
          return b.viajesCompletados - a.viajesCompletados;
        case 'puntualidad':
          return b.puntualidad - a.puntualidad;
        case 'eficiencia':
          return b.eficienciaCombustible - a.eficienciaCombustible;
        default:
          return 0;
      }
    });

  // Métricas generales
  const metrics = {
    totalConductores: conductores.length,
    disponibles: conductores.filter(c => c.estado === 'disponible').length,
    enTransito: conductores.filter(c => c.estado === 'en_transito').length,
    calificacionPromedio: conductores.reduce((sum, c) => sum + c.calificacion, 0) / conductores.length,
    eficienciaPromedio: conductores.reduce((sum, c) => sum + c.eficienciaCombustible, 0) / conductores.length,
    puntualidadPromedio: conductores.reduce((sum, c) => sum + c.puntualidad, 0) / conductores.length,
    ingresosTotales: conductores.reduce((sum, c) => sum + c.ingresosMes, 0)
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Cargando dashboard de conductores...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Conductores</h1>
          <p className="text-muted-foreground">
            Gestión y análisis de performance de conductores
          </p>
        </div>
        <Button>
          <User className="h-4 w-4 mr-2" />
          Nuevo Conductor
        </Button>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conductores</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalConductores}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-green-600">{metrics.disponibles} disponibles</span>
              <span>•</span>
              <span className="text-yellow-600">{metrics.enTransito} en ruta</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {metrics.calificacionPromedio.toFixed(1)}
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
            </div>
            <p className="text-xs text-muted-foreground">
              Basado en evaluaciones de clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntualidad</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.puntualidadPromedio.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Entregas a tiempo promedio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia Combustible</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.eficienciaPromedio.toFixed(1)} km/L
            </div>
            <p className="text-xs text-muted-foreground">
              Consumo promedio de la flota
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Conductores Activos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nombre o teléfono..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="todos">Todos los estados</option>
              {Object.entries(ESTADOS_CONDUCTOR).map(([estado, config]) => (
                <option key={estado} value={estado}>{config.label}</option>
              ))}
            </select>
            
            <select
              value={ordenPor}
              onChange={(e) => setOrdenPor(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="calificacion">Ordenar por calificación</option>
              <option value="viajes">Ordenar por viajes</option>
              <option value="puntualidad">Ordenar por puntualidad</option>
              <option value="eficiencia">Ordenar por eficiencia</option>
            </select>
          </div>

          {/* Lista de conductores */}
          <div className="space-y-4">
            {conductoresFiltrados.map((conductor) => {
              const estadoConfig = ESTADOS_CONDUCTOR[conductor.estado as keyof typeof ESTADOS_CONDUCTOR];
              
              return (
                <div key={conductor.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {conductor.nombre.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-medium text-lg">{conductor.nombre}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {conductor.telefono}
                          </span>
                          <span className="flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            {conductor.vehiculoAsignado}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {conductor.ubicacionActual}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={`${estadoConfig.color} text-white`}>
                        {estadoConfig.label}
                      </Badge>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{conductor.calificacion}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {conductor.viajesCompletados} viajes
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Métricas de performance */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Puntualidad</p>
                      <div className="flex items-center gap-2">
                        <Progress value={conductor.puntualidad} className="h-2 flex-1" />
                        <span className="text-sm font-medium">{conductor.puntualidad}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground">Eficiencia</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{conductor.eficienciaCombustible} km/L</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground">Ingresos del mes</p>
                      <span className="text-sm font-medium text-green-600">
                        ${conductor.ingresosMes.toLocaleString()}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground">KM recorridos</p>
                      <span className="text-sm font-medium">
                        {conductor.kmRecorridos.toLocaleString()} km
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rankings y estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Conductores por Calificación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conductoresFiltrados.slice(0, 5).map((conductor, index) => (
                <div key={conductor.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                      {index + 1}
                    </div>
                    <span className="font-medium">{conductor.nombre}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{conductor.calificacion}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de la Flota</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Ingresos totales del mes</span>
              <span className="font-medium text-green-600">
                ${metrics.ingresosTotales.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Kilómetros totales</span>
              <span className="font-medium">
                {conductores.reduce((sum, c) => sum + c.kmRecorridos, 0).toLocaleString()} km
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Viajes completados</span>
              <span className="font-medium">
                {conductores.reduce((sum, c) => sum + c.viajesCompletados, 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Costos de mantenimiento</span>
              <span className="font-medium text-red-600">
                ${conductores.reduce((sum, c) => sum + c.costosMantenimiento, 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}