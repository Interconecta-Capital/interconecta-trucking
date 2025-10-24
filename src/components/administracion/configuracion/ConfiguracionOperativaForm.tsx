import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Save, Settings, Shield, Cloud, Loader2, AlertTriangle } from 'lucide-react';
import { useConfiguracionEmpresarial } from '@/hooks/useConfiguracionEmpresarial';
import { toast } from 'sonner';

export function ConfiguracionOperativaForm() {
  const { configuracion, isSaving, guardarConfiguracion } = useConfiguracionEmpresarial();
  
  const [formData, setFormData] = useState({
    // Seguros
    seguroRespCivilPoliza: '',
    seguroRespCivilAseguradora: '',
    seguroCargaPoliza: '',
    seguroCargaAseguradora: '',
    seguroAmbientalPoliza: '',
    seguroAmbientalAseguradora: '',
    // Timbrado
    proveedorTimbrado: 'fiscal_api',
    modoPruebas: true,
  });

  // Cargar datos de configuración al iniciar
  useEffect(() => {
    if (configuracion) {
      setFormData({
        seguroRespCivilPoliza: configuracion.seguro_resp_civil_empresa?.poliza || '',
        seguroRespCivilAseguradora: configuracion.seguro_resp_civil_empresa?.aseguradora || '',
        seguroCargaPoliza: configuracion.seguro_carga_empresa?.poliza || '',
        seguroCargaAseguradora: configuracion.seguro_carga_empresa?.aseguradora || '',
        seguroAmbientalPoliza: configuracion.seguro_ambiental_empresa?.poliza || '',
        seguroAmbientalAseguradora: configuracion.seguro_ambiental_empresa?.aseguradora || '',
        proveedorTimbrado: configuracion.proveedor_timbrado || 'fiscal_api',
        modoPruebas: configuracion.modo_pruebas !== false,
      });
    }
  }, [configuracion]);

  const handleGuardar = async () => {
    console.log('💾 [ConfiguracionOperativaForm] Guardando seguros...');
    try {
      // Validar que seguros opcionales no se guarden vacíos
      const seguroRespCivil = formData.seguroRespCivilPoliza.trim() || formData.seguroRespCivilAseguradora.trim()
        ? {
            poliza: formData.seguroRespCivilPoliza.trim(),
            aseguradora: formData.seguroRespCivilAseguradora.trim()
          }
        : null;
        
      const seguroCarga = formData.seguroCargaPoliza.trim() || formData.seguroCargaAseguradora.trim()
        ? {
            poliza: formData.seguroCargaPoliza.trim(),
            aseguradora: formData.seguroCargaAseguradora.trim()
          }
        : null;
        
      const seguroAmbiental = formData.seguroAmbientalPoliza.trim() || formData.seguroAmbientalAseguradora.trim()
        ? {
            poliza: formData.seguroAmbientalPoliza.trim(),
            aseguradora: formData.seguroAmbientalAseguradora.trim()
          }
        : null;
      
      await guardarConfiguracion({
        seguro_resp_civil_empresa: seguroRespCivil,
        seguro_carga_empresa: seguroCarga,
        seguro_ambiental_empresa: seguroAmbiental,
        proveedor_timbrado: formData.proveedorTimbrado,
        modo_pruebas: formData.modoPruebas,
      });
      
      console.log('✅ [ConfiguracionOperativaForm] Seguros guardados exitosamente');
    } catch (error) {
      console.error('❌ [ConfiguracionOperativaForm] Error guardando configuración:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Advertencia Legal sobre Validación de Seguros */}
      <Alert variant="default" className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-900 dark:text-amber-100">Validación de Seguros</AlertTitle>
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          El sistema NO valida si las pólizas son reales o vigentes. 
          Usted es responsable de proporcionar información verídica y vigente. 
          El uso de datos falsos puede resultar en sanciones del SAT.
        </AlertDescription>
      </Alert>
      
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
              <Label>Seguro de Responsabilidad Civil *</Label>
              <Input 
                placeholder="Número de póliza" 
                value={formData.seguroRespCivilPoliza}
                onChange={(e) => setFormData({ ...formData, seguroRespCivilPoliza: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Aseguradora *</Label>
              <Input 
                placeholder="Nombre de la aseguradora" 
                value={formData.seguroRespCivilAseguradora}
                onChange={(e) => setFormData({ ...formData, seguroRespCivilAseguradora: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Seguro de Carga</Label>
              <Input 
                placeholder="Número de póliza" 
                value={formData.seguroCargaPoliza}
                onChange={(e) => setFormData({ ...formData, seguroCargaPoliza: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Aseguradora</Label>
              <Input 
                placeholder="Nombre de la aseguradora" 
                value={formData.seguroCargaAseguradora}
                onChange={(e) => setFormData({ ...formData, seguroCargaAseguradora: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Seguro Ambiental</Label>
              <Input 
                placeholder="Número de póliza" 
                value={formData.seguroAmbientalPoliza}
                onChange={(e) => setFormData({ ...formData, seguroAmbientalPoliza: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Aseguradora</Label>
              <Input 
                placeholder="Nombre de la aseguradora" 
                value={formData.seguroAmbientalAseguradora}
                onChange={(e) => setFormData({ ...formData, seguroAmbientalAseguradora: e.target.value })}
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            * El seguro de responsabilidad civil es obligatorio para Carta Porte SAT 3.1
          </p>
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
              <Select 
                value={formData.proveedorTimbrado}
                onValueChange={(value) => setFormData({ ...formData, proveedorTimbrado: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fiscal_api">FISCAL API</SelectItem>
                  <SelectItem value="external">PAC Externo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="modo-pruebas" 
                checked={formData.modoPruebas}
                onCheckedChange={(checked) => setFormData({ ...formData, modoPruebas: checked })}
              />
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
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Configuraciones operativas adicionales en desarrollo</p>
            <p className="text-sm">Próximamente: permisos SCT, configuraciones avanzadas</p>
          </div>
        </CardContent>
      </Card>

      {/* Botón de Guardar */}
      <div className="flex justify-end">
        <Button 
          className="flex items-center gap-2"
          onClick={handleGuardar}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar Configuración
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
