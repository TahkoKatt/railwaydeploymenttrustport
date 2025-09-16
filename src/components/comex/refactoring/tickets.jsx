# COMEX Refactoring - Paquete 1: Canonical Structure

**Epic:** COMEX-001 - Arquitectural Cleanup & Workbench Pattern

---

## Ticket COMEX-002: Canonical Slugs & Namespaces (ASCII only)

**Story Points:** 3  
**Owner:** Frontend Lead  
**Priority:** P0  

### Descripción
Definir y aplicar slugs/ids/namespaces canónicos ASCII-only para todos los submódulos de COMEX.

### Tareas Técnicas
- [ ] Crear constante `COMEX_CANONICAL_SLUGS` en `/constants/comex.js`
- [ ] Mapear slugs legacy → canonical en tabla de migración
- [ ] Actualizar namespaces en i18n keys (`comex.si.*`, `comex.bl_awb.*`)
- [ ] Sanitizar IDs de componentes y data-testids

### Definition of Done
- [ ] No existe ninguna ruta/slug con acentos o espacios en el código
- [ ] Namespace por tab único y documentado
- [ ] Build pasa con chequeo ASCII (ver ticket COMEX-007)
- [ ] Tabla de mapeo legacy→canonical completada

### Archivos Impactados
- `constants/comex.js` (nuevo)
- `locales/es/comex.json` (keys refactor)
- `components/comex/*` (data-testids)

---

## Ticket COMEX-003: Router Refactor + 308 Redirects

**Story Points:** 8  
**Owner:** Full-stack Senior  
**Priority:** P0  

### Descripción
Migrar de rutas query-based (`/COMEX?tab=si`) a path-based (`/comex/si`) manteniendo compatibilidad con redirects 308.

### Tareas Técnicas
- [ ] Crear rutas canónicas en router: `/comex/:tab`
- [ ] Implementar middleware de redirects 308
- [ ] Actualizar `layout.jsx` subnav para usar rutas path-based
- [ ] Feature flag `COMEX_ROUTER_V2` para rollback
- [ ] Testing de deep-links y compatibilidad

### Definition of Done
- [ ] Navegar a `/COMEX?tab=si` redirige a `/comex/si` (308)
- [ ] URLs compartidas en correos siguen funcionando
- [ ] Subnav actualiza tab activo correctamente
- [ ] Feature flag funcional para rollback inmediato

### Archivos Impactados
- `pages/COMEX.jsx` → `pages/comex/[...tab].jsx`
- `layout.jsx` (subnav routes)
- `middleware/redirects.js` (nuevo)

---

## Ticket COMEX-004: Split Layout en Workbenches

**Story Points:** 13  
**Owner:** Frontend Senior + UI Designer  
**Priority:** P0  

### Descripción
Extraer cada tab como Workbench independiente siguiendo el patrón de Compras/SRM. Eliminar herencia fantasma del dashboard.

### Tareas Técnicas
- [ ] Crear `SiWorkbench.jsx` con KpiGrid + AIPanel + Toolbar + Table
- [ ] Crear `BookingWorkbench.jsx` siguiendo patrón Trustport
- [ ] Crear `BlAwbWorkbench.jsx` con componentes específicos
- [ ] Crear `DocsWorkbench.jsx`, `ComplianceWorkbench.jsx`, etc.
- [ ] Migrar lógica específica de cada tab desde `COMEX.jsx`
- [ ] Limpiar layout padre (solo shell, sin widgets)

### Definition of Done
- [ ] Cada tab muestra header/KPI/tabla propios
- [ ] Ningún componente del Dashboard aparece en tabs internos
- [ ] Visual parity con estado actual (sin regresiones)
- [ ] Storybook stories por cada Workbench

### Archivos Impactados
- `components/comex/workbenches/` (carpeta nueva)
- `pages/COMEX.jsx` (limpieza masiva)
- `components/comex/` (reorganización)

### Entregables
- 8 componentes Workbench funcionales
- Storybook documentation
- Screenshot comparisons (antes/después)

---

## Ticket COMEX-005: Aislamiento de Estado

**Story Points:** 5  
**Owner:** Frontend Senior  
**Priority:** P1  

### Descripción
Migrar estados compartidos a contextos locales por Workbench. Eliminar bleeding de estado entre tabs.

