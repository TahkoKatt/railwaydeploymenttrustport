import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const overlaysMap = {
  "version": "1.0",
  "description": "Maps UI actions to workflows, aware of user profile.",
  "map": {
    "comerciante": {
      "alerts": {
        "eta_delay_24h": {
          "label": "Notify Me",
          "workflow_id": "wf_client_self_notification"
        },
        "dnd_high_vs_margin": {
          "label": "Request Mitigation",
          "workflow_id": "wf_request_dnd_mitigation_from_3pl"
        }
      },
      "quick_actions": {
        "create_si": { "label": "Create SI", "workflow_id": "wf_create_si" },
        "export_report": { "label": "Export Report", "workflow_id": "wf_export_shipment_report" },
        "assign_to_3pl": { "label": "Assign to 3PL", "workflow_id": "wf_assign_shipment_to_operator" }
      }
    },
    "operador": {
      "alerts": {
        "eta_delay_24h": {
          "label": "Recalculate ETA",
          "workflow_id": "wf_recalculate_eta"
        },
        "dnd_high_vs_margin": {
          "label": "Mitigate D&D",
          "workflow_id": "wf_dnd_protection"
        },
        "docs_ready_sla_breach": {
          "label": "Escalate Docs",
          "workflow_id": "wf_docs_escalation"
        }
      },
      "quick_actions": {
        "gen_booking": { "label": "Generate Booking", "workflow_id": "wf_si_to_booking" },
        "run_audit": { "label": "Run Audit", "workflow_id": "wf_ai_settlement_audit" },
        "raise_case": { "label": "Raise Case", "workflow_id": "wf_create_internal_case" },
        "add_form": { "label": "Add Form", "workflow_id": "wf_add_form_to_shipment" }
      }
    }
  }
};

export default function OverlaysActionsMap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overlays Actions Map v1</CardTitle>
        <Badge variant="secondary">/data-plane/overlays_actions_map/comex.json</Badge>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
          {JSON.stringify(overlaysMap, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}