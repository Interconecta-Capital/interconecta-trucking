
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CartasPorte() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cartas Porte Activas
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Consulta y gestiona tus documentos de Carta Porte generados
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos Generados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay cartas porte generadas</h3>
                <p className="text-muted-foreground mb-6">
                  Crea tu primera carta porte para comenzar a ver documentos aquí
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => navigate('/carta-porte/nuevo')} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Carta Porte
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/borradores')} className="gap-2">
                    <Search className="h-4 w-4" />
                    Ver Borradores
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
