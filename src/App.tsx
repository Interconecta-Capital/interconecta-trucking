import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { Dashboard } from '@/pages/Dashboard';
import { Viajes } from '@/pages/Viajes';
import { Socios } from '@/pages/Socios';
import { Conductores } from '@/pages/Conductores';
import { Vehiculos } from '@/pages/Vehiculos';
import { Usuarios } from '@/pages/Usuarios';
import { Auth } from '@/pages/Auth';
import { OnboardingProvider } from '@/contexts/OnboardingProvider';
import { SecurityProvider } from '@/components/SecurityProvider';
import { Toaster } from 'sonner';
import { QueryClient } from '@tanstack/react-query';
import { Facturas } from '@/pages/Facturas';
import { Reportes } from '@/pages/Reportes';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ViajeDetail } from '@/pages/ViajeDetail';
import { Perfil } from '@/pages/Perfil';
import { ResetPassword } from '@/pages/ResetPassword';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { Tracking } from '@/pages/Tracking';
import { Notificaciones } from '@/pages/Notificaciones';
import { Seguridad } from '@/pages/Seguridad';
import { CSRFProvider } from '@/components/security/CSRFProtection';
import { SecurityHeaders } from '@/components/security/SecurityHeaders';
import { EnhancedSecurityProvider } from '@/components/auth/EnhancedSecurityProvider';

function App() {
  return (
    <QueryClient>
      <CSRFProvider>
        <SecurityHeaders />
        <AuthProvider>
          <OnboardingProvider>
            <SecurityProvider>
              <EnhancedSecurityProvider>
                <BrowserRouter>
                  <div className="min-h-screen bg-background font-sans antialiased">
                    <Toaster />
                    <Routes>
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/auth/register" element={<Auth />} />
                      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                      <Route path="/auth/reset-password" element={<ResetPassword />} />
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
                        path="/perfil"
                        element={
                          <ProtectedRoute>
                            <Perfil />
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
                </BrowserRouter>
              </EnhancedSecurityProvider>
            </SecurityProvider>
          </OnboardingProvider>
        </AuthProvider>
      </CSRFProvider>
    </QueryClient>
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
