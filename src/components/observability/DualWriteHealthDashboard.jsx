import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Database, CloudOff, Layers, GitMerge, Clock, Percent, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const HealthMetric = ({ metric, value, target, unit, healthy }) => (
  <div className="flex justify-between items-center py-2">
    <div className="flex items-center gap-2">
      {healthy ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
      <span className="text-sm font-medium text-gray-700">{metric}</span>
    </div>
    <div className="text-right">
      <span className={`text-sm font-semibold ${healthy ? 'text-gray-900' : 'text-red-600'}`}>{value}{unit}</span>
      <p className="text-xs text-gray-500">Target: {target}</p>
    </div>
  </div>
);

const SyntheticTestResult = ({ name, status, log }) => (
  <div className="p-3 bg-gray-50 rounded-lg border">
    <div className="flex justify-between items-center">
      <p className="text-sm font-semibold text-gray-800">{name}</p>
      <div className={`flex items-center gap-1 text-xs font-bold ${status === 'PASSED' ? 'text-green-600' : 'text-red-600'}`}>
        {status === 'PASSED' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
        {status}
      </div>
    </div>
    <p className="font-mono text-xs text-gray-500 mt-1">{log}</p>
  </div>
);

export default function DualWriteHealthDashboard() {
  const healthData = {
    overallStatus: 'HEALTHY',
    canaryProfile: 'Comerciante 10%',
    dualWriteErrorRate: 0,
    reconciliationDiffPct: 0.05,
    dlqBacklog: 0,
    apiP99ms: 280,
    uiP95ms: 1150,
    otdDeltaPp: 0.5
  };

  const syntheticTests = [
    { name: "spo_canary_test_01", status: "PASSED", log: "SPO lifecycle (create→post) OK." },
    { name: "spo_canary_test_02", status: "PASSED", log: "Exception (extra_unpriced) → AC OK." },
    { name: "spo_canary_test_03", status: "PASSED", log: "Exception (eta_slip) → AC OK." }
  ];

  return (
    <Card className="bg-white shadow-sm" style={{ boxShadow: 'var(--shadow)', borderRadius: 'var(--radius)' }}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-md font-semibold">Observabilidad Canary (SPO)</CardTitle>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
            healthData.overallStatus === 'HEALTHY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${healthData.overallStatus === 'HEALTHY' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {healthData.overallStatus}
          </div>
        </div>
        <p className="text-sm text-gray-500">Perfil: {healthData.canaryProfile}</p>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Métricas de Salud</h4>
          <div className="divide-y">
            <HealthMetric metric="Dual-Write Error Rate" value={healthData.dualWriteErrorRate} target="== 0" unit="%" healthy={healthData.dualWriteErrorRate === 0} />
            <HealthMetric metric="DLQ Backlog" value={healthData.dlqBacklog} target="== 0" unit=" items" healthy={healthData.dlqBacklog === 0} />
            <HealthMetric metric="Reconciliation Diff" value={healthData.reconciliationDiffPct} target="≤ 0.1%" unit="%" healthy={healthData.reconciliationDiffPct <= 0.1} />
            <HealthMetric metric="API p99" value={healthData.apiP99ms} target="< 400ms" unit="ms" healthy={healthData.apiP99ms < 400} />
            <HealthMetric metric="UI p95" value={healthData.uiP95ms} target="< 2000ms" unit="ms" healthy={healthData.uiP95ms < 2000} />
            <HealthMetric metric="OTD Delta" value={healthData.otdDeltaPp} target="≥ 0pp" unit="pp" healthy={healthData.otdDeltaPp >= 0} />
          </div>
        </div>
        <Separator />
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Pruebas Sintéticas</h4>
          <div className="space-y-2">
            {syntheticTests.map(test => <SyntheticTestResult key={test.name} {...test} />)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}