import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const widgetsConfig = {
  "comerciante": {
    "profile_name": "Comerciante",
    "dashboard_title": "Executive Dashboard",
    "kpi_grid": [
      "otd",
      "eta_accuracy",
      "net_margin",
      "dso_days",
      "cash_impact_30d",
      "dnd_risk_eur",
      "compliance_blocks_count",
      "ftr"
    ],
    "charts": [
      { "id": "margin_by_lane", "type": "bar", "title": "Margin by Lane" },
      { "id": "dso_trend", "type": "line", "title": "DSO Trend" },
      { "id": "cash_flow_forecast", "type": "waterfall", "title": "Cash Flow (30d)" }
    ],
    "alerts_panel": {
      "severity_colors": { "error": "#DB2142", "warn": "#6C7DF7", "info": "#00A878" },
      "default_filter": "severity=error|warn"
    },
    "default_filters": {
      "mode": ["ocean", "air"]
    }
  },
  "operador": {
    "profile_name": "Operador Logistico",
    "dashboard_title": "Operations Control Tower",
    "kpi_grid": [
      "otd",
      "eta_accuracy",
      "customs_lt_hours",
      "compliance_blocks_count",
      "booking_confirm_time",
      "rollover_rate",
      "3wm_pass_rate",
      "case_backlog"
    ],
    "charts": [
      { "id": "status_funnel_customs", "type": "funnel", "title": "Customs Funnel" },
      { "id": "milestones_timeline", "type": "timeline", "title": "Shipment Timeline" },
      { "id": "routes_map", "type": "map", "title": "Live Routes Map" }
    ],
    "alerts_panel": {
      "severity_colors": { "error": "#DB2142", "warn": "#6C7DF7", "info": "#00A878" },
      "default_filter": "status=active"
    },
    "default_filters": {
      "mode": ["ocean", "air", "road"]
    }
  }
};

export default function WidgetsConfig() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Widgets Config v1 (Persona-Aware)</CardTitle>
        <Badge variant="secondary">/data-plane/widgets_config/v1/comex.json</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">UI labels are ASCII-only as requested.</p>
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
          {JSON.stringify(widgetsConfig, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}