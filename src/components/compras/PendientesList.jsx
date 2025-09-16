
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Search, Filter, AlertTriangle, Clock, DollarSign, Package, TrendingUp,
  CheckCircle, XCircle, AlertCircle, FileText, Zap, ExternalLink,
  ArrowRight, User, Calendar, Terminal, BarChart3, Target, Shield, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Tokens Trustport para consistencia
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

// Configuración de prioridades según JSON spec
const getPriorityConfig = (priority) => {
  const configs = {
    critical: { color: "bg-red-100 text-red-800", icon: AlertTriangle, text: "Critica", score: 1.0 },
    high: { color: "bg-orange-100 text-orange-800", icon: AlertCircle, text: "Alta", score: 0.7 },
    medium: { color: "bg-yellow-100 text-yellow-800", icon: Clock, text: "Media", score: 0.5 },
    low: { color: "bg-blue-100 text-blue-800", icon: CheckCircle, text: "Baja", score: 0.2 },
  };
  return configs[priority] || configs["medium"];
};

const getSourceIcon = (source) => {
  const icons = {
    "PO": Package,
    "SPO": FileText,
    "Invoice": DollarSign
  };
  return icons[source] || FileText;
};

const getSLAStatus = (dueAt, currentStatus) => {
  if (currentStatus === 'resolved') return { status: 'completed', color: 'text-green-600', text: 'Completado' };
  
  const now = new Date();
  const due = new Date(dueAt);
  const hoursRemaining = (due - now) / (1000 * 60 * 60);
  
  if (hoursRemaining < 0) return { status: 'breach', color: 'text-red-600', text: 'Vencido' };
  if (hoursRemaining < 4) return { status: 'at_risk', color: 'text-yellow-600', text: 'En Riesgo' };
  return { status: 'ok', color: 'text-green-600', text: 'OK' };
};

