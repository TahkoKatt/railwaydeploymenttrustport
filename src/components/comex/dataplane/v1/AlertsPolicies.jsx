import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const alertsPolicies = `
version: 1.0
description: Alerting policies for COMEX Data Plane.

policies:
  # Threshold-based alerts
  - id: eta_delay_24h
    type: threshold
    metric: eta_delta_hours
    trigger: "> 24"
    severity: warn
    message: "ETA for {shipment_id} delayed by more than 24h."
    dimensions: [shipment_id]
    cta: recalc_eta
    workflow_id: wf_notify_client

  - id: margin_below_target
    type: threshold
    metric: net_margin
    trigger: "< 10.0"
    severity: error
    message: "Margin for {shipment_id} is below 10%."
    dimensions: [shipment_id, owner]
    cta: review_margin
    workflow_id: wf_margin_review_case

  # Ratio-based alerts
  - id: dnd_high_vs_margin
    type: ratio
    numerator_metric: dnd_risk_eur
    denominator_metric: net_margin_eur
    trigger: "> 0.5"
    severity: warn
    message: "D&D risk for {shipment_id} exceeds 50% of margin."
    dimensions: [shipment_id, port, carrier]
    cta: mitigate_dnd
    workflow_id: wf_dnd_protection

  # SLA-based alerts
  - id: docs_ready_sla_breach
    type: sla
    metric: docs_ready_hours_before_cutoff
    trigger: "< 24"
    severity: error
    message: "Docs for {shipment_id} not ready within 24h of cutoff."
    dimensions: [shipment_id, owner]
    cta: escalate_docs
    workflow_id: wf_docs_escalation

  # Predictive alerts
  - id: high_rollover_prob
    type: prediction
    metric: rollover_prob
    trigger: "> 0.75"
    severity: info
    message: "High rollover probability ({value}%) for {booking_id}."
    dimensions: [booking_id, carrier, vessel]
    cta: pre_book_next
    workflow_id: wf_rollover_mitigation

  - id: customs_hold_prob
    type: prediction
    metric: customs_hold_prob
    trigger: "> 0.6"
    severity: warn
    message: "High probability of customs hold for {shipment_id} at {port}."
    dimensions: [shipment_id, port, hs_code]
    cta: review_docs
    workflow_id: wf_customs_pre_check
`;

export default function AlertsPolicies() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts Policies v1</CardTitle>
        <Badge variant="secondary">/data-plane/alerts_policies/v1/comex.yaml</Badge>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
          {alertsPolicies.trim()}
        </pre>
      </CardContent>
    </Card>
  );
}