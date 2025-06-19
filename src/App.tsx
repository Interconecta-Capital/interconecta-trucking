
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { navItems } from "./nav-items"
import { AuthProvider } from "./contexts/AuthContext"
import Index from "./pages/Index"
import NewCartaPorte from "./pages/NewCartaPorte"
import EditCartaPorte from "./pages/EditCartaPorte"
import GestionBorradores from "./pages/GestionBorradores"

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/carta-porte/nuevo" element={<NewCartaPorte />} />
            <Route path="/carta-porte/:id" element={<EditCartaPorte />} />
            <Route path="/borradores" element={<GestionBorradores />} />
            {navItems.map((item) => (
              <Route key={item.to} path={item.to} element={<item.page />} />
            ))}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
)

export default App
