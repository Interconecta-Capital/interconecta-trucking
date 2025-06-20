import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Search, AlertTriangle, Users, Sparkles, CheckCircle2, CheckCircle, Globe } from 'lucide-react';
import { useSocios } from '@/hooks/useSocios';
import { useAuth } from '@/hooks/useAuth';
import { useAIValidation } from '@/hooks/ai/useAIValidation';
import { ViajeWizardData } from '../ViajeWizard';
import { SmartMercanciaInputMejorado } from '@/components/ai/SmartMercanciaInputMejorado';

interface ViajeWizardMisionProps {
  data: ViajeWizardData;
  updateData: (updates: Partial<ViajeWizardData>) => void;
}

export function ViajeWizardMision({ data, updateData }: ViajeWizardMisionProps) {
  const { socios, loading: loadingSocios } = useSocios();
  const { user } = useAuth();
  const [searchCliente, setSearchCliente] = useState('');
  const [alertasMercancia, setAlertasMercancia] = useState<string[]>([]);
  const [sugerenciasIA, setSugerenciasIA] = useState<any>(null);
  const [showComercioExterior, setShowComercioExterior] = useState(false);

  const {
    autoValidateField,
    getFieldValidation,
    isFieldValid
  } = useAIValidation({
    enabled: true,
    autoValidate: true,
    debounceMs: 800
  });

  // Filtrar socios por búsqueda
  const sociosFiltrados = socios.filter(socio =>
    socio.nombre_razon_social.toLowerCase().includes(searchCliente.toLowerCase()) ||
    socio.rfc.toLowerCase().includes(searchCliente.toLowerCase())
  );

  // Análisis inteligente de mercancía con IA
  useEffect(() => {
    if (data.descripcionMercancia) {
      const texto = data.descripcionMercancia.toLowerCase();
      const alertas: string[] = [];
      const nuevasSugerencias: any = {};

      // Detección de comercio exterior
      if (texto.includes('exportación') || texto.includes('importación') || texto.includes('export') || texto.includes('import')) {
        setShowComercioExterior(true);
        alertas.push('Operación de comercio exterior detectada - Se requieren datos adicionales');
      }

      // Detección de productos específicos y sugerencias de IA
      if (texto.includes('aguacate') || texto.includes('fruta')) {
        nuevasSugerencias.claveBienesTransp = '01010101';
        nuevasSugerencias.categoria = 'Frutas y Verduras';
        nuevasSugerencias.fraccionArancelaria = texto.includes('aguacate') ? '08044000' : null;
      } else if (texto.includes('cemento') || texto.includes('construcción')) {
        nuevasSugerencias.claveBienesTransp = '23010000';
        nuevasSugerencias.categoria = 'Materiales de Construcción';
      } else if (texto.includes('químico') || texto.includes('tóxico') || texto.includes('peligroso')) {
        alertas.push('Material peligroso detectado - Requiere documentación especial y permisos');
        nuevasSugerencias.claveBienesTransp = '28000000';
        nuevasSugerencias.categoria = 'Productos Químicos';
      }

      // Detección de especies protegidas
      if (texto.includes('jaguar') || texto.includes('fauna') || texto.includes('animal silvestre')) {
        alertas.push('Especie protegida detectada - Requiere permisos de SEMARNAT');
      }

      // Detección de peso/cantidad
      const pesoMatch = texto.match(/(\d+)\s*(ton|toneladas|kg|kilogramos)/i);
      if (pesoMatch) {
        const cantidad = parseInt(pesoMatch[1]);
        const unidad = pesoMatch[2].toLowerCase();
        const pesoKg = unidad.includes('ton') ? cantidad * 1000 : cantidad;
        nuevasSugerencias.pesoDetectado = pesoKg;
        nuevasSugerencias.cantidadDetectada = cantidad;
        nuevasSugerencias.unidadDetectada = unidad;
      }

      setAlertasMercancia(alertas);
      setSugerenciasIA(nuevasSugerencias);
    } else {
      setAlertasMercancia([]);
      setSugerenciasIA(null);
      setShowComercioExterior(false);
    }
  }, [data.descripcionMercancia]);

  // Validación automática del RFC del cliente
  useEffect(() => {
    if (data.cliente?.rfc) {
      autoValidateField('cliente_rfc', { rfc: data.cliente.rfc }, 'direccion');
    }
  }, [data.cliente?.rfc, autoValidateField]);

  const handleClienteSelect = (socio: any) => {
    updateData({ cliente: socio });
    setSearchCliente('');
  };

  const handleMercanciaChange = (descripcion: string) => {
    updateData({ descripcionMercancia: descripcion });
  };

  const handleMercanciaSelect = (mercanciaData: any) => {
    console.log('🤖 IA sugiere datos de mercancía:', mercanciaData);
    // Aquí se pueden aplicar automáticamente las sugerencias
  };

  const clienteValidation = getFieldValidation('cliente_rfc');
  const isClienteRfcValid = isFieldValid('cliente_rfc');

  return (
    <div className="space-y-6">
      {/* Sección Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Cliente / Receptor
            {data.cliente?.rfc && (
              <div className="ml-auto">
                {isClienteRfcValid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!data.cliente ? (
            <div className="space-y-3">
              <Label htmlFor="searchCliente">Buscar cliente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="searchCliente"
                  placeholder="Buscar por nombre o RFC..."
                  value={searchCliente}
                  onChange={(e) => setSearchCliente(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {searchCliente && (
                <div className="border rounded-lg max-h-40 overflow-y-auto">
                  {loadingSocios ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Buscando clientes...
                    </div>
                  ) : sociosFiltrados.length > 0 ? (
                    sociosFiltrados.map((socio) => (
                      <button
                        key={socio.id}
                        onClick={() => handleClienteSelect(socio)}
                        className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="font-medium">{socio.nombre_razon_social}</div>
                        <div className="text-sm text-muted-foreground">{socio.rfc}</div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No se encontraron clientes
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <div className="font-medium">{data.cliente.nombre_razon_social}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  {data.cliente.rfc}
                  {isClienteRfcValid && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateData({ cliente: undefined })}
              >
                Cambiar
              </Button>
            </div>
          )}

          {/* Validación del RFC */}
          {clienteValidation && !isClienteRfcValid && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                RFC inválido o no encontrado en el sistema
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Sección Tipo de Servicio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tipo de Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="tipoServicio">¿Qué tipo de operación es?</Label>
          <Select
            value={data.tipoServicio}
            onValueChange={(value: 'flete_pagado' | 'traslado_propio') => 
              updateData({ tipoServicio: value })
            }
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Seleccionar tipo de servicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flete_pagado">
                <div>
                  <div className="font-medium">Flete Pagado</div>
                  <div className="text-sm text-muted-foreground">
                    Cobras por el transporte (CFDI de Ingreso)
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="traslado_propio">
                <div>
                  <div className="font-medium">Traslado Propio</div>
                  <div className="text-sm text-muted-foreground">
                    Transporte de mercancía propia (CFDI de Traslado)
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Sección Mercancía con IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Descripción de la Mercancía
            <Sparkles className="h-4 w-4 text-purple-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label htmlFor="descripcionMercancia">¿Qué vas a transportar?</Label>
          
          <SmartMercanciaInputMejorado
            value={data.descripcionMercancia || ''}
            onChange={handleMercanciaChange}
            onMercanciaSelect={handleMercanciaSelect}
            placeholder="Ej: 'Transporte de 20 toneladas de aguacate hass para exportación'"
            field="descripcion_mercancia"
            showValidation={true}
            showClaveProducto={true}
          />

          {/* Sugerencias de IA */}
          {sugerenciasIA && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Sugerencias de IA</span>
              </div>
              
              {sugerenciasIA.claveBienesTransp && (
                <div className="mb-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    Clave BienesTransp: {sugerenciasIA.claveBienesTransp}
                  </Badge>
                  <span className="ml-2 text-sm text-blue-700">
                    {sugerenciasIA.categoria}
                  </span>
                </div>
              )}

              {sugerenciasIA.pesoDetectado && (
                <div className="mb-2">
                  <span className="text-sm text-blue-700">
                    Peso detectado: <strong>{sugerenciasIA.cantidadDetectada} {sugerenciasIA.unidadDetectada}</strong>
                    ({sugerenciasIA.pesoDetectado} kg)
                  </span>
                </div>
              )}

              {sugerenciasIA.fraccionArancelaria && (
                <div className="mb-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Fracción Arancelaria: {sugerenciasIA.fraccionArancelaria}
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Alertas de cumplimiento */}
          {alertasMercancia.length > 0 && (
            <div className="space-y-2">
              {alertasMercancia.map((alerta, index) => (
                <Alert key={index} variant="default" className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    {alerta}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Sección de Comercio Exterior */}
          {showComercioExterior && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-orange-800">
                  <Globe className="h-5 w-5" />
                  Cumplimiento Adicional - Comercio Exterior
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="fraccionArancelaria">Fracción Arancelaria</Label>
                  <Input
                    id="fraccionArancelaria"
                    placeholder="Ej: 08044000 (Aguacates)"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="regimenAduanero">Régimen Aduanero</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar régimen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A1">A1 - Exportación Definitiva</SelectItem>
                      <SelectItem value="A3">A3 - Importación Definitiva</SelectItem>
                      <SelectItem value="B1">B1 - Exportación Temporal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Resumen de la sección */}
      {data.cliente && data.tipoServicio && data.descripcionMercancia && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Misión Definida
              </Badge>
              {isClienteRfcValid && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  RFC Validado
                </Badge>
              )}
              {sugerenciasIA?.claveBienesTransp && (
                <Badge variant="outline" className="bg-purple-100 text-purple-800">
                  IA Activada
                </Badge>
              )}
            </div>
            <p className="text-sm text-green-800">
              Listo para establecer la ruta del viaje
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
