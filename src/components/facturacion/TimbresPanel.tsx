import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, TrendingUp, FileText, Receipt, Calendar, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function TimbresPanel() {
  const { user } = useAuth();

  const { data: consumo, isLoading } = useQuery({
    queryKey: ['timbres-consumo', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          timbres_consumidos,
          cartas_porte_creadas
        `)
        .eq('id', user.id)
        .single();

      // Obtener plan actual
      const { data: suscripcion } = await supabase
        .from('suscripciones')
        .select(`
          plan_id,
          planes_suscripcion!inner(
            nombre,
            timbres_mensuales
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
        
      return {
        timbresConsumidos: profile?.timbres_consumidos || 0,
        cartasCreadas: profile?.cartas_porte_creadas || 0,
        limiteTimbres: suscripcion?.planes_suscripcion?.timbres_mensuales || 10,
        nombrePlan: suscripcion?.planes_suscripcion?.nombre || 'Plan Básico'
      };
    },
    enabled: !!user?.id,
    refetchInterval: 30000 // Refrescar cada 30 segundos
  });

  const { data: historial } = useQuery({
    queryKey: ['timbres-historial', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data } = await supabase
        .from('cartas_porte')
        .select('id, folio, status, fecha_timbrado, created_at')
        .eq('usuario_id', user.id)
        .eq('status', 'timbrado')
        .order('fecha_timbrado', { ascending: false })
        .limit(5);
        
      return data || [];
    },
    enabled: !!user?.id
  });

  if (isLoading || !consumo) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const porcentajeUso = consumo.limiteTimbres > 0 
    ? (consumo.timbresConsumidos / consumo.limiteTimbres) * 100 
    : 0;
  const timbresDisponibles = Math.max(0, consumo.limiteTimbres - consumo.timbresConsumidos);
  
  // Calcular el ángulo del círculo de progreso
  const circumference = 2 * Math.PI * 70; // radio = 70
  const strokeDashoffset = circumference - (porcentajeUso / 100) * circumference;

  const getColorClass = () => {
    if (porcentajeUso >= 90) return 'text-red-600';
    if (porcentajeUso >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = () => {
    if (porcentajeUso >= 90) return '#dc2626';
    if (porcentajeUso >= 70) return '#ca8a04';
    return '#16a34a';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Panel de Timbres Fiscales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfico circular de progreso */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="transform -rotate-90 w-48 h-48">
                  {/* Círculo de fondo */}
                  <circle 
                    cx="96" 
                    cy="96" 
                    r="70" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    fill="transparent" 
                    className="text-muted" 
                  />
                  {/* Círculo de progreso */}
                  <circle 
                    cx="96" 
                    cy="96" 
                    r="70" 
                    stroke={getProgressColor()}
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                {/* Texto central */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold ${getColorClass()}`}>
                    {porcentajeUso.toFixed(0)}%
                  </span>
                  <span className="text-sm text-muted-foreground mt-1">
                    Consumo
                  </span>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-lg font-medium">
                  {consumo.timbresConsumidos} / {consumo.limiteTimbres} timbres
                </p>
                <p className="text-sm text-muted-foreground">
                  {timbresDisponibles} disponibles
                </p>
                <Badge variant="outline" className="mt-2">
                  {consumo.nombrePlan}
                </Badge>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="space-y-4">
              <div className="bg-secondary/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cartas Porte Creadas</p>
                    <p className="text-3xl font-bold">{consumo.cartasCreadas}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="bg-secondary/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Timbres Usados</p>
                    <p className="text-3xl font-bold">{consumo.timbresConsumidos}</p>
                  </div>
                  <Receipt className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="bg-secondary/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tasa de Timbrado</p>
                    <p className="text-3xl font-bold">
                      {consumo.cartasCreadas > 0 
                        ? Math.round((consumo.timbresConsumidos / consumo.cartasCreadas) * 100) 
                        : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Alerta de límite */}
          {porcentajeUso >= 80 && (
            <Alert variant={porcentajeUso >= 90 ? "destructive" : "default"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {porcentajeUso >= 90 ? (
                  <>
                    <strong>¡Atención!</strong> Solo te quedan {timbresDisponibles} timbres. 
                    Considera hacer upgrade a un plan superior.
                  </>
                ) : (
                  <>
                    Estás cerca del límite de timbres. Te quedan {timbresDisponibles} disponibles.
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Botón de compra */}
          <div className="flex justify-center">
            <Button size="lg" className="w-full md:w-auto">
              <ExternalLink className="mr-2 h-4 w-4" />
              Hacer Upgrade de Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historial reciente */}
      {historial && historial.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Últimos Timbrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {historial.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors"
                >
                  <div>
                    <p className="font-medium">Carta Porte {item.folio || item.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.fecha_timbrado 
                        ? format(new Date(item.fecha_timbrado), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })
                        : format(new Date(item.created_at), "d 'de' MMMM, yyyy", { locale: es })
                      }
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Timbrado
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
