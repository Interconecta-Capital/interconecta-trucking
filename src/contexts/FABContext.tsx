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
}

const FABContext = createContext<FABContextType>({
  fabConfig: { isVisible: false },
  setFABConfig: () => {}
})

export function FABProvider({ children }: { children: React.ReactNode }) {
  const [fabConfig, setFabConfig] = useState<FABConfig>({ isVisible: false })

  const setFABConfig = (config: FABConfig) => {
    setFabConfig(prev => ({ ...prev, ...config }))
  }

  return (
    <FABContext.Provider value={{ fabConfig, setFABConfig }}>
      {children}
    </FABContext.Provider>
  )
}

export function useFAB() {
  return useContext(FABContext)
}
