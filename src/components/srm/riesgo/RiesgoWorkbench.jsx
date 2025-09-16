import React, { useState, useMemo } from 'react';
import { useOverlay } from '@/components/srm/OverlayProvider';
import { invokeAi } from '@/components/srm/ai/invokeAi';
import {
  AlertTriangle, ShieldCheck, Users, TrendingUp, Clock, Shield, 
  Search, Filter, Plus, Eye, MoreHorizontal, UserPlus, Zap,
  AlertCircle, CheckCircle, XCircle, Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// TOKENS DE DISEÑO TRUSTPORT
const DESIGN_TOKENS = {
  fonts: { primary: 'Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' },
  colors: {
    main_bg: '#F1F0EC',
    surface: '#FFFFFF',
    text_strong: '#1F2937',
    text_muted: '#6B7280',
    border: '#E5E7EB',
    primary: '#4472C4',
    primary_hover: '#3A61A6',
    primary_active: '#2F4F8A',
    success: '#00A878',
    warning: '#FFC857',
    danger: '#DA2242',
    focus_ring: '#9CB6E6',
  },
  radius: '16px',
  shadow: '0 6px 18px rgba(0,0,0,0.06)',
};

// Helper para estilos de card consistentes
const getCardStyle = () => ({
  backgroundColor: DESIGN_TOKENS.colors.surface,
  borderRadius: DESIGN_TOKENS.radius,
  boxShadow: DESIGN_TOKENS.shadow,
  border: `1px solid ${DESIGN_TOKENS.colors.border}`,
});

// DATOS DE EJEMPLO PARA RIESGOS
const CRITICAL_TYPES = new Set(['contrato','seguro']);

function readJSON(key, fallback) {
  try { 
    const v = localStorage.getItem(key); 
    return v ? JSON.parse(v) : fallback; 
  } catch { 
    return fallback; 
  }
}

function seedFromSnapshots() {
  const evalSnap = readJSON('srm_eval_snapshot', []);
  const docsSnap = readJSON('srm_docs_snapshot', []);
  const out = [];

  // 1) performance: overall_score < 70 ⇒ high
  for (const e of evalSnap) {
    const score = Number(e.overall_score || 0);
    if (score < 70) {
      out.push({
        id: `RISK-P-${e.supplier_id || e.supplier}`,
        supplier: e.supplier,
        severity: 'high',
        reason: 'performance',
        opened_at: new Date().toISOString().slice(0,10),
        owner: 'srm',
        status: 'open',
        impact_eur: 15000 + Math.random() * 50000,
        sla_hours: 48,
        due_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        meta: { score }
      });
    }
  }

  // 2) compliance: faltantes criticos ⇒ medium  
  const missingCrit = new Map();
  for (const d of docsSnap) {
    if (!d.has_file && CRITICAL_TYPES.has(String(d.type || '').toLowerCase())) {
      missingCrit.set(d.supplier, (missingCrit.get(d.supplier) || 0) + 1);
    }
  }
  for (const [supplier, n] of missingCrit.entries()) {
    out.push({
      id: `RISK-C-${supplier}`,
      supplier,
      severity: 'medium',
      reason: 'compliance',
      opened_at: new Date().toISOString().slice(0,10),
      owner: 'srm',
      status: 'open',
      impact_eur: 5000 + Math.random() * 20000,
      sla_hours: 72,
      due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      meta: { missing_critical: n }
    });
  }

  // fallback si no hay nada
  if (!out.length) {
    out.push(
      { 
        id:'RISK-SEED-001', 
        supplier:'Transporte Atlas', 
        severity:'medium', 
        reason:'exposure', 
        opened_at:'2025-01-01', 
        owner:'srm', 
        status:'open',
        impact_eur: 25000,
        sla_hours: 48,
        due_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        meta:{} 
      },
      {
        id:'RISK-SEED-002',
        supplier:'Materials Corp', 
        severity:'high', 
        reason:'performance', 
        opened_at:'2025-01-02', 
        owner:'srm', 
        status:'mitigating',
        impact_eur: 45000,
        sla_hours: 24,
        due_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        meta:{}
      }
    );
  }
  return out;
}

// COMPONENTES CANÓNICOS

// Header Block
const HeaderBlock = ({ title, subtitle, onPrimaryAction, primaryActionLabel }) => (
  <div className="flex justify-between items-start mb-6">
    <div>
      <h1 
        className="text-[32px] font-semibold" 
        style={{ color: DESIGN_TOKENS.colors.text_strong, fontFamily: DESIGN_TOKENS.fonts.primary }}
      >
        {title}
      </h1>
      <p className="text-[16px]" style={{ color: DESIGN_TOKENS.colors.text_muted }}>
        {subtitle}
      </p>
    </div>
    <Button 
      onClick={onPrimaryAction}
      style={{ 
        backgroundColor: DESIGN_TOKENS.colors.primary,
        color: DESIGN_TOKENS.colors.surface,
        fontFamily: DESIGN_TOKENS.fonts.primary
      }}
      className="hover:bg-blue-700"
    >
      <Plus className="w-4 h-4 mr-2" />
      {primaryActionLabel}
    </Button>
  </div>
);

// KPI Card
const KPICard = ({ title, value, trend, icon: Icon, color, prefix = '', suffix = '' }) => (
  <Card className="hover:shadow-lg transition-shadow" style={getCardStyle()}>
    <CardContent className="p-5">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p 
            className="text-xs font-medium mb-2 uppercase tracking-wide"
            style={{ color: DESIGN_TOKENS.colors.text_muted }}
          >
            {title}
          </p>
          <p 
            className="text-2xl font-semibold"
            style={{ color: DESIGN_TOKENS.colors.text_strong, fontFamily: DESIGN_TOKENS.fonts.primary }}
          >
            {prefix}{typeof value === 'number' ? value.toLocaleString('es-ES') : value}{suffix}
          </p>
          {trend && (
            <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${trend.startsWith('+') ? 'text-green-600' : trend.startsWith('-') ? 'text-red-600' : 'text-gray-600'}`}>
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </CardContent>
  </Card>
);

// AI Insights Panel
const AIPanel = ({ onChipClick, busyChip }) => (
  <Card style={{ ...getCardStyle(), backgroundColor: '#F0F5FF', borderColor: '#D6E4FF' }}>
    <CardHeader>
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5" style={{ color: DESIGN_TOKENS.colors.primary }} />
        <CardTitle 
          className="text-lg font-semibold"
          style={{ fontFamily: DESIGN_TOKENS.fonts.primary }}
        >
          AI Insights & Recomendaciones
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 text-sm">Evaluar Proveedores</h4>
              <p className="text-xs text-blue-700 mt-1">Revisar scoring y métricas de desempeño</p>
            </div>
          </div>
          <button
            className="w-full px-3 py-1.5 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
            onClick={() => onChipClick('evaluar_proveedores')}
            disabled={busyChip === 'evaluar_proveedores'}
          >
            {busyChip === 'evaluar_proveedores' ? 'Evaluando...' : 'Evaluar Riesgos'}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 text-sm">Detectar Patrones</h4>
              <p className="text-xs text-blue-700 mt-1">Identificar riesgos emergentes por patrón</p>
            </div>
          </div>
          <button
            className="w-full px-3 py-1.5 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
            onClick={() => onChipClick('detectar_patrones')}
            disabled={busyChip === 'detectar_patrones'}
          >
            {busyChip === 'detectar_patrones' ? 'Analizando...' : 'Detectar Patrones'}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 text-sm">Plan Mitigación</h4>
              <p className="text-xs text-blue-700 mt-1">Generar planes de acción automáticos</p>
            </div>
          </div>
          <button
            className="w-full px-3 py-1.5 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
            onClick={() => onChipClick('plan_mitigacion')}
            disabled={busyChip === 'plan_mitigacion'}
          >
            {busyChip === 'plan_mitigacion' ? 'Generando...' : 'Generar Plan'}
          </button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Toolbar
const ListToolbar = ({ filters, onFilterChange, onClear }) => (
  <Card style={getCardStyle()}>
    <CardContent className="p-4">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: DESIGN_TOKENS.colors.text_muted }} />
          <Input
            placeholder="Buscar riesgo o proveedor..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="pl-10"
            style={{ fontFamily: DESIGN_TOKENS.fonts.primary }}
          />
        </div>
        
        <Select 
          value={filters.severity} 
          onValueChange={(value) => onFilterChange('severity', value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Severidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="low">Baja</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.reason} 
          onValueChange={(value) => onFilterChange('reason', value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="performance">Performance</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="exposure">Exposición</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.status} 
          onValueChange={(value) => onFilterChange('status', value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Abierto</SelectItem>
            <SelectItem value="mitigating">Mitigando</SelectItem>
            <SelectItem value="closed">Cerrado</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          onClick={onClear}
          style={{ fontFamily: DESIGN_TOKENS.fonts.primary }}
        >
          <Filter className="w-4 h-4 mr-2" />
          Limpiar
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Componente principal
export default function RiesgoWorkbench() {
  const { persona } = useOverlay();
  const [activeTab, setActiveTab] = useState('open');
  const [rows, setRows] = useState(seedFromSnapshots());
  const [filters, setFilters] = useState({
    search: '',
    severity: 'all',
    reason: 'all',
    status: 'all'
  });
  const [busyChip, setBusyChip] = useState(null);

  const canMitigate = persona === 'comerciante' || persona === 'operador_logistico';
  const canClose = persona === 'comerciante';

  // KPIs calculados
  const kpis = useMemo(() => {
    const openRisks = rows.filter(r => r.status === 'open').length;
    const highSeverity = rows.filter(r => r.severity === 'high' && r.status !== 'closed').length;
    const totalImpact = rows.filter(r => r.status !== 'closed').reduce((sum, r) => sum + (r.impact_eur || 0), 0);
    const mitigationsOpen = rows.filter(r => r.status === 'mitigating').length;
    const avgTtr = 48; // Mock TTR
    const slaCompliance = 85; // Mock SLA compliance

    return {
      open_risks: openRisks,
      high_severity: highSeverity,
      total_impact: totalImpact,
      mitigations_open: mitigationsOpen,
      avg_ttr: avgTtr,
      sla_compliance: slaCompliance
    };
  }, [rows]);

  // Filtros aplicados
  const filteredData = useMemo(() => {
    let filtered = rows.filter(r => {
      const searchMatch = !filters.search || 
        r.supplier.toLowerCase().includes(filters.search.toLowerCase()) ||
        r.id.toLowerCase().includes(filters.search.toLowerCase());
      const severityMatch = filters.severity === 'all' || r.severity === filters.severity;
      const reasonMatch = filters.reason === 'all' || r.reason === filters.reason;
      const statusMatch = filters.status === 'all' || r.status === filters.status;
      
      return searchMatch && severityMatch && reasonMatch && statusMatch;
    });

    // Filtro por tab
    switch (activeTab) {
      case 'open':
        return filtered.filter(r => r.status === 'open');
      case 'mitigating':
        return filtered.filter(r => r.status === 'mitigating');
      case 'high':
        return filtered.filter(r => r.severity === 'high' && r.status !== 'closed');
      case 'closed':
        return filtered.filter(r => r.status === 'closed');
      default:
        return filtered;
    }
  }, [rows, filters, activeTab]);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      severity: 'all',
      reason: 'all',
      status: 'all'
    });
  };

  const setStatus = (id, status) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleChipClick = async (chipId) => {
    setBusyChip(chipId);
    const res = await invokeAi({
      action: chipId,
      context: { persona, submodule: 'riesgo' },
      payload: { 
        total_risks: rows.length, 
        high_risk_count: kpis.high_severity,
        total_impact: kpis.total_impact
      }
    });
    setBusyChip(null);

    if (res.ok) {
      alert(`AI ${chipId}: Análisis completado`);
    } else {
      alert(`AI error: ${res.error}`);
    }
  };

  const handlePrimaryAction = () => {
    alert('Nueva evaluación de riesgo');
  };

  // Funciones de utilidad
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return DESIGN_TOKENS.colors.danger;
      case 'medium': return DESIGN_TOKENS.colors.warning;
      case 'low': return DESIGN_TOKENS.colors.success;
      default: return DESIGN_TOKENS.colors.text_muted;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'mitigating': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <XCircle className="w-4 h-4" />;
      case 'mitigating': return <AlertCircle className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div 
      className="space-y-6 p-6"
      style={{ 
        backgroundColor: DESIGN_TOKENS.colors.main_bg, 
        fontFamily: DESIGN_TOKENS.fonts.primary,
        minHeight: '100vh'
      }}
    >
      {/* Header */}
      <HeaderBlock
        title="Gestión de Riesgos"
        subtitle="Identificación, evaluación y mitigación de riesgos de proveedores"
        primaryActionLabel="Nueva Evaluación"
        onPrimaryAction={handlePrimaryAction}
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Riesgos Abiertos"
          value={kpis.open_risks}
          icon={AlertTriangle}
          color={DESIGN_TOKENS.colors.danger}
          trend="+2 esta semana"
        />
        <KPICard
          title="Alta Severidad"
          value={kpis.high_severity}
          icon={Shield}
          color={DESIGN_TOKENS.colors.danger}
          trend="-1 vs anterior"
        />
        <KPICard
          title="Impacto Total"
          value={Math.round(kpis.total_impact / 1000)}
          prefix="€"
          suffix="k"
          icon={TrendingUp}
          color={DESIGN_TOKENS.colors.warning}
          trend="+€15k este mes"
        />
        <KPICard
          title="Mitigaciones Activas"
          value={kpis.mitigations_open}
          icon={ShieldCheck}
          color={DESIGN_TOKENS.colors.primary}
          trend="En progreso"
        />
        <KPICard
          title="TTR Promedio"
          value={kpis.avg_ttr}
          suffix="h"
          icon={Clock}
          color={DESIGN_TOKENS.colors.success}
          trend="-12h mejorado"
        />
        <KPICard
          title="SLA Compliance"
          value={kpis.sla_compliance}
          suffix="%"
          icon={CheckCircle}
          color={DESIGN_TOKENS.colors.success}
          trend="+5pp"
        />
      </div>

      {/* AI Panel */}
      <AIPanel onChipClick={handleChipClick} busyChip={busyChip} />

      {/* Toolbar */}
      <ListToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={clearFilters}
      />

      {/* Table with Tabs */}
      <Card style={getCardStyle()}>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
              <TabsTrigger 
                value="open" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
              >
                Abiertos ({rows.filter(r => r.status === 'open').length})
              </TabsTrigger>
              <TabsTrigger 
                value="mitigating" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
              >
                Mitigando ({rows.filter(r => r.status === 'mitigating').length})
              </TabsTrigger>
              <TabsTrigger 
                value="high" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
              >
                Alta Severidad ({rows.filter(r => r.severity === 'high' && r.status !== 'closed').length})
              </TabsTrigger>
              <TabsTrigger 
                value="closed" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
              >
                Cerrados ({rows.filter(r => r.status === 'closed').length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Riesgo</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Severidad</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Impacto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Propietario</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map(risk => (
                    <TableRow key={risk.id}>
                      <TableCell className="font-medium">{risk.id}</TableCell>
                      <TableCell>{risk.supplier}</TableCell>
                      <TableCell>
                        <Badge 
                          className="flex items-center gap-1"
                          style={{ 
                            backgroundColor: `${getSeverityColor(risk.severity)}20`,
                            color: getSeverityColor(risk.severity),
                            border: `1px solid ${getSeverityColor(risk.severity)}40`
                          }}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {risk.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{risk.reason}</TableCell>
                      <TableCell>€{(risk.impact_eur / 1000).toFixed(0)}k</TableCell>
                      <TableCell>
                        <Badge className={`flex items-center gap-1 ${getStatusColor(risk.status)}`}>
                          {getStatusIcon(risk.status)}
                          {risk.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {risk.due_at ? new Date(risk.due_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="uppercase">{risk.owner}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {risk.status === 'open' && canMitigate && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setStatus(risk.id, 'mitigating')}
                            >
                              Mitigar
                            </Button>
                          )}
                          {risk.status === 'mitigating' && canClose && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setStatus(risk.id, 'closed')}
                            >
                              Cerrar
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredData.length === 0 && (
                <div className="text-center py-8" style={{ color: DESIGN_TOKENS.colors.text_muted }}>
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-semibold">Sin registros</p>
                  <p className="text-sm">Ajusta los filtros o evalúa nuevos riesgos</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* FAB IA */}
      <button
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 z-50 flex items-center justify-center"
        style={{
          backgroundColor: DESIGN_TOKENS.colors.primary,
          boxShadow: `0 10px 25px -3px ${DESIGN_TOKENS.colors.primary}30, 0 4px 6px -2px ${DESIGN_TOKENS.colors.primary}05`
        }}
        aria-label="Asistente IA de Riesgos"
      >
        <Zap className="w-8 h-8" style={{ color: DESIGN_TOKENS.colors.surface }} />
      </button>
    </div>
  );
}