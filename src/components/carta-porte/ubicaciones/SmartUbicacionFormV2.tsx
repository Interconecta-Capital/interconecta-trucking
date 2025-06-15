
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Search, Edit, Lock, Unlock, Info } from 'lucide-react';
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [populatedAddressFields, setPopulatedAddressFields] = useState<Set<keyof Ubicacion['domicilio']>>(new Set());

  // Función mejorada para parsear direcciones mexicanas de Mapbox
  const parseMapboxAddress = (addressData: any): { parsedData: any; populatedFields: Set<keyof Ubicacion['domicilio']> } => {
    console.log('=== INICIANDO PARSING DE MAPBOX ===');
    console.log('Address Data completo:', JSON.stringify(addressData, null, 2));
    
    const placeName = addressData.place_name || '';
    const populatedFields = new Set<keyof Ubicacion['domicilio']>();
    
    let parsedData: Partial<Ubicacion['domicilio']> & { coordenadas?: any } = {
      pais: 'México',
      codigoPostal: '',
      estado: '',
      municipio: '',
      colonia: '',
      calle: '',
      numExterior: '',
    };
    populatedFields.add('pais');

    console.log('place_name:', placeName);

    // 1. Coordenadas
    if (addressData.center) {
      parsedData.coordenadas = {
        longitud: addressData.center[0],
        latitud: addressData.center[1]
      };
      console.log('Coordenadas extraídas:', parsedData.coordenadas);
    }

    // 2. Extraer de `context` PRIMERO (más fiable)
    console.log('=== PROCESANDO CONTEXT ===');
    if (addressData.context && Array.isArray(addressData.context)) {
      console.log('Context disponible:', addressData.context);
      
      for (const item of addressData.context) {
        console.log('Procesando item del context:', item);
        
        // Código postal
        if (item.id && item.id.startsWith('postcode') && !parsedData.codigoPostal) {
          parsedData.codigoPostal = item.text;
          populatedFields.add('codigoPostal');
          console.log('✅ Código postal extraído de context:', item.text);
        }
        
        // Estado/Región
        if (item.id && item.id.startsWith('region') && !parsedData.estado) {
          parsedData.estado = item.text;
          populatedFields.add('estado');
          console.log('✅ Estado extraído de context:', item.text);
        }
        
        // Municipio - puede venir como 'place' o 'district'
        if (item.id && (item.id.startsWith('place') || item.id.startsWith('district')) && !parsedData.municipio) {
          parsedData.municipio = item.text;
          populatedFields.add('municipio');
          console.log('✅ Municipio extraído de context:', item.text);
        }
        
        // Colonia - puede venir como 'neighborhood' o 'locality'
        if (item.id && (item.id.startsWith('neighborhood') || item.id.startsWith('locality')) && !parsedData.colonia) {
          parsedData.colonia = item.text;
          populatedFields.add('colonia');
          console.log('✅ Colonia extraída de context:', item.text);
        }
      }
    }

    // 3. Extraer calle y número del texto principal
    console.log('=== PROCESANDO CALLE Y NÚMERO ===');
    const streetPart = addressData.text || (placeName.split(',')[0] || '');
    console.log('Street part detectado:', streetPart);
    
    if (streetPart) {
      // Si hay campo `address` separado en Mapbox, usarlo como número
      if (addressData.address && /^\d+[a-zA-Z\-]*$/.test(addressData.address)) {
        parsedData.calle = streetPart.trim();
        populatedFields.add('calle');
        parsedData.numExterior = addressData.address.trim();
        populatedFields.add('numExterior');
        console.log('✅ Calle y número extraídos (método 1):', parsedData.calle, parsedData.numExterior);
      } else {
        // Buscar número al final de la calle con regex mejorado
        const patterns = [
          /^(.*?)\s+([\d]+[a-zA-Z\-]*)\s*$/,  // "Calle Principal 123A"
          /^(.*?)\s+#([\d]+[a-zA-Z\-]*)\s*$/,  // "Calle Principal #123"
          /^(.*?)\s+No\.?\s*([\d]+[a-zA-Z\-]*)\s*$/,  // "Calle Principal No. 123"
          /^(.*?)\s+Num\.?\s*([\d]+[a-zA-Z\-]*)\s*$/   // "Calle Principal Num 123"
        ];
        
        let matched = false;
        for (const pattern of patterns) {
          const match = streetPart.match(pattern);
          if (match) {
            parsedData.calle = match[1].trim().replace(/,$/, '');
            populatedFields.add('calle');
            parsedData.numExterior = match[2].trim();
            populatedFields.add('numExterior');
            console.log('✅ Calle y número extraídos (patrón):', parsedData.calle, parsedData.numExterior);
            matched = true;
            break;
          }
        }
        
        if (!matched) {
          // Si no hay número, todo es calle
          parsedData.calle = streetPart.trim().replace(/,$/, '');
          populatedFields.add('calle');
          console.log('✅ Solo calle extraída (sin número):', parsedData.calle);
        }
      }
    }

    // 4. Fallbacks usando place_name si no se encontró en context
    console.log('=== APLICANDO FALLBACKS ===');
    const addressParts = placeName.split(',').map(part => part.trim());
    console.log('Address parts:', addressParts);

    // Fallback para código postal
    if (!populatedFields.has('codigoPostal')) {
      const cpMatch = placeName.match(/\b(\d{5})\b/);
      if (cpMatch) {
        parsedData.codigoPostal = cpMatch[1];
        populatedFields.add('codigoPostal');
        console.log('✅ Código postal extraído por fallback:', cpMatch[1]);
      }
    }
    
    // Fallback para estado usando lista completa
    if (!populatedFields.has('estado')) {
      const estados = [
        "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", 
        "Chihuahua", "Ciudad de México", "CDMX", "Coahuila", "Colima", "Durango", 
        "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "México", "Michoacán", "Morelos", 
        "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", 
        "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", 
        "Veracruz", "Yucatán", "Zacatecas"
      ];
      
      for (const part of addressParts) {
        const estadoEncontrado = estados.find(estado => 
          part.toLowerCase().includes(estado.toLowerCase()) ||
          (estado === 'Ciudad de México' && (part.toLowerCase().includes('cdmx') || part.toLowerCase().includes('ciudad de mexico')))
        );
        
        if (estadoEncontrado) {
          parsedData.estado = estadoEncontrado === 'CDMX' ? 'Ciudad de México' : estadoEncontrado;
          populatedFields.add('estado');
          console.log('✅ Estado extraído por fallback:', parsedData.estado);
          break;
        }
      }
    }
    
    // Fallback para municipio (buscar en las últimas partes, excluyendo estado y país)
    if (!populatedFields.has('municipio') && addressParts.length >= 3) {
      // Buscar municipio en la tercera o cuarta posición, evitando estado y país
      for (let i = 2; i < Math.min(addressParts.length - 1, 4); i++) {
        const part = addressParts[i];
        // Evitar que tome el estado o país como municipio
        if (part && 
            !part.toLowerCase().includes('méxico') && 
            !part.toLowerCase().includes('mexico') &&
            !part.match(/\d{5}/) && // No es código postal
            part.length > 2) { // Tiene longitud suficiente
          
          // Verificar que no sea un estado conocido
          const estados = ["aguascalientes", "baja california", "campeche", "chiapas", "chihuahua", "ciudad de méxico", "cdmx", "coahuila", "colima", "durango", "guanajuato", "guerrero", "hidalgo", "jalisco", "méxico", "michoacán", "morelos", "nayarit", "nuevo león", "oaxaca", "puebla", "querétaro", "quintana roo", "san luis potosí", "sinaloa", "sonora", "tabasco", "tamaulipas", "tlaxcala", "veracruz", "yucatán", "zacatecas"];
          
          if (!estados.some(estado => part.toLowerCase().includes(estado))) {
            parsedData.municipio = part;
            populatedFields.add('municipio');
            console.log('✅ Municipio extraído por fallback:', part);
            break;
          }
        }
      }
    }
    
    console.log('=== RESULTADO FINAL ===');
    console.log('Datos parseados:', parsedData);
    console.log('Campos poblados:', [...populatedFields]);
    
    return { parsedData, populatedFields };
  };

  const handleMapboxAddressSelect = (addressData: any) => {
    console.log('Dirección seleccionada desde Mapbox:', addressData);
    
    const { parsedData, populatedFields } = parseMapboxAddress(addressData);
    
    // Actualizar todos los campos del domicilio
    Object.keys(parsedData).forEach(key => {
      if (key === 'coordenadas' && parsedData.coordenadas) {
        handleFieldChange('coordenadas', parsedData.coordenadas);
      } else if (key in formData.domicilio) {
        handleFieldChange(`domicilio.${key}`, parsedData[key as keyof typeof parsedData]);
      }
    });
    
    // Marcar dirección como seleccionada y actualizar campos poblados
    setDireccionSeleccionada(true);
    setSearchAddress('');
    setPopulatedAddressFields(populatedFields);
    
    // Limpiar errores relacionados con la dirección
    const newErrors = { ...errors };
    delete newErrors.address;
    delete newErrors.codigoPostal;
    delete newErrors.calle;
    delete newErrors.estado;
    delete newErrors.municipio;
    setErrors(newErrors);
    
    console.log('Campos actualizados y dirección marcada como seleccionada');
    console.log('Campos poblados guardados:', [...populatedFields]);
  };

  const handleModoManualChange = (checked: boolean) => {
    setModoManual(checked);
    if (!checked) {
      // Al volver a modo automático, si no hay dirección, limpiar campos poblados
      if (!direccionSeleccionada) {
        setPopulatedAddressFields(new Set());
      }
    } else {
      // Al activar modo manual, NO limpiar los campos poblados, solo permitir edición
      console.log('Modo manual activado - todos los campos desbloqueados');
    }
  };

  const handleSearchAddressChange = (value: string) => {
    setSearchAddress(value);
    // Si el usuario empieza a escribir una nueva dirección, resetear el estado
    if (direccionSeleccionada) {
      setDireccionSeleccionada(false);
      setPopulatedAddressFields(new Set());
      console.log('Nueva búsqueda iniciada - reseteando estado de selección');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tipoUbicacion?.trim()) {
      newErrors.tipoUbicacion = 'El tipo de ubicación es requerido';
    }

    // RFC opcional solo para Paso Intermedio
    if (formData.tipoUbicacion !== 'Paso Intermedio' && !formData.rfcRemitenteDestinatario?.trim()) {
      newErrors.rfc = 'El RFC es requerido para origen y destino';
    }

    // Nombre opcional para Paso Intermedio
    if (formData.tipoUbicacion !== 'Paso Intermedio' && !formData.nombreRemitenteDestinatario?.trim()) {
      newErrors.nombre = 'El nombre es requerido para origen y destino';
    }

    if (!modoManual && !direccionSeleccionada) {
      newErrors.address = 'Debe buscar y seleccionar una dirección completa';
    }

    // Campos obligatorios del domicilio
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

  // Lógica CORREGIDA de bloqueo de campos
  const isFieldLocked = (field: keyof Ubicacion['domicilio']) => {
    // En modo manual, NADA está bloqueado
    if (modoManual) {
      return false;
    }
    
    // Campos siempre editables (nunca se bloquean)
    const alwaysEditableFields: (keyof Ubicacion['domicilio'])[] = ['colonia', 'numInterior', 'localidad', 'referencia'];
    if (alwaysEditableFields.includes(field)) {
      return false;
    }

    // Solo bloquear si el campo fue poblado automáticamente por Mapbox
    return populatedAddressFields.has(field);
  };

  // Determinar si los campos RFC/Nombre son necesarios
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

          {/* RFC y Nombre - Condicional según tipo */}
          {isRFCRequired && (
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
          )}

          {/* Información para Paso Intermedio */}
          {formData.tipoUbicacion === 'Paso Intermedio' && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Paso Intermedio</span>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Para pasos intermedios solo es necesario especificar la ubicación. 
                El RFC y razón social son opcionales y se usan cuando hay transferencia de mercancía.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rfc-opcional">RFC (Opcional)</Label>
                  <Input
                    id="rfc-opcional"
                    value={formData.rfcRemitenteDestinatario}
                    onChange={(e) => handleRFCChange(e.target.value)}
                    placeholder="Solo si hay transferencia"
                  />
                </div>

                <div>
                  <Label htmlFor="nombre-opcional">Nombre (Opcional)</Label>
                  <Input
                    id="nombre-opcional"
                    value={formData.nombreRemitenteDestinatario}
                    onChange={(e) => handleFieldChange('nombreRemitenteDestinatario', e.target.value)}
                    placeholder="Solo si hay transferencia"
                  />
                </div>
              </div>
            </div>
          )}

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
