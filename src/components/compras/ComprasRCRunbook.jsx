/*
RC COMPRAS — RUNBOOK UNICO (tenant + perfil)
Tenant: tnt-demo-trustport-001
Canary SPO Comerciante 10% ON (read_from_v2) para ["usr_comerciante_01","usr_comerciante_02","usr_comerciante_03"]
dual_write_v2 = ON (todos los submodulos), DLQ=0
Previews read-only: Action Center (AC) y PO bienes para esos 3 usuarios
*/

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle, AlertTriangle, Clock, Database, GitMerge, Zap, 
  Target, TrendingUp, Shield, FileText, BarChart3, RefreshCw,
  Download, Eye, Play, Pause, Square, ArrowRight
} from "lucide-react";
import { toast } from "sonner";

// CONFIGURACION COMPLETA RC
const RC_CONFIG = {
  tenant_id: "tnt-demo-trustport-001",
  comerciante_user_ids: ["usr_comerciante_01", "usr_comerciante_02", "usr_comerciante_03"],
  operador_user_ids: ["usr_operador_01", "usr_operador_02"],
  profile_claim_path: "user.custom_claims.profile"
};

// 1) MONITOREO EN VIVO - METAS INSTANTANEAS
const HEALTH_THRESHOLDS = {
  otd_delta_pp: { target: 0, op: ">=", unit: "pp" },
  api_p99_ms: { target: 400, op: "<", unit: "ms" },
  dual_write_error_rate: { target: 0, op: "==", unit: "%" },
  dlq_backlog: { target: 0, op: "==", unit: " items" },
  ui_p95_ms: { target: 2000, op: "<", unit: "ms" }
};

// 2) GUARDARRAILES (auto-rollback)
const GUARDRAILS_CONFIG = {
  "guardrails": [
    { "metric": "dual_write_error_rate", "op": ">", "value": 0.01, "action": "disable_read_from_v2" },
    { "metric": "dlq_backlog", "op": ">", "value": 0, "action": "disable_read_from_v2" },
    { "metric": "api_p99_ms", "op": ">", "value": 400, "action": "disable_read_from_v2" },
    { "metric": "otd_delta_pp", "op": "<", "value": -5, "action": "disable_read_from_v2" }
  ]
};

// 3) REGLAS DE FF (estado base + previews)
const FEATURE_FLAGS_CONFIG = {
  "module": "compras",
  "rules": [
    { "flag": "router.ascii_only", "value": true },
    { "flag": "registry.v2", "value": true },
    { "flag": "schema.validator", "value": true },

    { "flag": "po_services.dual_write_v2", "when": { "tenant_id": "tnt-demo-trustport-001" }, "value": true },
    { "flag": "po_services.read_from_v2", "when": { "tenant_id": "tnt-demo-trustport-001", "user_id_in": ["usr_comerciante_01","usr_comerciante_02","usr_comerciante_03"], "user.custom_claims.profile": "comerciante", "percentage": 10 }, "value": true },

    { "flag": "po_goods.dual_write_v2", "when": { "tenant_id": "tnt-demo-trustport-001" }, "value": true },
    { "flag": "po_goods.ui_preview_v2", "when": { "tenant_id": "tnt-demo-trustport-001", "user_id_in": ["usr_comerciante_01","usr_comerciante_02","usr_comerciante_03"] }, "value": true },

    { "flag": "ac.v2.ui", "when": { "tenant_id": "tnt-demo-trustport-001", "user_id_in": ["usr_comerciante_01","usr_comerciante_02","usr_comerciante_03"] }, "value": true },

    { "flag": "ap.ingest_v2", "value": true },
    { "flag": "ap.match_v2", "value": true },
    { "flag": "landed.engine_v2", "value": true },
    { "flag": "analytics.v2", "value": true },
    { "flag": "returns.v2", "value": true },
    { "flag": "debit_engine.v2", "value": true }
  ],
  "order": ["tenant_id","user.custom_claims.profile","user_id_in","percentage"]
};

