
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Trial from "./pages/Trial";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import CartasPorte from "./pages/CartasPorte";
import Conductores from "./pages/Conductores";
import Vehiculos from "./pages/Vehiculos";
import Socios from "./pages/Socios";
import NotFound from "./pages/NotFound";
import { FloatingNotificationsContainer } from "@/components/ui/floating-notifications-container";
import { useFloatingNotifications } from "@/hooks/useFloatingNotifications";

const queryClient = new QueryClient();

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Index />} />
        <Route path="/auth/login" element={<Auth />} />
        <Route path="/auth/register" element={<Auth />} />
        <Route path="/auth/trial" element={<Trial />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        
        {/* Rutas protegidas */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <SidebarProvider>
              <Dashboard />
            </SidebarProvider>
          </ProtectedRoute>
        } />
        <Route path="/cartas-porte" element={
          <ProtectedRoute>
            <SidebarProvider>
              <CartasPorte />
            </SidebarProvider>
          </ProtectedRoute>
        } />
        <Route path="/conductores" element={
          <ProtectedRoute>
            <SidebarProvider>
              <Conductores />
            </SidebarProvider>
          </ProtectedRoute>
        } />
        <Route path="/vehiculos" element={
          <ProtectedRoute>
            <SidebarProvider>
              <Vehiculos />
            </SidebarProvider>
          </ProtectedRoute>
        } />
        <Route path="/socios" element={
          <ProtectedRoute>
            <SidebarProvider>
              <Socios />
            </SidebarProvider>
          </ProtectedRoute>
        } />
        
        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => {
  const { notifications, removeNotification } = useFloatingNotifications();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <FloatingNotificationsContainer 
            notifications={notifications}
            onDismiss={removeNotification}
          />
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
