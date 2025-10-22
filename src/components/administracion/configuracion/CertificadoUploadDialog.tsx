import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileCheck, Eye, EyeOff, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCertificadosDigitales } from '@/hooks/useCertificadosDigitales';
import { CertificateParserService } from '@/services/csd/CertificateParserService';
import { toast } from 'sonner';

interface CertificadoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CertificadoUploadDialog({ open, onOpenChange }: CertificadoUploadDialogProps) {
  const { subirCertificado, isUploading } = useCertificadosDigitales();
  
  // Estados de archivos
  const [archivoCer, setArchivoCer] = useState<File | null>(null);
  const [archivoKey, setArchivoKey] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nombreCertificado, setNombreCertificado] = useState('');
  
  // Estados de validación
  const [validando, setValidando] = useState(false);
  const [certificadoInfo, setCertificadoInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleCerFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.cer')) {
        setError('El archivo debe tener extensión .cer');
        return;
      }
      setArchivoCer(file);
      setError(null);
      
      // Auto-generar nombre si está vacío
      if (!nombreCertificado) {
        setNombreCertificado(file.name.replace('.cer', ''));
      }
    }
  }, [nombreCertificado]);

  const handleKeyFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.key')) {
        setError('El archivo debe tener extensión .key');
        return;
      }
      setArchivoKey(file);
      setError(null);
    }
  }, []);

  const validarCertificado = useCallback(async () => {
    if (!archivoCer || !archivoKey || !password) {
      setError('Debe seleccionar ambos archivos y proporcionar la contraseña');
      return;
    }

    setValidando(true);
    setError(null);

    try {
      const validation = await CertificateParserService.validateCertificate(
        archivoCer,
        archivoKey,
        password
      );

      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        setCertificadoInfo(null);
        return;
      }

      setCertificadoInfo(validation.certificateInfo);
      toast.success('Certificado validado correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al validar certificado');
      setCertificadoInfo(null);
    } finally {
      setValidando(false);
    }
  }, [archivoCer, archivoKey, password]);

  const handleUpload = useCallback(async () => {
    if (!archivoCer || !archivoKey || !password || !nombreCertificado) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (!certificadoInfo) {
      setError('Debe validar el certificado antes de subirlo');
      return;
    }

    try {
      setUploadProgress(20);
      await subirCertificado({
        archivoCer,
        archivoKey,
        passwordKey: password,
        nombreCertificado
      });
      
      setUploadProgress(100);
      
      // Reset form
      setArchivoCer(null);
      setArchivoKey(null);
      setPassword('');
      setNombreCertificado('');
      setCertificadoInfo(null);
      setUploadProgress(0);
      
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir certificado');
      setUploadProgress(0);
    }
  }, [archivoCer, archivoKey, password, nombreCertificado, certificadoInfo, subirCertificado, onOpenChange]);

  const handleClose = () => {
    if (!isUploading) {
      setArchivoCer(null);
      setArchivoKey(null);
      setPassword('');
      setNombreCertificado('');
      setCertificadoInfo(null);
      setError(null);
      setUploadProgress(0);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Subir Certificado de Sello Digital (CSD)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nombre del certificado */}
          <div>
            <Label htmlFor="nombreCertificado">Nombre del Certificado</Label>
            <Input
              id="nombreCertificado"
              value={nombreCertificado}
              onChange={(e) => setNombreCertificado(e.target.value)}
              placeholder="Ej: Certificado 2024"
              disabled={isUploading}
            />
          </div>

          {/* Upload archivo .cer */}
          <div>
            <Label htmlFor="archivoCer">Archivo .cer (Certificado)</Label>
            <div className="mt-1">
              <Input
                id="archivoCer"
                type="file"
                accept=".cer"
                onChange={handleCerFileChange}
                disabled={isUploading}
              />
              {archivoCer && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <FileCheck className="h-4 w-4 text-green-500" />
                  {archivoCer.name}
                </div>
              )}
            </div>
          </div>

          {/* Upload archivo .key */}
          <div>
            <Label htmlFor="archivoKey">Archivo .key (Llave Privada)</Label>
            <div className="mt-1">
              <Input
                id="archivoKey"
                type="file"
                accept=".key"
                onChange={handleKeyFileChange}
                disabled={isUploading}
              />
              {archivoKey && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <FileCheck className="h-4 w-4 text-green-500" />
                  {archivoKey.name}
                </div>
              )}
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <Label htmlFor="password">Contraseña de la Llave Privada</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese la contraseña"
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Botón de validación */}
          {archivoCer && archivoKey && password && !certificadoInfo && (
            <Button
              onClick={validarCertificado}
              disabled={validando}
              variant="outline"
              className="w-full"
            >
              {validando ? 'Validando...' : 'Validar Certificado'}
            </Button>
          )}

          {/* Preview de información del certificado */}
          {certificadoInfo && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="space-y-1 text-sm">
                  <p><strong>RFC:</strong> {certificadoInfo.rfc}</p>
                  <p><strong>Razón Social:</strong> {certificadoInfo.razonSocial}</p>
                  <p><strong>Número de Serie:</strong> {certificadoInfo.numeroSerie}</p>
                  <p><strong>Vigencia:</strong> {new Date(certificadoInfo.fechaInicioVigencia).toLocaleDateString()} - {new Date(certificadoInfo.fechaFinVigencia).toLocaleDateString()}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Errores */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Progress bar */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-muted-foreground text-center">
                Subiendo certificado... {uploadProgress}%
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!certificadoInfo || isUploading}
          >
            {isUploading ? 'Subiendo...' : 'Subir Certificado'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
