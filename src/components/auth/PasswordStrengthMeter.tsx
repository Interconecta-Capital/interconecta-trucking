import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: 'Mínimo 12 caracteres', test: (p) => p.length >= 12 },
  { label: 'Al menos una mayúscula (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'Al menos una minúscula (a-z)', test: (p) => /[a-z]/.test(p) },
  { label: 'Al menos un número (0-9)', test: (p) => /[0-9]/.test(p) },
  { label: 'Al menos un símbolo (@$!%*?&#)', test: (p) => /[@$!%*?&#]/.test(p) },
];

function calculateStrength(password: string): { percentage: number; label: string; color: string } {
  if (!password) return { percentage: 0, label: '', color: 'bg-muted' };
  
  let score = 0;
  
  // Longitud (40 puntos máximo)
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 10;
  if (password.length >= 20) score += 5;
  
  // Complejidad (40 puntos)
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[@$!%*?&#]/.test(password)) score += 10;
  
  // Variedad de caracteres (20 puntos)
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= 8) score += 5;
  if (uniqueChars >= 10) score += 5;
  if (uniqueChars >= 12) score += 5;
  if (uniqueChars >= 15) score += 5;
  
  // Determinar label y color
  let label = 'Muy débil';
  let color = 'bg-red-500';
  
  if (score >= 30) { label = 'Débil'; color = 'bg-orange-500'; }
  if (score >= 50) { label = 'Media'; color = 'bg-yellow-500'; }
  if (score >= 70) { label = 'Fuerte'; color = 'bg-green-500'; }
  if (score >= 90) { label = 'Muy fuerte'; color = 'bg-green-600'; }
  
  return { percentage: score, label, color };
}

export function PasswordStrengthMeter({ password, showRequirements = true }: PasswordStrengthMeterProps) {
  const strength = calculateStrength(password);
  
  if (!password) return null;
  
  return (
    <div className="space-y-3 mt-2">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Fortaleza de la contraseña:</span>
          <span className={`font-medium ${
            strength.percentage >= 70 ? 'text-green-600' : 
            strength.percentage >= 50 ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {strength.label}
          </span>
        </div>
        <Progress 
          value={strength.percentage} 
          className={`h-2 ${strength.color}`}
        />
      </div>
      
      {showRequirements && (
        <div className="space-y-1.5 pt-1">
          <p className="text-xs font-medium text-muted-foreground">Requisitos:</p>
          <ul className="space-y-1">
            {requirements.map((req, index) => {
              const isValid = req.test(password);
              return (
                <li 
                  key={index}
                  className={`text-xs flex items-center gap-2 transition-colors ${
                    isValid ? 'text-green-600' : 'text-muted-foreground'
                  }`}
                >
                  {isValid ? (
                    <Check className="h-3 w-3 flex-shrink-0" />
                  ) : (
                    <X className="h-3 w-3 flex-shrink-0 opacity-40" />
                  )}
                  <span>{req.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
