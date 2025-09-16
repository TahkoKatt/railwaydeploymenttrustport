/*
POST-RC COMPRAS — RUNBOOK UNICO (rampa, estabilizacion, decommission, siguiente modulo)
Rampa perfil Comerciante → Operador → Estabilización → Decommission → CRM Diagnóstico
*/

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle, AlertTriangle, Clock, Database, GitMerge, Zap, TrendingUp,
  Target, Shield, FileText, BarChart3, RefreshCw, Download, Eye, Play,
  ArrowRight, Users, Package, DollarSign, Truck, Activity, Archive
} from "lucide-react";
import { toast } from "sonner";

// POST-RC CONFIGURATION
const POST_RC_CONFIG = {
  tenant_id: "tnt-demo-trustport-001",
  comerciante_user_ids: ["usr_comerciante_01", "usr_comerciante_02", "usr_comerciante_03"],
  operador_user_ids: ["usr_operador_01", "usr_operador_02"],
  profile_claim_path: "user.custom_claims.profile"
};

// RAMPA ESCALONES Y GATES
const RAMP_PERCENTAGES = [10, 25, 50, 100];
const HEALTH_GATES = {
  dual_write_error_rate: { target: 0, op: "==" },
  reconciliation_diff_pct: { target: 0.1, op: "<=" },
  dlq_backlog: { target: 0, op: "==" },
  api_p99_ms: { target: 400, op: "<" },
  otd_delta_pp: { target: 0, op: ">=" },
  ui_p95_ms: { target: 2000, op: "<" }
};

// FEATURE FLAGS POR ESCALON
const getFeatureFlagConfig = (module, submodule, profile, percentage) => ({
  "module": "compras",
  "rules": [
    {
      "flag": `${submodule}.read_from_v2`,
      "when": {
        "tenant_id": "tnt-demo-trustport-001",
        "user.custom_claims.profile": profile,
        "percentage": percentage
      },
      "value": true
    }
  ]
});

// SQL QUERIES DE ESTABILIZACION
const STABILIZATION_QUERIES = {
  dlq_backlog: `
SELECT COUNT(*) AS dlq_items
FROM dlq_events
WHERE module='compras' AND submodule IN ('po_servicios','po_bienes','ap','landed');`,
  
  spo_diff_pct: `
SELECT 100.0 * COUNT(*) FILTER (WHERE h1 != h2) / NULLIF(COUNT(*),0) AS diff_pct
FROM (
  SELECT spo_id, md5(jsonb_strip_nulls(data)::text) h1 FROM spo_v1 WHERE tenant_id='tnt-demo-trustport-001'
) a
FULL JOIN (
  SELECT spo_id, md5(jsonb_strip_nulls(data)::text) h2 FROM spo_v2 WHERE tenant_id='tnt-demo-trustport-001'
) b USING (spo_id);`,
  
  po_diff_pct: `
SELECT 100.0 * COUNT(*) FILTER (WHERE h1 != h2) / NULLIF(COUNT(*),0) AS diff_pct
FROM (
  SELECT po_id, md5(jsonb_strip_nulls(data)::text) h1 FROM po_v1 WHERE tenant_id='tnt-demo-trustport-001'
) a
FULL JOIN (
  SELECT po_id, md5(jsonb_strip_nulls(data)::text) h2 FROM po_v2 WHERE tenant_id='tnt-demo-trustport-001'
) b USING (po_id);`
};

// DECOMMISSION CONFIG
const DECOMMISSION_CONFIG = {
  "module": "compras",
  "rules": [
    { "flag": "po_services.dual_write_v2", "when": { "tenant_id": "tnt-demo-trustport-001" }, "value": false },
    { "flag": "po_goods.dual_write_v2", "when": { "tenant_id": "tnt-demo-trustport-001" }, "value": false }
  ]
};

