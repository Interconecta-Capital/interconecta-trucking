
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
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Image, 
  FileSpreadsheet, 
  Upload,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Eye
} from 'lucide-react';
import { DocumentProcessor, ProcessingProgress, DocumentProcessingResult } from '@/services/documentProcessor';
import { Mercancia } from '@/hooks/useMercancias';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentProcessed: (mercancias: Mercancia[]) => void;
}

export const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  open,
  onOpenChange,
  onDocumentProcessed
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [result, setResult] = useState<DocumentProcessingResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setProgress(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/xml': ['.xml'],
      'application/xml': ['.xml'],
      'image/*': ['.jpg', '.jpeg', '.png', '.bmp', '.tiff'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const processDocument = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress({ stage: 'upload', progress: 0, message: 'Iniciando procesamiento...' });

    try {
      const result = await DocumentProcessor.processDocument(file, setProgress);
      setResult(result);
      
      if (result.success && result.data && result.data.length > 0) {
        setProgress({ 
          stage: 'complete', 
          progress: 100, 
          message: `Procesamiento completado: ${result.data.length} mercancías extraídas` 
        });
      }
    } catch (error) {
      setResult({
        success: false,
        confidence: 0,
        errors: [`Error durante el procesamiento: ${error}`]
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseResults = () => {
    if (result?.data) {
      onDocumentProcessed(result.data);
      handleClose();
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setProgress(null);
    setIsProcessing(false);
    setShowPreview(false);
    onOpenChange(false);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'xml':
        return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'bmp':
      case 'tiff':
        return <Image className="h-8 w-8 text-blue-500" />;
      default:
        return <FileSpreadsheet className="h-8 w-8 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span>Procesamiento Inteligente de Documentos</span>
          </DialogTitle>
          <DialogDescription>
            Sube PDFs, XMLs o imágenes para extraer mercancías automáticamente con IA
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {!file && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2">
                {isDragActive ? 'Suelta el documento aquí' : 'Arrastra un documento o haz clic para seleccionar'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Soportamos: PDF, XML (CFDI/CartaPorte), imágenes (JPG, PNG), Excel
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <Badge variant="outline">OCR Inteligente</Badge>
                <Badge variant="outline">Parser XML</Badge>
                <Badge variant="outline">Validación SAT</Badge>
                <Badge variant="outline">IA Gemini</Badge>
              </div>
            </div>
          )}

          {file && !result && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                {getFileIcon(file.name)}
                <div className="flex-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button variant="outline" onClick={() => setFile(null)}>
                  Cambiar
                </Button>
              </div>

              {progress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{progress.message}</span>
                    <span>{progress.progress}%</span>
                  </div>
                  <Progress value={progress.progress} />
                </div>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Resultados del Procesamiento</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? 'Éxito' : 'Error'}
                  </Badge>
                  {result.success && (
                    <Badge variant="outline" className={getConfidenceColor(result.confidence)}>
                      Confianza: {Math.round(result.confidence * 100)}%
                    </Badge>
                  )}
                </div>
              </div>

              {result.success && result.data && result.data.length > 0 && (
                <div className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center space-x-2 text-green-800 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">
                      {result.data.length} mercancías extraídas exitosamente
                    </span>
                  </div>
                  <div className="text-sm text-green-700">
                    <p>• Claves de producto detectadas y validadas</p>
                    <p>• Descripciones extraídas automáticamente</p>
                    <p>• Cantidades y unidades procesadas</p>
                  </div>
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="border rounded-lg p-4 bg-red-50">
                  <div className="flex items-center space-x-2 text-red-800 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Errores encontrados:</span>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {result.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.extractedText && (
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{showPreview ? 'Ocultar' : 'Ver'} texto extraído</span>
                  </Button>
                  
                  {showPreview && (
                    <div className="border rounded-lg p-4 bg-gray-50 max-h-40 overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {result.extractedText.substring(0, 1000)}
                        {result.extractedText.length > 1000 && '...'}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          
          {file && !result && (
            <Button 
              onClick={processDocument} 
              disabled={isProcessing}
              className="flex items-center space-x-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isProcessing ? 'Procesando...' : 'Procesar con IA'}</span>
            </Button>
          )}
          
          {result?.success && result.data && result.data.length > 0 && (
            <Button onClick={handleUseResults} className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Usar {result.data.length} Mercancías</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
