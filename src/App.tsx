
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SecurityProvider } from "@/components/SecurityProvider";
import { AuthProvider } from "@/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Planes from "./pages/Planes";
import Vehiculos from "./pages/Vehiculos";
import Conductores from "./pages/Conductores";
import Socios from "./pages/Socios";
import Viajes from "./pages/Viajes";
import Administracion from "./pages/Administracion";
import { OptimizedAuthGuard } from "./components/auth/OptimizedAuthGuard";
import Auth from "./pages/Auth";
import Trial from "./pages/Trial";
import { BaseLayout } from "./components/layout/BaseLayout";
import CartasPorte from "./pages/CartasPorte";
import NewCartaPorte from "./pages/NewCartaPorte";
import EditCartaPorte from "./pages/EditCartaPorte";
import SuperuserManagement from "./pages/SuperuserManagement";

// Configure React Query con configuración extremadamente optimizada
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 60 * 1000, // 60 minutos (muy aumentado)
      refetchOnWindowFocus: false, // Completamente deshabilitado
      refetchOnReconnect: false,   // Completamente deshabilitado
      refetchOnMount: false,       // Completamente deshabilitado
      refetchInterval: false,      // Sin polling automático
      retry: (failureCount, error: any) => {
        // No retry en errores de auth o RLS
        if (error?.status === 401 || error?.code === 'PGRST116') {
          return false;
        }
        return failureCount < 1; // Máximo 1 retry
      },
      retryDelay: () => 10000, // 10 segundos de delay fijo
      structuralSharing: true,
    },
    mutations: {
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Router>
            <SecurityProvider>
              <AuthProvider>
                <Routes>
                  {/* Landing page - sin autenticación */}
                  <Route path="/" element={<Index />} />
                  
                  {/* Rutas de autenticación */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/login" element={<Auth />} />
                  <Route path="/auth/trial" element={<Trial />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/register" element={<Auth />} />
                  <Route path="/recover-password" element={<Auth />} />
                  <Route path="/new-password" element={<Auth />} />

                  {/* Rutas protegidas - todas con OptimizedAuthGuard */}
                  <Route path="/dashboard" element={
                    <OptimizedAuthGuard>
                      <BaseLayout>
                        <Dashboard />
                      </BaseLayout>
                    </OptimizedAuthGuard>
                  } />

                  <Route path="/cartas-porte" element={
                    <OptimizedAuthGuard>
                      <BaseLayout>
                        <CartasPorte />
                      </BaseLayout>
                    </OptimizedAuthGuard>
                  } />

                  <Route path="/cartas-porte/nueva" element={
                    <OptimizedAuthGuard>
                      <BaseLayout>
                        <NewCartaPorte />
                      </BaseLayout>
                    </OptimizedAuthGuard>
                  } />

                  <Route path="/cartas-porte/editar/:id" element={
                    <OptimizedAuthGuard>
                      <BaseLayout>
                        <EditCartaPorte />
                      </BaseLayout>
                    </OptimizedAuthGuard>
                  } />

                  <Route path="/viajes" element={
                    <OptimizedAuthGuard>
                      <BaseLayout>
                        <Viajes />
                      </BaseLayout>
                    </OptimizedAuthGuard>
                  } />

                  <Route path="/administracion" element={
                    <OptimizedAuthGuard>
                      <BaseLayout>
                        <Administracion />
                      </BaseLayout>
                    </OptimizedAuthGuard>
                  } />

                  <Route path="/planes" element={
                    <OptimizedAuthGuard>
                      <BaseLayout>
                        <Planes />
                      </BaseLayout>
                    </OptimizedAuthGuard>
                  } />

                  <Route path="/vehiculos" element={
                    <OptimizedAuthGuard>
                      <BaseLayout>
                        <Vehiculos />
                      </BaseLayout>
                    </OptimizedAuthGuard>
                  } />

                  <Route path="/conductores" element={
                    <OptimizedAuthGuard>
                      <BaseLayout>
                        <Conductores />
                      </BaseLayout>
                    </OptimizedAuthGuard>
                  } />

                  <Route path="/socios" element={
                    <OptimizedAuthGuard>
                      <BaseLayout>
                        <Socios />
                      </BaseLayout>
                    </OptimizedAuthGuard>
                  } />

                  <Route path="/administracion/usuarios" element={
                    <OptimizedAuthGuard>
                      <BaseLayout>
                        <SuperuserManagement />
                      </BaseLayout>
                    </OptimizedAuthGuard>
                  } />
                </Routes>
              </AuthProvider>
            </SecurityProvider>
          </Router>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