// Componente KPI Header según spec
const HeaderKPIs = ({ data }) => {
  const kpiData = [
    { title: "Tareas Abiertas", value: data.totalTasks, icon: Terminal, color: TRUSTPORT_TOKENS.colors.primary },
    { title: "Criticas", value: data.criticalTasks, icon: AlertTriangle, color: TRUSTPORT_TOKENS.colors.danger },
    { title: "SLA en Riesgo", value: data.atRiskTasks, icon: Clock, color: TRUSTPORT_TOKENS.colors.warning },
    { title: "Impacto EUR", value: `€${data.totalImpact.toLocaleString('es-ES')}`, icon: DollarSign, color: TRUSTPORT_TOKENS.colors.success },
    { title: "TTR Promedio", value: `${data.avgTTR}h`, icon: BarChart3, color: TRUSTPORT_TOKENS.colors.primary },
    { title: "SLA Compliance", value: `${data.slaCompliance}%`, icon: Target, color: TRUSTPORT_TOKENS.colors.success }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
      {kpiData.map((kpi, index) => (
        <Card key={index} style={getTrustportCardStyle()}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-gray-600">{kpi.title}</p>
                <p className="text-xl font-semibold">{kpi.value}</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${kpi.color}20` }}>
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// AI Insights Band según JSON spec
const AIInsightsBand = ({ onActionClick }) => {
  const insights = [
    {
      id: "group_approvals",
      title: "Consolidar aprobaciones", 
      description: "Hay 8 aprobaciones pendientes que puedes procesar en lote",
      cta: "Abrir lote",
      action: "open_batch_approvals",
      icon: CheckCircle
    },
    {
      id: "auto_3wm",
      title: "Auto-match 3WM",
      description: "5 facturas con coincidencia potencial detectada por IA", 
      cta: "Lanzar 3WM",
      action: "launch_3wm_recheck",
      icon: Zap
    },
    {
      id: "supplier_claim",
      title: "Iniciar claim proveedor",
      description: "Discrepancia recurrente detectada con Proveedor ABC",
      cta: "Crear claim", 
      action: "raise_dispute",
      icon: Shield
    }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">AI Insights & Recomendaciones</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight) => (
          <div key={insight.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <insight.icon className="w-4 h-4" style={{ color: TRUSTPORT_TOKENS.colors.primary }} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 text-sm">{insight.title}</h4>
                <p className="text-xs text-blue-700 mt-1">{insight.description}</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={() => onActionClick(insight.action)}
            >
              {insight.cta}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente principal Action Center
export default function PendientesList({ isPreview }) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    task_type: 'all',
    sla_state: 'all',
    flow: 'all',
    assignee: 'all'
  });
  const [loading, setLoading] = useState(false);
  const [groupBy, setGroupBy] = useState('priority');
  const [activeTab, setActiveTab] = useState('all');

  // Datos simulados basados en JSON spec
  const headerData = {
    totalTasks: 12,
    criticalTasks: 2,
    atRiskTasks: 4,
    totalImpact: 4230,
    avgTTR: 18,
    slaCompliance: 92
  };

  useEffect(() => {
    loadDemoTasks();
  }, []);

  const loadDemoTasks = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400));

    const demoTasks = [
      {
        id: 'AC-001',
        task_type: 'tariff_missing',
        flow: 'SPO',
        flow_ref: 'SPO-004',
        title: 'Tarifa faltante para HAPAG LLOYD',
        description: 'SPO-004 no tiene tarifa de referencia asignada',
        priority: 'high',
        priority_score: 0.75,
        impact_eur: 980,
        due_at: '2025-01-02T17:00:00Z',
        assignee_name: 'Maria Gonzalez',
        status: 'in_progress',
        quick_actions: ['open_comex_file', 'request_tariff', 'price_extra']
      },
      {
        id: 'AC-002', 
        task_type: '3wm_exception',
        flow: 'Invoice',
        flow_ref: 'INV-789',
        title: 'Excepcion 3WM - discrepancia precio',
        description: 'Factura INV-789 con variacion de precio del 5%',
        priority: 'high',
        priority_score: 0.70,
        impact_eur: 450,
        due_at: '2025-01-03T12:00:00Z',
        assignee_name: 'Carlos Ruiz',
        status: 'created',
        quick_actions: ['match_now', 'launch_3wm_recheck', 'raise_dispute']
      },
      {
        id: 'AC-003',
        task_type: 'asn_overdue', 
        flow: 'PO',
        flow_ref: 'PO-G-001',
        title: 'ASN vencido - Componentes Tech',
        description: 'PO-G-001 con ASN vencido hace 2 dias',
        priority: 'critical',
        priority_score: 0.95,
        impact_eur: 2500,
        due_at: '2025-01-01T09:00:00Z',
        assignee_name: 'Ana Perez',
        status: 'waiting_external',
        quick_actions: ['send_ack_supplier', 'open_asn']
      }
    ];

    setTasks(demoTasks);
    setFilteredTasks(demoTasks);
    setLoading(false);
  };

  const handleQuickAction = async (action, task) => {
    const actionMessages = {
      open_comex_file: `Abriendo archivo COMEX para ${task.flow_ref}`,
      request_tariff: `Solicitando tarifa para ${task.flow_ref}`,
      price_extra: `Cotizando extra para ${task.flow_ref}`,
      match_now: `Iniciando match para ${task.flow_ref}`,
      launch_3wm_recheck: `Relanzando 3WM para ${task.flow_ref}`,
      raise_dispute: `Creando disputa para ${task.flow_ref}`,
      send_ack_supplier: `Enviando ACK a proveedor para ${task.flow_ref}`,
      open_asn: `Abriendo ASN para ${task.flow_ref}`
    };

    toast.success(actionMessages[action] || `Accion '${action}' ejecutada para ${task.flow_ref}`);
  };

  const handleAIAction = (action) => {
    const aiMessages = {
      open_batch_approvals: "Abriendo centro de aprobaciones en lote",
      launch_3wm_recheck: "Iniciando proceso automatico de 3WM", 
      raise_dispute: "Iniciando asistente para crear claim"
    };
    
    toast.success(aiMessages[action] || `Accion IA '${action}' iniciada`);
  };

  // Aplicar filtros generales (excluding tab-specific filters)
  useEffect(() => {
    let filtered = tasks;

    if (filters.search) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.flow_ref.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.task_type !== 'all') {
      filtered = filtered.filter(task => task.task_type === filters.task_type);
    }

    if (filters.flow !== 'all') {
      filtered = filtered.filter(task => task.flow === filters.flow);
    }

    if (filters.sla_state !== 'all') {
      filtered = filtered.filter(task => {
        const slaStatus = getSLAStatus(task.due_at, task.status);
        return slaStatus.status === filters.sla_state;
      });
    }
    
    // Ordenar por priority_score por defecto
    filtered.sort((a, b) => b.priority_score - a.priority_score);

    setFilteredTasks(filtered);
  }, [filters, tasks]);

  const getActionLabel = (action) => {
    const labels = {
      open_comex_file: 'Abrir COMEX',
      request_tariff: 'Pedir Tarifa',
      price_extra: 'Cotizar Extra', 
      match_now: 'Match Ahora',
      launch_3wm_recheck: 'Relanzar 3WM',
      raise_dispute: 'Crear Disputa',
      send_ack_supplier: 'Enviar ACK',
      open_asn: 'Abrir ASN'
    };
    return labels[action] || action;
  };
  
  const getTasksForTab = (tab) => {
    switch(tab) {
        case 'critical':
            return filteredTasks.filter(task => task.priority === 'critical');
        case 'at_risk':
            return filteredTasks.filter(task => getSLAStatus(task.due_at, task.status).status === 'at_risk');
        case 'unassigned':
            return filteredTasks.filter(task => !task.assignee_name);
        case 'all':
        default:
            return filteredTasks;
    }
  }

  const renderTaskTable = (tasksToRender) => (
    <>
      {loading ? (
        <div className="text-center py-12">
          <p>Cargando tareas pendientes...</p>
        </div>
      ) : tasksToRender.length === 0 ? (
        <div className="py-12 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin tareas pendientes</h3>
          <p className="text-gray-500">No hay tareas que coincidan con los filtros aplicados.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[92px]">Prioridad</TableHead>
              <TableHead className="w-[140px]">Tipo</TableHead>
              <TableHead className="w-[340px]">Descripcion</TableHead>
              <TableHead className="w-[120px]">Impacto</TableHead>
              <TableHead className="w-[140px]">Flujo</TableHead>
              <TableHead className="w-[120px]">Asignado</TableHead>
              <TableHead className="w-[120px]">Vence</TableHead>
              <TableHead className="w-[80px]">SLA</TableHead>
              <TableHead className="w-[180px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasksToRender.map((task) => {
              const priorityConfig = getPriorityConfig(task.priority);
              const slaStatus = getSLAStatus(task.due_at, task.status);
              const SourceIcon = getSourceIcon(task.flow);

              return (
                <TableRow key={task.id}>
                  <TableCell>
                    <Badge className={priorityConfig.color}>
                      <priorityConfig.icon className="w-3 h-3 mr-1" />
                      {priorityConfig.text}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <SourceIcon className="w-4 h-4 text-gray-500" />
                      <Badge variant="outline" className="text-xs">
                        {task.task_type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-sm">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">€{task.impact_eur.toLocaleString('es-ES')}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{task.flow_ref}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span className="text-sm">{task.assignee_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(task.due_at).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${slaStatus.color} bg-transparent border`}>
                      {slaStatus.text}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {task.quick_actions.slice(0, 2).map((action, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleQuickAction(action, task)}
                          disabled={isPreview}
                        >
                          {getActionLabel(action)}
                        </Button>
                      ))}
                      {task.quick_actions.length > 2 && (
                        <Button variant="ghost" size="sm" className="text-xs">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </>
  );

  return (
    <div className="space-y-6" style={{ backgroundColor: TRUSTPORT_TOKENS.colors.background, minHeight: '100vh', padding: '1.5rem' }}>
      {/* Header */}
       <div className="p-6 rounded-lg" style={{ backgroundColor: '#F1F0EC' }}>
        <h1 className="text-[28px] font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Action Center – Procure to Pay (P2P)
        </h1>
        <p className="text-gray-500 mt-1 text-[14px] font-medium">
            Tareas, aprobaciones y excepciones unificadas para un P2P sin fricción.
        </p>
      </div>
      
      {/* Header KPIs */}
      <HeaderKPIs data={headerData} />

      {/* AI Insights Band */}
      <AIInsightsBand onActionClick={handleAIAction} />
      
      {/* Filters Card */}
       <Card style={getTrustportCardStyle()}>
          <CardContent className="pt-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="col-span-full lg:col-span-2 relative">
                    <Search className="w-4 h-4 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Buscar tareas o referencias..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-8"
                    />
                </div>
                <Select
                    value={filters.task_type}
                    onValueChange={(value) => setFilters({ ...filters, task_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de tarea" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="tariff_missing">Tarifa faltante</SelectItem>
                      <SelectItem value="3wm_exception">Excepcion 3WM</SelectItem>
                      <SelectItem value="asn_overdue">ASN vencido</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={filters.sla_state}
                    onValueChange={(value) => setFilters({ ...filters, sla_state: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Estado SLA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="ok">OK</SelectItem>
                      <SelectItem value="at_risk">En Riesgo</SelectItem>
                      <SelectItem value="breach">Vencido</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={filters.flow}
                    onValueChange={(value) => setFilters({ ...filters, flow: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Flujo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="PO">PO Bienes</SelectItem>
                      <SelectItem value="SPO">PO Servicios</SelectItem>
                      <SelectItem value="Invoice">Facturas</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    onClick={() => setFilters({ search: '', task_type: 'all', sla_state: 'all', flow: 'all', assignee: 'all' })}
                    variant="outline"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Limpiar
                </Button>
            </div>
          </CardContent>
       </Card>


      {/* Main Workbench Card */}
      <Card style={getTrustportCardStyle()}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">Todas las Tareas</TabsTrigger>
                  <TabsTrigger value="critical">Críticas</TabsTrigger>
                  <TabsTrigger value="at_risk">SLA en Riesgo</TabsTrigger>
                  <TabsTrigger value="unassigned">Sin Asignar</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent>
              <TabsContent value="all">{renderTaskTable(getTasksForTab('all'))}</TabsContent>
              <TabsContent value="critical">{renderTaskTable(getTasksForTab('critical'))}</TabsContent>
              <TabsContent value="at_risk">{renderTaskTable(getTasksForTab('at_risk'))}</TabsContent>
              <TabsContent value="unassigned">{renderTaskTable(getTasksForTab('unassigned'))}</TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
