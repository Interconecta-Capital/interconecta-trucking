
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, MapPin, Trash2 } from 'lucide-react';
import { UbicacionCompleta } from '@/types/cartaPorte';

interface UbicacionesSectionProps {
  data: UbicacionCompleta[];
  onChange: (ubicaciones: UbicacionCompleta[]) => void;
  onNext: () => void;
  onPrev: () => void;
  cartaPorteId?: string;
  onDistanceCalculated?: (datos: { distanciaTotal?: number; tiempoEstimado?: number }) => void;
}

export function UbicacionesSection({ 
  data, 
  onChange, 
  onNext, 
  onPrev,
  onDistanceCalculated 
}: UbicacionesSectionProps) {
  
  const addUbicacion = () => {
    const newUbicacion: UbicacionCompleta = {
      id: crypto.randomUUID(),
      tipo_ubicacion: data.length === 0 ? 'Origen' : 'Destino',
      rfc: '',
      nombre: '',
      domicilio: {
        calle: '',
        numero_exterior: '',
        codigo_postal: '',
        colonia: '',
        municipio: '',
        estado: '',
        pais: 'MEX'
      },
      fecha_hora_salida_llegada: new Date().toISOString()
    };
    onChange([...data, newUbicacion]);
  };

  const removeUbicacion = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateUbicacion = (index: number, field: string, value: any) => {
    const updated = [...data];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const parentKey = parent as keyof UbicacionCompleta;
      if (parentKey === 'domicilio' && updated[index].domicilio) {
        updated[index] = {
          ...updated[index],
          domicilio: {
            ...updated[index].domicilio,
            [child]: value
          }
        };
      }
    } else {
      const fieldKey = field as keyof UbicacionCompleta;
      updated[index] = { ...updated[index], [fieldKey]: value };
    }
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Ubicaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((ubicacion, index) => (
          <div key={ubicacion.id} className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                {ubicacion.tipo_ubicacion} {index + 1}
              </h4>
              {data.length > 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeUbicacion(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>RFC</Label>
                <Input
                  value={ubicacion.rfc}
                  onChange={(e) => updateUbicacion(index, 'rfc', e.target.value)}
                  placeholder="RFC de la ubicación"
                />
              </div>
              <div>
                <Label>Nombre</Label>
                <Input
                  value={ubicacion.nombre}
                  onChange={(e) => updateUbicacion(index, 'nombre', e.target.value)}
                  placeholder="Nombre de la ubicación"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Calle</Label>
                <Input
                  value={ubicacion.domicilio?.calle || ''}
                  onChange={(e) => updateUbicacion(index, 'domicilio.calle', e.target.value)}
                  placeholder="Calle"
                />
              </div>
              <div>
                <Label>Número</Label>
                <Input
                  value={ubicacion.domicilio?.numero_exterior || ''}
                  onChange={(e) => updateUbicacion(index, 'domicilio.numero_exterior', e.target.value)}
                  placeholder="Número exterior"
                />
              </div>
              <div>
                <Label>Código Postal</Label>
                <Input
                  value={ubicacion.domicilio?.codigo_postal || ''}
                  onChange={(e) => updateUbicacion(index, 'domicilio.codigo_postal', e.target.value)}
                  placeholder="Código postal"
                />
              </div>
            </div>
          </div>
        ))}

        <Button onClick={addUbicacion} variant="outline" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Agregar Ubicación
        </Button>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev}>
            Anterior
          </Button>
          <Button onClick={onNext} disabled={data.length < 2}>
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
