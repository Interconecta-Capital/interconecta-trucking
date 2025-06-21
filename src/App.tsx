
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import Dashboard from '@/pages/Dashboard';
import Viajes from '@/pages/Viajes';
import Socios from '@/pages/Socios';
import Conductores from '@/pages/Conductores';
import Vehiculos from '@/pages/Vehiculos';
import Usuarios from '@/pages/Usuarios';
import Auth from '@/pages/Auth';
import ResetPassword from '@/pages/ResetPassword';
import ForgotPassword from '@/pages/ForgotPassword';
import Facturas from '@/pages/Facturas';
import Reportes from '@/pages/Reportes';
import Tracking from '@/pages/Tracking';
import ViajeDetail from '@/pages/ViajeDetail';
import Perfil from '@/pages/Perfil';
import Notificaciones from '@/pages/Notificaciones';
import Seguridad from '@/pages/Seguridad';
import { OnboardingProvider } from '@/contexts/OnboardingProvider';
import { SecurityProvider } from '@/components/SecurityProvider';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { CSRFProvider } from '@/components/security/CSRFProtection';
import { SecurityHeaders } from '@/components/security/SecurityHeaders';
import { EnhancedSecurityProvider } from '@/components/auth/EnhancedSecurityProvider';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CSRFProvider>
        <SecurityHeaders />
        <BrowserRouter>
          <AuthProvider>
            <OnboardingProvider>
              <SecurityProvider>
                <EnhancedSecurityProvider>
                  <div className="min-h-screen bg-background font-sans antialiased">
                    <Toaster />
                    <Routes>
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/auth/register" element={<Auth />} />
                      <Route path="/auth/reset-password" element={<ResetPassword />} />
                      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                      <Route path="/" element={<Auth />} />

                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/viajes"
                        element={
                          <ProtectedRoute>
                            <Viajes />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/viajes/:id"
                        element={
                          <ProtectedRoute>
                            <ViajeDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/socios"
                        element={
                          <ProtectedRoute>
                            <Socios />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/conductores"
                        element={
                          <ProtectedRoute>
                            <Conductores />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/vehiculos"
                        element={
                          <ProtectedRoute>
                            <Vehiculos />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/usuarios"
                        element={
                          <ProtectedRoute>
                            <Usuarios />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/facturas"
                        element={
                          <ProtectedRoute>
                            <Facturas />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/reportes"
                        element={
                          <ProtectedRoute>
                            <Reportes />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/tracking"
                        element={
                          <ProtectedRoute>
                            <Tracking />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/perfil"
                        element={
                          <ProtectedRoute>
                            <Perfil />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/notificaciones"
                        element={
                          <ProtectedRoute>
                            <Notificaciones />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/seguridad"
                        element={
                          <ProtectedRoute>
                            <Seguridad />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </div>
                </EnhancedSecurityProvider>
              </SecurityProvider>
            </OnboardingProvider>
          </AuthProvider>
        </BrowserRouter>
      </CSRFProvider>
    </QueryClientProvider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

export default App;
