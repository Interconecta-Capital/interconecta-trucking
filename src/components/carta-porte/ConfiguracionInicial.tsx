
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { PlantillasSelector } from './plantillas/PlantillasSelector';
import { usePlantillas, PlantillaData } from '@/hooks/usePlantillas';
import { 
  Upload, 
  FileText, 
  Edit, 
  Search,
  Building2,
  AlertTriangle,
  Globe,
  MapPin,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { CartaPorteData } from './CartaPorteForm';
import { toast } from 'sonner';

interface ConfiguracionInicialProps {
  data: CartaPorteData;
  onChange: (data: any) => void;
  onNext: () => void;
}

export function ConfiguracionInicial({ data, onChange, onNext }: ConfiguracionInicialProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPlantillasSelector, setShowPlantillasSelector] = useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<PlantillaData | null>(null);
  
  const { cargarPlantilla, getSugerenciasPlantillas } = usePlantillas();

  const handleTipoCfdiChange = (tipo: 'Ingreso' | 'Traslado') => {
    const updates: Partial<CartaPorteData> = { tipoCfdi: tipo };
    
    // Si es Traslado, el RFC Receptor debe ser igual al Emisor
    if (tipo === 'Traslado' && data.rfcEmisor) {
      updates.rfcReceptor = data.rfcEmisor;
      updates.nombreReceptor = data.nombreEmisor;
    }
    
    onChange(updates);
  };

  const handleRfcEmisorChange = (rfc: string) => {
    const updates: Partial<CartaPorteData> = { rfcEmisor: rfc };
    
    // Si es Traslado, sincronizar receptor
    if (data.tipoCfdi === 'Traslado') {
      updates.rfcReceptor = rfc;
    }
    
    onChange(updates);
  };

  const handleSelectPlantilla = async (plantilla: PlantillaData) => {
    try {
      const templateData = await cargarPlantilla(plantilla.id);
      
      // Cargar todos los datos de la plantilla
      onChange(templateData);
      setPlantillaSeleccionada(plantilla);
      setShowPlantillasSelector(false);
      
      toast.success(`Plantilla "${plantilla.nombre}" cargada exitosamente`);
    } catch (error) {
      toast.error('Error al cargar la plantilla');
      console.error('Error:', error);
    }
  };

  const handleTipoCreacionChange = (tipo: 'plantilla' | 'carga' | 'manual') => {
    onChange({ tipoCreacion: tipo });
    
    if (tipo === 'plantilla') {
      setShowPlantillasSelector(true);
    }
  };

  const isFormValid = () => {
    return data.rfcEmisor && data.rfcReceptor && data.nombreEmisor && data.nombreReceptor;
  };

  const sugerencias = getSugerenciasPlantillas();

  // Si se está mostrando el selector de plantillas
  if (showPlantillasSelector) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowPlantillasSelector(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <span className="text-sm text-muted-foreground">Seleccionar Plantilla</span>
        </div>
        
        <PlantillasSelector
          onSelectPlantilla={handleSelectPlantilla}
          onClose={() => setShowPlantillasSelector(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mostrar plantilla seleccionada si existe */}
      {plantillaSeleccionada && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    Plantilla "{plantillaSeleccionada.nombre}" cargada
                  </p>
                  <p className="text-sm text-green-600">
                    Los datos han sido pre-llenados. Puedes modificarlos si es necesario.
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setPlantillaSeleccionada(null);
                  setShowPlantillasSelector(true);
                }}
              >
                Cambiar Plantilla
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tipo de Creación */}
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
              className={`cursor-pointer border-2 transition-colors ${
                data.tipoCreacion === 'plantilla' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => handleTipoCreacionChange('plantilla')}
            >
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold">Desde Plantilla</h3>
                <p className="text-sm text-muted-foreground">
                  Usar viaje previo o plantilla predefinida
                </p>
                {sugerencias.length > 0 && (
                  <Badge variant="secondary" className="mt-2">
                    {sugerencias.length} sugerencias
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer border-2 transition-colors ${
                data.tipoCreacion === 'carga' ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
              onClick={() => handleTipoCreacionChange('carga')}
            >
              <CardContent className="p-4 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold">Carga de Origen</h3>
                <p className="text-sm text-muted-foreground">
                  Importar desde PDF/XML/Excel
                </p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer border-2 transition-colors ${
                data.tipoCreacion === 'manual' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
              }`}
              onClick={() => handleTipoCreacionChange('manual')}
            >
              <CardContent className="p-4 text-center">
                <Edit className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <h3 className="font-semibold">Creación Manual</h3>
                <p className="text-sm text-muted-foreground">
                  Proceso guiado paso a paso
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Datos Básicos del CFDI */}
      <Card>
        <CardHeader>
          <CardTitle>Datos Básicos del CFDI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoCfdi">Tipo de CFDI *</Label>
              <Select 
                value={data.tipoCfdi} 
                onValueChange={(value: 'Ingreso' | 'Traslado') => handleTipoCfdiChange(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ingreso">Ingreso</SelectItem>
                  <SelectItem value="Traslado">Traslado</SelectItem>
                </SelectContent>
              </Select>
              {data.tipoCfdi === 'Traslado' && (
                <div className="flex items-center space-x-2 text-sm text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>En Traslado, el RFC Receptor debe ser igual al Emisor</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Datos del Emisor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Datos del Emisor</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rfcEmisor">RFC Emisor *</Label>
                <div className="relative">
                  <Input
                    id="rfcEmisor"
                    value={data.rfcEmisor}
                    onChange={(e) => handleRfcEmisorChange(e.target.value.toUpperCase())}
                    placeholder="ABC123456789"
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nombreEmisor">Nombre/Razón Social Emisor *</Label>
                <Input
                  id="nombreEmisor"
                  value={data.nombreEmisor}
                  onChange={(e) => onChange({ nombreEmisor: e.target.value })}
                  placeholder="Nombre completo o razón social"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Datos del Receptor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Datos del Receptor</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rfcReceptor">RFC Receptor *</Label>
                <div className="relative">
                  <Input
                    id="rfcReceptor"
                    value={data.rfcReceptor}
                    onChange={(e) => onChange({ rfcReceptor: e.target.value.toUpperCase() })}
                    placeholder="XYZ987654321"
                    className="pr-10"
                    disabled={data.tipoCfdi === 'Traslado'}
                  />
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nombreReceptor">Nombre/Razón Social Receptor *</Label>
                <Input
                  id="nombreReceptor"
                  value={data.nombreReceptor}
                  onChange={(e) => onChange({ nombreReceptor: e.target.value })}
                  placeholder="Nombre completo o razón social"
                  disabled={data.tipoCfdi === 'Traslado'}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuraciones Especiales */}
      <Card>
        <CardHeader>
          <CardTitle>Configuraciones Especiales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <Label htmlFor="transporte-internacional">Transporte Internacional</Label>
            </div>
            <Switch
              id="transporte-internacional"
              checked={data.transporteInternacional}
              onCheckedChange={(checked) => onChange({ transporteInternacional: checked })}
            />
          </div>

          {data.transporteInternacional && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Entrada/Salida Mercancía</Label>
                    <Select>
                      <SelectTrigger>
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
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar país..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USA">Estados Unidos</SelectItem>
                        <SelectItem value="CAN">Canadá</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Vía Entrada/Salida</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar vía..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="01">Terrestre</SelectItem>
                        <SelectItem value="02">Aéreo</SelectItem>
                        <SelectItem value="03">Marítimo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <Label htmlFor="registro-istmo">Registro ISTMO</Label>
            </div>
            <Switch
              id="registro-istmo"
              checked={data.registroIstmo}
              onCheckedChange={(checked) => onChange({ registroIstmo: checked })}
            />
          </div>

          {data.registroIstmo && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ubicación Polo Origen</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="01">Salina Cruz</SelectItem>
                        <SelectItem value="02">Coatzacoalcos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Ubicación Polo Destino</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="01">Salina Cruz</SelectItem>
                        <SelectItem value="02">Coatzacoalcos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Botones de navegación */}
      <div className="flex justify-end space-x-4">
        <Button 
          onClick={onNext} 
          disabled={!isFormValid()}
          className="px-8"
        >
          Continuar a Ubicaciones
        </Button>
      </div>
    </div>
  );
}
