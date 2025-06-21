
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, Settings, Shield, Cloud } from 'lucide-react';

export function ConfiguracionOperativaForm() {
  return (
    <div className="space-y-6">
      {/* Configuración de Seguros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Seguros Empresariales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Seguro de Responsabilidad Civil</Label>
              <Input placeholder="Número de póliza" />
            </div>
            <div className="space-y-2">
              <Label>Aseguradora</Label>
              <Input placeholder="Nombre de la aseguradora" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Seguro de Carga</Label>
              <Input placeholder="Número de póliza" />
            </div>
            <div className="space-y-2">
              <Label>Aseguradora</Label>
              <Input placeholder="Nombre de la aseguradora" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Timbrado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Configuración de Timbrado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Proveedor de Timbrado</Label>
              <Select defaultValue="interno">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interno">PAC Interno</SelectItem>
                  <SelectItem value="external">PAC Externo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="modo-pruebas" defaultChecked />
              <Label htmlFor="modo-pruebas">Modo de Pruebas</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Configuraciones operativas adicionales en desarrollo</p>
            <p className="text-sm">Próximamente: permisos SCT, configuraciones avanzadas</p>
          </div>
        </CardContent>
      </Card>

      {/* Botón de Guardar */}
      <div className="flex justify-end">
        <Button className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
}
