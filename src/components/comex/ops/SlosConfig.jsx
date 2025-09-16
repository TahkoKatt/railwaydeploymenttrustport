import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Target, Clock } from 'lucide-react';

const slosSpec = `
# COMEX SLO Configuration v1
# Defines service level objectives, error budgets, and ownership.

version: 1.0
updated_at: 2025-01-27

services:
  - name: comex_core
    description: Core COMEX application (SI, Booking, BL/AWB, etc.)
    availability: 99.9
    latency_p95_ms: 800
    error_budget_window_days: 30
    
    slis:
      - name: http_success_rate
        description: Percentage of HTTP requests that return 2xx or 3xx status
        target: 99.5
        critical_threshold: 95.0
        
      - name: kpi_cache_hit_rate  
        description: Percentage of KPI requests served from cache
        target: 90.0
        critical_threshold: 70.0
        
      - name: workflow_completion_rate
        description: Percentage of workflows that complete successfully
        target: 98.0
        critical_threshold: 90.0
        
      - name: event_idempotency_conflicts_per_1k
        description: Duplicate event processing conflicts per 1000 events
        target: 0
        critical_threshold: 5
    
    owners:
      primary: squad_comex
      oncall: sre_weekly_rotation
      escalation: engineering_manager

  - name: comex_portal
    description: External portal for customers and suppliers
    availability: 99.9
    latency_p95_ms: 1200
    error_budget_window_days: 30
    
    slis:
      - name: portal_success_rate
        target: 99.0
        critical_threshold: 95.0
        
      - name: doc_upload_success_rate
        target: 98.0
        critical_threshold: 90.0
        
      - name: payment_completion_rate
        target: 99.5
        critical_threshold: 95.0
    
    owners:
      primary: squad_portal
      oncall: sre_weekly_rotation

  - name: comex_data_plane
    description: KPIs, alerts, and analytics processing
    availability: 99.8
    latency_p95_ms: 200
    error_budget_window_days: 30
    
    slis:
      - name: kpi_calculation_accuracy
        description: Percentage of KPI calculations that match expected values
        target: 99.9
        critical_threshold: 95.0
        
      - name: data_freshness_minutes
        description: Maximum age of data in materialized views
        target: 2.0
        critical_threshold: 10.0
    
    owners:
      primary: squad_data
      oncall: data_engineer_rotation
`;

const SloCard = ({ service, slos }) => (
  <Card className="mb-4">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="w-5 h-5 text-green-600" />
        {service}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        {slos.map((slo, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-sm">{slo.name}</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              {slo.target}{slo.name.includes('rate') ? '%' : slo.name.includes('ms') ? 'ms' : ''}
            </div>
            <div className="text-xs text-gray-500">
              Critical: {slo.critical}{slo.name.includes('rate') ? '%' : ''}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default function SlosConfig() {
  const mockSlos = [
    {
      service: "COMEX Core",
      slos: [
        { name: "Availability", target: "99.9", critical: "99.0" },
        { name: "Latency P95", target: "800", critical: "1200" },
        { name: "Success Rate", target: "99.5", critical: "95.0" },
        { name: "Cache Hit", target: "90.0", critical: "70.0" }
      ]
    },
    {
      service: "Portal",
      slos: [
        { name: "Availability", target: "99.9", critical: "99.0" },
        { name: "Upload Success", target: "98.0", critical: "90.0" },
        { name: "Payment Success", target: "99.5", critical: "95.0" }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            SLOs Configuration v1
          </CardTitle>
          <Badge variant="secondary">/ops/slos.yaml</Badge>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto max-h-96">
            {slosSpec.trim()}
          </pre>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4">Current SLO Dashboard</h3>
        {mockSlos.map((service, index) => (
          <SloCard key={index} service={service.service} slos={service.slos} />
        ))}
      </div>
    </div>
  );
}