
import React, { useState, useEffect } from "react";
import {
  DollarSign, Percent, Clock, FileCheck2, GitMerge, FileText, TrendingUp,
  Filter, Calendar, RefreshCw, Zap, Package, Tag, AlertTriangle, Layers,
  BarChart3, Download, Eye, CheckCircle, MoreHorizontal, User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { toast } from "sonner";

/*
ANALYTICS V2 (ACOPLAR + SAVINGS REHACER) - Step 8 RC Plan
Features: Spend Cube, Commitments Pipeline, Savings gobernado, lineage visible
Gate G6: lineage visible, KPIs alimentados, Savings con estados
*/

const TRUSTPORT_TOKENS = {
  fonts: { primary: 'Montserrat, sans-serif' },
  colors: {
    primary: '#4472C4',
    background: '#F1F0EC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    success: '#00A878',
    warning: '#FFC857',
    danger: '#DB2142',
  },
  spacing: { radius: '16px', shadow: '0 8px 24px rgba(0,0,0,.08)' }
};

const getTrustportCardStyle = () => ({
  backgroundColor: TRUSTPORT_TOKENS.colors.surface,
  borderRadius: TRUSTPORT_TOKENS.spacing.radius,
  boxShadow: TRUSTPORT_TOKENS.spacing.shadow,
  fontFamily: TRUSTPORT_TOKENS.fonts.primary
});

const getTrustportButtonStyle = (variant = 'primary') => {
  const base = { fontFamily: TRUSTPORT_TOKENS.fonts.primary, borderRadius: '8px' };
  if (variant === 'primary') {
    return { ...base, backgroundColor: TRUSTPORT_TOKENS.colors.primary, color: TRUSTPORT_TOKENS.colors.surface };
  }
  return base;
};

// Overlays por perfil
const personaConfig = {
  comerciante: {
    kpi_priority: ["spend_ytd", "savings_rate", "ocf_hours", "asn_coverage", "match_3w_pct", "t2p_hours"],
    ai_chips: ["stock_critico", "oportunidad_tarifa", "invoice_mismatch"],
  },
  operador_logistico: {
    kpi_priority: ["otd_pct", "match_3w_pct", "asn_coverage", "ack_time_hours"],
    ai_chips: ["expedite_ruta", "solicitar_epod", "completar_doc_gap"],
  }
};

const KPICard = ({ title, value, format, target, trend, Icon, color }) => {
  const formatValue = (val) => {
    if (val === null || val === undefined) return '-';
    switch (format) {
      case 'currency': return `€${(val / 1000000).toFixed(1)}M`;
      case 'percentage': return `${(val * 100).toFixed(1)}%`;
      case 'hours': return `${val}h`;
      default: return val;
    }
  };
  return (
    <Card className="hover:shadow-md transition-shadow" style={getTrustportCardStyle()}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{formatValue(value)}</p>
          </div>
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
        {trend && (
          <p className={`text-xs font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{trend}</p>
        )}
      </CardContent>
    </Card>
  );
};

const SavingsTrackerCard = ({ savings }) => {
  const totalProposed = savings.filter(s => s.status === 'proposed').reduce((sum, s) => sum + s.amount_eur, 0);
  const totalApproved = savings.filter(s => s.status === 'approved').reduce((sum, s) => sum + s.amount_eur, 0);
  const totalRealized = savings.filter(s => s.status === 'realized').reduce((sum, s) => sum + s.amount_eur, 0);

  return (
    <Card style={getTrustportCardStyle()}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Savings Tracker v2 (Gobernado)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-blue-600">€{totalProposed.toLocaleString('es-ES')}</p>
            <p className="text-sm text-gray-600">Propuesto</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-yellow-600">€{totalApproved.toLocaleString('es-ES')}</p>
            <p className="text-sm text-gray-600">Aprobado</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-green-600">€{totalRealized.toLocaleString('es-ES')}</p>
            <p className="text-sm text-gray-600">Realizado</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {savings.map((saving) => (
            <div key={saving.id} className="flex justify-between items-center p-3 rounded-lg border">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className={
                    saving.status === 'proposed' ? 'bg-blue-100 text-blue-800' :
                    saving.status === 'approved' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {saving.status.toUpperCase()}
                  </Badge>
                  <span className="font-medium">{saving.type}</span>
                </div>
                <p className="text-sm text-gray-600">Dataset: {saving.dataset_version} • as_of: {saving.as_of}</p>
              </div>
              <p className="font-semibold">€{saving.amount_eur.toLocaleString('es-ES')}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SpendCubeChart = ({ data }) => (
  <Card style={getTrustportCardStyle()}>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Spend Cube - Categorías
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => [`€${value.toLocaleString('es-ES')}`, 'Gasto']} />
            <Bar dataKey="spend" fill="#4472C4" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Lineage: procurement_cube_v2 • Dataset version: 2024.01.19.001 • as_of: 2024-01-19T23:59:59Z
      </p>
    </CardContent>
  </Card>
);

const CommitmentsPipeline = ({ data }) => {
  const colors = ['#4472C4', '#00A878', '#FFC857', '#DB2142'];
  
  return (
    <Card style={getTrustportCardStyle()}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Commitments Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="stage" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => [`€${value.toLocaleString('es-ES')}`, 'Valor']} />
              <Bar dataKey="value" fill="#4472C4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const KPIsFeed = ({ kpis }) => (
  <Card style={getTrustportCardStyle()}>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileCheck2 className="w-5 h-5" />
        KPIs P2P (Alimentados)
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.metric} className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
            <div>
              <p className="font-medium">{kpi.label}</p>
              <p className="text-xs text-gray-500">Dataset: {kpi.dataset_version}</p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-semibold ${kpi.status === 'green' ? 'text-green-600' : 
                                                     kpi.status === 'yellow' ? 'text-yellow-600' : 'text-red-600'}`}>
                {kpi.value}
              </p>
              <p className="text-xs text-gray-500">{kpi.trend}</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default function AnalyticsCompras() {
  const [timeRange, setTimeRange] = useState('ytd');
  const [loading, setLoading] = useState(false);

  const selectedPersona = 'comerciante'; // Simulación, en real vendría del usuario logueado
  const currentPersonaConfig = personaConfig[selectedPersona];

  // Seeds data for analytics (Step 8)
  const spendCubeData = [
    { category: 'Logística', spend: 145000 },
    { category: 'Materiales', spend: 89000 },
    { category: 'Servicios IT', spend: 67000 },
    { category: 'Marketing', spend: 34000 },
    { category: 'Oficina', spend: 23000 }
  ];

  const commitmentsData = [
    { stage: 'Budget', value: 300000 },
    { stage: 'PO', value: 210000 },
    { stage: 'GRN', value: 150000 },
    { stage: 'AP', value: 120000 },
    { stage: 'Available', value: 90000 }
  ];

  const savingsData = [
    { id: 'SV-001', type: 'negotiated', amount_eur: 12500, status: 'realized', dataset_version: 'procurement_v2', as_of: '2024-01-19' },
    { id: 'SV-002', type: 'process', amount_eur: 6000, status: 'approved', dataset_version: 'procurement_v2', as_of: '2024-01-19' },
    { id: 'SV-003', type: 'volume', amount_eur: 4200, status: 'proposed', dataset_version: 'procurement_v2', as_of: '2024-01-19' }
  ];

  const kpisData = [
    { 
      metric: 'ocf_time', 
      label: 'OCF Time', 
      value: '36h', 
      trend: '-12h vs target',
      status: 'green',
      dataset_version: 'compras_kpis_v2.2024.01.19'
    },
    { 
      metric: 'asn_coverage', 
      label: 'ASN Coverage', 
      value: '87%', 
      trend: '+5% vs anterior',
      status: 'yellow',
      dataset_version: 'compras_kpis_v2.2024.01.19'
    },
    { 
      metric: 'three_way_match', 
      label: '3W Match Rate', 
      value: '95.2%', 
      trend: '+2.1pp',
      status: 'green',
      dataset_version: 'compras_kpis_v2.2024.01.19'
    },
    { 
      metric: 't2p_time', 
      label: 'T2P Average', 
      value: '42h', 
      trend: '-6h improved',
      status: 'green',
      dataset_version: 'compras_kpis_v2.2024.01.19'
    }
  ];

  const kpiMap = {
    spend_ytd: { label: "Spend YTD", format: "currency", Icon: DollarSign, color: TRUSTPORT_TOKENS.colors.primary },
    savings_rate: { label: "Savings rate", format: "percentage", Icon: Percent, color: TRUSTPORT_TOKENS.colors.success },
    ocf_hours: { label: "OCF (h)", format: "hours", Icon: Clock, color: TRUSTPORT_TOKENS.colors.warning },
    asn_coverage: { label: "ASN coverage", format: "percentage", Icon: FileCheck2, color: TRUSTPORT_TOKENS.colors.primary },
    match_3w_pct: { label: "3W match", format: "percentage", Icon: GitMerge, color: TRUSTPORT_TOKENS.colors.success },
    t2p_hours: { label: "T2P (h)", format: "hours", Icon: Clock, color: TRUSTPORT_TOKENS.colors.warning },
    otd_pct: { label: "OTD servicios", format: "percentage", Icon: FileText, color: TRUSTPORT_TOKENS.colors.primary },
    ack_time_hours: { label: "ACK Time (h)", format: "hours", Icon: Clock, color: TRUSTPORT_TOKENS.colors.warning },
  };

  const data = {
    kpis: {
      spend_ytd: 12500000,
      savings_rate: 0.082,
      ocf_hours: 46,
      asn_coverage: 0.92,
      match_3w_pct: 0.96,
      t2p_hours: 52,
      otd_pct: 0.94,
      ack_time_hours: 18,
    }
  };

  return (
    <div className="space-y-6" style={{ backgroundColor: TRUSTPORT_TOKENS.colors.background }}>
      {/* Header beige */}
      <div className="p-6 rounded-lg" style={{ backgroundColor: '#F1F0EC' }}>
        <h1 className="text-[28px] font-bold text-gray-900" style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
          Analytics — Compras
        </h1>
        <p className="text-gray-500 mt-1 text-[14px] font-medium">
          KPIs P2P, Spend y Savings con lineage
        </p>
      </div>

      {/* Fila filtros */}
      <Card style={getTrustportCardStyle()}>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 mr-1 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {['Hoy', '24h', '7d', '30d'].map(period => (
                <button
                  key={period}
                  onClick={() => setTimeRange(period)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    timeRange === period ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            <Button variant="outline" style={getTrustportButtonStyle('primary')} className="text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Badge variant="outline" className="ml-auto">
              Datos actualizados: 19/01/2024 23:59
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Fila KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {currentPersonaConfig.kpi_priority.map(key => {
          const kpi = kpiMap[key];
          return (
            <KPICard
              key={key}
              title={kpi.label}
              value={data.kpis[key]}
              format={kpi.format}
              Icon={kpi.Icon}
              color={kpi.color}
            />
          );
        })}
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendCubeChart data={spendCubeData} />
        <CommitmentsPipeline data={commitmentsData} />
        <SavingsTrackerCard savings={savingsData} />
        <KPIsFeed kpis={kpisData} />
      </div>
    </div>
  );
}
