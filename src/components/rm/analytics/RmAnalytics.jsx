import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Filter, DollarSign, Percent, TrendingUp, Clock, Users, Eye, AlertTriangle, Package, Target } from 'lucide-react';
import { useRmOverlay } from "@/components/rm/overlays";

// Design tokens siguiendo el estándar Trustport
const TRUSTPORT_TOKENS = {
  fonts: { primary: 'Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' },
  colors: {
    main_bg: '#F1F0EC',
    surface: '#FFFFFF', 
    text_strong: '#1F2937',
    text_muted: '#6B7280',
    primary: '#4472C4',
    radius: '16px',
    shadow: '0 6px 18px rgba(0,0,0,0.06)'
  }
};

// Mocks de KPIs
const kpiMocks = {
  mc_pct: { label: "MC %", value: 23.4, unit: "%", icon: Percent, color: '#00A878' },
  mn_eur: { label: "MN €", value: 12480, unit: "€", icon: DollarSign, color: '#4472C4' },
  rev_teu_km: { label: "Rev/TEU-KM", value: 0.92, unit: "€", icon: TrendingUp, color: '#6C7DF7' },
  util_pct: { label: "Util %", value: 87, unit: "%", icon: Target, color: '#FFC857' },
  take_rate: { label: "Take Rate", value: 12.5, unit: "%", icon: Package, color: '#DB2142' },
  dso_d: { label: "DSO", value: 42, unit: "d", icon: Clock, color: '#6B7280' }
};

// AI Insights mocks
const aiInsightsMocks = [
  {
    id: 'margen_bajo_abc',
    icon: AlertTriangle,
    title: 'Margen bajo ABC',
    desc: '7 operaciones < umbral',
    cta: { label: 'Revisar pricing', action: 'open_pricing_review' }
  },
  {
    id: 'bundle_seguro', 
    icon: Package,
    title: 'Bundle seguro',
    desc: '10 clientes con alta propensión',
    cta: { label: 'Proponer paquete', action: 'open_bundle_proposal' }
  },
  {
    id: 'dso_riesgo',
    icon: Clock,
    title: 'DSO riesgo',
    desc: '5 cuentas > 60 días',
    cta: { label: 'Plan cobranza', action: 'open_collection_plan' }
  }
];

// Mocks de datos por vista
const mockData = {
  cliente: [
    { cliente: 'Gadgets Iberia SL', revenue: 98400, mc_pct: 24.1, mn_eur: 14200, take_rate: 13.2, dso_d: 38, win_rate: 34, envios: 21 },
    { cliente: 'TextilNova SA', revenue: 76900, mc_pct: 18.7, mn_eur: 7450, take_rate: 10.8, dso_d: 55, win_rate: 29, envios: 17 },
    { cliente: 'Quimex EU', revenue: 64300, mc_pct: 26.3, mn_eur: 12900, take_rate: 15.1, dso_d: 61, win_rate: 22, envios: 12 }
  ],
  trafico: [
    { lane: 'SHA→VLC', rev_teu_km: 1.08, util_pct: 91, mc_pct: 27, mn_eur: 6120, envios: 9 },
    { lane: 'VLC→CALLAO', rev_teu_km: 0.83, util_pct: 86, mc_pct: 19, mn_eur: 3980, envios: 7 },
    { lane: 'SANTOS→HAM', rev_teu_km: 0.71, util_pct: 79, mc_pct: 16, mn_eur: 2380, envios: 6 }
  ],
  servicio: [
    { servicio: 'FCL', revenue: 142000, mc_pct: 22, abc_unit: 38, mn_eur: 11400, envios: 18 },
    { servicio: 'LCL', revenue: 58300, mc_pct: 25, abc_unit: 21, mn_eur: 7100, envios: 13 },
    { servicio: 'Aereo', revenue: 39800, mc_pct: 19, abc_unit: 44, mn_eur: 4500, envios: 8 }
  ]
};

