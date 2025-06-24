
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
import { MultipleMercanciaManager } from './MultipleMercanciaManager';
import { RFCValidator } from '@/utils/rfcValidation';
import { Mercancia } from '@/types/mercancias';

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

  // Inicializar mercancías si no existe
  const mercancias = data.mercancias || [{
    id: 'mercancia-initial',
    descripcion: data.descripcionMercancia || '',
    claveProdServ: '',
    claveUnidad: '',
    cantidad: 1,
    pesoKg: 0,
    valorMercancia: 0,
    unidad: 'KGM',
    aiGenerated: false
  }];

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

  // Análisis inteligente de mercancía con IA
  useEffect(() => {
    const todasLasDescripciones = mercancias
      .map(m => m.descripcion)
      .filter(desc => desc && desc.trim())
      .join(' ');

    if (todasLasDescripciones) {
      const texto = todasLasDescripciones.toLowerCase();
      const alertas: string[] = [];
      const nuevasSugerencias: any = {};

      // Detección de comercio exterior
      if (texto.includes('exportación') || texto.includes('importación') || texto.includes('export') || texto.includes('import')) {
        setShowComercioExterior(true);
        alertas.push('Operación de comercio exterior detectada - Se requieren datos adicionales');
      }

      // Detección de materiales peligrosos
      if (texto.includes('químico') || texto.includes('tóxico') || texto.includes('peligroso')) {
        alertas.push('Material peligroso detectado - Requiere documentación especial y permisos');
      }

      // Detección de especies protegidas
      if (texto.includes('jaguar') || texto.includes('fauna') || texto.includes('animal silvestre')) {
        alertas.push('Especie protegida detectada - Requiere permisos de SEMARNAT');
      }

      setAlertasMercancia(alertas);
      setSugerenciasIA(nuevasSugerencias);
    } else {
      setAlertasMercancia([]);
      setSugerenciasIA(null);
      setShowComercioExterior(false);
    }
  }, [mercancias]);

  const handleClienteSelect = (socio: any) => {
    updateData({ cliente: socio });
    setSearchCliente('');
  };

  const handleMercanciasChange = (nuevasMercancias: Mercancia[]) => {
    updateData({ 
      mercancias: nuevasMercancias,
      // Mantener compatibilidad con descripcionMercancia para otros componentes
      descripcionMercancia: nuevasMercancias.length > 0 ? 
        nuevasMercancias.map(m => m.descripcion).filter(d => d).join(', ') : ''
    });
  };

  const clienteValidation = getFieldValidation('cliente_rfc');

  return (
    <div className="space-y-6">
      {/* Selección de Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!data.cliente ? (
            <div className="space-y-3">
              <Label htmlFor="buscar-cliente">Buscar Cliente *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="buscar-cliente"
                  value={searchCliente}
                  onChange={(e) => setSearchCliente(e.target.value)}
                  placeholder="Buscar por nombre o RFC..."
                  className="pl-10"
                />
              </div>
              
              {searchCliente && sociosFiltrados.length > 0 && (
                <div className="border rounded-lg bg-white shadow-sm max-h-48 overflow-y-auto">
                  {sociosFiltrados.slice(0, 5).map((socio) => (
                    <button
                      key={socio.id}
                      type="button"
                      onClick={() => handleClienteSelect(socio)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{socio.nombre_razon_social}</div>
                        <div className="text-sm text-gray-600">{socio.rfc}</div>
                      </div>
                      <Badge variant="outline">{socio.tipo_persona}</Badge>
                    </button>
                  ))}
                </div>
              )}
              
              {searchCliente && sociosFiltrados.length === 0 && (
                <p className="text-sm text-gray-500">No se encontraron clientes</p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium text-green-900">{data.cliente.nombre_razon_social}</div>
                <div className="text-sm text-green-700 flex items-center gap-2">
                  RFC: {data.cliente.rfc}
                  {rfcValidation.esValido ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                {rfcValidation.tipo && (
                  <Badge variant="outline" className="mt-1">
                    {rfcValidation.tipo}
                  </Badge>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updateData({ cliente: undefined })}
              >
                Cambiar
              </Button>
            </div>
          )}

          {/* Errores de validación del RFC */}
          {data.cliente && !rfcValidation.esValido && rfcValidation.errores.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <strong>RFC inválido:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {rfcValidation.errores.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Validación adicional con IA */}
          {clienteValidation && !clienteValidation.isValid && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{clienteValidation.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tipo de Servicio */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="tipo-servicio">Tipo de Servicio *</Label>
            <Select value={data.tipoServicio} onValueChange={(value: 'flete_pagado' | 'traslado_propio') => updateData({ tipoServicio: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo de servicio..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flete_pagado">Flete Pagado</SelectItem>
                <SelectItem value="traslado_propio">Traslado Propio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gestión de Múltiples Mercancías */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Mercancías a Transportar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MultipleMercanciaManager
            mercancias={mercancias}
            onMercanciasChange={handleMercanciasChange}
          />
        </CardContent>
      </Card>

      {/* Alertas de Mercancía */}
      {alertasMercancia.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {alertasMercancia.map((alerta, index) => (
                <div key={index} className="text-sm">• {alerta}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Sugerencias de IA */}
      {sugerenciasIA && Object.keys(sugerenciasIA).length > 0 && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            <div className="text-sm">
              <strong>Sugerencias automáticas detectadas:</strong>
              <ul className="list-disc list-inside mt-1">
                {sugerenciasIA.categoria && (
                  <li>Categoría: {sugerenciasIA.categoria}</li>
                )}
                {sugerenciasIA.pesoDetectado && (
                  <li>Peso detectado: {sugerenciasIA.pesoDetectado} kg</li>
                )}
                {sugerenciasIA.claveBienesTransp && (
                  <li>Clave SAT sugerida: {sugerenciasIA.claveBienesTransp}</li>
                )}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Comercio Exterior */}
      {showComercioExterior && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Globe className="h-5 w-5" />
              Comercio Exterior Detectado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700">
              Se ha detectado una operación de comercio exterior. Se requerirán datos adicionales 
              como pedimentos, fracciones arancelarias y documentación aduanal.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
