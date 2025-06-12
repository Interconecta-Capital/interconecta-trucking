
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AppSidebar } from '@/components/AppSidebar';
import { GlobalHeader } from '@/components/GlobalHeader';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import CartasPorte from '@/pages/CartasPorte';
import Conductores from '@/pages/Conductores';
import Vehiculos from '@/pages/Vehiculos';
import Socios from '@/pages/Socios';
import Planes from '@/pages/Planes';
import ResetPassword from '@/pages/ResetPassword';
import Trial from '@/pages/Trial';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
    },
  },
});

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <GlobalHeader />
          <main className="flex-1 p-6 bg-gray-50">
            <AuthGuard>
              {children}
            </AuthGuard>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            
            {/* Rutas protegidas */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cartas-porte" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CartasPorte />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/conductores" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Conductores />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vehiculos" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Vehiculos />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/socios" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Socios />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/planes" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Planes />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/trial" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Trial />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Redirección por defecto */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <SonnerToaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
