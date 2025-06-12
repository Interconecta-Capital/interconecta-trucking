
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Upload, Eye, Save } from 'lucide-react';

export function PersonalizacionPanel() {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [colorPrimario, setColorPrimario] = useState('#3B82F6');
  const [colorSecundario, setColorSecundario] = useState('#1E40AF');

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Logo de la Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="logo-upload">Subir Logo</Label>
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="mt-1"
            />
          </div>
          {logoFile && (
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">
                Archivo seleccionado: {logoFile.name}
              </p>
            </div>
          )}
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Guardar Logo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personalización de Colores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color-primario">Color Primario</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color-primario"
                  type="color"
                  value={colorPrimario}
                  onChange={(e) => setColorPrimario(e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  type="text"
                  value={colorPrimario}
                  onChange={(e) => setColorPrimario(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="color-secundario">Color Secundario</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color-secundario"
                  type="color"
                  value={colorSecundario}
                  onChange={(e) => setColorSecundario(e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  type="text"
                  value={colorSecundario}
                  onChange={(e) => setColorSecundario(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Vista Previa
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Aplicar Cambios
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Panel Personalizado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Configure widgets y elementos personalizados para el dashboard principal.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Widgets Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Estadísticas de cartas porte</li>
                  <li>• Gráficos de rendimiento</li>
                  <li>• Calendario de eventos</li>
                  <li>• Estado de vehículos</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuración</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Personalizar Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
