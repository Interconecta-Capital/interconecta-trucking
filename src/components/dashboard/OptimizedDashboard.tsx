
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOptimizedConductores, useOptimizedVehiculos, useOptimizedSocios } from '@/hooks/useOptimizedQueries';
import { useOptimizedCartaPorte } from '@/hooks/useOptimizedCartaPorte';
import { useOptimizedNotifications } from '@/hooks/useOptimizedNotifications';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { FileText, Car, Users, Bell, TrendingUp } from 'lucide-react';

export function OptimizedDashboard() {
  const { conductores } = useOptimizedConductores();
  const { vehiculos } = useOptimizedVehiculos();
  const { socios } = useOptimizedSocios();
  const { cartasPorte, totalCount } = useOptimizedCartaPorte(1, 5);
  const { notificacionesNoLeidas, notificacionesUrgentes } = useOptimizedNotifications();
  const { metrics } = usePerformanceMonitoring();

  const estadisticas = [
    {
      title: 'Conductores Activos',
      value: conductores.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Vehículos Disponibles',
      value: vehiculos.length,
      icon: Car,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Socios Comerciales',
      value: socios.length,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Cartas de Porte',
      value: totalCount,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Notificaciones',
      value: notificacionesNoLeidas,
      icon: Bell,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Indicador de rendimiento optimizado */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">
                Sistema Optimizado - Velocidad Mejorada
              </span>
            </div>
            <div className="text-sm text-green-700">
              Consultas: {metrics.queryTime.toFixed(0)}ms promedio
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {estadisticas.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`h-8 w-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.title === 'Notificaciones' && notificacionesUrgentes > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  {notificacionesUrgentes} urgentes
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cartas de porte recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Cartas de Porte Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cartasPorte.length > 0 ? (
            <div className="space-y-2">
              {cartasPorte.map((carta) => (
                <div key={carta.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{carta.folio || 'Sin folio'}</p>
                    <p className="text-sm text-muted-foreground">
                      {carta.nombre_emisor} → {carta.nombre_receptor}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      carta.status === 'timbrada' ? 'bg-green-100 text-green-800' :
                      carta.status === 'borrador' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {carta.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay cartas de porte recientes
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
