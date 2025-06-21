
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { Shield, User, Crown, Clock, X, AlertTriangle } from 'lucide-react';

/**
 * Página de Debug para Validación del Sistema de Permisos V2
 * 
 * OBJETIVO: Probar aisladamente useUnifiedPermissionsV2 sin afectar la app principal
 * Esta página NO tiene navegación compleja ni dependencias externas
 */
export default function DebugPermissionsTest() {
  const [simulationMode, setSimulationMode] = useState<string | null>(null);
  const permissions = useUnifiedPermissionsV2();

  // Configuración para simular diferentes tipos de usuario
  const simulations = [
    {
      id: 'reset',
      name: 'Usuario Real (Sin Simulación)',
      icon: User,
      description: 'Muestra el estado real del usuario autenticado',
      color: 'bg-blue-500'
    },
    {
      id: 'superuser',
      name: 'Simular Superusuario',
      icon: Crown,
      description: 'Acceso total e incondicional',
      color: 'bg-purple-500'
    },
    {
      id: 'trial-day5',
      name: 'Simular Trial Día 5/14',
      icon: Clock,
      description: 'Usuario en período de prueba activo',
      color: 'bg-green-500'
    },
    {
      id: 'paid-limits',
      name: 'Simular Plan con Límites',
      icon: Shield,
      description: 'Plan Operador con límites alcanzados',
      color: 'bg-orange-500'
    },
    {
      id: 'expired',
      name: 'Simular Trial Expirado',
      icon: X,
      description: 'Sin plan activo, acceso bloqueado',
      color: 'bg-red-500'
    }
  ];

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'superuser': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'trial': return 'bg-green-100 text-green-800 border-green-200';
      case 'paid': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'none': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPermissionResult = (permission: any) => {
    return {
      status: permission.allowed ? 'Permitido' : 'Denegado',
      reason: permission.reason,
      limit: permission.limit ? `Límite: ${permission.limit}` : 'Sin límite',
      used: permission.used !== undefined ? `Usado: ${permission.used}` : 'N/A'
    };
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">Debug: Sistema de Permisos V2</h1>
          </div>
          <p className="text-gray-600">
            Página de validación aislada para el nuevo hook useUnifiedPermissionsV2
          </p>
          {simulationMode && (
            <Badge className="mt-2 bg-yellow-100 text-yellow-800">
              Modo Simulación: {simulations.find(s => s.id === simulationMode)?.name}
            </Badge>
          )}
        </div>

        {/* Controles de Simulación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Simulador de Estados de Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {simulations.map((sim) => {
                const Icon = sim.icon;
                const isActive = simulationMode === sim.id;
                
                return (
                  <Button
                    key={sim.id}
                    variant={isActive ? "default" : "outline"}
                    className={`h-auto p-4 flex flex-col items-center gap-2 ${
                      isActive ? sim.color + ' text-white' : ''
                    }`}
                    onClick={() => setSimulationMode(sim.id === 'reset' ? null : sim.id)}
                  >
                    <Icon className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">{sim.name}</div>
                      <div className="text-xs opacity-75">{sim.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Estado Global */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Estado Global del Usuario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Autenticado</label>
                  <div className={`p-2 rounded text-center ${
                    permissions.isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {permissions.isAuthenticated ? 'SÍ' : 'NO'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">User ID</label>
                  <div className="p-2 bg-gray-100 rounded text-center text-sm">
                    {permissions.userId ? permissions.userId.slice(0, 8) + '...' : 'N/A'}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Nivel de Acceso</label>
                <Badge className={`w-full justify-center ${getAccessLevelColor(permissions.accessLevel)}`}>
                  {permissions.accessLevel.toUpperCase()}
                </Badge>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Razón del Acceso</label>
                <div className="p-3 bg-gray-50 rounded text-sm">
                  {permissions.accessReason}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Acceso Completo</label>
                <div className={`p-2 rounded text-center ${
                  permissions.hasFullAccess ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {permissions.hasFullAccess ? 'SÍ' : 'NO'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre del Plan</label>
                <div className="p-2 bg-gray-100 rounded text-center">
                  {permissions.planInfo.name}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipo</label>
                  <div className="p-2 bg-gray-100 rounded text-center text-sm">
                    {permissions.planInfo.type}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Activo</label>
                  <div className={`p-2 rounded text-center text-sm ${
                    permissions.planInfo.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {permissions.planInfo.isActive ? 'SÍ' : 'NO'}
                  </div>
                </div>
              </div>
              
              {permissions.planInfo.daysRemaining !== undefined && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Días Restantes</label>
                  <div className="p-2 bg-blue-100 rounded text-center">
                    {permissions.planInfo.daysRemaining} días
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Permisos Específicos */}
        <Card>
          <CardHeader>
            <CardTitle>Permisos de Creación (Botones "+")</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'canCreateConductor', label: 'Conductores', icon: User },
                { key: 'canCreateVehiculo', label: 'Vehículos', icon: Shield },
                { key: 'canCreateSocio', label: 'Socios', icon: User },
                { key: 'canCreateCartaPorte', label: 'Cartas Porte', icon: Shield },
                { key: 'canCreateRemolque', label: 'Remolques', icon: Shield }
              ].map(({ key, label, icon: Icon }) => {
                const permission = permissions[key as keyof typeof permissions] as any;
                const formatted = formatPermissionResult(permission);
                
                return (
                  <div key={key} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-5 w-5" />
                      <h3 className="font-medium">{label}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <div className={`p-2 rounded text-center text-sm ${
                        permission.allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {formatted.status}
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        <div><strong>Razón:</strong> {formatted.reason}</div>
                        {permission.limit && <div><strong>Límite:</strong> {permission.limit}</div>}
                        {permission.used !== undefined && <div><strong>Usado:</strong> {permission.used}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Raw JSON Output */}
        <Card>
          <CardHeader>
            <CardTitle>Raw JSON Output (Para Debugging)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(permissions, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Notas Importantes */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">⚠️ Notas de la Fase 1</CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-700">
            <ul className="space-y-2 text-sm">
              <li>• Esta página es SOLO para validación del hook useUnifiedPermissionsV2</li>
              <li>• Los simuladores son meramente visuales y NO afectan la lógica real</li>
              <li>• La Fase 1 estará completa cuando todos los estados muestren resultados correctos</li>
              <li>• NO se ha modificado ninguna página de la aplicación principal aún</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
