import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const checklistItems = [
  {
    category: "Performance & Reliability",
    items: [
      { id: "p95_latency", text: "Dashboard p95 < 800ms in staging & canary", critical: true },
      { id: "error_rate", text: "HTTP error rate < 1% for 24 hours", critical: true },
      { id: "cache_hit", text: "KPI cache hit rate > 90%", critical: false },
      { id: "workflow_success", text: "Workflow completion rate > 98%", critical: false }
    ]
  },
  {
    category: "Functional Quality", 
    items: [
      { id: "route_duplication", text: "0 'route_duplication_detected' alerts in SI/BL-AWB/Liquidacion", critical: true },
      { id: "e2e_tests", text: "100% E2E test suite passing", critical: true },
      { id: "conformance_tests", text: "100% CDC conformance tests passing", critical: true },
      { id: "visual_regression", text: "0 visual regression failures in Storybook", critical: false }
    ]
  },
  {
    category: "Data Quality",
    items: [
      { id: "kpi_reconciliation", text: "KPI values reconcile with seed data", critical: true },
      { id: "3wm_pass_rate", text: "3-Way Match pass rate >= 90%", critical: false },
      { id: "margin_accuracy", text: "Net margin calculations accurate within ±0.1%", critical: true },
      { id: "event_idempotency", text: "0 event idempotency conflicts in test runs", critical: true }
    ]
  },
  {
    category: "Security & Compliance",
    items: [
      { id: "rls_tests", text: "100% RLS test suite passing", critical: true },
      { id: "tenant_isolation", text: "0 cross-tenant access violations", critical: true },
      { id: "secrets_rotation", text: "All secrets rotated within last 30 days", critical: false },
      { id: "pii_redaction", text: "PII properly redacted in logs", critical: true }
    ]
  },
  {
    category: "Operational Readiness",
    items: [
      { id: "backups_verified", text: "Backups verified with successful restore test in last 7 days", critical: true },
      { id: "dr_runbook", text: "DR restore runbook executed successfully", critical: true },
      { id: "oncall_setup", text: "On-call rotation active and alert tests passing", critical: true },
      { id: "runbooks_updated", text: "All runbooks reviewed and updated", critical: false }
    ]
  },
  {
    category: "Monitoring & Alerting",
    items: [
      { id: "dashboards_functional", text: "All SLO dashboards functional and accurate", critical: false },
      { id: "alert_noise", text: "Alert noise < 5 alerts/day in staging", critical: false },
      { id: "slo_tracking", text: "Error budget tracking operational", critical: true },
      { id: "business_kpis", text: "Business KPIs (OTD, DSO, etc.) reporting correctly", critical: true }
    ]
  }
];

const ChecklistItem = ({ item, checked, onToggle }) => {
  const Icon = checked ? CheckCircle : XCircle;
  const iconColor = checked ? 'text-green-500' : 'text-red-500';
  
  return (
    <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
      <button onClick={() => onToggle(item.id)}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </button>
      <span className={`flex-1 text-sm ${checked ? 'text-gray-700' : 'text-gray-900'}`}>
        {item.text}
      </span>
      {item.critical && (
        <Badge variant="destructive" className="text-xs">Critical</Badge>
      )}
    </div>
  );
};

export default function GoNoGoChecklist() {
  const [checkedItems, setCheckedItems] = useState(new Set());
  
  const toggleItem = (itemId) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  const allItems = checklistItems.flatMap(category => category.items);
  const criticalItems = allItems.filter(item => item.critical);
  const checkedCritical = criticalItems.filter(item => checkedItems.has(item.id));
  const totalChecked = allItems.filter(item => checkedItems.has(item.id));
  
  const canDeploy = checkedCritical.length === criticalItems.length;
  const completionRate = (totalChecked.length / allItems.length) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Go/No-Go Deployment Checklist
          </CardTitle>
          <Badge variant="secondary">Production Readiness Gate</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(completionRate)}%
              </div>
              <div className="text-sm text-gray-600">Overall Complete</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {checkedCritical.length}/{criticalItems.length}
              </div>
              <div className="text-sm text-gray-600">Critical Items</div>
            </div>
            <div className={`p-4 rounded-lg text-center ${canDeploy ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`text-2xl font-bold ${canDeploy ? 'text-green-600' : 'text-red-600'}`}>
                {canDeploy ? 'GO' : 'NO-GO'}
              </div>
              <div className="text-sm text-gray-600">Deploy Status</div>
            </div>
          </div>

          <div className="space-y-6">
            {checklistItems.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.items.map((item) => (
                      <ChecklistItem
                        key={item.id}
                        item={item}
                        checked={checkedItems.has(item.id)}
                        onToggle={toggleItem}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold">Deployment Decision</span>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              {canDeploy 
                ? "✅ All critical items verified. Ready to proceed with production deployment."
                : "❌ Critical items missing. Deployment blocked until all critical items are resolved."
              }
            </p>
            <div className="flex gap-3">
              <Button 
                disabled={!canDeploy}
                className={canDeploy ? "bg-green-600 hover:bg-green-700" : ""}
              >
                Deploy to Production
              </Button>
              <Button variant="outline">
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}