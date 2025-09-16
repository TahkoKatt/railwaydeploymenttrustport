import React, { useState, useEffect, useMemo } from 'react';
import { useRmOverlay } from "@/components/rm/overlays";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Search, FilterX, Eye, Edit, MoreHorizontal, ExternalLink, UserPlus,
  DollarSign, FileText, Clock, TrendingUp, ShieldCheck, Zap, FileWarning
} from "lucide-react";

// Design tokens exactos según especificación
const designTokens = {
  colors: {
    main_bg: '#F1F0EC',
    surface: '#FFFFFF', 
    text_strong: '#1F2937',
    text_muted: '#6B7280',
    primary: '#4472C4',
    primary_hover: '#3A61A6',
    success: '#00A878',
    warning: '#FFC857',
    danger: '#DA2242'
  },
  spacing: {
    card_padding: '20px',
    section_gap: '24px',
    kpi_gap: '16px'
  }
};

// KPIs específicos para Cotizaciones
const cotizacionesKpis = [
  {
    id: 'cotizaciones_mes',
    label: 'Cotizaciones Mes',
    value: '47',
    format: 'number',
    icon: FileText,
    color: designTokens.colors.primary,
    trend: '+8',
    trendType: 'positive'
  },
  {
    id: 'tasa_conversion', 
    label: 'Tasa Conversion',
    value: '68.5%',
    format: 'percent',
    icon: TrendingUp,
    color: designTokens.colors.success,
    trend: '+4.2%',
    trendType: 'positive'
  },
  {
    id: 'margen_promedio',
    label: 'Margen Promedio', 
    value: '19.8%',
    format: 'percent',
    icon: DollarSign,
    color: designTokens.colors.warning,
    trend: '+1.3%',
    trendType: 'positive'
  },
  {
    id: 'tiempo_cotizacion',
    label: 'Tiempo Cotizacion',
    value: '2.4h',
    format: 'duration', 
    icon: Clock,
    color: designTokens.colors.danger,
    trend: '-0.3h',
    trendType: 'negative'
  },
  {
    id: 'valor_promedio',
    label: 'Valor Promedio',
    value: '€8,750',
    format: 'currency',
    icon: TrendingUp,
    color: designTokens.colors.primary,
    trend: '+12%',
    trendType: 'positive'
  },
  {
    id: 'sla_aprobacion',
    label: 'SLA Aprobacion',
    value: '89.2%',
    format: 'percent',
    icon: ShieldCheck,
    color: designTokens.colors.success,
    trend: '+2.1%',
    trendType: 'positive'
  }
];

// AI Insights específicos para Cotizaciones
const cotizacionesInsights = [
  {
    id: 'margin_optimization',
    icon: ShieldCheck,
    title: 'Optimizar margenes',
    desc: '12 cotizaciones con margen <15%. Revisar pricing SRM para ajustar.',
    cta: { label: 'Revisar Margenes', action: 'optimize_margins' }
  },
  {
    id: 'auto_pricing',
    icon: Zap, 
    title: 'Auto-pricing disponible',
    desc: 'Tarifas SRM actualizadas para 8 rutas. Recalcular precios automáticamente.',
    cta: { label: 'Ejecutar Auto-pricing', action: 'run_auto_pricing' }
  },
  {
    id: 'conversion_risk',
    icon: FileWarning,
    title: 'Riesgo de conversion',
    desc: '5 cotizaciones >7 días sin respuesta. Considerar follow-up o descuento.',
    cta: { label: 'Crear Follow-up', action: 'create_followup' }
  }
];

// Datos mock para la tabla
const mockCotizaciones = [
  {
    id: 'Q-2025-00123',
    cliente: 'ACME Logistics',
    ruta: 'CNSHA → PECLL',
    servicio: 'FCL 40\'',
    monto: '€12,500',
    margen: '21.6%',
    estado: 'Enviada',
    fecha: '2025-09-02',
    owner: 'Ana García',
    vencimiento: '2025-09-30'
  },
  {
    id: 'Q-2025-00124', 
    cliente: 'Express Maritime',
    ruta: 'DEHAM → USLAX',
    servicio: 'LCL',
    monto: '€3,200',
    margen: '18.4%',
    estado: 'Borrador',
    fecha: '2025-09-01',
    owner: 'Carlos Ruiz',
    vencimiento: '2025-09-25'
  },
  {
    id: 'Q-2025-00125',
    cliente: 'StartUp Logistics', 
    ruta: 'PELIM → USLAX',
    servicio: 'Aéreo',
    monto: '€1,500',
    margen: '12.5%',
    estado: 'Pend. Aprobacion',
    fecha: '2025-08-30',
    owner: 'María López',
    vencimiento: '2025-09-20'
  }
];

