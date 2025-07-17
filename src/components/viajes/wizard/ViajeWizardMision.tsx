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
import { useAIValidation } from '@/hooks/useAIValidation';
import { ViajeWizardData } from '../ViajeWizard';
import { SmartMercanciaInputMejorado } from '@/components/ai/SmartMercanciaInputMejorado';
import { SATKeyDetector } from '@/components/ai/SATKeyDetector';
import { RFCValidator } from '@/utils/rfcValidation';

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
  const [rfcValidation, setRfcValidation] = useState<{ esValido: boolean; errores: string[]; tipo: string | null }>({ 
    esValido: false, 
    errores: [], 
    tipo: null 
  });

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

  // Validar RFC del cliente cuando cambia
  useEffect(() => {
    if (data.cliente?.rfc) {
      const validation = RFCValidator.validarRFC(data.cliente.rfc);
      setRfcValidation({
        esValido: validation.esValido,
        errores: validation.errores,
        tipo: validation.tipo || null
      });
      
      // Comunicar el estado de validación al componente padre
      updateData({ 
        clienteRfcValido: validation.esValido 
      });

      // Validación automática adicional con IA
      autoValidateField('cliente_rfc', { rfc: data.cliente.rfc }, 'direccion');
    } else {
      setRfcValidation({ esValido: false, errores: [], tipo: null });
      updateData({ clienteRfcValido: false });
    }
  }, [data.cliente?.rfc, autoValidateField, updateData]);

  // Análisis inteligente de mercancía con IA (simplificado)
  useEffect(() => {
    if (data.descripcionMercancia) {
      const texto = data.descripcionMercancia.toLowerCase();
      const alertas: string[] = [];

      // Solo detección de comercio exterior (lo demás lo maneja SATKeyDetector)
      if (texto.includes('exportación') || texto.includes('importación') || texto.includes('export') || texto.includes('import')) {
        setShowComercioExterior(true);
        alertas.push('Operación de comercio exterior detectada - Se requieren datos adicionales');
      }

      setAlertasMercancia(alertas);
    } else {
      setAlertasMercancia([]);
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

  const handleSATSuggestionApply = (suggestion: any) => {
    console.log('🔑 Aplicando sugerencia SAT:', suggestion);
    // Actualizar los datos del viaje con la información SAT
    updateData({
      claveBienesTransp: suggestion.claveBienesTransp,
      categoriaMercancia: suggestion.categoria,
      fraccionArancelaria: suggestion.fraccionArancelaria,
      descripcionMercancia: suggestion.descripcionMejorada || data.descripcionMercancia
    });
  };

  const clienteValidation = getFieldValidation('cliente_rfc');
  const isClienteRfcValid = isFieldValid('cliente_rfc');

  return (
    <div className="space-y-6">
      {/* Sección Cliente */}
      <Card data-onboarding="cliente-section">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Cliente / Receptor
            {data.cliente?.rfc && (
              <div className="ml-auto">
                {rfcValidation.esValido ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
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
                  data-onboarding="cliente-search"
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
            <div className="space-y-3">
              <div className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                rfcValidation.esValido 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`} data-onboarding="cliente-selected">
                <div>
                  <div className="font-medium">{data.cliente.nombre_razon_social}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    {data.cliente.rfc}
                    {rfcValidation.esValido ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {rfcValidation.tipo && rfcValidation.esValido && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs mt-1">
                      Persona {rfcValidation.tipo === 'fisica' ? 'Física' : 'Moral'}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateData({ cliente: undefined })}
                >
                  Cambiar
                </Button>
              </div>

              {/* Mostrar errores de validación del RFC */}
              {!rfcValidation.esValido && rfcValidation.errores.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>RFC inválido:</strong> {rfcValidation.errores[0]}
                    <br />
                    <span className="text-sm">No podrás continuar con un RFC inválido.</span>
                  </AlertDescription>
                </Alert>
              )}

              {/* Show validation errors from AI */}
              {clienteValidation && !isClienteRfcValid && clienteValidation.message && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Validación IA:</strong> {clienteValidation.message || 'Error de validación'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección Tipo de Servicio */}
      <Card data-onboarding="tipo-servicio-section">
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
            <SelectTrigger className="mt-2" data-onboarding="tipo-servicio-select">
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
      <Card data-onboarding="mercancia-section">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Descripción de la Mercancía
            <Sparkles className="h-4 w-4 text-purple-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label htmlFor="descripcionMercancia">¿Qué vas a transportar?</Label>
          
          <div data-onboarding="mercancia-input">
            <SmartMercanciaInputMejorado
              value={data.descripcionMercancia || ''}
              onChange={handleMercanciaChange}
              onMercanciaSelect={handleMercanciaSelect}
              placeholder="Ej: 'Transporte de 20 toneladas de aguacate hass para exportación'"
              field="descripcion_mercancia"
              showValidation={true}
              showClaveProducto={true}
            />
          </div>

          {/* Detector de Claves SAT con IA */}
          <SATKeyDetector 
            descripcionMercancia={data.descripcionMercancia || ''}
            onSuggestionApply={handleSATSuggestionApply}
            showApplyButton={true}
          />

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
        <Card className={`border-2 ${
          rfcValidation.esValido 
            ? 'bg-green-50 border-green-200' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              {rfcValidation.esValido ? (
                <>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Misión Definida
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    RFC Validado
                  </Badge>
                  {sugerenciasIA?.claveBienesTransp && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                      IA Activada
                    </Badge>
                  )}
                </>
              ) : (
                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                  RFC Requerido
                </Badge>
              )}
            </div>
            <p className={`text-sm ${
              rfcValidation.esValido 
                ? 'text-green-800' 
                : 'text-amber-800'
            }`}>
              {rfcValidation.esValido 
                ? 'Listo para establecer la ruta del viaje'
                : 'Verifica que el RFC del cliente sea válido para continuar'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
