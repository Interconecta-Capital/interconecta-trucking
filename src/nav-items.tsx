
import { HomeIcon, FileTextIcon, FolderOpenIcon, SettingsIcon } from "lucide-react";
import Index from "./pages/Index.jsx";
import GestionBorradores from "./pages/GestionBorradores.jsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Inicio",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Borradores",
    to: "/borradores", 
    icon: <FolderOpenIcon className="h-4 w-4" />,
    page: <GestionBorradores />,
  },
  {
    title: "Cartas Porte",
    to: "/cartas-porte",
    icon: <FileTextIcon className="h-4 w-4" />,
    page: <div>Cartas Porte - En desarrollo</div>,
  },
  {
    title: "Configuración",
    to: "/configuracion",
    icon: <SettingsIcon className="h-4 w-4" />,
    page: <div>Configuración - En desarrollo</div>,
  },
];
