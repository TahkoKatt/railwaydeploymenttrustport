import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const openApiYaml = `
openapi: 3.0.3
info:
  title: Trustport COMEX API
  version: "1.0"
  description: Canonical API for managing COMEX operations.
servers:
  - url: /api/comex/v1
paths:
  /shipmentfiles/{shipment_id}:
    get:
      summary: Get a Shipment File
      description: Retrieves a single shipment file by its canonical ID.
      operationId: getShipmentFileById
      parameters:
        - name: shipment_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ShipmentFile'
        '404':
          description: Shipment file not found
  /shipmentfiles:
    post:
      summary: Create a Shipment File
      description: Creates a new shipment file from a Shipping Instruction.
      operationId: createShipmentFile
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                si_id:
                  type: string
      responses:
        '201':
          description: Shipment file created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ShipmentFile'
components:
  schemas:
    ShipmentFile:
      type: object
      properties:
        shipment_id:
          type: string
        # ... other properties from shipmentfile.schema.json
`;

export default function OpenApiSpec() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>COMEX OpenAPI Specification v1</CardTitle>
        <Badge variant="secondary">/api/comex/v1/openapi.yaml</Badge>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-800 text-white p-4 rounded-md text-xs overflow-auto">
          {openApiYaml.trim()}
        </pre>
      </CardContent>
    </Card>
  );
}