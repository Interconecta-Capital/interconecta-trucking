import { createContext, useContext, useState, useEffect } from 'react'
import { useFAB } from './FABContext'

interface ViajeWizardModalContextType {
  isViajeWizardOpen: boolean
  openViajeWizard: () => void
  closeViajeWizard: () => void
}

const ViajeWizardModalContext = createContext<ViajeWizardModalContextType | undefined>(undefined)

export function ViajeWizardModalProvider({ children }: { children: React.ReactNode }) {
  const [isViajeWizardOpen, setIsViajeWizardOpen] = useState(false)
  const { setIsModalOpen } = useFAB()

  const openViajeWizard = () => setIsViajeWizardOpen(true)
  const closeViajeWizard = () => setIsViajeWizardOpen(false)

  // Notificar al FAB cuando el modal está abierto
  useEffect(() => {
    setIsModalOpen(isViajeWizardOpen)
  }, [isViajeWizardOpen, setIsModalOpen])

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
