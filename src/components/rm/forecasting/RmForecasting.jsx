import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import KpiGrid from "@/components/rm/_shared/KpiGrid";
import AIPanel from "@/components/_shared/AIPanel";
import { aiInsightsRM_Forecasting } from "@/components/rm/_shared/aiMocks";
import { useRmOverlay } from "@/components/rm/overlays";
import { AlertTriangle, Calendar, DollarSign, TrendingUp } from "lucide-react";

// H4: Component memoizado
const RmForecasting = React.memo(() => {
  const { currentPersona } = useRmOverlay();
  const [probabilityAdjust, setProbabilityAdjust] = useState([0]);

  useEffect(() => {
    // H4: Métricas de performance
    const startTime = performance.now();
    
    window?.console?.log('rm:tab_view.forecasting', JSON.stringify({
      timestamp: new Date().toISOString(),
      user_id: 'current_user',
      ts: Date.now(),
      module: 'rm',
      tab: 'forecasting'
    }));

    requestAnimationFrame(() => {
      const duration = performance.now() - startTime;
      window?.console?.log('rm:metric', JSON.stringify({
        name: 'rm_forecast_view_ms',
        value: duration,
        timestamp: new Date().toISOString()
      }));
    });
  }, []);

  // H4: Data memoizada
  const baselineData = useMemo(() => ({
    forecast_total: 890000, pipeline_weighted: 692000,
    coverage: 86.7, slipped: 12
  }), []);

  const whatIfData = useMemo(() => {
    const adjustment = probabilityAdjust[0];
    const multiplier = 1 + (adjustment / 100);
    
    return {
      forecast_total: Math.round(baselineData.forecast_total * multiplier),
      pipeline_weighted: Math.round(baselineData.pipeline_weighted * multiplier),
      coverage: Math.round(baselineData.coverage * multiplier * 10) / 10,
      slipped: Math.max(0, baselineData.slipped - Math.round(adjustment / 2))
    };
  }, [probabilityAdjust, baselineData]);

  const forecastKpis = useMemo(() => [
    { id: 'forecast_total', label: 'Forecast Total', value: `€${Math.round(whatIfData.forecast_total / 1000)}K`, delta: probabilityAdjust[0] !== 0 ? `${probabilityAdjust[0] > 0 ? '+' : ''}${probabilityAdjust[0]}pp` : null, icon: DollarSign, color: '#4472C4' },
    { id: 'pipeline_weighted', label: 'Pipeline Weighted', value: `€${Math.round(whatIfData.pipeline_weighted / 1000)}K`, delta: probabilityAdjust[0] !== 0 ? `${probabilityAdjust[0] > 0 ? '+' : ''}${Math.round(probabilityAdjust[0] * 0.8)}pp` : null, icon: TrendingUp, color: '#00A878' },
    { id: 'coverage', label: 'Cobertura', value: `${whatIfData.coverage}%`, delta: probabilityAdjust[0] !== 0 ? `${probabilityAdjust[0] > 0 ? '+' : ''}${Math.round(probabilityAdjust[0] * 0.5)}pp` : null, icon: Calendar, color: '#FFC857' },
    { id: 'slipped', label: 'Slipped', value: whatIfData.slipped.toString(), delta: probabilityAdjust[0] !== 0 ? `${whatIfData.slipped - baselineData.slipped}` : null, icon: AlertTriangle, color: '#DB2142' }
  ], [whatIfData, probabilityAdjust, baselineData]);

  const hygieneChecks = useMemo(() => [
    { label: 'Sin fecha cierre', count: 8, status: 'warning' },
    { label: 'Monto nulo', count: 3, status: 'error' },
    { label: 'Stale >14d', count: 12, status: 'warning' }
  ], []);

  const getStatusColor = (status) => status === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';

  return (
    <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-gray-900 mb-2">
          Forecasting
        </h1>
        <p className="text-[14px] text-gray-600">
          Forecast ponderado con what-if analysis y checklist de higiene.
        </p>
      </div>

      <div data-kpi-container>
        <KpiGrid kpis={forecastKpis} />
      </div>

      <AIPanel insights={aiInsightsRM_Forecasting} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader><CardTitle>What-If Analysis</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Ajuste de Probabilidad: {probabilityAdjust[0]}%</label>
              <Slider value={probabilityAdjust} onValueChange={setProbabilityAdjust} min={-10} max={10} step={1} className="w-full" />
            </div>
            <div className="text-sm text-gray-600"><p>Mueve el slider para simular cambios en probabilidades del pipeline.</p><p className="mt-2">Los KPIs se recalculan en tiempo real sin llamadas de red.</p></div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader><CardTitle>Checklist de Higiene</CardTitle></CardHeader>
          <CardContent><div className="space-y-3">{hygieneChecks.map((check, index) => (<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><span className="text-sm font-medium">{check.label}</span><Badge className={getStatusColor(check.status)}>{check.count}</Badge></div>))}</div></CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
        <CardHeader><CardTitle>Evolución del Forecast</CardTitle></CardHeader>
        <CardContent><div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg"><p>Chart Placeholder (no network, mocks-only)</p></div></CardContent>
      </Card>
    </div>
  );
});

RmForecasting.displayName = 'RmForecasting';

export default RmForecasting;