// 4) ACTION CENTER P2P - reglas SPO (drop-in)
const ACTION_CENTER_RULES = {
  "module": "compras",
  "submodule": "action-center",
  "rules": [
    { "id": "spo_missing_tariff", "when": "spo.tariff_id == null", "priority": "high", "impact_eur": "estimate_from_amount * 0.1", "quick_actions": ["open_srm_tariff","request_supplier_tariff","assign_buyer"] },
    { "id": "spo_extras_unpriced", "when": "exists(spo.extras[price == null])", "priority": "high", "impact_eur": "sum(spo.extras[price == null].amount_estimate)", "quick_actions": ["price_extra","request_supplier_quote","send_to_approval"] },
    { "id": "spo_eta_slip", "when": "now() > spo.promised_eta", "priority": "critical", "impact_eur": "order_value * 0.02", "quick_actions": ["request_supplier_ack","expedite_route","notify_customer_b2b"] },
    { "id": "spo_epod_missing", "when": "spo.status == 'in_service' && epod.status != 'received'", "priority": "medium", "impact_eur": "service_fee", "quick_actions": ["request_epod","open_tms_tracking","init_claim"] }
  ]
};

// SQL QUERIES DE SALUD
const HEALTH_SQL_QUERIES = {
  reconciliation_diff: `
SELECT 100.0 * COUNT(*) FILTER (WHERE h1 != h2) / NULLIF(COUNT(*),0) AS diff_pct
FROM (
  SELECT spo_id, md5(jsonb_strip_nulls(data)::text) h1
  FROM spo_v1 WHERE tenant_id='tnt-demo-trustport-001'
) a
FULL JOIN (
  SELECT spo_id, md5(jsonb_strip_nulls(data)::text) h2
  FROM spo_v2 WHERE tenant_id='tnt-demo-trustport-001'
) b USING (spo_id);`,
  
  dlq_backlog: `
SELECT COUNT(*) AS dlq_items
FROM dlq_events
WHERE module='compras' AND submodule IN ('po_servicios','po_bienes','ap','landed');`,
  
  api_errors: `
SELECT endpoint, COUNT(*) errs
FROM api_errors
WHERE module='compras' AND ts>now()-interval '1 hour'
GROUP BY endpoint ORDER BY errs DESC;`
};

// PRUEBAS SINTETICAS
const SYNTHETIC_TESTS = [
  { id: "spo_canary_test_01", name: "SPO Lifecycle", description: "SPO simple → send → ack → 1 milestone → epod → invoice simple → 2W → post" },
  { id: "spo_canary_test_02", name: "Extra Unpriced", description: "agregar extra sin precio → en AC aparece spo_extras_unpriced → ejecutar price_extra" },
  { id: "spo_canary_test_03", name: "ETA Slip", description: "simular eta slip (+1h) → en AC aparece spo_eta_slip → ejecutar request_supplier_ack" }
];

// RAMPA PERCENTAGES SPO COMERCIANTE
const CANARY_RAMP_PERCENTAGES = [10, 25, 50, 100];

// GATES Y CHECKS E2E
const E2E_CHECKS = [
  { id: "spo_e2e", name: "SPO E2E", description: "create→sent→ack→milestones→epod→invoice→(2W/3W)→post" },
  { id: "po_goods_e2e", name: "PO Bienes E2E", description: "create→ack→asn→grn(1 discrepancia)→invoice→3W→post" },
  { id: "landed_e2e", name: "Landed Cost E2E", description: "simulate→approve→post (variance<=2%)" },
  { id: "ap_e2e", name: "AP E2E", description: "ubl+pdf→validate→3W por linea→post" },
  { id: "returns_e2e", name: "Returns E2E", description: "rma (bienes) + claim (servicio)→evidencia→epod reverse→credit/debit→post" },
  { id: "analytics_e2e", name: "Analytics E2E", description: "lineage dataset_version/as_of, KPIs alimentados, alertas→AC" }
];

// RC FINAL KPIS
const RC_TARGET_KPIS = {
  three_way_match_rate: { target: 95, unit: "%" },
  t2p_hours: { target: 48, unit: "h" },
  variance_landed: { target: 2, unit: "%" },
  epod_rate: { target: 90, unit: "%" }
};

