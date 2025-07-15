import { useState } from "react";
import { Plus, FileText, Search, Filter, Eye, Edit, Trash2, Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CotizacionWizard } from "@/components/cotizaciones/CotizacionWizard";
import { CotizacionViewDialog } from "@/components/cotizaciones/CotizacionViewDialog";
import { useCotizaciones } from "@/hooks/useCotizaciones";

const ESTADOS_CONFIG = {
  borrador: { label: "Borrador", color: "bg-gray-500" },
  enviada: { label: "Enviada", color: "bg-blue-500" },
  aprobada: { label: "Aprobada", color: "bg-green-500" },
  cancelada: { label: "Cancelada", color: "bg-red-500" }
};

export default function Cotizaciones() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todas");
  const [showWizard, setShowWizard] = useState(false);
  const [selectedCotizacion, setSelectedCotizacion] = useState<any>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editingCotizacion, setEditingCotizacion] = useState<any>(null);

  const { cotizaciones, isLoading } = useCotizaciones();

  const handleNewCotizacion = () => {
    setEditingCotizacion(null);
    setShowWizard(true);
  };

  const handleEditCotizacion = (cotizacion: any) => {
    setEditingCotizacion(cotizacion);
    setShowWizard(true);
  };

  const handleViewCotizacion = (cotizacion: any) => {
    setSelectedCotizacion(cotizacion);
    setShowViewDialog(true);
  };

  const filteredCotizaciones = cotizaciones?.filter((cotizacion: any) => {
    const matchesSearch = cotizacion.nombre_cotizacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cotizacion.folio_cotizacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cotizacion.origen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cotizacion.destino?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "todas" || cotizacion.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Cotizaciones
          </h1>
          <p className="text-muted-foreground">
            Gestiona cotizaciones internas y externas para tus clientes
          </p>
        </div>
        <Button onClick={handleNewCotizacion} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Cotización
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cotizaciones</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cotizaciones?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cotizaciones?.filter((c: any) => c.estado === 'enviada').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cotizaciones?.filter((c: any) => c.estado === 'aprobada').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Borrador</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cotizaciones?.filter((c: any) => c.estado === 'borrador').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, folio, origen o destino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Estado: {statusFilter === "todas" ? "Todas" : ESTADOS_CONFIG[statusFilter as keyof typeof ESTADOS_CONFIG]?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("todas")}>
              Todas
            </DropdownMenuItem>
            {Object.entries(ESTADOS_CONFIG).map(([key, config]) => (
              <DropdownMenuItem key={key} onClick={() => setStatusFilter(key)}>
                {config.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Folio</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Cargando cotizaciones...
                  </TableCell>
                </TableRow>
              ) : filteredCotizaciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No se encontraron cotizaciones
                  </TableCell>
                </TableRow>
              ) : (
                filteredCotizaciones.map((cotizacion: any) => (
                  <TableRow key={cotizacion.id}>
                    <TableCell className="font-medium">
                      {cotizacion.folio_cotizacion}
                    </TableCell>
                    <TableCell>{cotizacion.nombre_cotizacion}</TableCell>
                    <TableCell>
                      {cotizacion.origen} → {cotizacion.destino}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`${ESTADOS_CONFIG[cotizacion.estado as keyof typeof ESTADOS_CONFIG]?.color} text-white`}
                      >
                        {ESTADOS_CONFIG[cotizacion.estado as keyof typeof ESTADOS_CONFIG]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      ${cotizacion.precio_cotizado?.toLocaleString() || "0"}
                    </TableCell>
                    <TableCell>
                      {new Date(cotizacion.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            ...
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewCotizacion(cotizacion)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditCotizacion(cotizacion)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Descargar PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="h-4 w-4 mr-2" />
                            Enviar Cliente
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Wizard Modal */}
      <CotizacionWizard 
        open={showWizard}
        onClose={() => setShowWizard(false)}
        editingCotizacion={editingCotizacion}
      />

      {/* View Dialog */}
      <CotizacionViewDialog 
        cotizacion={selectedCotizacion}
        open={showViewDialog}
        onClose={() => setShowViewDialog(false)}
      />
    </div>
  );
}