### Tareas Técnicas
- [ ] Auditar estado global compartido en COMEX
- [ ] Crear hooks locales por Workbench (`useSiState`, `useBookingState`)
- [ ] Implementar cleanup `onUnmount` en cada Workbench
- [ ] Migrar filtros y KPIs a estado local
- [ ] Testing de navegación cruzada (no-bleeding)

### Definition of Done
- [ ] Cambiar de `si` a `bl-awb` no conserva filtros del otro tab
- [ ] Test: setear filtro en `si`, navegar a `liquidacion`, volver → filtro se mantiene solo en `si`
- [ ] No hay memoria leaks en navegación rápida entre tabs
- [ ] Estado persiste correctamente en refresh por tab

### Archivos Impactados
- `hooks/comex/` (carpeta nueva)
- Cada Workbench (estado local)
- `__tests__/comex/navigation.test.js` (nuevo)

---

## Ticket COMEX-006: Subnav Registry + Guardrails

**Story Points:** 5  
**Owner:** Frontend Mid  
**Priority:** P1  

### Descripción
Implementar subnav unificado basado en `COMEX_TABS` registry con RBAC por tab.

### Tareas Técnicas
- [ ] Crear `COMEX_TABS` registry con metadata por tab
- [ ] Implementar `ComexSubnav` component con tabs registry
- [ ] Integrar RBAC: usuario sin permiso → tab no visible + 403
- [ ] Active state desde URL + persistencia tras refresh
- [ ] Responsive behavior (scroll horizontal en mobile)

### Definition of Done
- [ ] Usuario sin permiso de `liquidacion` no ve el tab
- [ ] 403 response si accede directamente a tab sin permiso
- [ ] Tab activo se subraya y persiste tras refresh
- [ ] Mobile UX funcional (scroll horizontal)

### Archivos Impactados
- `components/comex/ComexSubnav.jsx` (nuevo)
- `constants/comex.js` (COMEX_TABS)
- `hooks/useRBAC.js` (extension)

---

## Ticket COMEX-007: Linter "No-Accents" + Pre-commit

**Story Points:** 3  
**Owner:** DevOps + Frontend Lead  
**Priority:** P1  

### Descripción
Regla ESLint custom `no-non-ascii-in-ui` para claves críticas + hook pre-commit que bloquee violaciones.

### Tareas Técnicas
- [ ] Crear regla ESLint `no-non-ascii-in-ui`
- [ ] Configurar targets: rutas, slugs, namespaces, i18n keys, data-testids
- [ ] Integrar en pre-commit hook (husky)
- [ ] Configurar CI pipeline para bloquear PRs con violaciones
- [ ] Documentar exceptions (si las hay) en eslintrc

### Definition of Done
- [ ] Commits con caracteres no ASCII en keys críticos fallan pre-commit
- [ ] Pipeline CI bloquea PRs que violen la regla
- [ ] Team puede ver reglas claras en documentation
- [ ] Existing codebase pasa el linter (cleanup previo)

### Archivos Impactados
- `.eslintrc.js` (custom rule)
- `eslint-rules/no-non-ascii-in-ui.js` (nuevo)
- `.husky/pre-commit`
- `.github/workflows/ci.yml`

---

## Ticket COMEX-008: JSON Contracts & Redirect Map

**Story Points:** 2  
**Owner:** Backend Lead  
**Priority:** P1  

### Descripción
Actualizar contratos JSON de routing por submódulo + generar `redirects.json` para mapeo legacy→canonical.

### Tareas Técnicas
- [ ] Actualizar `routing_contract` en cada submódulo JSON
- [ ] Generar `redirects.json` con mapeo completo legacy→canonical
- [ ] Validar que no se pierda ninguna ruta existente
- [ ] Documentar contract format para futuros submódulos

### Definition of Done
- [ ] Todos los submódulos tienen `url_pattern` canónico
- [ ] `redirects.json` incluye todas las rutas legacy identificadas
- [ ] QA valida que no se pierda ninguna ruta previa
- [ ] Documentation actualizada con ejemplos

### Archivos Impactados
- `data/comex/*.json` (routing_contract)
- `config/redirects.json` (nuevo)
- `docs/routing-contracts.md` (actualización)

---

## Ticket COMEX-009: Smoke & E2E Testing

**Story Points:** 8  
**Owner:** QA Lead + Frontend Senior  
**Priority:** P1  

### Descripción
Suite completa de tests Playwright/Cypress reproducing el bug actual y validando la resolución.

