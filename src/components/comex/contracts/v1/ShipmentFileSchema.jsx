import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const schema = {
  "$id": "https://trustport.ai/schemas/comex/v1/shipmentfile.schema.json",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ShipmentFile",
  "description": "Canonical schema for a COMEX shipment file, the master record for an operation.",
  "type": "object",
  "properties": {
    "shipment_id": {
      "type": "string",
      "description": "Unique identifier for the shipment file (e.g., 'shp_2a3b4c'). ASCII, kebab or snake case."
    },
    "si_id": { "type": "string", "description": "Associated Shipping Instruction ID." },
    "booking_id": { "type": "string", "description": "Associated Booking ID." },
    "bl_id": { "type": "string", "description": "Associated Bill of Lading ID (or AWB)." },
    "mode": {
      "type": "string",
      "enum": ["ocean", "air", "road", "rail"],
      "description": "Primary transport mode."
    },
    "status": {
      "type": "string",
      "description": "Overall status of the shipment, derived from the latest milestone."
    },
    "owner_id": { "type": "string", "description": "User ID of the shipment owner." },
    "customer_id": { "type": "string", "description": "Customer account ID." },
    "parties": {
      "type": "object",
      "properties": {
        "shipper": { "$ref": "#/definitions/party" },
        "consignee": { "$ref": "#/definitions/party" },
        "notify_party": { "$ref": "#/definitions/party" }
      }
    },
    "transport_legs": {
      "type": "array",
      "items": { "$ref": "#/definitions/transportLeg" }
    },
    "charges": {
      "type": "array",
      "items": { "$ref": "#/definitions/charge" }
    },
    "milestones": {
      "type": "array",
      "items": { "$ref": "#/definitions/milestone" }
    },
    "risks": {
      "type": "array",
      "items": { "$ref": "#/definitions/risk" }
    }
  },
  "required": ["shipment_id", "mode", "status", "owner_id", "customer_id"],
  "definitions": {
    "party": {
      "type": "object",
      "properties": {
        "party_id": { "type": "string" },
        "name": { "type": "string" },
        "tax_id": { "type": "string" },
        "address": { "type": "string" }
      },
      "required": ["party_id", "name"]
    },
    "transportLeg": {
      "type": "object",
      "properties": {
        "leg_id": { "type": "string" },
        "mode": { "type": "string", "enum": ["ocean", "air", "road", "rail"] },
        "origin_locode": { "type": "string" },
        "destination_locode": { "type": "string" },
        "etd": { "type": "string", "format": "date-time" },
        "eta": { "type": "string", "format": "date-time" }
      },
      "required": ["leg_id", "mode", "origin_locode", "destination_locode"]
    },
    "charge": {
      "type": "object",
      "properties": {
        "charge_id": { "type": "string" },
        "kind": { "type": "string", "enum": ["buy", "sell"] },
        "code": { "type": "string", "description": "e.g., FRT, BAF, THC, DO" },
        "basis": { "type": "string", "enum": ["container", "kg", "cbm", "km", "shipment"] },
        "qty": { "type": "number" },
        "unit_price": { "type": "number" },
        "currency": { "type": "string", "pattern": "^[A-Z]{3}$" },
        "gl_code": { "type": "string" }
      },
      "required": ["charge_id", "kind", "code", "unit_price", "currency"]
    },
    "milestone": {
      "type": "object",
      "properties": {
        "milestone_id": { "type": "string" },
        "code": { "type": "string", "description": "e.g., ETD, ATD, ETA, ATA, POD" },
        "planned_at": { "type": "string", "format": "date-time" },
        "actual_at": { "type": "string", "format": "date-time" },
        "source": { "type": "string", "enum": ["system", "carrier", "manual"] },
        "proof_ref": { "type": "string" }
      },
      "required": ["milestone_id", "code"]
    },
    "risk": {
      "type": "object",
      "properties": {
        "risk_id": { "type": "string" },
        "type": { "type": "string", "enum": ["delay", "customs", "demurrage", "compliance"] },
        "level": { "type": "string", "enum": ["low", "medium", "high"] },
        "description": { "type": "string" },
        "mitigation_plan": { "type": "string" }
      },
      "required": ["risk_id", "type", "level"]
    }
  }
};

export default function ShipmentFileSchema() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ShipmentFile Canonical Schema v1</CardTitle>
        <Badge variant="secondary">/contracts/v1/shipmentfile.schema.json</Badge>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
          {JSON.stringify(schema, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}