
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import { CartasPorteTable } from '@/components/cartas-porte/CartasPorteTable';
import { Link } from 'react-router-dom';
import { UnifiedPageNavigation } from '@/components/common/UnifiedPageNavigation';

export default function CartasPorteUnified() {
  const { cartasPorte, loading, error } = useCartasPorte();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Filtrar cartas porte
  const filteredCartasPorte = cartasPorte.filter(carta => {
    const matchesSearch = !searchTerm || 
      carta.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carta.rfc_emisor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carta.rfc_receptor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || carta.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Métricas
  const totalCartas = cartasPorte.length;
  const cartasTimbradas = cartasPorte.filter(c => c.status === 'timbrada').length;
  const cartasBorrador = cartasPorte.filter(c => c.status === 'borrador').length;
  const cartasCanceladas = cartasPorte.filter(c => c.status === 'cancelada').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <UnifiedPageNavigation 
          title="Cartas Porte" 
          description="Gestiona tus documentos de Carta Porte CFDI 3.1"
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando cartas porte...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <UnifiedPageNavigation 
          title="Cartas Porte" 
          description="Gestiona tus documentos de Carta Porte CFDI 3.1"
        />
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
              <p className="text-gray-600">No se pudieron cargar las cartas porte. Por favor, intenta de nuevo.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UnifiedPageNavigation 
        title="Cartas Porte" 
        description="Gestiona tus documentos de Carta Porte CFDI 3.1"
      >
        <Link to="/carta-porte/editor">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Carta Porte
          </Button>
        </Link>
      </UnifiedPageNavigation>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCartas}</div>
            <div className="text-xs text-gray-600">Cartas porte</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timbradas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{cartasTimbradas}</div>
            <div className="text-xs text-gray-600">Válidas fiscalmente</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borradores</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{cartasBorrador}</div>
            <div className="text-xs text-gray-600">Pendientes</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{cartasCanceladas}</div>
            <div className="text-xs text-gray-600">Sin efecto fiscal</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de cartas porte con pestañas */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Documentos CFDI</CardTitle>
            <Badge variant="secondary">{filteredCartasPorte.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Buscar por folio, RFC emisor o RFC receptor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="borrador">Borradores</option>
                <option value="timbrada">Timbradas</option>
                <option value="cancelada">Canceladas</option>
              </select>
            </div>
            
            <Tabs defaultValue="todas" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="todas">
                  Todas
                  <Badge variant="secondary" className="ml-2">{totalCartas}</Badge>
                </TabsTrigger>
                <TabsTrigger value="timbradas">
                  Timbradas
                  <Badge variant="secondary" className="ml-2">{cartasTimbradas}</Badge>
                </TabsTrigger>
                <TabsTrigger value="borradores">
                  Borradores
                  <Badge variant="secondary" className="ml-2">{cartasBorrador}</Badge>
                </TabsTrigger>
                <TabsTrigger value="canceladas">
                  Canceladas
                  <Badge variant="secondary" className="ml-2">{cartasCanceladas}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="todas" className="mt-6">
                <CartasPorteTable cartasPorte={filteredCartasPorte} loading={loading} />
              </TabsContent>

              <TabsContent value="timbradas" className="mt-6">
                <CartasPorteTable 
                  cartasPorte={filteredCartasPorte.filter(c => c.status === 'timbrada')} 
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="borradores" className="mt-6">
                <CartasPorteTable 
                  cartasPorte={filteredCartasPorte.filter(c => c.status === 'borrador')} 
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="canceladas" className="mt-6">
                <CartasPorteTable 
                  cartasPorte={filteredCartasPorte.filter(c => c.status === 'cancelada')} 
                  loading={loading}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
