
import { 
  HomeIcon, 
  FileTextIcon, 
  SettingsIcon,
  LayoutDashboard,
  Car,
  Users,
  Building2,
  Truck,
  CreditCard
} from "lucide-react";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CartasPorteUnified from "./pages/CartasPorteUnified";
import CartaPorteEditor from "./pages/CartaPorteEditor";
import Vehiculos from "./pages/Vehiculos";
import Conductores from "./pages/Conductores";
import Socios from "./pages/Socios";
import Viajes from "./pages/Viajes";
import Administracion from "./pages/Administracion";
import Planes from "./pages/Planes";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 * 
 * IMPORTANTE: 
 * - /cartas-porte = Gestión y listado de documentos - PROTEGIDO
 * - /carta-porte/editor = Editor completo con todos los módulos (ubicaciones, mercancías, figuras, etc.) - PROTEGIDO
 * - /carta-porte/nuevo = Alias para crear nueva carta porte - PROTEGIDO
 * - /conductores = Gestión de conductores - PROTEGIDO
 * - /vehiculos = Gestión de vehículos - PROTEGIDO
 * - /socios = Gestión de socios - PROTEGIDO
 * - /viajes = Gestión de viajes - PROTEGIDO
 */
export const navItems = [
  {
    title: "Inicio",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Dashboard", 
    to: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Cartas Porte",
    to: "/cartas-porte",
    icon: <FileTextIcon className="h-4 w-4" />,
    page: <CartasPorteUnified />,
    requiresAuth: true,
    protectedRoute: true,
    description: "Gestión y listado de documentos de Carta Porte - PROTEGIDO"
  },
  {
    title: "Editor Carta Porte",
    to: "/carta-porte/editor/:id?",
    icon: <FileTextIcon className="h-4 w-4" />,
    page: <CartaPorteEditor />,
    hideFromNav: true,
    requiresAuth: true,
    protectedRoute: true,
    description: "Editor completo con módulos: ubicaciones, mercancías, figuras, autotransporte - PROTEGIDO"
  },
  {
    title: "Nueva Carta Porte",
    to: "/carta-porte/nuevo",
    icon: <FileTextIcon className="h-4 w-4" />,
    page: <CartaPorteEditor />,
    hideFromNav: true,
    requiresAuth: true,
    protectedRoute: true,
    description: "Crear nueva carta porte - PROTEGIDO"
  },
  {
    title: "Vehículos",
    to: "/vehiculos",
    icon: <Car className="h-4 w-4" />,
    page: <Vehiculos />,
    requiresAuth: true,
    protectedRoute: true,
    description: "Gestión de vehículos - PROTEGIDO"
  },
  {
    title: "Conductores",
    to: "/conductores",
    icon: <Users className="h-4 w-4" />,
    page: <Conductores />,
    requiresAuth: true,
    protectedRoute: true,
    description: "Gestión de conductores - PROTEGIDO"
  },
  {
    title: "Socios",
    to: "/socios",
    icon: <Building2 className="h-4 w-4" />,
    page: <Socios />,
    requiresAuth: true,
    protectedRoute: true,
    description: "Gestión de socios - PROTEGIDO"
  },
  {
    title: "Viajes",
    to: "/viajes",
    icon: <Truck className="h-4 w-4" />,
    page: <Viajes />,
    requiresAuth: true,
    protectedRoute: true,
    description: "Gestión de viajes - PROTEGIDO"
  },
  {
    title: "Administración",
    to: "/administracion",
    icon: <SettingsIcon className="h-4 w-4" />,
    page: <Administracion />,
  },
  {
    title: "Planes",
    to: "/planes",
    icon: <CreditCard className="h-4 w-4" />,
    page: <Planes />,
  },
];