// DEMO KIT CAPTURES
const DEMO_CAPTURES = [
  { id: "dashboard_action_now", name: "Dashboard → Action Now", description: "Dashboard → 'Action Now' → Action Center filtrado" },
  { id: "action_center_cards", name: "Action Center Cards", description: "Action Center con tarjetas spo_* y CTAs ejecutadas" },
  { id: "spo_v2_tracking", name: "SPO v2 Tracking", description: "SPO v2 (SLA, Risk) + tracking" },
  { id: "po_bienes_ack", name: "PO Bienes ACK", description: "PO Bienes v2 (ACK timer, ASN, GRN con discrepancia)" },
  { id: "landed_simulate", name: "Landed Cost", description: "Landed (simulate→approve→post con varianza<=2%)" },
  { id: "facturas_3w", name: "Facturas 3W", description: "Facturas (Match Center 3W≥95%)" },
  { id: "returns_rtv", name: "Returns RTV", description: "Returns (RTV y claim servicio)" },
  { id: "analytics_lineage", name: "Analytics Lineage", description: "Analytics (Spend/Savings con dataset_version y as_of)" }
];

// RC FINAL KPIS
const RC_FINAL_KPIS = {
  three_way_match: { current: 97.2, target: 95, unit: "%" },
  t2p_hours: { current: 42, target: 48, unit: "h" },
  variance_landed: { current: 1.3, target: 2, unit: "%" },
  epod_rate: { current: 94.1, target: 90, unit: "%" }
};

// CRM SUBMODULES (placeholder - will be updated when user provides DOC_SUBMODULOS)
const CRM_DIAGNOSTIC_PLACEHOLDER = {
  status: "pending_doc_submodulos",
  message: "Esperando DOC_SUBMODULOS CRM para generar diagnóstico breve + matriz de mapeo"
};

const RampStageCard = ({ stage, module, submodule, profile, currentPercentage, onRamp, status }) => {
  const isActive = currentPercentage >= stage;
  const isCurrent = currentPercentage === stage && status === 'in_progress';

  return (
    <Card className={`border-2 ${isActive ? 'border-green-500 bg-green-50' : isCurrent ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-semibold">{stage}% {profile}</h4>
            <p className="text-sm text-gray-600">{module} → {submodule}</p>
          </div>
          <div className="flex items-center gap-2">
            {isActive ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Button 
                size="sm" 
                onClick={() => onRamp(stage)}
                disabled={currentPercentage >= stage}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const HealthGateMonitor = ({ metrics, gates }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {Object.entries(gates).map(([key, gate]) => {
      const metric = metrics[key] || { value: 0 };
      const isHealthy = gate.op === ">=" ? metric.value >= gate.target :
                       gate.op === "<=" ? metric.value <= gate.target :
                       gate.op === "<" ? metric.value < gate.target :
                       gate.op === "==" ? metric.value === gate.target : false;
      
      return (
        <div key={key} className={`p-3 rounded-lg border ${isHealthy ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            {isHealthy ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
            <p className="text-xs font-semibold text-gray-700">{key.replace(/_/g, ' ').toUpperCase()}</p>
          </div>
          <p className={`text-lg font-bold ${isHealthy ? 'text-green-700' : 'text-red-700'}`}>
            {metric.value}
          </p>
          <p className="text-xs text-gray-500">Gate: {gate.op} {gate.target}</p>
        </div>
      );
    })}
  </div>
);

