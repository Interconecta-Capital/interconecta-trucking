import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CertificadoDigital } from '@/types/certificados';

interface CertificadoEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificado: CertificadoDigital;
  onUpdate: (data: UpdateCertificateData) => Promise<void>;
}

export interface UpdateCertificateData {
  certificadoId: string;
  nombreCertificado?: string;
  nuevoArchivoCer?: File;
  nuevoArchivoKey?: File;
  nuevaPassword?: string;
}

export function CertificadoEditDialog({
  open,
  onOpenChange,
  certificado,
  onUpdate,
}: CertificadoEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [nombreCertificado, setNombreCertificado] = useState(certificado.nombre_certificado);
  const [nuevoArchivoCer, setNuevoArchivoCer] = useState<File | null>(null);
  const [nuevoArchivoKey, setNuevoArchivoKey] = useState<File | null>(null);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!nombreCertificado.trim()) {
      setError('El nombre del certificado es requerido');
      return;
    }

    // Si hay archivos nuevos, debe haber contraseña
    if ((nuevoArchivoKey || nuevoArchivoCer) && !nuevaPassword) {
      setError('Debe proporcionar la contraseña si cambia los archivos');
      return;
    }

    // Si solo cambia contraseña, validar confirmación
    if (nuevaPassword && nuevaPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Si cambia archivos, deben ser ambos
    if ((nuevoArchivoCer && !nuevoArchivoKey) || (!nuevoArchivoCer && nuevoArchivoKey)) {
      setError('Debe proporcionar ambos archivos .cer y .key');
      return;
    }

    try {
      setIsSubmitting(true);

      const updateData: UpdateCertificateData = {
        certificadoId: certificado.id,
        nombreCertificado: nombreCertificado.trim(),
      };

      if (nuevoArchivoCer) updateData.nuevoArchivoCer = nuevoArchivoCer;
      if (nuevoArchivoKey) updateData.nuevoArchivoKey = nuevoArchivoKey;
      if (nuevaPassword) updateData.nuevaPassword = nuevaPassword;

      await onUpdate(updateData);
      
      // Limpiar formulario
      setNombreCertificado(certificado.nombre_certificado);
      setNuevoArchivoCer(null);
      setNuevoArchivoKey(null);
      setNuevaPassword('');
      setConfirmPassword('');
      
      onOpenChange(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar certificado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = 
    nombreCertificado !== certificado.nombre_certificado ||
    nuevoArchivoCer !== null ||
    nuevoArchivoKey !== null ||
    nuevaPassword !== '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Certificado</DialogTitle>
          <DialogDescription>
            Actualice la información del certificado. Si cambia los archivos, ambos (.cer y .key) deben ser proporcionados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Certificado actual */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <div className="space-y-1">
                <div><strong>RFC:</strong> {certificado.rfc_titular}</div>
                <div><strong>Número de Serie:</strong> {certificado.numero_certificado}</div>
                <div><strong>Vigencia:</strong> {new Date(certificado.fecha_fin_vigencia).toLocaleDateString('es-MX')}</div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Nombre del certificado */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Certificado</Label>
            <Input
              id="nombre"
              value={nombreCertificado}
              onChange={(e) => setNombreCertificado(e.target.value)}
              placeholder="Ej: Certificado Principal 2024"
              required
            />
          </div>

          {/* Archivos opcionales */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="font-medium text-sm">Reemplazar Archivos (Opcional)</div>
            
            <div className="space-y-2">
              <Label htmlFor="cer-file">Nuevo Archivo .cer</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="cer-file"
                  type="file"
                  accept=".cer"
                  onChange={(e) => setNuevoArchivoCer(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                {nuevoArchivoCer && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="key-file">Nuevo Archivo .key</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="key-file"
                  type="file"
                  accept=".key"
                  onChange={(e) => setNuevoArchivoKey(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                {nuevoArchivoKey && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
            </div>
          </div>

          {/* Contraseña */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="font-medium text-sm">
              {nuevoArchivoKey ? 'Contraseña del Nuevo Archivo .key' : 'Actualizar Contraseña (Opcional)'}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                placeholder="Ingrese la contraseña"
                required={!!(nuevoArchivoKey || nuevoArchivoCer)}
              />
            </div>

            {nuevaPassword && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme la contraseña"
                  required
                />
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !hasChanges}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Actualizar Certificado
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
