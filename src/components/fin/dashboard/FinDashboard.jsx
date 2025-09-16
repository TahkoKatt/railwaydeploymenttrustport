import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, AlertTriangle, Target, Clock } from 'lucide-react';
import DashboardShell from '../shared/DashboardShell';
import overlaysConfig from '../config/overlays.json';

// Mock data for KPIs
const mockKPIs = [
  { key: 'cash_today', label: 'Cash hoy', value: 125680, format: 'currency', icon: DollarSign, color: '#4472C4', delta: '+12K' },
  { key: 'cash_90d', label: 'Cash 90d', value: 487200, format: 'currency', icon: TrendingUp, color: '#00A878', delta: '+8%' },
  { key: 'ar_open', label: 'AR', value: 234500, format: 'currency', icon: Target, color: '#FFC857', delta: '-5K' },
  { key: 'ap_open', label: 'AP', value: 156780, format: 'currency', icon: AlertTriangle, color: '#DB2142', delta: '+15K' },
  { key: 'dso', label: 'DSO', value: 42, format: 'days', icon: Calendar, color: '#6C7DF7', delta: '-3d' },
  { key: 'dpo', label: 'DPO', value: 35, format: 'days', icon: Clock, color: '#6B7280', delta: '+2d' }
];

// Mock widgets
const mockWidgets = [
  { type: 'line_chart', key: 'cash_trend_12m', title: 'Tendencia Cash 12M', data: [] },
  { type: 'aging_chart', key: 'ar_aging', title: 'Aging AR', data: [] },
  { type: 'waterfall', key: 'pl_bridge', title: 'P&L Bridge', data: [] },
  {
    type: 'simulator',
    key: 'what_if',
    title: 'Simulador What-If',
    controls: [
      { name: 'ventas_pct', type: 'slider', min: -20, max: 20, unit: '%', value: 0 },
      { name: 'dso_delta', type: 'slider', min: -15, max: 15, unit: 'd', value: 0 },
      { name: 'dpo_delta', type: 'slider', min: -15, max: 15, unit: 'd', value: 0 },
      { name: 'fx_pct', type: 'slider', min: -10, max: 10, unit: '%', value: 0 }
    ],
    output: 'cash_delta_90d',
    ctas: [
      { label: 'Plan de cobros', action: 'emit:fin.ar.plan.create' },
      { label: 'Optimizar pagos', action: 'emit:fin.ap.batch.optimize' }
    ]
  }
];

// Mock AI insights
const mockAIInsights = [
  {
    id: 'cash_forecast',
    icon: TrendingUp,
    title: 'Cash Forecast',
    desc: 'Deficit esperado de €25K en semana 3. Acelerar cobros.',
    cta: { label: 'Ver plan', action: 'open_cash_plan' }
  },
  {
    id: 'allocator',
    icon: Target,
    title: 'Allocator',
    desc: '12 facturas listas para aplicar a pagos pendientes.',
    cta: { label: 'Aplicar ahora', action: 'open_allocator' }
  },
  {
    id: 'dunning',
    icon: AlertTriangle,
    title: 'Dunning',
    desc: '5 clientes > 60 días requieren escalamiento.',
    cta: { label: 'Procesar', action: 'open_dunning' }
  },
  {
    id: 'three_way_match',
    icon: Clock,
    title: '3-Way Match',
    desc: '8 facturas con discrepancias menores pendientes.',
    cta: { label: 'Revisar', action: 'open_3wm' }
  }
];

const FinDashboard = ({ persona = 'comerciante', debug = false }) => {
  const [currentPersona, setCurrentPersona] = useState(persona);
  const [kpis, setKpis] = useState(mockKPIs);
  const [widgets, setWidgets] = useState(mockWidgets);

  // Get persona-specific overlays
  const getPersonaConfig = () => {
    return overlaysConfig.dashboard[currentPersona] || {};
  };

  // Apply persona overlays to KPIs
  const getEffectiveKPIs = () => {
    const personaConfig = getPersonaConfig();
    let effectiveKPIs = [...kpis];
    
    // Add persona-specific KPIs
    if (personaConfig.kpi_add) {
      const additionalKPIs = personaConfig.kpi_add.map((kpi, index) => ({
        ...kpi,
        value: Math.floor(Math.random() * 100), // Mock values
        icon: Target,
        color: '#6C7DF7',
        delta: `+${Math.floor(Math.random() * 10)}`
      }));
      effectiveKPIs = [...effectiveKPIs, ...additionalKPIs];
    }
    
    return effectiveKPIs;
  };

  // Apply persona overlays to simulator
  const getEffectiveWidgets = () => {
    const personaConfig = getPersonaConfig();
    return widgets.map(widget => {
      if (widget.type === 'simulator' && personaConfig.simulator_add) {
        return {
          ...widget,
          controls: [
            ...widget.controls,
            ...personaConfig.simulator_add.map(control => ({
              ...control,
              value: control.type === 'toggle' ? false : 0
            }))
          ]
        };
      }
      return widget;
    });
  };

  // Get active AI insights based on persona config
  const getActiveAIInsights = () => {
    const personaConfig = getPersonaConfig();
    const activeIds = personaConfig.ia_on || [];
    
    return mockAIInsights.filter(insight => activeIds.includes(insight.id));
  };

  const handleAIAction = (action) => {
    console.log('[FIN-DASHBOARD] AI Action:', action);
    if (debug) {
      console.log('[FIN-DEBUG] AI Action triggered:', { action, persona: currentPersona });
    }
  };

  const handleSimulatorChange = (controlName, value) => {
    console.log('[FIN-DASHBOARD] Simulator change:', controlName, value);
  };

  const handleSimulatorAction = (action) => {
    console.log('[FIN-DASHBOARD] Simulator action:', action);
    // Emit events for actions
    if (action === 'emit:fin.ar.plan.create') {
      console.log('[FIN-EVENT] fin:ar.plan.create emitted');
    } else if (action === 'emit:fin.ap.batch.optimize') {
      console.log('[FIN-EVENT] fin:ap.batch.optimize emitted');
    }
  };

  useEffect(() => {
    setCurrentPersona(persona);
  }, [persona]);

  if (debug) {
    console.log('[FIN-DEBUG] FinDashboard render:', {
      persona: currentPersona,
      kpisCount: getEffectiveKPIs().length,
      widgetsCount: getEffectiveWidgets().length,
      aiInsightsCount: getActiveAIInsights().length
    });
  }

  return (
    <DashboardShell
      title="Finanzas — Dashboard"
      subtitle="KPIs de tesorería, cobros, pagos y simulador what-if"
      kpis={getEffectiveKPIs()}
      widgets={getEffectiveWidgets()}
      aiInsights={getActiveAIInsights()}
      onAIAction={handleAIAction}
      onSimulatorChange={handleSimulatorChange}
      onSimulatorAction={handleSimulatorAction}
      debug={debug}
    />
  );
};

export default FinDashboard;