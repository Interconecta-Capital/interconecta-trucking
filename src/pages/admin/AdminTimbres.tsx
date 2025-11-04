import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, TrendingUp, Users, AlertCircle, DollarSign, Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSuperuser } from "@/hooks/useSuperuser";
import { Navigate } from "react-router-dom";

export default function AdminTimbres() {
  const { isSuperuser, isLoading: loadingSuperuser } = useSuperuser();

  // Métricas generales
  const { data: metricas } = useQuery({
    queryKey: ['admin-metricas-timbres'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_metricas_timbres')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: isSuperuser,
  });

  // Top usuarios por consumo
  const { data: topUsuarios } = useQuery({
    queryKey: ['admin-top-usuarios-consumo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_top_usuarios_consumo')
        .select('*')
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: isSuperuser,
  });

  // Proyección de consumo
  const { data: proyeccion } = useQuery({
    queryKey: ['admin-proyeccion-consumo'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('calcular_proyeccion_consumo');
      if (error) throw error;
      return data?.[0];
    },
    enabled: isSuperuser,
  });

  if (loadingSuperuser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isSuperuser) {
    return <Navigate to="/" replace />;
  }

  const costoTimbre = 1; // MXN por timbre del PAC
  const ingresosPorPlanEstimados = {
    'Plan Gratuito': 0,
    'Plan Operador': 349,
    'Plan Flota': 799,
    'Plan Business': 1499,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Timbres</h1>
          <p className="text-muted-foreground">Métricas y análisis de consumo</p>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.total_usuarios_activos || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metricas?.usuarios_gratuitos || 0} en plan gratuito
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.consumo_dia_actual || 0}</div>
            <p className="text-xs text-muted-foreground">
              Esta semana: {metricas?.consumo_semana_actual || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo del Mes</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.consumo_mes_actual || 0}</div>
            <p className="text-xs text-muted-foreground">
              Costo: ${((metricas?.consumo_mes_actual || 0) * costoTimbre).toFixed(2)} MXN
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Cerca de Agotar</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.usuarios_cerca_agotar || 0}</div>
            <p className="text-xs text-muted-foreground">
              Menos del 20% de timbres
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Proyección y Conversión */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Proyección de Consumo
            </CardTitle>
            <CardDescription>Estimado para fin de mes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Días transcurridos</span>
              <span className="font-semibold">{proyeccion?.dias_transcurridos || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Promedio diario</span>
              <span className="font-semibold">{Number(proyeccion?.promedio_diario || 0).toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estimado fin de mes</span>
              <span className="font-bold text-lg">{Number(proyeccion?.estimado_fin_mes || 0).toFixed(0)}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Costo proyectado</span>
                <span className="font-bold text-destructive">
                  ${(Number(proyeccion?.estimado_fin_mes || 0) * costoTimbre).toFixed(2)} MXN
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Tasa de Conversión
            </CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Usuarios gratuitos</span>
              <span className="font-semibold">{metricas?.usuarios_gratuitos || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Conversiones</span>
              <span className="font-semibold">{metricas?.conversiones_ultimo_mes || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tasa de conversión</span>
              <span className="font-bold text-lg">
                {metricas?.usuarios_gratuitos > 0 
                  ? ((metricas.conversiones_ultimo_mes / metricas.usuarios_gratuitos) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Usuarios por Consumo */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Usuarios por Consumo</CardTitle>
          <CardDescription>Usuarios con mayor uso de timbres este mes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Disponibles</TableHead>
                <TableHead>Límite</TableHead>
                <TableHead>Consumidos</TableHead>
                <TableHead>% Usado</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topUsuarios?.map((usuario) => (
                <TableRow key={usuario.user_id}>
                  <TableCell className="font-medium">{usuario.email}</TableCell>
                  <TableCell>{usuario.plan_nombre}</TableCell>
                  <TableCell>{usuario.timbres_mes_actual}</TableCell>
                  <TableCell>{usuario.limite_mensual}</TableCell>
                  <TableCell>{usuario.consumidos_este_mes}</TableCell>
                  <TableCell>
                    <Badge variant={
                      Number(usuario.porcentaje_usado) > 80 ? "destructive" :
                      Number(usuario.porcentaje_usado) > 50 ? "secondary" :
                      "default"
                    }>
                      {Number(usuario.porcentaje_usado).toFixed(0)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {Number(usuario.porcentaje_usado) > 80 ? (
                      <Badge variant="outline" className="text-yellow-500">
                        🎯 Upsell
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-500">
                        ✅ Normal
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
