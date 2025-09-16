# COMEX Refactoring - Paquete 2: Paridad Funcional 1:1

**Epic:** COMEX-100 - Zero Loss Migration & Functional Parity  
**Prerequisite:** Paquete 1 (Router + Workbenches) deployed to staging  
**Success Criteria:** 0 functional regressions, 0 data loss, 0 non-ASCII keys  

---

## Pre-Work: Baseline Establishment

### COMEX-110: Inventario Automático → Parity Matrix
**Story Points:** 5  
**Owner:** Full-stack Senior  
**Priority:** P0  
**Sprint:** 1  

#### Descripción
Script automatizado que extrae el estado actual completo de COMEX y genera matrices de paridad verificables por submódulo.

#### Tareas Técnicas
- [ ] Script `extract-comex-baseline.js` que parsea componentes actuales
- [ ] Extractor de columnas, filtros, acciones, KPIs, alertas por tab
- [ ] Generador de `parity/<tab>.json` y `parity/<tab>.csv`
- [ ] CRC/SHA256 del dump completo guardado en repo
- [ ] Documentación del schema de Parity Matrix

#### Definition of Done
- [ ] 8 archivos `parity/<tab>.json` con estructura completa
- [ ] CSV legible para QA manual: `parity/<tab>.csv`
- [ ] Checksum `comex_baseline_v1.sha` en repo
- [ ] Schema documentado en `docs/parity-matrix.md`
- [ ] Script ejecutable en CI para validaciones futuras

#### Archivos Creados
- `scripts/extract-comex-baseline.js`
- `parity/si.json`, `parity/booking.json`, etc.
- `parity/baseline-checksum.sha`
- `docs/parity-matrix.md`

#### Acceptance Criteria
- Matriz incluye: columns, filters, row_actions, bulk_actions, kpis, alerts, states, docs_supported
- Datos extraídos son determinísticos (mismo input = mismo output)
- QA puede verificar manualmente contra UI actual

---

### COMEX-111: Storybook Baseline (Visual Locks)
**Story Points:** 8  
**Owner:** Frontend Senior + UI Designer  
**Priority:** P0  
**Sprint:** 1  

#### Descripción
Crear historias Storybook por Workbench y estados críticos, estableciendo snapshots visuales como baseline inmutable.

#### Tareas Técnicas
- [ ] Historia por Workbench: SiWorkbench, BookingWorkbench, etc.
- [ ] Estados por historia: empty, loading, with_data, error, no_permissions
- [ ] Snapshots aprobados con Chromatic/Percy
- [ ] Data-testids consistentes para elementos clave
- [ ] Stories por overlay (comerciante/operador_logistico)

#### Definition of Done
- [ ] 8 Workbenches × 5 estados = 40 stories funcionales
- [ ] Visual snapshots baseline aprobados y versionados
- [ ] Cualquier cambio visual futuro requiere approval explícito
- [ ] Data-testids documentados: `data-testid="<tab>-kpi-grid"`
- [ ] Stories responsive (mobile/tablet/desktop)

#### Archivos Creados
- `stories/comex/<Tab>Workbench.stories.jsx`
- `.storybook/visual-snapshots/` (baseline)
- `docs/visual-regression-guide.md`

#### Acceptance Criteria
- Stories cargan sin errores en Storybook
- Snapshots son pixel-perfect con UI actual
- Coverage: todos los estados críticos representados

---

### COMEX-112: Seeds Freeze + Validador
**Story Points:** 3  
**Owner:** Backend Mid  
**Priority:** P0  
**Sprint:** 1  

#### Descripción
Exportar y versionar seeds demo actuales con validador automatizado que detecta cambios no autorizados.

#### Tareas Técnicas
- [ ] Export completo de datos demo actuales por perfil
- [ ] Generador de `seeds_v1.json` con metadatos y checksums
- [ ] Validador que verifica conteos y estructura
- [ ] Test automatizado que falla si seeds cambian sin update
- [ ] Documentación de formato y versionado

#### Definition of Done
- [ ] `seeds_v1.json` con datos demo completos y determinísticos
- [ ] Conteos esperados: "3 bookings, 2 expedientes FCL/AIR, 8 facturas"
- [ ] Test `validate-seeds.test.js` que falla en cambios no autorizados
- [ ] Seeds son restaurables en entornos limpios
- [ ] Diferencial entre comerciante/operador_logistico preservado

