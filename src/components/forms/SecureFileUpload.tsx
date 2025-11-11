
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, File, X, Eye, AlertTriangle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { DocumentValidationService } from '@/services/storage/DocumentValidationService';

interface SecureFileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  onFilesChange?: (files: File[]) => void;
  maxSize?: number; // in MB
  description?: string;
  allowedTypes?: string[];
  documentType?: string; // Tipo de documento para validación centralizada
}

export function SecureFileUpload({ 
  label, 
  accept = "*/*", 
  multiple = false, 
  onFilesChange,
  maxSize = 5,
  description,
  allowedTypes = [],
  documentType
}: SecureFileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);

  // Security validation for files
  const validateFileSecurity = (file: File): { isValid: boolean; warnings: string[] } => {
    // Si se proporciona documentType, usar validación centralizada
    if (documentType) {
      const result = DocumentValidationService.validateFile(file, documentType);
      return { 
        isValid: result.valid, 
        warnings: result.errors 
      };
    }

    // Fallback a validación original
    const warnings: string[] = [];
    let isValid = true;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      warnings.push(`Archivo ${file.name} excede el tamaño máximo de ${maxSize}MB`);
      isValid = false;
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    const dangerousExtensions = ['exe', 'bat', 'cmd', 'scr', 'pif', 'com', 'js', 'jar', 'vbs'];
    
    if (extension && dangerousExtensions.includes(extension)) {
      warnings.push(`Tipo de archivo ${extension} no permitido por seguridad`);
      isValid = false;
    }

    // Check MIME type if allowedTypes is specified
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      warnings.push(`Tipo de archivo ${file.type} no está en la lista de tipos permitidos`);
      isValid = false;
    }

    // Check for suspicious file names
    const suspiciousPatterns = [/\.(exe|bat|cmd)$/i, /script/i, /malware/i];
    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      warnings.push(`Nombre de archivo sospechoso: ${file.name}`);
      isValid = false;
    }

    return { isValid, warnings };
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    
    const newFiles = Array.from(fileList);
    const validFiles: File[] = [];
    const allWarnings: string[] = [];

    newFiles.forEach(file => {
      const { isValid, warnings } = validateFileSecurity(file);
      
      if (isValid) {
        validFiles.push(file);
      } else {
        allWarnings.push(...warnings);
      }
    });

    if (allWarnings.length > 0) {
      setSecurityWarnings(allWarnings);
      toast.error('Algunos archivos fueron rechazados por razones de seguridad');
    } else {
      setSecurityWarnings([]);
    }

    const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
    
    // Clear warnings if no files remain
    if (updatedFiles.length === 0) {
      setSecurityWarnings([]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-green-600" />
        <Label>{label}</Label>
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {securityWarnings.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc pl-4">
              {securityWarnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      <Card className={`border-2 border-dashed transition-colors ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}>
        <CardContent className="p-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className="text-center"
          >
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-3" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <Input
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
                id={`secure-file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
              />
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={() => document.getElementById(`secure-file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`)?.click()}
              >
                Seleccionar archivos
              </Button>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Tamaño máximo: {maxSize}MB por archivo</p>
                <p className="flex items-center justify-center gap-1 text-green-600">
                  <Shield className="h-3 w-3" />
                  Validación de seguridad habilitada
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Archivos validados:</Label>
          {files.map((file, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <File className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • Verificado ✓
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const url = URL.createObjectURL(file);
                      window.open(url, '_blank');
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
