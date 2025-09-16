import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Users } from 'lucide-react';

const alertMatrix = `
# COMEX Alert Matrix v1
# Defines alert rules, thresholds, and escalation chains.
# All alerts are actionable and map to runbooks.

version: 1.0
updated_at: 2025-01-27

# Severity Levels:
# SEV1 (Critical): Immediate page, service down or data loss
# SEV2 (High): 15min response, major functionality impacted  
# SEV3 (Medium): 1h response, minor issues or early warnings
# SEV4 (Low): Next business day, informational

alerts:
  # === CRITICAL (SEV1) ===
  - id: sev1_comex_core_outage
    name: "COMEX Core Service Outage"
    trigger: "http_success_rate < 95% for 5 minutes"
    severity: SEV1
    page: oncall_primary
    escalate_after: 10m
    runbook: "runbooks/incident_core_outage.md"
    description: "Core COMEX unavailable, immediate response required"

  - id: sev1_data_loss_detected
    name: "Data Loss or Corruption Detected" 
    trigger: "data_integrity_check_failed == true"
    severity: SEV1
    page: [oncall_primary, data_lead]
    runbook: "runbooks/data_recovery.md"

  - id: sev1_payment_system_down
    name: "Payment System Failure"
    trigger: "payment_completion_rate < 90% for 15 minutes"
    severity: SEV1
    page: [oncall_primary, finance_lead]
    runbook: "runbooks/payment_system_recovery.md"

  # === HIGH (SEV2) ===
  - id: sev2_kpi_latency_regression
    name: "KPI Latency Performance Regression"
    trigger: "kpi_latency_p95 > 400ms for 10 minutes"
    severity: SEV2
    notify: [analytics_owner, squad_data]
    response_time: 15m
    runbook: "runbooks/data_plane_performance.md"

  - id: sev2_route_duplication_bug
    name: "Route Duplication Detected"
    trigger: "ui_view_fingerprint_mismatch == true"
    severity: SEV2
    notify: [frontend_lead, squad_comex]
    response_time: 15m
    runbook: "playbooks/route_duplication_hotfix.md"
    description: "Historical bug: dashboard components replicating between tabs"

  - id: sev2_workflow_failures_spike
    name: "Workflow Completion Rate Drop"
    trigger: "workflow_completion_rate < 90% for 20 minutes"
    severity: SEV2
    notify: [ops_lead, backend_lead]
    runbook: "runbooks/workflow_debugging.md"

  # === MEDIUM (SEV3) ===  
  - id: sev3_cache_hit_degradation
    name: "KPI Cache Hit Rate Degradation"
    trigger: "kpi_cache_hit_rate < 80% for 30 minutes"
    severity: SEV3
    notify: performance_team
    response_time: 1h
    runbook: "runbooks/cache_optimization.md"

  - id: sev3_customs_hold_spike
    name: "Customs Hold Rate Increase"
    trigger: "customs_hold_rate > 15% for 1 hour"
    severity: SEV3
    notify: [customs_manager, ops_lead]
    runbook: "playbooks/customs_hold_mitigation.md"

  - id: sev3_dnd_risk_spike
    name: "D&D Risk Exposure Spike"
    trigger: "total_dnd_risk_eur > 50000"
    severity: SEV3
    notify: [finance_controller, ops_manager]
    runbook: "playbooks/dnd_risk_mitigation.md"

  # === BUSINESS ALERTS ===
  - id: business_otd_target_miss
    name: "OTD Target Miss"
    trigger: "otd_percentage < 95% for 24 hours"
    severity: SEV3
    notify: [ops_manager, customer_success]
    runbook: "playbooks/otd_improvement.md"

  - id: business_3wm_failure_rate
    name: "3WM Failure Rate High"
    trigger: "three_way_match_pass_rate < 90% for 4 hours"
    severity: SEV3  
    notify: [finance_controller, ap_team]
    runbook: "playbooks/3wm_reconciliation.md"

  - id: business_doc_completeness_drop
    name: "Document Completeness Drop"
    trigger: "doc_completeness_rate < 95% for 6 hours"
    severity: SEV3
    notify: [ops_lead, document_team]
    runbook: "playbooks/doc_completeness_recovery.md"

# On-call rotations and escalation
oncall_rotations:
  - name: oncall_primary
    schedule: weekly
    members: [sre_alice, sre_bob, sre_charlie]
    backup: oncall_secondary
    
  - name: oncall_secondary  
    schedule: weekly
    members: [dev_lead_1, dev_lead_2]
    escalate_to: engineering_manager

# Alert routing by time and severity
routing:
  business_hours: "09:00-18:00 CET Mon-Fri"
  sev1_alerts: always_page
  sev2_alerts: business_hours_page_otherwise_email
  sev3_alerts: email_only
  sev4_alerts: slack_only
`;

const AlertSummaryCard = ({ severity, count, examples }) => (
  <Card className="mb-4">
    <CardHeader>
      <CardTitle className={`flex items-center gap-2 ${
        severity === 'SEV1' ? 'text-red-600' :
        severity === 'SEV2' ? 'text-orange-600' :
        severity === 'SEV3' ? 'text-yellow-600' : 'text-blue-600'
      }`}>
        <AlertTriangle className="w-5 h-5" />
        {severity} Alerts
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-4 mb-3">
        <Badge variant={severity === 'SEV1' ? 'destructive' : 'secondary'}>
          {count} Rules
        </Badge>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          Response: {
            severity === 'SEV1' ? 'Immediate' :
            severity === 'SEV2' ? '15 minutes' :
            severity === 'SEV3' ? '1 hour' : 'Next business day'
          }
        </div>
      </div>
      <ul className="text-sm text-gray-600 space-y-1">
        {examples.map((example, index) => (
          <li key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            {example}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

export default function AlertMatrix() {
  const alertSummary = [
    {
      severity: 'SEV1',
      count: 3,
      examples: [
        'COMEX Core Outage (< 95% success rate)',
        'Data Loss Detected',
        'Payment System Down'
      ]
    },
    {
      severity: 'SEV2', 
      count: 3,
      examples: [
        'KPI Latency Regression (> 400ms)',
        'Route Duplication Bug',
        'Workflow Failures Spike'
      ]
    },
    {
      severity: 'SEV3',
      count: 6,
      examples: [
        'Cache Hit Degradation',
        'Customs Hold Spike',
        'OTD Target Miss',
        '3WM Failure Rate High'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Alert Matrix v1
          </CardTitle>
          <Badge variant="secondary">/ops/alert_matrix.yaml</Badge>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto max-h-96">
            {alertMatrix.trim()}
          </pre>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Alert Summary by Severity
        </h3>
        {alertSummary.map((alert, index) => (
          <AlertSummaryCard
            key={index}
            severity={alert.severity}
            count={alert.count}
            examples={alert.examples}
          />
        ))}
      </div>
    </div>
  );
}