
import { ResponsiveDialog, ResponsiveDialogContent } from '@/components/ui/responsive-dialog'
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ViajeWizard, ViajeWizardHandle } from './ViajeWizard'
import { useViajeWizardModal } from '@/contexts/ViajeWizardModalProvider'

import { useRef } from 'react'

export function ViajeWizardModal() {
  const { isViajeWizardOpen, closeViajeWizard } = useViajeWizardModal()
  const wizardRef = useRef<ViajeWizardHandle>(null)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (wizardRef.current) {
        wizardRef.current.requestClose()
      } else {
        closeViajeWizard()
      }
    }
  }

  return (
    <ResponsiveDialog open={isViajeWizardOpen} onOpenChange={handleOpenChange}>
      <ResponsiveDialogContent className="focus:outline-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Programar Nuevo Viaje</DialogTitle>
          <DialogDescription>
            Wizard completo para programar un nuevo viaje con todos los detalles necesarios
          </DialogDescription>
        </DialogHeader>
        <div className="w-full h-full">
          <ViajeWizard ref={wizardRef} onCancel={closeViajeWizard} onComplete={closeViajeWizard} />
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
