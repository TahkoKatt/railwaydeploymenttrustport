import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stateMachineSpec = {
  "name": "shipping_instructions",
  "version": "1.0",
  "description": "State machine for Shipping Instructions lifecycle management",
  "initial_state": "draft",
  "states": {
    "draft": {
      "description": "Initial state when SI is created",
      "transitions": ["review", "cancelled"],
      "allowed_actions": ["edit", "submit_for_review", "cancel"]
    },
    "review": {
      "description": "SI under review by operations team",
      "transitions": ["approved", "reject_requested", "cancelled"],
      "allowed_actions": ["approve", "request_changes", "cancel"],
      "guards": ["has_required_docs", "parties_verified"]
    },
    "approved": {
      "description": "SI approved and ready for transmission",
      "transitions": ["transmitted", "cancelled"],
      "allowed_actions": ["transmit", "cancel"],
      "guards": ["booking_ref_present", "export_compliance_ok"],
      "side_effects": ["generate_doc_templates", "emit_si_approved_event"]
    },
    "transmitted": {
      "description": "SI transmitted to carrier",
      "transitions": ["confirmed", "reject_requested"],
      "allowed_actions": ["confirm", "retransmit"],
      "side_effects": ["emit_si_transmitted_event", "start_confirmation_timer"]
    },
    "confirmed": {
      "description": "SI confirmed by carrier",
      "transitions": ["completed"],
      "allowed_actions": ["complete"],
      "side_effects": ["emit_si_confirmed_event", "trigger_booking_workflow"]
    },
    "completed": {
      "description": "SI process completed",
      "transitions": [],
      "allowed_actions": ["view", "archive"],
      "terminal": true
    },
    "reject_requested": {
      "description": "Changes requested, needs revision",
      "transitions": ["draft", "cancelled"],
      "allowed_actions": ["revise", "cancel"]
    },
    "cancelled": {
      "description": "SI cancelled",
      "transitions": [],
      "allowed_actions": ["view"],
      "terminal": true,
      "compensations": ["release_reserved_containers", "cancel_auto_booking"]
    }
  },
  "guards": {
    "has_required_docs": {
      "description": "Verify invoice and packing list are present",
      "implementation": "guards/si/hasRequiredDocs.ts"
    },
    "parties_verified": {
      "description": "All parties have valid details and compliance check",
      "implementation": "guards/si/partiesVerified.ts"
    },
    "booking_ref_present": {
      "description": "Booking reference exists or auto-booking is enabled",
      "implementation": "guards/si/bookingRefPresent.ts"
    },
    "export_compliance_ok": {
      "description": "Export compliance screening passed",
      "implementation": "guards/si/exportComplianceOk.ts"
    }
  },
  "sla_matrix": {
    "draft_to_review": { "target_hours": 2, "p95_hours": 4 },
    "review_to_approved": { "target_hours": 4, "p95_hours": 8 },
    "approved_to_transmitted": { "target_hours": 1, "p95_hours": 2 },
    "transmitted_to_confirmed": { "target_hours": 24, "p95_hours": 48 }
  }
};

export default function ShippingInstructionsStateMachine() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>State Machine: Shipping Instructions v1</CardTitle>
        <Badge variant="secondary">/stateflow/state-machines/v1/shipping_instructions.yaml</Badge>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
          {JSON.stringify(stateMachineSpec, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}