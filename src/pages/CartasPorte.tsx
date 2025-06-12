
import { useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CartaPorteForm } from '@/components/carta-porte/CartaPorteForm';
import { Plus, FileText, Search, Filter } from 'lucide-react';

export default function CartasPorte() {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="p-3 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 space-y-3 sm:space-y-0">
              <h1 className="text-xl md:text-2xl font-bold">Nueva Carta Porte</h1>
              <Button 
                variant="outline" 
                onClick={() => setShowForm(false)}
                className="w-full sm:w-auto"
              >
                Volver a Lista
              </Button>
            </div>
            <CartaPorteForm />
          </div>
        </SidebarInset>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <SidebarInset className="flex-1">
        <div className="p-3 md:p-6 space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <h1 className="text-2xl md:text-3xl font-bold">Cartas Porte</h1>
            <Button 
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Carta Porte</span>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
            <div className="relative flex-1 w-full md:max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por folio, RFC o UUID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2 w-full md:w-auto">
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 border-gray-300">
              <CardContent className="p-4 md:p-6 text-center">
                <Plus className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-gray-400" />
                <h3 className="font-semibold mb-2 text-sm md:text-base">Crear Nueva Carta Porte</h3>
                <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
                  Formulario inteligente con autocompletado y validación SAT
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="w-full text-sm"
                >
                  Comenzar
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg">CP-2024-001</CardTitle>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Timbrado
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs md:text-sm">
                  <p><span className="font-medium">Emisor:</span> TRANSPORTES ABC SA</p>
                  <p><span className="font-medium">Receptor:</span> CLIENTE XYZ SA</p>
                  <p><span className="font-medium">Origen:</span> CDMX</p>
                  <p><span className="font-medium">Destino:</span> Guadalajara</p>
                  <p><span className="font-medium">Fecha:</span> 15/01/2024</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg">CP-2024-002</CardTitle>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Borrador
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs md:text-sm">
                  <p><span className="font-medium">Emisor:</span> TRANSPORTES ABC SA</p>
                  <p><span className="font-medium">Receptor:</span> EMPRESA DEF SA</p>
                  <p><span className="font-medium">Origen:</span> Monterrey</p>
                  <p><span className="font-medium">Destino:</span> Tijuana</p>
                  <p><span className="font-medium">Fecha:</span> 16/01/2024</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}
