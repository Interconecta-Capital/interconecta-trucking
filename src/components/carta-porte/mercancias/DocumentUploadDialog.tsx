
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { DocumentProcessor, type ProcessingProgress } from '@/services/documentProcessor';
import { Progress } from '@/components/ui/progress';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentProcessed?: (mercancias: any[]) => void;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  onDocumentProcessed
}: DocumentUploadDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [progressState, setProgressState] = useState<ProcessingProgress | null>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/xml',
      'application/xml',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no soportado. Por favor sube PDF, imágenes, archivos Excel, XML o CSV.');
      return;
    }

    setUploading(true);
    setProgressState({ stage: 'upload', progress: 0, message: 'Preparando archivo...' });
    
    try {
      const result = await DocumentProcessor.processDocument(file, (p) => setProgressState(p));

      if (result.success) {
        if (onDocumentProcessed) {
          onDocumentProcessed(result.data || []);
        }
        toast.success('Documento procesado exitosamente');
        onOpenChange(false);
      } else {
        toast.error(result.errors?.join('\n') || 'Error al procesar el documento');
      }
    } catch (error) {
      console.error('Error processing document:', error);
      toast.error('Error al procesar el documento');
    } finally {
      setUploading(false);
      setProgressState(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Documento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              Arrastra tu documento aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-gray-500">
              PDF, imágenes, archivos Excel, XML o CSV
            </p>
            
            <input
              type="file"
              className="hidden"
              id="file-upload"
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.xml,.csv"
              onChange={(e) => handleFileUpload(e.target.files)}
              disabled={uploading}
            />
            
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploading}
            >
              Seleccionar Archivo
            </Button>

            {uploading && progressState && (
              <div className="mt-4 space-y-2">
                <Progress value={progressState.progress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  {progressState.message} ({progressState.progress}%)
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
