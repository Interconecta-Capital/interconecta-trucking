
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, FolderOpen, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Carta Porte 3.1
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gestiona de manera eficiente tus documentos de Carta Porte con nuestro sistema integrado
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Crear Nueva Carta Porte */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Nueva Carta Porte
              </CardTitle>
              <CardDescription>
                Crear una nueva Carta Porte desde cero con nuestro asistente paso a paso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => navigate('/carta-porte/nuevo')}
              >
                Crear Nueva
              </Button>
            </CardContent>
          </Card>

          {/* Gestión de Borradores */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-green-600" />
                Gestión de Borradores
              </CardTitle>
              <CardDescription>
                Administra tus borradores guardados y conviértelos en documentos oficiales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/borradores')}
              >
                Ver Borradores
              </Button>
            </CardContent>
          </Card>

          {/* Cartas Porte Activas */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Cartas Porte Activas
              </CardTitle>
              <CardDescription>
                Consulta y gestiona tus documentos de Carta Porte generados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/cartas-porte')}
              >
                Ver Documentos
              </Button>
            </CardContent>
          </Card>

          {/* Reportes y Estadísticas */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                Panel de Control
              </CardTitle>
              <CardDescription>
                Visualiza estadísticas y reportes de tus Cartas Porte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Borradores Activos</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Documentos Generados</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-gray-600">Documentos Timbrados</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Características destacadas */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Características del Sistema
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Cumplimiento SAT</h3>
              <p className="text-sm text-gray-600">
                100% compatible con los requerimientos del SAT para Carta Porte 3.1
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fácil de Usar</h3>
              <p className="text-sm text-gray-600">
                Interfaz intuitiva con asistente paso a paso para crear documentos
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Gestión Avanzada</h3>
              <p className="text-sm text-gray-600">
                Sistema completo de borradores y documentos oficiales
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Reportes</h3>
              <p className="text-sm text-gray-600">
                Estadísticas detalladas y reportes de tus operaciones
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
