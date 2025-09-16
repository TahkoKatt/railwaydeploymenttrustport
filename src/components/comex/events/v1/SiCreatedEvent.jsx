import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const schema = {
  "$id": "https://trustport.ai/events/comex/v1/si.created.schema.json",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "comex.si.created",
  "description": "Event triggered when a new Shipping Instruction is created.",
  "type": "object",
  "properties": {
    "event_id": { "type": "string", "format": "uuid" },
    "event_type": { "type": "string", "const": "comex.si.created" },
    "event_version": { "type": "string", "const": "1.0" },
    "produced_at": { "type": "string", "format": "date-time" },
    "correlation_id": { "type": "string" },
    "idempotency_key": { "type": "string" },
    "payload": {
      "type": "object",
      "properties": {
        "si_id": { "type": "string" },
        "shipment_id": { "type": "string" },
        "customer_id": { "type": "string" },
        "owner_id": { "type": "string" }
      },
      "required": ["si_id", "shipment_id", "customer_id", "owner_id"]
    }
  },
  "required": ["event_id", "event_type", "produced_at", "payload"]
};

const example = {
  "event_id": "e_12345",
  "event_type": "comex.si.created",
  "event_version": "1.0",
  "produced_at": "2025-10-26T10:00:00Z",
  "correlation_id": "corr_abc",
  "idempotency_key": "idem_xyz",
  "payload": {
    "si_id": "si_abc123",
    "shipment_id": "shp_def456",
    "customer_id": "cust_789",
    "owner_id": "user_qwe"
  }
};

export default function SiCreatedEvent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event: comex.si.created v1</CardTitle>
        <Badge variant="secondary">/events/v1/comex.si.created.schema.json</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Schema</h3>
          <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
            {JSON.stringify(schema, null, 2)}
          </pre>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Example Payload</h3>
          <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
            {JSON.stringify(example, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}