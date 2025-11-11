import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeletedAccountDialogProps {
  open: boolean;
  email: string;
  deletedAt?: string;
  onClose: () => void;
}

export function DeletedAccountDialog({ open, email, deletedAt, onClose }: DeletedAccountDialogProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'fecha no disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'fecha no disponible';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <DialogTitle>Cuenta Eliminada</DialogTitle>
          </div>
          <DialogDescription className="space-y-4 text-left">
            <p>
              La cuenta asociada al correo <strong>{email}</strong> fue eliminada 
              el {formatDate(deletedAt)}.
            </p>
            <p>
              Para reactivar tu cuenta o crear una nueva, por favor contacta a nuestro equipo de soporte:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="font-medium">📧 Email:</p>
              <a 
                href="mailto:soporte@interconecta.capital" 
                className="text-blue-600 hover:underline block"
              >
                soporte@interconecta.capital
              </a>
              <p className="text-sm text-gray-600 mt-3">
                Normalmente respondemos en menos de 24 horas.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Si deseas crear una cuenta completamente nueva, las cuentas eliminadas se purgan 
              automáticamente después de 30 días.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button onClick={onClose}>
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
