
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./hooks/useAuth"
import { BaseLayout } from "./components/layout/BaseLayout"

// Páginas principales
import Index from "./pages/Index"
import Dashboard from "./pages/Dashboard"
import CartasPorteUnified from "./pages/CartasPorteUnified"
import CartaPorteEditor from "./pages/CartaPorteEditor"
import Vehiculos from "./pages/Vehiculos"
import Conductores from "./pages/Conductores"
import Socios from "./pages/Socios"
import Viajes from "./pages/Viajes"
import Administracion from "./pages/Administracion"
import Planes from "./pages/Planes"

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Página de inicio sin layout */}
            <Route path="/" element={<Index />} />
            
            {/* Rutas principales con layout completo */}
            <Route path="/dashboard" element={
              <BaseLayout>
                <Dashboard />
              </BaseLayout>
            } />
            
            {/* Ruta principal de Cartas Porte - SOLO para gestión/listado */}
            <Route path="/cartas-porte" element={
              <BaseLayout>
                <CartasPorteUnified />
              </BaseLayout>
            } />
            
            <Route path="/vehiculos" element={
              <BaseLayout>
                <Vehiculos />
              </BaseLayout>
            } />
            
            <Route path="/conductores" element={
              <BaseLayout>
                <Conductores />
              </BaseLayout>
            } />
            
            <Route path="/socios" element={
              <BaseLayout>
                <Socios />
              </BaseLayout>
            } />
            
            <Route path="/viajes" element={
              <BaseLayout>
                <Viajes />
              </BaseLayout>
            } />
            
            <Route path="/administracion" element={
              <BaseLayout>
                <Administracion />
              </BaseLayout>
            } />
            
            <Route path="/planes" element={
              <BaseLayout>
                <Planes />
              </BaseLayout>
            } />
            
            {/* Editor de Carta Porte - PANTALLA COMPLETA sin layout para todos los módulos */}
            <Route path="/carta-porte/editor/:id" element={<CartaPorteEditor />} />
            <Route path="/carta-porte/editor" element={<CartaPorteEditor />} />
            
            {/* Redirección de rutas antiguas al nuevo sistema unificado */}
            <Route path="/carta-porte/nuevo" element={<Navigate to="/carta-porte/editor" replace />} />
            <Route path="/carta-porte/:id" element={<Navigate to="/carta-porte/editor/:id" replace />} />
            
            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
