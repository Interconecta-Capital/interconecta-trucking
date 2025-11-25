/**
 * Página de administración para poblar catálogos SAT
 * @version 2.0.0 - Optimizado con validación post-poblado
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Database, MapPin, Building2, RefreshCw, CheckCircle, AlertCircle, Loader2, Shield, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface PobladoResultado {
  insertados: number;
  omitidos: number;
  errores: number;
  detalles: string[];
}

interface EstadisticasCatalogos {
  codigos_postales: number;
  municipios: number;
  colonias: number;
  estados: number;
  localidades: number;
}

interface ValidacionPostPoblado {
  totalCPs: number;
  totalMunicipios: number;
  totalEstados: number;
  umbralMinimo: number;
  cumpleUmbral: boolean;
  mensaje: string;
}

const ESTADOS_DISPONIBLES = [
  { value: 'CDMX', label: 'Ciudad de México', prioridad: 1 },
  { value: 'Jalisco', label: 'Jalisco', prioridad: 2 },
  { value: 'Nuevo_Leon', label: 'Nuevo León', prioridad: 3 },
  { value: 'Estado_Mexico', label: 'Estado de México', prioridad: 4 },
  { value: 'Puebla', label: 'Puebla', prioridad: 5 },
  { value: 'Queretaro', label: 'Querétaro', prioridad: 6 },
  { value: 'Veracruz', label: 'Veracruz', prioridad: 7 },
  { value: 'Guanajuato', label: 'Guanajuato', prioridad: 8 },
  { value: 'Yucatan', label: 'Yucatán', prioridad: 9 },
  { value: 'Quintana_Roo', label: 'Quintana Roo', prioridad: 10 },
];

const UMBRAL_PRODUCCION = 5000;

export default function PobladoCatalogos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>('');
  const [poblando, setPoblando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [resultado, setResultado] = useState<PobladoResultado | null>(null);
  const [validacionPost, setValidacionPost] = useState<ValidacionPostPoblado | null>(null);

  // Consultar estadísticas actuales
  const { data: estadisticas, isLoading: loadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['estadisticas-catalogos'],
    queryFn: async (): Promise<EstadisticasCatalogos> => {
      const [cpMexico, municipios, colonias, estados, localidades] = await Promise.all([
        supabase.from('codigos_postales_mexico').select('*', { count: 'exact', head: true }),
        supabase.from('cat_municipio').select('*', { count: 'exact', head: true }),
        supabase.from('cat_colonia').select('*', { count: 'exact', head: true }),
        supabase.from('cat_estado').select('*', { count: 'exact', head: true }),
        supabase.from('cat_localidad').select('*', { count: 'exact', head: true }),
      ]);

      return {
        codigos_postales: cpMexico.count || 0,
        municipios: municipios.count || 0,
        colonias: colonias.count || 0,
        estados: estados.count || 0,
        localidades: localidades.count || 0,
      };
    },
    staleTime: 30000,
  });

  const cumpleUmbral = (estadisticas?.codigos_postales || 0) >= UMBRAL_PRODUCCION;

  // Poblar CPs prioritarios (optimizado v2)
  const poblarCPsPrioritarios = async () => {
    setPoblando(true);
    setProgreso(10);
    setMensaje('Iniciando poblado de CPs prioritarios...');
    setResultado(null);
    setValidacionPost(null);

    try {
      const { data, error } = await supabase.functions.invoke('poblar-catalogos-cp', {
        body: { 
          modo: 'incremental',
          validarPostPoblado: true
        }
      });

      if (error) throw error;

      setProgreso(100);
      setMensaje('Poblado completado');
      setResultado(data.resultados);
      setValidacionPost(data.validacionPostPoblado);
      
      toast({
        title: 'Poblado completado',
        description: `${data.resultados.insertados} colonias insertadas`,
      });

      refetchStats();
    } catch (error: any) {
      toast({
        title: 'Error en poblado',
        description: error.message,
        variant: 'destructive',
      });
      setMensaje(`Error: ${error.message}`);
    } finally {
      setPoblando(false);
    }
  };

  // Poblar por estado (optimizado v2)
  const poblarPorEstado = async () => {
    if (!estadoSeleccionado) {
      toast({
        title: 'Selecciona un estado',
        variant: 'destructive',
      });
      return;
    }

    setPoblando(true);
    setProgreso(0);
    setMensaje(`Poblando catálogos de ${estadoSeleccionado}...`);
    setResultado(null);
    setValidacionPost(null);

    try {
      setProgreso(30);
      
      const { data, error } = await supabase.functions.invoke('poblar-catalogos-cp', {
        body: {
          estadoClave: estadoSeleccionado,
          modo: 'incremental',
          validarPostPoblado: true
        }
      });

      if (error) throw error;

      setProgreso(100);
      setMensaje('Poblado completado');
      setResultado(data.resultados);
      setValidacionPost(data.validacionPostPoblado);

      toast({
        title: 'Poblado completado',
        description: `${data.resultados.insertados} colonias insertadas para ${estadoSeleccionado}`,
      });

      refetchStats();
    } catch (error: any) {
      toast({
        title: 'Error en poblado',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setPoblando(false);
    }
  };

  // Poblar RFCs de prueba
  const poblarRFCsPrueba = async () => {
    setPoblando(true);
    setMensaje('Poblando RFCs de prueba SAT...');

    try {
      const { data, error } = await supabase.functions.invoke('seed-rfc-pruebas', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: 'RFCs de prueba poblados',
        description: `${data.insertados || 0} RFCs insertados`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setPoblando(false);
      setMensaje('');
    }
  };

  // Poblar múltiples estados en secuencia
  const poblarEstadosPrioritarios = async () => {
    setPoblando(true);
    setProgreso(0);
    setMensaje('Iniciando poblado de estados prioritarios...');
    setResultado(null);

    const estadosPrioritarios = ['CDMX', 'Jalisco', 'Nuevo_Leon', 'Estado_Mexico'];
    let totalInsertados = 0;
    let totalOmitidos = 0;
    let totalErrores = 0;

    try {
      for (let i = 0; i < estadosPrioritarios.length; i++) {
        const estado = estadosPrioritarios[i];
        setMensaje(`Poblando ${estado} (${i + 1}/${estadosPrioritarios.length})...`);
        setProgreso(Math.round((i / estadosPrioritarios.length) * 100));

        const { data, error } = await supabase.functions.invoke('poblar-catalogos-cp', {
          body: {
            estadoClave: estado,
            modo: 'incremental',
            validarPostPoblado: i === estadosPrioritarios.length - 1
          }
        });

        if (!error && data?.resultados) {
          totalInsertados += data.resultados.insertados;
          totalOmitidos += data.resultados.omitidos;
          totalErrores += data.resultados.errores;
          
          if (data.validacionPostPoblado) {
            setValidacionPost(data.validacionPostPoblado);
          }
        }

        // Pausa entre estados para no sobrecargar
        await new Promise(r => setTimeout(r, 2000));
      }

      setProgreso(100);
      setMensaje('Poblado de estados prioritarios completado');
      setResultado({
        insertados: totalInsertados,
        omitidos: totalOmitidos,
        errores: totalErrores,
        detalles: [`Procesados: ${estadosPrioritarios.join(', ')}`]
      });

      toast({
        title: 'Poblado masivo completado',
        description: `${totalInsertados} colonias insertadas de ${estadosPrioritarios.length} estados`,
      });

      refetchStats();
    } catch (error: any) {
      toast({
        title: 'Error en poblado masivo',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setPoblando(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Poblado de Catálogos SAT</h1>
          <p className="text-muted-foreground">
            Administra los catálogos necesarios para validación de Carta Porte
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refetchStats()}
          disabled={loadingStats}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loadingStats ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Alerta de umbral de producción */}
      {estadisticas && (
        <Alert variant={cumpleUmbral ? 'default' : 'destructive'}>
          {cumpleUmbral ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{cumpleUmbral ? 'Listo para producción' : 'Se requieren más datos'}</AlertTitle>
          <AlertDescription>
            {cumpleUmbral 
              ? `✅ Tienes ${estadisticas.codigos_postales.toLocaleString()} CPs. Umbral mínimo: ${UMBRAL_PRODUCCION.toLocaleString()}`
              : `⚠️ Se requieren mínimo ${UMBRAL_PRODUCCION.toLocaleString()} códigos postales para producción. Actual: ${estadisticas.codigos_postales.toLocaleString()}`
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas actuales */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Códigos Postales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : estadisticas?.codigos_postales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              de {UMBRAL_PRODUCCION.toLocaleString()} requeridos
            </p>
            {estadisticas && (
              <Progress 
                value={Math.min((estadisticas.codigos_postales / UMBRAL_PRODUCCION) * 100, 100)} 
                className="mt-2 h-1"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Estados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : estadisticas?.estados}
            </div>
            <p className="text-xs text-muted-foreground">de 32</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Municipios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : estadisticas?.municipios.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">de ~2,456</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Colonias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : estadisticas?.colonias.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">cat_colonia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Localidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : estadisticas?.localidades.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">cat_localidad</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de poblado */}
      <Tabs defaultValue="masivo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="masivo">Poblado Masivo</TabsTrigger>
          <TabsTrigger value="estado">Por Estado</TabsTrigger>
          <TabsTrigger value="comunes">CPs Comunes</TabsTrigger>
          <TabsTrigger value="rfcs">RFCs Prueba</TabsTrigger>
        </TabsList>

        <TabsContent value="masivo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Poblado Masivo de Estados Prioritarios
              </CardTitle>
              <CardDescription>
                Pobla automáticamente CDMX, Jalisco, Nuevo León y Estado de México.
                Ideal para alcanzar el umbral de producción rápidamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={poblarEstadosPrioritarios}
                disabled={poblando}
                className="w-full"
                size="lg"
              >
                {poblando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Poblando...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Poblar 4 Estados Prioritarios (~800 CPs)
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Este proceso puede tardar varios minutos
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estado">
          <Card>
            <CardHeader>
              <CardTitle>Poblar por Estado</CardTitle>
              <CardDescription>
                Pobla los códigos postales prioritarios de un estado específico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Select value={estadoSeleccionado} onValueChange={setEstadoSeleccionado}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_DISPONIBLES.map(estado => (
                      <SelectItem key={estado.value} value={estado.value}>
                        {estado.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={poblarPorEstado}
                  disabled={poblando || !estadoSeleccionado}
                >
                  {poblando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Poblando...
                    </>
                  ) : (
                    'Poblar Estado'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comunes">
          <Card>
            <CardHeader>
              <CardTitle>Poblar Códigos Postales Comunes</CardTitle>
              <CardDescription>
                Pobla los códigos postales más utilizados (~110 CPs de zonas metropolitanas)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={poblarCPsPrioritarios}
                disabled={poblando}
                className="w-full"
              >
                {poblando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Poblando...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Poblar CPs Comunes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rfcs">
          <Card>
            <CardHeader>
              <CardTitle>Poblar RFCs de Prueba SAT</CardTitle>
              <CardDescription>
                Inserta los RFCs oficiales de prueba del SAT (EKU9003173C9, etc.)
                necesarios para el ambiente sandbox
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={poblarRFCsPrueba}
                disabled={poblando}
              >
                {poblando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Poblando...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Poblar RFCs de Prueba
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Progreso y resultados */}
      {(poblando || resultado || validacionPost) && (
        <Card>
          <CardHeader>
            <CardTitle>Progreso del Poblado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {poblando && (
              <>
                <Progress value={progreso} />
                <p className="text-sm text-muted-foreground">{mensaje}</p>
              </>
            )}

            {resultado && (
              <div className="space-y-4">
                <div className="flex gap-4 flex-wrap">
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {resultado.insertados.toLocaleString()} insertados
                  </Badge>
                  <Badge variant="secondary">
                    {resultado.omitidos.toLocaleString()} omitidos
                  </Badge>
                  {resultado.errores > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {resultado.errores} errores
                    </Badge>
                  )}
                </div>

                {resultado.detalles.length > 0 && (
                  <div className="max-h-40 overflow-y-auto text-sm text-muted-foreground bg-muted p-2 rounded">
                    {resultado.detalles.slice(0, 20).map((d, i) => (
                      <div key={i}>{d}</div>
                    ))}
                    {resultado.detalles.length > 20 && (
                      <div className="text-xs mt-2">... y {resultado.detalles.length - 20} más</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {validacionPost && (
              <Alert variant={validacionPost.cumpleUmbral ? 'default' : 'destructive'}>
                <Shield className="h-4 w-4" />
                <AlertTitle>Validación Post-Poblado</AlertTitle>
                <AlertDescription>
                  {validacionPost.mensaje}
                  <div className="mt-2 text-xs">
                    CPs: {validacionPost.totalCPs.toLocaleString()} | 
                    Municipios: {validacionPost.totalMunicipios.toLocaleString()} | 
                    Estados: {validacionPost.totalEstados}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Información */}
      <Alert>
        <Database className="h-4 w-4" />
        <AlertTitle>Información</AlertTitle>
        <AlertDescription>
          Los catálogos de códigos postales son necesarios para la validación de correlación 
          CP ↔ Estado ↔ Municipio requerida por el SAT en Carta Porte. 
          Se requieren mínimo <strong>{UMBRAL_PRODUCCION.toLocaleString()} códigos postales</strong> para producción.
        </AlertDescription>
      </Alert>
    </div>
  );
}
