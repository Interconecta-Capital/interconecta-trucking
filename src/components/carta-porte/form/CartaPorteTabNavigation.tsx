
import { useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  MapPin, 
  Package, 
  Truck, 
  Users,
  CheckCircle,
  Stamp
} from 'lucide-react';

const steps = [
  { id: 'configuracion', label: 'Configuración', icon: FileText },
  { id: 'ubicaciones', label: 'Ubicaciones', icon: MapPin },
  { id: 'mercancias', label: 'Mercancías', icon: Package },
  { id: 'autotransporte', label: 'Transporte', icon: Truck },
  { id: 'figuras', label: 'Figuras', icon: Users },
  { id: 'xml', label: 'XML/Timbrado', icon: Stamp },
];

interface CartaPorteTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  stepValidations: Record<string, boolean>;
  canGenerateXML: boolean;
}

export function CartaPorteTabNavigation({
  activeTab,
  onTabChange,
  stepValidations,
  canGenerateXML,
}: CartaPorteTabNavigationProps) {
  const tabTriggers = useMemo(() => {
    return steps.map((step) => {
      const Icon = step.icon;
      const isComplete = stepValidations[step.id as keyof typeof stepValidations];
      
      return (
        <TabsTrigger
          key={step.id}
          value={step.id}
          className="flex flex-col items-center p-4 space-y-2"
          disabled={step.id === 'xml' && !canGenerateXML}
        >
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5" />
            {isComplete && step.id !== 'xml' && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
          <span className="text-xs">{step.label}</span>
        </TabsTrigger>
      );
    });
  }, [stepValidations, canGenerateXML]);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-6 h-auto">
        {tabTriggers}
      </TabsList>
    </Tabs>
  );
}
