import React, { useEffect, useMemo } from 'react';
import KpiGrid from "@/components/rm/_shared/KpiGrid";
import AIPanelConnector from "@/components/rm/_shared/AIPanelConnector";
import FiltersBar from "@/components/rm/_shared/FiltersBar";
import { useRmOverlay } from "@/components/rm/overlays";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";

// H4: Component memoizado
const RmOpportunities = React.memo(() => {
  const { kpiOrder, defaultFilters, currentPersona } = useRmOverlay();

  const iaContext = useMemo(() => ({
      kpis: { gross_margin_pct: 28.5, win_rate: 34.2, time_to_quote_ms: 7200000, sla_quote_pct: 95, pipeline_weighted: 692000 },
      filters: { customer_id: null, stage: 'Propuesta' },
      snapshot_ts: new Date().toISOString()
  }), []);

  useEffect(() => {
    // H4: Métricas P95 para oportunidades
    const startTime = performance.now();
    
    window?.console?.log('rm:tab_view.opportunities', JSON.stringify({
      timestamp: new Date().toISOString(),
      user_id: 'current_user', 
      ts: Date.now(),
      module: 'rm',
      tab: 'opportunities'
    }));

    // H4: Medir first paint < 150ms
    requestAnimationFrame(() => {
      const duration = performance.now() - startTime;
      window?.console?.log('rm:metric', JSON.stringify({
        name: 'rm_opportunities_first_paint_ms',
        value: duration,
        timestamp: new Date().toISOString()
      }));
    });
  }, []);

  // H4: Mock data memoizado
  const mockOpportunities = useMemo(() => [
    { id: 1, account: 'Naviera Global', stage: 'Propuesta', amount: 185000, probability: 80, sla_resp: '2h', last_touch: '2 días' },
    { id: 2, account: 'Logística Express', stage: 'Negociacion', amount: 142000, probability: 65, sla_resp: '4h', last_touch: '1 día' }
  ], []);

  const getStageColor = useMemo(() => (stage) => {
    const colors = {
      'Nuevo': 'bg-blue-100 text-blue-800', 'Calificado': 'bg-purple-100 text-purple-800', 
      'Propuesta': 'bg-orange-100 text-orange-800', 'Negociacion': 'bg-yellow-100 text-yellow-800',
      'Cerrado': 'bg-green-100 text-green-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  }, []);

  return (
    <div className="space-y-6" style={{ 
      fontFamily: 'Montserrat, sans-serif'
    }}>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-gray-900 mb-2">
          Oportunidades
        </h1>
        <p className="text-[14px] text-gray-600">
          Pipeline comercial con filtros por perfil. State machine básica.
        </p>
      </div>

      <div data-kpi-container>
        <KpiGrid kpis={kpiOrder} />
      </div>

      <React.Suspense fallback={<div className="h-32 bg-gray-100 rounded-lg animate-pulse" />}>
        <AIPanelConnector tab="opportunities" persona={currentPersona} context={iaContext} />
      </React.Suspense>

      <FiltersBar 
        facets={['owner', 'stage', 'fecha']} 
        defaultFilters={defaultFilters}
        onChange={(filters) => window?.console?.log('Filters changed:', filters)}
      />

      <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
        <CardHeader><CardTitle>Pipeline de Oportunidades (mock data)</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Cuenta</th><th className="text-left py-3 px-4">Etapa</th>
                  <th className="text-left py-3 px-4">Monto</th><th className="text-left py-3 px-4">Prob. (win_likelihood%)</th>
                  <th className="text-left py-3 px-4">SLA Resp.</th><th className="text-left py-3 px-4">Último Toque</th>
                  <th className="text-left py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mockOpportunities.map(opp => (
                  <tr key={opp.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium">{opp.account}</td>
                    <td className="py-4 px-4"><Badge className={getStageColor(opp.stage)}>{opp.stage}</Badge></td>
                    <td className="py-4 px-4">€{opp.amount.toLocaleString()}</td>
                    <td className="py-4 px-4 text-green-600 font-semibold">{opp.probability}%</td>
                    <td className="py-4 px-4">{opp.sla_resp}</td>
                    <td className="py-4 px-4 text-gray-600">{opp.last_touch}</td>
                    <td className="py-4 px-4"><div className="flex gap-2"><Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button><Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

RmOpportunities.displayName = 'RmOpportunities';

export default RmOpportunities;