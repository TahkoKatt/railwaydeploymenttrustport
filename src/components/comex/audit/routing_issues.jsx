import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const routingData = `path,tab,fallback_detectado,fix,priority
/comex,si,missing_default_tab,Add routing.default_tab='si',medium
/comex,bl_awb,missing_default_tab,Add routing.default_tab='bl_awb',medium  
/comex,liquidacion,missing_default_tab,Add routing.default_tab='liquidacion',medium
/comex?tab=*,*,ambiguous_pattern,Ensure ?tab param is always set in subnav,high`;

export default function RoutingIssues() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>COMEX Content Audit - Routing Issues</CardTitle>
        <Badge variant="secondary">routing_issues.csv</Badge>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto whitespace-pre-wrap">
          {routingData}
        </pre>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Issue:</strong> Ambiguous routing patterns cause fallback to wrong views.</p>
          <p><strong>Solution:</strong> Enforce explicit tab parameter in all navigation.</p>
        </div>
      </CardContent>
    </Card>
  );
}