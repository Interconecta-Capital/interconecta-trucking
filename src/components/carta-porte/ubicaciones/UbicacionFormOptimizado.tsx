
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { UbicacionFrecuente } from '@/hooks/useUbicaciones';
import { FormularioDomicilioUnificado, DomicilioUnificado } from '@/components/common/FormularioDomicilioUnificado';

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

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleTipoChange = (tipo: string) => {
    const newId = generarId(tipo as 'Origen' | 'Destino' | 'Paso Intermedio');
    setFormData(prev => ({
      ...prev,
      tipoUbicacion: tipo,
      idUbicacion: newId
    }));
  };

  const handleDomicilioChange = (campo: keyof DomicilioUnificado, valor: string) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        [campo]: valor
      }
    }));
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
              Domicilio
            </Label>
            <FormularioDomicilioUnificado
              domicilio={formData.domicilio}
              onDomicilioChange={handleDomicilioChange}
              camposOpcionales={['numInterior', 'referencia', 'localidad']}
            />
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
                    domicilio: formData.domicilio
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
