
import { ResponsiveDialog, ResponsiveDialogContent } from '@/components/ui/responsive-dialog'
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ViajeWizard } from './ViajeWizard'
import { useViajeWizardModal } from '@/contexts/ViajeWizardModalProvider'

export function ViajeWizardModal() {
  const { isViajeWizardOpen, closeViajeWizard } = useViajeWizardModal()

  return (
    <ResponsiveDialog open={isViajeWizardOpen} onOpenChange={(open) => { if(!open) closeViajeWizard() }}>
      <ResponsiveDialogContent className="md:max-w-5xl inset-0 h-screen md:h-auto md:inset-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Programar Nuevo Viaje</DialogTitle>
          <DialogDescription>
            Wizard completo para programar un nuevo viaje con todos los detalles necesarios
          </DialogDescription>
        </DialogHeader>
        <ViajeWizard onCancel={closeViajeWizard} onComplete={closeViajeWizard} />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
