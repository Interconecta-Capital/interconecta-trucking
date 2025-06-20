
import React from "react"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./hooks/useAuth"
import { BaseLayout } from "./components/layout/BaseLayout"
import { ProtectedRoute } from "./components/ProtectedRoute"

// Páginas públicas
import LandingPage from "./pages/LandingPage"
import Auth from "./pages/Auth"

// Páginas protegidas
import Dashboard from "./pages/Dashboard"
import CartasPorteUnified from "./pages/CartasPorteUnified"
import CartaPorteEditor from "./pages/CartaPorteEditor"
import Vehiculos from "./pages/Vehiculos"
import Conductores from "./pages/Conductores"
import Socios from "./pages/Socios"
import Viajes from "./pages/Viajes"
import Administracion from "./pages/Administracion"
import Planes from "./pages/Planes"

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Rutas protegidas con layout completo */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <BaseLayout>
                    <Dashboard />
                  </BaseLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/cartas-porte" element={
                <ProtectedRoute>
                  <BaseLayout>
                    <CartasPorteUnified />
                  </BaseLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/vehiculos" element={
                <ProtectedRoute>
                  <BaseLayout>
                    <Vehiculos />
                  </BaseLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/conductores" element={
                <ProtectedRoute>
                  <BaseLayout>
                    <Conductores />
                  </BaseLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/socios" element={
                <ProtectedRoute>
                  <BaseLayout>
                    <Socios />
                  </BaseLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/viajes" element={
                <ProtectedRoute>
                  <BaseLayout>
                    <Viajes />
                  </BaseLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/administracion" element={
                <ProtectedRoute>
                  <BaseLayout>
                    <Administracion />
                  </BaseLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/planes" element={
                <ProtectedRoute>
                  <BaseLayout>
                    <Planes />
                  </BaseLayout>
                </ProtectedRoute>
              } />
              
              {/* Editor de Carta Porte - PANTALLA COMPLETA sin layout */}
              <Route path="/carta-porte/editor/:id" element={
                <ProtectedRoute>
                  <CartaPorteEditor />
                </ProtectedRoute>
              } />
              <Route path="/carta-porte/editor" element={
                <ProtectedRoute>
                  <CartaPorteEditor />
                </ProtectedRoute>
              } />
              
              {/* Redirecciones de rutas antiguas */}
              <Route path="/carta-porte/nuevo" element={<Navigate to="/carta-porte/editor" replace />} />
              <Route path="/carta-porte/:id" element={<Navigate to="/carta-porte/editor/:id" replace />} />
              
              {/* Redirección por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
