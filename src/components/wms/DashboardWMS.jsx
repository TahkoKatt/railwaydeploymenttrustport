
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Package, Clock, CheckCircle, AlertTriangle, Target,
  Zap, ShieldCheck, FileWarning, TrendingDown
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

// Design tokens exactos según especificación Trustport
const TRUSTPORT_TOKENS = {
  colors: {
    primary: '#4472C4',
    secondary: '#DB2142', 
    background: '#F1F0EC',
    surface: '#FFFFFF',
    text_strong: '#1F2937',
    text_muted: '#6B7280',
    success: '#00A878',
    warning: '#FFC857',
    danger: '#DA2242'
  },
  fonts: { primary: 'Montserrat, sans-serif' },
  spacing: { radius: '16px', shadow: '0 8px 24px rgba(0,0,0,.08)' }
};

// KPIs específicos para WMS Dashboard
const wmsKpis = [
  {
    id: 'ocupacion_almacen',
    label: 'Ocupación',
    value: '87.2%',
    icon: Package,
    iconColor: TRUSTPORT_TOKENS.colors.primary,
    trend: '+2.1%',
    trendType: 'positive'
  },
  {
    id: 'exactitud_picking',
    label: 'Exactitud',  
    value: '99.1%',
    icon: Target,
    iconColor: TRUSTPORT_TOKENS.colors.success,
    trend: '+0.3%', 
    trendType: 'positive'
  },
  {
    id: 'throughput_dia',
    label: 'Throughput',
    value: '2,847',
    icon: TrendingUp,
    iconColor: TRUSTPORT_TOKENS.colors.warning,
    trend: '+12%',
    trendType: 'positive'
  },
  {
    id: 'ordenes_pendientes',
    label: 'Pend. Despacho', 
    value: '127',
    icon: Clock,
    iconColor: TRUSTPORT_TOKENS.colors.danger,
    trend: '-8',
    trendType: 'negative'
  },
  {
    id: 'sla_cumplimiento',
    label: 'SLA Cumplido',
    value: '94.8%',
    icon: CheckCircle,
    iconColor: TRUSTPORT_TOKENS.colors.success,
    trend: '+1.2%',
    trendType: 'positive'
  },
  {
    id: 'incidencias_abiertas',
    label: 'Incidencias',
    value: '23',
    icon: AlertTriangle, 
    iconColor: TRUSTPORT_TOKENS.colors.danger,
    trend: '-5',
    trendType: 'negative'
  }
];

// AI Insights específicos para WMS
const wmsInsights = [
  {
    id: 'optimizar_slotting',
    icon: Target,
    title: 'Optimizar slotting',
    desc: 'Top 25 SKUs pueden reubicarse. Reducción estimada: 18% distancia recorrida.',
    cta: { label: 'Ejecutar Reubicación', action: 'optimize_slotting' }
  },
  {
    id: 'crear_oleada',
    icon: Zap,
    title: 'Crear oleada prioritaria',
    desc: '47 órdenes con SLA crítico. Crear oleada express para cumplir ventana.',
    cta: { label: 'Crear Oleada', action: 'create_priority_wave' }
  },
  {
    id: 'resolver_discrepancias',
    icon: FileWarning,
    title: 'Resolver discrepancias',
    desc: '8 discrepancias >24h sin resolución. Requiere intervención de supervisión.',
    cta: { label: 'Abrir Panel', action: 'open_discrepancies' }
  }
];

// Datos mock para gráficos
const throughputData = [
  { hora: '08:00', recepcion: 45, picking: 32, packing: 28, shipping: 15 },
  { hora: '09:00', recepcion: 38, picking: 42, packing: 35, shipping: 22 },
  { hora: '10:00', recepcion: 52, picking: 48, packing: 41, shipping: 28 },
  { hora: '11:00', recepcion: 41, picking: 55, packing: 48, shipping: 32 },
  { hora: '12:00', recepcion: 35, picking: 38, packing: 42, shipping: 38 },
  { hora: '13:00', recepcion: 28, picking: 45, packing: 38, shipping: 35 },
  { hora: '14:00', recepcion: 42, picking: 52, packing: 45, shipping: 41 }
];

