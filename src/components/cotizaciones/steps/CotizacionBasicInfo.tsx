import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, User, Clock } from "lucide-react";
import { useClientesProveedores } from "@/hooks/crm/useClientesProveedores";

interface CotizacionBasicInfoProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export function CotizacionBasicInfo({ formData, updateFormData }: CotizacionBasicInfoProps) {
  const { clientes, loading: loadingClientes } = useClientesProveedores();

  return (
    <div className="space-y-6">
      {/* Información de la Cotización */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Información de la Cotización
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre de la Cotización *</Label>
            <Input
              id="nombre"
              value={formData.nombre_cotizacion}
              onChange={(e) => updateFormData({ nombre_cotizacion: e.target.value })}
              placeholder="Ej: Transporte de mercancía general - Cliente ABC"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="validez">Validez (días)</Label>
              <Input
                id="validez"
                type="number"
                value={formData.tiempo_validez_dias}
                onChange={(e) => updateFormData({ tiempo_validez_dias: parseInt(e.target.value) || 15 })}
                min={1}
                max={90}
              />
            </div>
            <div>
              <Label htmlFor="tipo-cliente">Tipo de Cliente</Label>
              <Select
                value={formData.cliente_tipo}
                onValueChange={(value) => updateFormData({ cliente_tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">Cliente Nuevo</SelectItem>
                  <SelectItem value="existente">Cliente Existente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {formData.cliente_tipo === 'nuevo' ? 'Datos del Cliente Nuevo' : 'Cliente Existente'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.cliente_tipo === 'nuevo' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cliente-nombre">Nombre/Razón Social</Label>
                <Input
                  id="cliente-nombre"
                  value={formData.cliente_nuevo_datos?.nombre || ''}
                  onChange={(e) => updateFormData({
                    cliente_nuevo_datos: {
                      ...formData.cliente_nuevo_datos,
                      nombre: e.target.value
                    }
                  })}
                  placeholder="Empresa o persona física"
                />
              </div>
              <div>
                <Label htmlFor="cliente-rfc">RFC</Label>
                <Input
                  id="cliente-rfc"
                  value={formData.cliente_nuevo_datos?.rfc || ''}
                  onChange={(e) => updateFormData({
                    cliente_nuevo_datos: {
                      ...formData.cliente_nuevo_datos,
                      rfc: e.target.value.toUpperCase()
                    }
                  })}
                  placeholder="RFC del cliente"
                />
              </div>
              <div>
                <Label htmlFor="cliente-email">Email</Label>
                <Input
                  id="cliente-email"
                  type="email"
                  value={formData.cliente_nuevo_datos?.email || ''}
                  onChange={(e) => updateFormData({
                    cliente_nuevo_datos: {
                      ...formData.cliente_nuevo_datos,
                      email: e.target.value
                    }
                  })}
                  placeholder="contacto@empresa.com"
                />
              </div>
              <div>
                <Label htmlFor="cliente-telefono">Teléfono</Label>
                <Input
                  id="cliente-telefono"
                  value={formData.cliente_nuevo_datos?.telefono || ''}
                  onChange={(e) => updateFormData({
                    cliente_nuevo_datos: {
                      ...formData.cliente_nuevo_datos,
                      telefono: e.target.value
                    }
                  })}
                  placeholder="+52 55 1234 5678"
                />
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="cliente-existente">Seleccionar Cliente</Label>
              <Select
                value={formData.cliente_existente_id || ""}
                onValueChange={(value) => updateFormData({ cliente_existente_id: value === "" ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente registrado" />
                </SelectTrigger>
                <SelectContent>
                  {loadingClientes ? (
                    <SelectItem value="" disabled>Cargando clientes...</SelectItem>
                  ) : clientes.length === 0 ? (
                    <SelectItem value="" disabled>No hay clientes registrados</SelectItem>
                  ) : (
                    clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.razon_social} - {cliente.rfc}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Condiciones Comerciales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Condiciones Comerciales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="condiciones">Condiciones y Términos</Label>
            <Textarea
              id="condiciones"
              value={formData.condiciones_comerciales}
              onChange={(e) => updateFormData({ condiciones_comerciales: e.target.value })}
              placeholder="Ej: Pago contra entrega, seguro incluido, tiempo de entrega 24-48 horas..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}