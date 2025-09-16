import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const rolesConfig = `
# Defines portal roles and their permitted scopes/actions.
# Used for RLS policies and UI rendering.
# ASCII-only keys.

version: 1.0

roles:
  - id: CustomerUser
    name: Customer
    description: Standard customer user with access to their own shipments.
    scopes:
      - portal.shipments.read.own
      - portal.docs.upload.own
      - portal.cases.create.own
      - portal.billing.read.own
      - portal.billing.pay.own
    allowed_actions:
      - act_upload_docs
      - act_raise_case
      - act_pay_invoice
      - act_add_form_vgm

  - id: SupplierUser
    name: Supplier
    description: Supplier/carrier user with access to assigned bookings/shipments.
    scopes:
      - portal.bookings.read.assigned
      - portal.docs.upload.assigned
      - portal.cases.create.assigned
    allowed_actions:
      - act_confirm_booking
      - act_upload_pod

  - id: BrokerUser
    name: Customs Broker
    description: Broker with access to customs-related documents and data for assigned shipments.
    scopes:
      - portal.shipments.read.assigned
      - portal.customs.read.assigned
      - portal.docs.read.customs
      - portal.docs.upload.customs
    allowed_actions:
      - act_submit_declaration
      - act_upload_license
`;

export default function PortalRoles() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portal Permissions Matrix v1</CardTitle>
        <Badge variant="secondary">/portal/permissions/roles.yaml</Badge>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
          {rolesConfig.trim()}
        </pre>
      </CardContent>
    </Card>
  );
}