const ocupacionData = [
  { zona: 'Picking', ocupado: 850, capacidad: 1000 },
  { zona: 'Reserve', ocupado: 920, capacidad: 1200 },
  { zona: 'Staging', ocupado: 340, capacidad: 400 },
  { zona: 'Receiving', ocupado: 180, capacidad: 300 }
];

const ordenesPendientesData = [
  { prioridad: 'Crítica', cantidad: 23, color: TRUSTPORT_TOKENS.colors.danger },
  { prioridad: 'Alta', cantidad: 45, color: TRUSTPORT_TOKENS.colors.warning },
  { prioridad: 'Media', cantidad: 38, color: TRUSTPORT_TOKENS.colors.primary },
  { prioridad: 'Normal', cantidad: 21, color: TRUSTPORT_TOKENS.colors.success }
];

// Componente KPI Card
const KpiCard = ({ kpi }) => (
  <Card 
    className="bg-white shadow-sm hover:shadow-lg transition-shadow"
    style={{ 
      borderRadius: TRUSTPORT_TOKENS.spacing.radius,
      boxShadow: TRUSTPORT_TOKENS.spacing.shadow
    }}
  >
    <CardContent className="p-5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p 
            className="text-xs font-medium text-gray-600 mb-1"
            style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}
          >
            {kpi.label}
          </p>
          <p 
            className="text-2xl font-bold"
            style={{ 
              fontFamily: TRUSTPORT_TOKENS.fonts.primary,
              color: TRUSTPORT_TOKENS.colors.text_strong
            }}
          >
            {kpi.value}
          </p>
        </div>
        <div 
          className="p-2 rounded-lg flex-shrink-0" 
          style={{ backgroundColor: `${kpi.iconColor}20` }}
        >
          <kpi.icon 
            className="w-5 h-5" 
            style={{ color: kpi.iconColor }} 
          />
        </div>
      </div>
      {kpi.trend && (
        <div className={`flex items-center text-xs font-semibold ${
          kpi.trendType === 'positive' ? 'text-green-600' : 'text-red-600'
        }`}>
          {kpi.trendType === 'positive' ? (
            <TrendingUp className="w-3 h-3 mr-1" />
          ) : (
            <TrendingDown className="w-3 h-3 mr-1" />
          )}
          {kpi.trend}
        </div>
      )}
    </CardContent>
  </Card>
);

