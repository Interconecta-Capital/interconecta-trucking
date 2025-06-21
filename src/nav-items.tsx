
import { 
  HomeIcon, 
  FileTextIcon, 
  SettingsIcon,
  LayoutDashboard,
  Car,
  Users,
  Building2,
  Truck,
  CreditCard,
  AlertTriangle
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
import ConfiguracionEmpresa from "./pages/ConfiguracionEmpresa";
import DebugPermissionsTest from "./pages/DebugPermissionsTest";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 * 
 * IMPORTANTE: 
 * - /cartas-porte = Gestión y listado de documentos
 * - /carta-porte/editor = Editor completo con todos los módulos (ubicaciones, mercancías, figuras, etc.)
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
    description: "Gestión y listado de documentos de Carta Porte"
  },
  {
    title: "Editor Carta Porte",
    to: "/carta-porte/editor/:id?",
    icon: <FileTextIcon className="h-4 w-4" />,
    page: <CartaPorteEditor />,
    hideFromNav: true,
    description: "Editor completo con módulos: ubicaciones, mercancías, figuras, autotransporte"
  },
  {
    title: "Vehículos",
    to: "/vehiculos",
    icon: <Car className="h-4 w-4" />,
    page: <Vehiculos />,
  },
  {
    title: "Conductores",
    to: "/conductores",
    icon: <Users className="h-4 w-4" />,
    page: <Conductores />,
  },
  {
    title: "Socios",
    to: "/socios",
    icon: <Building2 className="h-4 w-4" />,
    page: <Socios />,
  },
  {
    title: "Viajes",
    to: "/viajes",
    icon: <Truck className="h-4 w-4" />,
    page: <Viajes />,
  },
  {
    title: "Administración",
    to: "/administracion",
    icon: <SettingsIcon className="h-4 w-4" />,
    page: <Administracion />,
  },
  {
    title: "Mi Empresa",
    to: "/configuracion/empresa",
    icon: <Building2 className="h-4 w-4" />,
    page: <ConfiguracionEmpresa />,
    hideFromNav: true,
    description: "Configuración de datos fiscales y certificados digitales"
  },
  {
    title: "Planes",
    to: "/planes",
    icon: <CreditCard className="h-4 w-4" />,
    page: <Planes />,
  },
  {
    title: "Debug: Permisos V2",
    to: "/debug/permissions-test",
    icon: <AlertTriangle className="h-4 w-4" />,
    page: <DebugPermissionsTest />,
    hideFromNav: true,
    description: "Página de validación para el nuevo sistema de permisos"
  },
];
