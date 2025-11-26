# 🔀 Guía para Colaboradores Externos

Este documento explica cómo colaboradores externos pueden contribuir al proyecto **Interconecta Trucking** usando forks y pull requests.

## 📋 Tabla de Contenidos

- [Hacer Fork del Repositorio](#-hacer-fork-del-repositorio)
- [Clonar tu Fork](#-clonar-tu-fork)
- [Configurar Upstream](#-configurar-upstream)
- [Crear Branch de Trabajo](#-crear-branch-de-trabajo)
- [Desarrollo Local](#-desarrollo-local)
- [Probar Cambios](#-probar-cambios)
- [Crear Pull Request](#-crear-pull-request)
- [Proceso de Revisión](#-proceso-de-revisión)
- [Buenas Prácticas](#-buenas-prácticas)
- [Seguridad](#-seguridad)

---

## 🍴 Hacer Fork del Repositorio

### Paso 1: Crear Fork en GitHub

1. Ve a [https://github.com/interconecta/trucking-platform](https://github.com/interconecta/trucking-platform)
2. Click en el botón **Fork** (esquina superior derecha)
3. Selecciona tu cuenta de GitHub
4. Espera a que se cree el fork

```
Original:  github.com/interconecta/trucking-platform
Tu Fork:   github.com/TU_USUARIO/trucking-platform
```

### Verificar Fork

Tu fork debería mostrar:
- "forked from interconecta/trucking-platform"
- Tu propia copia del repositorio

---

## 📥 Clonar tu Fork

### Clonar Localmente

```bash
# Clonar tu fork (no el original)
git clone https://github.com/TU_USUARIO/trucking-platform.git

# Entrar al directorio
cd trucking-platform

# Verificar el remote
git remote -v
# origin  https://github.com/TU_USUARIO/trucking-platform.git (fetch)
# origin  https://github.com/TU_USUARIO/trucking-platform.git (push)
```

### Con SSH (Recomendado)

Si tienes SSH configurado:

```bash
git clone git@github.com:TU_USUARIO/trucking-platform.git
```

---

## 🔗 Configurar Upstream

El `upstream` es el repositorio original. Lo necesitas para mantener tu fork actualizado.

### Agregar Upstream

```bash
# Agregar el repositorio original como upstream
git remote add upstream https://github.com/interconecta/trucking-platform.git

# Verificar remotes
git remote -v
# origin    https://github.com/TU_USUARIO/trucking-platform.git (fetch)
# origin    https://github.com/TU_USUARIO/trucking-platform.git (push)
# upstream  https://github.com/interconecta/trucking-platform.git (fetch)
# upstream  https://github.com/interconecta/trucking-platform.git (push)
```

### Sincronizar con Upstream

Antes de empezar a trabajar, siempre sincroniza:

```bash
# Obtener cambios del upstream
git fetch upstream

# Ir a tu branch main
git checkout main

# Merge de cambios del upstream
git merge upstream/main

# Push a tu fork
git push origin main
```

### Script de Sincronización

Puedes crear un script para facilitar esto:

```bash
#!/bin/bash
# sync-upstream.sh

echo "🔄 Sincronizando con upstream..."
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
echo "✅ Sincronización completa"
```

---

## 🌿 Crear Branch de Trabajo

**NUNCA** trabajes directamente en `main`. Siempre crea un branch.

### Crear Branch

```bash
# Asegúrate de estar en main actualizado
git checkout main
git pull origin main

# Crear branch para tu feature/fix
git checkout -b feature/mi-nueva-funcionalidad

# O para un fix
git checkout -b fix/corregir-error-xyz
```

### Convención de Nombres

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Feature | `feature/descripcion-corta` | `feature/wizard-mercancias` |
| Fix | `fix/descripcion-corta` | `fix/validacion-rfc` |
| Docs | `docs/descripcion-corta` | `docs/actualizar-readme` |
| Refactor | `refactor/descripcion-corta` | `refactor/services-viajes` |

---

## 💻 Desarrollo Local

### Instalar Dependencias

```bash
npm install
```

### Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tus valores (si tienes acceso)
# O usar los valores de desarrollo/sandbox
```

### Iniciar Servidor de Desarrollo

```bash
npm run dev
# Servidor en http://localhost:5173
```

### Estructura de Trabajo

```
1. Sincronizar con upstream
2. Crear branch de trabajo
3. Hacer cambios
4. Probar localmente
5. Commit de cambios
6. Push a tu fork
7. Crear PR
```

---

## 🧪 Probar Cambios

### Verificar Build

```bash
# El código debe compilar sin errores
npm run build
```

### Ejecutar Linting

```bash
# Verificar estilo de código
npm run lint

# Arreglar automáticamente
npm run lint:fix
```

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Tests específicos
npm run test -- --grep "ViajeService"

# Tests con coverage
npm run test:coverage
```

### Probar Manualmente

1. Iniciar servidor: `npm run dev`
2. Navegar a la funcionalidad modificada
3. Verificar que funciona correctamente
4. Verificar en diferentes navegadores (si aplica)
5. Verificar responsividad (si aplica)

### Checklist Pre-PR

- [ ] `npm run build` pasa sin errores
- [ ] `npm run lint` pasa sin errores
- [ ] `npm run test` pasa sin errores
- [ ] Funcionalidad probada manualmente
- [ ] No hay console.log de debug
- [ ] Código formateado correctamente

---

## 📤 Crear Pull Request

### Hacer Commit de Cambios

```bash
# Ver estado de cambios
git status

# Agregar archivos específicos
git add src/components/MiComponente.tsx

# O agregar todos los cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat(viajes): agregar validación de mercancías

- Implementar validación de peso máximo
- Agregar mensajes de error descriptivos
- Incluir tests unitarios"
```

### Push a tu Fork

```bash
git push origin feature/mi-nueva-funcionalidad
```

### Crear PR en GitHub

1. Ve a tu fork en GitHub
2. Verás un banner: "Compare & pull request" → Click
3. O ve a **Pull requests** → **New pull request**

### Configurar el PR

**Base repository:** `interconecta/trucking-platform`  
**Base branch:** `develop` (o `main` según instrucciones)  
**Head repository:** `TU_USUARIO/trucking-platform`  
**Compare branch:** `feature/mi-nueva-funcionalidad`

### Escribir Descripción del PR

```markdown
## Descripción
Implementación de validación de mercancías en el wizard de viajes.

## Tipo de Cambio
- [x] 🚀 Nueva funcionalidad (feature)
- [ ] 🐛 Corrección de bug (fix)
- [ ] 📝 Documentación

## Cambios Realizados
- Agregar validación de peso máximo por mercancía
- Mostrar errores inline en el formulario
- Agregar tests para ValidadorMercancias

## Screenshots
![Validación de mercancías](url-a-screenshot)

## Checklist
- [x] Mi código sigue los estándares del proyecto
- [x] He revisado mi propio código
- [x] He agregado tests
- [x] Todos los tests pasan

## Cómo Probar
1. Ir a /viajes/nuevo
2. Avanzar al paso de Mercancías
3. Ingresar peso mayor a 30,000 kg
4. Verificar mensaje de error
```

---

## 👀 Proceso de Revisión

### Qué Esperar

1. **CI/CD automático** - Tests y linting se ejecutan automáticamente
2. **Review de código** - Un maintainer revisará tu código
3. **Feedback** - Podrías recibir solicitudes de cambios
4. **Aprobación** - Una vez aprobado, se hace merge

### Responder a Feedback

```bash
# Si necesitas hacer cambios
git checkout feature/mi-nueva-funcionalidad

# Hacer los cambios solicitados
# ...

# Commit de los cambios
git add .
git commit -m "fix: aplicar feedback de review

- Renombrar variable según sugerencia
- Agregar test caso edge"

# Push (actualiza el PR automáticamente)
git push origin feature/mi-nueva-funcionalidad
```

### Si el PR Tiene Conflictos

```bash
# Sincronizar con upstream
git fetch upstream
git checkout feature/mi-nueva-funcionalidad

# Rebase con develop del upstream
git rebase upstream/develop

# Resolver conflictos si los hay
# Editar archivos con conflictos
git add .
git rebase --continue

# Push forzado (necesario después de rebase)
git push origin feature/mi-nueva-funcionalidad --force
```

---

## ✨ Buenas Prácticas

### DO (Hacer)

- ✅ Sincronizar frecuentemente con upstream
- ✅ Crear branches pequeños y enfocados
- ✅ Escribir commits descriptivos
- ✅ Probar antes de hacer PR
- ✅ Responder rápido al feedback
- ✅ Mantener el PR actualizado con develop

### DON'T (No Hacer)

- ❌ Trabajar directamente en main
- ❌ Hacer PRs gigantes con muchos cambios
- ❌ Ignorar el feedback del review
- ❌ Incluir archivos no relacionados
- ❌ Subir secrets o credenciales
- ❌ Hacer commit de node_modules o .env

### Tamaño de PRs

| Tamaño | Líneas | Tiempo de Review | Recomendación |
|--------|--------|------------------|---------------|
| XS | < 50 | Minutos | ✅ Ideal |
| S | 50-200 | 30 min | ✅ Bueno |
| M | 200-500 | 1-2 horas | ⚠️ Aceptable |
| L | 500-1000 | Varias horas | ⚠️ Dividir si es posible |
| XL | > 1000 | Días | ❌ Dividir obligatoriamente |

---

## 🔒 Seguridad

### Qué NO Incluir en PRs

- ❌ API Keys
- ❌ Passwords
- ❌ Tokens
- ❌ Certificados (.cer, .key)
- ❌ Archivos .env con valores reales
- ❌ Datos personales reales

### Verificar Antes de Commit

```bash
# Verificar que no hay secrets
git diff --cached | grep -i "password\|secret\|key\|token"

# Verificar archivos staged
git status
```

### Si Accidentalmente Subiste un Secret

1. **Inmediatamente** rota el secret
2. Contacta al equipo de seguridad
3. No intentes "arreglarlo" con otro commit

### Revisión de Seguridad Pre-Merge

Los maintainers verifican:
- [ ] No hay credenciales expuestas
- [ ] No hay vulnerabilidades conocidas
- [ ] Las dependencias son seguras
- [ ] El código no abre vectores de ataque

---

## 📚 Flujo Completo (Resumen)

```
1. FORK
   └── Crear fork en GitHub

2. CLONE
   └── git clone https://github.com/TU_USUARIO/trucking-platform.git

3. UPSTREAM
   └── git remote add upstream https://github.com/interconecta/trucking-platform.git

4. SYNC
   └── git fetch upstream
   └── git merge upstream/main

5. BRANCH
   └── git checkout -b feature/mi-funcionalidad

6. DEVELOP
   └── npm install
   └── npm run dev
   └── Hacer cambios

7. TEST
   └── npm run build
   └── npm run lint
   └── npm run test

8. COMMIT
   └── git add .
   └── git commit -m "feat: descripción"

9. PUSH
   └── git push origin feature/mi-funcionalidad

10. PR
    └── Crear Pull Request en GitHub
    └── Esperar review
    └── Aplicar feedback
    └── Merge! 🎉
```

---

## 🆘 ¿Problemas?

### Recursos

- [GitHub Docs: Forks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks)
- [Pro Git Book](https://git-scm.com/book/en/v2)

### Contacto

- Issues: [GitHub Issues](https://github.com/interconecta/trucking-platform/issues)
- Email: desarrollo@interconecta.capital

---

**¡Gracias por contribuir! 🙏**
