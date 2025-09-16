import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mjmlTemplate = `
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="20px" font-weight="bold">Welcome to the Trustport Portal</mj-text>
        <mj-text>Hello {{userName}},</mj-text>
        <mj-text>You have been invited to collaborate on your shipments. Please click the button below to set up your account and get started.</mj-text>
        <mj-button href="{{magicLink}}" background-color="#000000">Access Portal</mj-button>
        <mj-text>This link is valid for 24 hours and can only be used once.</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;

export default function InviteEmailTemplate() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Template: Portal Invite</CardTitle>
        <Badge variant="secondary">/portal/emails/invite.mjml</Badge>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
          {mjmlTemplate.trim()}
        </pre>
      </CardContent>
    </Card>
  );
}