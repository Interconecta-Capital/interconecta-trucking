import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Search, Edit, Lock, Unlock, Info, EyeOff } from 'lucide-react';
import { Ubicacion, UbicacionFrecuente } from '@/types/ubicaciones';
import { AddressAutocomplete } from './AddressAutocomplete';
import { FechaHoraFields } from './FechaHoraFields';
import { useUbicacionForm } from '@/hooks/useUbicacionForm';

interface SmartUbicacionFormV2Props {
  ubicacion?: any;
  onSave: (ubicacion: any) => void;
  onCancel: () => void;
  onSaveToFavorites?: (ubicacion: Omit<UbicacionFrecuente, 'id' | 'usoCount'>) => void;
  generarId: (tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => string;
  ubicacionesFrecuentes?: UbicacionFrecuente[];
  ubicacionIndex?: number;
  totalUbicaciones?: number;
}

export function SmartUbicacionFormV2({ 
  ubicacion, 
  onSave, 
  onCancel, 
  onSaveToFavorites,
  generarId,
  ubicacionesFrecuentes = [],
  ubicacionIndex = 0,
  totalUbicaciones = 1
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
  const [mostrarDomicilio, setMostrarDomicilio] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [camposAutoCompletados, setCamposAutoCompletados] = useState<Set<keyof Ubicacion['domicilio']>>(new Set());

  // MEJORADO: Función de parsing de Mapbox completamente robusta
  const parseMapboxAddress = (addressData: any): { parsedData: any; camposCompletados: Set<keyof Ubicacion['domicilio']> } => {
    console.log('🔄 === INICIANDO PARSING INTEGRAL DE MAPBOX (CORREGIDO V2) ===');
    console.log('📥 Datos completos recibidos:', JSON.stringify(addressData, null, 2));

    const placeName = addressData.place_name || '';
    const camposCompletados = new Set<keyof Ubicacion['domicilio']>();
    let parsedData: Partial<Ubicacion['domicilio']> & { coordenadas?: any } = {
      pais: 'México',
      codigoPostal: '',
      estado: '',
      municipio: '',
      colonia: '',
      calle: '',
      numExterior: '',
    };
    camposCompletados.add('pais');

    // 1. COORDENADAS
    if (addressData.center) {
      parsedData.coordenadas = {
        longitud: addressData.center[0],
        latitud: addressData.center[1]
      };
      console.log('✅ Coordenadas extraídas:', parsedData.coordenadas);
    }

    // 2. PARSING DESDE PLACE_NAME (lógica mejorada)
    const addressParts = placeName.split(',').map(p => p.trim());
    console.log('📝 Partes de la dirección:', addressParts);

    // Helper: Detectar código postal
    const cpRegex = /\b\d{5}\b/;
    // Listado de estados mejorado
    const knownStates = [
      "aguascalientes","baja california sur","baja california","campeche","chiapas","chihuahua",
      "ciudad de méxico","cdmx","coahuila","colima","durango","guanajuato","guerrero","hidalgo",
      "jalisco","méxico","mexico","michoacán","morelos","nayarit","nuevo león","oaxaca","puebla","querétaro",
      "quintana roo","san luis potosí","sinaloa","sonora","tabasco","tamaulipas","tlaxcala","veracruz","yucatán","zacatecas"
    ];

    let cpIndex = -1, stateIndex = -1;
    for (let i = 0; i < addressParts.length; i++) {
      if (cpIndex === -1 && cpRegex.test(addressParts[i])) cpIndex = i;
      if (stateIndex === -1 && knownStates.some(
        estado => addressParts[i].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                  .includes(estado.normalize("NFD").replace(/[\u0300-\u036f]/g, "")))) stateIndex = i;
    }

    // Asignar estado
    if (stateIndex !== -1) {
      parsedData.estado = addressParts[stateIndex];
      camposCompletados.add('estado');
    }

    // Asignar código postal
    if (cpIndex !== -1) {
      const cpMatch = addressParts[cpIndex].match(cpRegex);
      if (cpMatch) {
        parsedData.codigoPostal = cpMatch[0];
        camposCompletados.add('codigoPostal');
      }
    }

    // CORREGIDO: Municipio solo el nombre, sin CP
    if (cpIndex !== -1) {
      const municipioWithCP = addressParts[cpIndex];
      // Extraer solo el municipio, removiendo el CP
      const municipioMatch = municipioWithCP.replace(cpRegex, '').trim();
      if (municipioMatch && municipioMatch.length > 0) {
        parsedData.municipio = municipioMatch;
        camposCompletados.add('municipio');
      }
    } else if (stateIndex > 0) {
      // Fallback: municipio antes de estado
      parsedData.municipio = addressParts[stateIndex - 1];
      camposCompletados.add('municipio');
    }

    // Colonia: nunca debe ser el CP ni municipio
    if (stateIndex > 1) {
      const posibleColonia = addressParts[stateIndex - 2];
      if (
        posibleColonia &&
        posibleColonia !== parsedData.municipio &&
        !cpRegex.test(posibleColonia) &&
        posibleColonia !== addressParts[0]
      ) {
        parsedData.colonia = posibleColonia;
        camposCompletados.add('colonia');
      }
    }

    // Calle y número exterior (primer fragmento)
    if (addressParts.length > 0) {
      const streetPart = addressParts[0];
      const numberMatch = streetPart.match(/(.*?)(\d+[a-zA-Z-]*)$/);
      if (numberMatch) {
        parsedData.calle = numberMatch[1].trim().replace(/[,#]$/, '');
        camposCompletados.add('calle');
        parsedData.numExterior = numberMatch[2].trim();
        camposCompletados.add('numExterior');
      } else {
        parsedData.calle = streetPart;
        camposCompletados.add('calle');
      }
    }

    console.log('🎯 PARSE FINAL V2:', parsedData, [...camposCompletados]);
    return { parsedData, camposCompletados };
  };

  const handleMapboxAddressSelect = (addressData: any) => {
    console.log('🎯 Dirección seleccionada desde Mapbox:', addressData);
    
    const { parsedData, camposCompletados } = parseMapboxAddress(addressData);
    
    // Actualizar todos los campos del domicilio
    Object.keys(parsedData).forEach(key => {
      if (key === 'coordenadas' && parsedData.coordenadas) {
        handleFieldChange('coordenadas', parsedData.coordenadas);
      } else if (key in formData.domicilio) {
        handleFieldChange(`domicilio.${key}`, parsedData[key as keyof typeof parsedData]);
      }
    });
    
    setDireccionSeleccionada(true);
    setMostrarDomicilio(true);
    setSearchAddress('');
    setCamposAutoCompletados(camposCompletados);
    
    // Limpiar errores relacionados con la dirección
    const newErrors = { ...errors };
    delete newErrors.address;
    delete newErrors.codigoPostal;
    delete newErrors.calle;
    delete newErrors.estado;
    delete newErrors.municipio;
    setErrors(newErrors);
    
    console.log('✅ Formulario mostrado y campos marcados como auto-completados');
  };

  const handleModoManualChange = (checked: boolean) => {
    setModoManual(checked);
    if (checked) {
      setMostrarDomicilio(true);
      console.log('🔓 Modo manual activado - formulario mostrado y todos los campos desbloqueados');
    } else {
      if (!direccionSeleccionada) {
        setMostrarDomicilio(false);
        setCamposAutoCompletados(new Set());
      }
      console.log('🔒 Modo manual desactivado');
    }
  };

  const handleSearchAddressChange = (value: string) => {
    setSearchAddress(value);
    if (direccionSeleccionada && value.length > 0) {
      setDireccionSeleccionada(false);
      if (!modoManual) {
        setMostrarDomicilio(false);
      }
      setCamposAutoCompletados(new Set());
      console.log('🔄 Nueva búsqueda iniciada - reseteando estado');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tipoUbicacion?.trim()) {
      newErrors.tipoUbicacion = 'El tipo de ubicación es requerido';
    }

    if (formData.tipoUbicacion !== 'Paso Intermedio' && !formData.rfcRemitenteDestinatario?.trim()) {
      newErrors.rfc = 'El RFC es requerido para origen y destino';
    }

    if (formData.tipoUbicacion !== 'Paso Intermedio' && !formData.nombreRemitenteDestinatario?.trim()) {
      newErrors.nombre = 'El nombre es requerido para origen y destino';
    }

    if (!modoManual && !direccionSeleccionada) {
      newErrors.address = 'Debe buscar y seleccionar una dirección completa o activar el modo manual';
    }

    if (!formData.domicilio.codigoPostal?.trim()) {
      newErrors.codigoPostal = 'El código postal es requerido';
    }

    if (!formData.domicilio.estado?.trim()) {
      newErrors.estado = 'El estado es requerido';
    }

    if (!formData.domicilio.municipio?.trim()) {
      newErrors.municipio = 'El municipio es requerido';
    }

    if (!formData.domicilio.calle?.trim()) {
      newErrors.calle = 'La calle es requerida';
    }

    if (formData.coordenadas) {
      const { latitud, longitud } = formData.coordenadas;
      if (latitud === undefined || isNaN(Number(latitud)) || Number(latitud) < -90 || Number(latitud) > 90) {
        newErrors.latitud = 'Latitud inválida';
      }
      if (longitud === undefined || isNaN(Number(longitud)) || Number(longitud) < -180 || Number(longitud) > 180) {
        newErrors.longitud = 'Longitud inválida';
      }
    } else {
      newErrors.latitud = 'Latitud inválida';
      newErrors.longitud = 'Longitud inválida';
    }

    // Validar fecha y hora para origen y destino
    if ((formData.tipoUbicacion === 'Origen' || formData.tipoUbicacion === 'Destino') && 
        !formData.fechaHoraSalidaLlegada?.trim()) {
      newErrors.fechaHora = `La fecha y hora ${formData.tipoUbicacion === 'Origen' ? 'de salida' : 'de llegada'} es requerida`;
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

  const isFieldLocked = (field: keyof Ubicacion['domicilio']) => {
    if (modoManual) {
      return false;
    }
    
    const camposSiempreEditables: (keyof Ubicacion['domicilio'])[] = ['colonia', 'numInterior', 'localidad', 'referencia'];
    if (camposSiempreEditables.includes(field)) {
      return false;
    }

    return camposAutoCompletados.has(field);
  };

  const isRFCRequired = formData.tipoUbicacion !== 'Paso Intermedio';

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

          {formData.tipoUbicacion !== 'Paso Intermedio' && (
            <>
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
                  {rfcValidation && !rfcValidation.isValid && (
                    <p className="text-sm text-red-500 mt-1">{rfcValidation.message}</p>
                  )}
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
            </>
          )}

          {formData.tipoUbicacion === 'Paso Intermedio' && (
            <div className="p-4 bg-yellow-50 rounded-md">
              <Info className="h-5 w-5 text-yellow-700 inline-block mr-2 align-middle" />
              <span className="text-sm text-yellow-800 align-middle">
                Los campos de RFC y Nombre/Razón Social son opcionales para ubicaciones de "Paso Intermedio".
              </span>
            </div>
          )}

          {/* NUEVO: Sección de fecha y hora */}
          {formData.tipoUbicacion && (
            <div className="border-t pt-4">
              <FechaHoraFields
                ubicacion={formData}
                onFieldChange={handleFieldChange}
                errors={errors}
                ubicacionIndex={ubicacionIndex}
                totalUbicaciones={totalUbicaciones}
              />
            </div>
          )}

          {/* Sección de búsqueda de dirección */}
          <div className="border-t pt-4">
            <div className="space-y-4">
              {/* Control de modo manual */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="modoManual"
                  checked={modoManual}
                  onCheckedChange={handleModoManualChange}
                />
                <Label htmlFor="modoManual" className="flex items-center gap-2">
                  {modoManual ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  Llenar dirección manualmente
                </Label>
              </div>

              {/* SOLO mostrar autocomplete si NO está en modo manual */}
              {!modoManual && (
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
                      ✅ Dirección encontrada. Los campos detectados están protegidos, los faltantes se pueden editar.
                    </div>
                  )}
                </div>
              )}

              {modoManual && (
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-orange-800 flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Modo manual activado: Todos los campos desbloqueados
                  </p>
                </div>
              )}

              {/* Mensaje cuando el formulario está oculto */}
              {!mostrarDomicilio && (
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-sm text-gray-600 flex items-center gap-2 justify-center">
                    <EyeOff className="h-4 w-4" />
                    El formulario de domicilio aparecerá cuando busques una dirección o actives el modo manual
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Campos de domicilio condicionalmente visibles */}
          {mostrarDomicilio && (
            <div className="space-y-4">
              <Label className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4" />
                Domicilio
              </Label>

              {/* ... keep existing domicilio fields the same ... */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pais">País *</Label>
                  <Input
                    id="pais"
                    value={formData.domicilio.pais}
                    onChange={(e) => handleFieldChange('domicilio.pais', e.target.value)}
                    disabled={isFieldLocked('pais')}
                    className={isFieldLocked('pais') ? 'bg-gray-100' : 'bg-white'}
                  />
                </div>

                <div>
                  <Label htmlFor="codigoPostal">Código Postal *</Label>
                  <Input
                    id="codigoPostal"
                    value={formData.domicilio.codigoPostal}
                    onChange={(e) => handleFieldChange('domicilio.codigoPostal', e.target.value)}
                    disabled={isFieldLocked('codigoPostal')}
                    className={`${isFieldLocked('codigoPostal') ? 'bg-gray-100' : 'bg-white'} ${errors.codigoPostal ? 'border-red-500' : ''}`}
                  />
                  {errors.codigoPostal && <p className="text-sm text-red-500 mt-1">{errors.codigoPostal}</p>}
                </div>

                <div>
                  <Label htmlFor="estado">Estado *</Label>
                  <Input
                    id="estado"
                    value={formData.domicilio.estado}
                    onChange={(e) => handleFieldChange('domicilio.estado', e.target.value)}
                    disabled={isFieldLocked('estado')}
                    className={`${isFieldLocked('estado') ? 'bg-gray-100' : 'bg-white'} ${errors.estado ? 'border-red-500' : ''}`}
                  />
                  {errors.estado && <p className="text-sm text-red-500 mt-1">{errors.estado}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="municipio">Municipio *</Label>
                  <Input
                    id="municipio"
                    value={formData.domicilio.municipio}
                    onChange={(e) => handleFieldChange('domicilio.municipio', e.target.value)}
                    disabled={isFieldLocked('municipio')}
                    className={`${isFieldLocked('municipio') ? 'bg-gray-100' : 'bg-white'} ${errors.municipio ? 'border-red-500' : ''}`}
                  />
                  {errors.municipio && <p className="text-sm text-red-500 mt-1">{errors.municipio}</p>}
                </div>

                <div>
                  <Label htmlFor="colonia">Colonia</Label>
                  <Input
                    id="colonia"
                    value={formData.domicilio.colonia}
                    onChange={(e) => handleFieldChange('domicilio.colonia', e.target.value)}
                    placeholder="Colonia"
                    disabled={isFieldLocked('colonia')}
                    className={isFieldLocked('colonia') ? 'bg-gray-100' : 'bg-white'}
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
                    disabled={isFieldLocked('calle')}
                    className={`${isFieldLocked('calle') ? 'bg-gray-100' : 'bg-white'} ${errors.calle ? 'border-red-500' : ''}`}
                  />
                  {errors.calle && <p className="text-sm text-red-500 mt-1">{errors.calle}</p>}
                </div>

                <div>
                  <Label htmlFor="numExterior">Número Exterior</Label>
                  <Input
                    id="numExterior"
                    value={formData.domicilio.numExterior}
                    onChange={(e) => handleFieldChange('domicilio.numExterior', e.target.value)}
                    disabled={isFieldLocked('numExterior')}
                    className={isFieldLocked('numExterior') ? 'bg-gray-100' : 'bg-white'}
                  />
                </div>

                <div>
                  <Label htmlFor="numInterior">Número Interior</Label>
                  <Input
                    id="numInterior"
                    value={formData.domicilio.numInterior}
                    onChange={(e) => handleFieldChange('domicilio.numInterior', e.target.value)}
                    placeholder="Ej: 1A, Local 2"
                    disabled={isFieldLocked('numInterior')}
                    className={isFieldLocked('numInterior') ? 'bg-gray-100' : 'bg-white'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="localidad">Localidad</Label>
                  <Input
                    id="localidad"
                    value={formData.domicilio.localidad}
                    onChange={(e) => handleFieldChange('domicilio.localidad', e.target.value)}
                    placeholder="Localidad o población"
                    disabled={isFieldLocked('localidad')}
                    className={isFieldLocked('localidad') ? 'bg-gray-100' : 'bg-white'}
                  />
                </div>

                <div>
                  <Label htmlFor="referencia">Referencia</Label>
                  <Input
                    id="referencia"
                    value={formData.domicilio.referencia}
                    onChange={(e) => handleFieldChange('domicilio.referencia', e.target.value)}
                    placeholder="Ej: Entre calles, color de fachada"
                    disabled={isFieldLocked('referencia')}
                    className={isFieldLocked('referencia') ? 'bg-gray-100' : 'bg-white'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitud">Latitud *</Label>
                  <Input
                    id="latitud"
                    value={formData.coordenadas?.latitud ?? ''}
                    onChange={(e) => {
                      handleFieldChange('coordenadas.latitud', parseFloat(e.target.value));
                      if (errors.latitud) setErrors(prev => ({ ...prev, latitud: '' }));
                    }}
                    placeholder="Ej: 19.4326"
                    className={errors.latitud ? 'border-red-500' : ''}
                  />
                  {errors.latitud && <p className="text-sm text-red-500 mt-1">{errors.latitud}</p>}
                </div>
                <div>
                  <Label htmlFor="longitud">Longitud *</Label>
                  <Input
                    id="longitud"
                    value={formData.coordenadas?.longitud ?? ''}
                    onChange={(e) => {
                      handleFieldChange('coordenadas.longitud', parseFloat(e.target.value));
                      if (errors.longitud) setErrors(prev => ({ ...prev, longitud: '' }));
                    }}
                    placeholder="Ej: -99.1332"
                    className={errors.longitud ? 'border-red-500' : ''}
                  />
                  {errors.longitud && <p className="text-sm text-red-500 mt-1">{errors.longitud}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isFormValid()} className="bg-blue-600 hover:bg-blue-700">
              {ubicacion ? 'Actualizar Ubicación' : 'Agregar Ubicación'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
