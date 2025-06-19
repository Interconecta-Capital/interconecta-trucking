
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Upload, Users } from 'lucide-react';
import { PlantillasSelector } from '../../plantillas/PlantillasSelector';
import { DocumentUploadDialog } from '../../mercancias/DocumentUploadDialog';
import { useState } from 'react';

interface ConfiguracionGeneralSectionProps {
  data: any;
  onChange: (data: any) => void;
}

export function ConfiguracionGeneralSection({ data, onChange }: ConfiguracionGeneralSectionProps) {
  const [showPlantillas, setShowPlantillas] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  const handleFieldChange = (field: string, value: string | boolean) => {
    onChange({ [field]: value });
  };

  const isTransporteInternacional = data?.transporteInternacional === 'Sí' || data?.transporteInternacional === true;

  return (
    <div className="space-y-6">
      {/* Opciones de Carga Rápida */}
      <Card>
        <CardHeader>
          <CardTitle>Opciones de Carga Rápida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setShowPlantillas(true)}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Cargar desde Plantilla
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDocumentUpload(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Cargar desde Archivo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Información del Emisor */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Emisor</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rfcEmisor">RFC Emisor *</Label>
            <Input
              id="rfcEmisor"
              value={data?.rfcEmisor || ''}
              onChange={(e) => handleFieldChange('rfcEmisor', e.target.value)}
              placeholder="RFC del emisor"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombreEmisor">Nombre / Razón Social *</Label>
            <Input
              id="nombreEmisor"
              value={data?.nombreEmisor || ''}
              onChange={(e) => handleFieldChange('nombreEmisor', e.target.value)}
              placeholder="Nombre o razón social del emisor"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="regimenFiscalEmisor">Régimen Fiscal</Label>
            <Select
              value={data?.regimenFiscalEmisor || ''}
              onValueChange={(value) => handleFieldChange('regimenFiscalEmisor', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar régimen fiscal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="601">General de Ley Personas Morales</SelectItem>
                <SelectItem value="612">Personas Físicas con Actividades Empresariales</SelectItem>
                <SelectItem value="621">Incorporación Fiscal</SelectItem>
                <SelectItem value="626">Régimen Simplificado de Confianza</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Información del Receptor */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Receptor</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rfcReceptor">RFC Receptor *</Label>
            <Input
              id="rfcReceptor"
              value={data?.rfcReceptor || ''}
              onChange={(e) => handleFieldChange('rfcReceptor', e.target.value)}
              placeholder="RFC del receptor"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombreReceptor">Nombre / Razón Social *</Label>
            <Input
              id="nombreReceptor"
              value={data?.nombreReceptor || ''}
              onChange={(e) => handleFieldChange('nombreReceptor', e.target.value)}
              placeholder="Nombre o razón social del receptor"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="usoCfdi">Uso de CFDI</Label>
            <Select
              value={data?.usoCfdi || ''}
              onValueChange={(value) => handleFieldChange('usoCfdi', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar uso de CFDI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="G01">Adquisición de mercancías</SelectItem>
                <SelectItem value="G02">Devoluciones, descuentos o bonificaciones</SelectItem>
                <SelectItem value="G03">Gastos en general</SelectItem>
                <SelectItem value="S01">Sin efectos fiscales</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Configuración del CFDI */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración del CFDI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoCfdi">Tipo de CFDI</Label>
              <Select
                value={data?.tipoCfdi || 'Traslado'}
                onValueChange={(value) => handleFieldChange('tipoCfdi', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Traslado">Traslado</SelectItem>
                  <SelectItem value="Ingreso">Ingreso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cartaPorteVersion">Versión Carta Porte</Label>
              <Select
                value={data?.cartaPorteVersion || '3.1'}
                onValueChange={(value) => handleFieldChange('cartaPorteVersion', value)}
                disabled
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3.1">3.1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Opciones Especiales */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="transporte-internacional"
                checked={isTransporteInternacional}
                onCheckedChange={(checked) => handleFieldChange('transporteInternacional', checked ? 'Sí' : 'No')}
              />
              <Label htmlFor="transporte-internacional">
                Transporte Internacional
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="registro-istmo"
                checked={!!data?.registroIstmo}
                onCheckedChange={(checked) => handleFieldChange('registroIstmo', checked)}
              />
              <Label htmlFor="registro-istmo">
                Registro Istmo
              </Label>
            </div>
          </div>

          {/* Campos para Transporte Internacional */}
          {isTransporteInternacional && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="entradaSalidaMerc">Entrada/Salida de Mercancías</Label>
                <Select
                  value={data?.entradaSalidaMerc || ''}
                  onValueChange={(value) => handleFieldChange('entradaSalidaMerc', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entrada">Entrada</SelectItem>
                    <SelectItem value="Salida">Salida</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="viaTransporte">Vía de Transporte</Label>
                <Select
                  value={data?.viaTransporte || ''}
                  onValueChange={(value) => handleFieldChange('viaTransporte', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">Autotransporte</SelectItem>
                    <SelectItem value="02">Marítimo</SelectItem>
                    <SelectItem value="03">Aéreo</SelectItem>
                    <SelectItem value="04">Ferroviario</SelectItem>
                    <SelectItem value="05">Ducto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paisOrigenDestino">País de Origen/Destino</Label>
                <Select
                  value={data?.pais_origen_destino || ''}
                  onValueChange={(value) => handleFieldChange('pais_origen_destino', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un país..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USA">Estados Unidos</SelectItem>
                    <SelectItem value="CAN">Canadá</SelectItem>
                    <SelectItem value="GTM">Guatemala</SelectItem>
                    <SelectItem value="BLZ">Belice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="viaEntradaSalida">Vía de Entrada/Salida</Label>
                <Select
                  value={data?.via_entrada_salida || ''}
                  onValueChange={(value) => handleFieldChange('via_entrada_salida', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">Terrestre</SelectItem>
                    <SelectItem value="02">Marítima</SelectItem>
                    <SelectItem value="03">Aérea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showPlantillas && (
        <PlantillasSelector
          onSelectPlantilla={(plantilla) => {
            onChange({
              rfcEmisor: plantilla.rfc_emisor,
              nombreEmisor: plantilla.nombre_emisor,
              rfcReceptor: plantilla.rfc_receptor,
              nombreReceptor: plantilla.nombre_receptor,
              tipoCfdi: plantilla.tipo_cfdi,
              transporteInternacional: plantilla.transporte_internacional,
              registroIstmo: plantilla.registro_istmo,
              cartaPorteVersion: plantilla.carta_porte_version || '3.1'
            });
            setShowPlantillas(false);
          }}
          onClose={() => setShowPlantillas(false)}
        />
      )}

      {showDocumentUpload && (
        <DocumentUploadDialog
          open={showDocumentUpload}
          onOpenChange={setShowDocumentUpload}
          onDocumentProcessed={(mercancias) => {
            if (Array.isArray(mercancias) && mercancias.length > 0) {
              // Esto se manejará en el hook principal del formulario
              console.log('Mercancías cargadas:', mercancias);
            }
            setShowDocumentUpload(false);
          }}
        />
      )}
    </div>
  );
}
