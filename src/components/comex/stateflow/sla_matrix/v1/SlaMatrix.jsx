import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const slaMatrix = {
  "version": "1.0",
  "description": "SLA targets and escalation rules for COMEX workflows",
  "profiles": {
    "comerciante": {
      "priority_multiplier": 1.2,
      "escalation_chain": ["account_manager", "operations_director"]
    },
    "operador": {
      "priority_multiplier": 1.0,
      "escalation_chain": ["operations_manager", "operations_director"]
    }
  },
  "transitions": {
    "si_draft_to_review": {
      "target_hours": 2,
      "p95_hours": 4,
      "cutoff_at": "17:00",
      "escalation": {
        "after_hours": 6,
        "action": "alert_operations_team",
        "message": "SI review overdue: {si_id}"
      }
    },
    "si_review_to_approved": {
      "target_hours": 4,
      "p95_hours": 8,
      "cutoff_at": "16:00",
      "escalation": {
        "after_hours": 12,
        "action": "alert_operations_manager",
        "message": "SI approval overdue: {si_id}. Customer: {customer_name}"
      }
    },
    "booking_requested_to_confirmed": {
      "target_hours": 2,
      "p95_hours": 6,
      "business_hours_only": true,
      "escalation": {
        "after_hours": 8,
        "action": "create_urgent_task",
        "assignee_role": "booking_specialist"
      }
    },
    "docs_uploaded_to_validated": {
      "target_minutes": 30,
      "p95_minutes": 90,
      "auto_retry": true,
      "escalation": {
        "after_hours": 2,
        "action": "manual_review_required",
        "message": "Document validation failed multiple times: {document_id}"
      }
    },
    "compliance_screening_pending": {
      "target_minutes": 15,
      "p95_minutes": 45,
      "escalation": {
        "after_hours": 1,
        "action": "compliance_team_review",
        "priority": "high"
      }
    },
    "customs_filed_to_released": {
      "target_hours": 24,
      "p95_hours": 48,
      "business_hours_only": false,
      "escalation": {
        "after_hours": 72,
        "action": "customs_broker_followup",
        "message": "Custom clearance overdue: {customs_decl_id}"
      }
    }
  },
  "workflows": {
    "wf_si_to_booking": {
      "target_minutes": 5,
      "p95_minutes": 10,
      "escalation": {
        "after_minutes": 15,
        "action": "workflow_health_check"
      }
    },
    "wf_dnd_protection": {
      "target_minutes": 2,
      "p95_minutes": 5,
      "escalation": {
        "after_minutes": 10,
        "action": "alert_customer_success"
      }
    },
    "wf_settlement_fastlane": {
      "target_hours": 2,
      "p95_hours": 4,
      "escalation": {
        "after_hours": 6,
        "action": "finance_team_review"
      }
    }
  },
  "cutoff_schedules": {
    "cy_cutoff": {
      "description": "Container Yard cutoff",
      "schedule": "vessel_etd - 24h",
      "grace_period": "2h",
      "escalation": "late_gate_in_fee"
    },
    "doc_cutoff": {
      "description": "Documentation cutoff",
      "schedule": "vessel_etd - 48h", 
      "grace_period": "6h",
      "escalation": "manual_processing_required"
    },
    "vgm_cutoff": {
      "description": "VGM submission deadline",
      "schedule": "vessel_etd - 6h",
      "grace_period": "1h",
      "escalation": "container_not_loaded"
    }
  }
};

export default function SlaMatrix() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SLA Matrix v1</CardTitle>
        <Badge variant="secondary">/stateflow/sla_matrix/v1/sla_matrix.json</Badge>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
          {JSON.stringify(slaMatrix, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}