### Tareas Técnicas
- [ ] Test por tab: renderiza Workbench correcto (data-testid assertion)
- [ ] Test navegación: tabs no se contaminan entre sí
- [ ] Test redirects: legacy URLs funcionan correctamente
- [ ] Test estado: filtros persisten por tab independientemente
- [ ] Regression tests: funcionalidad actual se mantiene
- [ ] Performance tests: P95 < 800ms por Workbench

### Definition of Done
- [ ] `/comex/si` renderiza `SiWorkbench` (assert `data-testid="si-kpi-grid"`)
- [ ] `/comex/bl-awb` renderiza `BlAwbWorkbench` sin elementos de `si-*`
- [ ] `/comex/liquidacion` muestra su tabla, no panel SI
- [ ] 100% smoke tests pasan en CI
- [ ] Video/screenshots guardados en artifacts

### Archivos Impactados
- `tests/e2e/comex/` (carpeta nueva)
- `playwright.config.js` (COMEX suite)
- `.github/workflows/e2e.yml`

---

## Ticket COMEX-010: Telemetría + Alerting

**Story Points:** 3  
**Owner:** Backend Mid + DevOps  
**Priority:** P2  

### Descripción
Eventos de analytics por tab + alertas en Sentry para detectar regressions (TabMismatchError).

### Tareas Técnicas
- [ ] Eventos `page_view` con `page='/comex/<tab>'` y `namespace`
- [ ] Custom error `TabMismatchError` para detectar renders erróneos
- [ ] Sentry alerting rule: 0 TabMismatchError en 48h post-deploy
- [ ] Dashboard analytics: bounce rate < 10% por tab
- [ ] Performance monitoring: P95 loading time per Workbench

### Definition of Done
- [ ] Analytics dashboard muestra vistas por tab con métricas key
- [ ] Sentry sin eventos `TabMismatchError` en 48h tras deploy
- [ ] Alertas configuradas para regression detection
- [ ] Performance baselines establecidos por Workbench

### Archivos Impactados
- `analytics/events.js` (COMEX events)
- `utils/errorReporting.js` (TabMismatchError)
- `monitoring/sentry.config.js`

---

# Plan de Migración - Paquete 1

## Week 1: Foundation
- **COMEX-002** (Canonical Slugs) - Frontend Lead
- **COMEX-007** (Linter Setup) - DevOps + Frontend Lead
- **COMEX-008** (JSON Contracts) - Backend Lead

## Week 2-3: Core Refactor
- **COMEX-003** (Router Refactor) - Full-stack Senior
- **COMEX-004** (Workbenches Split) - Frontend Senior + UI Designer
- **COMEX-005** (State Isolation) - Frontend Senior

## Week 4: Integration & Testing
- **COMEX-006** (Subnav Registry) - Frontend Mid
- **COMEX-009** (E2E Testing) - QA Lead + Frontend Senior
- **COMEX-010** (Telemetry) - Backend Mid + DevOps

## Deployment Strategy
1. **Feature Flag:** `COMEX_ROUTER_V2=false` (default)
2. **Staging Deploy:** All tickets deployed behind flag
3. **QA Validation:** Full E2E suite + manual testing
4. **Prod Deploy:** Flag flip to `true` in controlled rollout
5. **Legacy Cleanup:** Remove old router after 30 days stable

## Rollback Plan
- **Immediate:** Flip `COMEX_ROUTER_V2=false`
- **Workbenches:** Remain deployable but inactive
- **Zero Downtime:** Users see functional (legacy) version during rollback

---

# Criterios Go/No-Go

## Mandatory (Blockers)
- [ ] Ningún tab renderiza componentes de otro tab
- [ ] 0 tildes/acentos en rutas, slugs, ids, namespaces
- [ ] Legacy links redirigen correctamente (308)
- [ ] E2E tests green + Sentry sin TabMismatchError

## Success Metrics
- [ ] P95 load time < 800ms per Workbench
- [ ] Bounce rate < 10% per tab
- [ ] 0 user-reported regressions en 48h
- [ ] Team velocity restored (no más "phantom dashboard" bugs)

## Rollback Triggers
- [ ] > 5% error rate en cualquier Workbench
- [ ] P95 > 1200ms sustained por > 10min
- [ ] > 3 user-reported critical regressions
- [ ] Sentry error volume > 2x baseline

---

**Estimación Total:** 50 Story Points (~4-5 semanas con team de 4-5 devs)
**Budget:** €45K-60K (incluyendo QA y DevOps)
**ROI Expected:** -80% "phantom dashboard" bugs, +40% developer velocity en COMEX