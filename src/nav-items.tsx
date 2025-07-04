
import { HomeIcon, TruckIcon, Users, FileText, Calendar, Settings, CreditCard, Wrench } from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
  },
  {
    title: "Carta Porte",
    to: "/carta-porte",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    title: "Vehículos",
    to: "/vehiculos",
    icon: <TruckIcon className="h-4 w-4" />,
  },
  {
    title: "Conductores",
    to: "/conductores",
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: "Mantenimiento",
    to: "/mantenimiento",
    icon: <Wrench className="h-4 w-4" />,
  },
  {
    title: "Calendario",
    to: "/calendario",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    title: "Planes",
    to: "/planes",
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    title: "Configuración",
    to: "/configuracion-empresa",
    icon: <Settings className="h-4 w-4" />,
  },
];
