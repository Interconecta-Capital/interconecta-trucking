
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Upload, 
  File, 
  Edit3
} from 'lucide-react';

interface FlujoCargaSelectorProps {
  tipoCreacion: 'plantilla' | 'carga' | 'manual';
  onTipoChange: (tipo: 'plantilla' | 'carga' | 'manual') => void;
  onShowPlantillas: () => void;
  onShowDocumentUpload: () => void;
}

export function FlujoCargaSelector({ 
  tipoCreacion, 
  onTipoChange, 
  onShowPlantillas, 
  onShowDocumentUpload 
}: FlujoCargaSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Flujo de Inicio Inteligente</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className={`cursor-pointer transition-all border-2 ${
              tipoCreacion === 'plantilla' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => {
              onTipoChange('plantilla');
              onShowPlantillas();
            }}
          >
            <CardContent className="p-4 text-center">
              <File className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Usar Plantilla</h3>
              <p className="text-sm text-gray-600">Partir de una plantilla guardada</p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all border-2 ${
              tipoCreacion === 'carga' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => {
              onTipoChange('carga');
              onShowDocumentUpload();
            }}
          >
            <CardContent className="p-4 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Carga de Origen</h3>
              <p className="text-sm text-gray-600">Cargar desde PDF, XML o Excel</p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all border-2 ${
              tipoCreacion === 'manual' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onTipoChange('manual')}
          >
            <CardContent className="p-4 text-center">
              <Edit3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">Creación Manual</h3>
              <p className="text-sm text-gray-600">Crear desde cero</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
