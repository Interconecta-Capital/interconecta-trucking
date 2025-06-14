
import { useState, useEffect, useCallback } from 'react';
import { AIContextData } from '@/services/ai/GeminiCoreService';
import { useAuth } from '@/hooks/useAuth';

interface UserPattern {
  field: string;
  commonValues: string[];
  frequency: Record<string, number>;
  lastUsed: string;
}

interface AIContextManager {
  context: AIContextData;
  updateContext: (key: string, value: any) => void;
  addUserPattern: (field: string, value: string) => void;
  getUserPatterns: (field: string) => string[];
  getBusinessContext: () => any;
}

export function useAIContext(): AIContextManager {
  const { user } = useAuth();
  const [context, setContext] = useState<AIContextData>({
    userId: user?.id,
    sessionId: crypto.randomUUID(),
    previousInputs: [],
    userPreferences: {},
    businessContext: {}
  });

  const [userPatterns, setUserPatterns] = useState<Record<string, UserPattern>>({});

  // Load user patterns from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const savedPatterns = localStorage.getItem(`ai_patterns_${user.id}`);
      if (savedPatterns) {
        try {
          setUserPatterns(JSON.parse(savedPatterns));
        } catch (error) {
          console.error('Error loading user patterns:', error);
        }
      }
    }
  }, [user?.id]);

  // Save patterns to localStorage when they change
  useEffect(() => {
    if (user?.id && Object.keys(userPatterns).length > 0) {
      localStorage.setItem(`ai_patterns_${user.id}`, JSON.stringify(userPatterns));
    }
  }, [userPatterns, user?.id]);

  const updateContext = useCallback((key: string, value: any) => {
    setContext(prev => ({
      ...prev,
      [key]: value,
      userPreferences: {
        ...prev.userPreferences,
        [key]: value
      }
    }));
  }, []);

  const addUserPattern = useCallback((field: string, value: string) => {
    if (!value || value.length < 2) return;

    setUserPatterns(prev => {
      const pattern = prev[field] || {
        field,
        commonValues: [],
        frequency: {},
        lastUsed: new Date().toISOString()
      };

      // Update frequency
      pattern.frequency[value] = (pattern.frequency[value] || 0) + 1;
      pattern.lastUsed = new Date().toISOString();

      // Update common values (top 10 by frequency)
      pattern.commonValues = Object.entries(pattern.frequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([val]) => val);

      return {
        ...prev,
        [field]: pattern
      };
    });

    // Also update the context with recent inputs
    setContext(prev => ({
      ...prev,
      previousInputs: [value, ...(prev.previousInputs || [])].slice(0, 20)
    }));
  }, []);

  const getUserPatterns = useCallback((field: string): string[] => {
    const pattern = userPatterns[field];
    return pattern?.commonValues || [];
  }, [userPatterns]);

  const getBusinessContext = useCallback(() => {
    // Analyze user patterns to determine business context
    const allValues = Object.values(userPatterns).flatMap(p => p.commonValues);
    
    // Determine common vehicle types from patterns
    const vehicleTypes = allValues.filter(val => 
      /camión|tráiler|tractocamión|pickup|van/i.test(val)
    );

    // Determine common regions from address patterns
    const addressPatterns = userPatterns['direccion'] || userPatterns['domicilio'];
    const regions = addressPatterns?.commonValues.map(addr => {
      const match = addr.match(/,\s*([A-Za-z\s]+)$/);
      return match ? match[1].trim() : null;
    }).filter(Boolean) || [];

    return {
      vehicleTypes: [...new Set(vehicleTypes)],
      commonRegions: [...new Set(regions)],
      totalInteractions: Object.values(userPatterns).reduce(
        (sum, p) => sum + Object.values(p.frequency).reduce((s, f) => s + f, 0), 0
      ),
      lastActivity: Math.max(
        ...Object.values(userPatterns).map(p => new Date(p.lastUsed).getTime())
      )
    };
  }, [userPatterns]);

  // Update business context periodically
  useEffect(() => {
    const businessCtx = getBusinessContext();
    setContext(prev => ({
      ...prev,
      businessContext: businessCtx
    }));
  }, [getBusinessContext]);

  return {
    context,
    updateContext,
    addUserPattern,
    getUserPatterns,
    getBusinessContext
  };
}
