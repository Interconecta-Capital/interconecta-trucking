
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CartasPorteFilters() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filtros Avanzados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="borrador">Borrador</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="timbrada">Timbrada</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fecha_desde">Fecha Desde</Label>
            <Input id="fecha_desde" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fecha_hasta">Fecha Hasta</Label>
            <Input id="fecha_hasta" type="date" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
