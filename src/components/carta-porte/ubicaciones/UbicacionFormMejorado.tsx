
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Save, X, Search } from 'lucide-react';
import { AddressAutocomplete } from './AddressAutocomplete';
import { UbicacionesService, UbicacionFrecuenteData } from '@/services/ubicacionesService';
import { useToast } from '@/hooks/use-toast';
import { CodigoPostalInputOptimizado } from '@/components/catalogos/CodigoPostalInputOptimizado';

interface UbicacionFormMejoradoProps {
  ubicacion?: any;
  onSave: (ubicacion: any) => void;
  onCancel: () => void;
  generarId: (tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => string;
}

export function UbicacionFormMejorado({ 
  ubicacion, 
  onSave, 
  onCancel, 
  generarId 
}: UbicacionFormMejoradoProps) {
  const [formData, setFormData] = useState({
    idUbicacion: ubicacion?.idUbicacion || '',
    tipoUbicacion: ubicacion?.tipoUbicacion || 'Origen',
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

  const [ubicacionesFrecuentes, setUbicacionesFrecuentes] = useState<UbicacionFrecuenteData[]>([]);
  const [showFrecuentes, setShowFrecuentes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  // Cargar ubicaciones frecuentes
  useEffect(() => {
    cargarUbicacionesFrecuentes();
  }, []);

  const cargarUbicacionesFrecuentes = async () => {
    const frecuentes = await UbicacionesService.obtenerUbicacionesFrecuentes();
    setUbicacionesFrecuentes(frecuentes);
  };

  const handleTipoChange = (tipo: string) => {
    const newId = generarId(tipo as 'Origen' | 'Destino' | 'Paso Intermedio');
    setFormData(prev => ({
      ...prev,
      tipoUbicacion: tipo,
      idUbicacion: newId
    }));
  };

  const handleFieldChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddressSelect = (result: any) => {
    // Extraer información de la dirección geocodificada
    const addressComponents = result.formattedAddress.split(',');
    
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        calle: addressComponents[0]?.trim() || '',
        // El sistema intentará completar automáticamente otros campos
      }
    }));
  };

  const handleCodigoPostalChange = (codigoPostal: string) => {
    handleFieldChange('domicilio.codigoPostal', codigoPostal);
  };

  const handleInfoChange = (info: any) => {
    if (info.estado) handleFieldChange('domicilio.estado', info.estado);
    if (info.municipio) handleFieldChange('domicilio.municipio', info.municipio);
    if (info.colonia) handleFieldChange('domicilio.colonia', info.colonia);
  };

  const cargarUbicacionFrecuente = async (frecuente: UbicacionFrecuenteData) => {
    setFormData(prev => ({
      ...prev,
      rfcRemitenteDestinatario: frecuente.rfcAsociado,
      nombreRemitenteDestinatario: frecuente.nombreUbicacion,
      domicilio: frecuente.domicilio
    }));

    // Incrementar contador de uso
    if (frecuente.id) {
      await UbicacionesService.incrementarUsoUbicacion(frecuente.id);
    }

    setShowFrecuentes(false);
    
    toast({
      title: "Ubicación cargada",
      description: `Se ha cargado la ubicación frecuente: ${frecuente.nombreUbicacion}`,
    });
  };

