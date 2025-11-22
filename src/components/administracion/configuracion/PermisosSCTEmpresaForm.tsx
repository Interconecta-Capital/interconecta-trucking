// Componente para gestionar permisos SCT a nivel empresa
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Plus, Trash2, Edit2, Check, X, Info } from 'lucide-react';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { usePermisosSCTEmpresa, PermisoSCTEmpresa } from '@/hooks/configuracion/usePermisosSCTEmpresa';

export function PermisosSCTEmpresaForm() {
  const { permisos, isLoading, agregarPermiso, eliminarPermiso, isAdding, isDeleting } = usePermisosSCTEmpresa();
  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tipo_permiso: '',
    numero_permiso: '',
    vigencia: ''
  });

  const handleSubmit = () => {
    if (!formData.tipo_permiso || !formData.numero_permiso) {
      return;
    }

    agregarPermiso(formData, {
      onSuccess: () => {
        setFormData({ tipo_permiso: '', numero_permiso: '', vigencia: '' });
        setShowForm(false);
      }
    });
  };

  const handleEliminar = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este permiso SCT?')) {
      eliminarPermiso(id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permisos SCT de la Empresa
          </CardTitle>
          <Badge variant="secondary">{permisos.length} permisos</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Estos son los permisos SCT generales de tu empresa transportista.
            Son diferentes de los permisos específicos de cada vehículo.
          </AlertDescription>
        </Alert>

        {/* Lista de permisos */}
        {permisos.length === 0 && !showForm ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="mb-4">No hay permisos SCT configurados</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primer Permiso
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {permisos.map((permiso: PermisoSCTEmpresa) => (
                <Card key={permiso.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>{permiso.tipo_permiso}</Badge>
                        <span className="font-mono font-semibold">{permiso.numero_permiso}</span>
                      </div>
                      {permiso.vigencia && (
                        <p className="text-sm text-muted-foreground">
                          Vigencia: {new Date(permiso.vigencia).toLocaleDateString('es-MX')}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEliminar(permiso.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {!showForm && (
              <Button onClick={() => setShowForm(true)} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Otro Permiso
              </Button>
            )}
          </>
        )}

        {/* Formulario para agregar */}
        {showForm && (
          <Card className="p-4 border-2 border-primary">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <CatalogoSelectorMejorado
                    tipo="tipos_permiso"
                    label="Tipo de Permiso SCT"
                    value={formData.tipo_permiso}
                    onValueChange={(value) => setFormData({ ...formData, tipo_permiso: value })}
                    placeholder="Selecciona tipo"
                    required
                  />
                </div>

                <div>
                  <Label>Número de Permiso *</Label>
                  <Input
                    value={formData.numero_permiso}
                    onChange={(e) => setFormData({ ...formData, numero_permiso: e.target.value.toUpperCase() })}
                    placeholder="Ej: SCT-123456"
                    maxLength={50}
                  />
                </div>
              </div>

              <div>
                <Label>Vigencia (opcional)</Label>
                <Input
                  type="date"
                  value={formData.vigencia}
                  onChange={(e) => setFormData({ ...formData, vigencia: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.tipo_permiso || !formData.numero_permiso || isAdding}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {isAdding ? 'Guardando...' : 'Guardar Permiso'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ tipo_permiso: '', numero_permiso: '', vigencia: '' });
                  }}
                  disabled={isAdding}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
