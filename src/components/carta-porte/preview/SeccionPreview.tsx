import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Edit, CheckCircle, AlertCircle, Circle } from 'lucide-react';

interface SeccionPreviewProps {
  titulo: string;
  icon: React.ElementType;
  estado: 'completo' | 'parcial' | 'incompleto';
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  onEditar: () => void;
}

export function SeccionPreview({
  titulo,
  icon: Icon,
  estado,
  children,
  isExpanded,
  onToggle,
  onEditar
}: SeccionPreviewProps) {
  const getEstadoConfig = () => {
    switch (estado) {
      case 'completo':
        return {
          color: 'border-l-success',
          bgColor: 'bg-success/5',
          icon: CheckCircle,
          iconColor: 'text-success',
          badge: 'Completo',
          badgeVariant: 'default' as const
        };
      case 'parcial':
        return {
          color: 'border-l-warning',
          bgColor: 'bg-warning/5',
          icon: AlertCircle,
          iconColor: 'text-warning',
          badge: 'Parcial',
          badgeVariant: 'secondary' as const
        };
      case 'incompleto':
        return {
          color: 'border-l-destructive',
          bgColor: 'bg-destructive/5',
          icon: Circle,
          iconColor: 'text-muted-foreground',
          badge: 'Incompleto',
          badgeVariant: 'outline' as const
        };
    }
  };

  const estadoConfig = getEstadoConfig();
  const EstadoIcon = estadoConfig.icon;

  return (
    <Card className={`border-l-4 ${estadoConfig.color} ${estadoConfig.bgColor} transition-all`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onToggle}
            className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <Icon className={`h-5 w-5 ${estadoConfig.iconColor}`} />
              <div>
                <h3 className="text-lg font-semibold text-foreground">{titulo}</h3>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground ml-auto" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground ml-auto" />
            )}
          </button>

          <div className="flex items-center gap-2 ml-4">
            <Badge variant={estadoConfig.badgeVariant} className="flex items-center gap-1">
              <EstadoIcon className="h-3 w-3" />
              {estadoConfig.badge}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditar}
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 animate-in slide-in-from-top-2 duration-200">
          {children}
        </CardContent>
      )}
    </Card>
  );
}
