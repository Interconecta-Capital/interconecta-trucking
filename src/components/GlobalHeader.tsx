
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserMenu } from '@/components/UserMenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Search, 
  Plus, 
  Calendar as CalendarIcon,
  Bell,
  MessageSquare,
  AlertTriangle,
  Wrench,
  MapPin,
  FileText
} from 'lucide-react';
import { CartaPorteForm } from '@/components/carta-porte/CartaPorteForm';

export function GlobalHeader() {
  const [showCartaPorteDialog, setShowCartaPorteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between w-full">
        {/* Left side - Search */}
        <div className="flex items-center space-x-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar viajes, clientes, cartas porte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-50">
                <div className="p-2 text-sm text-gray-500">
                  Buscar en todas las secciones...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Actions and Profile */}
        <div className="flex items-center space-x-3">
          {/* Programar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Programar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Wrench className="h-4 w-4 mr-2" />
                Mantenimiento Mecánico
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MapPin className="h-4 w-4 mr-2" />
                Revisión GPS
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Cita de Verificación
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Nuevo Viaje Button */}
          <Dialog open={showCartaPorteDialog} onOpenChange={setShowCartaPorteDialog}>
            <DialogTrigger asChild>
              <Button className="bg-trucking-orange-500 hover:bg-trucking-orange-600" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Viaje
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Carta Porte</DialogTitle>
              </DialogHeader>
              <CartaPorteForm />
            </DialogContent>
          </Dialog>

          {/* Notifications */}
          <div className="flex items-center space-x-1">
            {/* Messages */}
            <Button variant="ghost" size="sm" className="relative">
              <MessageSquare className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-500 text-white text-xs p-0 flex items-center justify-center">
                3
              </Badge>
            </Button>

            {/* Alerts */}
            <Button variant="ghost" size="sm" className="relative">
              <AlertTriangle className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-500 text-white text-xs p-0 flex items-center justify-center">
                5
              </Badge>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs p-0 flex items-center justify-center">
                2
              </Badge>
            </Button>
          </div>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
