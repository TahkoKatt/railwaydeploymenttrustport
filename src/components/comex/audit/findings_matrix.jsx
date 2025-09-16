import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const findingsData = `file,line,issue,severity,impact,quick_fix
pages/comex/shared/kpis.json,-,Duplicate ID 'kpi_grid',high,Singleton widgets collide across modules,Prefix per module (si_kpi_grid|bl_kpi_grid|liq_kpi_grid)
pages/comex/shared/table_shipments.json,-,Duplicate ID 'tbl_shipments',high,Cross-module singleton causes ghost dashboard,Rename to si_tbl_shipments
pages/comex/shared/timeline.json,-,Duplicate ID 'milestones_timeline',high,Timeline mounts as singleton,Rename to si_milestones_timeline|bl_timeline_clearance|liq_3wm_panel
pages/comex/si/layout.json,-,Namespace leak 'comex.dashboard',medium,Global contamination duplicates dashboard,Set namespace 'comex.shipping_instructions'
config/routes/comex.json,-,Missing routing.default_tab,low,Inconsistent initial render,default_tab='si'
components/comex/shared/widgets.jsx,15,Import collision on registerWidget,high,Same widget ID overwrites previous registration,Use unique IDs with module prefix
overlays/comerciante.json,-,Correct references confirmed,none,No issues found,No action needed
overlays/operador.json,-,Correct references confirmed,none,No issues found,No action needed`;

export default function FindingsMatrix() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>COMEX Content Audit - Findings Matrix</CardTitle>
        <Badge variant="secondary">findings_matrix.csv</Badge>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto whitespace-pre-wrap">
          {findingsData}
        </pre>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Usage:</strong> Copy the content above and save as findings_matrix.csv for spreadsheet analysis.</p>
        </div>
      </CardContent>
    </Card>
  );
}