
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FreemiumTestButtons } from '@/components/dashboard/FreemiumTestButtons'
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2'

export default function Dashboard() {
  const { user } = useAuth()
  const permissions = useUnifiedPermissionsV2()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido de vuelta, {user?.email}
        </p>
      </div>

      {/* Información del Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de tu Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Plan Actual</p>
              <p className="text-2xl font-bold">{permissions.planInfo.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Nivel de Acceso</p>
              <p className="text-lg capitalize">{permissions.accessLevel}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Estado</p>
              <p className="text-lg">{permissions.planInfo.isActive ? 'Activo' : 'Inactivo'}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {permissions.accessReason}
          </p>
        </CardContent>
      </Card>

      {/* Botones de Prueba para Plan Freemium */}
      <FreemiumTestButtons />

      {/* Resto del dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehículos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {permissions.usage.vehiculos.used}
              {permissions.usage.vehiculos.limit && `/${permissions.usage.vehiculos.limit}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Socios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {permissions.usage.socios.used}
              {permissions.usage.socios.limit && `/${permissions.usage.socios.limit}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viajes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {permissions.usage.viajes.used}
              {permissions.usage.viajes.limit && `/${permissions.usage.viajes.limit}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartas Porte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {permissions.usage.cartas_porte.used}
              {permissions.usage.cartas_porte.limit && `/${permissions.usage.cartas_porte.limit}`}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
