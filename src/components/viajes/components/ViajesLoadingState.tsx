
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ViajesLoadingState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargando viajes activos...</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-muted-foreground">Obteniendo datos...</span>
        </div>
      </CardContent>
    </Card>
  );
}
