import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import KpiGrid from "@/components/rm/_shared/KpiGrid";
import AIPanel from "@/components/_shared/AIPanel";
import { aiInsightsRM_Dashboard } from "@/components/rm/_shared/aiMocks";
import { useRmOverlay } from "@/components/rm/overlays";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Filter, TrendingUp, DollarSign, Percent, PieChart, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// H4: Component memoizado para evitar re-renders innecesarios
const RmDashboard = React.memo(() => {
  const { kpiOrder, currentPersona } = useRmOverlay();

  useEffect(() => {
    // H4: Métricas de performance sin setTimeout de demo
    const startTime = performance.now();
    
    window?.console?.log('rm:tab_view.dashboard', JSON.stringify({
      timestamp: new Date().toISOString(),
      user_id: 'current_user',
      ts: Date.now(),
      module: 'rm',
      tab: 'dashboard'
    }));

    // H4: Medir first paint real
    requestAnimationFrame(() => {
      const duration = performance.now() - startTime;
      window?.console?.log('rm:metric', JSON.stringify({
        name: 'rm_dashboard_first_paint_ms', 
        value: duration,
        timestamp: new Date().toISOString()
      }));
    });
  }, []);

  return (
    <div className="space-y-6" style={{ 
      fontFamily: 'Montserrat, sans-serif'
    }}>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-gray-900 mb-2">
          Ingresos — Dashboard
        </h1>
        <p className="text-[14px] text-gray-600">
          Vista ejecutiva del ciclo de ingresos: pipeline, cotizaciones y forecasting.
        </p>
      </div>

      <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 text-sm">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700">Filtros:</span>
            <Button variant="ghost" className="h-8 px-3 bg-gray-100">Hoy</Button>
            <Button variant="ghost" className="h-8 px-3">24h</Button>
            <Button variant="ghost" className="h-8 px-3">7d</Button>
            <Button variant="ghost" className="h-8 px-3">30d</Button>
            <Button className="h-8" style={{ backgroundColor: '#4472C4', color: 'white' }}>Actualizar</Button>
          </div>
        </CardContent>
      </Card>

      <div data-kpi-container>
        <KpiGrid kpis={kpiOrder} />
      </div>

      <AIPanel insights={aiInsightsRM_Dashboard} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader><CardTitle>Pipeline Revenue</CardTitle></CardHeader>
          <CardContent><div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg"><p>Chart Placeholder (mocks-only, no fetch)</p></div></CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
            <CardHeader><CardTitle>Top Oportunidades</CardTitle></CardHeader>
            <CardContent><div className="space-y-2 text-sm"><p>Naviera Global - €185K</p><p>Logística Express - €142K</p><p>Import Solutions - €98K</p></div></CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-200 shadow-sm" style={{ borderRadius: '16px' }}>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><ExternalLink className="w-4 h-4" />Acceso a Cierres (Legacy)</CardTitle></CardHeader>
            <CardContent><a href="/RevenueManagement?tab=cierres" data-quicklink="cierres-legacy" className="text-blue-600 hover:text-blue-800 underline text-sm">→ Abrir módulo Cierres legacy</a></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});

RmDashboard.displayName = 'RmDashboard';

export default RmDashboard;