/*
COMPRAS → RC - FEATURE FLAGS CONFIGURATION
Tenant: tnt-demo-trustport-001
Users: usr_comerciante_01, usr_comerciante_02, usr_comerciante_03, usr_operador_01, usr_operador_02
Profile path: user.custom_claims.profile
*/

export const FEATURE_FLAGS_CONFIG = {
  "module": "compras",
  "rules": [
    // PHASE 0 - Infrastructure
    { "flag": "router.ascii_only", "value": true },
    { "flag": "registry.v2", "value": true },
    { "flag": "schema.validator", "value": true },

    // PO SERVICIOS - Dark launch then canary
    { "flag": "po_services.dual_write_v2", "when": { "tenant_id": "tnt-demo-trustport-001" }, "value": true },
    { "flag": "po_services.read_from_v2", "when": { "tenant_id": "tnt-demo-trustport-001", "user_id_in": ["usr_comerciante_01","usr_comerciante_02","usr_comerciante_03"], "user.custom_claims.profile": "comerciante", "percentage": 10 }, "value": true },

    // PO BIENES - Dark launch then canary  
    { "flag": "po_goods.dual_write_v2", "when": { "tenant_id": "tnt-demo-trustport-001" }, "value": true },
    { "flag": "po_goods.ui_preview_v2", "when": { "tenant_id": "tnt-demo-trustport-001", "user_id_in": ["usr_comerciante_01","usr_comerciante_02","usr_comerciante_03"] }, "value": true },

    // ACTION CENTER - Preview enabled
    { "flag": "ac.v2.ui", "when": { "tenant_id": "tnt-demo-trustport-001" }, "value": true },
    
    // OTHER MODULES - Global flags
    { "flag": "ap.ingest_v2", "value": true },
    { "flag": "ap.match_v2", "value": true },
    { "flag": "landed.engine_v2", "value": true },
    { "flag": "analytics.v2", "value": true },
    { "flag": "returns.v2", "value": true },
    { "flag": "debit_engine.v2", "value": true }
  ],
  "order": ["tenant_id","user.custom_claims.profile","user_id_in","percentage"]
};

export const GUARDRAILS_CONFIG = {
  "guardrails": [
    { "metric": "dual_write_error_rate", "op": ">", "value": 0.01, "action": "disable_read_from_v2" },
    { "metric": "dlq_backlog", "op": ">", "value": 0, "action": "disable_read_from_v2" },
    { "metric": "api_p99_ms", "op": ">", "value": 400, "action": "disable_read_from_v2" },
    { "metric": "three_way_match_drop_pp", "op": ">=", "value": 5, "action": "disable_read_from_v2" },
    { "metric": "variance_landed", "op": ">", "value": 0.025, "action": "disable_read_from_v2" }
  ]
};

export const HEALTH_CHECKS = {
  "reconciliation_queries": {
    "spo_count_v1": "SELECT COUNT(*) FROM spo_v1 WHERE tenant_id='tnt-demo-trustport-001';",
    "spo_count_v2": "SELECT COUNT(*) FROM spo_v2 WHERE tenant_id='tnt-demo-trustport-001';",
    "spo_diff_pct": `SELECT 100.0 * COUNT(*) FILTER (WHERE h1 != h2) / NULLIF(COUNT(*),0) AS diff_pct
FROM (
  SELECT spo_id, md5(jsonb_strip_nulls(data)::text) AS h1
  FROM spo_v1 WHERE tenant_id='tnt-demo-trustport-001'
) a
FULL JOIN (
  SELECT spo_id, md5(jsonb_strip_nulls(data)::text) AS h2
  FROM spo_v2 WHERE tenant_id='tnt-demo-trustport-001'
) b USING (spo_id);`
  }
};

export const CANARY_IDS = {
  "tenant_demo_id": "tnt-demo-trustport-001",
  "comerciante_user_ids": ["usr_comerciante_01","usr_comerciante_02","usr_comerciante_03"],
  "operador_user_ids": ["usr_operador_01","usr_operador_02"],
  "profile_claim_path": "user.custom_claims.profile"
};

// Router ASCII-only validator
export const validateTabRoute = (tab) => {
  // ASCII-only route validation - block special chars to prevent dashboard cloning
  const asciiOnlyRegex = /^[a-zA-Z0-9_-]+$/;
  if (!tab || !asciiOnlyRegex.test(tab)) {
    throw new Error(`Invalid tab route: "${tab}". Only ASCII alphanumeric, underscore and hyphen allowed.`);
  }
  return true;
};

// Registry namespaced lookup
export const getModuleRegistry = (module, submodule, version = 2) => {
  const namespace = `${module}.${submodule}@${version}`;
  return {
    namespace,
    module,
    submodule, 
    version,
    schema_path: `entities/${submodule}Schema.json`,
    component_path: `components/${module}/${submodule}Component.jsx`
  };
};

// Schema validator (visible errors, no white screens)
export const validatePayload = (payload, schema) => {
  try {
    // Basic schema validation - in production this would use proper JSON Schema validator
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload must be a valid object');
    }
    
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in payload)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
    }
    
    return { valid: true, errors: [] };
  } catch (error) {
    return { 
      valid: false, 
      errors: [{ 
        message: error.message,
        path: 'root',
        code: 'VALIDATION_ERROR'
      }] 
    };
  }
};

// Dual-write utilities
export const generateIdempotencyKey = (entityType, entityId, payload) => {
  const hash = btoa(JSON.stringify(payload)).slice(0, 8);
  return `${entityType}:${entityId}:v2:${hash}`;
};

export const createDualWriteMetrics = () => {
  return {
    dual_write_errors: 0,
    reconciliation_diff_pct: 0.0,
    dlq_backlog: 0,
    api_p99_ms: 0,
    last_check: new Date().toISOString()
  };
};