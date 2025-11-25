/**
 * Página de administración para poblar catálogos SAT
 * Permite ejecutar el poblado de códigos postales y otros catálogos
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
import { Database, MapPin, Building2, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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

const ESTADOS_DISPONIBLES = [
  { value: 'CDMX', label: 'Ciudad de México' },
  { value: 'Jalisco', label: 'Jalisco' },
  { value: 'Nuevo_Leon', label: 'Nuevo León' },
  { value: 'Estado_Mexico', label: 'Estado de México' },
  { value: 'Puebla', label: 'Puebla' },
  { value: 'Queretaro', label: 'Querétaro' },
  { value: 'Veracruz', label: 'Veracruz' },
  { value: 'Guanajuato', label: 'Guanajuato' },
  { value: 'Yucatan', label: 'Yucatán' },
  { value: 'Quintana_Roo', label: 'Quintana Roo' },
];

export default function PobladoCatalogos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>('');
  const [poblando, setPoblando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [resultado, setResultado] = useState<PobladoResultado | null>(null);

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

  // Poblar CPs comunes (los más usados)
  const poblarCPsComunes = async () => {
    setPoblando(true);
    setProgreso(10);
    setMensaje('Iniciando poblado de CPs comunes...');
    setResultado(null);

    try {
      const { data, error } = await supabase.functions.invoke('poblar-catalogos-cp', {
        body: { modo: 'incremental' }
      });

      if (error) throw error;

      setProgreso(100);
      setMensaje('Poblado completado');
      setResultado(data.resultados);
      
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

  // Poblar por estado
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

    try {
      // Obtener rangos de CP para el estado
      const rangos = getRangosEstado(estadoSeleccionado);
      let totalInsertados = 0;
      let totalOmitidos = 0;
      let totalErrores = 0;
      const detalles: string[] = [];

      for (let i = 0; i < rangos.length; i++) {
        const rango = rangos[i];
        setMensaje(`Poblando rango ${rango.inicio}-${rango.fin}...`);
        setProgreso(Math.round((i / rangos.length) * 100));

        const { data, error } = await supabase.functions.invoke('poblar-catalogos-cp', {
          body: {
            rangoInicio: rango.inicio,
            rangoFin: rango.fin,
            modo: 'incremental'
          }
        });

        if (error) {
          totalErrores++;
          detalles.push(`Error en rango ${rango.inicio}-${rango.fin}: ${error.message}`);
        } else if (data?.resultados) {
          totalInsertados += data.resultados.insertados;
          totalOmitidos += data.resultados.omitidos;
          totalErrores += data.resultados.errores;
          if (data.resultados.detalles) {
            detalles.push(...data.resultados.detalles);
          }
        }

        // Pausa entre rangos
        await new Promise(r => setTimeout(r, 1000));
      }

      setProgreso(100);
      setMensaje('Poblado completado');
      setResultado({
        insertados: totalInsertados,
        omitidos: totalOmitidos,
        errores: totalErrores,
        detalles: detalles.slice(0, 20), // Limitar detalles
      });

      toast({
        title: 'Poblado completado',
        description: `${totalInsertados} colonias insertadas para ${estadoSeleccionado}`,
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
            <p className="text-xs text-muted-foreground">colonias registradas</p>
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
      <Tabs defaultValue="comunes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comunes">CPs Comunes</TabsTrigger>
          <TabsTrigger value="estado">Por Estado</TabsTrigger>
          <TabsTrigger value="rfcs">RFCs Prueba</TabsTrigger>
        </TabsList>

        <TabsContent value="comunes">
          <Card>
            <CardHeader>
              <CardTitle>Poblar Códigos Postales Comunes</CardTitle>
              <CardDescription>
                Pobla los códigos postales más utilizados: CDMX, Guadalajara, Monterrey, 
                y otras zonas metropolitanas principales (~40 CPs)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={poblarCPsComunes}
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

        <TabsContent value="estado">
          <Card>
            <CardHeader>
              <CardTitle>Poblar por Estado</CardTitle>
              <CardDescription>
                Pobla todos los códigos postales de un estado específico
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
      {(poblando || resultado) && (
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
                <div className="flex gap-4">
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {resultado.insertados} insertados
                  </Badge>
                  <Badge variant="secondary">
                    {resultado.omitidos} omitidos
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
                    {resultado.detalles.map((d, i) => (
                      <div key={i}>{d}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Alerta informativa */}
      <Alert>
        <Database className="h-4 w-4" />
        <AlertTitle>Información</AlertTitle>
        <AlertDescription>
          Los catálogos de códigos postales son necesarios para la validación de correlación 
          CP ↔ Estado ↔ Municipio requerida por el SAT en Carta Porte. El poblado puede tardar 
          varios minutos dependiendo del estado seleccionado.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Helper para obtener rangos de CP por estado
function getRangosEstado(estado: string): { inicio: string; fin: string }[] {
  const rangos: Record<string, { inicio: string; fin: string }[]> = {
    'CDMX': [
      { inicio: '01000', fin: '01999' },
      { inicio: '02000', fin: '02999' },
      { inicio: '03000', fin: '03999' },
      { inicio: '04000', fin: '04999' },
      { inicio: '05000', fin: '05999' },
      { inicio: '06000', fin: '06999' },
      { inicio: '07000', fin: '07999' },
      { inicio: '08000', fin: '08999' },
      { inicio: '09000', fin: '09999' },
      { inicio: '10000', fin: '10999' },
      { inicio: '11000', fin: '11999' },
      { inicio: '14000', fin: '14999' },
      { inicio: '15000', fin: '16999' },
    ],
    'Jalisco': [
      { inicio: '44000', fin: '44999' },
      { inicio: '45000', fin: '45999' },
      { inicio: '46000', fin: '46999' },
    ],
    'Nuevo_Leon': [
      { inicio: '64000', fin: '64999' },
      { inicio: '66000', fin: '66999' },
    ],
    'Estado_Mexico': [
      { inicio: '50000', fin: '50999' },
      { inicio: '52000', fin: '52999' },
      { inicio: '53000', fin: '53999' },
      { inicio: '54000', fin: '54999' },
      { inicio: '55000', fin: '55999' },
      { inicio: '56000', fin: '56999' },
      { inicio: '57000', fin: '57999' },
    ],
    'Puebla': [
      { inicio: '72000', fin: '72999' },
    ],
    'Queretaro': [
      { inicio: '76000', fin: '76999' },
    ],
    'Veracruz': [
      { inicio: '91000', fin: '91999' },
      { inicio: '94000', fin: '94999' },
    ],
    'Guanajuato': [
      { inicio: '36000', fin: '36999' },
      { inicio: '37000', fin: '37999' },
      { inicio: '38000', fin: '38999' },
    ],
    'Yucatan': [
      { inicio: '97000', fin: '97999' },
    ],
    'Quintana_Roo': [
      { inicio: '77500', fin: '77599' },
    ],
  };

  return rangos[estado] || [];
}
