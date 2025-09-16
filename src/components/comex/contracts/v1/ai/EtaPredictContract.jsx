import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const inputSchema = {
  "title": "eta_predict_input",
  "type": "object",
  "properties": {
    "shipment_id": { "type": "string" },
    "mode": { "type": "string", "enum": ["ocean", "air", "road"] },
    "route": {
      "type": "object",
      "properties": {
        "origin_locode": { "type": "string" },
        "destination_locode": { "type": "string" }
      }
    },
    "carrier": { "type": "string" },
    "leg_data": { "type": "array", "items": { "type": "object" } },
    "docs_ready": { "type": "boolean" },
    "customs_lt_est": { "type": "number", "description": "Estimated customs lead time in hours" }
  },
  "required": ["shipment_id", "mode", "route", "carrier"]
};

const outputSchema = {
  "title": "eta_predict_output",
  "type": "object",
  "properties": {
    "eta_pred": { "type": "string", "format": "date-time" },
    "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
    "factors": { "type": "array", "items": { "type": "string" } },
    "next_check_at": { "type": "string", "format": "date-time" },
    "model_version": { "type": "string" },
    "latency_ms": { "type": "number" }
  },
  "required": ["eta_pred", "confidence", "model_version"]
};

export default function EtaPredictContract() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>IA Hook: /ai/v1/eta_predict</CardTitle>
        <Badge variant="secondary">/contracts/v1/ai/eta_predict.schema.json</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Input Schema</h3>
          <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
            {JSON.stringify(inputSchema, null, 2)}
          </pre>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Output Schema</h3>
          <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
            {JSON.stringify(outputSchema, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}