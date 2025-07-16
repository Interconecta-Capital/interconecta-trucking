import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, User, Package, CheckCircle, AlertTriangle } from "lucide-react";
import { useVehiculos } from "@/hooks/useVehiculos";
import { useConductoresOptimized } from "@/hooks/useConductoresOptimized";
import { useRemolques } from "@/hooks/useRemolques";

interface CotizacionResourcesProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export function CotizacionResources({ formData, updateFormData }: CotizacionResourcesProps) {
  const { vehiculos, loading: loadingVehiculos } = useVehiculos();
  const { conductores, loading: loadingConductores } = useConductoresOptimized();
  const { remolques, loading: loadingRemolques } = useRemolques();

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "disponible":
        return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Disponible</Badge>;
      case "mantenimiento":
        return <Badge className="bg-yellow-500 text-white"><AlertTriangle className="h-3 w-3 mr-1" />Mantenimiento</Badge>;
      case "en_viaje":
        return <Badge className="bg-blue-500 text-white">En Viaje</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Selección de Vehículo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Vehículo Principal *
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="vehiculo">Seleccionar Vehículo</Label>
            <Select
              value={formData.vehiculo_id || ""}
              onValueChange={(value) => updateFormData({ vehiculo_id: value === "" ? null : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un vehículo" />
              </SelectTrigger>
              <SelectContent>
                {loadingVehiculos ? (
                  <SelectItem value="loading" disabled>Cargando vehículos...</SelectItem>
                ) : vehiculos.length === 0 ? (
                  <SelectItem value="empty" disabled>No hay vehículos registrados</SelectItem>
                ) : (
                  vehiculos.map((vehiculo) => (
                    <SelectItem 
                      key={vehiculo.id} 
                      value={vehiculo.id}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}</span>
                        {getEstadoBadge(vehiculo.estado)}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {formData.vehiculo_id && (
            <div className="p-3 bg-muted rounded-lg">
              {(() => {
                const vehiculo = vehiculos.find(v => v.id === formData.vehiculo_id);
                return vehiculo ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{vehiculo.placa}</span>
                      {getEstadoBadge(vehiculo.estado)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {vehiculo.marca} {vehiculo.modelo}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selección de Conductor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Conductor Asignado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="conductor">Seleccionar Conductor</Label>
            <Select
              value={formData.conductor_id || ""}
              onValueChange={(value) => updateFormData({ conductor_id: value === "" ? null : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un conductor" />
              </SelectTrigger>
              <SelectContent>
                {loadingConductores ? (
                  <SelectItem value="loading" disabled>Cargando conductores...</SelectItem>
                ) : conductores.length === 0 ? (
                  <SelectItem value="empty" disabled>No hay conductores registrados</SelectItem>
                ) : (
                  conductores.map((conductor) => (
                    <SelectItem 
                      key={conductor.id} 
                      value={conductor.id}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{conductor.nombre} - Lic. {conductor.num_licencia}</span>
                        {getEstadoBadge(conductor.estado)}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {formData.conductor_id && (
            <div className="p-3 bg-muted rounded-lg">
              {(() => {
                const conductor = conductores.find(c => c.id === formData.conductor_id);
                return conductor ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{conductor.nombre}</span>
                      {getEstadoBadge(conductor.estado)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Licencia: {conductor.num_licencia}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selección de Remolque */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Remolque (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="remolque">Seleccionar Remolque</Label>
            <Select
              value={formData.remolque_id || ""}
              onValueChange={(value) => updateFormData({ remolque_id: value === "" || value === "none" ? null : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un remolque (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {loadingRemolques ? (
                  <SelectItem value="loading" disabled>Cargando remolques...</SelectItem>
                ) : (
                  <>
                    <SelectItem value="none">Sin remolque</SelectItem>
                    {remolques.map((remolque) => (
                      <SelectItem 
                        key={remolque.id} 
                        value={remolque.id}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{remolque.placa} - {remolque.tipo_remolque || remolque.subtipo_rem}</span>
                          {getEstadoBadge(remolque.estado)}
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {formData.remolque_id && (
            <div className="p-3 bg-muted rounded-lg">
              {(() => {
                const remolque = remolques.find(r => r.id === formData.remolque_id);
                return remolque ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{remolque.placa}</span>
                      {getEstadoBadge(remolque.estado)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tipo: {remolque.tipo_remolque || remolque.subtipo_rem}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen de Recursos */}
      {(formData.vehiculo_id || formData.conductor_id) && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Recursos Asignados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.vehiculo_id && (
                <div className="flex items-center gap-3 p-2 border rounded">
                  <Truck className="h-5 w-5 text-blue-500" />
                  <span>Vehículo: {vehiculos.find(v => v.id === formData.vehiculo_id)?.placa}</span>
                </div>
              )}
              
              {formData.conductor_id && (
                <div className="flex items-center gap-3 p-2 border rounded">
                  <User className="h-5 w-5 text-green-500" />
                  <span>Conductor: {conductores.find(c => c.id === formData.conductor_id)?.nombre}</span>
                </div>
              )}
              
              {formData.remolque_id && (
                <div className="flex items-center gap-3 p-2 border rounded">
                  <Package className="h-5 w-5 text-purple-500" />
                  <span>Remolque: {remolques.find(r => r.id === formData.remolque_id)?.placa}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}