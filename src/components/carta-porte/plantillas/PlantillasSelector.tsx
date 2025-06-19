
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlantillas } from '@/hooks/usePlantillas';
import { PlantillaData } from '@/types/cartaPorte';
import { PlantillaCard } from './PlantillaCard';
import { 
  Search, 
  FileText, 
  Globe, 
  Star, 
  Clock,
  Filter
} from 'lucide-react';

interface PlantillasSelectorProps {
  onSelectPlantilla: (plantilla: PlantillaData) => void;
  onClose: () => void;
}

export function PlantillasSelector({ onSelectPlantilla, onClose }: PlantillasSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResults, setFilteredResults] = useState<PlantillaData[]>([]);
  const [searching, setSearching] = useState(false);
  
  const { 
    plantillas, 
    plantillasPublicas, 
    loading,
    buscarPlantillas,
    getPlantillasFrecuentes
  } = usePlantillas();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await buscarPlantillas(searchTerm);
      setFilteredResults(results || []);
    } catch (error) {
      console.error('Error searching plantillas:', error);
    } finally {
      setSearching(false);
    }
  };

  const plantillasFrecuentes = getPlantillasFrecuentes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Seleccionar Plantilla</h2>
        <Button variant="outline" onClick={onClose}>
          Crear desde Cero
        </Button>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Buscar Plantillas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Buscar por nombre, descripción o tipo de carga..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {filteredResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Resultados de Búsqueda</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResults.map((plantilla) => (
                  <PlantillaCard
                    key={plantilla.id}
                    plantilla={plantilla}
                    onSelect={onSelectPlantilla}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs para diferentes categorías */}
      <Tabs defaultValue="frecuentes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="frecuentes" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Frecuentes</span>
          </TabsTrigger>
          <TabsTrigger value="mias" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Mis Plantillas</span>
          </TabsTrigger>
          <TabsTrigger value="publicas" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Públicas</span>
          </TabsTrigger>
          <TabsTrigger value="recientes" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Recientes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="frecuentes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Plantillas Más Utilizadas</h3>
            <Badge variant="secondary">{plantillasFrecuentes.length} plantillas</Badge>
          </div>
          
          {plantillasFrecuentes.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No tienes plantillas frecuentes aún</p>
              <p className="text-sm text-gray-500 mt-2">
                Las plantillas que uses más seguido aparecerán aquí
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plantillasFrecuentes.map((plantilla) => (
                <PlantillaCard
                  key={plantilla.id}
                  plantilla={plantilla}
                  onSelect={onSelectPlantilla}
                  showUsageCount
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mias" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Mis Plantillas</h3>
            <Badge variant="secondary">{plantillas.length} plantillas</Badge>
          </div>
          
          {plantillas.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No tienes plantillas guardadas</p>
              <p className="text-sm text-gray-500 mt-2">
                Crea una carta porte y guárdala como plantilla para reutilizarla
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plantillas.map((plantilla) => (
                <PlantillaCard
                  key={plantilla.id}
                  plantilla={plantilla}
                  onSelect={onSelectPlantilla}
                  showActions
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="publicas" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Plantillas Públicas</h3>
            <Badge variant="secondary">{plantillasPublicas.length} plantillas</Badge>
          </div>
          
          {plantillasPublicas.length === 0 ? (
            <Card className="p-8 text-center">
              <Globe className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No hay plantillas públicas disponibles</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plantillasPublicas.map((plantilla) => (
                <PlantillaCard
                  key={plantilla.id}
                  plantilla={plantilla}
                  onSelect={onSelectPlantilla}
                  isPublic
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recientes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Plantillas Recientes</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plantillas
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
              .slice(0, 6)
              .map((plantilla) => (
                <PlantillaCard
                  key={plantilla.id}
                  plantilla={plantilla}
                  onSelect={onSelectPlantilla}
                  showDate
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando plantillas...</p>
        </div>
      )}
    </div>
  );
}
