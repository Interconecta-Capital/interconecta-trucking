
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

// Configure React Query with optimized settings to prevent auto-refresh issues
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false, // Disable auto-refetch on window focus
      refetchOnReconnect: false,   // Disable auto-refetch on reconnect
      refetchOnMount: false,       // Disable auto-refetch on mount
      retry: (failureCount, error: any) => {
        // Don't retry on authentication or RLS errors
        if (error?.status === 401 || error?.code === 'PGRST116') {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
        <AuthProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background font-sans antialiased">
              <Router>
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
              </Router>
              <Toaster />
            </div>
          </TooltipProvider>
        </AuthProvider>
      </SecurityProvider>
    </QueryClientProvider>
  );
}

export default App;
