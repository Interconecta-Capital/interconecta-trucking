
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Camera, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataExtracted: (data: any[]) => void;
}

export function DocumentUploadDialog({ 
  open, 
  onOpenChange, 
  onDataExtracted 
}: DocumentUploadDialogProps) {
  const [processing, setProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    },
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(rejection => {
        toast.error(`Archivo ${rejection.file.name} no es válido`);
      });
    }
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processDocuments = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Por favor selecciona al menos un archivo');
      return;
    }

    setProcessing(true);
    
    try {
      // Simulate document processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock extracted data - in real implementation this would process the files
      const extractedData = [
        {
          bienes_transp: '10101504',
          descripcion: 'Producto extraído del documento',
          cantidad: 100,
          clave_unidad: 'KGM',
          peso_kg: 150,
          valor_mercancia: 5000,
          material_peligroso: false
        }
      ];

      onDataExtracted(extractedData);
      onOpenChange(false);
      setUploadedFiles([]);
      toast.success('Documentos procesados exitosamente');
      
    } catch (error) {
      console.error('Error processing documents:', error);
      toast.error('Error al procesar los documentos');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Subir Documentos de Mercancías
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <Card>
            <CardContent className="p-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      {isDragActive 
                        ? 'Suelta los archivos aquí' 
                        : 'Arrastra archivos o haz clic para seleccionar'
                      }
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Soporta: PDF, Excel, imágenes (PNG, JPG, WEBP)
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Máximo 5 archivos
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Archivos seleccionados:</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-medium text-blue-800 mb-2">¿Qué se puede extraer?</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Códigos de productos y servicios</li>
                <li>• Descripciones de mercancías</li>
                <li>• Cantidades y unidades de medida</li>
                <li>• Pesos y valores</li>
                <li>• Información de embalaje</li>
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={processing}
            >
              Cancelar
            </Button>
            <Button 
              onClick={processDocuments}
              disabled={uploadedFiles.length === 0 || processing}
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                'Procesar Documentos'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
