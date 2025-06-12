
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DocumentUploadDialog } from './mercancias/DocumentUploadDialog';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  ArrowRight, 
  Building, 
  Truck,
  FileSpreadsheet,
  FileImage
} from 'lucide-react';

interface ConfiguracionInicialProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}

export function ConfiguracionInicial({ data, onChange, onNext }: ConfiguracionInicialProps) {
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleDocumentProcessed = async (extractedData: any) => {
    // Aplicar los datos extraídos del documento
    onChange({ ...data, ...extractedData });
    setShowDocumentDialog(false);
  };

  const isFormValid = () => {
    return data.rfcEmisor && 
           data.nombreEmisor && 
           data.rfcReceptor && 
           data.nombreReceptor;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Configuración Inicial de Carta Porte</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Flujo de Inicio Inteligente */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              Flujo de Inicio Inteligente
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              Acelera la creación importando datos desde documentos existentes
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDocumentDialog(true)}
                className="flex items-center justify-center space-x-2 h-20 flex-col border-blue-300 hover:bg-blue-100"
              >
                <Upload className="h-6 w-6 text-blue-600" />
                <div className="text-center">
                  <div className="font-medium text-blue-800">Carga de Origen</div>
                  <div className="text-xs text-blue-600">PDF, XML, Excel</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 h-20 flex-col border-gray-300"
                disabled
              >
                <FileText className="h-6 w-6 text-gray-400" />
                <div className="text-center">
                  <div className="font-medium text-gray-600">Plantilla</div>
                  <div className="text-xs text-gray-500">Próximamente</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 h-20 flex-col border-gray-300"
                disabled
              >
                <Truck className="h-6 w-6 text-gray-400" />
                <div className="text-center">
                  <div className="font-medium text-gray-600">Ruta Guardada</div>
                  <div className="text-xs text-gray-500">Próximamente</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Formulario Manual */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Datos del Emisor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rfcEmisor">RFC Emisor *</Label>
                  <Input
                    id="rfcEmisor"
                    value={data.rfcEmisor || ''}
                    onChange={(e) => handleInputChange('rfcEmisor', e.target.value.toUpperCase())}
                    placeholder="ABC123456789"
                    maxLength={13}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nombreEmisor">Nombre/Razón Social Emisor *</Label>
                  <Input
                    id="nombreEmisor"
                    value={data.nombreEmisor || ''}
                    onChange={(e) => handleInputChange('nombreEmisor', e.target.value)}
                    placeholder="Nombre del emisor"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Datos del Receptor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rfcReceptor">RFC Receptor *</Label>
                  <Input
                    id="rfcReceptor"
                    value={data.rfcReceptor || ''}
                    onChange={(e) => handleInputChange('rfcReceptor', e.target.value.toUpperCase())}
                    placeholder="XYZ987654321"
                    maxLength={13}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nombreReceptor">Nombre/Razón Social Receptor *</Label>
                  <Input
                    id="nombreReceptor"
                    value={data.nombreReceptor || ''}
                    onChange={(e) => handleInputChange('nombreReceptor', e.target.value)}
                    placeholder="Nombre del receptor"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Configuración del Transporte</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoTransporte">Tipo de Transporte</Label>
                  <Select 
                    value={data.tipoTransporte || ''} 
                    onValueChange={(value) => handleInputChange('tipoTransporte', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="autotransporte">Autotransporte Federal</SelectItem>
                      <SelectItem value="maritimo">Marítimo</SelectItem>
                      <SelectItem value="aereo">Aéreo</SelectItem>
                      <SelectItem value="ferroviario">Ferroviario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoServicio">Tipo de Servicio</Label>
                  <Select 
                    value={data.tipoServicio || ''} 
                    onValueChange={(value) => handleInputChange('tipoServicio', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carga">Carga</SelectItem>
                      <SelectItem value="pasajeros">Pasajeros</SelectItem>
                      <SelectItem value="mixto">Mixto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modalidadTransporte">Modalidad</Label>
                  <Select 
                    value={data.modalidadTransporte || ''} 
                    onValueChange={(value) => handleInputChange('modalidadTransporte', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nacional">Nacional</SelectItem>
                      <SelectItem value="internacional">Internacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button 
              onClick={onNext} 
              disabled={!isFormValid()}
              className="flex items-center space-x-2"
            >
              <span>Continuar a Ubicaciones</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de carga de documentos */}
      <DocumentUploadDialog
        open={showDocumentDialog}
        onOpenChange={setShowDocumentDialog}
        onDocumentProcessed={handleDocumentProcessed}
      />
    </div>
  );
}
