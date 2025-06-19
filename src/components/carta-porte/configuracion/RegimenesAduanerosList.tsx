import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { Plus, Trash2 } from 'lucide-react';

interface RegimenesAduanerosListProps {
  regimenes: string[];
  onChange: (regs: string[]) => void;
}

export function RegimenesAduanerosList({ regimenes, onChange }: RegimenesAduanerosListProps) {
  const addRegimen = () => {
    if (regimenes.length >= 10) return;
    onChange([...regimenes, '']);
  };

  const updateRegimen = (index: number, value: string) => {
    const updated = regimenes.map((r, i) => (i === index ? value : r));
    onChange(updated);
  };

  const removeRegimen = (index: number) => {
    onChange(regimenes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Regímenes Aduaneros</h4>
        <Button type="button" variant="outline" size="sm" onClick={addRegimen} disabled={regimenes.length >= 10}>
          <Plus className="h-4 w-4 mr-2" /> Agregar Régimen Aduanero
        </Button>
      </div>

      {regimenes.length === 0 ? (
        <Card>
          <CardContent className="py-4 text-center text-muted-foreground">
            No hay régimenes aduaneros agregados
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {regimenes.map((regimen, index) => (
            <Card key={index}>
              <CardHeader className="flex items-center justify-between p-4">
                <CardTitle className="text-base">Régimen {index + 1}</CardTitle>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeRegimen(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                <CatalogoSelectorMejorado
                  tipo="regimenes_aduaneros"
                  value={regimen}
                  onValueChange={(val) => updateRegimen(index, val)}
                  placeholder="Selecciona régimen..."
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
