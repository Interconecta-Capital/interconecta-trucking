
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertTriangle } from 'lucide-react';
import { useConfiguracionEmpresarial } from '@/hooks/useConfiguracionEmpresarial';

const certificadoSchema = z.object({
  nombre_certificado: z.string().min(1, 'El nombre del certificado es obligatorio'),
  numero_serie: z.string().min(1, 'El número de serie es obligatorio'),
  rfc_titular: z.string().min(12, 'RFC inválido').max(13),
  razon_social_titular: z.string().optional(),
  fecha_inicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
  fecha_vencimiento: z.string().min(1, 'La fecha de vencimiento es obligatoria'),
  password_encriptado: z.string().min(1, 'La contraseña de la llave privada es obligatoria')
});

type CertificadoForm = z.infer<typeof certificadoSchema>;

interface CertificadoUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CertificadoUploadModal({ open, onOpenChange }: CertificadoUploadModalProps) {
  const [archivoCer, setArchivoCer] = useState<File | null>(null);
  const [archivoKey, setArchivoKey] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { agregarCertificado } = useConfiguracionEmpresarial();

  const form = useForm<CertificadoForm>({
    resolver: zodResolver(certificadoSchema),
    defaultValues: {
      nombre_certificado: '',
      numero_serie: '',
      rfc_titular: '',
      razon_social_titular: '',
      fecha_inicio: '',
      fecha_vencimiento: '',
      password_encriptado: ''
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, tipo: 'cer' | 'key') => {
    const file = event.target.files?.[0];
    if (file) {
      if (tipo === 'cer') {
        if (!file.name.toLowerCase().endsWith('.cer')) {
          setUploadError('El archivo de certificado debe tener extensión .cer');
          return;
        }
        setArchivoCer(file);
      } else {
        if (!file.name.toLowerCase().endsWith('.key')) {
          setUploadError('El archivo de llave privada debe tener extensión .key');
          return;
        }
        setArchivoKey(file);
      }
      setUploadError(null);
    }
  };

  const onSubmit = async (data: CertificadoForm) => {
    if (!archivoCer || !archivoKey) {
      setUploadError('Debe seleccionar ambos archivos (.cer y .key)');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      // Por ahora guardamos los datos básicos
      // En una implementación completa, aquí subiríamos los archivos al storage
      await agregarCertificado({
        ...data,
        archivo_cer_path: `certificados/${archivoCer.name}`,
        archivo_key_path: `certificados/${archivoKey.name}`,
        es_valido: true, // En producción, validar el certificado
        es_activo: false,
        validado_sat: false
      });

      form.reset();
      setArchivoCer(null);
      setArchivoKey(null);
      onOpenChange(false);

    } catch (error) {
      console.error('Error subiendo certificado:', error);
      setUploadError('Error al subir el certificado. Verifique los datos e intente nuevamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      form.reset();
      setArchivoCer(null);
      setArchivoKey(null);
      setUploadError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Certificado de Sello Digital
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Información del certificado */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre_certificado">Nombre del Certificado *</Label>
                <Input
                  id="nombre_certificado"
                  {...form.register('nombre_certificado')}
                  placeholder="Mi Certificado 2024"
                />
                {form.formState.errors.nombre_certificado && (
                  <p className="text-sm text-red-600">{form.formState.errors.nombre_certificado.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_serie">Número de Serie *</Label>
                <Input
                  id="numero_serie"
                  {...form.register('numero_serie')}
                  placeholder="20001000000300000000"
                />
                {form.formState.errors.numero_serie && (
                  <p className="text-sm text-red-600">{form.formState.errors.numero_serie.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rfc_titular">RFC del Titular *</Label>
                <Input
                  id="rfc_titular"
                  {...form.register('rfc_titular')}
                  placeholder="ABC123456789"
                  style={{ textTransform: 'uppercase' }}
                />
                {form.formState.errors.rfc_titular && (
                  <p className="text-sm text-red-600">{form.formState.errors.rfc_titular.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="razon_social_titular">Razón Social del Titular</Label>
                <Input
                  id="razon_social_titular"
                  {...form.register('razon_social_titular')}
                  placeholder="EMPRESA EJEMPLO S.A. DE C.V."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha_inicio">Fecha de Inicio *</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  {...form.register('fecha_inicio')}
                />
                {form.formState.errors.fecha_inicio && (
                  <p className="text-sm text-red-600">{form.formState.errors.fecha_inicio.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento *</Label>
                <Input
                  id="fecha_vencimiento"
                  type="date"
                  {...form.register('fecha_vencimiento')}
                />
                {form.formState.errors.fecha_vencimiento && (
                  <p className="text-sm text-red-600">{form.formState.errors.fecha_vencimiento.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_encriptado">Contraseña de la Llave Privada *</Label>
              <Input
                id="password_encriptado"
                type="password"
                {...form.register('password_encriptado')}
                placeholder="Contraseña del archivo .key"
              />
              {form.formState.errors.password_encriptado && (
                <p className="text-sm text-red-600">{form.formState.errors.password_encriptado.message}</p>
              )}
            </div>
          </div>

          {/* Subida de archivos */}
          <div className="space-y-4">
            <h4 className="font-medium">Archivos del Certificado</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="archivo_cer">Archivo de Certificado (.cer) *</Label>
                <Input
                  id="archivo_cer"
                  type="file"
                  accept=".cer"
                  onChange={(e) => handleFileChange(e, 'cer')}
                />
                {archivoCer && (
                  <p className="text-sm text-green-600">✓ {archivoCer.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="archivo_key">Archivo de Llave Privada (.key) *</Label>
                <Input
                  id="archivo_key"
                  type="file"
                  accept=".key"
                  onChange={(e) => handleFileChange(e, 'key')}
                />
                {archivoKey && (
                  <p className="text-sm text-green-600">✓ {archivoKey.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Error display */}
          {uploadError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading || !archivoCer || !archivoKey}
            >
              {isUploading ? 'Subiendo...' : 'Subir Certificado'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
