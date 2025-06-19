
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, AlertTriangle, Shield } from 'lucide-react';
import { PermisoSEMARNAT } from '@/types/cartaPorte';

interface PermisosSEMARNATSectionProps {
  permisos: PermisoSEMARNAT[];
  onChange: (permisos: PermisoSEMARNAT[]) => void;
  required?: boolean;
}

export function PermisosSEMARNATSection({ 
  permisos, 
  onChange, 
  required = false 
}: PermisosSEMARNATSectionProps) {
  
  const addPermiso = () => {
    const newPermiso: PermisoSEMARNAT = {
      id: crypto.randomUUID(),
      tipo_permiso: 'traslado',
      numero_permiso: '',
      fecha_expedicion: '',
      fecha_vencimiento: '',
      autoridad_expedidora: 'SEMARNAT',
      observaciones: '',
      vigente: true
    };
    onChange([...permisos, newPermiso]);
  };

  const updatePermiso = (index: number, field: keyof PermisoSEMARNAT, value: any) => {
    const updated = permisos.map((p, i) => (
      i === index ? { ...p, [field]: value } : p
    ));
    onChange(updated);
  };

  const removePermiso = (index: number) => {
    onChange(permisos.filter((_, i) => i !== index));
  };

  const isPermisoVencido = (fechaVencimiento: string): boolean => {
    if (!fechaVencimiento) return false;
    return new Date(fechaVencimiento) < new Date();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center space-x-2">
          <Shield className="h-4 w-4" />
          <span>Permisos SEMARNAT</span>
          {required && <span className="text-red-500">*</span>}
        </h4>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addPermiso}
        >
          <Plus className="h-4 w-4 mr-2" /> 
          Agregar Permiso
        </Button>
      </div>

      {required && permisos.length === 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Las especies protegidas requieren al menos un permiso SEMARNAT vigente.
          </AlertDescription>
        </Alert>
      )}

      {permisos.length === 0 && !required ? (
        <Card>
          <CardContent className="py-4 text-center text-muted-foreground">
            No hay permisos SEMARNAT registrados
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {permisos.map((permiso, index) => (
            <Card key={permiso.id || index} className={isPermisoVencido(permiso.fecha_vencimiento) ? 'border-red-200' : ''}>
              <CardHeader className="flex items-center justify-between p-4">
                <CardTitle className="text-base flex items-center space-x-2">
                  <span>Permiso #{index + 1}</span>
                  {isPermisoVencido(permiso.fecha_vencimiento) && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </CardTitle>
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => removePermiso(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {isPermisoVencido(permiso.fecha_vencimiento) && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Este permiso está vencido. Renueve el permiso antes de realizar el traslado.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Permiso *</Label>
                    <Select
                      value={permiso.tipo_permiso}
                      onValueChange={(value) => updatePermiso(index, 'tipo_permiso', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="traslado">Autorización de Traslado</SelectItem>
                        <SelectItem value="aprovechamiento">Permiso de Aprovechamiento</SelectItem>
                        <SelectItem value="legal_procedencia">Acreditación de Legal Procedencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Número de Permiso *</Label>
                    <Input
                      value={permiso.numero_permiso}
                      onChange={(e) => updatePermiso(index, 'numero_permiso', e.target.value)}
                      placeholder="Ej: SGPA/DGVS/123456/24"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha de Expedición *</Label>
                    <Input
                      type="date"
                      value={permiso.fecha_expedicion}
                      onChange={(e) => updatePermiso(index, 'fecha_expedicion', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Fecha de Vencimiento *</Label>
                    <Input
                      type="date"
                      value={permiso.fecha_vencimiento}
                      onChange={(e) => updatePermiso(index, 'fecha_vencimiento', e.target.value)}
                      required
                      className={isPermisoVencido(permiso.fecha_vencimiento) ? 'border-red-300' : ''}
                    />
                  </div>
                </div>

                <div>
                  <Label>Autoridad Expedidora</Label>
                  <Input
                    value={permiso.autoridad_expedidora}
                    onChange={(e) => updatePermiso(index, 'autoridad_expedidora', e.target.value)}
                    placeholder="SEMARNAT"
                  />
                </div>

                <div>
                  <Label>Observaciones</Label>
                  <Textarea
                    value={permiso.observaciones}
                    onChange={(e) => updatePermiso(index, 'observaciones', e.target.value)}
                    placeholder="Información adicional sobre el permiso..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
