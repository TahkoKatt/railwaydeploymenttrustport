import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const overlayData = {
  "profile": "comerciante",
  "version": "1.0",
  "presets": {
    "dashboard": {
      "kpis": [
        "otd_pct",
        "eta_accuracy",
        "customs_lead_time_avg",
        "margin_per_shipment_avg",
        "dnd_risk_eur",
        "dso_avg"
      ],
      "quick_actions": [
        "create_si",
        "export_global_report"
      ]
    },
    "shipment_list": {
      "columns": [
        "shipment_id",
        "status",
        "mode",
        "origin_locode",
        "destination_locode",
        "eta",
        "customer_name"
      ],
      "filters": [
        "status",
        "mode",
        "customer_id"
      ]
    }
  }
};

export default function ComercianteOverlays() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overlay Presets v1: Comerciante</CardTitle>
        <Badge variant="secondary">/overlays/v1/comerciante.json</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-2">
          Configuraciones de UI por defecto para el perfil "Comerciante", referenciando solo claves canónicas.
        </p>
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto">
          {JSON.stringify(overlayData, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}