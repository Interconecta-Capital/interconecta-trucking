
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Star, Trophy, Target } from 'lucide-react';
import { Achievement } from '@/hooks/usePersonalProgress';

interface GamificationPanelProps {
  achievements: Achievement[];
}

export function GamificationPanel({ achievements }: GamificationPanelProps) {
  const desbloqueados = achievements.filter(a => a.desbloqueado);
  const enProgreso = achievements.filter(a => !a.desbloqueado && a.progreso !== undefined);
  
  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'border-blue-200 bg-blue-50 text-blue-800',
      green: 'border-green-200 bg-green-50 text-green-800',
      yellow: 'border-yellow-200 bg-yellow-50 text-yellow-800',
      purple: 'border-purple-200 bg-purple-50 text-purple-800',
      orange: 'border-orange-200 bg-orange-50 text-orange-800',
      gray: 'border-gray-200 bg-gray-50 text-gray-600'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Logros y Reconocimientos
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            {desbloqueados.length} de {achievements.length} desbloqueados
          </Badge>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${
                  i < Math.floor(desbloqueados.length / achievements.length * 5) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`} 
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Logros desbloqueados */}
        {desbloqueados.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-green-800 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Logros Desbloqueados
            </h4>
            {desbloqueados.slice(0, 3).map((achievement) => (
              <div 
                key={achievement.id} 
                className={`p-3 rounded-lg border-2 ${getColorClasses(achievement.color)}`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{achievement.icono}</div>
                  <div className="flex-1">
                    <p className="font-semibold">{achievement.titulo}</p>
                    <p className="text-sm opacity-80">{achievement.descripcion}</p>
                    {achievement.fecha && (
                      <p className="text-xs opacity-60 mt-1">
                        Desbloqueado: {new Date(achievement.fecha).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge className="bg-white/50 text-current border-current">
                    ¡Logrado!
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Logros en progreso */}
        {enProgreso.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-blue-800 flex items-center gap-2">
              <Target className="h-4 w-4" />
              En Progreso
            </h4>
            {enProgreso.slice(0, 2).map((achievement) => (
              <div key={achievement.id} className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-xl opacity-60">{achievement.icono}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-700">{achievement.titulo}</p>
                    <p className="text-sm text-gray-600">{achievement.descripcion}</p>
                  </div>
                </div>
                {achievement.progreso !== undefined && achievement.meta && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Progreso: {achievement.progreso} / {achievement.meta}
                      </span>
                      <span className="font-medium">
                        {Math.round((achievement.progreso / achievement.meta) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(achievement.progreso / achievement.meta) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Motivación */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-800 mb-2">🚀 ¡Sigue así!</h4>
          <p className="text-sm text-purple-700">
            Cada logro desbloqueado representa tu crecimiento como experto en logística. 
            ¡Estás construyendo un historial excepcional de cumplimiento y eficiencia!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
