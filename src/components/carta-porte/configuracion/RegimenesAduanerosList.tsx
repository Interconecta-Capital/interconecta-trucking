
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RegimenesAduanerosListProps {
  regimenes: Array<{
    clave_regimen: string;
    descripcion?: string;
    orden_secuencia: number;
  }>;
  onChange: (regs: Array<{
    clave_regimen: string;
    descripcion?: string;
    orden_secuencia: number;
  }>) => void;
  transporteInternacional?: boolean;
}

export function RegimenesAduanerosList({ 
  regimenes, 
  onChange, 
  transporteInternacional = false 
}: RegimenesAduanerosListProps) {
  
  // Solo mostrar si es transporte internacional
  if (!transporteInternacional) {
    return null;
  }

  const addRegimen = () => {
    if (regimenes.length >= 10) return;
    const newRegimen = {
      clave_regimen: '',
      descripcion: '',
      orden_secuencia: regimenes.length + 1
    };
    onChange([...regimenes, newRegimen]);
  };

  const updateRegimen = (index: number, clave: string) => {
    const updated = regimenes.map((r, i) => (
      i === index 
        ? { ...r, clave_regimen: clave } 
        : r
    ));
    onChange(updated);
  };

  const removeRegimen = (index: number) => {
    const filtered = regimenes.filter((_, i) => i !== index);
    // Reordenar secuencias
    const reordered = filtered.map((r, i) => ({
      ...r,
      orden_secuencia: i + 1
    }));
    onChange(reordered);
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          **Versión 3.1**: Para transporte internacional, puede registrar hasta 10 regímenes aduaneros diferentes.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <h4 className="font-medium">Regímenes Aduaneros</h4>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addRegimen} 
          disabled={regimenes.length >= 10}
        >
          <Plus className="h-4 w-4 mr-2" /> 
          Agregar Régimen ({regimenes.length}/10)
        </Button>
      </div>

      {regimenes.length === 0 ? (
        <Card>
          <CardContent className="py-4 text-center text-muted-foreground">
            Para transporte internacional, debe especificar al menos un régimen aduanero
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {regimenes.map((regimen, index) => (
            <Card key={index}>
              <CardHeader className="flex items-center justify-between p-4">
                <CardTitle className="text-base">Régimen {index + 1}</CardTitle>
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => removeRegimen(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                <CatalogoSelectorMejorado
                  tipo="regimenes_aduaneros"
                  value={regimen.clave_regimen}
                  onValueChange={(val) => updateRegimen(index, val)}
                  placeholder="Selecciona régimen aduanero..."
                  required
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