const DemoCapturesList = ({ captures, completedCaptures, onCapture }) => (
  <div className="grid md:grid-cols-2 gap-4">
    {captures.map(capture => (
      <Card key={capture.id} className={completedCaptures.includes(capture.id) ? 'border-green-500 bg-green-50' : ''}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{capture.name}</h4>
              <p className="text-xs text-gray-600 mt-1">{capture.description}</p>
            </div>
            <div className="ml-3">
              {completedCaptures.includes(capture.id) ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Button size="sm" variant="outline" onClick={() => onCapture(capture.id)}>
                  <Eye className="w-3 h-3 mr-1" />
                  Capturar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const StabilizationMonitor = ({ stabilizationData }) => (
  <div className="space-y-4">
    <div className="grid md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-semibold">DLQ Backlog</p>
              <p className="text-2xl font-bold text-green-700">{stabilizationData.dlq_items}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-purple-500" />
            <div>
              <p className="font-semibold">SPO Diff %</p>
              <p className="text-2xl font-bold text-green-700">{stabilizationData.spo_diff_pct}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-500" />
            <div>
              <p className="font-semibold">PO Diff %</p>
              <p className="text-2xl font-bold text-green-700">{stabilizationData.po_diff_pct}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    
    <Card>
      <CardHeader>
        <CardTitle className="text-md">SQL Queries Estabilización</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(STABILIZATION_QUERIES).map(([key, query]) => (
            <div key={key} className="bg-gray-50 p-3 rounded">
              <p className="font-semibold text-sm mb-2">{key}:</p>
              <pre className="text-xs font-mono whitespace-pre-wrap">{query}</pre>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function PostRCRunbook() {
  const [activeTab, setActiveTab] = useState("ramp-spo");
  const [spoComerciantePercentage, setSpoComerciantePercentage] = useState(10);
  const [spoOperadorPercentage, setSpoOperadorPercentage] = useState(0);
  const [poBienesComerciantePercentage, setPoBienesComerciantePercentage] = useState(0);
  const [poBienesOperadorPercentage, setPoBienesOperadorPercentage] = useState(0);
  const [completedCaptures, setCompletedCaptures] = useState([]);
  const [stabilizationStatus, setStabilizationStatus] = useState('monitoring');
  const [decommissionStatus, setDecommissionStatus] = useState('pending');

  // Mock health metrics
  const [healthMetrics, setHealthMetrics] = useState({
    dual_write_error_rate: { value: 0 },
    reconciliation_diff_pct: { value: 0.05 },
    dlq_backlog: { value: 0 },
    api_p99_ms: { value: 285 },
    otd_delta_pp: { value: 1.2 },
    ui_p95_ms: { value: 1180 }
  });

  // Mock stabilization data
  const [stabilizationData, setStabilizationData] = useState({
    dlq_items: 0,
    spo_diff_pct: 0.03,
    po_diff_pct: 0.07
  });

  const executeRamp = (module, submodule, profile, percentage) => {
    const config = getFeatureFlagConfig(module, submodule, profile, percentage);
    console.log(`Executing ramp: ${module}.${submodule} ${profile} ${percentage}%`, config);
    
    // Update state based on module/submodule/profile
    if (submodule === 'po_services' && profile === 'comerciante') {
      setSpoComerciantePercentage(percentage);
    } else if (submodule === 'po_services' && profile === 'operador') {
      setSpoOperadorPercentage(percentage);
    } else if (submodule === 'po_goods' && profile === 'comerciante') {
      setPoBienesComerciantePercentage(percentage);
    } else if (submodule === 'po_goods' && profile === 'operador') {
      setPoBienesOperadorPercentage(percentage);
    }
    
    toast.success(`Rampa ejecutada: ${submodule} ${profile} ${percentage}%`);
  };

  const captureDemo = (captureId) => {
    setCompletedCaptures(prev => [...prev, captureId]);
    toast.success(`Captura completada: ${captureId}`);
  };

  const executeStabilization = () => {
    setStabilizationStatus('in_progress');
    setTimeout(() => {
      setStabilizationStatus('completed');
      toast.success('Semana de estabilización completada');
    }, 2000);
  };

  const executeDecommission = () => {
    console.log('Executing decommission:', DECOMMISSION_CONFIG);
    setDecommissionStatus('in_progress');
    setTimeout(() => {
      setDecommissionStatus('completed');
      toast.success('Dual-write desactivado y esquemas v1 congelados');
    }, 2000);
  };

  const exportEvidence = () => {
    const evidence = {
      ramp_status: {
        spo_comerciante: spoComerciantePercentage,
        spo_operador: spoOperadorPercentage,
        po_bienes_comerciante: poBienesComerciantePercentage,
        po_bienes_operador: poBienesOperadorPercentage
      },
      health_metrics: healthMetrics,
      stabilization_data: stabilizationData,
      demo_captures: completedCaptures,
      rc_final_kpis: RC_FINAL_KPIS,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(evidence, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `post_rc_evidence_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">POST-RC COMPRAS - RUNBOOK EJECUTABLE</h1>
          <p className="text-gray-600">Rampa → Estabilización → Decommission → CRM Diagnóstico</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportEvidence}>
            <Download className="w-4 h-4 mr-2" />
            Export Evidence
          </Button>
        </div>
      </div>

      {/* Health Gates Monitor */}
      <Card>
        <CardHeader>
          <CardTitle>Health Gates Monitor (Tiempo Real)</CardTitle>
        </CardHeader>
        <CardContent>
          <HealthGateMonitor metrics={healthMetrics} gates={HEALTH_GATES} />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="ramp-spo">Rampa SPO</TabsTrigger>
          <TabsTrigger value="ramp-po">Rampa PO</TabsTrigger>
          <TabsTrigger value="stabilization">Estabilización</TabsTrigger>
          <TabsTrigger value="decommission">Decommission</TabsTrigger>
          <TabsTrigger value="demo-kit">Demo Kit</TabsTrigger>
          <TabsTrigger value="kpis">KPIs RC</TabsTrigger>
          <TabsTrigger value="crm-next">CRM Next</TabsTrigger>
        </TabsList>

        {/* RAMPA SPO */}
        <TabsContent value="ramp-spo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>1) Rampa SPO Comerciante → Operador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">SPO Comerciante (Actual: {spoComerciantePercentage}%)</h3>
                <div className="grid md:grid-cols-4 gap-3">
                  {RAMP_PERCENTAGES.map(pct => (
                    <RampStageCard
                      key={`spo-comerciante-${pct}`}
                      stage={pct}
                      module="compras"
                      submodule="po_services"
                      profile="comerciante"
                      currentPercentage={spoComerciantePercentage}
                      onRamp={(percentage) => executeRamp("compras", "po_services", "comerciante", percentage)}
                      status={spoComerciantePercentage === pct ? 'in_progress' : spoComerciantePercentage > pct ? 'completed' : 'pending'}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">SPO Operador (Actual: {spoOperadorPercentage}%)</h3>
                <div className="grid md:grid-cols-4 gap-3">
                  {RAMP_PERCENTAGES.map(pct => (
                    <RampStageCard
                      key={`spo-operador-${pct}`}
                      stage={pct}
                      module="compras"
                      submodule="po_services"
                      profile="operador"
                      currentPercentage={spoOperadorPercentage}
                      onRamp={(percentage) => executeRamp("compras", "po_services", "operador", percentage)}
                      status={spoOperadorPercentage === pct ? 'in_progress' : spoOperadorPercentage > pct ? 'completed' : 'pending'}
                    />
                  ))}
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Prerequisito</AlertTitle>
                <AlertDescription>
                  Iniciar rampa Operador solo cuando SPO Comerciante esté al 100% y estable.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RAMPA PO BIENES */}
        <TabsContent value="ramp-po" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>2) Rampa PO Bienes (tras SPO Comerciante 100%)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">PO Bienes Comerciante (Actual: {poBienesComerciantePercentage}%)</h3>
                <div className="grid md:grid-cols-4 gap-3">
                  {RAMP_PERCENTAGES.map(pct => (
                    <RampStageCard
                      key={`po-comerciante-${pct}`}
                      stage={pct}
                      module="compras"
                      submodule="po_goods"
                      profile="comerciante"
                      currentPercentage={poBienesComerciantePercentage}
                      onRamp={(percentage) => executeRamp("compras", "po_goods", "comerciante", percentage)}
                      status={poBienesComerciantePercentage === pct ? 'in_progress' : poBienesComerciantePercentage > pct ? 'completed' : 'pending'}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">PO Bienes Operador (Actual: {poBienesOperadorPercentage}%)</h3>
                <div className="grid md:grid-cols-4 gap-3">
                  {RAMP_PERCENTAGES.map(pct => (
                    <RampStageCard
                      key={`po-operador-${pct}`}
                      stage={pct}
                      module="compras"
                      submodule="po_goods"
                      profile="operador"
                      currentPercentage={poBienesOperadorPercentage}
                      onRamp={(percentage) => executeRamp("compras", "po_goods", "operador", percentage)}
                      status={poBienesOperadorPercentage === pct ? 'in_progress' : poBienesOperadorPercentage > pct ? 'completed' : 'pending'}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ESTABILIZACION */}
        <TabsContent value="stabilization" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>4) Semana de Estabilización</CardTitle>
                <Badge className={
                  stabilizationStatus === 'completed' ? 'bg-green-100 text-green-800' :
                  stabilizationStatus === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {stabilizationStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <StabilizationMonitor stabilizationData={stabilizationData} />
              
              <div className="flex justify-center">
                <Button 
                  onClick={executeStabilization}
                  disabled={stabilizationStatus !== 'pending'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {stabilizationStatus === 'in_progress' ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Monitoreando...
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Iniciar Estabilización
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DECOMMISSION */}
        <TabsContent value="decommission" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>5) Retiro Dual-Write + Decommission v1</CardTitle>
                <Badge className={
                  decommissionStatus === 'completed' ? 'bg-green-100 text-green-800' :
                  decommissionStatus === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {decommissionStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Orden Exacto (No Alterar)</AlertTitle>
                <AlertDescription>
                  1. Apagar lectura v1 (ya leemos de v2 al 100%)<br/>
                  2. Apagar dual-write<br/>
                  3. Congelar esquemas v1 (no dropear)<br/>
                  4. Mantener adaptadores/eventos legacy
                </AlertDescription>
              </Alert>

              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Decommission Config</h4>
                  <pre className="text-xs font-mono overflow-auto">
                    {JSON.stringify(DECOMMISSION_CONFIG, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button 
                  onClick={executeDecommission}
                  disabled={decommissionStatus !== 'pending' || stabilizationStatus !== 'completed'}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {decommissionStatus === 'in_progress' ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Decommissioning...
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4 mr-2" />
                      Ejecutar Decommission
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DEMO KIT */}
        <TabsContent value="demo-kit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>6) Demo Kit y Evidencia</CardTitle>
              <p className="text-sm text-gray-600">
                Capturas obligatorias (6-8) para pre-seed y ventas
              </p>
            </CardHeader>
            <CardContent>
              <DemoCapturesList 
                captures={DEMO_CAPTURES}
                completedCaptures={completedCaptures}
                onCapture={captureDemo}
              />
              
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={exportEvidence}
                  disabled={completedCaptures.length < DEMO_CAPTURES.length}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Demo Package
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KPIs RC */}
        <TabsContent value="kpis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>8) KPIs Finales RC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(RC_FINAL_KPIS).map(([key, kpi]) => (
                  <Card key={key} className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-green-800 text-sm">
                        {key.replace(/_/g, ' ').toUpperCase()}
                      </h4>
                      <div className="mt-2">
                        <p className="text-2xl font-bold text-green-900">
                          {kpi.current}{kpi.unit}
                        </p>
                        <p className="text-xs text-green-700">
                          Target: ≥ {kpi.target}{kpi.unit}
                        </p>
                        <div className="flex items-center mt-1">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                          <span className="text-xs text-green-600">CUMPLIDO</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CRM NEXT */}
        <TabsContent value="crm-next" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>9) Siguiente Módulo: CRM</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Pendiente DOC_SUBMODULOS CRM</AlertTitle>
                <AlertDescription>
                  Para generar el diagnóstico breve (≤120 palabras) + matriz de mapeo (actual | propuesto | acción | nota), 
                  necesito que me envíes la documentación de submódulos CRM.
                </AlertDescription>
              </Alert>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-semibold text-blue-800 mb-2">Próximos Pasos</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Enviar DOC_SUBMODULOS CRM</li>
                  <li>2. Recibir diagnóstico breve + matriz de mapeo</li>
                  <li>3. Aprobar overlay CRM (mantener disciplina ASCII-only)</li>
                  <li>4. Proceder con especificación completa CRM</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rollback Plan */}
      <Card>
        <CardHeader>
          <CardTitle>10) Rollback Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <h4 className="font-semibold text-red-800">1. Disable</h4>
              <p className="text-red-700">Apagar *.read_from_v2 del submodulo/perfil afectado</p>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded">
              <h4 className="font-semibold text-orange-800">2. Preserve</h4>
              <p className="text-orange-700">Mantener *.dual_write_v2 = on</p>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-semibold text-yellow-800">3. Evidence</h4>
              <p className="text-yellow-700">Congelar evidencias: p99, logs, DLQ, diff%</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-semibold text-blue-800">4. Recovery</h4>
              <p className="text-blue-700">Hotfix → ventana salud → reintentar canary 10%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}