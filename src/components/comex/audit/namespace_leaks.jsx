import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const leaksData = `origen,destino,key,fix,file_location
shipping_instructions,comex.dashboard,layout.datasource,namespace: 'comex.shipping_instructions',pages/comex/si/layout.json
bl_awb,comex.shipping_instructions,panel.datasource,namespace: 'comex.bl_awb',pages/comex/bl/panel.json
liquidacion,comex.dashboard,grid.datasource,namespace: 'comex.liquidacion',pages/comex/liquidacion/grid.json`;

export default function NamespaceLeaks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>COMEX Content Audit - Namespace Leaks</CardTitle>
        <Badge variant="outline">namespace_leaks.csv</Badge>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto whitespace-pre-wrap">
          {leaksData}
        </pre>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Impact:</strong> Data contamination between modules causes "ghost dashboard" effect.</p>
          <p><strong>Fix:</strong> Ensure each module only references its own namespace.</p>
        </div>
      </CardContent>
    </Card>
  );
}