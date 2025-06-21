
# Guía de Ejecución - Plan de Pruebas Unificado

## CONFIGURACIÓN DEL ENTORNO DE PRUEBAS

### 1. Preparación de Usuarios de Prueba

```sql
-- Crear usuarios de prueba en el entorno de staging
-- SUPERUSER
INSERT INTO auth.users (id, email, raw_user_meta_data) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'superuser@test.com',
  '{"is_superuser": true}'
);

-- USUARIO TRIAL (registrado hoy)
INSERT INTO auth.users (id, email, created_at) 
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'trial@test.com',
  NOW()
);

-- USUARIO CON PLAN BÁSICO
INSERT INTO auth.users (id, email) 
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'basic@test.com'
);

-- Suscripción activa para usuario básico
INSERT INTO suscripciones (user_id, plan_id, status, fecha_inicio)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  (SELECT id FROM planes_suscripcion WHERE nombre = 'Plan Básico'),
  'active',
  NOW()
);
```

### 2. Herramientas de Monitoreo

Durante las pruebas, mantener abiertas:
- **DevTools Console:** Para logs de useUnifiedPermissions
- **Network Tab:** Para verificar queries a Supabase
- **React DevTools:** Para inspeccionar estado de hooks

### 3. Comandos de Utilidad

```javascript
// Inspeccionar estado de permisos en console del browser
console.log('Permissions:', window.__UNIFIED_PERMISSIONS_DEBUG__);

// Forzar refresh de permisos
window.location.reload();
```

## CHECKLIST PRE-EJECUCIÓN

- [ ] Entorno de staging funcional
- [ ] Usuarios de prueba creados
- [ ] Plans de suscripción configurados
- [ ] Console de browser abierta
- [ ] Cronómetro para medir tiempos de respuesta

## VALIDACIONES ADICIONALES

### Performance
- useUnifiedPermissions debe resolver < 100ms
- Cambios de estado deben reflejarse < 200ms
- Sin memory leaks durante cambios de plan

### Seguridad
- Verificar que políticas RLS bloquean acceso cruzado
- Confirmar que manipulación de localStorage no afecta permisos
- Validar que tokens expirados bloquean acceso

### UX
- Mensajes de error claros y en español
- Botones deshabilitados con tooltips explicativos
- Transiciones suaves entre estados

## REPORTE DE BUGS

Si encuentras un fallo:

1. **Capturar contexto completo:**
   - Screenshot del estado de la UI
   - Console logs
   - Estado del hook en React DevTools

2. **Reproducir steps:**
   - Documentar pasos exactos para reproducir
   - Intentar en otro browser

3. **Categorizar severidad:**
   - **CRÍTICO:** Falla de seguridad o funcionalidad básica
   - **ALTO:** UX degradada o performance pobre
   - **MEDIO:** Mensaje confuso o comportamiento inesperado
   - **BAJO:** Mejora cosmética

Esta guía garantiza que la ejecución de las pruebas sea sistemática y completa.
