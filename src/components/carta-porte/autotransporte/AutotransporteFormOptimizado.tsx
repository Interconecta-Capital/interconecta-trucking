
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Truck, Shield, Plus, Trash2 } from 'lucide-react';
import { useConfiguracionesVehiculo, useTiposPermiso } from '@/hooks/useCatalogos';

interface AutotransporteFormOptimizadoProps {
  data: any;
  onChange: (data: any) => void;
}

interface Remolque {
  id: string;
  placa: string;
  subtipo_rem: string;
}

export function AutotransporteFormOptimizado({ data, onChange }: AutotransporteFormOptimizadoProps) {
  const { data: configuracionesVehiculares = [], isLoading: loadingConfiguraciones } = useConfiguracionesVehiculo();
  const { data: tiposPermiso = [], isLoading: loadingPermisos } = useTiposPermiso();
  
  const [formData, setFormData] = React.useState({
    placa_vm: data?.placa_vm || '',
    anio_modelo_vm: data?.anio_modelo_vm || new Date().getFullYear(),
    config_vehicular: data?.config_vehicular || '',
    perm_sct: data?.perm_sct || '',
    num_permiso_sct: data?.num_permiso_sct || '',
    asegura_resp_civil: data?.asegura_resp_civil || '',
    poliza_resp_civil: data?.poliza_resp_civil || '',
    asegura_med_ambiente: data?.asegura_med_ambiente || '',
    poliza_med_ambiente: data?.poliza_med_ambiente || '',
    remolques: data?.remolques || []
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'placa_vm':
        if (!value?.trim()) {
          newErrors[field] = 'La placa del vehículo es requerida';
        } else if (!/^[A-Z0-9]{6,7}$/.test(value.replace(/[-\s]/g, ''))) {
          newErrors[field] = 'Formato de placa inválido';
        } else {
          delete newErrors[field];
        }
        break;
      case 'anio_modelo_vm':
        const currentYear = new Date().getFullYear();
        if (!value || value < 1990 || value > currentYear + 1) {
          newErrors[field] = `Año debe estar entre 1990 y ${currentYear + 1}`;
        } else {
          delete newErrors[field];
        }
        break;
      case 'config_vehicular':
        if (!value?.trim()) {
          newErrors[field] = 'La configuración vehicular es requerida';
        } else {
          delete newErrors[field];
        }
        break;
      case 'perm_sct':
        if (!value?.trim()) {
          newErrors[field] = 'El tipo de permiso SCT es requerido';
        } else {
          delete newErrors[field];
        }
        break;
      case 'num_permiso_sct':
        if (!value?.trim()) {
          newErrors[field] = 'El número de permiso SCT es requerido';
        } else {
          delete newErrors[field];
        }
        break;
      case 'asegura_resp_civil':
        if (!value?.trim()) {
          newErrors[field] = 'La aseguradora de responsabilidad civil es requerida';
        } else {
          delete newErrors[field];
        }
        break;
      case 'poliza_resp_civil':
        if (!value?.trim()) {
          newErrors[field] = 'El número de póliza de responsabilidad civil es requerido';
        } else {
          delete newErrors[field];
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const agregarRemolque = () => {
    const nuevoRemolque: Remolque = {
      id: `remolque-${Date.now()}`,
      placa: '',
      subtipo_rem: ''
    };
    setFormData(prev => ({
      ...prev,
      remolques: [...prev.remolques, nuevoRemolque]
    }));
  };

  const eliminarRemolque = (index: number) => {
    setFormData(prev => ({
      ...prev,
      remolques: prev.remolques.filter((_, i) => i !== index)
    }));
  };

  const actualizarRemolque = (index: number, campo: string, valor: string) => {
    setFormData(prev => ({
      ...prev,
      remolques: prev.remolques.map((remolque, i) => 
        i === index ? { ...remolque, [campo]: valor } : remolque
      )
    }));
  };

  const esConfiguracionConRemolque = () => {
    const config = configuracionesVehiculares.find(c => c.clave_config === formData.config_vehicular);
    return config?.remolque || config?.semirremolque;
  };

  if (loadingConfiguraciones || loadingPermisos) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Información del Vehículo Motor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Vehículo Motor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="placa_vm">Placa del Vehículo *</Label>
              <Input
                id="placa_vm"
                value={formData.placa_vm}
                onChange={(e) => handleFieldChange('placa_vm', e.target.value.toUpperCase())}
                placeholder="Ej: ABC-1234"
                className={errors.placa_vm ? 'border-red-500' : ''}
              />
              {errors.placa_vm && <p className="text-sm text-red-500 mt-1">{errors.placa_vm}</p>}
            </div>

            <div>
              <Label htmlFor="anio_modelo_vm">Año del Modelo *</Label>
              <Input
                id="anio_modelo_vm"
                type="number"
                min="1990"
                max={new Date().getFullYear() + 1}
                value={formData.anio_modelo_vm}
                onChange={(e) => handleFieldChange('anio_modelo_vm', parseInt(e.target.value))}
                className={errors.anio_modelo_vm ? 'border-red-500' : ''}
              />
              {errors.anio_modelo_vm && <p className="text-sm text-red-500 mt-1">{errors.anio_modelo_vm}</p>}
            </div>

            <div>
              <Label htmlFor="config_vehicular">Configuración Vehicular *</Label>
              <Select value={formData.config_vehicular} onValueChange={(value) => handleFieldChange('config_vehicular', value)}>
                <SelectTrigger className={errors.config_vehicular ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecciona configuración" />
                </SelectTrigger>
                <SelectContent>
                  {configuracionesVehiculares.map((config) => (
                    <SelectItem key={config.clave_config} value={config.clave_config}>
                      {config.clave_config} - {config.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.config_vehicular && <p className="text-sm text-red-500 mt-1">{errors.config_vehicular}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permiso SCT */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permiso SCT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="perm_sct">Tipo de Permiso SCT *</Label>
              <Select value={formData.perm_sct} onValueChange={(value) => handleFieldChange('perm_sct', value)}>
                <SelectTrigger className={errors.perm_sct ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecciona tipo de permiso" />
                </SelectTrigger>
                <SelectContent>
                  {tiposPermiso.map((permiso) => (
                    <SelectItem key={permiso.clave_permiso} value={permiso.clave_permiso}>
                      {permiso.clave_permiso} - {permiso.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.perm_sct && <p className="text-sm text-red-500 mt-1">{errors.perm_sct}</p>}
            </div>

            <div>
              <Label htmlFor="num_permiso_sct">Número de Permiso SCT *</Label>
              <Input
                id="num_permiso_sct"
                value={formData.num_permiso_sct}
                onChange={(e) => handleFieldChange('num_permiso_sct', e.target.value)}
                placeholder="Número de permiso"
                className={errors.num_permiso_sct ? 'border-red-500' : ''}
              />
              {errors.num_permiso_sct && <p className="text-sm text-red-500 mt-1">{errors.num_permiso_sct}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seguros */}
      <Card>
        <CardHeader>
          <CardTitle>Seguros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seguro Responsabilidad Civil */}
          <div>
            <h4 className="font-medium mb-3">Responsabilidad Civil *</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="asegura_resp_civil">Aseguradora *</Label>
                <Input
                  id="asegura_resp_civil"
                  value={formData.asegura_resp_civil}
                  onChange={(e) => handleFieldChange('asegura_resp_civil', e.target.value)}
                  placeholder="Nombre de la aseguradora"
                  className={errors.asegura_resp_civil ? 'border-red-500' : ''}
                />
                {errors.asegura_resp_civil && <p className="text-sm text-red-500 mt-1">{errors.asegura_resp_civil}</p>}
              </div>

              <div>
                <Label htmlFor="poliza_resp_civil">Número de Póliza *</Label>
                <Input
                  id="poliza_resp_civil"
                  value={formData.poliza_resp_civil}
                  onChange={(e) => handleFieldChange('poliza_resp_civil', e.target.value)}
                  placeholder="Número de póliza"
                  className={errors.poliza_resp_civil ? 'border-red-500' : ''}
                />
                {errors.poliza_resp_civil && <p className="text-sm text-red-500 mt-1">{errors.poliza_resp_civil}</p>}
              </div>
            </div>
          </div>

          {/* Seguro Medio Ambiente (Opcional) */}
          <div>
            <h4 className="font-medium mb-3">Medio Ambiente (Opcional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="asegura_med_ambiente">Aseguradora</Label>
                <Input
                  id="asegura_med_ambiente"
                  value={formData.asegura_med_ambiente}
                  onChange={(e) => handleFieldChange('asegura_med_ambiente', e.target.value)}
                  placeholder="Nombre de la aseguradora"
                />
              </div>

              <div>
                <Label htmlFor="poliza_med_ambiente">Número de Póliza</Label>
                <Input
                  id="poliza_med_ambiente"
                  value={formData.poliza_med_ambiente}
                  onChange={(e) => handleFieldChange('poliza_med_ambiente', e.target.value)}
                  placeholder="Número de póliza"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remolques */}
      {esConfiguracionConRemolque() && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Remolques y Semirremolques</CardTitle>
              <Button
                type="button"
                variant="outline"
                onClick={agregarRemolque}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar Remolque
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formData.remolques.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                La configuración seleccionada requiere remolques. Haz clic en "Agregar Remolque" para comenzar.
              </p>
            ) : (
              <div className="space-y-4">
                {formData.remolques.map((remolque: Remolque, index: number) => (
                  <div key={remolque.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium">Remolque #{index + 1}</h5>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => eliminarRemolque(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`remolque_placa_${index}`}>Placa</Label>
                        <Input
                          id={`remolque_placa_${index}`}
                          value={remolque.placa}
                          onChange={(e) => actualizarRemolque(index, 'placa', e.target.value.toUpperCase())}
                          placeholder="Ej: REM-1234"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`remolque_subtipo_${index}`}>Subtipo de Remolque</Label>
                        <Select 
                          value={remolque.subtipo_rem} 
                          onValueChange={(value) => actualizarRemolque(index, 'subtipo_rem', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona subtipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CTR001">CTR001 - Remolque carga general</SelectItem>
                            <SelectItem value="CTR002">CTR002 - Semirremolque carga general</SelectItem>
                            <SelectItem value="CTR003">CTR003 - Remolque tanque</SelectItem>
                            <SelectItem value="CTR004">CTR004 - Semirremolque tanque</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
