
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CodigoPostalInput } from '@/components/catalogos/CodigoPostalInput';
import { CatalogoSelector } from '@/components/catalogos/CatalogoSelector';
import { useEstados } from '@/hooks/useCatalogos';
import { RFCValidator } from '@/utils/rfcValidation';
import { Ubicacion } from '@/hooks/useUbicaciones';
import { Search, MapPin, Calendar, AlertCircle, Star, StarOff } from 'lucide-react';

interface UbicacionFormProps {
  ubicacion?: Ubicacion;
  onSave: (ubicacion: Ubicacion) => void;
  onCancel: () => void;
  onSaveToFavorites?: (ubicacion: Omit<import('@/hooks/useUbicaciones').UbicacionFrecuente, 'id' | 'usoCount'>) => void;
  generarId: (tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => string;
  ubicacionesFrecuentes?: import('@/hooks/useUbicaciones').UbicacionFrecuente[];
}

export function UbicacionForm({ 
  ubicacion, 
  onSave, 
  onCancel, 
  onSaveToFavorites,
  generarId,
  ubicacionesFrecuentes = []
}: UbicacionFormProps) {
  const [formData, setFormData] = useState<Ubicacion>({
    idUbicacion: '',
    tipoUbicacion: 'Origen',
    rfcRemitenteDestinatario: '',
    nombreRemitenteDestinatario: '',
    fechaHoraSalidaLlegada: '',
    distanciaRecorrida: 0,
    ordenSecuencia: 1,
    domicilio: {
      pais: 'MEX',
      codigoPostal: '',
      estado: '',
      municipio: '',
      localidad: '',
      colonia: '',
      calle: '',
      numExterior: '',
      numInterior: '',
      referencia: '',
    },
  });

  const [rfcValidation, setRfcValidation] = useState<ReturnType<typeof RFCValidator.validarRFC>>({
    esValido: true,
    errores: []
  });

  const [showFrecuentes, setShowFrecuentes] = useState(false);
  const { data: estados = [] } = useEstados();

  useEffect(() => {
    if (ubicacion) {
      setFormData(ubicacion);
    }
  }, [ubicacion]);

  const handleTipoChange = (tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => {
    const newId = generarId(tipo);
    setFormData(prev => ({
      ...prev,
      tipoUbicacion: tipo,
      idUbicacion: newId,
    }));
  };

  const handleRFCChange = (rfc: string) => {
    const rfcFormateado = RFCValidator.formatearRFC(rfc);
    const validation = RFCValidator.validarRFC(rfcFormateado);
    
    setFormData(prev => ({ 
      ...prev, 
      rfcRemitenteDestinatario: rfcFormateado 
    }));
    setRfcValidation(validation);
  };

  const handleCodigoPostalChange = (codigoPostal: string) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        codigoPostal,
      },
    }));
  };

  const handleInfoChange = (info: {
    estado?: string;
    municipio?: string;
    localidad?: string;
    colonia?: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        ...info,
      },
    }));
  };

  const handleColoniaChange = (colonia: string) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        colonia,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      onSave(formData);
    }
  };

  const handleSaveToFavorites = () => {
    if (onSaveToFavorites && formData.rfcRemitenteDestinatario && formData.nombreRemitenteDestinatario) {
      onSaveToFavorites({
        nombreUbicacion: formData.nombreRemitenteDestinatario,
        rfcAsociado: formData.rfcRemitenteDestinatario,
        domicilio: formData.domicilio
      });
    }
  };

  const cargarUbicacionFrecuente = (frecuente: import('@/hooks/useUbicaciones').UbicacionFrecuente) => {
    setFormData(prev => ({
      ...prev,
      rfcRemitenteDestinatario: frecuente.rfcAsociado,
      nombreRemitenteDestinatario: frecuente.nombreUbicacion,
      domicilio: frecuente.domicilio
    }));
    setShowFrecuentes(false);
  };

  const isFormValid = () => {
    return formData.tipoUbicacion && 
           rfcValidation.esValido &&
           formData.rfcRemitenteDestinatario && 
           formData.nombreRemitenteDestinatario &&
           formData.domicilio.codigoPostal &&
           formData.domicilio.estado &&
           formData.domicilio.calle;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>{ubicacion ? 'Editar Ubicación' : 'Nueva Ubicación'}</span>
          </CardTitle>
          
          <div className="flex space-x-2">
            {ubicacionesFrecuentes.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFrecuentes(!showFrecuentes)}
              >
                <Star className="h-4 w-4 mr-2" />
                Favoritos
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Ubicaciones frecuentes */}
        {showFrecuentes && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Ubicaciones Frecuentes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {ubicacionesFrecuentes.map((frecuente) => (
                  <Button
                    key={frecuente.id}
                    type="button"
                    variant="ghost"
                    className="text-left justify-start h-auto p-3"
                    onClick={() => cargarUbicacionFrecuente(frecuente)}
                  >
                    <div>
                      <div className="font-medium">{frecuente.nombreUbicacion}</div>
                      <div className="text-sm text-muted-foreground">{frecuente.rfcAsociado}</div>
                      <div className="text-xs text-muted-foreground">
                        {frecuente.domicilio.calle}, {frecuente.domicilio.colonia}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Ubicación *</Label>
              <Select value={formData.tipoUbicacion} onValueChange={handleTipoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Origen">Origen</SelectItem>
                  <SelectItem value="Destino">Destino</SelectItem>
                  <SelectItem value="Paso Intermedio">Paso Intermedio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>ID Ubicación</Label>
              <Input
                value={formData.idUbicacion}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha y Hora</Label>
              <Input
                type="datetime-local"
                value={formData.fechaHoraSalidaLlegada || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  fechaHoraSalidaLlegada: e.target.value 
                }))}
              />
            </div>
          </div>

          {/* RFC y Nombre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>RFC Remitente/Destinatario *</Label>
              <div className="relative">
                <Input
                  value={formData.rfcRemitenteDestinatario}
                  onChange={(e) => handleRFCChange(e.target.value)}
                  placeholder="ABC123456789"
                  className={`pr-10 ${!rfcValidation.esValido ? 'border-red-500' : ''}`}
                  maxLength={13}
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              
              {!rfcValidation.esValido && rfcValidation.errores.length > 0 && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {rfcValidation.errores.join(', ')}
                  </AlertDescription>
                </Alert>
              )}
              
              {rfcValidation.esValido && rfcValidation.tipo && (
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary">
                    Persona {rfcValidation.tipo === 'fisica' ? 'Física' : 'Moral'}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Nombre/Razón Social *</Label>
              <div className="flex space-x-2">
                <Input
                  value={formData.nombreRemitenteDestinatario}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    nombreRemitenteDestinatario: e.target.value 
                  }))}
                  placeholder="Nombre completo o razón social"
                />
                {formData.rfcRemitenteDestinatario && formData.nombreRemitenteDestinatario && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSaveToFavorites}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Domicilio */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Domicilio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>País</Label>
                <Select 
                  value={formData.domicilio.pais} 
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    domicilio: { ...prev.domicilio, pais: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEX">México</SelectItem>
                    <SelectItem value="USA">Estados Unidos</SelectItem>
                    <SelectItem value="CAN">Canadá</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <CodigoPostalInput
                value={formData.domicilio.codigoPostal}
                onValueChange={handleCodigoPostalChange}
                onInfoChange={handleInfoChange}
                coloniaValue={formData.domicilio.colonia}
                onColoniaChange={handleColoniaChange}
                required
              />

              <CatalogoSelector
                label="Estado"
                value={formData.domicilio.estado}
                onValueChange={(clave) => setFormData(prev => ({
                  ...prev,
                  domicilio: { ...prev.domicilio, estado: clave }
                }))}
                items={estados}
                placeholder="Seleccionar estado..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Municipio</Label>
                <Input
                  value={formData.domicilio.municipio}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    domicilio: { ...prev.domicilio, municipio: e.target.value }
                  }))}
                  placeholder="Municipio"
                />
              </div>

              <div className="space-y-2">
                <Label>Calle *</Label>
                <Input
                  value={formData.domicilio.calle}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    domicilio: { ...prev.domicilio, calle: e.target.value }
                  }))}
                  placeholder="Nombre de la calle"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Número Exterior *</Label>
                <Input
                  value={formData.domicilio.numExterior}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    domicilio: { ...prev.domicilio, numExterior: e.target.value }
                  }))}
                  placeholder="123"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Número Interior</Label>
                <Input
                  value={formData.domicilio.numInterior || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    domicilio: { ...prev.domicilio, numInterior: e.target.value }
                  }))}
                  placeholder="A"
                />
              </div>

              <div className="space-y-2">
                <Label>Distancia Recorrida (km)</Label>
                <Input
                  type="number"
                  value={formData.distanciaRecorrida || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    distanciaRecorrida: parseFloat(e.target.value) || 0 
                  }))}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Referencia</Label>
              <Input
                value={formData.domicilio.referencia || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  domicilio: { ...prev.domicilio, referencia: e.target.value }
                }))}
                placeholder="Entre calle X y Y, frente al edificio Z"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isFormValid()}>
              {ubicacion ? 'Actualizar' : 'Agregar'} Ubicación
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
