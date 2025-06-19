import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';
import { UbicacionFrecuente } from '@/types/ubicaciones';
import { FormularioDomicilioUnificado, DomicilioUnificado } from '@/components/common/FormularioDomicilioUnificado';
import { useCodigoPostalMexicanoNacional } from '@/hooks/useCodigoPostalMexicanoNacional';

// Import the new components
import { UbicacionBasicFields } from './UbicacionBasicFields';
import { UbicacionAddressSearch } from './UbicacionAddressSearch';
import { UbicacionDateTimeField } from './UbicacionDateTimeField';
import { UbicacionFrequentLocations } from './UbicacionFrequentLocations';
import { UbicacionFormActions } from './UbicacionFormActions';

interface UbicacionFormOptimizadoProps {
  ubicacion?: any;
  onSave: (ubicacion: any) => void;
  onCancel: () => void;
  onSaveToFavorites?: (ubicacion: Omit<UbicacionFrecuente, 'id' | 'usoCount'>) => void;
  generarId: (tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => string;
  ubicacionesFrecuentes?: UbicacionFrecuente[];
}

export function UbicacionFormOptimizado({ 
  ubicacion, 
  onSave, 
  onCancel, 
  onSaveToFavorites,
  generarId,
  ubicacionesFrecuentes = []
}: UbicacionFormOptimizadoProps) {
  const [formData, setFormData] = React.useState({
    idUbicacion: ubicacion?.idUbicacion || '',
    tipoUbicacion: ubicacion?.tipoUbicacion || '',
    rfcRemitenteDestinatario: ubicacion?.rfcRemitenteDestinatario || '',
    nombreRemitenteDestinatario: ubicacion?.nombreRemitenteDestinatario || '',
    fechaHoraSalidaLlegada: ubicacion?.fechaHoraSalidaLlegada || '',
    distanciaRecorrida: ubicacion?.distanciaRecorrida || 0,
    domicilio: ubicacion?.domicilio || {
      pais: 'México',
      codigoPostal: '',
      estado: '',
      municipio: '',
      localidad: '',
      colonia: '',
      calle: '',
      numExterior: '',
      numInterior: '',
      referencia: ''
    }
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [searchAddress, setSearchAddress] = React.useState('');
  
  const { 
    direccionInfo, 
    consultarCodigoPostal,
    loading: loadingCP 
  } = useCodigoPostalMexicanoNacional();

  const handleTipoChange = (tipo: string) => {
    if (!tipo || tipo === '') {
      setFormData(prev => ({
        ...prev,
        tipoUbicacion: '',
        idUbicacion: ''
      }));
      return;
    }

    const newId = generarId(tipo as 'Origen' | 'Destino' | 'Paso Intermedio');
    setFormData(prev => ({
      ...prev,
      tipoUbicacion: tipo,
      idUbicacion: newId
    }));
  };

  const handleMapboxAddressSelect = (addressData: any) => {
    console.log('Dirección seleccionada desde Mapbox:', addressData);
    
    const components = addressData.place_name ? addressData.place_name.split(', ') : [];
    let calle = '';
    let colonia = '';
    let municipio = '';
    let estado = '';
    let codigoPostal = '';

    if (components.length >= 4) {
      calle = components[0] || '';
      colonia = components[1] || '';
      municipio = components[2] || '';
      
      const estadoCP = components[components.length - 2] || '';
      const cpMatch = estadoCP.match(/(\d{5})/);
      if (cpMatch) {
        codigoPostal = cpMatch[1];
        estado = estadoCP.replace(cpMatch[0], '').trim();
      } else {
        estado = estadoCP;
      }
    }

    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        calle: calle,
        colonia: colonia,
        municipio: municipio,
        estado: estado,
        codigoPostal: codigoPostal
      }
    }));

