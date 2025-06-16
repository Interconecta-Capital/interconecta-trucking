
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
import { AuthGuard } from "./components/auth/AuthGuard";
import Auth from "./pages/Auth";
import Trial from "./pages/Trial";
import { BaseLayout } from "./components/layout/BaseLayout";
import CartasPorte from "./pages/CartasPorte";
import NewCartaPorte from "./pages/NewCartaPorte";
import EditCartaPorte from "./pages/EditCartaPorte";
import SuperuserManagement from "./pages/SuperuserManagement";

// Configure React Query con configuración optimizada para evitar auto-refresh
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutos (aumentado de 5)
      refetchOnWindowFocus: false, // Mantener deshabilitado
      refetchOnReconnect: false,   // Mantener deshabilitado
      refetchOnMount: false,       // Mantener deshabilitado
      refetchInterval: false,      // Deshabilitar polling automático
      retry: (failureCount, error: any) => {
        // Don't retry on authentication or RLS errors
        if (error?.status === 401 || error?.code === 'PGRST116') {
          return false;
        }
        return failureCount < 1; // Reducir reintentos de 2 a 1
      },
      retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 30000), // Aumentar delay inicial
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SecurityProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Router>
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

                  {/* Rutas protegidas - todas con BaseLayout */}
                  <Route path="/dashboard" element={
                    <AuthGuard>
                      <BaseLayout>
                        <Dashboard />
                      </BaseLayout>
                    </AuthGuard>
                  } />

                  <Route path="/cartas-porte" element={
                    <AuthGuard>
                      <BaseLayout>
                        <CartasPorte />
                      </BaseLayout>
                    </AuthGuard>
                  } />

                  <Route path="/cartas-porte/nueva" element={
                    <AuthGuard>
                      <BaseLayout>
                        <NewCartaPorte />
                      </BaseLayout>
                    </AuthGuard>
                  } />

                  <Route path="/cartas-porte/editar/:id" element={
                    <AuthGuard>
                      <BaseLayout>
                        <EditCartaPorte />
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

                  <Route path="/administracion" element={
                    <AuthGuard>
                      <BaseLayout>
                        <Administracion />
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

                  <Route path="/vehiculos" element={
                    <AuthGuard>
                      <BaseLayout>
                        <Vehiculos />
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

                  <Route path="/administracion/usuarios" element={
                    <AuthGuard>
                      <BaseLayout>
                        <SuperuserManagement />
                      </BaseLayout>
                    </AuthGuard>
                  } />
                </Routes>
              </AuthProvider>
            </Router>
            <Toaster />
          </div>
        </TooltipProvider>
      </SecurityProvider>
    </QueryClientProvider>
  );
}

export default App;
