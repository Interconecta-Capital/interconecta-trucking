import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string) => Promise<void>;
  isDeleting: boolean;
}

/**
 * Diálogo de confirmación de eliminación de cuenta con doble verificación
 * GDPR Art. 17 - Derecho de Supresión
 * LFPDPPP Art. 26 - Derecho de Cancelación
 */
export const DeleteAccountDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isDeleting
}: DeleteAccountDialogProps) => {
  const [step, setStep] = useState<'warning' | 'confirmation'>('warning');
  const [password, setPassword] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [error, setError] = useState('');

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isDeleting) {
      // Reset state when closing
      setStep('warning');
      setPassword('');
      setConfirmChecked(false);
      setError('');
    }
    onOpenChange(newOpen);
  };

  const handleContinue = () => {
    setStep('confirmation');
    setError('');
  };

  const handleBack = () => {
    setStep('warning');
    setPassword('');
    setConfirmChecked(false);
    setError('');
  };

  const handleConfirmDelete = async () => {
    setError('');

    if (!confirmChecked) {
      setError('Debes confirmar que deseas eliminar tu cuenta');
      return;
    }

    if (!password || password.trim().length === 0) {
      setError('Debes ingresar tu contraseña para confirmar');
      return;
    }

    try {
      await onConfirm(password);
      handleOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la cuenta');
    }
  };

  // Initialize step on open
  if (open && !step) {
    setStep('warning');
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        {step === 'warning' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                ¿Estás seguro de que deseas eliminar tu cuenta?
              </DialogTitle>
              <DialogDescription className="space-y-3 pt-2">
                <p>
                  Esta acción <strong>eliminará permanentemente</strong> tu cuenta y todos tus datos 
                  personales después de un periodo de gracia de 30 días.
                </p>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Acción irreversible después de 30 días.</strong> Todos tus datos serán 
                  anonimizados y no podrán ser recuperados.
                </AlertDescription>
              </Alert>

              <div className="bg-destructive/10 p-4 rounded-md space-y-3">
                <p className="font-semibold text-sm">Qué se eliminará:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Datos personales (nombre, RFC, teléfono, email)</li>
                  <li>Conductores, vehículos y socios (anonimizados)</li>
                  <li>Notificaciones y archivos temporales</li>
                </ul>

                <p className="font-semibold text-sm mt-4">Qué se conservará (por ley):</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Cartas Porte emitidas (SAT: 10 años, anonimizadas)</li>
                  <li>Logs de auditoría (7 años, sin datos personales)</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleContinue}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Continuar
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'confirmation' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Confirmación Final
              </DialogTitle>
              <DialogDescription>
                Para proceder con la eliminación de tu cuenta, confirma tu identidad
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 border-2 border-destructive/50 rounded-md">
                <Checkbox
                  id="confirm-delete"
                  checked={confirmChecked}
                  onCheckedChange={(checked) => setConfirmChecked(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor="confirm-delete"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Confirmo que deseo eliminar mi cuenta permanentemente
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Entiendo que esta acción es irreversible después del periodo de gracia de 30 días
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña actual *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isDeleting}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Requerimos tu contraseña para verificar tu identidad
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="bg-muted p-3 rounded-md text-xs text-muted-foreground">
                <p className="font-medium mb-1">Periodo de gracia:</p>
                <p>
                  Tienes 30 días para cancelar esta solicitud contactando a:{' '}
                  <strong className="text-foreground">arrebolcorporation@gmail.com</strong>
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isDeleting}
                >
                  Atrás
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting || !confirmChecked || !password}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Eliminando...' : 'Eliminar Mi Cuenta'}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