// Componente KPI Card
const KpiCard = ({ kpi }) => (
  <Card 
    className="bg-white shadow-sm hover:shadow-lg transition-shadow"
    style={{ 
      borderRadius: '16px',
      boxShadow: '0 6px 18px rgba(0,0,0,0.06)'
    }}
  >
    <CardContent style={{ padding: designTokens.spacing.card_padding }}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-xs font-medium" style={{ color: designTokens.colors.text_muted }}>
            {kpi.label}
          </p>
          <p className="text-2xl font-bold mt-1" style={{ color: designTokens.colors.text_strong }}>
            {kpi.value}
          </p>
          {kpi.trend && (
            <div className={`flex items-center mt-2 text-xs font-medium ${
              kpi.trendType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {kpi.trend}
            </div>
          )}
        </div>
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${kpi.color}20` }}
        >
          <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Componente AI Insight Card
const InsightCard = ({ insight }) => (
  <Card className="bg-blue-50 border-blue-200" style={{ borderRadius: '16px' }}>
    <CardContent style={{ padding: designTokens.spacing.card_padding }}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-100">
          <insight.icon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1" style={{ color: designTokens.colors.text_strong }}>
            {insight.title}
          </h4>
          <p className="text-xs mb-3" style={{ color: designTokens.colors.text_muted }}>
            {insight.desc}
          </p>
          <Button 
            variant="outline" 
            size="sm"
            style={{ 
              borderColor: designTokens.colors.primary,
              color: designTokens.colors.primary
            }}
          >
            {insight.cta.label}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Componente principal
export default function CotizacionesWorkbench() {
  const { currentPersona } = useRmOverlay();
  const [activeTab, setActiveTab] = useState('todas');
  const [filters, setFilters] = useState({
    estado: 'todos',
    servicio: 'todos', 
    owner: 'todos'
  });

  // Overlays por persona para reordenar KPIs
  const kpisOrdenados = useMemo(() => {
    if (currentPersona === 'operador_logistico') {
      // Operador: prioriza tiempo, SLA, volumen, conversión
      return [
        cotizacionesKpis[3], // tiempo_cotizacion
        cotizacionesKpis[5], // sla_aprobacion  
        cotizacionesKpis[0], // cotizaciones_mes
        cotizacionesKpis[1]  // tasa_conversion
      ];
    }
    // Comerciante: prioriza margen, valor, conversión, volumen
    return [
      cotizacionesKpis[2], // margen_promedio
      cotizacionesKpis[4], // valor_promedio
      cotizacionesKpis[1], // tasa_conversion
      cotizacionesKpis[0]  // cotizaciones_mes
    ];
  }, [currentPersona]);

  return (
    <div 
      className="p-6 space-y-6"
      style={{ 
        backgroundColor: designTokens.colors.main_bg,
        fontFamily: 'Montserrat, system-ui, sans-serif'
      }}
    >
      {/* 1. HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[28px] font-semibold mb-2" style={{ color: designTokens.colors.text_strong }}>
            Gestión de Cotizaciones
          </h1>
          <p className="text-[14px] font-medium" style={{ color: designTokens.colors.text_muted }}>
            Construye, versiona y aprueba cotizaciones con márgenes controlados.
          </p>
        </div>
        <Button 
          size="lg"
          style={{ 
            backgroundColor: designTokens.colors.primary,
            color: 'white'
          }}
          className="hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cotización
        </Button>
      </div>

      {/* 2. KPI ROW */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        data-testid="wb_kpis"
      >
        {kpisOrdenados.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* 3. AI PANEL */}
      <Card 
        className="bg-white"
        style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}
        data-testid="wb_ai"
      >
        <CardHeader style={{ padding: designTokens.spacing.card_padding }}>
          <CardTitle className="text-lg font-semibold">AI Insights & Recomendaciones</CardTitle>
        </CardHeader>
        <CardContent style={{ padding: `0 ${designTokens.spacing.card_padding} ${designTokens.spacing.card_padding}` }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cotizacionesInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4. TOOLBAR */}
      <Card 
        className="bg-white"
        style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}
        data-testid="wb_toolbar"
      >
        <CardContent style={{ padding: designTokens.spacing.card_padding }}>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: designTokens.colors.text_muted }} />
              <Input 
                placeholder="Buscar cotizaciones o clientes..."
                className="pl-10"
                style={{ 
                  backgroundColor: designTokens.colors.surface,
                  borderColor: '#E5E7EB'
                }}
              />
            </div>
            
            <Select value={filters.estado} onValueChange={(value) => setFilters({...filters, estado: value})}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="borrador">Borrador</SelectItem>
                <SelectItem value="enviada">Enviada</SelectItem>
                <SelectItem value="aprobada">Aprobada</SelectItem>
                <SelectItem value="vencida">Vencida</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.servicio} onValueChange={(value) => setFilters({...filters, servicio: value})}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Todos los servicios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los servicios</SelectItem>
                <SelectItem value="fcl">FCL</SelectItem>
                <SelectItem value="lcl">LCL</SelectItem>
                <SelectItem value="aereo">Aéreo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.owner} onValueChange={(value) => setFilters({...filters, owner: value})}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ana">Ana García</SelectItem>
                <SelectItem value="carlos">Carlos Ruiz</SelectItem>
                <SelectItem value="maria">María López</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline"
              onClick={() => setFilters({ estado: 'todos', servicio: 'todos', owner: 'todos' })}
            >
              <FilterX className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 5. TABLA CON TABS */}
      <Card 
        className="bg-white"
        style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}
        data-testid="wb_table"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader style={{ padding: `${designTokens.spacing.card_padding} ${designTokens.spacing.card_padding} 0` }}>
            <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="todas" className="rounded-md">Todas</TabsTrigger>
              <TabsTrigger value="borradores" className="rounded-md">Borradores</TabsTrigger>
              <TabsTrigger value="enviadas" className="rounded-md">Enviadas</TabsTrigger>
              <TabsTrigger value="aprobacion" className="rounded-md">Pend. Aprobación</TabsTrigger>
              <TabsTrigger value="vencidas" className="rounded-md">Vencidas</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent style={{ padding: `0 ${designTokens.spacing.card_padding} ${designTokens.spacing.card_padding}` }}>
            <TabsContent value={activeTab} className="mt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Cotización</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Ruta</TableHead>
                      <TableHead>Servicio</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Margen</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Vence</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCotizaciones.map((cotizacion) => (
                      <TableRow key={cotizacion.id}>
                        <TableCell className="font-medium">{cotizacion.id}</TableCell>
                        <TableCell>{cotizacion.cliente}</TableCell>
                        <TableCell>{cotizacion.ruta}</TableCell>
                        <TableCell>{cotizacion.servicio}</TableCell>
                        <TableCell>{cotizacion.monto}</TableCell>
                        <TableCell>
                          <Badge className={
                            parseFloat(cotizacion.margen) < 15 
                              ? 'bg-red-100 text-red-800'
                              : parseFloat(cotizacion.margen) < 18
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }>
                            {cotizacion.margen}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            cotizacion.estado === 'Enviada' ? 'border-blue-400 text-blue-600' :
                            cotizacion.estado === 'Borrador' ? 'border-gray-400 text-gray-600' :
                            'border-yellow-400 text-yellow-600'
                          }>
                            {cotizacion.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>{cotizacion.owner}</TableCell>
                        <TableCell>{cotizacion.vencimiento}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
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
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* FAB IA - Botón flotante inferior derecha */}
      <Button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 z-50"
        style={{ backgroundColor: designTokens.colors.primary }}
      >
        <Zap className="w-6 h-6 text-white" />
      </Button>
    </div>
  );
}