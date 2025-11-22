import React, { createContext, useContext, useState } from 'react'

export interface FABConfig {
  icon?: React.ReactNode
  text?: string
  onClick?: () => void
  isVisible?: boolean
}

interface FABContextType {
  fabConfig: FABConfig
  setFABConfig: (config: FABConfig) => void
  isModalOpen: boolean
  setIsModalOpen: (isOpen: boolean) => void
}

const FABContext = createContext<FABContextType>({
  fabConfig: { isVisible: false },
  setFABConfig: () => {},
  isModalOpen: false,
  setIsModalOpen: () => {}
})

export function FABProvider({ children }: { children: React.ReactNode }) {
  const [fabConfig, setFabConfig] = useState<FABConfig>({ isVisible: false })
  const [isModalOpen, setIsModalOpen] = useState(false)

  const setFABConfig = (config: FABConfig) => {
    setFabConfig(prev => ({ ...prev, ...config }))
  }

  return (
    <FABContext.Provider value={{ fabConfig, setFABConfig, isModalOpen, setIsModalOpen }}>
      {children}
    </FABContext.Provider>
  )
}

export function useFAB() {
  return useContext(FABContext)
}