// Definición de columnas por vista
const columnConfig = {
  cliente: [
    { key: 'cliente', label: 'Cliente' },
    { key: 'revenue', label: 'Revenue', format: 'currency' },
    { key: 'mc_pct', label: 'MC %', format: 'percentage' },
    { key: 'mn_eur', label: 'MN €', format: 'currency' },
    { key: 'take_rate', label: 'Take Rate', format: 'percentage' },
    { key: 'dso_d', label: 'DSO', format: 'days' },
    { key: 'win_rate', label: 'Win Rate', format: 'percentage' },
    { key: 'envios', label: 'Envíos' },
    { key: 'acciones', label: 'Acciones' }
  ],
  trafico: [
    { key: 'lane', label: 'Lane' },
    { key: 'rev_teu_km', label: 'Rev/TEU-KM', format: 'currency_decimal' },
    { key: 'util_pct', label: 'Util %', format: 'percentage_int' },
    { key: 'mc_pct', label: 'MC %', format: 'percentage_int' },
    { key: 'mn_eur', label: 'MN €', format: 'currency' },
    { key: 'envios', label: 'Envíos' },
    { key: 'acciones', label: 'Acciones' }
  ],
  servicio: [
    { key: 'servicio', label: 'Servicio' },
    { key: 'revenue', label: 'Revenue', format: 'currency' },
    { key: 'mc_pct', label: 'MC %', format: 'percentage_int' },
    { key: 'abc_unit', label: 'ABC/Unit', format: 'currency' },
    { key: 'mn_eur', label: 'MN €', format: 'currency' },
    { key: 'envios', label: 'Envíos' },
    { key: 'acciones', label: 'Acciones' }
  ]
};

