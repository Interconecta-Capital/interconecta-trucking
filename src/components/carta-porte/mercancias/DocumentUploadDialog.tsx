import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DocumentProcessor } from '@/services/documentProcessor';
import type { ProcessingProgress } from '@/services/documentProcessor';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  X 
} from 'lucide-react';

interface MercanciaProcessed {
  id: string;
  descripcion: string;
  bienes_transp: string;
  clave_unidad: string;
  cantidad: number;
  peso_kg: number;
  valor_mercancia: number;
  material_peligroso: boolean;
  moneda: string;
  cve_material_peligroso?: string;
  embalaje?: string;
  fraccion_arancelaria?: string;
  uuid_comercio_ext?: string;
}

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentProcessed: (mercancias: MercanciaProcessed[]) => void;
  cartaPorteId?: string;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  onDocumentProcessed,
  cartaPorteId
}: DocumentUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/xml': ['.xml'],
      'text/xml': ['.xml'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const processDocument = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    setProgress({ stage: 'detection', progress: 0, message: 'Iniciando procesamiento...' });

    try {
      const result = await DocumentProcessor.processDocument(
        file,
        (progressUpdate) => {
          setProgress(progressUpdate);
        },
        {
          cartaPorteId,
          metadata: {
            extractMercancias: true
          }
        }
      );

      if (result.success && result.data) {
        // Mapear los datos procesados al formato esperado
        const mercanciasProcessed: MercanciaProcessed[] = result.data.map((item: any, index: number) => ({
          id: `imported-${Date.now()}-${index}`,
          descripcion: item.descripcion || item.description || '',
          bienes_transp: item.bienes_transp || item.clave_sat || item.producto_servicio || '',
          clave_unidad: item.clave_unidad || item.unidad || 'KGM',
          cantidad: parseFloat(item.cantidad || item.quantity || '1') || 1,
          peso_kg: parseFloat(item.peso_kg || item.peso || item.weight || '1') || 1,
          valor_mercancia: parseFloat(item.valor_mercancia || item.valor || item.value || '0') || 0,
          material_peligroso: Boolean(item.material_peligroso || item.peligroso || false),
          moneda: item.moneda || item.currency || 'MXN',
          cve_material_peligroso: item.cve_material_peligroso || item.material_peligroso_clave || undefined,
          embalaje: item.embalaje || item.packaging || undefined,
          fraccion_arancelaria: item.fraccion_arancelaria || item.fraccion || undefined,
          uuid_comercio_ext: item.uuid_comercio_ext || undefined
        }));

        setResult({
          success: true,
          mercancias: mercanciasProcessed,
          extractedCount: mercanciasProcessed.length,
          confidence: result.confidence || 85
        });
      } else {
        setError(result.errors?.join(', ') || 'Error procesando el documento');
      }
    } catch (err) {
      console.error('Error processing document:', err);
      setError('Error inesperado al procesar el documento');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (result?.mercancias) {
      onDocumentProcessed(result.mercancias);
      handleClose();
    }
  };

  const handleClose = () => {
    setFile(null);
    setIsProcessing(false);
    setProgress(null);
    setResult(null);
    setError(null);
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Importar Mercancías desde Documento
          </DialogTitle>
          <DialogDescription>
            Carga un archivo PDF, Excel, CSV, XML o imagen para extraer automáticamente las mercancías
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!file && !result && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2">
                {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta un documento'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                o haz clic para seleccionar
              </p>
              <p className="text-xs text-muted-foreground">
                Soportado: PDF, Excel (.xlsx, .xls), CSV, XML, Imágenes (máx. 10MB)
              </p>
            </div>
          )}

          {file && !result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFile(null)}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {isProcessing && progress && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>{progress.message}</span>
                    <span>{Math.round(progress.progress)}%</span>
                  </div>
                  <Progress value={progress.progress} />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Procesamiento completado</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Mercancías encontradas:</span>
                        <span className="ml-2 font-medium">{result.extractedCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confianza:</span>
                        <span className="ml-2 font-medium">{result.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {result.mercancias?.length > 0 && (
                <div className="max-h-64 overflow-y-auto border rounded-lg">
                  <div className="p-4 space-y-3">
                    <p className="font-medium text-sm">Vista previa de mercancías:</p>
                    {result.mercancias.slice(0, 3).map((mercancia: MercanciaProcessed, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded border-l-4 border-l-blue-500">
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">{mercancia.descripcion}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <span>Cantidad: {mercancia.cantidad}</span>
                            <span>Peso: {mercancia.peso_kg} kg</span>
                            <span>SAT: {mercancia.bienes_transp}</span>
                            <span>Unidad: {mercancia.clave_unidad}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {result.mercancias.length > 3 && (
                      <p className="text-sm text-muted-foreground text-center">
                        ... y {result.mercancias.length - 3} mercancías más
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          
          {file && !result && !isProcessing && (
            <Button onClick={processDocument}>
              Procesar Documento
            </Button>
          )}
          
          {result && result.mercancias?.length > 0 && (
            <Button onClick={handleImport}>
              Importar {result.extractedCount} Mercancías
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
