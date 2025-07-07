
import './App.css';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CartasPorte from "./pages/CartasPorte";
import Vehiculos from "./pages/Vehiculos";
import Conductores from "./pages/Conductores";
import Socios from "./pages/Socios";
import Viajes from "./pages/Viajes";
import Borradores from "./pages/Borradores";
import Calendario from "./pages/Calendario";
import Mantenimiento from "./pages/Mantenimiento";
import Configuracion from "./pages/Configuracion";
import ViajesAnalyticsPage from "./pages/ViajesAnalytics";
import ReportesAutomaticosPage from "./pages/ReportesAutomaticos";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={
                  <SidebarProvider>
                    <AppSidebar />
                    <main className="flex-1">
                      <Dashboard />
                    </main>
                  </SidebarProvider>
                } />
                <Route path="/cartas-porte" element={
                  <SidebarProvider>
                    <AppSidebar />
                    <main className="flex-1">
                      <CartasPorte />
                    </main>
                  </SidebarProvider>
                } />
                <Route path="/vehiculos" element={
                  <SidebarProvider>
                    <AppSidebar />
                    <main className="flex-1">
                      <Vehiculos />
                    </main>
                  </SidebarProvider>
                } />
                <Route path="/conductores" element={
                  <SidebarProvider>
                    <AppSidebar />
                    <main className="flex-1">
                      <Conductores />
                    </main>
                  </SidebarProvider>
                } />
                <Route path="/socios" element={
                  <SidebarProvider>
                    <AppSidebar />
                    <main className="flex-1">
                      <Socios />
                    </main>
                  </SidebarProvider>
                } />
                <Route path="/viajes" element={
                  <SidebarProvider>
                    <AppSidebar />
                    <main className="flex-1">
                      <Viajes />
                    </main>
                  </SidebarProvider>
                } />
                <Route path="/borradores" element={
                  <SidebarProvider>
                    <AppSidebar />
                    <main className="flex-1">
                      <Borradores />
                    </main>
                  </SidebarProvider>
                } />
                <Route path="/calendario" element={
                  <SidebarProvider>
                    <AppSidebar />
                    <main className="flex-1">
                      <Calendario />
                    </main>
                  </SidebarProvider>
                } />
                <Route path="/mantenimiento" element={
                  <SidebarProvider>
                    <AppSidebar />
                    <main className="flex-1">
                      <Socios />
                    </main>
                  </SidebarProvider>
                } />
                <Route path="/configuracion" element={
                  <SidebarProvider>
                    <AppSidebar />
                    <main className="flex-1">
                      <Configuracion />
                    </main>
                  </SidebarProvider>
                } />
                <Route path="/analytics/viajes" element={
                  <SidebarProvider>
                    <AppSidebar />
                    <main className="flex-1">
                      <ViajesAnalyticsPage />
                    </main>
                  </SidebarProvider>
                } />
                <Route path="/reportes-automaticos" element={
                  <SidebarProvider>
                    <AppSidebar />
                    <main className="flex-1">
                      <ReportesAutomaticosPage />
                    </main>
                  </SidebarProvider>
                } />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