#### Archivos Creados
- `data/seeds/comex_v1.json`
- `tests/seeds/validate-seeds.test.js`
- `scripts/restore-seeds.js`
- `docs/seeds-versioning.md`

#### Acceptance Criteria
- Seeds son idempotentes (misma ejecución = mismo resultado)
- Test falla si alguien modifica data sin actualizar versión
- QA puede restaurar estado demo conocido

---

## Core Migration

### COMEX-113: Mapas de Claves (Legacy → Canonical ASCII)
**Story Points:** 3  
**Owner:** Frontend Lead  
**Priority:** P0  
**Sprint:** 1  

#### Descripción
Tabla completa de mapeo para migrar todas las claves/ids/rutas a formato ASCII sin perder referencias.

#### Tareas Técnicas
- [ ] Auditoría completa de claves non-ASCII actuales
- [ ] Tabla de mapeo: `Liquidación→liquidacion`, `BL/AWB→bl-awb`
- [ ] Script de migración automática de claves en código
- [ ] Validador que garantiza 0 non-ASCII en keys críticos
- [ ] Testing de compatibilidad hacia atrás

#### Definition of Done
- [ ] 0 tildes/ñ/espacios en ids, keys, namespaces, routes
- [ ] Mapeo completo documentado en `key-migration.csv`
- [ ] Script `migrate-keys.js` idempotente
- [ ] Linter actualizado para prevenir regresiones futuras
- [ ] Labels UI pueden mantener acentos (no son keys)

#### Archivos Impactados
- Todos los archivos con claves COMEX
- `data/key-migration.csv`
- `scripts/migrate-keys.js`

#### Acceptance Criteria
- Build pasa con linter `no-non-ascii-keys`
- Funcionalidad equivalente con nuevas claves
- Backward compatibility durante período de gracia

---

### COMEX-114: Migración SI Workbench con Paridad Fiel
**Story Points:** 8  
**Owner:** Frontend Senior  
**Priority:** P0  
**Sprint:** 2  

#### Descripción
Reescribir submódulo SI usando SiWorkbench con paridad exacta según Parity Matrix.

#### Tareas Técnicas
- [ ] `SiWorkbench.jsx` con estructura Trustport estándar
- [ ] Migración de columnas exactas (orden, tipo, formato, ancho)
- [ ] Filtros idénticos (tipo, valores por defecto, persistencia)
- [ ] Acciones de fila/masivas con mismos ids y efectos
- [ ] KPIs/alertas con formato y cálculo idénticos

#### Definition of Done
- [ ] Parity Matrix SI = 100% verde (0 diferencias)
- [ ] Visual snapshot idéntico al baseline
- [ ] Filtros persisten entre sesiones
- [ ] Acciones funcionan exactamente igual
- [ ] Performance: P95 < 800ms load time

#### Archivos Creados
- `components/comex/workbenches/SiWorkbench.jsx`
- `hooks/comex/useSiData.js`
- `tests/comex/si-parity.test.js`

#### Acceptance Criteria
- QA manual: "no distingo diferencia vs versión actual"
- Tests automatizados: 100% verde
- Performance dentro del target

---

### COMEX-115: Migración Booking Workbench con Paridad Fiel
**Story Points:** 8  
**Owner:** Frontend Senior  
**Priority:** P0  
**Sprint:** 2  

#### Descripción
Migración completa del submódulo Booking aplicando el mismo patrón que COMEX-114.

#### Definition of Done
- [ ] Parity Matrix Booking = 100% verde
- [ ] Estados de booking preservados (draft/confirmed/cancelled)
- [ ] Validaciones idénticas en forms
- [ ] Integración con carriers mantenida

---

### COMEX-116: Migración BL-AWB Workbench con Paridad Fiel
**Story Points:** 8  
**Owner:** Frontend Senior  
**Priority:** P0  
**Sprint:** 2-3  

#### Descripción
Migración completa del submódulo BL-AWB aplicando el mismo patrón establecido.

#### Definition of Done
- [ ] Parity Matrix BL-AWB = 100% verde
- [ ] Document viewer funcional
- [ ] Upload/download de documentos
- [ ] Tracking integration preservada

---

### COMEX-117: Migración Docs/Compliance/Tracking Workbenches
**Story Points:** 13  
**Owner:** Frontend Senior + Frontend Mid  
**Priority:** P0  
**Sprint:** 3  

#### Descripción
Migración en batch de los 3 workbenches restantes: Docs, Compliance, Tracking

