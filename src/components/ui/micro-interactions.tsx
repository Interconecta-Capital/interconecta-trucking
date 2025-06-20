
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles, Zap, Trophy } from 'lucide-react';

interface MicroInteractionProps {
  children: React.ReactNode;
  type?: 'hover' | 'tap' | 'focus' | 'success' | 'celebration';
  intensity?: 'subtle' | 'medium' | 'dramatic';
  disabled?: boolean;
}

const animationVariants = {
  hover: {
    subtle: { scale: 1.02, transition: { duration: 0.2 } },
    medium: { scale: 1.05, transition: { duration: 0.2 } },
    dramatic: { scale: 1.1, transition: { duration: 0.3 } }
  },
  tap: {
    subtle: { scale: 0.98, transition: { duration: 0.1 } },
    medium: { scale: 0.95, transition: { duration: 0.1 } },
    dramatic: { scale: 0.9, transition: { duration: 0.1 } }
  },
  success: {
    subtle: { 
      scale: [1, 1.03, 1],
      backgroundColor: ['#ffffff', '#dcfce7', '#ffffff'],
      transition: { duration: 0.6 }
    },
    medium: {
      scale: [1, 1.05, 1],
      backgroundColor: ['#ffffff', '#bbf7d0', '#ffffff'],
      transition: { duration: 0.8 }
    },
    dramatic: {
      scale: [1, 1.1, 1],
      backgroundColor: ['#ffffff', '#86efac', '#ffffff'],
      transition: { duration: 1.0 }
    }
  }
};

export function MicroInteraction({ 
  children, 
  type = 'hover', 
  intensity = 'medium',
  disabled = false 
}: MicroInteractionProps) {
  if (disabled) return <>{children}</>;

  const getAnimation = () => {
    return animationVariants[type]?.[intensity] || {};
  };

  return (
    <motion.div
      whileHover={type === 'hover' ? getAnimation() : {}}
      whileTap={type === 'tap' ? getAnimation() : {}}
      animate={type === 'success' ? getAnimation() : {}}
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  );
}

interface CelebrationAnimationProps {
  isVisible: boolean;
  type?: 'validation' | 'completion' | 'achievement';
  message?: string;
}

export function CelebrationAnimation({ 
  isVisible, 
  type = 'validation',
  message = '¡Excelente!'
}: CelebrationAnimationProps) {
  const getIcon = () => {
    switch (type) {
      case 'validation': return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'completion': return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 'achievement': return <Sparkles className="h-8 w-8 text-purple-500" />;
      default: return <CheckCircle className="h-8 w-8 text-green-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: [0, 1.2, 1], 
            y: 0,
            rotate: [0, 5, -5, 0]
          }}
          exit={{ opacity: 0, scale: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border p-4 flex items-center gap-3"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {getIcon()}
          </motion.div>
          <div>
            <div className="font-semibold text-gray-900">{message}</div>
            <div className="text-sm text-gray-600">Validación completada</div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ProgressiveLoadingProps {
  isLoading: boolean;
  progress: number;
  stages: string[];
  currentStage: number;
}

export function ProgressiveLoading({ 
  isLoading, 
  progress, 
  stages, 
  currentStage 
}: ProgressiveLoadingProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="h-5 w-5 text-blue-600" />
            </motion.div>
            <span className="font-medium text-blue-900">
              {stages[currentStage] || 'Procesando...'}
            </span>
          </div>
          
          <div className="w-full bg-blue-100 rounded-full h-2 mb-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          
          <div className="text-sm text-blue-700">
            {progress}% completado
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface SmartButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SmartButton({
  children,
  onClick,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className = ''
}: SmartButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white'
  };

  return (
    <motion.button
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${variantClasses[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      animate={isPressed ? { scale: 0.96 } : {}}
      transition={{ duration: 0.1 }}
    >
      <motion.div
        className="flex items-center gap-2"
        animate={isLoading ? { opacity: [1, 0.7, 1] } : {}}
        transition={isLoading ? { duration: 1, repeat: Infinity } : {}}
      >
        {children}
      </motion.div>
    </motion.button>
  );
}
