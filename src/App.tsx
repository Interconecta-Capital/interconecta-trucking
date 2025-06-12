
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
import { AuthGuard } from "./components/auth/AuthGuard";
import Auth from "./pages/Auth";
import Trial from "./pages/Trial";
import { BaseLayout } from "./components/layout/BaseLayout";
import CartasPorte from "./pages/CartasPorte";
import NewCartaPorte from "./pages/NewCartaPorte";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SecurityProvider>
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
                </Routes>
              </Router>
              <Toaster />
            </div>
          </TooltipProvider>
        </SecurityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