    setSearchAddress('');
  };

  const handleDomicilioChange = (campo: keyof DomicilioUnificado, valor: string) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        [campo]: valor
      }
    }));

    if (campo === 'codigoPostal' && valor.length === 5) {
      consultarCodigoPostal(valor);
    }
  };

  React.useEffect(() => {
    if (direccionInfo && direccionInfo.colonias.length > 0) {
      setFormData(prev => ({
        ...prev,
        domicilio: {
          ...prev.domicilio,
          estado: direccionInfo.estado,
          municipio: direccionInfo.municipio,
          localidad: direccionInfo.localidad || direccionInfo.municipio,
          colonia: prev.domicilio.colonia || direccionInfo.colonias[0].nombre
        }
      }));
    }
  }, [direccionInfo]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tipoUbicacion?.trim()) {
      newErrors.tipoUbicacion = 'El tipo de ubicación es requerido';
    }

    if (!formData.rfcRemitenteDestinatario?.trim()) {
      newErrors.rfc = 'El RFC es requerido';
    }

    if (!formData.nombreRemitenteDestinatario?.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.domicilio.codigoPostal?.trim()) {
      newErrors.codigoPostal = 'El código postal es requerido';
    }

    if (!formData.domicilio.calle?.trim()) {
      newErrors.calle = 'La calle es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const cargarUbicacionFrecuente = (ubicacionFrecuente: UbicacionFrecuente) => {
    setFormData(prev => ({
      ...prev,
      rfcRemitenteDestinatario: ubicacionFrecuente.rfcAsociado,
      nombreRemitenteDestinatario: ubicacionFrecuente.nombreUbicacion,
      domicilio: ubicacionFrecuente.domicilio
    }));
  };

  return (
    <Card className="w-full border-gray-100 bg-white shadow-sm">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <MapPin className="h-5 w-5 text-gray-700" />
          {ubicacion ? 'Editar Ubicación' : 'Nueva Ubicación'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <UbicacionFrequentLocations
          ubicacionesFrecuentes={ubicacionesFrecuentes}
          onCargarUbicacionFrecuente={cargarUbicacionFrecuente}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <UbicacionBasicFields
            tipoUbicacion={formData.tipoUbicacion}
            idUbicacion={formData.idUbicacion}
            rfcRemitenteDestinatario={formData.rfcRemitenteDestinatario}
            nombreRemitenteDestinatario={formData.nombreRemitenteDestinatario}
            onTipoChange={handleTipoChange}
            onRFCChange={(e) => setFormData(prev => ({ ...prev, rfcRemitenteDestinatario: e.target.value.toUpperCase() }))}
            onNombreChange={(e) => setFormData(prev => ({ ...prev, nombreRemitenteDestinatario: e.target.value }))}
            errors={errors}
          />

          <UbicacionAddressSearch
            searchAddress={searchAddress}
            onSearchAddressChange={setSearchAddress}
            onAddressSelect={handleMapboxAddressSelect}
          />

          <UbicacionDateTimeField
            tipoUbicacion={formData.tipoUbicacion}
            fechaHoraSalidaLlegada={formData.fechaHoraSalidaLlegada}
            onFechaHoraChange={(e) => setFormData(prev => ({ ...prev, fechaHoraSalidaLlegada: e.target.value }))}
          />

          <div>
            <Label className="flex items-center gap-2 mb-4 text-gray-700 font-medium">
              <MapPin className="h-4 w-4" />
              Domicilio {loadingCP && <span className="text-sm text-blue-600">(Completando automáticamente...)</span>}
            </Label>
            <FormularioDomicilioUnificado
              domicilio={formData.domicilio}
              onDomicilioChange={handleDomicilioChange}
              camposOpcionales={['numInterior', 'referencia', 'localidad']}
            />
            
            {direccionInfo && direccionInfo.colonias.length > 1 && (
              <div className="mt-2 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                <p className="text-sm font-medium text-green-800 mb-2">
                  Colonias disponibles para CP {formData.domicilio.codigoPostal}:
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {direccionInfo.colonias.slice(0, 6).map((colonia, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDomicilioChange('colonia', colonia.nombre)}
                      className="text-xs text-left justify-start h-auto py-1 text-gray-700 hover:bg-green-100"
                    >
                      {colonia.nombre}
                    </Button>
                  ))}
                  {direccionInfo.colonias.length > 6 && (
                    <span className="text-xs text-gray-600">
                      +{direccionInfo.colonias.length - 6} más...
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <UbicacionFormActions
            ubicacion={ubicacion}
            onCancel={onCancel}
            onSaveToFavorites={onSaveToFavorites}
            rfcRemitenteDestinatario={formData.rfcRemitenteDestinatario}
            nombreRemitenteDestinatario={formData.nombreRemitenteDestinatario}
            domicilio={formData.domicilio}
          />
        </form>
      </CardContent>
    </Card>
  );
}