// Componente AI Insight Card
const AIInsightCard = ({ insight, onAction }) => (
  <Card 
    className="bg-white border border-blue-100 hover:border-blue-200 transition-colors"
    style={{ 
      borderRadius: TRUSTPORT_TOKENS.spacing.radius,
      boxShadow: TRUSTPORT_TOKENS.spacing.shadow
    }}
  >
    <CardContent className="p-5">
      <div className="flex items-start gap-4">
        <div 
          className="p-2 rounded-lg flex-shrink-0"
          style={{ backgroundColor: `${TRUSTPORT_TOKENS.colors.primary}20` }}
        >
          <insight.icon 
            className="w-5 h-5"
            style={{ color: TRUSTPORT_TOKENS.colors.primary }}
          />
        </div>
        <div className="flex-1">
          <h4 
            className="font-semibold text-sm mb-2"
            style={{ 
              fontFamily: TRUSTPORT_TOKENS.fonts.primary,
              color: TRUSTPORT_TOKENS.colors.text_strong
            }}
          >
            {insight.title}
          </h4>
          <p 
            className="text-xs text-gray-600 mb-4"
            style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}
          >
            {insight.desc}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction(insight.cta.action)}
            className="text-xs"
            style={{ 
              fontFamily: TRUSTPORT_TOKENS.fonts.primary,
              borderColor: TRUSTPORT_TOKENS.colors.primary,
              color: TRUSTPORT_TOKENS.colors.primary
            }}
          >
            {insight.cta.label}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function DashboardWMS({
  selectedPersona,
  personaConfig,
  dashboardFilters,
  setDashboardFilters,
  activeTab,
  setActiveTab,
  dataStatus,
  seedData,
  handleTabChange,
  getTrustportCardStyle,
  getTrustportButtonStyle,
  TRUSTPORT_TOKENS, // Passed as prop, though also globally imported in this file.
  logWMSEvent,
  toast
}) {
  
  const [loading, setLoading] = useState(false);

  const handleActionClick = (action) => {
    setLoading(true);
    // Ensure logWMSEvent and toast are defined or mocked if not provided by parent.
    if (logWMSEvent) {
      logWMSEvent('ai_action_clicked', { action, persona: selectedPersona });
    }
    
    // Simular acción async
    setTimeout(() => {
      setLoading(false);
      
      const actionMessages = {
        optimize_slotting: 'Optimización de slotting iniciada. Se ejecutará en las próximas 2 horas.',
        create_priority_wave: 'Oleada prioritaria creada exitosamente. 47 órdenes asignadas.',
        open_discrepancies: 'Abriendo panel de discrepancias...'
      };
      
      if (toast) {
        toast.success(actionMessages[action] || 'Acción ejecutada exitosamente');
      }
    }, 1500);
  };

  const handleFilterChange = (filterKey, value) => {
    if (setDashboardFilters) {
      setDashboardFilters(prev => ({ ...prev, [filterKey]: value }));
    }
    if (logWMSEvent) {
      logWMSEvent('filter_changed', { filterKey, value, persona: selectedPersona });
    }
  };

  return (
    <div 
      className="space-y-6"
      style={{ 
        backgroundColor: TRUSTPORT_TOKENS.colors.background,
        fontFamily: TRUSTPORT_TOKENS.fonts.primary
      }}
    >
      {/* Filtros principales */}
      <Card 
        className="bg-white shadow-sm" 
        style={{ 
          borderRadius: TRUSTPORT_TOKENS.spacing.radius,
          boxShadow: TRUSTPORT_TOKENS.spacing.shadow
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4 text-sm">
            <span 
              className="font-medium text-gray-700"
              style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}
            >
              Filtros:
            </span>
            
            <Select 
              value={dashboardFilters?.warehouse_id || ''} 
              onValueChange={(value) => handleFilterChange('warehouse_id', value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Almacén" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MAD-01">Madrid 01</SelectItem>
                <SelectItem value="BCN-01">Barcelona 01</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={dashboardFilters?.time_window || ''} 
              onValueChange={(value) => handleFilterChange('time_window', value)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hoy">Hoy</SelectItem>
                <SelectItem value="24h">24h</SelectItem>
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={dashboardFilters?.owner_id || 'Todos'} 
              onValueChange={(value) => handleFilterChange('owner_id', value === 'Todos' ? null : value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="ACME">ACME</SelectItem>
                <SelectItem value="BETA">BETA Inc</SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="sm"
              onClick={() => {
                if (logWMSEvent) {
                  logWMSEvent('dashboard_refreshed', { persona: selectedPersona });
                }
                if (toast) {
                  toast.success('Dashboard actualizado');
                }
              }}
              style={{ 
                backgroundColor: TRUSTPORT_TOKENS.colors.primary,
                color: 'white',
                fontFamily: TRUSTPORT_TOKENS.fonts.primary
              }}
            >
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {wmsKpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* AI Insights & Recomendaciones */}
      <Card 
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
        style={{ 
          borderRadius: TRUSTPORT_TOKENS.spacing.radius,
          boxShadow: TRUSTPORT_TOKENS.spacing.shadow
        }}
      >
        <CardHeader>
          <CardTitle 
            className="text-lg font-semibold flex items-center gap-2"
            style={{ 
              fontFamily: TRUSTPORT_TOKENS.fonts.primary,
              color: TRUSTPORT_TOKENS.colors.primary
            }}
          >
            <Zap className="w-5 h-5" />
            AI Insights & Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {wmsInsights.map((insight) => (
              <AIInsightCard
                key={insight.id}
                insight={insight}
                onAction={handleActionClick}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Throughput por hora */}
        <Card 
          className="bg-white shadow-sm"
          style={{ 
            borderRadius: TRUSTPORT_TOKENS.spacing.radius,
            boxShadow: TRUSTPORT_TOKENS.spacing.shadow
          }}
        >
          <CardHeader>
            <CardTitle 
              className="text-base font-semibold"
              style={{ 
                fontFamily: TRUSTPORT_TOKENS.fonts.primary,
                color: TRUSTPORT_TOKENS.colors.text_strong
              }}
            >
              Throughput P2P por hora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={throughputData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hora" 
                    fontSize={11}
                    style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary, fill: TRUSTPORT_TOKENS.colors.text_muted }}
                  />
                  <YAxis 
                    fontSize={11}
                    style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary, fill: TRUSTPORT_TOKENS.colors.text_muted }}
                  />
                  <Tooltip 
                    contentStyle={{
                      fontFamily: TRUSTPORT_TOKENS.fonts.primary,
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      fontFamily: TRUSTPORT_TOKENS.fonts.primary,
                      fontSize: '11px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="recepcion" 
                    stroke={TRUSTPORT_TOKENS.colors.success} 
                    strokeWidth={2}
                    name="Recepción"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="picking" 
                    stroke={TRUSTPORT_TOKENS.colors.primary} 
                    strokeWidth={2}
                    name="Picking"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="packing" 
                    stroke={TRUSTPORT_TOKENS.colors.warning} 
                    strokeWidth={2}
                    name="Packing"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="shipping" 
                    stroke={TRUSTPORT_TOKENS.colors.danger} 
                    strokeWidth={2}
                    name="Shipping"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ocupación por zonas */}
        <Card 
          className="bg-white shadow-sm"
          style={{ 
            borderRadius: TRUSTPORT_TOKENS.spacing.radius,
            boxShadow: TRUSTPORT_TOKENS.spacing.shadow
          }}
        >
          <CardHeader>
            <CardTitle 
              className="text-base font-semibold"
              style={{ 
                fontFamily: TRUSTPORT_TOKENS.fonts.primary,
                color: TRUSTPORT_TOKENS.colors.text_strong
              }}
            >
              Ocupación por zonas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ocupacionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="zona" 
                    fontSize={11}
                    style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary, fill: TRUSTPORT_TOKENS.colors.text_muted }}
                  />
                  <YAxis 
                    fontSize={11}
                    style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary, fill: TRUSTPORT_TOKENS.colors.text_muted }}
                  />
                  <Tooltip 
                    contentStyle={{
                      fontFamily: TRUSTPORT_TOKENS.fonts.primary,
                      fontSize: '12px'
                    }}
                  />
                  <Bar 
                    dataKey="ocupado" 
                    fill={TRUSTPORT_TOKENS.colors.primary}
                    name="Ocupado"
                  />
                  <Bar 
                    dataKey="capacidad" 
                    fill={`${TRUSTPORT_TOKENS.colors.primary}40`}
                    name="Capacidad"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Órdenes pendientes por prioridad */}
        <Card 
          className="bg-white shadow-sm"
          style={{ 
            borderRadius: TRUSTPORT_TOKENS.spacing.radius,
            boxShadow: TRUSTPORT_TOKENS.spacing.shadow
          }}
        >
          <CardHeader>
            <CardTitle 
              className="text-base font-semibold"
              style={{ 
                fontFamily: TRUSTPORT_TOKENS.fonts.primary,
                color: TRUSTPORT_TOKENS.colors.text_strong
              }}
            >
              Pipeline por prioridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ordenesPendientesData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span 
                      className="text-sm font-medium"
                      style={{ 
                        fontFamily: TRUSTPORT_TOKENS.fonts.primary,
                        color: TRUSTPORT_TOKENS.colors.text_strong
                      }}
                    >
                      {item.prioridad}
                    </span>
                  </div>
                  <span 
                    className="text-sm font-bold"
                    style={{ 
                      fontFamily: TRUSTPORT_TOKENS.fonts.primary,
                      color: TRUSTPORT_TOKENS.colors.text_strong
                    }}
                  >
                    {item.cantidad}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
