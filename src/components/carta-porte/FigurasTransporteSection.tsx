
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Trash2 } from 'lucide-react';
import { FiguraCompleta } from '@/types/cartaPorte';

interface FigurasTransporteSectionProps {
  data: FiguraCompleta[];
  onChange: (figuras: FiguraCompleta[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function FigurasTransporteSection({ data, onChange, onNext, onPrev }: FigurasTransporteSectionProps) {
  
  const addFigura = () => {
    const newFigura: FiguraCompleta = {
      id: crypto.randomUUID(),
      tipo_figura: '01', // Operador
      rfc_figura: '',
      nombre_figura: '',
      num_licencia: '',
      tipo_licencia: 'E'
    };
    onChange([...data, newFigura]);
  };

  const removeFigura = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateFigura = (index: number, field: keyof FiguraCompleta, value: any) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Figuras de Transporte
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((figura, index) => (
          <div key={figura.id} className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Figura {index + 1}</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeFigura(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Figura</Label>
                <Select 
                  value={figura.tipo_figura} 
                  onValueChange={(value) => updateFigura(index, 'tipo_figura', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">01 - Operador</SelectItem>
                    <SelectItem value="02">02 - Propietario</SelectItem>
                    <SelectItem value="03">03 - Arrendador</SelectItem>
                    <SelectItem value="04">04 - Notificado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>RFC</Label>
                <Input
                  value={figura.rfc_figura}
                  onChange={(e) => updateFigura(index, 'rfc_figura', e.target.value)}
                  placeholder="RFC de la figura"
                />
              </div>
            </div>

            <div>
              <Label>Nombre Completo</Label>
              <Input
                value={figura.nombre_figura}
                onChange={(e) => updateFigura(index, 'nombre_figura', e.target.value)}
                placeholder="Nombre completo de la figura"
              />
            </div>

            {figura.tipo_figura === '01' && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Número de Licencia</Label>
                  <Input
                    value={figura.num_licencia}
                    onChange={(e) => updateFigura(index, 'num_licencia', e.target.value)}
                    placeholder="Número de licencia"
                  />
                </div>
                <div>
                  <Label>Tipo de Licencia</Label>
                  <Select 
                    value={figura.tipo_licencia} 
                    onValueChange={(value) => updateFigura(index, 'tipo_licencia', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de licencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A - Motocicleta</SelectItem>
                      <SelectItem value="B">B - Automóvil</SelectItem>
                      <SelectItem value="C">C - Camión</SelectItem>
                      <SelectItem value="D">D - Autobús</SelectItem>
                      <SelectItem value="E">E - Tractor con Semirremolque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        ))}

        <Button onClick={addFigura} variant="outline" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Agregar Figura
        </Button>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev}>
            Anterior
          </Button>
          <Button onClick={onNext} disabled={data.length === 0}>
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
