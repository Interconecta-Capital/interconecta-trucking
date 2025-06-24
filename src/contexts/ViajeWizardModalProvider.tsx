import { createContext, useContext, useState } from 'react'

interface ViajeWizardModalContextType {
  isViajeWizardOpen: boolean
  openViajeWizard: () => void
  closeViajeWizard: () => void
}

const ViajeWizardModalContext = createContext<ViajeWizardModalContextType | undefined>(undefined)

export function ViajeWizardModalProvider({ children }: { children: React.ReactNode }) {
  const [isViajeWizardOpen, setIsViajeWizardOpen] = useState(false)

  const openViajeWizard = () => setIsViajeWizardOpen(true)
  const closeViajeWizard = () => setIsViajeWizardOpen(false)

  return (
    <ViajeWizardModalContext.Provider value={{ isViajeWizardOpen, openViajeWizard, closeViajeWizard }}>
      {children}
    </ViajeWizardModalContext.Provider>
  )
}

export function useViajeWizardModal() {
  const context = useContext(ViajeWizardModalContext)
  if (!context) {
    throw new Error('useViajeWizardModal must be used within a ViajeWizardModalProvider')
  }
  return context
}
