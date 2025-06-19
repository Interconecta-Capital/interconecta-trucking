
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Search } from 'lucide-react';
import { UbicacionFrecuente } from '@/types/ubicaciones';
import { FormularioDomicilioUnificado, DomicilioUnificado } from '@/components/common/FormularioDomicilioUnificado';
import { AddressAutocomplete } from './AddressAutocomplete';
import { useCodigoPostalMexicanoNacional } from '@/hooks/useCodigoPostalMexicanoNacional';

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
    tipoUbicacion: ubicacion?.tipoUbicacion || '', // Cambio principal: vacío por defecto
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
  
  // Hook para código postal como fallback
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

  // Mejorar manejo de selección de dirección desde Mapbox
  const handleMapboxAddressSelect = (addressData: any) => {
    console.log('Dirección seleccionada desde Mapbox:', addressData);
    
    // Parsear la dirección de Mapbox
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

    // Limpiar el campo de búsqueda
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

    // Si es código postal, intentar auto-completar
    if (campo === 'codigoPostal' && valor.length === 5) {
      consultarCodigoPostal(valor);
    }
  };

  // Auto-completar con datos del código postal
  React.useEffect(() => {
    if (direccionInfo && direccionInfo.colonias.length > 0) {
      setFormData(prev => ({
        ...prev,
        domicilio: {
          ...prev.domicilio,
          estado: direccionInfo.estado,
          municipio: direccionInfo.municipio,
          localidad: direccionInfo.localidad || direccionInfo.municipio,
          // Solo actualizar colonia si está vacía
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {ubicacion ? 'Editar Ubicación' : 'Nueva Ubicación'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {ubicacionesFrecuentes.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Ubicaciones Frecuentes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ubicacionesFrecuentes.slice(0, 4).map((uf) => (
                <Button
                  key={uf.id}
                  variant="outline"
                  size="sm"
                  onClick={() => cargarUbicacionFrecuente(uf)}
                  className="text-left justify-start"
                >
                  <div className="truncate">
                    <div className="font-medium">{uf.nombreUbicacion}</div>
                    <div className="text-xs text-muted-foreground">{uf.rfcAsociado}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipoUbicacion">Tipo de Ubicación *</Label>
              <Select value={formData.tipoUbicacion} onValueChange={handleTipoChange}>
                <SelectTrigger className={errors.tipoUbicacion ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seleccionar tipo de ubicación..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Origen">Origen</SelectItem>
                  <SelectItem value="Destino">Destino</SelectItem>
                  <SelectItem value="Paso Intermedio">Paso Intermedio</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipoUbicacion && <p className="text-sm text-red-500 mt-1">{errors.tipoUbicacion}</p>}
            </div>

            <div>
              <Label htmlFor="idUbicacion">ID Ubicación</Label>
              <Input
                id="idUbicacion"
                value={formData.idUbicacion}
                readOnly
                className="bg-gray-50"
                placeholder="Se genera al seleccionar tipo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rfc">RFC Remitente/Destinatario *</Label>
              <Input
                id="rfc"
                value={formData.rfcRemitenteDestinatario}
                onChange={(e) => setFormData(prev => ({ ...prev, rfcRemitenteDestinatario: e.target.value.toUpperCase() }))}
                placeholder="RFC del remitente o destinatario"
                className={errors.rfc ? 'border-red-500' : ''}
              />
              {errors.rfc && <p className="text-sm text-red-500 mt-1">{errors.rfc}</p>}
            </div>

            <div>
              <Label htmlFor="nombre">Nombre/Razón Social *</Label>
              <Input
                id="nombre"
                value={formData.nombreRemitenteDestinatario}
                onChange={(e) => setFormData(prev => ({ ...prev, nombreRemitenteDestinatario: e.target.value }))}
                placeholder="Nombre completo o razón social"
                className={errors.nombre ? 'border-red-500' : ''}
              />
              {errors.nombre && <p className="text-sm text-red-500 mt-1">{errors.nombre}</p>}
            </div>
          </div>

          {/* Búsqueda de Dirección con Mapbox - MEJORADA */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar Dirección Completa
            </Label>
            <AddressAutocomplete
              value={searchAddress}
              onChange={setSearchAddress}
              onAddressSelect={handleMapboxAddressSelect}
              placeholder="Buscar dirección completa (ej: Av. Insurgentes 123, Roma Norte, CDMX)..."
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              💡 Busca la dirección completa para auto-completar todos los campos automáticamente
            </p>
          </div>

          {(formData.tipoUbicacion === 'Origen' || formData.tipoUbicacion === 'Destino') && (
            <div>
              <Label htmlFor="fechaHora" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha y Hora de {formData.tipoUbicacion === 'Origen' ? 'Salida' : 'Llegada'}
              </Label>
              <Input
                id="fechaHora"
                type="datetime-local"
                value={formData.fechaHoraSalidaLlegada}
                onChange={(e) => setFormData(prev => ({ ...prev, fechaHoraSalidaLlegada: e.target.value }))}
              />
            </div>
          )}

          <div>
            <Label className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4" />
              Domicilio {loadingCP && <span className="text-sm text-blue-600">(Completando automáticamente...)</span>}
            </Label>
            <FormularioDomicilioUnificado
              domicilio={formData.domicilio}
              onDomicilioChange={handleDomicilioChange}
              camposOpcionales={['numInterior', 'referencia', 'localidad']}
            />
            
            {/* Mostrar colonias disponibles si se encontraron */}
            {direccionInfo && direccionInfo.colonias.length > 1 && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg">
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
                      className="text-xs text-left justify-start h-auto py-1"
                    >
                      {colonia.nombre}
                    </Button>
                  ))}
                  {direccionInfo.colonias.length > 6 && (
                    <span className="text-xs text-muted-foreground">
                      +{direccionInfo.colonias.length - 6} más...
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            
            <div className="flex gap-2">
              {onSaveToFavorites && formData.rfcRemitenteDestinatario && formData.nombreRemitenteDestinatario && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onSaveToFavorites({
                    nombreUbicacion: formData.nombreRemitenteDestinatario,
                    rfcAsociado: formData.rfcRemitenteDestinatario,
                    domicilio: formData.domicilio,
                    fechaCreacion: new Date().toISOString(),
                    vecesUsada: 1
                  })}
                >
                  Guardar en Favoritos
                </Button>
              )}
              
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {ubicacion ? 'Actualizar' : 'Agregar'} Ubicación
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
