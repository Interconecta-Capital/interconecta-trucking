
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import Dashboard from '@/pages/Dashboard';
import Viajes from '@/pages/Viajes';
import Socios from '@/pages/Socios';
import Conductores from '@/pages/Conductores';
import Vehiculos from '@/pages/Vehiculos';
import Auth from '@/pages/Auth';
import ResetPassword from '@/pages/ResetPassword';
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
                    </Routes>
                  </div>
                </BrowserRouter>
              </EnhancedSecurityProvider>
            </SecurityProvider>
          </OnboardingProvider>
        </AuthProvider>
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
