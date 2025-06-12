
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SecurityProvider } from "@/components/SecurityProvider";
import Dashboard from "./pages/Dashboard";
import Planes from "./pages/Planes";
import { AuthGuard } from "./components/auth/AuthGuard";
import Auth from "./pages/Auth";
import { BaseLayout } from "./components/layout/BaseLayout";
import CartasPorte from "./pages/CartasPorte";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SecurityProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Router>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />
                <Route path="/recover-password" element={<Auth />} />
                <Route path="/new-password" element={<Auth />} />

                <Route path="/" element={
                  <AuthGuard>
                    <Navigate to="/dashboard" replace />
                  </AuthGuard>
                } />

                <Route path="/dashboard" element={
                  <AuthGuard>
                    <BaseLayout>
                      <Dashboard />
                    </BaseLayout>
                  </AuthGuard>
                } />

                <Route path="/planes" element={
                  <AuthGuard>
                    <Planes />
                  </AuthGuard>
                } />

                <Route path="/cartas-porte" element={
                  <AuthGuard>
                    <BaseLayout>
                      <CartasPorte />
                    </BaseLayout>
                  </AuthGuard>
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
