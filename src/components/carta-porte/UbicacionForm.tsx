
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Calendar } from 'lucide-react';

interface UbicacionFormProps {
  ubicacion: any | null;
  generateId: (tipo: string) => string;
  onSave: (ubicacion: any) => void;
  onCancel: () => void;
}

export function UbicacionForm({ ubicacion, generateId, onSave, onCancel }: UbicacionFormProps) {
  const [formData, setFormData] = useState({
    tipoUbicacion: '',
    idUbicacion: '',
    rfcRemitente: '',
    nombreRemitente: '',
    fechaHora: '',
    distanciaRecorrida: '',
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

  useEffect(() => {
    if (ubicacion) {
      setFormData(ubicacion);
    }
  }, [ubicacion]);

  const handleTipoChange = (tipo: string) => {
    const newId = generateId(tipo);
    setFormData(prev => ({
      ...prev,
      tipoUbicacion: tipo,
      idUbicacion: newId,
    }));
  };

  const handleCodigoPostalChange = (cp: string) => {
    setFormData(prev => ({
      ...prev,
      domicilio: {
        ...prev.domicilio,
        codigoPostal: cp,
      },
    }));

    // Aquí iría la lógica para autocompletar basado en CP
    // Por ahora simularemos algunos datos
    if (cp === '01000') {
      setFormData(prev => ({
        ...prev,
        domicilio: {
          ...prev.domicilio,
          estado: 'Ciudad de México',
          municipio: 'Álvaro Obregón',
          localidad: 'Ciudad de México',
          colonia: 'San Ángel',
        },
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isFormValid = () => {
    return formData.tipoUbicacion && 
           formData.rfcRemitente && 
           formData.nombreRemitente &&
           formData.domicilio.codigoPostal;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>{ubicacion ? 'Editar Ubicación' : 'Nueva Ubicación'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                value={formData.fechaHora}
                onChange={(e) => setFormData(prev => ({ ...prev, fechaHora: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>RFC Remitente/Destinatario *</Label>
              <div className="relative">
                <Input
                  value={formData.rfcRemitente}
                  onChange={(e) => setFormData(prev => ({ ...prev, rfcRemitente: e.target.value.toUpperCase() }))}
                  placeholder="ABC123456789"
                  className="pr-10"
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nombre Remitente/Destinatario *</Label>
              <Input
                value={formData.nombreRemitente}
                onChange={(e) => setFormData(prev => ({ ...prev, nombreRemitente: e.target.value }))}
                placeholder="Nombre completo o razón social"
              />
            </div>
          </div>

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

              <div className="space-y-2">
                <Label>Código Postal *</Label>
                <Input
                  value={formData.domicilio.codigoPostal}
                  onChange={(e) => handleCodigoPostalChange(e.target.value)}
                  placeholder="01000"
                  maxLength={5}
                />
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Input
                  value={formData.domicilio.estado}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    domicilio: { ...prev.domicilio, estado: e.target.value }
                  }))}
                  placeholder="Estado"
                />
              </div>
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
                <Label>Localidad</Label>
                <Input
                  value={formData.domicilio.localidad}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    domicilio: { ...prev.domicilio, localidad: e.target.value }
                  }))}
                  placeholder="Localidad"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Colonia</Label>
                <Input
                  value={formData.domicilio.colonia}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    domicilio: { ...prev.domicilio, colonia: e.target.value }
                  }))}
                  placeholder="Colonia"
                />
              </div>

              <div className="space-y-2">
                <Label>Calle</Label>
                <Input
                  value={formData.domicilio.calle}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    domicilio: { ...prev.domicilio, calle: e.target.value }
                  }))}
                  placeholder="Nombre de la calle"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Número Exterior</Label>
                <Input
                  value={formData.domicilio.numExterior}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    domicilio: { ...prev.domicilio, numExterior: e.target.value }
                  }))}
                  placeholder="123"
                />
              </div>

              <div className="space-y-2">
                <Label>Número Interior</Label>
                <Input
                  value={formData.domicilio.numInterior}
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
                  value={formData.distanciaRecorrida}
                  onChange={(e) => setFormData(prev => ({ ...prev, distanciaRecorrida: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Referencia</Label>
              <Input
                value={formData.domicilio.referencia}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  domicilio: { ...prev.domicilio, referencia: e.target.value }
                }))}
                placeholder="Entre calle X y Y, frente al edificio Z"
              />
            </div>
          </div>

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
