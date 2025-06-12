
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CartasPorte() {
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Cartas Porte</h1>
          <p className="text-muted-foreground">
            Gestiona tus cartas de porte electrónicas
          </p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link to="/cartas-porte/nueva">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Carta Porte
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Total de Cartas
            </CardTitle>
            <CardDescription>
              Cartas de porte generadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Actualmente sin cartas registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pendientes</CardTitle>
            <CardDescription>
              Por procesar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completadas</CardTitle>
            <CardDescription>
              Cartas finalizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cartas Porte</CardTitle>
          <CardDescription>
            Gestiona todas tus cartas de porte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay cartas registradas</h3>
            <p className="text-muted-foreground mb-4">
              Comienza creando tu primera carta de porte
            </p>
            <Button asChild>
              <Link to="/cartas-porte/nueva">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Carta
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
