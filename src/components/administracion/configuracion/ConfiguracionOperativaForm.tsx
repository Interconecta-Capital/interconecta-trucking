
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Shield, 
  Truck, 
  Settings,
  AlertTriangle
} from 'lucide-react';
import { useConfiguracionEmpresarial } from '@/hooks/useConfiguracionEmpresarial';

interface ConfiguracionOperativa {
  // Seguros empresariales
  seguro_resp_civil_empresa: {
    aseguradora?: string;
    numero_poliza?: string;
    vigencia_desde?: string;
    vigencia_hasta?: string;
  };
  seguro_carga_empresa: {
    aseguradora?: string;
    numero_poliza?: string;
    vigencia_desde?: string;
    vigencia_hasta?: string;
  };
  seguro_ambiental_empresa: {
    aseguradora?: string;
    numero_poliza?: string;
    vigencia_desde?: string;
    vigencia_hasta?: string;
  };
  // Permisos SCT
  permisos_sct_empresa: any[];
  // Timbrado
  proveedor_timbrado: string;
  modo_pruebas: boolean;
}

export function ConfiguracionOperativaForm() {
  const { configuracion, isSaving, guardarConfiguracion } = useConfiguracionEmpresarial();

  const form = useForm<ConfiguracionOperativa>({
    defaultValues: {
      seguro_resp_civil_empresa: configuracion?.seguro_resp_civil_empresa || {},
      seguro_carga_empresa: configuracion?.seguro_carga_empresa || {},
      seguro_ambiental_empresa: configuracion?.seguro_ambiental_empresa || {},
      permisos_sct_empresa: configuracion?.permisos_sct_empresa || [],
      proveedor_timbrado: configuracion?.proveedor_timbrado || 'interno',
      modo_pruebas: configuracion?.modo_pruebas ?? true
    }
  });

  const onSubmit = async (data: ConfiguracionOperativa) => {
    try {
      await guardarConfiguracion(data);
      form.reset(data);
    } catch (error) {
      console.error('Error al guardar configuración operativa:', error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Configuración de Timbrado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Timbrado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proveedor_timbrado">Proveedor de Timbrado</Label>
              <Input
                id="proveedor_timbrado"
                {...form.register('proveedor_timbrado')}
                placeholder="interno"
                readOnly
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                Por ahora solo está disponible el timbrado interno
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modo_pruebas">Modo de Pruebas</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="modo_pruebas"
                  checked={form.watch('modo_pruebas')}
                  onCheckedChange={(checked) => form.setValue('modo_pruebas', checked)}
                />
                <span className="text-sm text-gray-600">
                  {form.watch('modo_pruebas') ? 'Activado' : 'Desactivado'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                En modo pruebas, los documentos no tienen validez fiscal
              </p>
            </div>
          </div>

          {form.watch('modo_pruebas') && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Los documentos generados en modo pruebas NO tienen validez fiscal ante el SAT
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seguros Empresariales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Seguros Empresariales por Defecto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seguro de Responsabilidad Civil */}
          <div className="space-y-4">
            <h4 className="font-medium">Seguro de Responsabilidad Civil</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Aseguradora</Label>
                <Input
                  {...form.register('seguro_resp_civil_empresa.aseguradora')}
                  placeholder="Nombre de la aseguradora"
                />
              </div>
              <div className="space-y-2">
                <Label>Número de Póliza</Label>
                <Input
                  {...form.register('seguro_resp_civil_empresa.numero_poliza')}
                  placeholder="POL-123456"
                />
              </div>
              <div className="space-y-2">
                <Label>Vigencia Desde</Label>
                <Input
                  type="date"
                  {...form.register('seguro_resp_civil_empresa.vigencia_desde')}
                />
              </div>
              <div className="space-y-2">
                <Label>Vigencia Hasta</Label>
                <Input
                  type="date"
                  {...form.register('seguro_resp_civil_empresa.vigencia_hasta')}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Seguro de Carga */}
          <div className="space-y-4">
            <h4 className="font-medium">Seguro de Carga</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Aseguradora</Label>
                <Input
                  {...form.register('seguro_carga_empresa.aseguradora')}
                  placeholder="Nombre de la aseguradora"
                />
              </div>
              <div className="space-y-2">
                <Label>Número de Póliza</Label>
                <Input
                  {...form.register('seguro_carga_empresa.numero_poliza')}
                  placeholder="POL-789012"
                />
              </div>
              <div className="space-y-2">
                <Label>Vigencia Desde</Label>
                <Input
                  type="date"
                  {...form.register('seguro_carga_empresa.vigencia_desde')}
                />
              </div>
              <div className="space-y-2">
                <Label>Vigencia Hasta</Label>
                <Input
                  type="date"
                  {...form.register('seguro_carga_empresa.vigencia_hasta')}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Seguro de Medio Ambiente */}
          <div className="space-y-4">
            <h4 className="font-medium">Seguro de Medio Ambiente</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Aseguradora</Label>
                <Input
                  {...form.register('seguro_ambiental_empresa.aseguradora')}
                  placeholder="Nombre de la aseguradora"
                />
              </div>
              <div className="space-y-2">
                <Label>Número de Póliza</Label>
                <Input
                  {...form.register('seguro_ambiental_empresa.numero_poliza')}
                  placeholder="POL-345678"
                />
              </div>
              <div className="space-y-2">
                <Label>Vigencia Desde</Label>
                <Input
                  type="date"
                  {...form.register('seguro_ambiental_empresa.vigencia_desde')}
                />
              </div>
              <div className="space-y-2">
                <Label>Vigencia Hasta</Label>
                <Input
                  type="date"
                  {...form.register('seguro_ambiental_empresa.vigencia_hasta')}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permisos SCT Empresariales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Permisos SCT Empresariales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Truck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>La gestión de permisos SCT se implementará en una versión posterior</p>
            <p className="text-sm">Por ahora, configure los permisos individualmente por vehículo</p>
          </div>
        </CardContent>
      </Card>

      {/* Botón de Guardar */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </form>
  );
}
