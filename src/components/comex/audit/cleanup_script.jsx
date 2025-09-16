import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CleanupScript() {
  const scriptContent = `# COMEX Content Cleanup Script

## Quick Fix (Copy-Paste Ready)

### Step 1: Rename Conflicting IDs

\`\`\`bash
# In pages/comex/shared/kpis.json
"kpi_grid" → "si_kpi_grid" (for SI module)
"kpi_grid" → "bl_kpi_grid" (for BL module)  
"kpi_grid" → "liq_kpi_grid" (for Liquidation module)

# In pages/comex/shared/table_shipments.json  
"tbl_shipments" → "si_tbl_shipments" (for SI)
"tbl_shipments" → "bl_tbl_docs" (for BL/AWB)

# In pages/comex/shared/timeline.json
"milestones_timeline" → "si_milestones_timeline" (for SI)
"milestones_timeline" → "bl_timeline_clearance" (for BL)
"milestones_timeline" → "liq_3wm_panel" (for Liquidation)
\`\`\`

### Step 2: Fix Namespace Leaks

\`\`\`json
// pages/comex/si/layout.json
{
  "datasource": "comex.shipping_instructions",  // NOT comex.dashboard
  "namespace": "comex.shipping_instructions"
}

// pages/comex/bl/panel.json  
{
  "datasource": "comex.bl_awb",  // NOT comex.shipping_instructions
  "namespace": "comex.bl_awb"
}

// pages/comex/liquidacion/grid.json
{
  "datasource": "comex.liquidacion",  // NOT comex.dashboard
  "namespace": "comex.liquidacion"  
}
\`\`\`

### Step 3: Enforce Tab Routing

\`\`\`json
// config/routes/comex.json
{
  "routing": {
    "url_pattern": "/comex?tab=si|bl_awb|liquidacion",
    "default_tab": "si",
    "enforce_tab_param": true
  }
}
\`\`\`

## Validation After Fix

### Test 1: No ID Collisions
- [ ] SI loads with si_kpi_grid
- [ ] BL/AWB loads with bl_kpi_grid  
- [ ] Liquidation loads with liq_kpi_grid
- [ ] No "ghost dashboard" appears in any tab

### Test 2: Namespace Isolation
- [ ] SI KPIs pull from comex.shipping_instructions
- [ ] BL KPIs pull from comex.bl_awb
- [ ] Liquidation KPIs pull from comex.liquidacion
- [ ] No cross-contamination between modules

### Test 3: Routing Consistency  
- [ ] /comex defaults to ?tab=si
- [ ] /comex?tab=bl_awb shows BL content only
- [ ] /comex?tab=liquidacion shows Liquidation content only
- [ ] No fallback to dashboard content

**Expected Result:** Each submódulo shows unique content, no visual duplicates.`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>COMEX Content Cleanup Script</CardTitle>
        <Badge variant="outline">Ready to Execute</Badge>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto whitespace-pre-wrap">
          {scriptContent}
        </pre>
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✅ Copy-Paste Ready</p>
          <p className="text-green-600 text-sm">Execute these changes to eliminate dashboard duplication issues.</p>
        </div>
      </CardContent>
    </Card>
  );
}