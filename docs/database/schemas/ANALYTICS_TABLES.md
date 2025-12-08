# Tablas de Analíticas y Reportes

## Vistas de Admin

### admin_creditos_dashboard

Vista consolidada de métricas de créditos.

```sql
CREATE OR REPLACE VIEW public.admin_creditos_dashboard AS
SELECT
  SUM(total_consumidos) as total_creditos_consumidos,
  COUNT(*) FILTER (WHERE balance_disponible > 0) as usuarios_con_creditos,
  SUM(balance_disponible) as total_creditos_disponibles,
  SUM(total_comprados) as total_creditos_vendidos,
  -- Métricas del último mes
  (SELECT COUNT(*) FROM transacciones_creditos 
   WHERE tipo = 'compra' AND created_at >= NOW() - INTERVAL '30 days') as compras_ultimo_mes,
  (SELECT COALESCE(SUM(cantidad), 0) FROM transacciones_creditos 
   WHERE tipo = 'compra' AND created_at >= NOW() - INTERVAL '30 days') as creditos_vendidos_ultimo_mes,
  AVG(balance_disponible) as promedio_balance_por_usuario
FROM creditos_usuarios;
```

**Columnas:**
| Columna | Tipo | Descripción |
|---------|------|-------------|
| total_creditos_consumidos | bigint | Total histórico de créditos usados |
| usuarios_con_creditos | bigint | Usuarios con balance > 0 |
| total_creditos_disponibles | bigint | Suma de balances disponibles |
| total_creditos_vendidos | bigint | Total histórico de compras |
| compras_ultimo_mes | bigint | Transacciones de compra (30 días) |
| promedio_balance_por_usuario | numeric | Balance promedio |

⚠️ **SEGURIDAD**: Esta vista requiere protección con función SECURITY DEFINER.

---

### admin_metricas_timbres

Métricas de consumo de timbres fiscales.

```sql
CREATE OR REPLACE VIEW public.admin_metricas_timbres AS
SELECT
  (SELECT COUNT(DISTINCT user_id) FROM cartas_porte 
   WHERE created_at >= NOW() - INTERVAL '30 days') as total_usuarios_activos,
  (SELECT COUNT(*) FROM cartas_porte 
   WHERE status = 'timbrada' AND DATE(fecha_timbrado) = CURRENT_DATE) as consumos_dia_actual,
  (SELECT COUNT(*) FROM cartas_porte 
   WHERE status = 'timbrada' AND fecha_timbrado >= date_trunc('month', NOW())) as consumos_mes_actual,
  (SELECT COUNT(*) FROM cartas_porte 
   WHERE status = 'timbrada') as timbres_consumidos_historico,
  (SELECT SUM(balance_disponible) FROM creditos_usuarios) as timbres_disponibles_total,
  (SELECT COUNT(*) FROM creditos_usuarios 
   WHERE balance_disponible < 5) as usuarios_cerca_limite,
  (SELECT COUNT(*) FROM subscriptions 
   WHERE status = 'trial') as usuarios_gratuitos,
  ROUND(
    (SELECT COUNT(*)::numeric FROM subscriptions WHERE status = 'active') /
    NULLIF((SELECT COUNT(*)::numeric FROM subscriptions WHERE status = 'trial'), 0) * 100, 2
  ) as tasa_conversion_pct;
```

---

### admin_top_usuarios_consumo

Top consumidores de timbres.

```sql
CREATE OR REPLACE VIEW public.admin_top_usuarios_consumo AS
SELECT
  c.user_id,
  p.email,
  pl.nombre as plan_nombre,
  c.timbres_mes_actual,
  c.total_consumidos as total_historico,
  c.balance_disponible as limite_mensual,
  (SELECT COUNT(*) FROM cartas_porte 
   WHERE usuario_id = c.user_id 
   AND status = 'timbrada'
   AND fecha_timbrado >= date_trunc('month', NOW())) as consumidos_este_mes,
  ROUND(
    CASE 
      WHEN c.balance_disponible > 0 THEN 
        (c.timbres_mes_actual::numeric / c.balance_disponible * 100)
      ELSE 0 
    END, 2
  ) as porcentaje_usado,
  CASE
    WHEN c.balance_disponible = 0 THEN 'sin_creditos'
    WHEN c.timbres_mes_actual >= c.balance_disponible * 0.9 THEN 'critico'
    WHEN c.timbres_mes_actual >= c.balance_disponible * 0.7 THEN 'alto'
    ELSE 'normal'
  END as estado_consumo
FROM creditos_usuarios c
LEFT JOIN profiles p ON p.id = c.user_id
LEFT JOIN subscriptions s ON s.user_id = c.user_id AND s.status IN ('active', 'trial')
LEFT JOIN planes pl ON pl.id = s.plan_id
ORDER BY c.timbres_mes_actual DESC
LIMIT 50;
```

---

## Tablas de Métricas

### analisis_viajes

Análisis de rentabilidad de viajes.

