
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Truck, 
  Shield, 
  Zap, 
  Users, 
  FileText,
  TrendingUp,
  Award
} from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingProvider';

interface WelcomeFeature {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  relevantFor: string[];
}

const FEATURES: WelcomeFeature[] = [
  {
    icon: Shield,
    title: 'Validaciones IA',
    description: 'Prevención automática de errores SAT con inteligencia artificial',
    relevantFor: ['transportista', 'operador', 'nuevo']
  },
  {
    icon: Zap,
    title: 'Creación Express',
    description: 'Crea cartas porte en menos de 3 minutos',
    relevantFor: ['transportista', 'operador']
  },
  {
    icon: FileText,
    title: 'Documentos Automáticos',
    description: 'Generación y firma digital automática de documentos',
    relevantFor: ['transportista', 'administrador']
  },
  {
    icon: TrendingUp,
    title: 'Analytics Avanzados',
    description: 'Métricas de eficiencia y optimización de rutas',
    relevantFor: ['administrador', 'transportista']
  }
];

export function PersonalizedWelcome() {
  const { userRole, startOnboarding, skipOnboarding } = useOnboarding();

  const getRoleInfo = () => {
    switch (userRole) {
      case 'transportista':
        return {
          title: '¡Bienvenido, Transportista!',
          subtitle: 'Te ayudaremos a gestionar tus viajes de forma más eficiente',
          icon: Truck,
          color: 'blue',
          estimatedTime: '5 minutos'
        };
      case 'administrador':
        return {
          title: '¡Bienvenido, Administrador!',
          subtitle: 'Descubre todas las herramientas de gestión y supervisión',
          icon: Users,
          color: 'purple',
          estimatedTime: '7 minutos'
        };
      case 'operador':
        return {
          title: '¡Bienvenido, Operador!',
          subtitle: 'Aprende las funciones operativas clave del sistema',
          icon: Award,
          color: 'green',
          estimatedTime: '4 minutos'
        };
      default:
        return {
          title: '¡Bienvenido a Interconecta!',
          subtitle: 'La plataforma más inteligente para gestión de transporte',
          icon: Star,
          color: 'orange',
          estimatedTime: '6 minutos'
        };
    }
  };

  const handleSkipWithOption = (neverShow: boolean = false) => {
    if (neverShow) {
      localStorage.setItem('never_show_welcome', 'true');
    }
    skipOnboarding();
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;
  const relevantFeatures = FEATURES.filter(feature => 
    feature.relevantFor.includes(userRole) || userRole === 'nuevo'
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <Card className="w-full max-w-2xl mx-4 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`mx-auto w-16 h-16 rounded-full bg-${roleInfo.color}-100 flex items-center justify-center`}
          >
            <RoleIcon className={`h-8 w-8 text-${roleInfo.color}-600`} />
          </motion.div>
          
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">{roleInfo.title}</CardTitle>
            <p className="text-gray-600">{roleInfo.subtitle}</p>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="text-sm">
              Tutorial: ~{roleInfo.estimatedTime}
            </Badge>
            <Badge variant="outline" className="text-sm bg-green-50 text-green-700">
              Personalizado para ti
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Características principales */}
          <div className="space-y-3">
            <h3 className="font-semibold text-center mb-4">Lo que aprenderás:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {relevantFeatures.map((feature, index) => {
                const FeatureIcon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <FeatureIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-sm">{feature.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Promesa de valor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200"
          >
            <h4 className="font-semibold text-blue-900 mb-2">
              🎯 Nuestro Compromiso
            </h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              Al final de este tutorial, crearás tu primera carta porte sin errores 
              y entenderás cómo usar todas las herramientas clave de la plataforma.
            </p>
          </motion.div>

          {/* Acciones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleSkipWithOption(false)}
                className="flex-1"
              >
                Explorar por mi cuenta
              </Button>
              <Button
                onClick={() => startOnboarding(userRole)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                ¡Comenzar Tutorial!
              </Button>
            </div>
            
            {/* Opción de no volver a mostrar */}
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSkipWithOption(true)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                No volver a mostrar esta bienvenida
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
