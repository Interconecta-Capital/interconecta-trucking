
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./hooks/useAuth"
import { AuthGuard } from "./components/auth/AuthGuard"
import { BaseLayout } from "./components/layout/BaseLayout"
import { OnboardingProvider } from '@/contexts/OnboardingProvider'
import { OnboardingIntegration } from '@/components/onboarding/OnboardingIntegration'
import { ViajeWizardModalProvider } from '@/contexts/ViajeWizardModalProvider'
import { ViajeWizardModal } from '@/components/viajes/ViajeWizardModal'
import { FABProvider } from './contexts/FABContext'
import { GlobalUpgradeModalProvider } from './components/common/GlobalUpgradeModalProvider'

// Páginas públicas
import Index from "./pages/Index"
import Auth from "./pages/Auth"

// Páginas protegidas
import Dashboard from "./pages/Dashboard"
import DashboardPrincipal from "./pages/DashboardPrincipal"
import DashboardEjecutivo from "./pages/DashboardEjecutivo"
import DashboardOperadores from "./pages/DashboardOperadores"
import CartasPorteUnified from "./pages/CartasPorteUnified"
import CartaPorteEditor from "./pages/CartaPorteEditor"
import Vehiculos from "./pages/Vehiculos"
import Conductores from "./pages/Conductores"
import Socios from "./pages/Socios"
import Viajes from "./pages/Viajes"
import ViajesAnalyticsPage from "./pages/ViajesAnalytics"
import Remolques from "./pages/Remolques"
import Administracion from "./pages/Administracion"
import Planes from "./pages/Planes"
import ConfiguracionEmpresa from "./pages/ConfiguracionEmpresa"
import Calendario from "./pages/Calendario"
import ViajeEditar from "./pages/ViajeEditar"

// Nuevos componentes
import { ViajeWizard } from "./components/viajes/ViajeWizard"
import DashboardHub from "./components/dashboard/DashboardHub"

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <GlobalUpgradeModalProvider>
            <FABProvider>
              <ViajeWizardModalProvider>
                <OnboardingProvider>
                <OnboardingIntegration />
                <ViajeWizardModal />
                <Routes>
              {/* Página principal - Landing page para usuarios no autenticados */}
              <Route path="/" element={<Index />} />
              
              {/* Página de autenticación */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Rutas protegidas - requieren autenticación */}
              <Route path="/dashboard" element={
                <AuthGuard>
                  <BaseLayout>
                    <DashboardHub />
                  </BaseLayout>
                </AuthGuard>
              } />
              
              <Route path="/dashboard/principal" element={
                <AuthGuard>
                  <BaseLayout>
                    <DashboardPrincipal />
                  </BaseLayout>
                </AuthGuard>
              } />
              
              <Route path="/dashboard-ejecutivo" element={
                <AuthGuard>
                  <BaseLayout>
                    <DashboardEjecutivo />
                  </BaseLayout>
                </AuthGuard>
              } />
              
              <Route path="/dashboard/operadores" element={
                <AuthGuard>
                  <BaseLayout>
                    <DashboardOperadores />
                  </BaseLayout>
                </AuthGuard>
              } />
              
              <Route path="/cartas-porte" element={
                <AuthGuard>
                  <BaseLayout>
                    <CartasPorteUnified />
                  </BaseLayout>
                </AuthGuard>
              } />
              
              <Route path="/vehiculos" element={
                <AuthGuard>
                  <BaseLayout>
                    <Vehiculos />
                  </BaseLayout>
                </AuthGuard>
              } />
              
              <Route path="/remolques" element={
                <AuthGuard>
                  <BaseLayout>
                    <Remolques />
                  </BaseLayout>
                </AuthGuard>
              } />
              
              <Route path="/conductores" element={
                <AuthGuard>
                  <BaseLayout>
                    <Conductores />
                  </BaseLayout>
                </AuthGuard>
              } />
              
              <Route path="/socios" element={
                <AuthGuard>
                  <BaseLayout>
                    <Socios />
                  </BaseLayout>
                </AuthGuard>
              } />
              
              <Route path="/viajes" element={
                <AuthGuard>
                  <BaseLayout>
                    <Viajes />
                  </BaseLayout>
                </AuthGuard>
              } />

              <Route path="/viajes/analytics" element={
                <AuthGuard>
                  <BaseLayout>
                    <ViajesAnalyticsPage />
                  </BaseLayout>
                </AuthGuard>
              } />

              <Route path="/calendario" element={
                <AuthGuard>
                  <BaseLayout>
                    <Calendario />
                  </BaseLayout>
                </AuthGuard>
              } />
              
              {/* Nueva ruta del Wizard de Viajes */}
              <Route path="/viajes/programar" element={
                <AuthGuard>
                  <BaseLayout>
                    <ViajeWizard />
                  </BaseLayout>
                </AuthGuard>
              } />

              <Route path="/viajes/editar/:id" element={
                <AuthGuard>
                  <BaseLayout>
                    <ViajeEditar />
                  </BaseLayout>
                </AuthGuard>
              } />
              
              <Route path="/administracion" element={
                <AuthGuard>
                  <BaseLayout>
                    <Administracion />
                  </BaseLayout>
                </AuthGuard>
              } />

              <Route path="/configuracion/empresa" element={
                <AuthGuard>
                  <BaseLayout>
                    <ConfiguracionEmpresa />
                  </BaseLayout>
                </AuthGuard>
              } />

              <Route path="/planes" element={
                <AuthGuard>
                  <BaseLayout>
                    <Planes />
                  </BaseLayout>
                </AuthGuard>
              } />
              
              {/* Editor de Carta Porte - PANTALLA COMPLETA protegida */}
              <Route path="/carta-porte/editor/:id" element={
                <AuthGuard>
                  <CartaPorteEditor />
                </AuthGuard>
              } />
              <Route path="/carta-porte/editor" element={
                <AuthGuard>
                  <CartaPorteEditor />
                </AuthGuard>
              } />
              
              {/* Redirección de rutas antiguas */}
              <Route path="/carta-porte/nuevo" element={<Navigate to="/carta-porte/editor" replace />} />
              <Route path="/carta-porte/:id" element={<Navigate to="/carta-porte/editor/:id" replace />} />
              
              {/* Redirección por defecto - a la landing page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </OnboardingProvider>
        </ViajeWizardModalProvider>
        </FABProvider>
          </GlobalUpgradeModalProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