  const guardarComoFrecuente = async () => {
    if (!formData.rfcRemitenteDestinatario || !formData.nombreRemitenteDestinatario) {
      toast({
        title: "Error",
        description: "Completa el RFC y nombre para guardar como frecuente",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    const result = await UbicacionesService.guardarUbicacionFrecuente({
      nombreUbicacion: formData.nombreRemitenteDestinatario,
      rfcAsociado: formData.rfcRemitenteDestinatario,
      domicilio: formData.domicilio
    });

    if (result.success) {
      toast({
        title: "Éxito",
        description: "Ubicación guardada como frecuente",
      });
      await cargarUbicacionesFrecuentes();
    } else {
      toast({
        title: "Error",
        description: result.error || "Error al guardar ubicación frecuente",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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

  const canSaveToFavorites = Boolean(
    formData.rfcRemitenteDestinatario && 
    formData.rfcRemitenteDestinatario.trim() !== '' &&
    formData.nombreRemitenteDestinatario && 
    formData.nombreRemitenteDestinatario.trim() !== '' &&
    formData.domicilio.calle &&
    formData.domicilio.codigoPostal
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {ubicacion ? 'Editar Ubicación' : 'Nueva Ubicación'}
          </CardTitle>
          
          <div className="flex gap-2">
            {ubicacionesFrecuentes.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFrecuentes(!showFrecuentes)}
              >
                <Star className="h-4 w-4 mr-2" />
                Frecuentes
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {showFrecuentes && ubicacionesFrecuentes.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Ubicaciones Frecuentes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {ubicacionesFrecuentes.map((frecuente) => (
                <Button
                  key={frecuente.id}
                  variant="outline"
                  size="sm"
                  onClick={() => cargarUbicacionFrecuente(frecuente)}
                  className="text-left justify-start h-auto p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{frecuente.nombreUbicacion}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {frecuente.rfcAsociado}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {frecuente.domicilio.calle} {frecuente.domicilio.numExterior}, {frecuente.domicilio.colonia}
                    </div>
                    <Badge variant="secondary" className="text-xs mt-1">
                      Usado {frecuente.usoCount || 1} veces
                    </Badge>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Origen">Origen</SelectItem>
                  <SelectItem value="Destino">Destino</SelectItem>
                  <SelectItem value="Paso Intermedio">Paso Intermedio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="idUbicacion">ID Ubicación</Label>
              <Input
                id="idUbicacion"
                value={formData.idUbicacion}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rfc">RFC Remitente/Destinatario *</Label>
              <Input
                id="rfc"
                value={formData.rfcRemitenteDestinatario}
                onChange={(e) => handleFieldChange('rfcRemitenteDestinatario', e.target.value.toUpperCase())}
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

          {(formData.tipoUbicacion === 'Origen' || formData.tipoUbicacion === 'Destino') && (
            <div>
              <Label htmlFor="fechaHora">
                Fecha y Hora de {formData.tipoUbicacion === 'Origen' ? 'Salida' : 'Llegada'}
              </Label>
              <Input
                id="fechaHora"
                type="datetime-local"
                value={formData.fechaHoraSalidaLlegada}
                onChange={(e) => handleFieldChange('fechaHoraSalidaLlegada', e.target.value)}
              />
            </div>
          )}

          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-lg font-medium">
              <MapPin className="h-4 w-4" />
              Domicilio
            </Label>

            <div className="space-y-4">
              <div>
                <Label htmlFor="direccionCompleta">
                  Buscar Dirección (con Mapbox)
                </Label>
                <AddressAutocomplete
                  value=""
                  onChange={() => {}}
                  onAddressSelect={handleAddressSelect}
                  placeholder="Buscar dirección completa..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calle">Calle *</Label>
                  <Input
                    id="calle"
                    value={formData.domicilio.calle}
                    onChange={(e) => handleFieldChange('domicilio.calle', e.target.value)}
                    placeholder="Nombre de la calle"
                    className={errors.calle ? 'border-red-500' : ''}
                  />
                  {errors.calle && <p className="text-sm text-red-500 mt-1">{errors.calle}</p>}
                </div>

                <div>
                  <Label htmlFor="numExterior">Número Exterior</Label>
                  <Input
                    id="numExterior"
                    value={formData.domicilio.numExterior}
                    onChange={(e) => handleFieldChange('domicilio.numExterior', e.target.value)}
                    placeholder="No. Exterior"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CodigoPostalInputOptimizado
                  value={formData.domicilio.codigoPostal}
                  onChange={handleCodigoPostalChange}
                  onLocationUpdate={handleInfoChange}
                  coloniaValue={formData.domicilio.colonia}
                  onColoniaChange={(colonia) => handleFieldChange('domicilio.colonia', colonia)}
                  className="w-full"
                  soloCodigoPostal={true}
                />

                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.domicilio.estado}
                    onChange={(e) => handleFieldChange('domicilio.estado', e.target.value)}
                    placeholder="Estado"
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
                    placeholder="Municipio"
                  />
                </div>

                <div>
                  <Label htmlFor="colonia">Colonia</Label>
                  <Input
                    id="colonia"
                    value={formData.domicilio.colonia}
                    onChange={(e) => handleFieldChange('domicilio.colonia', e.target.value)}
                    placeholder="Colonia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numInterior">Número Interior</Label>
                  <Input
                    id="numInterior"
                    value={formData.domicilio.numInterior}
                    onChange={(e) => handleFieldChange('domicilio.numInterior', e.target.value)}
                    placeholder="No. Interior (opcional)"
                  />
                </div>

                <div>
                  <Label htmlFor="referencia">Referencia</Label>
                  <Input
                    id="referencia"
                    value={formData.domicilio.referencia}
                    onChange={(e) => handleFieldChange('domicilio.referencia', e.target.value)}
                    placeholder="Referencias adicionales"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <div className="flex gap-2">
              {canSaveToFavorites && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={guardarComoFrecuente}
                  disabled={isLoading}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Guardar Frecuente
                </Button>
              )}
              
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                {ubicacion ? 'Actualizar' : 'Agregar'} Ubicación
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