#### Definition of Done
- [ ] 3 Parity Matrices = 100% verde
- [ ] Document templates preservadas
- [ ] Compliance rules intactas
- [ ] Tracking events sin pérdida

---

### COMEX-118: Migración Liquidación/Archivo Workbenches
**Story Points:** 8  
**Owner:** Frontend Mid  
**Priority:** P1  
**Sprint:** 3  

#### Descripción
Migración final de los submódulos Liquidación y Archivo.

#### Definition of Done
- [ ] 2 Parity Matrices = 100% verde
- [ ] Cálculos de costes exactos
- [ ] Archive/restore functionality

---

## Quality Gates

### COMEX-119: Accesibilidad y Formatos
**Story Points:** 5  
**Owner:** Frontend Senior + Accessibility Expert  
**Priority:** P1  
**Sprint:** 3  

#### Descripción
Verificar formato/locale de columnas numéricas/fechas/moneda y compliance ARIA en tablas.

#### Definition of Done
- [ ] Formatos exactamente iguales al baseline
- [ ] WCAG AA contrast compliance
- [ ] Focus ring usando design tokens
- [ ] Screen reader testing verde
- [ ] Keyboard navigation funcional

---

### COMEX-120: Regresión E2E (Smoke por Tab)
**Story Points:** 13  
**Owner:** QA Lead + Frontend Senior  
**Priority:** P0  
**Sprint:** 3-4  

#### Descripción
Suite Playwright/Cypress con escenarios críticos por submódulo.

#### Casos de Prueba por Tab
- [ ] Listado carga y respeta filtros aplicados
- [ ] Acción de fila abre side-panel correcto
- [ ] Bulk action disponible con selección múltiple
- [ ] Export CSV produce columnas idénticas
- [ ] Deep links funcionan (gracias a redirects Paquete 1)

#### Definition of Done
- [ ] 8 tabs × 5 casos = 40 tests funcionales
- [ ] 100% verde en CI pipeline
- [ ] Screenshots y videos archivados
- [ ] Performance testing: P95 < 800ms por tab
- [ ] Mobile responsive testing

---

### COMEX-121: Pruebas de KPI/Alertas (Unit + Contract)
**Story Points:** 8  
**Owner:** Frontend Mid + Backend Mid  
**Priority:** P1  
**Sprint:** 4  

#### Descripción
Testing específico de lógica de cálculo de KPIs y condiciones de alertas.

#### Definition of Done
- [ ] Unit tests para fórmulas de KPIs (cobertura 100%)
- [ ] Contract tests: KPIs devuelven formato correcto
- [ ] Alertas se disparan en condiciones controladas
- [ ] Alertas NO se disparan cuando no deben
- [ ] Datos de prueba determinísticos

---

### COMEX-122: Paridad de Estados y Flujos (State Machine Tests)
**Story Points:** 8  
**Owner:** Backend Senior  
**Priority:** P1  
**Sprint:** 4  

#### Descripción
Definir y testear state machines por submódulo con transiciones exactas del sistema actual.

#### Definition of Done
- [ ] State machine definida por submódulo
- [ ] 0 transiciones nuevas introducidas en Paquete 2
- [ ] Test: transición inválida → error visible + log
- [ ] Diagramas de estado documentados
- [ ] Rollback path para cada transición

---

### COMEX-123: Auditoría de Acciones y Permisos
**Story Points:** 5  
**Owner:** Backend Mid + Security  
**Priority:** P1  
**Sprint:** 4  

#### Descripción
Verificar que matriz acción×rol es idéntica al baseline.

#### Definition of Done
- [ ] Matriz permisos baseline vs nueva = 100% match
- [ ] Test: acción sin permiso → 403 + toast coherente
- [ ] Audit log de cambios de permisos
- [ ] Testing con usuarios de diferentes roles

---

### COMEX-124: Non-Regression de Plantillas/Documentos
**Story Points:** 3  
**Owner:** Backend Mid  
**Priority:** P1  
**Sprint:** 4  

#### Definition of Done
- [ ] Uploader acepta mismos MIME types
- [ ] Document detail muestra campos idénticos
- [ ] Estados doc preservados: validando/validado/error/expira
- [ ] Template generation sin cambios

---

### COMEX-125: Compatibilidad Deep-Links y Export
**Story Points:** 3  
**Owner:** Full-stack Mid  
**Priority:** P1  
**Sprint:** 4  

