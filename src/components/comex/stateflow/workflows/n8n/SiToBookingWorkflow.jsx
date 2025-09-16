import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const workflowSpec = {
  "workflow_id": "wf_si_to_booking",
  "version": "1.0",
  "name": "SI to Booking Auto-Workflow",
  "description": "Automatically create booking when SI is approved",
  "trigger": {
    "event_type": "comex.si.approved",
    "conditions": {
      "customer_auto_booking_enabled": true,
      "route_supported": true
    }
  },
  "saga_pattern": "orchestration",
  "steps": [
    {
      "step_id": "validate_si",
      "type": "validation",
      "action": "validate_si_for_booking",
      "timeout": "30s",
      "retry": 3,
      "on_failure": "compensate"
    },
    {
      "step_id": "rate_lookup",
      "type": "integration", 
      "action": "query_rate_engine",
      "input_mapping": {
        "origin": "$.payload.transport_legs[0].origin_locode",
        "destination": "$.payload.transport_legs[0].destination_locode",
        "mode": "$.payload.mode",
        "cargo_type": "$.payload.cargo.type"
      },
      "timeout": "10s",
      "retry": 2,
      "on_failure": "fallback_manual_rate"
    },
    {
      "step_id": "create_booking",
      "type": "entity_create",
      "action": "create_booking_record",
      "input_mapping": {
        "shipment_id": "$.payload.shipment_id",
        "si_id": "$.payload.si_id",
        "rate_id": "$.steps.rate_lookup.selected_rate.id",
        "customer_id": "$.payload.customer_id"
      },
      "compensation": "cancel_booking_record"
    },
    {
      "step_id": "reserve_space",
      "type": "integration",
      "action": "reserve_container_space",
      "input_mapping": {
        "booking_id": "$.steps.create_booking.booking_id",
        "equipment_type": "$.payload.cargo.equipment_type",
        "quantity": "$.payload.cargo.container_count"
      },
      "timeout": "60s",
      "compensation": "release_container_space"
    },
    {
      "step_id": "confirm_booking",
      "type": "state_transition",
      "action": "transition_booking_to_confirmed",
      "input_mapping": {
        "booking_id": "$.steps.create_booking.booking_id"
      },
      "compensation": "revert_booking_status"
    },
    {
      "step_id": "update_si",
      "type": "entity_update",
      "action": "link_booking_to_si",
      "input_mapping": {
        "si_id": "$.payload.si_id",
        "booking_id": "$.steps.create_booking.booking_id"
      }
    },
    {
      "step_id": "notify_completion",
      "type": "notification",
      "action": "send_booking_created_notification",
      "input_mapping": {
        "recipient": "$.payload.owner_id",
        "booking_id": "$.steps.create_booking.booking_id",
        "si_id": "$.payload.si_id"
      }
    }
  ],
  "compensations": {
    "cancel_booking_record": {
      "action": "delete_booking",
      "input": "$.steps.create_booking.booking_id"
    },
    "release_container_space": {
      "action": "release_space_reservation", 
      "input": "$.steps.reserve_space.reservation_id"
    },
    "revert_booking_status": {
      "action": "set_booking_status",
      "input": {
        "booking_id": "$.steps.create_booking.booking_id",
        "status": "cancelled"
      }
    }
  },
  "fallback_actions": {
    "fallback_manual_rate": {
      "action": "create_manual_rate_task",
      "assignee_role": "rate_analyst",
      "due_hours": 4
    }
  },
  "sla": {
    "total_execution_time": "5m",
    "escalation": {
      "after": "10m",
      "action": "alert_operations_manager"
    }
  }
};

export default function SiToBookingWorkflow() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow: SI to Booking Auto-Creation</CardTitle>
        <Badge variant="secondary">/stateflow/workflows/n8n/wf_si_to_booking.json</Badge>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
          {JSON.stringify(workflowSpec, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}