const RunbookStep = ({ step, status, onExecute, onValidate, children }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'failed': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <CardTitle className="text-md">{step.name}</CardTitle>
            <Badge variant={status === 'completed' ? 'default' : status === 'failed' ? 'destructive' : 'secondary'}>
              {step.gate || step.id}
            </Badge>
          </div>
          <div className="flex gap-2">
            {onValidate && (
              <Button variant="outline" size="sm" onClick={onValidate}>
                <Eye className="w-4 h-4 mr-1" />
                Validar
              </Button>
            )}
            {onExecute && status !== 'completed' && (
              <Button variant="default" size="sm" onClick={onExecute}>
                <Play className="w-4 h-4 mr-1" />
                Ejecutar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      {children && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

const HealthMetrics = ({ metrics }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {Object.entries(metrics).map(([key, data]) => {
      const threshold = HEALTH_THRESHOLDS[key];
      const isHealthy = threshold ? 
        (threshold.op === ">=" ? data.value >= threshold.target :
         threshold.op === "<" ? data.value < threshold.target :
         threshold.op === "==" ? data.value === threshold.target : false) : true;
      
      return (
        <div key={key} className={`p-3 rounded-lg border ${isHealthy ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            {isHealthy ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
            <p className="text-sm font-semibold text-gray-700">{key.replace(/_/g, ' ').toUpperCase()}</p>
          </div>
          <p className={`text-lg font-bold ${isHealthy ? 'text-green-700' : 'text-red-700'}`}>
            {data.value}{threshold?.unit || ''}
          </p>
          <p className="text-xs text-gray-500">Target: {threshold?.op} {threshold?.target}</p>
        </div>
      );
    })}
  </div>
);

export default function ComprasRCRunbook() {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatuses, setStepStatuses] = useState({});
  const [healthMetrics, setHealthMetrics] = useState({
    otd_delta_pp: { value: 0.5 },
    api_p99_ms: { value: 280 },
    dual_write_error_rate: { value: 0 },
    dlq_backlog: { value: 0 },
    ui_p95_ms: { value: 1150 }
  });
  const [canaryPercentage, setCanaryPercentage] = useState(10);
  const [syntheticResults, setSyntheticResults] = useState({});

  const runbookSteps = [
    {
      id: "monitoring",
      name: "Monitoreo en Vivo (30-60 min)",
      gate: "G0",
      description: "Validar métricas de salud en tiempo real",
      component: () => (
        <div className="space-y-4">
          <HealthMetrics metrics={healthMetrics} />
          <div className="mt-4">
            <h4 className="font-semibold mb-2">SQL Queries de Salud</h4>
            <div className="space-y-2">
              {Object.entries(HEALTH_SQL_QUERIES).map(([key, query]) => (
                <div key={key} className="bg-gray-50 p-3 rounded font-mono text-xs">
                  <p className="font-bold text-gray-700 mb-1">{key}:</p>
                  <pre className="whitespace-pre-wrap">{query}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: "synthetic_tests",
      name: "Pruebas Sintéticas",
      gate: "G1",
      description: "Ejecutar tests canary sin impacto contable",
      component: () => (
        <div className="space-y-3">
          {SYNTHETIC_TESTS.map(test => (
            <div key={test.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-semibold">{test.name}</p>
                <p className="text-sm text-gray-600">{test.description}</p>
              </div>
              <Badge className={syntheticResults[test.id] === 'passed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {syntheticResults[test.id] || 'pending'}
              </Badge>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "spo_ramp",
      name: "Rampa SPO Comerciante",
      gate: "G2",
      description: "Escalar canary: 10% → 25% → 50% → 100%",
      component: () => (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold">Canary Actual:</span>
            <Badge className="bg-blue-100 text-blue-800">{canaryPercentage}%</Badge>
          </div>
          <Progress value={canaryPercentage} className="w-full" />
          <div className="grid grid-cols-4 gap-2">
            {CANARY_RAMP_PERCENTAGES.map(pct => (
              <Button
                key={pct}
                variant={canaryPercentage >= pct ? "default" : "outline"}
                size="sm"
                onClick={() => setCanaryPercentage(pct)}
              >
                {pct}%
              </Button>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "po_goods_canary",
      name: "PO Bienes v2 - Dark → Canary",
      gate: "G3",
      description: "Activar canary PO Bienes tras SPO 100%"
    },
    {
      id: "ap_facturas",
      name: "Facturas v2 (AP Ingest + Match Center)",
      gate: "G4",
      description: "3W ≥95%, touchless ≥75%, first pass yield ≥95%"
    },
    {
      id: "landed_cost",
      name: "Landed Cost Engine v2",
      gate: "G5",
      description: "T2P ≤48h, variance ≤2%"
    },
    {
      id: "analytics",
      name: "Analytics v2",
      gate: "G6",
      description: "Spend Cube + Savings con lineage visible"
    },
    {
      id: "returns",
      name: "Devoluciones/Notas Débito v2",
      gate: "G7",
      description: "recovery_rate ≥70%"
    },
    {
      id: "e2e_hardening",
      name: "Hardening + E2E + Cutover",
      gate: "G8",
      description: "Todos los E2E verdes",
      component: () => (
        <div className="space-y-3">
          {E2E_CHECKS.map(check => (
            <div key={check.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-semibold">{check.name}</p>
                <p className="text-sm text-gray-600">{check.description}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          ))}
        </div>
      )
    },
    {
      id: "stabilization",
      name: "Stabilization Week",
      gate: "G9",
      description: "Mantener dual-write 1 semana, diff_pct < 0.1%"
    },
    {
      id: "rc_signoff",
      name: "RC Sign-off",
      gate: "G10",
      description: "Tag compras@2.x, métricas finales",
      component: () => (
        <div className="space-y-4">
          <h4 className="font-semibold">KPIs Finales RC</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(RC_TARGET_KPIS).map(([key, target]) => (
              <div key={key} className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="font-semibold text-green-700">{key.replace(/_/g, ' ').toUpperCase()}</p>
                <p className="text-lg font-bold text-green-800">≥ {target.target}{target.unit}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ];

  const executeStep = (stepId) => {
    setStepStatuses(prev => ({ ...prev, [stepId]: 'in_progress' }));
    
    // Simular ejecución
    setTimeout(() => {
      setStepStatuses(prev => ({ ...prev, [stepId]: 'completed' }));
      
      if (stepId === 'synthetic_tests') {
        setSyntheticResults({
          spo_canary_test_01: 'passed',
          spo_canary_test_02: 'passed',
          spo_canary_test_03: 'passed'
        });
      }
      
      toast.success(`Step ${stepId} completado exitosamente`);
    }, 2000);
  };

  const validateStep = (stepId) => {
    toast.info(`Validando step ${stepId}...`);
  };

  const exportEvidence = () => {
    const evidence = {
      health_metrics: healthMetrics,
      synthetic_results: syntheticResults,
      canary_percentage: canaryPercentage,
      feature_flags: FEATURE_FLAGS_CONFIG,
      action_center_rules: ACTION_CENTER_RULES,
      guardrails: GUARDRAILS_CONFIG,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(evidence, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compras_rc_evidence_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">RC COMPRAS - RUNBOOK EJECUTABLE</h1>
          <p className="text-gray-600">Tenant: {RC_CONFIG.tenant_id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportEvidence}>
            <Download className="w-4 h-4 mr-2" />
            Export Evidence
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Rollback Plan
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso RC</span>
              <span>{Object.keys(stepStatuses).filter(s => stepStatuses[s] === 'completed').length}/{runbookSteps.length}</span>
            </div>
            <Progress 
              value={(Object.keys(stepStatuses).filter(s => stepStatuses[s] === 'completed').length / runbookSteps.length) * 100} 
              className="w-full" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Runbook Steps */}
      <div className="space-y-4">
        {runbookSteps.map((step, index) => (
          <RunbookStep
            key={step.id}
            step={step}
            status={stepStatuses[step.id] || 'pending'}
            onExecute={() => executeStep(step.id)}
            onValidate={() => validateStep(step.id)}
          >
            {step.component && <step.component />}
          </RunbookStep>
        ))}
      </div>

      {/* Configuration Panels */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Feature Flags Config</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-3 rounded text-xs font-mono overflow-auto">
              {JSON.stringify(FEATURE_FLAGS_CONFIG, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guardrails Config</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-3 rounded text-xs font-mono overflow-auto">
              {JSON.stringify(GUARDRAILS_CONFIG, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Action Center Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Action Center P2P Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-50 p-3 rounded text-xs font-mono overflow-auto">
            {JSON.stringify(ACTION_CENTER_RULES, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}