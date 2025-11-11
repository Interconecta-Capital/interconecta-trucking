import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { CodigoPostalSelector } from '@/components/catalogos/CodigoPostalSelector';

interface DireccionData {
  codigo_postal?: string;
  estado?: string;
  municipio?: string;
  localidad?: string;
  colonia?: string;
  calle?: string;
  numero_exterior?: string;
  numero_interior?: string;
  referencia?: string;
  colonias?: Array<{ nombre: string; tipo: string }>;
}

interface SocioDireccionFieldsProps {
  direccion: DireccionData;
  onChange: (direccion: DireccionData) => void;
  disabled?: boolean;
}

export function SocioDireccionFields({ direccion, onChange, disabled }: SocioDireccionFieldsProps) {
  const handleCodigoPostalSelect = (cp: string, data?: any) => {
    if (data) {
      onChange({
        ...direccion,
        codigo_postal: cp,
        estado: data.estado,
        municipio: data.municipio,
        localidad: data.localidad || data.municipio,
        colonias: data.colonias
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Domicilio General
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Código Postal con Selector */}
        <div className="space-y-2">
          <Label>Código Postal *</Label>
          <CodigoPostalSelector
            value={direccion?.codigo_postal || ''}
            onValueChange={handleCodigoPostalSelect}
            placeholder="Buscar código postal..."
            disabled={disabled}
          />
        </div>

        {/* Estado y Municipio (readonly) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Estado *</Label>
            <Input
              value={direccion?.estado || ''}
              placeholder="Se autocompleta con el C.P."
              readOnly
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label>Municipio *</Label>
            <Input
              value={direccion?.municipio || ''}
              placeholder="Se autocompleta con el C.P."
              readOnly
              className="bg-muted"
            />
          </div>
        </div>

        {/* Colonia (Select si hay múltiples) */}
        {direccion?.colonias && direccion.colonias.length > 1 ? (
          <div className="space-y-2">
            <Label>Colonia *</Label>
            <Select
              value={direccion?.colonia || ''}
              onValueChange={(value) => onChange({ ...direccion, colonia: value })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar colonia" />
              </SelectTrigger>
              <SelectContent>
                {direccion.colonias.map((col: any) => (
                  <SelectItem key={col.nombre} value={col.nombre}>
                    {col.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Colonia *</Label>
            <Input
              value={direccion?.colonia || ''}
              onChange={(e) => onChange({ ...direccion, colonia: e.target.value })}
              placeholder="Nombre de la colonia"
              disabled={disabled}
            />
          </div>
        )}

        {/* Calle y números */}
        <div className="space-y-2">
          <Label>Calle *</Label>
          <Input
            value={direccion?.calle || ''}
            onChange={(e) => onChange({ ...direccion, calle: e.target.value })}
            placeholder="Av. Principal"
            disabled={disabled}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Número Exterior</Label>
            <Input
              value={direccion?.numero_exterior || ''}
              onChange={(e) => onChange({ ...direccion, numero_exterior: e.target.value })}
              placeholder="123"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label>Número Interior</Label>
            <Input
              value={direccion?.numero_interior || ''}
              onChange={(e) => onChange({ ...direccion, numero_interior: e.target.value })}
              placeholder="A"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Localidad</Label>
          <Input
            value={direccion?.localidad || ''}
            onChange={(e) => onChange({ ...direccion, localidad: e.target.value })}
            placeholder="Ciudad o localidad"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label>Referencias</Label>
          <Input
            value={direccion?.referencia || ''}
            onChange={(e) => onChange({ ...direccion, referencia: e.target.value })}
            placeholder="Entre calle X y calle Y"
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}
