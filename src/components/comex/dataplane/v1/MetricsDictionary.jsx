import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const metricsDictionary = `
version: 1.0
description: Canonical definitions for all COMEX KPIs. ASCII-only keys.

metrics:
  - id: otd
    name: On Time Delivery
    description: Percentage of shipments delivered within the planned window.
    formula: (count(shipments where actual_delivery <= planned_delivery) / count(shipments)) * 100
    format: percentage
    window: 30d
    dimensions: [customer, carrier, lane, mode]
    owner: ops_lead
    sla_target: 95.0

  - id: eta_accuracy
    name: ETA Accuracy
    description: Average absolute deviation in hours between final ETA and actual arrival.
    formula: avg(abs(actual_arrival - final_eta_planned))
    format: hours
    window: 7d
    dimensions: [carrier, lane, mode]
    owner: ops_lead
    sla_target: "< 12h"

  - id: customs_lt_hours
    name: Customs Lead Time (h)
    description: Average time in hours from customs filed to released status.
    formula: avg(timestamp(released) - timestamp(filed))
    format: hours
    window: 30d
    dimensions: [origin_country, destination_country, broker]
    owner: customs_manager
    sla_target: "< 24h"

  - id: compliance_blocks_count
    name: Compliance Blocks
    description: Count of active compliance blocks preventing shipment progress.
    formula: count(shipments where compliance_status = 'blocked')
    format: integer
    window: current
    dimensions: [customer, reason, owner]
    owner: compliance_officer
    sla_target: 0

  - id: net_margin
    name: Net Margin
    description: Net margin percentage after all costs.
    formula: ((total_sell - total_buy) / total_sell) * 100
    format: percentage
    window: 30d
    grain: shipment_id
    dimensions: [customer, lane, owner]
    owner: finance_controller
    sla_target: ">= 12.5%"

  - id: dnd_risk_eur
    name: D&D Risk (EUR)
    description: Estimated financial risk from potential Demurrage & Detention charges.
    formula: sum(dnd_risk_model(shipment))
    format: currency_eur
    window: current
    dimensions: [port, carrier, customer]
    owner: ops_manager
    sla_target: "minimize"

  - id: dso_days
    name: Days Sales Outstanding
    description: Average number of days to collect payment after an invoice has been sent.
    formula: (avg_ar_balance / total_credit_sales) * period_days
    format: days
    window: 90d
    dimensions: [customer, country]
    owner: finance_controller
    sla_target: "< 45d"

  - id: ftr
    name: First Time Right
    description: Percentage of processes (docs, compliance) completed without errors or revisions.
    formula: (count(process where attempts = 1) / count(process)) * 100
    format: percentage
    window: 30d
    dimensions: [process_type, owner, customer]
    owner: quality_lead
    sla_target: ">= 98%"

  # Persona-specific metrics
  - id: cash_impact_30d
    name: Cash Impact (30d)
    profile: comerciante
    description: Net cash impact of upcoming payables and receivables in the next 30 days.
    formula: sum(ar_due_30d) - sum(ap_due_30d)
    format: currency_eur
    window: next_30d
    owner: finance_controller

  - id: booking_confirm_time
    name: Booking Confirmation Time
    profile: operador
    description: Average time from booking request to carrier confirmation.
    formula: avg(timestamp(confirmed) - timestamp(requested))
    format: hours
    window: 7d
    dimensions: [carrier, lane]
    owner: ops_manager
    sla_target: "< 4h"
`;

export default function MetricsDictionary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metrics Dictionary v1</CardTitle>
        <Badge variant="secondary">/data-plane/metrics_dictionary/v1/comex.yaml</Badge>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
          {metricsDictionary.trim()}
        </pre>
      </CardContent>
    </Card>
  );
}