import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const collisionsData = `id_actual,modulos_afectados,id_sugerido,archivo_origen
kpi_grid,si|bl_awb|liquidacion,si_kpi_grid|bl_kpi_grid|liq_kpi_grid,pages/comex/shared/kpis.json
tbl_shipments,si|bl_awb,si_tbl_shipments|bl_tbl_docs,pages/comex/shared/table_shipments.json
milestones_timeline,si|liquidacion,si_milestones_timeline|liq_3wm_panel,pages/comex/shared/timeline.json
widget_status_panel,si|bl_awb,si_widget_last_updates|bl_widget_doc_preview,components/comex/shared/status.jsx`;

export default function IdCollisions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>COMEX Content Audit - ID Collisions</CardTitle>
        <Badge variant="destructive">High Priority</Badge>
        <Badge variant="secondary">id_collisions.csv</Badge>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto whitespace-pre-wrap">
          {collisionsData}
        </pre>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Root Cause:</strong> Shared components use generic IDs, causing singleton registration conflicts.</p>
          <p><strong>Quick Fix:</strong> Rename all generic IDs to module-prefixed versions.</p>
        </div>
      </CardContent>
    </Card>
  );
}