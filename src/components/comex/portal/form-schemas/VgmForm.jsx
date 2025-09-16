import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const vgmFormSchema = {
  "id": "form_vgm_v1",
  "title": "VGM Declaration",
  "description": "Verified Gross Mass declaration form.",
  "fields": [
    {
      "key": "container_no",
      "type": "text",
      "label": "Container Number",
      "placeholder": "e.g., TCNU1234567",
      "required": true,
      "validation": {
        "regex": "^[A-Z]{4}\\d{7}$",
        "message": "Must be a valid container number format."
      }
    },
    {
      "key": "booking_ref",
      "type": "text",
      "label": "Booking Reference",
      "required": true
    },
    {
      "key": "method",
      "type": "select",
      "label": "Weighing Method",
      "options": [
        { "value": "Method1", "label": "Method 1: Weighing the packed container" },
        { "value": "Method2", "label": "Method 2: Weighing all packages and adding tare" }
      ],
      "required": true
    },
    {
      "key": "gross_weight_kg",
      "type": "number",
      "label": "Gross Weight (kg)",
      "min": 1,
      "required": true
    },
    {
      "key": "authorized_person",
      "type": "text",
      "label": "Authorized Person",
      "required": true
    }
  ],
  "onSubmit": {
    "emit": "comex.portal.form.submitted",
    "payload": {
      "formId": "form_vgm_v1"
    },
    "workflow_id": "wf_submit_vgm"
  }
};

export default function VgmFormSchema() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Schema: VGM v1</CardTitle>
        <Badge variant="secondary">/portal/form_builder/schema/vgm.json</Badge>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
          {JSON.stringify(vgmFormSchema, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}