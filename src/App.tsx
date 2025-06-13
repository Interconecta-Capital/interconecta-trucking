
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SecurityProvider } from "@/components/SecurityProvider";
import { SimpleAuthGuard } from "@/components/auth/SimpleAuthGuard";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Planes from "./pages/Planes";
import Vehiculos from "./pages/Vehiculos";
import Conductores from "./pages/Conductores";
import Socios from "./pages/Socios";
import Viajes from "./pages/Viajes";
import Administracion from "./pages/Administracion";
import Auth from "./pages/Auth";
import Trial from "./pages/Trial";
import { BaseLayout } from "./components/layout/BaseLayout";
import CartasPorte from "./pages/CartasPorte";
import NewCartaPorte from "./pages/NewCartaPorte";
import EditCartaPorte from "./pages/EditCartaPorte";
import SuperuserManagement from "./pages/SuperuserManagement";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
                <Route path="/auth/register" element={<Auth />} />
                <Route path="/auth/trial" element={<Trial />} />
                <Route path="/trial" element={<Trial />} />
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route path="/register" element={<Navigate to="/auth" replace />} />

                {/* Rutas protegidas - todas con BaseLayout */}
                <Route path="/dashboard" element={
                  <SimpleAuthGuard>
                    <BaseLayout>
                      <Dashboard />
                    </BaseLayout>
                  </SimpleAuthGuard>
                } />

                <Route path="/cartas-porte" element={
                  <SimpleAuthGuard>
                    <BaseLayout>
                      <CartasPorte />
                    </BaseLayout>
                  </SimpleAuthGuard>
                } />

                <Route path="/cartas-porte/nueva" element={
                  <SimpleAuthGuard>
                    <BaseLayout>
                      <NewCartaPorte />
                    </BaseLayout>
                  </SimpleAuthGuard>
                } />

                <Route path="/cartas-porte/editar/:id" element={
                  <SimpleAuthGuard>
                    <BaseLayout>
                      <EditCartaPorte />
                    </BaseLayout>
                  </SimpleAuthGuard>
                } />

                <Route path="/viajes" element={
                  <SimpleAuthGuard>
                    <BaseLayout>
                      <Viajes />
                    </BaseLayout>
                  </SimpleAuthGuard>
                } />

                <Route path="/administracion" element={
                  <SimpleAuthGuard>
                    <BaseLayout>
                      <Administracion />
                    </BaseLayout>
                  </SimpleAuthGuard>
                } />

                <Route path="/planes" element={
                  <SimpleAuthGuard>
                    <BaseLayout>
                      <Planes />
                    </BaseLayout>
                  </SimpleAuthGuard>
                } />

                <Route path="/vehiculos" element={
                  <SimpleAuthGuard>
                    <BaseLayout>
                      <Vehiculos />
                    </BaseLayout>
                  </SimpleAuthGuard>
                } />

                <Route path="/conductores" element={
                  <SimpleAuthGuard>
                    <BaseLayout>
                      <Conductores />
                    </BaseLayout>
                  </SimpleAuthGuard>
                } />

                <Route path="/socios" element={
                  <SimpleAuthGuard>
                    <BaseLayout>
                      <Socios />
                    </BaseLayout>
                  </SimpleAuthGuard>
                } />

                <Route path="/administracion/usuarios" element={
                  <SimpleAuthGuard>
                    <BaseLayout>
                      <SuperuserManagement />
                    </BaseLayout>
                  </SimpleAuthGuard>
                } />
              </Routes>
            </Router>
            <Toaster />
          </div>
        </TooltipProvider>
      </SecurityProvider>
    </QueryClientProvider>
  );
}

export default App;
