
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Search, Edit, Lock, Unlock } from 'lucide-react';
import { UbicacionFrecuente } from '@/types/ubicaciones';
import { AddressAutocomplete } from './AddressAutocomplete';
import { useUbicacionForm } from '@/hooks/useUbicacionForm';

interface SmartUbicacionFormV2Props {
  ubicacion?: any;
  onSave: (ubicacion: any) => void;
  onCancel: () => void;
  onSaveToFavorites?: (ubicacion: Omit<UbicacionFrecuente, 'id' | 'usoCount'>) => void;
  generarId: (tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => string;
  ubicacionesFrecuentes?: UbicacionFrecuente[];
}

export function SmartUbicacionFormV2({ 
  ubicacion, 
  onSave, 
  onCancel, 
  onSaveToFavorites,
  generarId,
  ubicacionesFrecuentes = []
}: SmartUbicacionFormV2Props) {
  const {
    formData,
    rfcValidation,
    handleTipoChange,
    handleRFCChange,
    handleFieldChange,
    cargarUbicacionFrecuente,
    isFormValid
  } = useUbicacionForm(ubicacion, generarId);

  const [modoManual, setModoManual] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Función mejorada para parsear direcciones mexicanas de Mapbox
  const parseMapboxAddress = (addressData: any) => {
    console.log('Parseando dirección de Mapbox:', addressData);
    
    const placeName = addressData.place_name || '';
    const context = addressData.context || [];
    
    let parsedData = {
      pais: 'México',
      codigoPostal: '',
      estado: '',
      municipio: '',
      colonia: '',
      calle: '',
      numExterior: '',
      coordenadas: {
        latitud: 0,
        longitud: 0
      }
    };

    // Extraer coordenadas
    if (addressData.center) {
      parsedData.coordenadas = {
        longitud: addressData.center[0],
        latitud: addressData.center[1]
      };
    }

    // Usar el contexto de Mapbox para información precisa
    context.forEach((item: any) => {
      const id = item.id || '';
      
      if (id.startsWith('postcode')) {
        parsedData.codigoPostal = item.text;
        console.log('CP encontrado:', item.text);
      } else if (id.startsWith('place')) {
        parsedData.municipio = item.text;
        console.log('Municipio encontrado:', item.text);
      } else if (id.startsWith('district') || id.startsWith('locality')) {
        parsedData.colonia = item.text;
        console.log('Colonia encontrada:', item.text);
      } else if (id.startsWith('region')) {
        parsedData.estado = item.text;
        console.log('Estado encontrado:', item.text);
      }
    });

    // Parsear calle y número del place_name de manera más inteligente
    const addressParts = placeName.split(', ');
    if (addressParts.length > 0) {
      const streetPart = addressParts[0];
      
      // Mejorar regex para capturar calle y número
      const streetMatch = streetPart.match(/^(.+?)\s+(\d+[a-zA-Z\-]*)\s*(.*)$/) || 
                         streetPart.match(/^(.+?)\s+#(\d+[a-zA-Z\-]*)\s*(.*)$/) ||
                         streetPart.match(/^(.+?)\s+(S\/N|s\/n)\s*(.*)$/);
      
      if (streetMatch) {
        parsedData.calle = streetMatch[1].trim();
        parsedData.numExterior = streetMatch[2] === 'S/N' || streetMatch[2] === 's/n' ? '' : streetMatch[2];
        console.log('Calle parseada:', parsedData.calle, 'Número:', parsedData.numExterior);
      } else {
        // Si no se puede separar el número, usar todo como calle
        parsedData.calle = streetPart.trim();
        console.log('Calle sin número:', parsedData.calle);
      }
    }

    // Buscar código postal en place_name si no se encontró en contexto
    if (!parsedData.codigoPostal) {
      const cpMatch = placeName.match(/\b(\d{5})\b/);
      if (cpMatch) {
        parsedData.codigoPostal = cpMatch[1];
        console.log('CP encontrado en place_name:', cpMatch[1]);
      }
    }

    console.log('Datos parseados finales:', parsedData);
    return parsedData;
  };

  const handleMapboxAddressSelect = (addressData: any) => {
    console.log('Dirección seleccionada desde Mapbox:', addressData);
    
    const parsedAddress = parseMapboxAddress(addressData);
    
    // Actualizar todos los campos del domicilio
    handleFieldChange('domicilio.pais', parsedAddress.pais);
    handleFieldChange('domicilio.codigoPostal', parsedAddress.codigoPostal);
    handleFieldChange('domicilio.estado', parsedAddress.estado);
    handleFieldChange('domicilio.municipio', parsedAddress.municipio);
    handleFieldChange('domicilio.colonia', parsedAddress.colonia);
    handleFieldChange('domicilio.calle', parsedAddress.calle);
    handleFieldChange('domicilio.numExterior', parsedAddress.numExterior);
    
    // Actualizar coordenadas si están disponibles
    if (parsedAddress.coordenadas.latitud && parsedAddress.coordenadas.longitud) {
      handleFieldChange('coordenadas', parsedAddress.coordenadas);
    }
    
    setDireccionSeleccionada(true);
    setSearchAddress(addressData.place_name);
    
    // Limpiar errores relacionados con la dirección
    const newErrors = { ...errors };
    delete newErrors.address;
    delete newErrors.codigoPostal;
    delete newErrors.calle;
    setErrors(newErrors);
    
    console.log('Campos actualizados y dirección marcada como seleccionada');
  };

  const handleModoManualChange = (checked: boolean) => {
    setModoManual(checked);
    if (checked) {
      // Al activar modo manual, limpiar el estado de búsqueda
      setDireccionSeleccionada(true); // Permitir edición
      console.log('Modo manual activado - campos desbloqueados');
    } else {
      // Al desactivar modo manual, resetear búsqueda si no hay dirección seleccionada
      if (!direccionSeleccionada) {
        setSearchAddress('');
      }
      console.log('Modo automático activado');
    }
  };

  const handleSearchAddressChange = (value: string) => {
    setSearchAddress(value);
    // Si el usuario empieza a escribir una nueva dirección, resetear el estado
    if (direccionSeleccionada && value !== searchAddress) {
      setDireccionSeleccionada(false);
      console.log('Búsqueda cambiada - reseteando estado de selección');
    }
  };

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

    if (!modoManual && !direccionSeleccionada) {
      newErrors.address = 'Debe buscar y seleccionar una dirección completa';
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

  // Los campos están bloqueados solo si NO estamos en modo manual Y NO se ha seleccionado una dirección
  const isFieldDisabled = !modoManual && !direccionSeleccionada;

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
                  onClick={() => {
                    cargarUbicacionFrecuente(uf);
                    setDireccionSeleccionada(true);
                  }}
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
          {/* Información básica */}
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

          {/* RFC y Nombre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rfc">RFC Remitente/Destinatario *</Label>
              <Input
                id="rfc"
                value={formData.rfcRemitenteDestinatario}
                onChange={(e) => handleRFCChange(e.target.value)}
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
                onChange={(e) => handleFieldChange('nombreRemitenteDestinatario', e.target.value)}
                placeholder="Nombre completo o razón social"
                className={errors.nombre ? 'border-red-500' : ''}
              />
              {errors.nombre && <p className="text-sm text-red-500 mt-1">{errors.nombre}</p>}
            </div>
          </div>

          {/* Sección de búsqueda de dirección */}
          <div className="border-t pt-4">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <Label className="flex items-center gap-2 mb-3 font-medium">
                  <Search className="h-4 w-4" />
                  Buscar Dirección Completa
                </Label>
                <AddressAutocomplete
                  value={searchAddress}
                  onChange={handleSearchAddressChange}
                  onAddressSelect={handleMapboxAddressSelect}
                  placeholder="Escribe la dirección completa para autocompletado..."
                  className="w-full"
                />
                {errors.address && <p className="text-sm text-red-500 mt-2">{errors.address}</p>}
                
                {direccionSeleccionada && !modoManual && (
                  <div className="mt-3 p-2 bg-green-100 text-green-800 rounded text-sm flex items-center gap-2">
                    ✅ Dirección encontrada y campos completados automáticamente
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground mt-2">
                  💡 Al seleccionar una dirección se completarán automáticamente todos los campos de domicilio
                </p>
              </div>

              {/* Control de modo manual - MOVIDO DEBAJO */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="modoManual"
                  checked={modoManual}
                  onCheckedChange={handleModoManualChange}
                />
                <Label htmlFor="modoManual" className="flex items-center gap-2">
                  {modoManual ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  Llenar dirección manualmente (modo avanzado)
                </Label>
              </div>

              {modoManual && (
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-orange-800 flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Modo manual activado: Puedes editar todos los campos libremente
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Campos de domicilio */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 font-medium">
              <MapPin className="h-4 w-4" />
              Domicilio
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pais">País</Label>
                <Input
                  id="pais"
                  value={formData.domicilio.pais}
                  onChange={(e) => handleFieldChange('domicilio.pais', e.target.value)}
                  disabled={isFieldDisabled}
                  className={isFieldDisabled ? 'bg-gray-100' : ''}
                />
              </div>

              <div>
                <Label htmlFor="codigoPostal">Código Postal *</Label>
                <Input
                  id="codigoPostal"
                  value={formData.domicilio.codigoPostal}
                  onChange={(e) => handleFieldChange('domicilio.codigoPostal', e.target.value)}
                  disabled={isFieldDisabled}
                  className={`${isFieldDisabled ? 'bg-gray-100' : ''} ${errors.codigoPostal ? 'border-red-500' : ''}`}
                />
                {errors.codigoPostal && <p className="text-sm text-red-500 mt-1">{errors.codigoPostal}</p>}
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={formData.domicilio.estado}
                  onChange={(e) => handleFieldChange('domicilio.estado', e.target.value)}
                  disabled={isFieldDisabled}
                  className={isFieldDisabled ? 'bg-gray-100' : ''}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="municipio">Municipio</Label>
                <Input
                  id="municipio"
                  value={formData.domicilio.municipio}
                  onChange={(e) => handleFieldChange('domicilio.municipio', e.target.value)}
                  disabled={isFieldDisabled}
                  className={isFieldDisabled ? 'bg-gray-100' : ''}
                />
              </div>

              <div>
                <Label htmlFor="colonia">Colonia</Label>
                <Input
                  id="colonia"
                  value={formData.domicilio.colonia}
                  onChange={(e) => handleFieldChange('domicilio.colonia', e.target.value)}
                  disabled={isFieldDisabled}
                  className={isFieldDisabled ? 'bg-gray-100' : ''}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="calle">Calle *</Label>
                <Input
                  id="calle"
                  value={formData.domicilio.calle}
                  onChange={(e) => handleFieldChange('domicilio.calle', e.target.value)}
                  disabled={isFieldDisabled}
                  className={`${isFieldDisabled ? 'bg-gray-100' : ''} ${errors.calle ? 'border-red-500' : ''}`}
                />
                {errors.calle && <p className="text-sm text-red-500 mt-1">{errors.calle}</p>}
              </div>

              <div>
                <Label htmlFor="numExterior">Número Exterior</Label>
                <Input
                  id="numExterior"
                  value={formData.domicilio.numExterior}
                  onChange={(e) => handleFieldChange('domicilio.numExterior', e.target.value)}
                  disabled={isFieldDisabled}
                  className={isFieldDisabled ? 'bg-gray-100' : ''}
                />
              </div>

              <div>
                <Label htmlFor="numInterior">Número Interior</Label>
                <Input
                  id="numInterior"
                  value={formData.domicilio.numInterior}
                  onChange={(e) => handleFieldChange('domicilio.numInterior', e.target.value)}
                  placeholder="Opcional - siempre editable"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="localidad">Localidad (Opcional)</Label>
                <Input
                  id="localidad"
                  value={formData.domicilio.localidad}
                  onChange={(e) => handleFieldChange('domicilio.localidad', e.target.value)}
                  disabled={isFieldDisabled}
                  className={isFieldDisabled ? 'bg-gray-100' : ''}
                  placeholder="Opcional para Carta Porte"
                />
              </div>

              <div>
                <Label htmlFor="referencia">Referencia</Label>
                <Input
                  id="referencia"
                  value={formData.domicilio.referencia}
                  onChange={(e) => handleFieldChange('domicilio.referencia', e.target.value)}
                  placeholder="Opcional - siempre editable"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            
            <div className="flex gap-2">
              {onSaveToFavorites && formData.rfcRemitenteDestinatario && formData.nombreRemitenteDestinatario && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (onSaveToFavorites) {
                      onSaveToFavorites({
                        nombreUbicacion: formData.nombreRemitenteDestinatario,
                        rfcAsociado: formData.rfcRemitenteDestinatario,
                        domicilio: formData.domicilio,
                        fechaCreacion: new Date().toISOString(),
                        vecesUsada: 1
                      });
                    }
                  }}
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