#### Definition of Done
- [ ] Todos los deep-links históricos funcionan
- [ ] CSV export: headers y orden idénticos al baseline
- [ ] URL sharing mantiene filtros aplicados
- [ ] Bookmark compatibility

---

### COMEX-126: Gate de Calidad (Go/No-Go)
**Story Points:** 2  
**Owner:** Release Manager + QA Lead  
**Priority:** P0  
**Sprint:** 4  

#### Checklist Go/No-Go
- [ ] **Parity Matrix:** 8/8 submódulos = 100% verde
- [ ] **Testing:** E2E + Unit + Visual = 100% verde
- [ ] **Performance:** P95 < 800ms todos los tabs
- [ ] **Seeds:** Validador verde, datos demo intactos
- [ ] **Accessibility:** WCAG AA compliance
- [ ] **Security:** Audit de permisos = baseline
- [ ] **Sentry:** 0 errores nuevos en staging 48h
- [ ] **Manual QA:** Sign-off por submódulo
- [ ] **Stakeholder:** Approval de Product Owner
- [ ] **Rollback:** Plan documentado y testado

#### Definition of Done
- [ ] Checklist 100% firmado
- [ ] Release notes aprobados
- [ ] Rollback plan validado
- [ ] Merge to main autorizado

---

# Planificación de Sprints

## Sprint 1 (Week 1): Baseline & Foundations
- **COMEX-110** (Inventario Automático) - Full-stack Senior
- **COMEX-111** (Storybook Baseline) - Frontend Senior + UI Designer
- **COMEX-112** (Seeds Freeze) - Backend Mid
- **COMEX-113** (Mapas ASCII) - Frontend Lead

## Sprint 2 (Week 2): Core Workbenches
- **COMEX-114** (SI Workbench) - Frontend Senior
- **COMEX-115** (Booking Workbench) - Frontend Senior
- **COMEX-116** (BL-AWB Workbench) - Frontend Senior

## Sprint 3 (Week 3): Remaining Workbenches
- **COMEX-117** (Docs/Compliance/Tracking) - Frontend Senior + Frontend Mid
- **COMEX-118** (Liquidación/Archivo) - Frontend Mid
- **COMEX-119** (Accesibilidad) - Frontend Senior + Accessibility Expert

## Sprint 4 (Week 4): Quality & Gates
- **COMEX-120** (E2E Testing) - QA Lead + Frontend Senior
- **COMEX-121** (KPI/Alertas Testing) - Frontend Mid + Backend Mid
- **COMEX-122** (State Machines) - Backend Senior
- **COMEX-123** (Permisos Audit) - Backend Mid + Security
- **COMEX-124** (Plantillas) - Backend Mid
- **COMEX-125** (Deep-Links) - Full-stack Mid
- **COMEX-126** (Go/No-Go Gate) - Release Manager + QA Lead

---

# Recursos y Estimaciones

**Team Size:** 6-8 developers + 1 QA Lead + 1 Release Manager  
**Total Story Points:** 89 SP  
**Duration:** 4 sprints (4 semanas)  
**Budget Estimate:** €65K-80K (incluyendo QA, accessibility, security audit)  

## Risk Buffer
- **+20% time buffer** para edge cases y ajustes finos
- **Rollback plan** testado y documentado
- **Feature flag** para activación gradual

---

# Success Metrics

## Zero Loss Criteria (Mandatory)
- **Functional Parity:** 0 columnas/filtros/acciones perdidos
- **Data Integrity:** 0 pérdida de seeds/templates/estados
- **Performance:** P95 < 800ms por Workbench
- **Accessibility:** WCAG AA compliance mantenido
- **Security:** 0 regresiones en matriz de permisos

## Quality Gates
- **Visual Regression:** 0 diferencias no aprobadas vs baseline
- **E2E Coverage:** 100% casos críticos cubiertos
- **Unit Testing:** 90%+ cobertura en lógica de negocio
- **Manual QA:** Sign-off por stakeholder y submódulo

## Post-Deploy Monitoring (48h)
- **Error Rate:** < 0.1% en todos los Workbenches  
- **User Satisfaction:** 0 reportes críticos de regresión
- **Performance:** P95 sostenido < 800ms
- **Sentry:** 0 nuevos tipos de error

---

**Status:** Ready for Sprint Planning & Execution  
**Next:** Paquete 3 - Contratos de Datos Canónicos (upon successful completion)