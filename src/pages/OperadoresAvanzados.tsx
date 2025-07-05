
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  Star, 
  Award,
  Search,
  UserCheck,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useGestionOperadores } from '@/hooks/useGestionOperadores';
import { PerformanceCard } from '@/components/operadores/PerformanceCard';
import { AsignacionInteligente } from '@/components/operadores/AsignacionInteligente';
import { CalificacionForm } from '@/components/operadores/CalificacionForm';

export default function OperadoresAvanzados() {
  const { 
    conductores, 
    calificaciones, 
    loading, 
    calcularPerformance 
  } = useGestionOperadores();
  
  const [selectedConductor, setSelectedConductor] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [showCalificacionForm, setShowCalificacionForm] = useState(false);
  const [conductorParaCalificar, setConductorParaCalificar] = useState<{
    id: string;
    nombre: string;
  } | null>(null);

  const handleVerPerformance = async (conductorId: string) => {
    const performance = await calcularPerformance(conductorId);
    setPerformanceData(performance);
    setSelectedConductor(conductorId);
  };

  const handleCalificar = (conductor: { id: string; nombre: string }) => {
    setConductorParaCalificar(conductor);
    setShowCalificacionForm(true);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return <Badge className="bg-green-100 text-green-800">Disponible</Badge>;
      case 'ocupado':
        return <Badge className="bg-yellow-100 text-yellow-800">Ocupado</Badge>;
      case 'descanso':
        return <Badge className="bg-blue-100 text-blue-800">Descanso</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  const promedioCalificaciones = calificaciones.length > 0 
    ? calificaciones.reduce((acc, cal) => acc + cal.calificacion, 0) / calificaciones.length
    : 0;

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-light">
            <Users className="h-6 w-6 text-blue-interconecta" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión Avanzada de Operadores</h1>
            <p className="text-sm text-gray-600 mt-1">
              Métricas, performance y asignación inteligente
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Operadores</p>
                <p className="text-2xl font-bold text-gray-900">{conductores.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">
                  {conductores.filter(c => c.estado === 'disponible').length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Calificación Promedio</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {promedioCalificaciones.toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Calificaciones</p>
                <p className="text-2xl font-bold text-purple-600">{calificaciones.length}</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="operadores" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="operadores" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Operadores
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="asignacion" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Asignación IA
          </TabsTrigger>
          <TabsTrigger value="calificaciones" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Calificaciones
          </TabsTrigger>
        </TabsList>

        {/* Lista de Operadores */}
        <TabsContent value="operadores" className="space-y-4">
          <div className="grid gap-4">
            {conductores.map((conductor) => (
              <Card key={conductor.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{conductor.nombre}</h3>
                        <p className="text-sm text-gray-600">
                          {conductor.num_licencia && `Lic: ${conductor.num_licencia}`}
                          {conductor.telefono && ` • ${conductor.telefono}`}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {getEstadoBadge(conductor.estado)}
                          {conductor.historial_performance?.calificacion_promedio && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm">
                                {conductor.historial_performance.calificacion_promedio.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerPerformance(conductor.id)}
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Performance
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCalificar({ id: conductor.id, nombre: conductor.nombre })}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Calificar
                      </Button>
                    </div>
                  </div>

                  {/* Certificaciones */}
                  {conductor.certificaciones && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Certificaciones:</h4>
                      <div className="flex flex-wrap gap-1">
                        {conductor.certificaciones.materiales_peligrosos && (
                          <Badge variant="outline">Mat. Peligrosos</Badge>
                        )}
                        {conductor.certificaciones.carga_especializada && (
                          <Badge variant="outline">Carga Especializada</Badge>
                        )}
                        {conductor.certificaciones.primeros_auxilios && (
                          <Badge variant="outline">Primeros Auxilios</Badge>
                        )}
                        {conductor.certificaciones.manejo_defensivo && (
                          <Badge variant="outline">Manejo Defensivo</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-4">
          {selectedConductor && performanceData ? (
            <PerformanceCard 
              performance={performanceData}
              conductorNombre={conductores.find(c => c.id === selectedConductor)?.nombre || ''}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">
                  Selecciona un conductor para ver sus métricas de performance
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Asignación Inteligente */}
        <TabsContent value="asignacion">
          <AsignacionInteligente />
        </TabsContent>

        {/* Calificaciones */}
        <TabsContent value="calificaciones" className="space-y-4">
          <div className="grid gap-4">
            {calificaciones.map((calificacion) => {
              const conductor = conductores.find(c => c.id === calificacion.conductor_id);
              return (
                <Card key={calificacion.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{conductor?.nombre || 'Conductor'}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < calificacion.calificacion
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {calificacion.calificacion}/5
                          </span>
                        </div>
                        {calificacion.comentarios && (
                          <p className="text-sm text-gray-600 mt-2">
                            "{calificacion.comentarios}"
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(calificacion.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de calificación */}
      {conductorParaCalificar && (
        <CalificacionForm
          open={showCalificacionForm}
          onOpenChange={setShowCalificacionForm}
          conductorId={conductorParaCalificar.id}
          conductorNombre={conductorParaCalificar.nombre}
        />
      )}
    </div>
  );
}
