
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function VehiculosFilters() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filtros Avanzados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="en_uso">En Uso</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="marca">Marca</Label>
            <Input id="marca" placeholder="Filtrar por marca" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="año">Año</Label>
            <Input id="año" type="number" placeholder="Año del vehículo" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
