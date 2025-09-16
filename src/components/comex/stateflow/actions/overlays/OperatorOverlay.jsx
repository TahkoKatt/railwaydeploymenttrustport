import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const operatorOverlay = {
  "profile": "operador",
  "version": "1.0", 
  "description": "Action buttons and quick workflows for Operator Logistico profile",
  "tabs": {
    "si": {
      "actions": [
        {
          "id": "create_from_email",
          "label": "Crear desde Email",
          "icon": "mail",
          "workflow_id": "wf_create_si_from_email",
          "permissions": ["si.create"],
          "context_required": ["email_thread_id"]
        },
        {
          "id": "validate_parties",
          "label": "Validar Parties",
          "icon": "user-check",
          "workflow_id": "wf_validate_parties",
          "permissions": ["si.validate"],
          "context_required": ["si_id"],
          "bulk_action": false
        },
        {
          "id": "transmit_to_carrier",
          "label": "Transmitir a Carrier",
          "icon": "send",
          "workflow_id": "wf_transmit_si",
          "permissions": ["si.transmit"],
          "context_required": ["si_id"],
          "confirmation": "¿Confirma transmisión a {carrier_name}?",
          "bulk_action": true
        }
      ]
    },
    "booking": {
      "actions": [
        {
          "id": "rfq_spot",
          "label": "RFQ Spot Rate",
          "icon": "search",
          "workflow_id": "wf_spot_rate_rfq", 
          "permissions": ["booking.rate"],
          "context_required": ["shipment_id", "route"],
          "form_schema": {
            "cargo_ready_date": {"type": "date", "required": true},
            "service_type": {"type": "select", "options": ["FCL", "LCL"], "required": true}
          }
        },
        {
          "id": "confirm_booking",
          "label": "Confirmar",
          "icon": "check-circle",
          "workflow_id": "wf_confirm_booking",
          "permissions": ["booking.confirm"],
          "context_required": ["booking_id"],
          "guard": "booking_rate_selected",
          "bulk_action": true
        },
        {
          "id": "rebook",
          "label": "Rebook",
          "icon": "refresh-cw",
          "workflow_id": "wf_rebook_shipment",
          "permissions": ["booking.rebook"],
          "context_required": ["booking_id"],
          "confirmation": "¿Rebook a próximo vessel? Puede generar demoras."
        },
        {
          "id": "rollover",
          "label": "Roll-over",
          "icon": "arrow-right",
          "workflow_id": "wf_handle_rollover",
          "permissions": ["booking.rollover"],
          "context_required": ["booking_id"],
          "auto_trigger": {
            "event": "vessel_rolled",
            "condition": "auto_rollover_enabled"
          }
        }
      ]
    },
    "bl_awb": {
      "actions": [
        {
          "id": "issue_bl",
          "label": "Emitir BL/AWB",
          "icon": "file-text",
          "workflow_id": "wf_issue_bl",
          "permissions": ["bl.issue"],
          "context_required": ["booking_id", "cargo_manifest"],
          "guard": "si_confirmed_and_docs_valid"
        },
        {
          "id": "release_bl", 
          "label": "Release",
          "icon": "unlock",
          "workflow_id": "wf_release_bl",
          "permissions": ["bl.release"],
          "context_required": ["bl_id"],
          "form_schema": {
            "release_type": {"type": "select", "options": ["telex", "express", "original"], "required": true},
            "release_to_party": {"type": "text", "required": true}
          }
        },
        {
          "id": "surrender_bl",
          "label": "Surrender",
          "icon": "hand",
          "workflow_id": "wf_surrender_bl",
          "permissions": ["bl.surrender"],
          "context_required": ["bl_id"],
          "confirmation": "¿Surrender BL? Esta acción es irreversible."
        },
        {
          "id": "resend_bl",
          "label": "Reenviar",
          "icon": "send",
          "workflow_id": "wf_resend_bl_documents",
          "permissions": ["bl.send"],
          "context_required": ["bl_id"],
          "form_schema": {
            "recipient_email": {"type": "email", "required": true},
            "include_attachments": {"type": "boolean", "default": true}
          }
        }
      ]
    },
    "docs": {
      "actions": [
        {
          "id": "upload_docs",
          "label": "Subir Docs",
          "icon": "upload",
          "workflow_id": "wf_upload_documents",
          "permissions": ["docs.upload"],
          "context_required": ["shipment_id"],
          "form_schema": {
            "document_type": {"type": "select", "options": ["commercial_invoice", "packing_list", "certificate_of_origin"], "required": true},
            "files": {"type": "file", "multiple": true, "required": true}
          }
        },
        {
          "id": "validate_now",
          "label": "Validar Ahora",
          "icon": "check-square",
          "workflow_id": "wf_validate_documents_priority",
          "permissions": ["docs.validate"],
          "context_required": ["document_id"],
          "priority_queue": true,
          "bulk_action": true
        },
        {
          "id": "request_correction",
          "label": "Solicitar Corrección",
          "icon": "edit",
          "workflow_id": "wf_request_doc_correction",
          "permissions": ["docs.request_changes"],
          "context_required": ["document_id"],
          "form_schema": {
            "correction_notes": {"type": "textarea", "required": true},
            "due_date": {"type": "date", "required": true}
          }
        }
      ]
    },
    "liquidacion": {
      "actions": [
        {
          "id": "collect_costs",
          "label": "Recolectar Costos",
          "icon": "calculator",
          "workflow_id": "wf_collect_all_costs",
          "permissions": ["settlement.costs"],
          "context_required": ["shipment_id"],
          "auto_trigger": {
            "event": "pod_received",
            "delay": "24h"
          }
        },
        {
          "id": "generate_invoice",
          "label": "Generar Invoice",
          "icon": "file-plus",
          "workflow_id": "wf_generate_settlement_invoice",
          "permissions": ["settlement.invoice"],
          "context_required": ["settlement_id"],
          "guard": "all_costs_allocated"
        },
        {
          "id": "audit_ia",
          "label": "Auditar (IA)",
          "icon": "search",
          "workflow_id": "wf_ai_settlement_audit",
          "permissions": ["settlement.audit"],
          "context_required": ["settlement_id"],
          "ai_endpoint": "/ai/v1/liquidation_audit"
        }
      ]
    }
  },
  "bulk_actions": {
    "transmit_multiple_si": {
      "label": "Transmitir Seleccionados",
      "workflow_id": "wf_bulk_transmit_si",
      "max_items": 50,
      "confirmation": "¿Transmitir {count} SIs seleccionados?"
    },
    "confirm_multiple_bookings": {
      "label": "Confirmar Bookings",
      "workflow_id": "wf_bulk_confirm_bookings", 
      "max_items": 25,
      "guard": "all_have_rates_selected"
    }
  }
};

export default function OperatorOverlay() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Operator Overlay Actions v1</CardTitle>
        <Badge variant="secondary">/stateflow/actions/overlays/operador.json</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          Action buttons and workflows for Operator Logistico profile. Actions map 1:1 to n8n workflows without creating new views.
        </p>
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
          {JSON.stringify(operatorOverlay, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}