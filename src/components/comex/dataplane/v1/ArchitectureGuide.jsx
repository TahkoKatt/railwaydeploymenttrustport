
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ArchitectureGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Plane Architecture v1</CardTitle>
        <Badge variant="secondary">/docs/data-plane-architecture.md</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">1. Data Model: Star Schema</h3>
          <ul className="list-disc list-inside text-sm text-gray-600">
            <li>**Hechos:** fact_shipment, fact_booking, fact_docs, fact_settlement, etc.</li>
            <li>**Dimensiones:** dim_date, dim_customer, dim_carrier, dim_lane, dim_owner, etc.</li>
            <li>**Población:** CDC v1 events → Ingestor → Staging → MERGE to Facts/Dims (Idempotente).</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">2. Pipeline de Agregación y Cache</h3>
          <ul className="list-disc list-inside text-sm text-gray-600">
            <li>**Agregación:** Vistas Materializadas (MVs) SQL con refresh incremental (30-60s).</li>
            <li>**Windowing:** Funciones TUMBLE(5m) para alertas y KPIs de alta frecuencia.</li>
            <li>**Cache:** Redis con keys `kpi:&#123;profile&#125;:&#123;tenant&#125;:&#123;range&#125;` y TTL de 60-120s.</li>
            <li>**Invalidación:** Event-driven (e.g., `kpi.invalidate` topic).</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">3. SLOs de Rendimiento</h3>
          <ul className="list-disc list-inside text-sm text-gray-600">
            <li>**p95 Render (Dashboard):** &lt; 800 ms</li>
            <li>**p95 Query (Materialized View):** &lt; 200 ms</li>
            <li>**Cache Hit Rate:** &gt; 90%</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
