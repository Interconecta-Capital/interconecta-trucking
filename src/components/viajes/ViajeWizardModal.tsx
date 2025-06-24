import { ResponsiveDialog, ResponsiveDialogContent } from '@/components/ui/responsive-dialog'
import { ViajeWizard } from './ViajeWizard'
import { useViajeWizardModal } from '@/contexts/ViajeWizardModalProvider'

export function ViajeWizardModal() {
  const { isViajeWizardOpen, closeViajeWizard } = useViajeWizardModal()

  return (
    <ResponsiveDialog open={isViajeWizardOpen} onOpenChange={(open) => { if(!open) closeViajeWizard() }}>
      <ResponsiveDialogContent className="md:max-w-5xl inset-0 h-screen md:h-auto md:inset-auto" >
        <ViajeWizard onCancel={closeViajeWizard} onComplete={closeViajeWizard} />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
