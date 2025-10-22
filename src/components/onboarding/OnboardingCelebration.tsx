import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PartyPopper, 
  Trophy, 
  ArrowRight, 
  CheckCircle, 
  Star,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OnboardingCelebrationProps {
  isVisible: boolean;
  onClose: () => void;
  userName?: string;
}

export function OnboardingCelebration({ 
  isVisible, 
  onClose,
  userName = 'Usuario' 
}: OnboardingCelebrationProps) {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      // Auto close after 10 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const nextSteps = [
    { icon: TrendingUp, text: 'Explora el dashboard y métricas' },
    { icon: CheckCircle, text: 'Crea más viajes y optimiza rutas' },
    { icon: Star, text: 'Configura reportes automáticos' }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="max-w-lg w-full shadow-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
            {/* Animated background elements */}
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-blue-500 rounded-full"
                    initial={{ 
                      x: Math.random() * 100 + '%', 
                      y: -20,
                      scale: 0 
                    }}
                    animate={{ 
                      y: '100vh',
                      scale: [0, 1, 0],
                      rotate: 360
                    }}
                    transition={{ 
                      duration: 2 + Math.random() * 2,
                      delay: Math.random() * 0.5,
                      ease: "easeOut"
                    }}
                    style={{
                      background: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 4)]
                    }}
                  />
                ))}
              </div>
            )}

            <CardHeader className="text-center pb-4 relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2, duration: 0.8 }}
                className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg"
              >
                <Trophy className="h-10 w-10 text-white" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  ¡Felicidades, {userName}!
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Has completado tu primer viaje con éxito
                </p>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10">
              {/* Achievement badges */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center gap-3 flex-wrap"
              >
                <Badge variant="outline" className="text-sm py-1 px-3 bg-blue-50 border-blue-200">
                  <PartyPopper className="h-4 w-4 mr-1" />
                  Primer Viaje
                </Badge>
                <Badge variant="outline" className="text-sm py-1 px-3 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Documentos Generados
                </Badge>
                <Badge variant="outline" className="text-sm py-1 px-3 bg-yellow-50 border-yellow-200">
                  <Star className="h-4 w-4 mr-1" />
                  Experto en Logística
                </Badge>
              </motion.div>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-100"
              >
                <p className="text-sm text-center text-gray-700 leading-relaxed">
                  Ya conoces lo básico de Interconecta. Ahora estás listo para gestionar tu flota de manera profesional y eficiente.
                </p>
              </motion.div>

              {/* Next steps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="space-y-3"
              >
                <p className="text-sm font-semibold text-gray-700 text-center">
                  🚀 Próximos Pasos Recomendados:
                </p>
                <div className="space-y-2">
                  {nextSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <step.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-700">{step.text}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="flex gap-3 pt-4"
              >
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    navigate('/dashboard');
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  Ir al Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