```sql
CREATE TABLE public.analisis_viajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  viaje_id UUID REFERENCES viajes(id),
  cliente_id UUID,
  
  -- Identificación de ruta
  ruta_hash VARCHAR NOT NULL, -- Hash de origen+destino
  vehiculo_tipo VARCHAR,
  fecha_viaje DATE NOT NULL,
  
  -- Tiempos
  tiempo_estimado INTEGER, -- minutos
  tiempo_real INTEGER,
  
  -- Costos
  costo_estimado NUMERIC,
  costo_real NUMERIC,
  precio_cobrado NUMERIC,
  margen_real NUMERIC,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### metricas_tiempo_real

Métricas en tiempo real por usuario.

```sql
CREATE TABLE public.metricas_tiempo_real (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  
  -- Contadores
  viajes_activos INTEGER DEFAULT 0,
  viajes_completados_hoy INTEGER DEFAULT 0,
  conductores_disponibles INTEGER DEFAULT 0,
  alertas_pendientes INTEGER DEFAULT 0,
  
  -- Última actualización
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para actualización automática
CREATE TRIGGER trg_actualizar_metricas
  AFTER INSERT OR UPDATE ON viajes
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_metricas_tiempo_real_v2();
```

---

### costos_viaje

Desglose de costos por viaje.

```sql
CREATE TABLE public.costos_viaje (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  viaje_id UUID NOT NULL REFERENCES viajes(id),
  
  -- Costos estimados
  combustible_estimado NUMERIC,
  peajes_estimados NUMERIC,
  casetas_estimadas INTEGER,
  salario_conductor_estimado NUMERIC,
  mantenimiento_estimado NUMERIC,
  otros_costos_estimados NUMERIC,
  costo_total_estimado NUMERIC,
  
  -- Costos reales
  combustible_real NUMERIC,
  peajes_reales NUMERIC,
  casetas_reales INTEGER,
  salario_conductor_real NUMERIC,
  mantenimiento_real NUMERIC,
  otros_costos_reales NUMERIC,
  costo_total_real NUMERIC,
  
  -- Precios
  precio_cotizado NUMERIC,
  precio_final_cobrado NUMERIC,
  
  -- Márgenes
  margen_estimado NUMERIC,
  margen_real NUMERIC,
  
  -- Comprobantes
  comprobantes_urls JSONB DEFAULT '[]'::jsonb,
  notas_costos TEXT,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### configuraciones_reportes

Configuración de reportes automáticos.

```sql
CREATE TABLE public.configuraciones_reportes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Identificación
  nombre VARCHAR NOT NULL,
  tipo VARCHAR NOT NULL, -- 'viajes', 'ingresos', 'gastos', 'conductores'
  formato VARCHAR NOT NULL, -- 'pdf', 'excel', 'csv'
  
  -- Configuración
  secciones JSONB NOT NULL DEFAULT '[]'::jsonb,
  filtros JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Programación
  horario JSONB DEFAULT '{}'::jsonb,
  -- Ejemplo: {"frecuencia": "semanal", "dia": 1, "hora": "08:00"}
  
  -- Destinatarios
  destinatarios JSONB DEFAULT '[]'::jsonb,
  -- Ejemplo: ["email1@example.com", "email2@example.com"]
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Tablas de Auditoría

### audit_log

Log de auditoría general.

```sql
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla VARCHAR,
  accion VARCHAR, -- 'INSERT', 'UPDATE', 'DELETE'
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS**: Solo visible para admins y superusuarios.

---

### security_audit_log

Log de auditoría de seguridad.

```sql
CREATE TABLE public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action_type VARCHAR NOT NULL,
  resource_type VARCHAR,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### transacciones_creditos

Historial de movimientos de créditos.

```sql
CREATE TABLE public.transacciones_creditos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Tipo de transacción
  tipo VARCHAR NOT NULL, -- 'compra', 'consumo', 'ajuste', 'regalo'
  
  -- Montos
  cantidad INTEGER NOT NULL,
  balance_anterior INTEGER,
  balance_posterior INTEGER,
  
  -- Referencia
  referencia_id UUID, -- ID del timbre consumido, orden de compra, etc.
  referencia_tipo VARCHAR,
  
  -- Descripción
  descripcion TEXT,
  
  -- Stripe
  stripe_payment_intent_id VARCHAR,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Índices Recomendados

```sql
-- Analíticas por usuario y fecha
CREATE INDEX idx_analisis_viajes_user_fecha 
  ON analisis_viajes(user_id, fecha_viaje DESC);

-- Transacciones por usuario y tipo
CREATE INDEX idx_transacciones_user_tipo 
  ON transacciones_creditos(user_id, tipo, created_at DESC);

-- Audit log por fecha
CREATE INDEX idx_audit_log_fecha 
  ON audit_log(created_at DESC);

-- Security log por usuario y acción
CREATE INDEX idx_security_log_user_action 
  ON security_audit_log(user_id, action_type, created_at DESC);
```
