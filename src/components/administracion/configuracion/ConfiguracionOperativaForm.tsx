import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Save, Settings, Shield, Cloud, Loader2, AlertTriangle, Info, CheckCircle2, HelpCircle, FileText } from 'lucide-react';
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
    // Documentos Fiscales
    serieFactura: 'F',
    folioInicialFactura: 1,
    serieCartaPorte: 'CP',
    folioInicialCartaPorte: 1,
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
        serieFactura: (configuracion as any).serie_factura || 'F',
        folioInicialFactura: (configuracion as any).folio_inicial_factura || 1,
        serieCartaPorte: (configuracion as any).serie_carta_porte || 'CP',
        folioInicialCartaPorte: (configuracion as any).folio_inicial_carta_porte || 1,
      });
    }
  }, [configuracion]);

  const handleGuardar = async () => {
    console.log('💾 [ConfiguracionOperativaForm] Guardando seguros...');
    
    // ✅ FASE 6.2: Validación PRE-guardado para seguros
    console.log('🔍 [VALIDACIÓN] Verificando seguros obligatorios...');
    
    // Validar seguro de responsabilidad civil (OBLIGATORIO)
    if (!formData.seguroRespCivilPoliza.trim() && !formData.seguroRespCivilAseguradora.trim()) {
      console.error('❌ [VALIDACIÓN] Seguro de Resp. Civil está vacío (OBLIGATORIO)');
      toast.error('El Seguro de Responsabilidad Civil es obligatorio');
      return;
    }
    
    if (formData.seguroRespCivilPoliza.trim() && !formData.seguroRespCivilAseguradora.trim()) {
      console.error('❌ [VALIDACIÓN] Falta aseguradora del seguro de Resp. Civil');
      toast.error('Debe especificar la aseguradora del seguro de Responsabilidad Civil');
      return;
    }
    
    if (!formData.seguroRespCivilPoliza.trim() && formData.seguroRespCivilAseguradora.trim()) {
      console.error('❌ [VALIDACIÓN] Falta póliza del seguro de Resp. Civil');
      toast.error('Debe especificar el número de póliza del seguro de Responsabilidad Civil');
      return;
    }
    
    // Validar seguros opcionales (si tienen uno, deben tener ambos campos)
    if (formData.seguroCargaPoliza.trim() && !formData.seguroCargaAseguradora.trim()) {
      console.error('❌ [VALIDACIÓN] Falta aseguradora del seguro de Carga');
      toast.error('Si ingresa póliza de seguro de Carga, debe especificar la aseguradora');
      return;
    }
    
    if (!formData.seguroCargaPoliza.trim() && formData.seguroCargaAseguradora.trim()) {
      console.error('❌ [VALIDACIÓN] Falta póliza del seguro de Carga');
      toast.error('Si ingresa aseguradora de seguro de Carga, debe especificar la póliza');
      return;
    }
    
    if (formData.seguroAmbientalPoliza.trim() && !formData.seguroAmbientalAseguradora.trim()) {
      console.error('❌ [VALIDACIÓN] Falta aseguradora del seguro Ambiental');
      toast.error('Si ingresa póliza de seguro Ambiental, debe especificar la aseguradora');
      return;
    }
    
    if (!formData.seguroAmbientalPoliza.trim() && formData.seguroAmbientalAseguradora.trim()) {
      console.error('❌ [VALIDACIÓN] Falta póliza del seguro Ambiental');
      toast.error('Si ingresa aseguradora de seguro Ambiental, debe especificar la póliza');
      return;
    }
    
    console.log('✅ [VALIDACIÓN] Todas las validaciones de seguros pasadas');
    
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
        ...(formData.serieFactura && { serie_factura: formData.serieFactura }),
        ...(formData.folioInicialFactura && { folio_inicial_factura: formData.folioInicialFactura }),
        ...(formData.serieCartaPorte && { serie_carta_porte: formData.serieCartaPorte }),
        ...(formData.folioInicialCartaPorte && { folio_inicial_carta_porte: formData.folioInicialCartaPorte }),
      } as any);
      
      console.log('✅ [ConfiguracionOperativaForm] Seguros guardados exitosamente');
    } catch (error) {
      console.error('❌ [ConfiguracionOperativaForm] Error guardando configuración:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuración de Seguros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Seguros Empresariales
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                  <Info className="h-4 w-4 text-muted-foreground hover:text-warning" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Validación de Seguros
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    El sistema NO valida si las pólizas son reales o vigentes. 
                    Usted es responsable de proporcionar información verídica.
                  </p>
                  <Alert className="border-warning/50 bg-warning/10">
                    <AlertDescription className="text-xs">
                      ⚠️ El uso de datos falsos puede resultar en sanciones del SAT.
                    </AlertDescription>
                  </Alert>
                </div>
              </PopoverContent>
            </Popover>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seguro de Responsabilidad Civil - OBLIGATORIO */}
          <div className="space-y-3 p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-2 text-base font-medium">
                Seguro de Responsabilidad Civil
                <Badge variant="destructive" className="text-xs">OBLIGATORIO</Badge>
              </Label>
              {formData.seguroRespCivilPoliza && formData.seguroRespCivilAseguradora && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Número de Póliza *</Label>
                <Input 
                  placeholder="Número de póliza" 
                  value={formData.seguroRespCivilPoliza}
                  onChange={(e) => setFormData({ ...formData, seguroRespCivilPoliza: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Aseguradora *</Label>
                <Input 
                  placeholder="Nombre de la aseguradora" 
                  value={formData.seguroRespCivilAseguradora}
                  onChange={(e) => setFormData({ ...formData, seguroRespCivilAseguradora: e.target.value })}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Requerido por el SAT para Carta Porte 3.1
            </p>
          </div>
          
          {/* Seguro de Carga - RECOMENDADO */}
          <div className="space-y-3 p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-2 text-base font-medium">
                Seguro de Carga
                <Badge variant="secondary" className="text-xs">RECOMENDADO</Badge>
                <Popover>
                  <PopoverTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </PopoverTrigger>
                  <PopoverContent className="w-64 text-xs">
                    Recomendado para protección de mercancías de alto valor. 
                    NO es obligatorio para crear viajes.
                  </PopoverContent>
                </Popover>
              </Label>
              {formData.seguroCargaPoliza && formData.seguroCargaAseguradora && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Número de Póliza</Label>
                <Input 
                  placeholder="Número de póliza" 
                  value={formData.seguroCargaPoliza}
                  onChange={(e) => setFormData({ ...formData, seguroCargaPoliza: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Aseguradora</Label>
                <Input 
                  placeholder="Nombre de la aseguradora" 
                  value={formData.seguroCargaAseguradora}
                  onChange={(e) => setFormData({ ...formData, seguroCargaAseguradora: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Seguro Ambiental - RECOMENDADO */}
          <div className="space-y-3 p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-2 text-base font-medium">
                Seguro Ambiental
                <Badge variant="secondary" className="text-xs">RECOMENDADO</Badge>
                <Popover>
                  <PopoverTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </PopoverTrigger>
                  <PopoverContent className="w-64 text-xs">
                    Recomendado para transporte de sustancias peligrosas. 
                    NO es obligatorio para crear viajes.
                  </PopoverContent>
                </Popover>
              </Label>
              {formData.seguroAmbientalPoliza && formData.seguroAmbientalAseguradora && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Número de Póliza</Label>
                <Input 
                  placeholder="Número de póliza" 
                  value={formData.seguroAmbientalPoliza}
                  onChange={(e) => setFormData({ ...formData, seguroAmbientalPoliza: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Aseguradora</Label>
                <Input 
                  placeholder="Nombre de la aseguradora" 
                  value={formData.seguroAmbientalAseguradora}
                  onChange={(e) => setFormData({ ...formData, seguroAmbientalAseguradora: e.target.value })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Documentos Fiscales - FASE 2 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Configuración de Documentos Fiscales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Serie y Folio para Facturas */}
          <div className="p-4 border rounded-lg bg-card">
            <Label className="text-base font-medium mb-3 block flex items-center gap-2">
              <Badge variant="default" className="text-xs">FACTURAS</Badge>
              Serie y Folio
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Serie para Factura</Label>
                <Input 
                  placeholder="F" 
                  value={formData.serieFactura || ''}
                  onChange={(e) => setFormData({ ...formData, serieFactura: e.target.value })}
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  Máx. 10 caracteres alfanuméricos
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Folio Inicial</Label>
                <Input 
                  type="number"
                  placeholder="1" 
                  value={formData.folioInicialFactura || ''}
                  onChange={(e) => setFormData({ ...formData, folioInicialFactura: parseInt(e.target.value) || 1 })}
                  min={1}
                />
                <p className="text-xs text-muted-foreground">
                  El folio se incrementará automáticamente
                </p>
              </div>
            </div>
          </div>

          {/* Serie y Folio para Carta Porte */}
          <div className="p-4 border rounded-lg bg-card">
            <Label className="text-base font-medium mb-3 block flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">CARTA PORTE</Badge>
              Serie y Folio
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Serie para Carta Porte</Label>
                <Input 
                  placeholder="CP" 
                  value={formData.serieCartaPorte || ''}
                  onChange={(e) => setFormData({ ...formData, serieCartaPorte: e.target.value })}
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  Máx. 10 caracteres alfanuméricos
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Folio Inicial</Label>
                <Input 
                  type="number"
                  placeholder="1" 
                  value={formData.folioInicialCartaPorte || ''}
                  onChange={(e) => setFormData({ ...formData, folioInicialCartaPorte: parseInt(e.target.value) || 1 })}
                  min={1}
                />
                <p className="text-xs text-muted-foreground">
                  El folio se incrementará automáticamente
                </p>
              </div>
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
