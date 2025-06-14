
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface CartasPorteFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onClearFilters: () => void;
}

export function CartasPorteFilters({ 
  statusFilter, 
  onStatusFilterChange, 
  onClearFilters 
}: CartasPorteFiltersProps) {
  const hasActiveFilters = statusFilter !== 'todos';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Estado:</label>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="borrador">Borradores</SelectItem>
                <SelectItem value="timbrada">Timbradas</SelectItem>
                <SelectItem value="cancelada">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtros activos:</span>
              {statusFilter !== 'todos' && (
                <Badge variant="secondary" className="gap-1">
                  Estado: {statusFilter}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => onStatusFilterChange('todos')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground"
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
