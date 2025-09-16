import React, { useState, useEffect } from "react";
import {
  DollarSign, Percent, Clock, FileCheck2, GitMerge, TrendingUp,
  Filter, RefreshCw, Zap, AlertTriangle, Tag, Layers, BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { toast } from "sonner";

// 1) ESTANDAR DE DISEÑO - TOKENS
const TRUSTPORT_TOKENS = {
  fonts: { primary: 'Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' },
  colors: {
    main_bg: '#F1F0EC',
    surface: '#FFFFFF',
    text_strong: '#1F2937',
    text_muted: '#6B7280',
    border: '#E5E7EB',
    primary: '#4472C4',
    primary_hover: '#3A61A6',
    success: '#00A878',
    warning: '#FFC857',
    danger: '#DA2242',
  },
  radius: '16px',
  shadow: '0 6px 18px rgba(0,0,0,0.06)',
};

// Helper para aplicar estilos de card consistentes
const getTrustportCardStyle = () => ({
  backgroundColor: TRUSTPORT_TOKENS.colors.surface,
  borderRadius: TRUSTPORT_TOKENS.radius,
  boxShadow: TRUSTPORT_TOKENS.shadow,
  fontFamily: TRUSTPORT_TOKENS.fonts.primary,
  border: `1px solid ${TRUSTPORT_TOKENS.colors.border}`,
});

// 2) COMPONENTES CANÓNICOS DEL DASHBOARD

// Componente Header
const HeaderBlock = ({ title, subtitle }) => (
  <div className="w-full">
    <h1 className="text-[28px] font-semibold" style={{ color: TRUSTPORT_TOKENS.colors.text_strong, fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
      {title}
    </h1>
    <p className="text-[14px]" style={{ color: TRUSTPORT_TOKENS.colors.text_muted }}>
      {subtitle}
    </p>
  </div>
);

// Componente Fila de Filtros
const FiltersRow = ({ onApply, onFilterChange, activeFilter }) => (
  <Card style={getTrustportCardStyle()}>
    <CardContent className="p-4 flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4" style={{ color: TRUSTPORT_TOKENS.colors.text_muted }} />
        <span className="text-sm font-medium" style={{ color: TRUSTPORT_TOKENS.colors.text_strong }}>Filtros:</span>
      </div>
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        {['Hoy', '24h', '7d', '30d'].map(period => (
          <button
            key={period}
            onClick={() => onFilterChange(period)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeFilter === period
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {period}
          </button>
        ))}
      </div>
      <Button
        onClick={onApply}
        style={{ backgroundColor: TRUSTPORT_TOKENS.colors.primary, color: TRUSTPORT_TOKENS.colors.surface }}
        className="hover:bg-blue-700"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Actualizar
      </Button>
    </CardContent>
  </Card>
);

// Componente Tarjeta KPI
const KPICard = ({ title, value, Icon, color, trend }) => (
  <Card className="hover:shadow-lg transition-shadow" style={getTrustportCardStyle()}>
    <CardContent className="p-5">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className="text-xs font-medium" style={{ color: TRUSTPORT_TOKENS.colors.text_muted }}>{title}</p>
          <p className="text-2xl font-semibold" style={{ color: TRUSTPORT_TOKENS.colors.text_strong }}>{value}</p>
        </div>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      {trend && (
        <p className={`text-xs font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className="inline w-3 h-3 mr-1" /> {trend}
        </p>
      )}
    </CardContent>
  </Card>
);

// Componente Panel de IA
const AIPanel = ({ insights, onCtaClick }) => (
  <Card style={{ ...getTrustportCardStyle(), backgroundColor: '#F0F5FF', borderColor: '#D6E4FF' }}>
    <CardHeader>
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5" style={{ color: TRUSTPORT_TOKENS.colors.primary }} />
        <CardTitle className="text-md font-semibold" style={{ color: TRUSTPORT_TOKENS.colors.primary }}>
          AI Insights & Recomendaciones
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map(insight => (
          <div key={insight.id} className="bg-white/50 rounded-lg p-4 flex flex-col justify-between">
            <div>
                <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <insight.icon className="w-4 h-4" style={{ color: TRUSTPORT_TOKENS.colors.primary }} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 text-sm">{insight.title}</h4>
                        <p className="text-xs text-blue-700 mt-1">{insight.desc}</p>
                    </div>
                </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-2 border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={() => onCtaClick(insight.cta.action)}
            >
              {insight.cta.label}
            </Button>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Componente Contenedor de Gráfico
const ChartCard = ({ title, children }) => (
  <Card style={getTrustportCardStyle()}>
    <CardHeader>
      <CardTitle className="text-md font-semibold" style={{ color: TRUSTPORT_TOKENS.colors.text_strong }}>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div style={{ height: '300px' }}>{children}</div>
    </CardContent>
  </Card>
);


// 3) COMPONENTE PRINCIPAL DEL DASHBOARD
export default function DashboardCompras() {
  const [filters, setFilters] = useState({ date_quick: '7d' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulación de carga de datos basada en JSON canónico
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const kpiCatalog = {
        spend_ytd: { label: "Spend YTD", format: "currency", Icon: DollarSign, color: TRUSTPORT_TOKENS.colors.primary },
        savings_rate: { label: "Savings rate", format: "percentage", Icon: Percent, color: TRUSTPORT_TOKENS.colors.success },
        ocf_h: { label: "OCF (h)", format: "hours", Icon: Clock, color: TRUSTPORT_TOKENS.colors.warning },
        asn_coverage: { label: "ASN coverage", format: "percentage", Icon: FileCheck2, color: TRUSTPORT_TOKENS.colors.primary },
        match_3w: { label: "3W match", format: "percentage", Icon: GitMerge, color: TRUSTPORT_TOKENS.colors.success },
        t2p_h: { label: "T2P (h)", format: "hours", Icon: Clock, color: TRUSTPORT_TOKENS.colors.warning },
      };

      const seedData = {
        kpis: {
          spend_ytd: 12500000,
          savings_rate: 0.082,
          ocf_h: 46,
          asn_coverage: 0.92,
          match_3w: 0.96,
          t2p_h: 52,
        },
        charts: {
          spend_by_category: [{ name: 'Fletes', value: 400000 }, { name: 'IT', value: 300000 }, { name: 'Marketing', value: 200000 }, { name: 'Oficina', value: 100000 }],
          p2p_throughput_hourly: [
            { hour: "08:00", po_sent: 45, grn: 20 }, { hour: "10:00", po_sent: 55, grn: 30 },
            { hour: "12:00", po_sent: 60, grn: 40 }, { hour: "14:00", po_sent: 50, grn: 35 },
            { hour: "16:00", po_sent: 70, grn: 55 },
          ],
          commitments_pipeline: [
            { stage: 'Budget', value: 1000000 }, { stage: 'PO', value: 850000 },
            { stage: 'GRN', value: 820000 }, { stage: 'AP Posted', value: 815000 },
          ],
        },
        ai_insights: [
          { id: 'stock_critico', icon: AlertTriangle, title: 'Stock critico', desc: 'SKUs bajo minimo. Riesgo de stockout en 2-3 dias.', cta: { label: 'Reponer ahora', action: 'open_replenishment' } },
          { id: 'oportunidad_tarifa', icon: Tag, title: 'Oportunidad tarifa', desc: 'Lane sin tarifa vigente. Ahorro potencial 6-12%.', cta: { label: 'Enviar RFQ', action: 'open_rfq' } },
          { id: 'invoice_mismatch', icon: Layers, title: 'Invoice mismatch', desc: 'Diferencias detectadas en 3W por linea.', cta: { label: 'Abrir Match', action: 'open_3w_match' } },
        ],
      };

      const formattedKpis = Object.keys(seedData.kpis).map(key => {
          const kpiDef = kpiCatalog[key];
          const rawValue = seedData.kpis[key];
          let formattedValue = rawValue;
          if (kpiDef.format === 'currency') formattedValue = `€${(rawValue / 1000000).toFixed(1)}M`;
          if (kpiDef.format === 'percentage') formattedValue = `${(rawValue * 100).toFixed(1)}%`;
          if (kpiDef.format === 'hours') formattedValue = `${rawValue}h`;
          return { ...kpiDef, id: key, value: formattedValue };
      });
      
      setData({ ...seedData, formattedKpis });
      setLoading(false);
      toast.success("Dashboard actualizado");
    }, 500);
  }, [filters]);

  const handleCta = (action) => {
    toast.info(`Ejecutando accion IA: ${action}`);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen" style={{ backgroundColor: TRUSTPORT_TOKENS.colors.main_bg }}><RefreshCw className="w-8 h-8 animate-spin" style={{color: TRUSTPORT_TOKENS.colors.primary}} /></div>;
  }

  return (
    <div className="space-y-6 p-6" style={{ backgroundColor: TRUSTPORT_TOKENS.colors.main_bg }}>
      <HeaderBlock title="Compras — Dashboard" subtitle="Vista ejecutiva P2P: gasto, ahorro, ciclo, excepciones" />
      
      <FiltersRow
        activeFilter={filters.date_quick}
        onFilterChange={(period) => setFilters(prev => ({ ...prev, date_quick: period }))}
        onApply={() => setFilters(prev => ({ ...prev }))} // Forces re-fetch
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {data.formattedKpis.map(kpi => (
          <KPICard
            key={kpi.id}
            title={kpi.label}
            value={kpi.value}
            Icon={kpi.Icon}
            color={kpi.color}
          />
        ))}
      </div>

      <AIPanel insights={data.ai_insights} onCtaClick={handleCta} />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ChartCard title="Spend Cube - categorias">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.charts.spend_by_category} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12, fill: TRUSTPORT_TOKENS.colors.text_muted }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }} />
              <Bar dataKey="value" fill={TRUSTPORT_TOKENS.colors.primary} radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Throughput P2P por hora">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.charts.p2p_throughput_hourly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }}/>
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="po_sent" name="PO Enviadas" stroke="#8884d8" />
              <Line type="monotone" dataKey="grn" name="GRN" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Commitments Pipeline">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.charts.commitments_pipeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }}/>
              <Tooltip />
              <Bar dataKey="value" fill={TRUSTPORT_TOKENS.colors.success} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}