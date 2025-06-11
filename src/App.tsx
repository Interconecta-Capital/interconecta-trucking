
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth/LoginForm";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CartasPorte from "./pages/CartasPorte";
import Conductores from "./pages/Conductores";
import Vehiculos from "./pages/Vehiculos";
import Socios from "./pages/Socios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <BrowserRouter>
      <SidebarProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cartas-porte" element={<CartasPorte />} />
          <Route path="/conductores" element={<Conductores />} />
          <Route path="/vehiculos" element={<Vehiculos />} />
          <Route path="/socios" element={<Socios />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SidebarProvider>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
