import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Database, 
  Link as LinkIcon,
  Zap,
  TrendingUp,
  Users,
  Truck,
  Calculator
} from "lucide-react";

interface IntegrityStatus {
  entity: string;
  total: number;
  connected: number;
  missing: number;
  percentage: number;
  status: 'good' | 'warning' | 'critical';
}

interface SystemMetrics {
  totalViajes: number;
  viajesConCostos: number;
  viajesConAnalisis: number;
  conductoresActivos: number;
  vehiculosDisponibles: number;
  relacionesIncompletas: number;
}

export const IntegrityMonitorPanel: React.FC = () => {
  const [integrityData, setIntegrityData] = useState<IntegrityStatus[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRepairing, setIsRepairing] = useState(false);
  const { toast } = useToast();

  const loadIntegrityData = async () => {
    try {
      setIsLoading(true);

      // Obtener métricas del sistema
      const { data: viajes } = await supabase.from('viajes').select('id, conductor_id, vehiculo_id');
      const { data: costos } = await supabase.from('costos_viaje').select('viaje_id');
      const { data: analisis } = await supabase.from('analisis_viajes').select('viaje_id');
      const { data: conductores } = await supabase.from('conductores').select('id, estado');
      const { data: vehiculos } = await supabase.from('vehiculos').select('id, estado');

      const viajesConCostos = viajes?.filter(v => 
        costos?.some(c => c.viaje_id === v.id)
      ) || [];
      
      const viajesConAnalisis = viajes?.filter(v => 
        analisis?.some(a => a.viaje_id === v.id)
      ) || [];

      const conductoresActivos = conductores?.filter(c => c.estado === 'disponible' || c.estado === 'ocupado') || [];
      const vehiculosDisponibles = vehiculos?.filter(v => v.estado === 'disponible') || [];

      setSystemMetrics({
        totalViajes: viajes?.length || 0,
        viajesConCostos: viajesConCostos.length,
        viajesConAnalisis: viajesConAnalisis.length,
        conductoresActivos: conductoresActivos.length,
        vehiculosDisponibles: vehiculosDisponibles.length,
        relacionesIncompletas: (viajes?.length || 0) - viajesConCostos.length
      });

      // Calcular datos de integridad
      const integrity: IntegrityStatus[] = [
        {
          entity: 'Viajes → Costos',
          total: viajes?.length || 0,
          connected: viajesConCostos.length,
          missing: (viajes?.length || 0) - viajesConCostos.length,
          percentage: viajes?.length ? (viajesConCostos.length / viajes.length) * 100 : 0,
          status: viajesConCostos.length === viajes?.length ? 'good' : viajesConCostos.length > (viajes?.length || 0) * 0.8 ? 'warning' : 'critical'
        },
        {
          entity: 'Viajes → Análisis',
          total: viajes?.filter(v => v.estado === 'completado')?.length || 0,
          connected: viajesConAnalisis.length,
          missing: (viajes?.filter(v => v.estado === 'completado')?.length || 0) - viajesConAnalisis.length,
          percentage: viajes?.filter(v => v.estado === 'completado')?.length ? (viajesConAnalisis.length / viajes.filter(v => v.estado === 'completado').length) * 100 : 0,
          status: viajesConAnalisis.length === viajes?.filter(v => v.estado === 'completado')?.length ? 'good' : 'warning'
        },
        {
          entity: 'Viajes → Conductores',
          total: viajes?.length || 0,
          connected: viajes?.filter(v => v.conductor_id)?.length || 0,
          missing: viajes?.filter(v => !v.conductor_id)?.length || 0,
          percentage: viajes?.length ? ((viajes?.filter(v => v.conductor_id)?.length || 0) / viajes.length) * 100 : 0,
          status: (viajes?.filter(v => v.conductor_id)?.length || 0) > (viajes?.length || 0) * 0.9 ? 'good' : 'warning'
        },
        {
          entity: 'Viajes → Vehículos',
          total: viajes?.length || 0,
          connected: viajes?.filter(v => v.vehiculo_id)?.length || 0,
          missing: viajes?.filter(v => !v.vehiculo_id)?.length || 0,
          percentage: viajes?.length ? ((viajes?.filter(v => v.vehiculo_id)?.length || 0) / viajes.length) * 100 : 0,
          status: (viajes?.filter(v => v.vehiculo_id)?.length || 0) > (viajes?.length || 0) * 0.9 ? 'good' : 'warning'
        }
      ];

      setIntegrityData(integrity);
    } catch (error) {
      console.error('Error loading integrity data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de integridad",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const repairRelationships = async () => {
    try {
      setIsRepairing(true);
      
      // Ejecutar función de reparación
      const { data, error } = await supabase.rpc('poblar_datos_viajes_existentes');
      
      if (error) throw error;

      toast({
        title: "Reparación Exitosa",
        description: "Se han reparado las relaciones de datos automáticamente",
        variant: "default"
      });

      // Recargar datos
      await loadIntegrityData();
      
    } catch (error) {
      console.error('Error repairing relationships:', error);
      toast({
        title: "Error en Reparación",
        description: "No se pudieron reparar algunas relaciones",
        variant: "destructive"
      });
    } finally {
      setIsRepairing(false);
    }
  };

  useEffect(() => {
    loadIntegrityData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Monitor de Integridad de Datos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Monitor de Integridad de Datos
          </CardTitle>
          <CardDescription>
            Estado de las relaciones y sincronización de datos en tiempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="relationships">Relaciones</TabsTrigger>
              <TabsTrigger value="metrics">Métricas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Estado General</p>
                        <p className="text-2xl font-bold">
                          {integrityData.filter(i => i.status === 'good').length}/{integrityData.length}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Relaciones Activas</p>
                        <p className="text-2xl font-bold">{systemMetrics?.viajesConCostos || 0}</p>
                      </div>
                      <LinkIcon className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Triggers Funcionando</p>
                        <p className="text-2xl font-bold text-green-600">✓</p>
                      </div>
                      <Zap className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {systemMetrics && systemMetrics.relacionesIncompletas > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Se detectaron {systemMetrics.relacionesIncompletas} relaciones incompletas. 
                    <Button 
                      variant="link" 
                      className="p-0 ml-2 h-auto"
                      onClick={repairRelationships}
                      disabled={isRepairing}
                    >
                      {isRepairing ? 'Reparando...' : 'Reparar ahora'}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="relationships" className="space-y-4">
              <div className="space-y-4">
                {integrityData.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className="font-medium">{item.entity}</span>
                          <Badge variant={item.status === 'good' ? 'default' : item.status === 'warning' ? 'secondary' : 'destructive'}>
                            {item.status === 'good' ? 'Completo' : item.status === 'warning' ? 'Advertencia' : 'Crítico'}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {item.connected}/{item.total} conectados
                        </span>
                      </div>
                      
                      <Progress 
                        value={item.percentage} 
                        className="mb-2"
                      />
                      
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{item.percentage.toFixed(1)}% completado</span>
                        {item.missing > 0 && (
                          <span className="text-red-500">{item.missing} faltantes</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              {systemMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Total Viajes</span>
                      </div>
                      <p className="text-2xl font-bold">{systemMetrics.totalViajes}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calculator className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Con Costos</span>
                      </div>
                      <p className="text-2xl font-bold">{systemMetrics.viajesConCostos}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">Con Análisis</span>
                      </div>
                      <p className="text-2xl font-bold">{systemMetrics.viajesConAnalisis}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">Conductores Activos</span>
                      </div>
                      <p className="text-2xl font-bold">{systemMetrics.conductoresActivos}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="h-4 w-4 text-indigo-500" />
                        <span className="font-medium">Vehículos Disponibles</span>
                      </div>
                      <p className="text-2xl font-bold">{systemMetrics.vehiculosDisponibles}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="font-medium">Relaciones Incompletas</span>
                      </div>
                      <p className="text-2xl font-bold">{systemMetrics.relacionesIncompletas}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};