import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SecurityProvider } from "@/components/SecurityProvider";
import Dashboard from "./pages/Dashboard";
import Planes from "./pages/Planes";
import { AuthGuard } from "./components/auth/AuthGuard";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { RecoverPassword } from "./pages/RecoverPassword";
import { NewPassword } from "./pages/NewPassword";
import { useAuth } from "./hooks/useAuth";
import { BaseLayout } from "./components/layout/BaseLayout";
import { Button } from "./components/ui/button";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import CartasPorte from "./pages/CartasPorte";
import CartaPorteDetail from "./pages/CartaPorteDetail";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SecurityProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/recover-password" element={<RecoverPassword />} />
                <Route path="/new-password" element={<NewPassword />} />

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

                <Route path="/cartas-porte/:id" element={
                  <AuthGuard>
                    <BaseLayout>
                      <CartaPorteDetail />
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
