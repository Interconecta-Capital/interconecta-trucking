
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PlantillasSelector } from './plantillas/PlantillasSelector';
import { DocumentUploadDialog } from './mercancias/DocumentUploadDialog';
import { 
  FileText, 
  Upload, 
  Template, 
  Edit3,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Globe,
  MapPin
} from 'lucide-react';
import { RFCValidator } from '@/utils/rfcValidation';
import { CartaPorteData } from './CartaPorteForm';

interface ConfiguracionInicialProps {
  data: CartaPorteData;
  onChange: (data: Partial<CartaPorteData>) => void;
  onNext: () => void;
}

export function ConfiguracionInicial({ data, onChange, onNext }: ConfiguracionInicialProps) {
  const [tipoCreacion, setTipoCreacion] = useState<'plantilla' | 'carga' | 'manual'>(data.tipoCreacion || 'manual');
  const [showPlantillas, setShowPlantillas] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [validacionEmisor, setValidacionEmisor] = useState({ esValido: true, errores: [] });
  const [validacionReceptor, setValidacionReceptor] = useState({ esValido: true, errores: [] });

  useEffect(() => {
    onChange({ tipoCreacion });
  }, [tipoCreacion, onChange]);

  const handleRFCEmisorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rfc = e.target.value.toUpperCase();
    onChange({ rfcEmisor: rfc });
    
    if (rfc.length > 0) {
      const validation = RFCValidator.validarRFC(rfc);
      setValidacionEmisor(validation);
    } else {
      setValidacionEmisor({ esValido: true, errores: [] });
    }
  };

  const handleRFCReceptorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rfc = e.target.value.toUpperCase();
    onChange({ rfcReceptor: rfc });
    
    if (rfc.length > 0) {
      const validation = RFCValidator.validarRFC(rfc);
      setValidacionReceptor(validation);
    } else {
      setValidacionReceptor({ esValido: true, errores: [] });
    }
  };

  const handleTipoCfdiChange = (value: string) => {
    if (value === 'Ingreso' || value === 'Traslado') {
      onChange({ tipoCfdi: value });
    }
  };

  const handleCargarPlantilla = (plantilla: any) => {
    onChange({
      rfcEmisor: plantilla.rfc_emisor,
      nombreEmisor: plantilla.nombre_emisor,
      rfcReceptor: plantilla.rfc_receptor,
      nombreReceptor: plantilla.nombre_receptor,
      tipoCfdi: plantilla.tipo_cfdi,
      transporteInternacional: plantilla.transporte_internacional,
      registroIstmo: plantilla.registro_istmo,
    });
    setShowPlantillas(false);
    setTipoCreacion('manual');
  };

  const handleCargarDocumento = (datos: any) => {
    // Procesar datos del documento cargado
    if (datos.emisor) {
      onChange({
        rfcEmisor: datos.emisor.rfc,
        nombreEmisor: datos.emisor.nombre,
      });
    }
    if (datos.receptor) {
      onChange({
        rfcReceptor: datos.receptor.rfc,
        nombreReceptor: datos.receptor.nombre,
      });
    }
    setShowDocumentUpload(false);
    setTipoCreacion('manual');
  };

  const isFormValid = () => {
    return (
      data.rfcEmisor &&
      data.nombreEmisor &&
      data.rfcReceptor &&
      data.nombreReceptor &&
      data.tipoCfdi &&
      validacionEmisor.esValido &&
      validacionReceptor.esValido
    );
  };

  return (
    <div className="space-y-6">
      {/* Selector de Tipo de Creación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Flujo de Inicio Inteligente</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className={`cursor-pointer transition-all border-2 ${
                tipoCreacion === 'plantilla' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setTipoCreacion('plantilla');
                setShowPlantillas(true);
              }}
            >
              <CardContent className="p-4 text-center">
                <Template className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold">Usar Plantilla</h3>
                <p className="text-sm text-gray-600">Partir de una plantilla guardada</p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all border-2 ${
                tipoCreacion === 'carga' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setTipoCreacion('carga');
                setShowDocumentUpload(true);
              }}
            >
              <CardContent className="p-4 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold">Carga de Origen</h3>
                <p className="text-sm text-gray-600">Cargar desde PDF, XML o Excel</p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all border-2 ${
                tipoCreacion === 'manual' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setTipoCreacion('manual')}
            >
              <CardContent className="p-4 text-center">
                <Edit3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold">Creación Manual</h3>
                <p className="text-sm text-gray-600">Crear desde cero</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Configuración Principal */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de la Carta Porte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipo de CFDI */}
          <div className="space-y-2">
            <Label>Tipo de CFDI *</Label>
            <Select value={data.tipoCfdi} onValueChange={handleTipoCfdiChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar tipo de CFDI..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Traslado">Traslado</SelectItem>
                <SelectItem value="Ingreso">Ingreso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Datos del Emisor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Emisor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>RFC Emisor *</Label>
                <div className="relative">
                  <Input
                    value={data.rfcEmisor}
                    onChange={handleRFCEmisorChange}
                    placeholder="RFC del emisor"
                    className={
                      data.rfcEmisor && !validacionEmisor.esValido ? 'border-red-500' : 
                      data.rfcEmisor && validacionEmisor.esValido ? 'border-green-500' : ''
                    }
                  />
                  {data.rfcEmisor && validacionEmisor.esValido && (
                    <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                  )}
                </div>
                {data.rfcEmisor && !validacionEmisor.esValido && validacionEmisor.errores.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {validacionEmisor.errores[0]}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label>Nombre/Razón Social Emisor *</Label>
                <Input
                  value={data.nombreEmisor}
                  onChange={(e) => onChange({ nombreEmisor: e.target.value })}
                  placeholder="Nombre completo o razón social"
                />
              </div>
            </div>
          </div>

          {/* Datos del Receptor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Receptor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>RFC Receptor *</Label>
                <div className="relative">
                  <Input
                    value={data.rfcReceptor}
                    onChange={handleRFCReceptorChange}
                    placeholder="RFC del receptor"
                    className={
                      data.rfcReceptor && !validacionReceptor.esValido ? 'border-red-500' : 
                      data.rfcReceptor && validacionReceptor.esValido ? 'border-green-500' : ''
                    }
                  />
                  {data.rfcReceptor && validacionReceptor.esValido && (
                    <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                  )}
                </div>
                {data.rfcReceptor && !validacionReceptor.esValido && validacionReceptor.errores.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {validacionReceptor.errores[0]}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label>Nombre/Razón Social Receptor *</Label>
                <Input
                  value={data.nombreReceptor}
                  onChange={(e) => onChange({ nombreReceptor: e.target.value })}
                  placeholder="Nombre completo o razón social"
                />
              </div>
            </div>
          </div>

          {/* Opciones Especiales */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Opciones Especiales</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={data.transporteInternacional}
                onCheckedChange={(checked) => onChange({ transporteInternacional: checked })}
              />
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <Label>Transporte Internacional</Label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={data.registroIstmo}
                onCheckedChange={(checked) => onChange({ registroIstmo: checked })}
              />
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <Label>Registro Istmo</Label>
              </div>
            </div>

            {/* Campos adicionales para transporte internacional */}
            {data.transporteInternacional && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 border rounded-lg bg-blue-50">
                <div className="space-y-2">
                  <Label>Entrada/Salida Mercancía</Label>
                  <Select 
                    value={data.entrada_salida_merc || ''} 
                    onValueChange={(value) => onChange({ entrada_salida_merc: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entrada">Entrada</SelectItem>
                      <SelectItem value="Salida">Salida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>País Origen/Destino</Label>
                  <Input
                    value={data.pais_origen_destino || ''}
                    onChange={(e) => onChange({ pais_origen_destino: e.target.value })}
                    placeholder="Código del país"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Vía Entrada/Salida</Label>
                  <Input
                    value={data.via_entrada_salida || ''}
                    onChange={(e) => onChange({ via_entrada_salida: e.target.value })}
                    placeholder="Vía de entrada/salida"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={onNext} 
              disabled={!isFormValid()}
              className="flex items-center space-x-2"
            >
              <span>Continuar</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showPlantillas && (
        <PlantillasSelector
          onSelect={handleCargarPlantilla}
          onClose={() => setShowPlantillas(false)}
        />
      )}

      {showDocumentUpload && (
        <DocumentUploadDialog
          open={showDocumentUpload}
          onClose={() => setShowDocumentUpload(false)}
          onDataExtracted={handleCargarDocumento}
        />
      )}
    </div>
  );
}
