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
  const [mostrarDomicilio, setMostrarDomicilio] = useState(false); // NUEVO: Control de visibilidad
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [camposAutoCompletados, setCamposAutoCompletados] = useState<Set<keyof Ubicacion['domicilio']>>(new Set());

  // MEJORADO: Función de parsing de Mapbox con logging detallado
  const parseMapboxAddress = (addressData: any): { parsedData: any; camposCompletados: Set<keyof Ubicacion['domicilio']> } => {
    console.log('🔄 === INICIANDO PARSING INTEGRAL DE MAPBOX ===');
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

    console.log('📍 Place name:', placeName);

    // 1. COORDENADAS
    if (addressData.center) {
      parsedData.coordenadas = {
        longitud: addressData.center[0],
        latitud: addressData.center[1]
      };
      console.log('✅ Coordenadas extraídas:', parsedData.coordenadas);
    }

    // 2. PARSING DESDE PLACE_NAME (Principal strategy)
    console.log('🔍 === PARSING DESDE PLACE_NAME ===');
    const addressParts = placeName.split(',').map(part => part.trim());
    console.log('📝 Partes de la dirección:', addressParts);

    if (addressParts.length >= 3) {
      // Calle y número (primera parte)
      const streetPart = addressParts[0] || '';
      console.log('🛣️ Parte de calle detectada:', streetPart);
      
      // Extraer número exterior con patrones mejorados
      const numberPatterns = [
        /^(.*?)\s+(\d+[a-zA-Z\-]*)\s*$/,  // "Calle Principal 123A"
        /^(.*?)\s+#(\d+[a-zA-Z\-]*)\s*$/,  // "Calle Principal #123"
        /^(.*?)\s+No\.?\s*(\d+[a-zA-Z\-]*)\s*$/,  // "Calle Principal No. 123"
        /^(.*?)\s+Num\.?\s*(\d+[a-zA-Z\-]*)\s*$/   // "Calle Principal Num 123"
      ];
      
      let matched = false;
      for (const pattern of numberPatterns) {
        const match = streetPart.match(pattern);
        if (match) {
          parsedData.calle = match[1].trim().replace(/,$/, '');
          camposCompletados.add('calle');
          parsedData.numExterior = match[2].trim();
          camposCompletados.add('numExterior');
          console.log('✅ Calle y número extraídos:', parsedData.calle, parsedData.numExterior);
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        parsedData.calle = streetPart.trim().replace(/,$/, '');
        camposCompletados.add('calle');
        console.log('✅ Solo calle extraída:', parsedData.calle);
      }

      // Colonia (segunda parte)
      if (addressParts[1]) {
        parsedData.colonia = addressParts[1].trim();
        camposCompletados.add('colonia');
        console.log('✅ Colonia extraída:', parsedData.colonia);
      }

      // Estado y municipio desde las últimas partes
      for (let i = addressParts.length - 1; i >= 2; i--) {
        const part = addressParts[i];
        
        // Buscar código postal
        const cpMatch = part.match(/\b(\d{5})\b/);
        if (cpMatch && !parsedData.codigoPostal) {
          parsedData.codigoPostal = cpMatch[1];
          camposCompletados.add('codigoPostal');
          console.log('✅ Código postal extraído:', cpMatch[1]);
        }
        
        // Detectar estados mexicanos
        const estadosPattern = /(aguascalientes|baja california sur|baja california|campeche|chiapas|chihuahua|ciudad de méxico|cdmx|coahuila|colima|durango|guanajuato|guerrero|hidalgo|jalisco|méxico|michoacán|morelos|nayarit|nuevo león|oaxaca|puebla|querétaro|quintana roo|san luis potosí|sinaloa|sonora|tabasco|tamaulipas|tlaxcala|veracruz|yucatán|zacatecas)/i;
        if (estadosPattern.test(part.toLowerCase()) && !parsedData.estado) {
          parsedData.estado = part.includes('CDMX') ? 'Ciudad de México' : part;
          camposCompletados.add('estado');
          console.log('✅ Estado extraído:', parsedData.estado);
        }
      }

      // Municipio (buscar en tercera posición o siguientes, evitando estado y país)
      for (let i = 2; i < Math.min(addressParts.length - 1, 4); i++) {
        const part = addressParts[i];
        if (part && 
            !part.toLowerCase().includes('méxico') && 
            !part.toLowerCase().includes('mexico') &&
            !part.match(/\d{5}/) && 
            part.length > 2 &&
            !parsedData.municipio) {
          
          // Verificar que no sea un estado conocido
          const estadosLower = ["aguascalientes", "baja california", "campeche", "chiapas", "chihuahua", "ciudad de méxico", "cdmx", "coahuila", "colima", "durango", "guanajuato", "guerrero", "hidalgo", "jalisco", "méxico", "michoacán", "morelos", "nayarit", "nuevo león", "oaxaca", "puebla", "querétaro", "quintana roo", "san luis potosí", "sinaloa", "sonora", "tabasco", "tamaulipas", "tlaxcala", "veracruz", "yucatán", "zacatecas"];
          
          if (!estadosLower.some(estado => part.toLowerCase().includes(estado))) {
            parsedData.municipio = part;
            camposCompletados.add('municipio');
            console.log('✅ Municipio extraído:', part);
            break;
          }
        }
      }
    }
    
    console.log('🎯 === RESULTADO FINAL DEL PARSING ===');
    console.log('📦 Datos parseados:', parsedData);
    console.log('🔒 Campos completados:', [...camposCompletados]);
    
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
    
    // NUEVO: Marcar dirección como seleccionada y mostrar formulario
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
      // Activar modo manual: mostrar formulario y permitir edición total
      setMostrarDomicilio(true);
      console.log('🔓 Modo manual activado - formulario mostrado y todos los campos desbloqueados');
    } else {
      // Desactivar modo manual: ocultar formulario si no hay dirección seleccionada
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  // CORREGIDO: Lógica de bloqueo de campos completamente nueva
  const isFieldLocked = (field: keyof Ubicacion['domicilio']) => {
    // En modo manual, NADA está bloqueado
    if (modoManual) {
      return false;
    }
    
    // Campos especiales NUNCA se bloquean (usuario siempre puede editarlos)
    const camposSiempreEditables: (keyof Ubicacion['domicilio'])[] = ['colonia', 'numInterior', 'localidad', 'referencia'];
    if (camposSiempreEditables.includes(field)) {
      return false;
    }

    // Solo bloquear si el campo fue auto-completado por Mapbox
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
        {/* ... keep existing code (ubicaciones frecuentes) */}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... keep existing code (información básica - tipo de ubicación e ID) */}

          {/* ... keep existing code (RFC y Nombre condicional e información para paso intermedio) */}

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
                    ✅ Dirección encontrada. Los campos detectados están protegidos, los faltantes se pueden editar.
                  </div>
                )}
              </div>

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

              {modoManual && (
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-orange-800 flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Modo manual activado: Todos los campos desbloqueados
                  </p>
                </div>
              )}

              {/* NUEVO: Mensaje cuando el formulario está oculto */}
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

          {/* NUEVO: Campos de domicilio condicionalmente visibles */}
          {mostrarDomicilio && (
            <div className="space-y-4">
              <Label className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4" />
                Domicilio
              </Label>

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
            </div>
          )}

          {/* ... keep existing code (botones de acción) */}
        </form>
      </CardContent>
    </Card>
  );
}
