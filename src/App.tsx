
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Dashboard from './pages/Dashboard';
import Conductores from './pages/Conductores';
import Vehiculos from './pages/Vehiculos';
import Socios from './pages/Socios';
import ViajesOptimized from './pages/ViajesOptimized';
import Mantenimiento from './pages/Mantenimiento';
import Planes from './pages/Planes';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import UpdatePassword from './pages/UpdatePassword';
import CartaPorte from './pages/CartaPorte';
import CreateCartaPorte from './pages/CreateCartaPorte';
import EditCartaPorte from './pages/EditCartaPorte';
import Calendario from './pages/Calendario';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import Admin from './pages/Admin';
import { TrialExpiredGuard } from '@/components/auth/TrialExpiredGuard';
import { GlobalUpgradeModalProvider } from '@/components/common/GlobalUpgradeModalProvider';
import { useAxiosInterceptor } from '@/hooks/useAxiosInterceptor';

const queryClient = new QueryClient();

function AppContent() {
  // Configurar el interceptor de axios
  useAxiosInterceptor();

  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalUpgradeModalProvider>
          <TrialExpiredGuard>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/register" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/conductores" element={<ProtectedRoute><Conductores /></ProtectedRoute>} />
              <Route path="/vehiculos" element={<ProtectedRoute><Vehiculos /></ProtectedRoute>} />
              <Route path="/socios" element={<ProtectedRoute><Socios /></ProtectedRoute>} />
              <Route path="/viajes" element={<ProtectedRoute><ViajesOptimized /></ProtectedRoute>} />
              <Route path="/mantenimiento" element={<ProtectedRoute><Mantenimiento /></ProtectedRoute>} />
              <Route path="/planes" element={<ProtectedRoute><Planes /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/calendario" element={<ProtectedRoute><Calendario /></ProtectedRoute>} />
              
              {/* Rutas de Carta Porte */}
              <Route path="/cartas-porte" element={<ProtectedRoute><CartaPorte /></ProtectedRoute>} />
              <Route path="/cartas-porte/crear" element={<ProtectedRoute><CreateCartaPorte /></ProtectedRoute>} />
              <Route path="/cartas-porte/editar/:id" element={<ProtectedRoute><EditCartaPorte /></ProtectedRoute>} />

              {/* Rutas de Admin */}
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            </Routes>
          </TrialExpiredGuard>
        </GlobalUpgradeModalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background">
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <Toaster />
      </QueryClientProvider>
    </div>
  );
}

export default App;
