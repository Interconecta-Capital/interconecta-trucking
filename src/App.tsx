
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryOptimizedProvider } from "@/components/QueryOptimizedProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Trial from "./pages/Trial";
import Dashboard from "./pages/Dashboard";
import CartasPorte from "./pages/CartasPorte";
import NewCartaPorte from "./pages/NewCartaPorte";
import EditCartaPorte from "./pages/EditCartaPorte";
import Vehiculos from "./pages/Vehiculos";
import Conductores from "./pages/Conductores";
import Socios from "./pages/Socios";
import Viajes from "./pages/Viajes";
import Administracion from "./pages/Administracion";
import Planes from "./pages/Planes";
import SuperuserManagement from "./pages/SuperuserManagement";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <QueryOptimizedProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/login" element={<Auth />} />
              <Route path="/auth/trial" element={<Trial />} />
              <Route path="/planes" element={<Planes />} />
              
              {/* Rutas protegidas */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/cartas-porte" element={
                <ProtectedRoute>
                  <CartasPorte />
                </ProtectedRoute>
              } />
              
              <Route path="/cartas-porte/nueva" element={
                <ProtectedRoute>
                  <NewCartaPorte />
                </ProtectedRoute>
              } />
              
              <Route path="/cartas-porte/editar/:id" element={
                <ProtectedRoute>
                  <EditCartaPorte />
                </ProtectedRoute>
              } />
              
              <Route path="/vehiculos" element={
                <ProtectedRoute>
                  <Vehiculos />
                </ProtectedRoute>
              } />
              
              <Route path="/conductores" element={
                <ProtectedRoute>
                  <Conductores />
                </ProtectedRoute>
              } />
              
              <Route path="/socios" element={
                <ProtectedRoute>
                  <Socios />
                </ProtectedRoute>
              } />
              
              <Route path="/viajes" element={
                <ProtectedRoute>
                  <Viajes />
                </ProtectedRoute>
              } />
              
              <Route path="/administracion" element={
                <ProtectedRoute>
                  <Administracion />
                </ProtectedRoute>
              } />
              
              <Route path="/superuser" element={
                <ProtectedRoute>
                  <SuperuserManagement />
                </ProtectedRoute>
              } />
              
              {/* Ruta catch-all para 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryOptimizedProvider>
  );
}

export default App;
