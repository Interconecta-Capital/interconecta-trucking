
import { ResponsiveDialog, ResponsiveDialogContent } from '@/components/ui/responsive-dialog'
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ViajeWizard } from './ViajeWizard'
import { useViajeWizardModal } from '@/contexts/ViajeWizardModalProvider'

export function ViajeWizardModal() {
  const { isViajeWizardOpen, closeViajeWizard } = useViajeWizardModal()

  return (
    <ResponsiveDialog open={isViajeWizardOpen} onOpenChange={(open) => { if(!open) closeViajeWizard() }}>
      <ResponsiveDialogContent className="focus:outline-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Programar Nuevo Viaje</DialogTitle>
          <DialogDescription>
            Wizard completo para programar un nuevo viaje con todos los detalles necesarios
          </DialogDescription>
        </DialogHeader>
        <div className="w-full h-full">
          <ViajeWizard onCancel={closeViajeWizard} onComplete={closeViajeWizard} />
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
