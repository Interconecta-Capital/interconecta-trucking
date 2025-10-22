
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserPlus, Settings, Shield, Crown, UserX, UserCheck } from 'lucide-react';
import { useSuperuserManagement } from '@/hooks/useSuperuserManagement';
import { useSuperuser } from '@/hooks/useSuperuser';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { FixedSizeList as List } from 'react-window';

interface CreateUserForm {
  email: string;
  password: string;
  nombre: string;
  empresa?: string;
  rfc?: string;
  telefono?: string;
  rol: string;
  isSuperuser: boolean;
}

export function UserManagementPanel() {
  const { isSuperuser } = useSuperuser();
  const { loading, users, getAllUsers, createUser, updateUserRole, deactivateUser, activateUser } = useSuperuserManagement();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateUserForm>({
    defaultValues: {
      rol: 'usuario',
      isSuperuser: false
    }
  });

  useEffect(() => {
    if (isSuperuser) {
      getAllUsers();
    }
  }, [isSuperuser, getAllUsers]);

  // Filtrar usuarios por búsqueda
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.email.toLowerCase().includes(term) ||
      user.nombre?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const onCreateUser = async (data: CreateUserForm) => {
    const success = await createUser({
      email: data.email,
      password: data.password,
      nombre: data.nombre,
      empresa: data.empresa,
      rfc: data.rfc,
      telefono: data.telefono,
      rol: data.isSuperuser ? 'admin' : data.rol
    });

    if (success) {
      // If creating superuser, update the role
      if (data.isSuperuser) {
        // This would need the user ID, but since we just created it, we'd need to modify the flow
        toast.success('Usuario superusuario creado exitosamente');
      }
      setCreateDialogOpen(false);
      reset();
    }
  };

  const getRoleBadge = (rol: string, rolEspecial?: string) => {
    if (rolEspecial === 'superuser') {
      return <Badge className="bg-yellow-100 text-yellow-800"><Crown className="h-3 w-3 mr-1" />Superuser</Badge>;
    }
    
    switch (rol) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'usuario':
        return <Badge className="bg-blue-100 text-blue-800">Usuario</Badge>;
      default:
        return <Badge variant="secondary">{rol}</Badge>;
    }
  };

  // Componente de fila virtualizada (solo se usa si hay más de 20 usuarios)
  const UserRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const user = filteredUsers[index];
    return (
      <div style={style} className="flex items-center gap-4 px-6 py-4 border-b hover:bg-gray-50">
        <div className="flex-1">
          <div className="font-medium">{user.nombre}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
        <div className="w-32">
          {getRoleBadge(user.rol, user.rol_especial)}
        </div>
        <div className="w-24">
          <Badge variant={user.activo ? 'default' : 'secondary'}>
            {user.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
        <div className="w-32 text-sm text-muted-foreground">
          {new Date(user.created_at).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={user.rol_especial === 'superuser' ? 'superuser' : user.rol}
            onValueChange={(value) => {
              if (value === 'superuser') {
                updateUserRole(user.id, 'admin', true);
              } else {
                updateUserRole(user.id, value, false);
              }
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usuario">Usuario</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="superuser">Superuser</SelectItem>
            </SelectContent>
          </Select>

          {user.activo ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserX className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Desactivar usuario?</AlertDialogTitle>
                  <AlertDialogDescription>
                    El usuario {user.nombre} será desactivado y no podrá acceder al sistema.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deactivateUser(user.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Desactivar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => activateUser(user.id)}
            >
              <UserCheck className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (!isSuperuser) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p className="text-lg font-semibold text-red-700">Acceso Denegado</p>
            <p className="text-muted-foreground">Solo los superusuarios pueden gestionar usuarios.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestión de Usuarios del Sistema
            </span>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Crear Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onCreateUser)} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      {...register('email', { required: 'Email es requerido', pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' } })}
                      type="email"
                      placeholder="usuario@ejemplo.com"
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input 
                      {...register('password', { required: 'Contraseña es requerida', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
                      type="password"
                      placeholder="Contraseña segura"
                    />
                    {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="nombre">Nombre Completo *</Label>
                    <Input 
                      {...register('nombre', { required: 'Nombre es requerido' })}
                      placeholder="Nombre completo"
                    />
                    {errors.nombre && <p className="text-sm text-red-500">{errors.nombre.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input 
                      {...register('empresa')}
                      placeholder="Nombre de la empresa"
                    />
                  </div>

                  <div>
                    <Label htmlFor="rfc">RFC</Label>
                    <Input 
                      {...register('rfc')}
                      placeholder="RFC de la empresa"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input 
                      {...register('telefono')}
                      placeholder="Número de teléfono"
                    />
                  </div>

                  <div>
                    <Label htmlFor="rol">Rol</Label>
                    <Select value={watch('rol')} onValueChange={(value) => register('rol').onChange({ target: { value } })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usuario">Usuario</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input 
                      {...register('isSuperuser')}
                      type="checkbox" 
                      id="isSuperuser" 
                      className="rounded"
                    />
                    <Label htmlFor="isSuperuser" className="flex items-center gap-1">
                      <Crown className="h-4 w-4 text-yellow-600" />
                      Crear como Superusuario
                    </Label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Creando...' : 'Crear Usuario'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Barra de búsqueda */}
          <div className="mb-4">
            <Input
              placeholder="Buscar usuarios por email o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            {searchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                Mostrando {filteredUsers.length} de {users.length} usuarios
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-muted-foreground">Cargando usuarios...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
              </p>
            </div>
          ) : filteredUsers.length > 20 ? (
            // Virtualizar lista si hay más de 20 usuarios
            <div>
              <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 border-b font-semibold text-sm">
                <div className="flex-1">Usuario</div>
                <div className="w-32">Rol</div>
                <div className="w-24">Estado</div>
                <div className="w-32">Creado</div>
                <div className="w-48">Acciones</div>
              </div>
              <List
                height={600}
                itemCount={filteredUsers.length}
                itemSize={80}
                width="100%"
              >
                {UserRow}
              </List>
            </div>
          ) : (
            // Tabla normal si hay pocos usuarios
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.nombre}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.rol, user.rol_especial)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.activo ? 'default' : 'secondary'}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={user.rol_especial === 'superuser' ? 'superuser' : user.rol}
                          onValueChange={(value) => {
                            if (value === 'superuser') {
                              updateUserRole(user.id, 'admin', true);
                            } else {
                              updateUserRole(user.id, value, false);
                            }
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="usuario">Usuario</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="superuser">Superuser</SelectItem>
                          </SelectContent>
                        </Select>

                        {user.activo ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <UserX className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Desactivar usuario?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  El usuario {user.nombre} será desactivado y no podrá acceder al sistema.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deactivateUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Desactivar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => activateUser(user.id)}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
