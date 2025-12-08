# Guía de Migración

## Índice

| Archivo | Descripción |
|---------|-------------|
| [DYNAMODB_MIGRATION.md](./DYNAMODB_MIGRATION.md) | Guía completa de migración a DynamoDB |
| [DATA_MODELING.md](./DATA_MODELING.md) | Modelado de datos NoSQL |
| [MIGRATION_SCRIPTS.md](./MIGRATION_SCRIPTS.md) | Scripts de migración |

## Resumen

Esta sección documenta cómo migrar el esquema de PostgreSQL/Supabase a Amazon DynamoDB.

### ¿Por qué migrar a DynamoDB?

| Aspecto | PostgreSQL | DynamoDB |
|---------|------------|----------|
| Escalabilidad | Vertical (costosa) | Horizontal (automática) |
| Latencia | ~10-50ms | ~1-10ms |
| Costo a escala | Lineal | Pay-per-use |
| Mantenimiento | Alto | Casi nulo |
| Transacciones | Completas (ACID) | Limitadas (2 items) |
| Consultas | Flexibles (SQL) | Restringidas (PK/SK) |

### Cuándo migrar

✅ **Bueno para DynamoDB:**
- Alto volumen de lecturas/escrituras simples
- Patrones de acceso predecibles
- Necesidad de baja latencia consistente
- Escalabilidad automática requerida

❌ **Mantener en PostgreSQL:**
- Consultas analíticas complejas
- JOINs frecuentes entre entidades
- Transacciones multi-tabla
- Reportes ad-hoc

### Estrategia de Migración

1. **Fase 1: Análisis**
   - Documentar patrones de acceso actuales
   - Identificar entidades principales
   - Definir GSIs necesarios

2. **Fase 2: Diseño**
   - Modelar single-table design
   - Diseñar partition keys y sort keys
   - Planificar GSIs

3. **Fase 3: Migración Paralela**
   - Ejecutar ambas bases en paralelo
   - Dual-write a PostgreSQL y DynamoDB
   - Validar consistencia

4. **Fase 4: Cutover**
   - Cambiar lecturas a DynamoDB
   - Mantener PostgreSQL como backup
   - Desactivar escrituras a PostgreSQL

### Mapa de Entidades

| PostgreSQL Table | DynamoDB Entity | Strategy |
|------------------|-----------------|----------|
| viajes | USER#viaje | By user_id |
| conductores | USER#conductor | By user_id |
| vehiculos | USER#vehiculo | By user_id |
| cartas_porte | USER#carta | By usuario_id |
| ubicaciones | CARTA#ubicacion | Embedded or nested |
| mercancias | CARTA#mercancia | Embedded or nested |
| cat_* (catálogos) | Mantener en PostgreSQL | Read-only, low volume |

### Consideraciones de Seguridad

```
PostgreSQL RLS  →  Lambda + IAM + Cognito
                   ├── Lambda Authorizer
                   ├── Cognito User Pools
                   └── IAM Fine-grained Access
```

RLS se reemplaza con:
1. **Lambda Authorizers**: Validan JWT y extraen user_id
2. **Cognito Groups**: Definen roles (admin, user)
3. **IAM Policies**: Restringen acceso por partition key

### Documentación Relacionada

- [AWS DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Single-Table Design](https://www.alexdebrie.com/posts/dynamodb-single-table/)
- [DynamoDB Book](https://www.dynamodbbook.com/)