const RmAnalytics = React.memo(() => {
  const { currentPersona } = useRmOverlay();
  
  // Estados locales
  const [periodo, setPeriodo] = useState('7d');
  const [vista, setVista] = useState(currentPersona === 'comerciante' ? 'cliente' : 'trafico');

  // Orden de KPIs según perfil
  const kpiOrder = useMemo(() => {
    const orders = {
      comerciante: ['mn_eur', 'mc_pct', 'take_rate', 'rev_teu_km', 'util_pct', 'dso_d'],
      operador_logistico: ['util_pct', 'rev_teu_km', 'mc_pct', 'mn_eur', 'take_rate', 'dso_d']
    };
    return orders[currentPersona] || orders.comerciante;
  }, [currentPersona]);

  // Telemetría
  useEffect(() => {
    // Emitir evento de vista inicial
    window?.console?.log('ingresos:analytics:view', {
      timestamp: new Date().toISOString(),
      user_id: 'current_user',
      persona: currentPersona,
      vista_inicial: vista
    });

    // Medir rendimiento
    const startTime = performance.now();
    requestAnimationFrame(() => {
      const renderTime = performance.now() - startTime;
      window?.console?.log('ingresos:analytics:render_time', { renderTime });
    });
  }, [currentPersona, vista]);

  // Telemetría al cambiar vista
  const handleVistaChange = (newVista) => {
    window?.console?.log('ingresos:analytics:change_view', {
      timestamp: new Date().toISOString(),
      from: vista,
      to: newVista,
      persona: currentPersona
    });
    setVista(newVista);
  };

  // Formatear valores según tipo
  const formatValue = (value, format) => {
    if (value === null || value === undefined) return '-';
    
    switch (format) {
      case 'currency':
        return `€${(value / 1000).toFixed(0)}K`;
      case 'currency_decimal':
        return `€${value.toFixed(2)}`;
      case 'percentage':
        return `${value}%`;
      case 'percentage_int':
        return `${Math.round(value)}%`;
      case 'days':
        return `${value} d`;
      default:
        return value;
    }
  };

  const formatKpiValue = (kpi) => {
    const { value, unit } = kpi;
    switch (unit) {
      case '€':
        return `€${(value / 1000).toFixed(0)}K`;
      case '%':
        return `${value}%`;
      case 'd':
        return `${value} d`;
      default:
        return `€${value.toFixed(2)}`;
    }
  };

  const handleAIAction = (action) => {
    const actions = {
      open_pricing_review: 'Abriendo revisión de pricing',
      open_bundle_proposal: 'Generando propuesta de bundle',
      open_collection_plan: 'Creando plan de cobranza'
    };
    console.log(actions[action] || `Acción: ${action}`);
  };

  return (
    <div style={{ 
      backgroundColor: TRUSTPORT_TOKENS.colors.main_bg,
      minHeight: '100vh',
      fontFamily: TRUSTPORT_TOKENS.fonts.primary
    }}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900">Analytics</h1>
            <p className="text-[14px] text-gray-600">KPIs de RM y ABC</p>
          </div>
          <Link to="/ingresos?tab=cotizaciones">
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Cotizaciones (legacy)
            </Button>
          </Link>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpiOrder.map(kpiKey => {
            const kpi = kpiMocks[kpiKey];
            const Icon = kpi.icon;
            
            return (
              <Card 
                key={kpiKey} 
                className="hover:shadow-lg transition-shadow"
                style={{
                  backgroundColor: TRUSTPORT_TOKENS.colors.surface,
                  borderRadius: TRUSTPORT_TOKENS.colors.radius,
                  boxShadow: TRUSTPORT_TOKENS.colors.shadow
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-600 truncate">{kpi.label}</p>
                      <p className="text-xl font-semibold text-gray-900 truncate">
                        {formatKpiValue(kpi)}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${kpi.color}20` }}>
                      <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI Panel */}
        <Card style={{ 
          backgroundColor: '#F0F5FF', 
          borderColor: '#D6E4FF',
          borderRadius: TRUSTPORT_TOKENS.colors.radius,
          boxShadow: TRUSTPORT_TOKENS.colors.shadow
        }}>
          <CardHeader>
            <CardTitle className="text-md font-semibold text-blue-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              AI Insights & Recomendaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiInsightsMocks.map(insight => (
                <div key={insight.id} className="bg-white/50 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <insight.icon className="w-4 h-4" style={{ color: TRUSTPORT_TOKENS.colors.primary }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-blue-900 text-sm">{insight.title}</h4>
                      <p className="text-xs text-blue-700 mt-1">{insight.desc}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                    onClick={() => handleAIAction(insight.cta.action)}
                  >
                    {insight.cta.label}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Toolbar */}
        <Card style={{
          backgroundColor: TRUSTPORT_TOKENS.colors.surface,
          borderRadius: TRUSTPORT_TOKENS.colors.radius,
          boxShadow: TRUSTPORT_TOKENS.colors.shadow
        }}>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filtros:</span>
              </div>
              
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoy">Hoy</SelectItem>
                  <SelectItem value="7d">7d</SelectItem>
                  <SelectItem value="30d">30d</SelectItem>
                  <SelectItem value="YTD">YTD</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              <Select value={vista} onValueChange={handleVistaChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Vista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="trafico">Tráfico</SelectItem>
                  <SelectItem value="servicio">Servicio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card style={{
          backgroundColor: TRUSTPORT_TOKENS.colors.surface,
          borderRadius: TRUSTPORT_TOKENS.colors.radius,
          boxShadow: TRUSTPORT_TOKENS.colors.shadow
        }}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold capitalize">
              Vista por {vista}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {columnConfig[vista].map(col => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockData[vista].map((row, index) => (
                  <TableRow key={index}>
                    {columnConfig[vista].map(col => (
                      <TableCell key={col.key}>
                        {col.key === 'acciones' ? (
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                            Abrir
                          </Button>
                        ) : (
                          formatValue(row[col.key], col.format)
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Charts Grid (Placeholder) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {['waterfall_margen_neto', 'pareto_clientes', 'heatmap_yield', 'scatter_util_vs_mc'].map(chartId => (
            <Card 
              key={chartId}
              style={{
                backgroundColor: TRUSTPORT_TOKENS.colors.surface,
                borderRadius: TRUSTPORT_TOKENS.colors.radius,
                boxShadow: TRUSTPORT_TOKENS.colors.shadow
              }}
            >
              <CardHeader>
                <CardTitle className="text-md font-semibold capitalize">
                  {chartId.replace(/_/g, ' ')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Chart Placeholder</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
});

RmAnalytics.displayName = 'RmAnalytics';

export default RmAnalytics;