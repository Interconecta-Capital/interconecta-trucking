
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
import { lazy, Suspense } from 'react'

// Páginas públicas (carga inmediata)
import Index from "./pages/Index"
import Auth from "./pages/Auth"

// Páginas protegidas (lazy loading)
const Dashboard = lazy(() => import("./pages/Dashboard"))
const DashboardPrincipal = lazy(() => import("./pages/DashboardPrincipal"))
const DashboardEjecutivo = lazy(() => import("./pages/DashboardEjecutivo"))
const DashboardOperadores = lazy(() => import("./pages/DashboardOperadores"))
const CartasPorteUnified = lazy(() => import("./pages/CartasPorteUnified"))
const CartaPorteEditor = lazy(() => import("./pages/CartaPorteEditor"))
const Vehiculos = lazy(() => import("./pages/Vehiculos"))
const Conductores = lazy(() => import("./pages/Conductores"))
const Socios = lazy(() => import("./pages/Socios"))
const Viajes = lazy(() => import("./pages/Viajes"))
const Remolques = lazy(() => import("./pages/Remolques"))
const Administracion = lazy(() => import("./pages/Administracion"))
const Planes = lazy(() => import("./pages/Planes"))
const ConfiguracionEmpresa = lazy(() => import("./pages/ConfiguracionEmpresa"))
const Calendario = lazy(() => import("./pages/Calendario"))
const ViajeEditar = lazy(() => import("./pages/ViajeEditar"))
const ViajesAnalytics = lazy(() => import("./pages/ViajesAnalytics"))
const ReportesAutomaticosPage = lazy(() => import("./pages/ReportesAutomaticosPage"))
const Cotizaciones = lazy(() => import("./pages/Cotizaciones"))
const ReportesGenerales = lazy(() => import("./pages/ReportesGenerales"))
const ViajeWizard = lazy(() => import("./components/viajes/ViajeWizard").then(m => ({ default: m.ViajeWizard })))
const DashboardHub = lazy(() => import("./components/dashboard/DashboardHub"))

const queryClient = new QueryClient()

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

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
                <Suspense fallback={<LoadingFallback />}>
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

              {/* Nueva ruta de Analytics de Viajes */}
              <Route path="/viajes/analytics" element={
                <AuthGuard>
                  <BaseLayout>
                    <ViajesAnalytics />
                  </BaseLayout>
                </AuthGuard>
              } />

              {/* Rutas de Reportes */}
              <Route path="/dashboard/reportes" element={
                <AuthGuard>
                  <BaseLayout>
                    <ReportesGenerales />
                  </BaseLayout>
                </AuthGuard>
              } />

              <Route path="/dashboard/reportes-automaticos" element={
                <AuthGuard>
                  <BaseLayout>
                    <ReportesAutomaticosPage />
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
              
              <Route path="/cotizaciones" element={
                <AuthGuard>
                  <BaseLayout>
                    <Cotizaciones />
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
            </Suspense>
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
