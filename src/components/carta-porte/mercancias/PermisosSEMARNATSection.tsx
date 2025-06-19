
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { PermisoSEMARNAT } from '@/types/cartaPorte';

interface PermisosSEMARNATSectionProps {
  permisos: PermisoSEMARNAT[];
  onChange: (permisos: PermisoSEMARNAT[]) => void;
}

export function PermisosSEMARNATSection({ permisos, onChange }: PermisosSEMARNATSectionProps) {
  const [newPermiso, setNewPermiso] = useState<Partial<PermisoSEMARNAT>>({});

  const handleAddPermiso = () => {
    if (newPermiso.tipo_permiso && newPermiso.numero_permiso && newPermiso.fecha_vencimiento) {
      const permiso: PermisoSEMARNAT = {
        id: crypto.randomUUID(),
        tipo_permiso: newPermiso.tipo_permiso,
        numero_permiso: newPermiso.numero_permiso,
        fecha_expedicion: newPermiso.fecha_expedicion || new Date().toISOString().split('T')[0],
        fecha_vencimiento: newPermiso.fecha_vencimiento,
        autoridad_expedidora: newPermiso.autoridad_expedidora || 'SEMARNAT',
        vigente: new Date(newPermiso.fecha_vencimiento) > new Date(),
        observaciones: newPermiso.observaciones || ''
      };
      
      onChange([...permisos, permiso]);
      setNewPermiso({});
    }
  };

  const handleRemovePermiso = (id: string) => {
    onChange(permisos.filter(p => p.id !== id));
  };

  const isVigente = (fechaVencimiento: string) => {
    return new Date(fechaVencimiento) > new Date();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Permisos SEMARNAT</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de permisos existentes */}
        {permisos.length > 0 && (
          <div className="space-y-2">
            {permisos.map((permiso) => (
              <div key={permiso.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{permiso.tipo_permiso}</span>
                    <Badge variant={isVigente(permiso.fecha_vencimiento) ? "default" : "destructive"}>
                      {isVigente(permiso.fecha_vencimiento) ? "Vigente" : "Vencido"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    No. {permiso.numero_permiso} - Vence: {permiso.fecha_vencimiento}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePermiso(permiso.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Formulario para agregar nuevo permiso */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">Agregar Nuevo Permiso</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Tipo de Permiso</Label>
              <Input
                placeholder="Ej: CITES, UMA, etc."
                value={newPermiso.tipo_permiso || ''}
                onChange={(e) => setNewPermiso({...newPermiso, tipo_permiso: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Número de Permiso</Label>
              <Input
                placeholder="Número oficial"
                value={newPermiso.numero_permiso || ''}
                onChange={(e) => setNewPermiso({...newPermiso, numero_permiso: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Fecha de Expedición</Label>
              <Input
                type="date"
                value={newPermiso.fecha_expedicion || ''}
                onChange={(e) => setNewPermiso({...newPermiso, fecha_expedicion: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Fecha de Vencimiento</Label>
              <Input
                type="date"
                value={newPermiso.fecha_vencimiento || ''}
                onChange={(e) => setNewPermiso({...newPermiso, fecha_vencimiento: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddPermiso}
              disabled={!newPermiso.tipo_permiso || !newPermiso.numero_permiso || !newPermiso.fecha_vencimiento}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Permiso
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
