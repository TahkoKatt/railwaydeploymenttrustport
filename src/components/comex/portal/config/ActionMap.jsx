import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const actionMap = `
# Defines persona-aware actions available in the portal UI.
# Maps a button ID to a workflow ID from Paquete 4.
# UI strings are ASCII-only.

- id: act_gen_booking
  label: "Generate Booking"
  workflow_id: "wf_gen_booking"
  persona: "operador"
  style: "primary"
  icon: "send"

- id: act_upload_docs
  label: "Upload Docs"
  workflow_id: "wf_upload_docs"
  persona: "comerciante"
  style: "secondary"
  icon: "upload"

- id: act_raise_case
  label: "Raise Case"
  workflow_id: "wf_create_case"
  persona: ["operador", "comerciante"]
  style: "destructive"
  icon: "alert-triangle"

- id: act_pay_invoice
  label: "Pay Now"
  workflow_id: "wf_process_payment"
  persona: "comerciante"
  style: "primary"
  icon: "dollar-sign"

- id: act_add_form_vgm
  label: "Declare VGM"
  workflow_id: "wf_submit_vgm"
  persona: ["comerciante", "operador"]
  style: "outline"
  icon: "file-plus"
`;

export default function ActionMapConfig() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portal Action Map v1</CardTitle>
        <Badge variant="secondary">/portal/action_builder/map.yaml</Badge>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
          {actionMap.trim()}
        </pre>
      </CardContent>
    </Card>
  );
}