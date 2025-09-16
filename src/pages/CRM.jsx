
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users, TrendingUp, Target, MessageSquare, Phone, Mail, Calendar,
  MapPin, Edit, MoreHorizontal, Plus, Search, Filter, Eye, DollarSign,
  CheckCircle, AlertTriangle, Clock, Star, Building2, FileText, AlertCircle,
  Lightbulb, BarChart3, Activity, CreditCard, ShoppingCart, Settings,
  Download, Send, HeartHandshake, Zap, PieChart, Percent, Play, Trophy, Copy,
  ArrowRight, Truck, Package, Plane, CheckSquare, TrendingDown,
  Banknote, Flame, LineChart, Bot, Columns3, RotateCcw, XCircle, Check, X, Save
} from "lucide-react";

import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { useLocation } from "react-router-dom"; // Import useLocation

// Importar entidades CRM
import { CrmAccount } from "@/api/entities";
import { CrmContact } from "@/api/entities";
import { CrmLead } from "@/api/entities";

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <Card className="bg-white shadow-sm" style={{
    boxShadow: '0 8px 24px rgba(0,0,0,.08)',
    borderRadius: '16px',
    fontFamily: 'Montserrat, sans-serif'
  }}>
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[12px] font-medium text-gray-600">{title}</p>
          <p className="text-[22px] font-semibold text-gray-900 mt-1">
            {value}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${color.replace('-500', '-100')}`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-2 text-[12px] font-medium text-green-600">
          <TrendingUp className="w-3 h-3 mr-1" />
          {trend}
        </div>
      )}
    </CardContent>
  </Card>
);

// Feature flag para redirects
const useFeatureFlag = (flagName) => {
  const flags = {
    'FF_CLIENTES_OWNER_UI': true,
    'FF_HIDE_CRM_NAV': true
  };
  return flags[flagName] || false;
};

export default function CRMPage() {
  const location = useLocation();
  const isClientesOwner = useFeatureFlag('FF_CLIENTES_OWNER_UI');
  
  // Redirects 308 permanentes cuando Clientes es owner
  React.useEffect(() => {
    if (isClientesOwner) {
      const urlParams = new URLSearchParams(location.search);
      const tab = urlParams.get('tab') || 'dashboard';
      
      console.log('[CLIENTES-OWNER] Redirecting CRM to Clientes, tab:', tab);
      
      // Mapeo de tabs CRM a Clientes
      const tabMapping = {
        'dashboard': 'dashboard',
        'clientes': 'clientes',
        'leads': 'leads', 
        'actividades': 'actividades',
        'marketing': 'marketing',
        'postventa': 'postventa',
        'analytics': 'analytics'
      };
      
      const newTab = tabMapping[tab] || 'dashboard';
      const newUrl = `/Clientes?tab=${newTab}`;
      
      // 308 Permanent Redirect (simulated with window.location.replace)
      window.location.replace(newUrl);
      return; // Stop rendering current component as a redirect is happening
    }
  }, [location, isClientesOwner]);

  // Si no hay redirección, mostrar contenido normal
  const urlParams = new URLSearchParams(window.location.search);
  let tab = urlParams.get('tab') || 'dashboard';

  const { toast } = useToast();

  // Estados para el módulo CRM
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAccount360, setShowAccount360] = useState(false);
  const [clientesTab, setClientesTab] = useState('cuentas');
  const [account360Tab, setAccount360Tab] = useState('resumen');
  const [currentView, setCurrentView] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  const [selectedContactIds, setSelectedContactIds] = useState([]);

  // Mover el estado de la vista de Leads aquí
  const [leadsView, setLeadsView] = useState('leads');

  // Filtros avanzados para cuentas
  const [accountFilters, setAccountFilters] = useState({
    search: '',
    sector: 'all',
    country: 'all',
    owner: 'all',
    estado: 'all',
    tags: 'all', // Though not fully implemented in UI, state for it.
    dso_min: '',
    dso_max: '',
    health_min: '',
    health_max: '',
    ar_min: '',
    ar_max: '',
    credit_hold: false,
    facturas_vencidas: false,
    oportunidades_abiertas: false,
    actividad_reciente: false,
    fecha_desde: '',
    fecha_hasta: ''
  });

  // Filtros para contactos
  const [contactFilters, setContactFilters] = useState({
    search: '',
    account: 'all',
    role: 'all',
    language: 'all',
    owner: 'all',
    whatsapp: 'all',
    bounce: false
  });

  // Estados para LEADS - REEMPLAZAR COMPLETAR
  const [selectedLead, setSelectedLead] = useState(null); // Keep for lead details
  const [showLeadModal, setShowLeadModal] = useState(false); // Keep for creating new lead
  const [showLead360, setShowLead360] = useState(false); // Keep for lead 360 view
  const [leadSearch, setLeadSearch] = useState(''); // New state for Leads search filter
  const [leadEtapaFilter, setLeadEtapaFilter] = useState('all'); // New state for Leads etapa filter
  const [leadPropietarioFilter, setLeadPropietarioFilter] = useState('all'); // New state for Leads propietario filter

  // ADD: Move forecast period state to component level (no longer used in current context, but was left in place by previous dev)
  const [forecastPeriod, setForecastPeriod] = useState('Q4 2025');

  // States for ACTIVIDADES & COMUNICACIONES según JSON Base44 - AGREGAR ESTOS
  const [actividadesTab, setActividadesTab] = useState('Conversaciones');
  const [conversacionesFilters, setConversacionesFilters] = useState({
    channel: 'Todos',
    owner: 'all',
    estado: 'all',
    sla: 'all',
    hasOpenOpp: false
  });
  const [selectedConversations, setSelectedConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showConversationDetail, setShowConversationDetail] = useState(false);

  // Estados para Agenda
  const [calendarView, setCalendarView] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Estados para Tareas
  const [tareasFilters, setTareasFilters] = useState({
    owner: 'all',
    status: 'all',
    prioridad: 'all',
    fecha_desde: '',
    fecha_hasta: ''
  });
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Estados para Emails/Llamadas
  const [emailThreads, setEmailThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [showCallLoggerModal, setShowCallLoggerModal] = useState(false);
  const [emailFilters, setEmailFilters] = useState({
    owner: 'all',
    related_to: 'all',
    fecha_desde: '',
    fecha_hasta: ''
  });

  // Estados para MARKETING según JSON Base44 - AGREGAR ESTOS
  const [marketingTab, setMarketingTab] = useState('Campañas');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showOfferEditor, setShowOfferEditor] = useState(false);
  const [launchingCampaign, setLaunchingCampaign] = useState(false);
  const [calculatingSegment, setCalculatingSegment] = useState(false);

  // Estados del Campaign Builder según JSON
  const [campaignData, setCampaignData] = useState({
    goal: '',
    kpi: '',
    audience_query: '',
    size_estimate: '---',
    channels: [],
    budget: '',
    schedule: { start: '', end: '' },
    subject: '',
    message: '',
    cta: '',
    assets: []
  });

  // Estados para filtros
  const [campaignFilters, setCampaignFilters] = useState({
    estado: 'all',
    canal: 'all',
    fecha_desde: '',
    fecha_hasta: ''
  });

  const [offerFilters, setOfferFilters] = useState({
    estado: 'all',
    segmento: '',
    vigencia_desde: '',
    vigencia_hasta: ''
  });

  const [pricingData, setPricingData] = useState({
    margen_objetivo_pct: 18,
    min_margin_pct: 12.5,
    modelo_elasticidad: 'Lineal',
    parametros_elasticidad: {},
    bundle_rules: {}
  });

  // Estados para POSTVENTA según JSON Base44 - AGREGAR ESTOS
  const [postventaTab, setPostventaTab] = useState('Soporte');
  const [selectedSupportCase, setSelectedSupportCase] = useState(null);
  const [showCaseDrawer, setShowCaseDrawer] = useState(false);
  const [showPromiseModal, setShowPromiseModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [processingWorkflow, setProcessingWorkflow] = useState(false);

  // Estados para filtros de Soporte
  const [soporteFilters, setSoporteFilters] = useState({
    estado: 'all',
    prioridad: 'all',
    owner: 'all',
    canal: 'all',
    fecha_desde: '',
    fecha_hasta: ''
  });

  // Estados para filtros de NPS
  const [npsFilters, setNpsFilters] = useState({
    score: 'all',
    segmento: '',
    owner: 'all',
    fecha_desde: '',
    fecha_hasta: ''
  });

  // Estados para filtros de Cobranza
  const [cobranzaFilters, setCobranzaFilters] = useState({
    bucket: 'all',
    estado: 'all',
    owner: 'all'
  });

  // Estados para modal de promesa
  const [promiseData, setPromiseData] = useState({
    promise_date: '',
    promise_amount: '',
    notes: ''
  });

  // Estados para ANALYTICS según JSON Base44 - AGREGAR ESTOS
  const [analyticsTab, setAnalyticsTab] = useState('Resumen');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [exportingAnalytics, setExportingAnalytics] = useState(false);

  // Global filters para Analytics (fecha obligatoria según JSON)
  const [analyticsGlobalFilters, setAnalyticsGlobalFilters] = useState({
    date_desde: '2025-08-01',
    date_hasta: '2025-08-31',
    country: [],
    sector: [],
    owner: 'all',
    channel: []
  });

  // Mock data para Analytics según JSON structure - COMPLETAR DATOS
  const mockAnalyticsData = {
    kpis: {
      leads: 234,
      oportunidades: 67,
      win_rate: 34.5,
      revenue: 456700,
      cobrado: 289300,
      dso: 42.8
    },
    funnel: [
      { etapa: "Leads", cantidad: 234, tasa_conversion: 100, tiempo_promedio_dias: 0, drop_off: 0 },
      { etapa: "Calificado", cantidad: 156, tasa_conversion: 66.7, tiempo_promedio_dias: 2.3, drop_off: 33.3 },
      { etapa: "Propuesta", cantidad: 89, tasa_conversion: 57.1, tiempo_promedio_dias: 8.1, drop_off: 42.9 },
      { etapa: "Negociación", cantidad: 45, tasa_conversion: 50.6, tiempo_promedio_dias: 12.5, drop_off: 49.4 },
      { etapa: "Cierre (Ganadas)", cantidad: 23, tasa_conversion: 51.1, tiempo_promedio_dias: 18.7, drop_off: 48.9 },
      { etapa: "Orden", cantidad: 20, tasa_conversion: 87.0, tiempo_promedio_dias: 3.2, drop_off: 13.0 },
      { etapa: "Cobrado", cantidad: 15, tasa_conversion: 75.0, tiempo_promedio_dias: 34.5, drop_off: 25.0 }
    ],
    revenueEvolution: [
      { mes: 'Jun', ingresos: 289000, cobranza: 245000 },
      { mes: 'Jul', ingresos: 367000, cobranza: 298000 },
      { mes: 'Ago', ingresos: 456700, cobranza: 389200 }
    ],
    leadsOppEvolution: [
      { mes: 'Jun', leads: 198, oportunidades: 54 },
      { mes: 'Jul', leads: 267, oportunidades: 71 },
      { mes: 'Ago', leads: 234, oportunidades: 67 }
    ],
    cohorts: [
      { cohorte: "2025-06", mes_0: 100, mes_1: 85.2, mes_2: 73.4, mes_3: 68.9, mes_4: 65.1, mes_5: 61.7, mes_6: 58.3 },
      { cohorte: "2025-07", mes_0: 100, mes_1: 88.1, mes_2: 76.8, mes_3: 71.2, mes_4: 67.4, mes_5: 64.8, mes_6: null },
      { cohorte: "2025-08", mes_0: 100, mes_1: 89.7, mes_2: 78.1, mes_3: null, mes_4: null, mes_5: null, mes_6: null }
    ],
    revenueSources: [
      { fuente: "Inbound", canal: "WhatsApp", ingresos: 167800, oportunidades: 23, win_rate: 45.2, ticket_promedio: 7296 },
      { fuente: "Outbound", canal: "Email", ingresos: 134500, oportunidades: 18, win_rate: 38.9, ticket_promedio: 7472 },
      { fuente: "Marketing", canal: "Ads: Google", ingresos: 89200, oportunidades: 12, win_rate: 41.7, ticket_promedio: 7433 },
      { fuente: "Referrals", canal: "Web", ingresos: 65200, oportunidades: 14, win_rate: 50.0, ticket_promedio: 4657 }
    ],
    aiAttribution: {
      revenue_ai: 189400,
      pct_ai: 41.5,
      uplift: 23.8
    },
    dsoEvolution: [
      { mes: 'Jun', dso: 45.2 },
      { mes: 'Jul', dso: 43.8 },
      { mes: 'Ago', dso: 42.8 }
    ],
    agingBuckets: [
      { bucket: "0-30 días", clientes: 45, monto: 123500, pct: 42.7 },
      { bucket: "31-60 días", clientes: 23, monto: 89200, pct: 30.8 },
      { bucket: "61-90 días", clientes: 12, monto: 45600, pct: 15.8 },
      { bucket: "90+ días", clientes: 8, monto: 31200, pct: 10.7 }
    ],
    churnData: {
      churn_rate: 8.3,
      net_retention: 91.7,
      trend: [
        { mes: 'Jun', churn: 9.1, retention: 90.9 },
        { mes: 'Jul', churn: 8.7, retention: 91.3 },
        { mes: 'Ago', churn: 8.3, retention: 91.7 }
      ]
    },
    insights: [
      {
        id: "anomaly-001",
        title: "Anomalía en Pipeline",
        severity: "warning",
        agent: "HELIX-HEALTH",
        message: "Win rate del sector Textil ha bajado 15% vs promedio histórico",
        recomendacion: "Revisar pricing strategy y competencia en Textil",
        fecha: "2025-08-29T16:45:00Z"
      },
      {
        id: "pricing-001",
        title: "Alerta de Pricing/Margen",
        severity: "critical",
        agent: "QUANT-PRICER",
        message: "23% de cotizaciones bajo margen mínimo (12.5%) en último mes",
        recomendacion: "Revisar tarifario base o ajustar margen objetivo",
        fecha: "2025-08-29T14:20:00Z"
      },
      {
        id: "health-001",
        title: "Cuenta en Riesgo (Health/NPS)",
        severity: "info",
        agent: "ECHO-NPS",
        message: "German Auto Parts: NPS=4 + aumento DSO sugieren riesgo churn",
        recomendacion: "Asignar Account Manager senior y revisar términos comerciales",
        fecha: "2025-08-29T12:10:00Z"
      }
    ]
  };

  // SEED DATA PARA DASHBOARD CRM según especificación
  const dashboardData = {
    kpis: {
      pipeline_value: { value: 2450000, trend: "+12.8%", status: "success" },
      hit_rate_30d: { value: 0.234, trend: "+3.2pp", status: "success" },
      quote_tat_p50: { value: 4.2, trend: "-0.8h", status: "success" },
      quote_tat_p90: { value: 12.5, trend: "-2.1h", status: "success" },
      approval_latency: { value: 18.5, trend: "+5.2h", status: "warning" },
      forecast_mape: { value: 0.165, trend: "-0.03", status: "success" },
      margin_leakage: { value: 0.048, trend: "+0.01", status: "warning" },
      stalled_deals: { value: 23, trend: "-5", status: "success" },
      fill_rate: { value: 0.892, trend: "+2.1%", status: "success" },
      orders_per_week: { value: 67, trend: "+8", status: "success" },
      ar_overdue: { value: 145000, trend: "-12000", status: "success" }
    },
    charts: {
      pipeline_by_stage: [
        { stage: "Lead", amount: 450000, count: 89 },
        { stage: "Oportunidad", amount: 680000, count: 45 },
        { stage: "Cotizado", amount: 920000, count: 32 },
        { stage: "Negociación", amount: 400000, count: 18 }
      ],
      conversion_funnel: [
        { name: "Lead", value: 890, percentage: 100 },
        { name: "Oportunidad", value: 245, percentage: 27.5 },
        { name: "Cotizado", value: 89, percentage: 10.0 },
        { name: "Ganado", value: 23, percentage: 2.6 }
      ],
      hit_rate_by_lane: [
        { lane: "FCL Asia-Europe", rate: 0.28, deals: 45 },
        { lane: "Air Latam-USA", rate: 0.31, deals: 23 },
        { lane: "LCL Intra-EU", rate: 0.19, deals: 67 },
        { lane: "Road EU-UK", rate: 0.42, deals: 18 }
      ],
      price_delta_vs_market: [
        { date: "2024-01", delta: 0.05 },
        { date: "2024-02", delta: 0.08 },
        { date: "2024-03", delta: 0.12 },
        { date: "2024-04", delta: 0.07 },
        { date: "2024-05", delta: 0.15 },
        { date: "2024-06", delta: 0.09 }
      ]
    },
    tables: {
      risky_deals: [
        {
          id: "OPP-2024-001",
          opportunity: "ACME Corp - Q4 Logistics",
          owner: "Ana García",
          lane: "FCL Asia-Europe",
          stage: "Negociación",
          probability: 65,
          risk_score: 0.78,
          reason: "No contacto en 12 días",
          last_activity: "2024-12-14T10:30:00Z",
          next_action: "Follow-up call"
        },
        {
          id: "OPP-2024-002",
          opportunity: "Global Shippers - Air Express",
          owner: "Carlos Ruiz",
          lane: "Air Latam-USA",
          stage: "Cotizado",
          probability: 80,
          risk_score: 0.65,
          reason: "Competencia agresiva",
          last_activity: "2024-12-13T15:45:00Z",
          next_action: "Price review"
        }
      ],
      tasks_due: [
        { when: "2024-12-26T09:00:00Z", type: "call", account: "ACME Corp", subject: "Follow-up negociación", owner: "Ana García" },
        { when: "2024-12-26T14:00:00Z", type: "meeting", account: "Tech Solutions", subject: "Presentación propuesta", owner: "Luis Pérez" },
        { when: "2024-12-27T10:30:00Z", type: "email", account: "Global Logistics", subject: "Envío cotización", owner: "María López" }
      ],
      stuck_quotes: [
        { quote: "Q-2024-0456", account: "ACME Corp", lane: "FCL Asia-Europe", age_days: 8, version: "v2", approval_state: "pending", owner: "Ana García" },
        { quote: "Q-2024-0459", account: "Express Inc", lane: "Air Europe-USA", age_days: 12, version: "v1", approval_state: "approved", owner: "Carlos Ruiz" }
      ],
      churn_watch: [
        { account: "Old Reliable Ltd", ar_overdue: 45000, orders_30d: 2, fill_rate: 0.45, risk_reason: "Declining orders + payment delays" },
        { account: "Seasonal Corp", ar_overdue: 12000, orders_30d: 0, fill_rate: 0.89, risk_reason: "No orders this month" }
      ]
    }
  };

  // Formatter según especificación
  const formatters = {
    currency: (value) => new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value),
    percent: (value) => new Intl.NumberFormat('es-ES', {
      style: 'percent',
      maximumFractionDigits: 1
    }).format(value),
    duration: (value) => `${value}h`,
    integer: (value) => new Intl.NumberFormat('es-ES').format(value)
  };

  // KPI Card mejorada para Dashboard CRM
  const CRMKPICard = ({ id, label, value, format, trend, status, thresholds = [] }) => {
    const getStatusColor = (status) => {
      const colors = {
        success: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-600' },
        warning: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-600' },
        danger: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-600' },
        info: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-600' }
      };
      return colors[status] || colors.info;
    };

    const formatValue = (val, fmt) => {
      switch (fmt) {
        case 'currency':
          return formatters.currency(val);
        case 'percent':
        case 'percent_lower_is_better':
          return formatters.percent(val);
        case 'duration':
          return formatters.duration(val);
        case 'integer':
          return formatters.integer(val);
        default:
          return val;
      }
    };

    const statusColors = getStatusColor(status);

    return (
      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200" style={{ boxShadow: '0 6px 18px rgba(0,0,0,0.06)', borderRadius: '16px' }}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {label}
              </p>
              <p className="text-xl font-semibold" style={{ fontFamily: 'Montserrat, sans-serif', color: '#1F2937' }}>
                {formatValue(value, format)}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${statusColors.bg}`}>
              <div className={`w-2 h-2 rounded-full ${statusColors.icon.replace('text-', 'bg-')}`}></div>
            </div>
          </div>
          {trend && (
            <div className={`flex items-center text-xs font-medium ${statusColors.text}`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Helper para aplicar filtros globales
  const applyAnalyticsFilters = () => {
    setAnalyticsLoading(true);
    setTimeout(() => {
      setAnalyticsLoading(false);
      toast({
        title: "Filtros aplicados",
        description: "Analytics actualizado",
        status: "success"
      });
    }, Math.random() * 700 + 800);
  };

  // Helper para exportar analytics
  const exportAnalytics = () => {
    setExportingAnalytics(true);
    setTimeout(() => {
      setExportingAnalytics(false);
      toast({
        title: "Exportado",
        description: "Reporte Analytics exportado correctamente",
        status: "success"
      });
    }, Math.random() * 400 + 300);
  };

  // Mock data para campañas según JSON structure
  const mockCampañas = [
    {
      id: "camp-001",
      name: "Q4 Logistics Solutions",
      goal: "Generar leads",
      channels: ["Email", "Ads: Google"],
      start_at: "2025-09-01T00:00:00Z",
      end_at: "2025-12-31T23:59:59Z",
      estado: "Activa",
      kpi: "Leads",
      leads: 45,
      oportunidades: 12,
      revenue_atribuido: 125000,
      owner: "Ana García",
      audience_query: "sector = 'Manufacturing' AND country IN ('ES','FR','DE')",
      budget: 5000,
      subject: "Optimiza tu logística Q4",
      message: "Descubre cómo reducir costos logísticos un 25%",
      cta: "Agendar demo",
      metrics_json: {
        entregados: 2400,
        abiertos: 960,
        clicks: 145,
        respuestas: 89
      }
    },
    {
      id: "camp-002",
      name: "Reactivación Textile EU",
      goal: "Reactivar cuentas",
      channels: ["WhatsApp", "Email"],
      start_at: "2025-08-15T00:00:00Z",
      end_at: "2025-09-15T23:59:59Z",
      estado: "Pausada",
      kpi: "Oportunidades",
      leads: 23,
      oportunidades: 8,
      revenue_atribuido: 67500,
      owner: "María López",
      audience_query: "sector = 'Textil' AND last_order > '2024-01-01' AND health_color = 'yellow'",
      budget: 2500,
      subject: "Nueva temporada textil",
      message: "Presentamos la nueva colección europea",
      cta: "Solicitar cotización",
      metrics_json: {
        entregados: 1200,
        abiertos: 456,
        clicks: 67,
        respuestas: 34
      }
    },
    {
      id: "camp-003",
      name: "Food Export Summit",
      goal: "Tráfico web",
      channels: ["Blog/SEO", "Ads: Meta"],
      start_at: "2025-10-01T00:00:00Z",
      end_at: "2025-10-31T23:59:59Z",
      estado: "Borrador",
      kpi: "CTR",
      leads: 0,
      oportunidades: 0,
      revenue_atribuido: 0,
      owner: "Carlos Ruiz",
      audience_query: "sector = 'Alimentación' AND country IN ('PE','CL','CO')",
      budget: 8000,
      subject: "Food Export Summit 2025",
      message: "Conecta con los mejores importadores europeos",
      cta: "Registrarse",
      metrics_json: {
        entregados: 0,
        abiertos: 0,
        clicks: 0,
        respuestas: 0
      }
    }
  ];

  // Mock data para ofertas
  const mockOfertas = [
    {
      id: "offer-001",
      name: "Early Bird Q4",
      segmento: "Manufacturing EU",
      vigencia_inicio: "2025-09-01T00:00:00Z",
      vigencia_fin: "2025-09-30T23:59:59Z",
      estado: "Activa",
      owner: "Ana García",
      beneficio: "15% descuento primeras 100 órdenes",
      canales: ["Email", "WhatsApp"],
      activaciones: 34,
      revenue_generado: 45600
    },
    {
      id: "offer-002",
      name: "Bundle Textil+Logística",
      segmento: "Textil Francia",
      vigencia_inicio: "2025-08-15T00:00:00Z",
      vigencia_fin: "2025-10-15T23:59:59Z",
      estado: "Pausada",
      owner: "María López",
      beneficio: "Combo: textil + flete 20% OFF",
      canales: ["Email"],
      activaciones: 12,
      revenue_generado: 23400
    },
    {
      id: "offer-003",
      name: "Food Export Starter",
      segmento: "Alimentación LATAM",
      vigencia_inicio: "2025-10-01T00:00:00Z",
      vigencia_fin: "2025-12-31T23:59:59Z",
      estado: "Borrador",
      owner: "Carlos Ruiz",
      beneficio: "Primera exportación sin costos fijos",
      canales: ["Blog/SEO", "Ads: Meta"],
      activaciones: 0,
      revenue_generado: 0
    }
  ];

  // Mock data para casos de soporte según JSON structure
  const mockSupportCases = [
    {
      id: "support-001",
      fecha: "2025-08-29T14:30:00Z",
      cliente: "FoodTech Peru SAC",
      asunto: "Error en seguimiento de envío",
      prioridad: "Alta",
      estado: "En curso",
      owner: "Ana García",
      sla_status: "ok", // ok, warn, breach
      sla_remaining: "4h 20m",
      canal: "WhatsApp",
      descripcion: "Cliente reporta que el tracking muestra información incorrecta para el envío FT-2025-089",
      adjuntos: ["screenshot-tracking.png"],
      contacto: "María González",
      opportunity_id: "opp-001",
      sales_order_id: "order-001",
      historial: [
        { fecha: "2025-08-29T14:30:00Z", evento: "Caso creado", usuario: "Sistema" },
        { fecha: "2025-08-29T14:35:00Z", evento: "Asignado a Ana García", usuario: "Ana García" },
        { fecha: "2025-08-29T15:10:00Z", evento: "Primera respuesta enviada", usuario: "Ana García" }
      ]
    },
    {
      id: "support-002",
      fecha: "2025-08-29T10:45:00Z",
      cliente: "Textil France SARL",
      asunto: "Documentación aduanera incompleta",
      prioridad: "Crítica",
      estado: "Escalado",
      owner: "María López",
      sla_status: "breach",
      sla_remaining: "Vencido (2h)",
      canal: "Email",
      descripcion: "Faltan documentos de origen para despacho aduanero. Envío retenido en Le Havre.",
      adjuntos: [],
      contacto: "Jean Dupont",
      opportunity_id: "opp-002",
      sales_order_id: "order-002",
      historial: [
        { fecha: "2025-08-29T10:45:00Z", evento: "Caso creado", usuario: "Sistema" },
        { fecha: "2025-08-29T11:00:00Z", evento: "Escalado a supervisor", usuario: "María López" }
      ]
    },
    {
      id: "support-003",
      fecha: "2025-08-29T16:20:00Z",
      cliente: "German Auto Parts GmbH",
      asunto: "Solicitud cambio de dirección entrega",
      prioridad: "Media",
      estado: "Pendiente cliente",
      owner: "Carlos Ruiz",
      sla_status: "ok",
      sla_remaining: "18h 40m",
      canal: "Web",
      descripcion: "Cliente solicita cambio de dirección de entrega de Munich a Frankfurt para orden GAP-2025-023",
      adjuntos: ["nueva-direccion.pdf"],
      contacto: "Klaus Mueller",
      opportunity_id: null,
      sales_order_id: "order-003",
      historial: [
        { fecha: "2025-08-29T16:20:00Z", evento: "Caso creado", usuario: "Sistema" },
        { fecha: "2025-08-29T16:25:00Z", evento: "Información solicitada al cliente", usuario: "Carlos Ruiz" }
      ]
    }
  ];

  // Mock data para NPS según JSON structure
  const mockNpsData = [
    {
      id: "nps-001",
      fecha: "2025-08-28T12:00:00Z",
      cliente: "FoodTech Peru SAC",
      contacto: "María González",
      score: 9,
      comentario: "Excelente servicio, muy profesionales y puntuales.",
      segmento: "Alimentación",
      follow_up: "Pendiente",
      owner: "Ana García",
      tipo: "Promotor"
    },
    {
      id: "nps-002",
      fecha: "2025-08-27T15:30:00Z",
      cliente: "Textil France SARL",
      contacto: "Jean Dupont",
      score: 4,
      comentario: "Problemas con documentación y retrasos en la entrega.",
      segmento: "Textil",
      follow_up: "Completado",
      owner: "María López",
      tipo: "Detractor"
    },
    {
      id: "nps-003",
      fecha: "2025-08-26T09:15:00Z",
      cliente: "German Auto Parts GmbH",
      contacto: "Klaus Mueller",
      score: 8,
      comentario: "Buen servicio en general, algunos aspectos mejorables.",
      segmento: "Automoción",
      follow_up: "No requerido",
      owner: "Carlos Ruiz",
      tipo: "Neutral"
    },
    {
      id: "nps-004",
      fecha: "2025-08-25T14:45:00Z",
      cliente: "Milano Fashion House SRL",
      contacto: "Giuseppe Rossi",
      score: 10,
      comentario: "Perfecta gestión logística, recomendamos 100%.",
      segmento: "Textil",
      follow_up: "Pendiente",
      owner: "Ana García",
      tipo: "Promotor"
    }
  ];

  // Mock data para cobranza/aging según JSON structure
  const mockAgingData = [
    {
      id: "ar-001",
      cliente: "FoodTech Peru SAC",
      monto: 12500,
      dias: 45,
      bucket: "31-60",
      promesa: "2025-09-05",
      estado: "Promesa",
      owner: "Ana García",
      invoice_id: "inv-001"
    },
    {
      id: "ar-002",
      cliente: "Textil France SARL",
      monto: 8900,
      dias: 75,
      bucket: "61-90",
      promesa: null,
      estado: "Recordado",
      owner: "María López",
      invoice_id: "inv-002"
    },
    {
      id: "ar-003",
      cliente: "German Auto Parts GmbH",
      monto: 15600,
      dias: 120,
      bucket: "90+",
      promesa: "2025-08-30",
      estado: "Incumplido",
      owner: "Carlos Ruiz",
      invoice_id: "inv-003"
    },
    {
      id: "ar-004",
      cliente: "Milano Fashion House SRL",
      monto: 5400,
      dias: 25,
      bucket: "0-30",
      promesa: null,
      estado: "Sin gestión",
      owner: "Ana García",
      invoice_id: "inv-004"
    }
  ];


  // Stub workflows según JSON spec
  const marketingLaunchCampaign = async (campaignId) => {
    setLaunchingCampaign(true);
    console.log('🚀 marketing_launch_campaign workflow:', campaignId);

    // Simular delay según JSON: 250-600ms
    await new Promise(resolve => setTimeout(resolve, Math.random() * 350 + 250));

    try {
      // Simular programación de envíos
      const campaign = mockCampañas.find(c => c.id === campaignId);
      if (campaign) {
        // Simular telemetría
        console.log('📊 Telemetry: campaign_launched', {
          entity: 'campaign',
          entity_id: campaignId,
          owner: campaign.owner,
          channels: campaign.channels,
          latency_ms: 425
        });

        toast({
          title: "Campaña lanzada",
          description: `Campaña "${campaign.name}" lanzada correctamente. Programando envíos...`,
          status: "success"
        });

        // Actualizar estado a Activa (simulado)
        campaign.estado = 'Activa';
        return { success: true, scheduled_sends: campaign.channels.length * 100 };
      } else {
         // Handle new campaign case
         toast({
          title: "Nueva campaña lanzada",
          description: `Nueva campaña lanzada correctamente. Programando envíos...`,
          status: "success"
        });
         return { success: true, scheduled_sends: campaignData.channels.length * 100 };
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al lanzar campaña",
        status: "error"
      });
      throw error;
    } finally {
      setLaunchingCampaign(false);
    }
  };

  const marketingOfferSync = async (offerId) => {
    console.log('🔄 marketing_offer_sync workflow:', offerId);

    // Simular delay según JSON: 200-400ms
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 200));

    try {
      const offer = mockOfertas.find(o => o.id === offerId);
      if (offer) {
        console.log('📊 Telemetry: offer_published', {
          entity: 'offer',
          entity_id: offerId,
          owner: offer.owner,
          channels: offer.canales,
          latency_ms: 325
        });

        toast({
          title: "Oferta sincronizada",
          description: `Oferta "${offer.name}" sincronizada con ${offer.canales.join(', ')}`,
          status: "success"
        });
        return { success: true, channels_synced: offer.canales.length };
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al sincronizar oferta",
        status: "error"
      });
      throw error;
    }
  };

  const previewSegment = async () => {
    setCalculatingSegment(true);

    // Simular cálculo de segmento
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Stub calculation basado en audience_query
      const estimatedSize = Math.floor(Math.random() * 500) + 100;
      setCampaignData(prev => ({
        ...prev,
        size_estimate: `~${estimatedSize} contactos`
      }));

      toast({
        title: "Segmento calculado",
        description: `Segmento calculado: ${estimatedSize} contactos elegibles`,
        status: "success"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al calcular segmento",
        status: "error"
      });
    } finally {
      setCalculatingSegment(false);
    }
  };

  // Cálculo de KPIs NPS según JSON rules
  const calculateNpsMetrics = () => {
    const total = mockNpsData.length;
    const promotores = mockNpsData.filter(n => n.score >= 9).length;
    const neutrales = mockNpsData.filter(n => n.score >= 7 && n.score <= 8).length;
    const detractores = mockNpsData.filter(n => n.score <= 6).length;

    const promotoresPct = ((promotores / total) * 100).toFixed(1);
    const neutralesPct = ((neutrales / total) * 100).toFixed(1);
    const detractoresPct = ((detractores / total) * 100).toFixed(1);

    const npsScore = promotores / total * 100 - detractores / total * 100;

    return {
      nps_actual: Math.round(npsScore),
      promotores: promotoresPct,
      neutrales: neutralesPct,
      detractores: detractoresPct
    };
  };

  // Helper para obtener color del score NPS
  const getNpsScoreColor = (score) => {
    if (score >= 9) return 'bg-green-100 text-green-800'; // Promotor
    if (score >= 7) return 'bg-yellow-100 text-yellow-800'; // Neutral
    return 'bg-red-100 text-red-800'; // Detractor
  };

  // Stub workflows según JSON spec
  const executeWorkflow = async (workflowName, payload) => {
    setProcessingWorkflow(true);
    console.log(`🔄 ${workflowName} workflow invoked:`, payload);

    const delays = {
      'nps_trigger_post_pod': [200, 400],
      'nps_handling_detractor_promoter': [150, 300],
      'accounts_receivable_dunning': [200, 400],
      'health_score_refresh': [150, 250],
      'alerta_credit_hold': [120, 220],
      'support_case_escalated': [100, 200],
      'support_case_closed': [100, 200]
    };

    const [min, max] = delays[workflowName] || [200, 400];
    await new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));

    setProcessingWorkflow(false);

    // Simular efectos según JSON spec
    switch(workflowName) {
      case 'nps_trigger_post_pod':
        toast({ title: "Encuesta NPS enviada por WhatsApp/Email", status: "success" });
        break;
      case 'accounts_receivable_dunning':
        toast({ title: "Recordatorio enviado y próximos hitos programados", status: "success" });
        break;
      case 'health_score_refresh':
        toast({ title: "Health score recalculado", status: "success" });
        break;
      case 'alerta_credit_hold':
        toast({ title: "Cuenta marcada en Credit Hold y owners notificados", status: "success" });
        break;
      case 'support_case_escalated':
        toast({ title: "Caso de soporte escalado a supervisor.", status: "success" });
        break;
      case 'support_case_closed':
        toast({ title: "Caso de soporte cerrado.", status: "success" });
        break;
      default:
        toast({ title: `Workflow ${workflowName} completado`, status: "success" });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const accountsData = await CrmAccount.list();
      const contactsData = await CrmContact.list();
      setAccounts(accountsData);
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading CRM data:', error);
    }
  };

  // Mock data expandido para cuentas
  const mockAccountsData = [
    {
      id: "acc-001",
      name: "Textiles Barcelona SA",
      tax_id: "ESA12345678",
      sector: "Textil",
      country: "España",
      size: "grande",
      estado: "Cliente",
      dso: 25,
      health_score: 8.5,
      ar_pendiente: 15430.50,
      ultima_actividad: 3,
      owner: "Ana García",
      credit_hold: false,
      oportunidades_abiertas: 2,
      opp_value: 45000,
      logo_inicial: "TB",
      email_domain: "textiles.com",
      tags: ["textiles", "exportador", "premium"]
    },
    {
      id: "acc-002",
      name: "European Coffee SL",
      tax_id: "ESB87654321",
      sector: "Alimentación",
      country: "España",
      size: "mediana",
      estado: "Prospecto",
      dso: 65,
      health_score: 4.2,
      ar_pendiente: 8750.00,
      ultima_actividad: 21,
      owner: "Carlos Ruiz",
      credit_hold: true,
      oportunidades_abiertas: 0,
      opp_value: 0,
      logo_inicial: "EC",
      email_domain: "europeancoffee.es",
      tags: ["alimentacion", "importador"]
    },
    {
      id: "acc-003",
      name: "Tech Innovations GmbH",
      tax_id: "DE123456789",
      sector: "Tecnología",
      country: "Alemania",
      size: "startup",
      estado: "Cliente",
      dso: 42,
      health_score: 7.8,
      ar_pendiente: 22100.75,
      ultima_actividad: 7,
      owner: "María López",
      credit_hold: false,
      oportunidades_abiertas: 1,
      opp_value: 78000,
      logo_inicial: "TI",
      email_domain: "techinnovations.de",
      tags: ["tecnologia", "startup", "innovacion"]
    },
    {
      id: "acc-004",
      name: "Logística del Sur SA",
      tax_id: "ESA98765432",
      sector: "Logística",
      country: "España",
      size: "mediana",
      estado: "Cliente",
      dso: 35,
      health_score: 7.0,
      ar_pendiente: 5000.00,
      ultima_actividad: 10,
      owner: "Ana García",
      credit_hold: false,
      oportunidades_abiertas: 0,
      opp_value: 0,
      logo_inicial: "LS",
      email_domain: "logisticadelsur.es",
      tags: ["logistica", "nacional"]
    },
    {
      id: "acc-005",
      name: "Fashion Forward S.A.R.L.",
      tax_id: "FR123456789",
      sector: "Textil",
      country: "Francia",
      size: "grande",
      estado: "Prospecto",
      dso: 0,
      health_score: 6.5,
      ar_pendiente: 0,
      ultima_actividad: 5,
      owner: "María López",
      credit_hold: false,
      oportunidades_abiertas: 1,
      opp_value: 120000,
      logo_inicial: "FF",
      email_domain: "fashionforward.fr",
      tags: ["moda", "francia"]
    }
  ];

  // Mock data expandido para contactos
  const mockContactsData = [
    {
      id: "cont-001",
      name: "Ana García Martín",
      account_id: "acc-001",
      account_name: "Textiles Barcelona SA",
      email: "ana.garcia@textiles.com",
      phone: "+34 93 123 4567",
      role: "Directora Compras",
      language: "Español",
      owner: "Ana García",
      whatsapp_optin: true,
      principal: true,
      ultima_interaccion: 2,
      nps: 9,
      rebotado: false
    },
    {
      id: "cont-002",
      name: "John Smith",
      account_id: "acc-002",
      account_name: "European Coffee SL",
      email: "john@europeancoffee.es",
      phone: "+34 91 987 6543",
      role: "CEO",
      language: "Inglés",
      owner: "Carlos Ruiz",
      whatsapp_optin: false,
      principal: true,
      ultima_interaccion: 15,
      nps: 6,
      rebotado: false
    },
    {
      id: "cont-003",
      name: "Klaus Weber",
      account_id: "acc-003",
      account_name: "Tech Innovations GmbH",
      email: "klaus@techinnovations.de",
      phone: "+49 30 555 1234",
      role: "CTO",
      language: "Alemán",
      owner: "María López",
      whatsapp_optin: true,
      principal: false,
      ultima_interaccion: 5,
      nps: 8,
      rebotado: false
    },
    {
      id: "cont-004",
      name: "Elena Ramos",
      account_id: "acc-004",
      account_name: "Logística del Sur SA",
      email: "elena.ramos@logisticadelsur.es",
      phone: "+34 954 112 334",
      role: "Gerente Operaciones",
      language: "Español",
      owner: "Ana García",
      whatsapp_optin: true,
      principal: false,
      ultima_interaccion: 8,
      nps: 7,
      rebotado: false
    },
    {
      id: "cont-005",
      name: "Isabelle Dubois",
      account_id: "acc-005",
      account_name: "Fashion Forward S.A.R.L.",
      email: "isabelle.d@fashionforward.fr",
      phone: "+33 1 23 45 67 89",
      role: "Directora Creativa",
      language: "Francés",
      owner: "María López",
      whatsapp_optin: true,
      principal: true,
      ultima_interaccion: 3,
      nps: 10,
      rebotado: false
    }
  ];

  // Mock data expandido para Leads con campos requeridos
  const mockLeadsData = [
    {
      id: "lead-001",
      created_at: "2025-08-26T10:30:00Z",
      name: "Carlos Mendoza",
      email: "carlos.mendoza@foodtech.pe",
      phone: "+51 1 234 5678",
      sector: "Alimentación",
      country: "Perú",
      source: "Website",
      score: 85,
      owner: "Ana García",
      status: "calificado", // 'calificado' is also 'qualified' in Spanish, aligns with etapa
      ultima_actividad: 1,
      consent_gdpr: true,
      company: "FoodTech Peru SAC",
      contacto_valido: true,
      necesidad_identificada: true,
      monto_potencial: 50000 // Added for `monto` column in new Leads table
    },
    {
      id: "lead-002",
      created_at: "2025-08-25T15:45:00Z",
      name: "Marie Dubois",
      email: "marie.dubois@textilfrance.fr",
      phone: "+33 1 45 67 89 01",
      sector: "Textil",
      country: "Francia",
      source: "WhatsApp",
      score: 72,
      owner: "María López",
      status: "nuevo", // 'nuevo' aligns with 'new' etapa
      ultima_actividad: 2,
      consent_gdpr: true,
      company: "Textil France SARL",
      contacto_valido: false,
      necesidad_identificada: false,
      monto_potencial: 30000
    },
    {
      id: "lead-003",
      created_at: "2025-08-24T09:20:00Z",
      name: "Hans Weber",
      email: "h.weber@germanauto.de",
      phone: "+49 30 123 4567",
      sector: "Automoción",
      country: "Alemania",
      source: "Email",
      score: 45,
      owner: "Carlos Ruiz",
      status: "dormido", // 'dormido' means 'asleep' or 'stalled'
      ultima_actividad: 15,
      consent_gdpr: false,
      company: "German Auto Parts GmbH",
      contacto_valido: true,
      necesidad_identificada: false,
      monto_potencial: 70000
    },
    {
      id: "lead-004",
      created_at: "2025-08-23T11:00:00Z",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 234 567 8900",
      sector: "Tecnología",
      country: "USA",
      source: "Website",
      score: 60,
      owner: "Ana García",
      status: "contactado", // 'contactado' means 'contacted'
      ultima_actividad: 5,
      consent_gdpr: true,
      company: "Innovate Solutions Inc.",
      contacto_valido: true,
      necesidad_identificada: false,
      monto_potencial: 45000
    },
    {
      id: "lead-005",
      created_at: "2025-08-22T14:00:00Z",
      name: "Luisa Fernandes",
      email: "luisa.f@brazilcorp.br",
      phone: "+55 11 98765-4321",
      sector: "Retail",
      country: "Brasil",
      source: "Referral",
      score: 90,
      owner: "María López",
      status: "convertido", // 'convertido' means 'converted'
      ultima_actividad: 1,
      consent_gdpr: true,
      company: "BrazilCorp",
      contacto_valido: true,
      necesidad_identificada: true,
      monto_potencial: 120000
    }
  ];

  // Mock data expandido para Pipeline con Stage Guards - This data is now not used by `renderLeads`
  // Keeping it as other sections of CRM might still reference it (e.g., Analytics)
  const mockOpportunitiesData = [
    {
      id: "opp-001",
      account_name: "FoodTech Peru SAC",
      country: "Perú",
      amount: 45000,
      currency: "EUR",
      stage: "propuesta",
      probability: 75,
      next_step: "2025-08-30T14:00:00Z",
      next_step_desc: "Presentación técnica",
      owner: "Ana García",
      last_activity: "2025-08-25T10:00:00Z",
      risks: ["high_competition"],
      contacto_valido: true,
      necesidad_identificada: true,
      cotizacion_adjunta: true,
      precio_validado: true,
      aprobacion_descuento_si_aplica: true,
      commit: true
    },
    {
      id: "opp-002",
      account_name: "Textil France SARL",
      country: "Francia",
      amount: 28500,
      currency: "EUR",
      stage: "calificado",
      probability: 60,
      next_step: "2025-08-29T11:30:00Z",
      next_step_desc: "Envío cotización",
      owner: "María López",
      last_activity: "2025-08-26T15:00:00Z",
      risks: [],
      contacto_valido: true,
      necesidad_identificada: true,
      cotizacion_adjunta: false,
      precio_validado: false,
      aprobacion_descuento_si_aplica: true,
      commit: false
    },
    {
      id: "opp-003",
      account_name: "German Auto Parts GmbH",
      country: "Alemania",
      amount: 67200,
      currency: "EUR",
      stage: "negociacion",
      probability: 85,
      next_step: "2025-08-28T16:00:00Z",
      next_step_desc: "Revisión contrato",
      owner: "Carlos Ruiz",
      last_activity: "2025-08-22T09:00:00Z",
      risks: ["budget_constraints"],
      contacto_valido: true,
      necesidad_identificada: true,
      cotizacion_adjunta: true,
      precio_validado: true,
      aprobacion_descuento_si_aplica: false, // Needs approval
      commit: true
    },
    {
      id: "opp-004",
      account_name: "Milano Fashion House SRL",
      country: "Italia",
      amount: 52000,
      currency: "EUR",
      stage: "calificado",
      probability: 50,
      next_step: "2025-08-31T14:00:00Z",
      next_step_desc: "Demo técnico",
      owner: "Ana García",
      last_activity: "2025-08-26T11:00:00Z",
      risks: [],
      contacto_valido: true,
      necesidad_identificada: true,
      cotizacion_adjunta: false,
      precio_validado: false,
      aprobacion_descuento_si_aplica: true,
      commit: false
    }
  ];

  // PATCH A - Tokens de color por etapa del pipeline
  const stagePalette = {
    nuevo: { headerBg: "#E7F0FF", border: "#A6C1FF", chipBg: "#EDF4FF", chipFg: "#274690" },
    calificado: { headerBg: "#E8F5E9", border: "#A8E0B0", chipBg: "#F0FAF2", chipFg: "#0E5F2B" },
    propuesta: { headerBg: "#FFF5CC", border: "#FFE08A", chipBg: "#FFF9DD", chipFg: "#6A4F00" },
    negociacion: { headerBg: "#FFE8D9", border: "#FFCAA8", chipBg: "#FFF0E7", chipFg: "#7A3412" },
    cierre: { headerBg: "#F0EAFE", border: "#D1C4FF", chipBg: "#F6F2FF", chipFg: "#3D2A7A" }
  };

  const statusChips = {
    slaOk: { bg: "#E8F5E9", fg: "#166534" },
    slaWarn: { bg: "#FEF3C7", fg: "#92400E" },
    slaBreach: { bg: "#FEE2E2", fg: "#991B1B", border: "#DA2242" }
  };

  // PATCH B - Textos en español para Forecast
  const forecastI18n = {
    kpiCommit: "Comprometido",
    kpiBest: "Mejor Escenario",
    kpiWeighted: "Ponderado",
    chartTitle: "Proyección de Ventas — Próximos 6 meses",
    tooltipOwner: "Owner",
    tooltipAmount: "Importe"
  };

  // PATCH B - Colores para series del forecast
  const forecastColors = {
    commit: "#16A34A",    // Verde
    bestCase: "#4472C4",  // Azul marca
    weighted: "#6F5BD7"   // Violeta
  };

  // Vistas guardadas predefinidas
  const savedViews = [
    { id: 'all', name: 'Todas las cuentas', isDefault: true },
    { id: 'riesgo', name: 'Riesgo', description: 'DSO>60 OR credit_hold=true OR health_score<6' },
    { id: 'alta_prioridad', name: 'Alta Prioridad', description: 'health_score<6 AND oportunidades_abiertas>0' },
    { id: 'top_revenue', name: 'Top Revenue', description: 'AR_pendiente > percentil 80' }
  ];

  // Vistas guardadas para Leads (previous from opportunities module, keep the structure for now)
  const savedLeadViews = [
    { id: 'all', name: 'Todos los leads', isDefault: true },
    { id: 'prioritarios', name: 'Prioritarios', description: 'score >= 80 AND estado IN (Nuevo, Calificado)' },
    { id: 'dormidos', name: 'Dormidos', description: 'ultima_actividad > 14d' },
    { id: 'inbound', name: 'Inbound', description: 'fuente IN (Website, WhatsApp, Email)' }
  ];

  // Helper functions
  const getDSOBadge = (dso) => {
    if (dso < 30) return { color: "bg-green-100 text-green-800", icon: "🟢" };
    if (dso <= 60) return { color: "bg-yellow-100 text-yellow-800", icon: "🟡" };
    return { color: "bg-red-100 text-red-800", icon: "🔴" };
  };

  const getHealthScoreBadge = (score) => {
    if (score >= 8) return { color: "bg-green-100 text-green-800", label: "Excelente" };
    if (score >= 6) return { color: "bg-yellow-100 text-yellow-800", label: "Bueno" };
    return { color: "bg-red-100 text-red-800", label: "Riesgo" };
  };

  const getEstadoChip = (estado) => {
    const configs = {
      Prospecto: "bg-blue-100 text-blue-800",
      Cliente: "bg-green-100 text-green-800",
      Suspendido: "bg-gray-100 text-gray-800"
    };
    return configs[estado] || configs.Prospecto;
  };

  // Helper functions para Oportunidades mejoradas (now used for Leads)
  const getScoreBadge = (score) => {
    if (score >= 80) return { color: "bg-green-100 text-green-800", label: "Alto" };
    if (score >= 60) return { color: "bg-yellow-100 text-yellow-800", label: "Medio" };
    return { color: "bg-red-100 text-red-800", label: "Bajo" };
  };

  const getStatusBadge = (status) => {
    const configs = {
      nuevo: "bg-blue-100 text-blue-800",
      calificado: "bg-green-100 text-green-800",
      propuesta: "bg-purple-100 text-purple-800",
      negociacion: "bg-orange-100 text-orange-800",
      dormido: "bg-gray-100 text-gray-800",
      cierre: "bg-indigo-100 text-indigo-800",
      contactado: "bg-cyan-100 text-cyan-800",
      perdido: "bg-red-100 text-red-800",
      convertido: "bg-green-100 text-green-800"
    };
    return configs[status] || configs.nuevo;
  };

  // Enhanced SLA status function para PATCH A (now used for Leads too)
  const getEnhancedSLAStatus = (lastActivity) => {
    const now = new Date();
    const lastActivityDate = new Date(lastActivity);
    const hoursDiff = (now - lastActivityDate) / (1000 * 60 * 60);

    if (hoursDiff > 72) {
      return {
        ...statusChips.slaBreach,
        urgent: true,
        label: `${Math.floor(hoursDiff)}h`,
        tooltip: "SLA vencido: actualizar actividad o mover etapa",
        chipStyle: `bg-[${statusChips.slaBreach.bg}] text-[${statusChips.slaBreach.fg}] border-[${statusChips.slaBreach.border}]`
      };
    }
    if (hoursDiff > 24) {
      return {
        ...statusChips.slaWarn,
        urgent: false,
        label: `${Math.floor(hoursDiff)}h`,
        tooltip: "Próximo a vencer SLA",
        chipStyle: `bg-[${statusChips.slaWarn.bg}] text-[${statusChips.slaWarn.fg}]`
      };
    }
    return {
      ...statusChips.slaOk,
      urgent: false,
      label: `${Math.floor(hoursDiff)}h`,
      tooltip: "Dentro de SLA",
      chipStyle: `bg-[${statusChips.slaOk.bg}] text-[${statusChips.slaOk.fg}]`
    };
  };

  const getStageDisplayName = (stage) => {
    const names = {
      nuevo: "Nuevo",
      calificado: "Calificado",
      propuesta: "Propuesta",
      negociacion: "Negociación",
      cierre: "Cierre"
    };
    return names[stage] || stage;
  };

  // Forecast calculations (still relevant for Opportunities, but not directly for simple Leads)
  const calculateForecast = () => {
    const commit = mockOpportunitiesData
      .filter(opp => opp.commit && opp.stage !== 'cierre')
      .reduce((sum, opp) => sum + opp.amount, 0);

    const bestCase = mockOpportunitiesData
      .filter(opp => ['propuesta', 'negociacion', 'cierre'].includes(opp.stage))
      .reduce((sum, opp) => sum + opp.amount, 0);

    const weighted = mockOpportunitiesData
      .filter(opp => opp.stage !== 'cierre')
      .reduce((sum, opp) => sum + (opp.amount * opp.probability / 100), 0);

    return { commit, bestCase, weighted };
  };

  // Mock data para gráfico de forecast (still relevant for Opportunities)
  const getForecastChartData = () => {
    return [
      { month: 'Sep 2025', commit: 142700, bestCase: 189200, weighted: 165950 },
      { month: 'Oct 2025', commit: 98000, bestCase: 145000, weighted: 125000 },
      { month: 'Nov 2025', commit: 75000, bestCase: 120000, weighted: 95000 },
      { month: 'Dic 2025', commit: 120000, bestCase: 180000, weighted: 150000 },
      { month: 'Ene 2026', commit: 85000, bestCase: 130000, weighted: 110000 },
      { month: 'Feb 2026', commit: 160000, bestCase: 220000, weighted: 190000 }
    ];
  };

  // WIP Limits para Pipeline (still relevant for Opportunities)
  const WIP_LIMITS = {
    nuevo: null,
    calificado: 15,
    propuesta: 20,
    negociacion: 12,
    cierre: null
  };

  // Helper for navigation based on current URL structure
  const getNavigationUrlForTab = (targetTab) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', targetTab);
    return url.toString();
  };

  // Dashboard principal CRM según especificación
  const renderDashboard = () => (
    <div className="space-y-6" style={{ backgroundColor: '#F1F0EC', minHeight: '100vh' }}>
      {/* Filtros principales */}
      <Card className="bg-white shadow-sm" style={{ boxShadow: '0 6px 18px rgba(0,0,0,0.06)', borderRadius: '16px' }}>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Vista:</span>
            </div>

            <Select defaultValue="last_30d">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_7d">Últimos 7 días</SelectItem>
                <SelectItem value="last_30d">Últimos 30 días</SelectItem>
                <SelectItem value="last_90d">Últimos 90 días</SelectItem>
                <SelectItem value="ytd">Este año</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all_owners">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_owners">Todos</SelectItem>
                <SelectItem value="ana_garcia">Ana García</SelectItem>
                <SelectItem value="carlos_ruiz">Carlos Ruiz</SelectItem>
                <SelectItem value="luis_perez">Luis Pérez</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all_lanes">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Lane" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_lanes">Todas las rutas</SelectItem>
                <SelectItem value="fcl_asia_eu">FCL Asia-Europe</SelectItem>
                <SelectItem value="air_latam_usa">Air Latam-USA</SelectItem>
                <SelectItem value="lcl_intra_eu">LCL Intra-EU</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <StatCard
          title="Pipeline"
          value={formatters.currency(dashboardData.kpis.pipeline_value.value)}
          icon={Target}
          color="bg-blue-500"
          trend={dashboardData.kpis.pipeline_value.trend}
        />
        <StatCard
          title="Hit Rate 30d"
          value={formatters.percent(dashboardData.kpis.hit_rate_30d.value)}
          icon={TrendingUp}
          color="bg-green-500"
          trend={dashboardData.kpis.hit_rate_30d.trend}
        />
        <StatCard
          title="TAT Cotización"
          value={formatters.duration(dashboardData.kpis.quote_tat_p50.value)}
          icon={Clock}
          color="bg-orange-500"
          trend={dashboardData.kpis.quote_tat_p50.trend}
        />
        <StatCard
          title="Deals Estancados"
          value={formatters.integer(dashboardData.kpis.stalled_deals.value)}
          icon={AlertTriangle}
          color="bg-red-500"
          trend={dashboardData.kpis.stalled_deals.trend}
        />
        <StatCard
          title="Fill Rate"
          value={formatters.percent(dashboardData.kpis.fill_rate.value)}
          icon={CheckCircle}
          color="bg-green-500"
          trend={dashboardData.kpis.fill_rate.trend}
        />
        <StatCard
          title="AR Vencido"
          value={formatters.currency(dashboardData.kpis.ar_overdue.value)}
          icon={AlertCircle}
          color="bg-red-500"
          trend={dashboardData.kpis.ar_overdue.trend}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Pipeline by Stage */}
        <Card className="bg-white shadow-sm" style={{ boxShadow: '0 6px 18px rgba(0,0,0,0.06)', borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle className="text-md font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Pipeline por Etapa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.charts.pipeline_by_stage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="stage"
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `€${(value/1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [`€${value.toLocaleString('es-ES')}`, 'Valor']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.06)'
                    }}
                  />
                  <Bar dataKey="amount" fill="#4472C4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card className="bg-white shadow-sm" style={{ boxShadow: '0 6px 18px rgba(0,0,0,0.06)', borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle className="text-md font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Funnel de Conversión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.charts.conversion_funnel.map((stage, index) => (
                <div key={stage.name} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium text-gray-700">{stage.name}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold">{stage.value}</span>
                      <span className="text-xs text-gray-500">{stage.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stage.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hit Rate by Lane */}
        <Card className="bg-white shadow-sm" style={{ boxShadow: '0 6px 18px rgba(0,0,0,0.06)', borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle className="text-md font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Hit Rate por Ruta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.charts.hit_rate_by_lane} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="lane"
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Hit Rate']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.06)'
                    }}
                  />
                  <Bar dataKey="rate" fill="#00A878" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Risky Deals */}
        <Card className="bg-white shadow-sm" style={{ boxShadow: '0 6px 18px rgba(0,0,0,0.06)', borderRadius: '16px' }}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-md font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Deals de Alto Riesgo
              </CardTitle>
              <Badge className="bg-red-100 text-red-800">
                {dashboardData.tables.risky_deals.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.tables.risky_deals.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{deal.opportunity}</p>
                    <p className="text-xs text-gray-500">{deal.owner} • {deal.lane}</p>
                    <p className="text-xs text-red-600 mt-1">{deal.reason}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={`${
                        deal.risk_score > 0.7 ? 'bg-red-100 text-red-800' :
                        deal.risk_score > 0.5 ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      } mb-1`}
                    >
                      {(deal.risk_score * 100).toFixed(0)}% riesgo
                    </Badge>
                    <p className="text-xs text-gray-500">{deal.probability}% prob.</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tasks Due */}
        <Card className="bg-white shadow-sm" style={{ boxShadow: '0 6px 18px rgba(0,0,0,0.06)', borderRadius: '16px' }}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-md font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Actividades Pendientes (7d)
              </CardTitle>
              <Badge className="bg-blue-100 text-blue-800">
                {dashboardData.tables.tasks_due.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.tables.tasks_due.map((task, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className={`p-2 rounded-lg ${
                    task.type === 'call' ? 'bg-green-100' :
                    task.type === 'meeting' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {task.type === 'call' && <Phone className="w-4 h-4 text-green-600" />}
                    {task.type === 'meeting' && <Users className="w-4 h-4 text-blue-600" />}
                    {task.type === 'email' && <Mail className="w-4 h-4 text-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{task.subject}</p>
                    <p className="text-xs text-gray-500">{task.account} • {task.owner}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-700">
                      {new Date(task.when).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(task.when).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Panel */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200" style={{ borderRadius: '16px' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-md font-semibold text-blue-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              AI Insights & Recomendaciones
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-sm">Deals en Riesgo</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                23 oportunidades sin actividad &gt;5 días. Riesgo de pérdida: €890k
              </p>
              <Button size="sm" className="w-full text-white" style={{ backgroundColor: '#4472C4' }}>
                Priorizar Follow-ups
              </Button>
            </div>

            <div className="p-4 bg-white rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-medium text-sm">Oportunidad Margen</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Ruta FCL Asia-EU: 15% por debajo mercado. Oportunidad +€200k
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Revisar Pricing
              </Button>
            </div>

            <div className="p-4 bg-white rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm">Forecast Gap</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Vs objetivo Q4: -12%. Acelerar cierre de 8 deals grandes
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Plan de Acción
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // SUBMÓDULO 2: CLIENTES v2.0 - REEMPLAZO COMPLETO
  const renderClientes = () => {

    const filterAccounts = (accounts) => {
      return accounts.filter(account => {
        const searchMatch = !accountFilters.search ||
          account.name.toLowerCase().includes(accountFilters.search.toLowerCase()) ||
          (account.email_domain && account.email_domain.toLowerCase().includes(accountFilters.search.toLowerCase())) ||
          account.tax_id.toLowerCase().includes(accountFilters.search.toLowerCase());

        const sectorMatch = accountFilters.sector === 'all' || account.sector === accountFilters.sector;
        const countryMatch = accountFilters.country === 'all' || account.country === accountFilters.country;
        const ownerMatch = accountFilters.owner === 'all' || account.owner === accountFilters.owner;
        const estadoMatch = accountFilters.estado === 'all' || account.estado === accountFilters.estado;
        // Tags filter not implemented in UI, so skipped for now.

        const dsoMinMatch = !accountFilters.dso_min || account.dso >= parseInt(accountFilters.dso_min);
        const dsoMaxMatch = !accountFilters.dso_max || account.dso <= parseInt(accountFilters.dso_max);

        const healthMinMatch = !accountFilters.health_min || account.health_score >= parseFloat(accountFilters.health_min);
        const healthMaxMatch = !accountFilters.health_max || account.health_score <= parseFloat(accountFilters.health_max);

        const arMinMatch = !accountFilters.ar_min || account.ar_pendiente >= parseFloat(accountFilters.ar_min);
        const arMaxMatch = !accountFilters.ar_max || account.ar_pendiente <= parseFloat(accountFilters.ar_max);

        const creditHoldMatch = !accountFilters.credit_hold || account.credit_hold;
        const oppOpenMatch = !accountFilters.oportunidades_abiertas || account.oportunidades_abiertas > 0;
        const recentActivityMatch = !accountFilters.actividad_reciente || account.ultima_actividad < 14;

        return searchMatch && sectorMatch && countryMatch && ownerMatch && estadoMatch &&
               dsoMinMatch && dsoMaxMatch && healthMinMatch && healthMaxMatch &&
               arMinMatch && arMaxMatch && creditHoldMatch && oppOpenMatch && recentActivityMatch;
      });
    };

    const filterContacts = (contacts) => {
      return contacts.filter(contact => {
        const searchMatch = !contactFilters.search ||
          contact.name.toLowerCase().includes(contactFilters.search.toLowerCase()) ||
          contact.email.toLowerCase().includes(contactFilters.search.toLowerCase()) ||
          contact.phone.toLowerCase().includes(contactFilters.search.toLowerCase());

        const accountMatch = contactFilters.account === 'all' || contact.account_id === contactFilters.account;
        const roleMatch = contactFilters.role === 'all' || contact.role === contactFilters.role;
        const languageMatch = contactFilters.language === 'all' || contact.language === contactFilters.language;
        const ownerMatch = contactFilters.owner === 'all' || contact.owner === contactFilters.owner;

        const whatsappMatch = contactFilters.whatsapp === 'all' ||
          (contactFilters.whatsapp === 'true' && contact.whatsapp_optin) ||
          (contactFilters.whatsapp === 'false' && !contact.whatsapp_optin);

        const bounceMatch = !contactFilters.bounce || contact.rebotado;

        return searchMatch && accountMatch && roleMatch && languageMatch && ownerMatch && whatsappMatch && bounceMatch;
      });
    };

    const filteredAccounts = filterAccounts(mockAccountsData);
    const filteredContacts = filterContacts(mockContactsData);

    return (
      <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {/* Pestañas de Clientes */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          <Button
            size="sm"
            onClick={() => setClientesTab('cuentas')}
            style={{
              backgroundColor: clientesTab === 'cuentas' ? '#4472C4' : 'transparent',
              color: clientesTab === 'cuentas' ? 'white' : '#6B7280',
              borderRadius: '8px'
            }}
          >
            Cuentas
          </Button>
          <Button
            size="sm"
            onClick={() => setClientesTab('contactos')}
            style={{
              backgroundColor: clientesTab === 'contactos' ? '#4472C4' : 'transparent',
              color: clientesTab === 'contactos' ? 'white' : '#6B7280',
              borderRadius: '8px'
            }}
          >
            Contactos
          </Button>
        </div>

        {clientesTab === 'cuentas' && (
          <div className="flex gap-6">
            {/* Panel de filtros lateral (si está abierto) */}
            {showFilters && (
              <div className="w-80 flex-shrink-0">
                <Card style={{ borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,.08)' }}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Filtros</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                        ✕
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Búsqueda</Label>
                      <Input
                        placeholder="Nombre, dominio, tax_id..."
                        value={accountFilters.search}
                        onChange={(e) => setAccountFilters({...accountFilters, search: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Sector</Label>
                      <Select
                        value={accountFilters.sector}
                        onValueChange={(value) => setAccountFilters({...accountFilters, sector: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar sectores" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="Textil">Textil</SelectItem>
                          <SelectItem value="Alimentación">Alimentación</SelectItem>
                          <SelectItem value="Tecnología">Tecnología</SelectItem>
                          <SelectItem value="Logística">Logística</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">País</Label>
                      <Select
                        value={accountFilters.country}
                        onValueChange={(value) => setAccountFilters({...accountFilters, country: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar país" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="España">España</SelectItem>
                          <SelectItem value="Francia">Francia</SelectItem>
                          <SelectItem value="Alemania">Alemania</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Owner</Label>
                      <Select
                        value={accountFilters.owner}
                        onValueChange={(value) => setAccountFilters({...accountFilters, owner: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar owner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="Ana García">Ana García</SelectItem>
                          <SelectItem value="Carlos Ruiz">Carlos Ruiz</SelectItem>
                          <SelectItem value="María López">María López</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Estado</Label>
                      <Select
                        value={accountFilters.estado}
                        onValueChange={(value) => setAccountFilters({...accountFilters, estado: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="Prospecto">Prospecto</SelectItem>
                          <SelectItem value="Cliente">Cliente</SelectItem>
                          <SelectItem value="Suspendido">Suspendido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">DSO (días)</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Min"
                          type="number"
                          value={accountFilters.dso_min}
                          onChange={(e) => setAccountFilters({...accountFilters, dso_min: e.target.value})}
                        />
                        <Input
                          placeholder="Max"
                          type="number"
                          value={accountFilters.dso_max}
                          onChange={(e) => setAccountFilters({...accountFilters, dso_max: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Health Score</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Min"
                          type="number"
                          min="0"
                          max="10"
                          value={accountFilters.health_min}
                          onChange={(e) => setAccountFilters({...accountFilters, health_min: e.target.value})}
                        />
                        <Input
                          placeholder="Max"
                          type="number"
                          min="0"
                          max="10"
                          value={accountFilters.health_max}
                          onChange={(e) => setAccountFilters({...accountFilters, health_max: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">AR Pendiente (€)</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Min"
                          type="number"
                          value={accountFilters.ar_min}
                          onChange={(e) => setAccountFilters({...accountFilters, ar_min: e.target.value})}
                        />
                        <Input
                          placeholder="Max"
                          type="number"
                          value={accountFilters.ar_max}
                          onChange={(e) => setAccountFilters({...accountFilters, ar_max: e.target.value})}
                        />
                      </div>
                    </div>


                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="credit_hold"
                          className="rounded"
                          checked={accountFilters.credit_hold}
                          onChange={(e) => setAccountFilters({...accountFilters, credit_hold: e.target.checked})}
                        />
                        <Label htmlFor="credit_hold" className="text-sm">Credit Hold</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="facturas_vencidas"
                          className="rounded"
                          checked={accountFilters.facturas_vencidas}
                          onChange={(e) => setAccountFilters({...accountFilters, facturas_vencidas: e.target.checked})}
                        />
                        <Label htmlFor="facturas_vencidas" className="text-sm">Con facturas vencidas</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="opp_abiertas"
                          className="rounded"
                          checked={accountFilters.oportunidades_abiertas}
                          onChange={(e) => setAccountFilters({...accountFilters, oportunidades_abiertas: e.target.checked})}
                        />
                        <Label htmlFor="opp_abiertas" className="text-sm">Con oportunidades abiertas</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="actividad_reciente"
                          className="rounded"
                          checked={accountFilters.actividad_reciente}
                          onChange={(e) => setAccountFilters({...accountFilters, actividad_reciente: e.target.checked})}
                        />
                        <Label htmlFor="actividad_reciente" className="text-sm">Actividad &lt; 14 días</Label>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setAccountFilters({
                          search: '',
                          sector: 'all',
                          country: 'all',
                          owner: 'all',
                          estado: 'all',
                          tags: 'all',
                          dso_min: '',
                          dso_max: '',
                          health_min: '',
                          health_max: '',
                          ar_min: '',
                          ar_max: '',
                          credit_hold: false,
                          facturas_vencidas: false,
                          oportunidades_abiertas: false,
                          actividad_reciente: false,
                          fecha_desde: '',
                          fecha_hasta: ''
                        })}
                      >
                        Limpiar filtros
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Área principal de cuentas */}
            <div className="flex-1">
              <Card style={{ borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,.08)' }}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <CardTitle>Cuentas</CardTitle>

                      {/* Vistas guardadas */}
                      <Select value={currentView} onValueChange={setCurrentView}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Vista" />
                        </SelectTrigger>
                        <SelectContent>
                          {savedViews.map(view => (
                            <SelectItem key={view.id} value={view.id}>
                              {view.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      {selectedAccountIds.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {selectedAccountIds.length} seleccionadas
                          </span>
                          <Button variant="outline" size="sm">
                            Asignar Owner
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Exportar CSV/XLSX
                          </Button>
                        </div>
                      )}
                      <Button
                        style={{ backgroundColor: '#4472C4', color: 'white' }}
                        onClick={() => setShowAccountModal(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Cuenta
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedAccountIds.length === filteredAccounts.length && filteredAccounts.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAccountIds(filteredAccounts.map(account => account.id));
                              } else {
                                setSelectedAccountIds([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Cuenta</TableHead>
                        <TableHead>Sector</TableHead>
                        <TableHead>País</TableHead>
                        <TableHead>DSO</TableHead>
                        <TableHead>Health Score</TableHead>
                        <TableHead>AR Pendiente</TableHead>
                        <TableHead>Últ. actividad</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Credit Hold</TableHead>
                        <TableHead>Oportunidades</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAccounts.map((account) => {
                        const dsoBadge = getDSOBadge(account.dso);
                        const healthBadge = getHealthScoreBadge(account.health_score);

                        return (
                          <TableRow key={account.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                className="rounded"
                                checked={selectedAccountIds.includes(account.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAccountIds([...selectedAccountIds, account.id]);
                                  } else {
                                    setSelectedAccountIds(selectedAccountIds.filter(id => id !== account.id));
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                  {account.logo_inicial}
                                </div>
                                <div>
                                  <p className="font-medium">{account.name}</p>
                                  <Badge className={getEstadoChip(account.estado)}>
                                    {account.estado}
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{account.sector}</TableCell>
                            <TableCell>{account.country}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{dsoBadge.icon}</span>
                                <Badge className={dsoBadge.color}>
                                  {account.dso}d
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={healthBadge.color}>
                                {account.health_score}/10
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <button className="text-blue-600 hover:underline">
                                €{account.ar_pendiente.toLocaleString('es-ES')}
                              </button>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">
                                hace {account.ultima_actividad}d
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{account.owner}</span>
                            </TableCell>
                            <TableCell>
                              {account.credit_hold && (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="font-medium">{account.oportunidades_abiertas}</p>
                                <p className="text-gray-500">
                                  €{account.opp_value.toLocaleString('es-ES')}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedAccount(account);
                                      setShowAccount360(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Ver 360º
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Target className="w-4 h-4 mr-2" />
                                    Nueva Oportunidad
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Enviar WhatsApp
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Email
                                  </DropdownMenuItem>
                                  {account.credit_hold ? (
                                    <DropdownMenuItem className="text-green-600">
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Quitar Credit Hold
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem className="text-red-600">
                                      <AlertTriangle className="w-4 h-4 mr-2" />
                                      Credit Hold
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {clientesTab === 'contactos' && (
          <Card style={{ borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,.08)' }}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Contactos</CardTitle>
                <div className="flex items-center gap-3">
                  {selectedContactIds.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {selectedContactIds.length} seleccionados
                      </span>
                      <Button variant="outline" size="sm">
                        Añadir a Campaña
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        Eliminar
                      </Button>
                    </div>
                  )}
                  <Button
                    style={{ backgroundColor: '#4472C4', color: 'white' }}
                    onClick={() => setShowContactModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Contacto
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Contact Filters */}
              <div className="p-4 flex flex-wrap gap-4 items-end">
                  <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                          placeholder="Buscar contactos..."
                          value={contactFilters.search}
                          onChange={(e) => setContactFilters({...contactFilters, search: e.target.value})}
                      />
                  </div>
                  <Select
                      value={contactFilters.account}
                      onValueChange={(value) => setContactFilters({...contactFilters, account: value})}
                  >
                      <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Cuenta" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">Todas las Cuentas</SelectItem>
                          {mockAccountsData.map(acc => (
                            <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                  <Select
                      value={contactFilters.role}
                      onValueChange={(value) => setContactFilters({...contactFilters, role: value})}
                  >
                      <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Rol" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="CEO">CEO</SelectItem>
                          <SelectItem value="Directora Compras">Directora Compras</SelectItem>
                          <SelectItem value="CTO">CTO</SelectItem>
                          <SelectItem value="Gerente Operaciones">Gerente Operaciones</SelectItem>
                          <SelectItem value="Directora Creativa">Directora Creativa</SelectItem>
                      </SelectContent>
                  </Select>
                  <Select
                      value={contactFilters.language}
                      onValueChange={(value) => setContactFilters({...contactFilters, language: value})}
                  >
                      <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Idioma" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">Todos los Idiomas</SelectItem>
                          <SelectItem value="Español">Español</SelectItem>
                          <SelectItem value="Inglés">Inglés</SelectItem>
                          <SelectItem value="Alemán">Alemán</SelectItem>
                          <SelectItem value="Francés">Francés</SelectItem>
                      </SelectContent>
                  </Select>
                  <Select
                      value={contactFilters.owner}
                      onValueChange={(value) => setContactFilters({...contactFilters, owner: value})}
                  >
                      <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Owner" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">Todos los Owners</SelectItem>
                          <SelectItem value="Ana García">Ana García</SelectItem>
                          <SelectItem value="Carlos Ruiz">Carlos Ruiz</SelectItem>
                          <SelectItem value="María López">María López</SelectItem>
                      </SelectContent>
                  </Select>
                  <Select
                      value={contactFilters.whatsapp}
                      onValueChange={(value) => setContactFilters({...contactFilters, whatsapp: value})}
                  >
                      <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="WhatsApp Opt-in" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="true">Sí</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="contact_bounce"
                      className="rounded"
                      checked={contactFilters.bounce}
                      onChange={(e) => setContactFilters({...contactFilters, bounce: e.target.checked})}
                    />
                    <Label htmlFor="contact_bounce" className="text-sm">Rebotado</Label>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setContactFilters({
                      search: '',
                      account: 'all',
                      role: 'all',
                      language: 'all',
                      owner: 'all',
                      whatsapp: 'all',
                      bounce: false
                  })}>
                      Limpiar
                  </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedContactIds.length === filteredContacts.length && filteredContacts.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedContactIds(filteredContacts.map(contact => contact.id));
                          } else {
                            setSelectedContactIds([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Cuenta</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Idioma</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Últ. interacción</TableHead>
                    <TableHead>NPS</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={selectedContactIds.includes(contact.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContactIds([...selectedContactIds, contact.id]);
                            } else {
                              setSelectedContactIds(selectedContactIds.filter(id => id !== contact.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {contact.name}
                          {contact.principal && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{contact.account_name}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>{contact.role}</TableCell>
                      <TableCell>{contact.language}</TableCell>
                      <TableCell>{contact.owner}</TableCell>
                      <TableCell>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={contact.whatsapp_optin}
                            className="rounded mr-2"
                            readOnly
                          />
                          <span className="text-sm">
                            {contact.whatsapp_optin ? 'Sí' : 'No'}
                          </span>
                        </label>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          hace {contact.ultima_interaccion}d
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={contact.nps >= 8 ? 'bg-green-100 text-green-800' :
                                       contact.nps >= 6 ? 'bg-yellow-100 text-yellow-800' :
                                       'bg-red-100 text-red-800'}>
                          {contact.nps}/10
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="w-4 h-4 mr-2" />
                              Llamar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="w-4 h-4 mr-2" />
                              Agendar reunión
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Target className="w-4 h-4 mr-2" />
                              Nueva Oportunidad
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Drawer 360º */}
        {showAccount360 && selectedAccount && (
          <div className="fixed inset-y-0 right-0 w-[720px] bg-white shadow-2xl z-50 overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Header del Drawer */}
              <div className="p-6 border-b bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium">
                        {selectedAccount.logo_inicial}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedAccount.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getEstadoChip(selectedAccount.estado)}>
                            {selectedAccount.estado}
                          </Badge>
                          <Badge className={getHealthScoreBadge(selectedAccount.health_score).color}>
                            Health: {selectedAccount.health_score}/10
                          </Badge>
                          {selectedAccount.credit_hold && (
                            <Badge className="bg-red-100 text-red-800">Credit Hold</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowAccount360(false)}>
                    ✕
                  </Button>
                </div>

                {/* CTAs principales */}
                <div className="flex gap-3 mt-4">
                  <Button style={{ backgroundColor: '#4472C4', color: 'white' }}>
                    <Target className="w-4 h-4 mr-2" />
                    Nueva Oportunidad
                  </Button>
                  <Button style={{ backgroundColor: '#4472C4', color: 'white' }}>
                    <Users className="w-4 h-4 mr-2" />
                    Nuevo Contacto
                  </Button>
                  {selectedAccount.credit_hold ? (
                    <Button variant="outline" className="text-green-600 border-green-200">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Quitar Credit Hold
                    </Button>
                  ) : (
                    <Button variant="outline" className="text-red-600 border-red-200">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Credit Hold
                    </Button>
                  )}
                  <Button variant="outline">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Ver en Finanzas
                  </Button>
                </div>
              </div>

              {/* Tabs del Drawer */}
              <div className="border-b">
                <div className="flex overflow-x-auto">
                  {['resumen', 'contactos', 'oportunidades', 'ordenes', 'facturas', 'actividad', 'conversaciones', 'documentos', 'notas'].map(tabName => (
                    <Button
                      key={tabName}
                      variant="ghost"
                      size="sm"
                      className={`px-4 py-3 capitalize whitespace-nowrap ${
                        account360Tab === tabName ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
                      }`}
                      onClick={() => setAccount360Tab(tabName)}
                    >
                      {tabName}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Contenido del Drawer */}
              <div className="flex-1 overflow-auto">
                <div className="p-6">
                  {account360Tab === 'resumen' && (
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-4">Información Básica</h3>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm text-gray-500">Nombre</Label>
                            <p>{selectedAccount.name}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500">Tax ID</Label>
                            <p>{selectedAccount.tax_id}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500">Sector</Label>
                            <p>{selectedAccount.sector}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500">País</Label>
                            <p>{selectedAccount.country}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500">Tamaño</Label>
                            <p className="capitalize">{selectedAccount.size}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500">Dominio Email</Label>
                            <p>{selectedAccount.email_domain}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500">Owner</Label>
                            <p>{selectedAccount.owner}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-4">Insights IA</h3>
                        <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                          <div>
                            <Label className="text-sm font-medium text-blue-700">Riesgo</Label>
                            <p className="text-sm">{selectedAccount.credit_hold ? 'Alto - Credit Hold activo' : 'Bajo - Situación estable'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-blue-700">Siguiente Mejor Acción</Label>
                            <p className="text-sm">Programar follow-up con Compras</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-blue-700">Predicción Churn</Label>
                            <p className="text-sm">Bajo - Cliente estable con buenos indicadores</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-blue-700">Resumen Ejecutivo</Label>
                            <p className="text-sm">Cliente estratégico con buena salud financiera y oportunidades activas en el pipeline.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {account360Tab === 'contactos' && (
                    <div>
                      <h3 className="font-semibold mb-4">Contactos de la Cuenta</h3>
                      <div className="space-y-3">
                        {mockContactsData
                          .filter(c => c.account_id === selectedAccount.id)
                          .map(contact => (
                            <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                {contact.principal && (
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                )}
                                <div>
                                  <p className="font-medium">{contact.name}</p>
                                  <p className="text-sm text-gray-500">{contact.role}</p>
                                  <p className="text-sm text-gray-500">{contact.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {contact.whatsapp_optin && (
                                  <Button size="sm" variant="outline">
                                    <MessageSquare className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button size="sm" variant="outline">
                                  <Mail className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Phone className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        }
                        {mockContactsData.filter(c => c.account_id === selectedAccount.id).length === 0 && (
                          <p className="text-gray-500 text-sm">No hay contactos asociados a esta cuenta.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {account360Tab !== 'resumen' && account360Tab !== 'contactos' && (
                    <div className="text-center py-12 text-gray-500">
                      <p>Panel "{account360Tab}" - En desarrollo</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Nueva Cuenta */}
        <Dialog open={showAccountModal} onOpenChange={setShowAccountModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nueva Cuenta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre *</Label>
                  <Input id="name" placeholder="Nombre de la empresa" />
                </div>
                <div>
                  <Label htmlFor="country">País *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar país" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="españa">España</SelectItem>
                      <SelectItem value="francia">Francia</SelectItem>
                      <SelectItem value="alemania">Alemania</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sector">Sector *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="textil">Textil</SelectItem>
                      <SelectItem value="alimentacion">Alimentación</SelectItem>
                      <SelectItem value="tecnologia">Tecnología</SelectItem>
                      <SelectItem value="logistica">Logística</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="owner">Owner *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Asignar propietario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ana">Ana García</SelectItem>
                      <SelectItem value="carlos">Carlos Ruiz</SelectItem>
                      <SelectItem value="maria">María López</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email_domain">Dominio Email</Label>
                  <Input id="email_domain" placeholder="empresa.com" />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" placeholder="https://empresa.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="size">Tamaño</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Tamaño empresa" />
                    </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="pequeña">Pequeña</SelectItem>
                      <SelectItem value="mediana">Mediana</SelectItem>
                      <SelectItem value="grande">Grande</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tax_id">Tax ID</Label>
                  <Input id="tax_id" placeholder="CIF/NIF/VAT ID" />
                </div>
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select defaultValue="prospecto">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospecto">Prospecto</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="suspendido">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAccountModal(false)}>
                  Cancelar
                </Button>
                <Button
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                  onClick={() => {
                    setShowAccountModal(false);
                    // Here would be the logic to save the new account and then potentially open the 360 view for it.
                  }}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Nuevo Contacto */}
        <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuevo Contacto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="contact_name">Nombre *</Label>
                <Input id="contact_name" placeholder="Nombre completo" />
              </div>
              <div>
                <Label htmlFor="contact_email">Email *</Label>
                <Input id="contact_email" type="email" placeholder="email@empresa.com" />
              </div>
              <div>
                <Label htmlFor="contact_phone">Teléfono</Label>
                <Input id="contact_phone" placeholder="+34 600 000 000" />
              </div>
              <div>
                <Label htmlFor="contact_role">Rol</Label>
                <Input id="contact_role" placeholder="Cargo en la empresa" />
              </div>
              <div>
                <Label htmlFor="contact_language">Idioma</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Idioma preferido" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="español">Español</SelectItem>
                    <SelectItem value="ingles">Inglés</SelectItem>
                    <SelectItem value="frances">Francés</SelectItem>
                    <SelectItem value="aleman">Alemán</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="contact_account">Cuenta *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAccountsData.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="whatsapp_optin" className="rounded" />
                <Label htmlFor="whatsapp_optin">WhatsApp opt-in</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="principal" className="rounded" />
                <Label htmlFor="principal">Contacto principal</Label>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowContactModal(false)}>
                  Cancelar
                </Button>
                <Button
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                  onClick={() => setShowContactModal(false)}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // Leads (anteriormente Oportunidades) - NUEVA VERSIÓN CON PIPELINE
  const renderLeads = () => {
    // El estado 'leadsView' y 'setLeadsView' ahora se obtienen del componente principal

    const leadsData = [
      {
        id: "LEAD-001",
        empresa: "Textil France SARL",
        pais: "Francia",
        monto: 28500,
        probabilidad: 60,
        etapa: "Nuevo",
        propietario: { nombre: "María López", avatar: "ML", tiempo: "32h" },
        proximaAccion: "Envío cotización 29/8/2025",
        color: "border-red-500"
      },
      {
        id: "LEAD-002",
        empresa: "FoodTech Peru SAC",
        pais: "Perú",
        monto: 45000,
        probabilidad: 75,
        etapa: "Calificado",
        propietario: { nombre: "Ana García", avatar: "A", tiempo: "350h" },
        proximaAccion: "Presentación técnica 30/8/2025",
        color: "border-red-500"
      },
      {
        id: "LEAD-003",
        empresa: "German Auto Parts GmbH",
        pais: "Alemania",
        monto: 67200,
        probabilidad: 85,
        etapa: "Propuesta",
        propietario: { nombre: "Carlos Ruiz", avatar: "C", tiempo: "423h" },
        proximaAccion: "Revisión contrato 28/8/2025",
        color: "border-red-500"
      },
      {
        id: "LEAD-004",
        empresa: "Milano Fashion House SRL",
        pais: "Italia",
        monto: 52000,
        probabilidad: 50,
        etapa: "Nuevo",
        propietario: { nombre: "Ana García", avatar: "A", tiempo: "120h" },
        proximaAccion: "Demo técnico 31/8/2025",
        color: "border-red-500"
      }
    ];

    const etapas = [
      { nombre: "Nuevo", count: 2, total: 0 },
      { nombre: "Calificado", count: 1, total: 15 },
      { nombre: "Propuesta", count: 1, total: 20 },
      { nombre: "Negociación", count: 0, total: 12 },
      { nombre: "Cierre", count: 0, total: 0 }
    ];

    const getLeadsByEtapa = (etapaNombre) => {
      return leadsData.filter(lead => lead.etapa === etapaNombre);
    };

    const etapaColorMap = {
      "Nuevo": "bg-blue-100 text-blue-800",
      "Contactado": "bg-yellow-100 text-yellow-800",
      "Calificado": "bg-purple-100 text-purple-800",
      "Propuesta": "bg-orange-100 text-orange-800",
      "Negociacion": "bg-green-100 text-green-800",
      "Dormido": "bg-gray-100 text-gray-800",
      "Perdido": "bg-red-100 text-red-800",
      "Convertido": "bg-emerald-100 text-emerald-800"
    };

    const LeadCard = ({ lead }) => (
      <Card className={`bg-white shadow-sm border-2 ${lead.color} mb-4`} style={{ borderRadius: '12px' }}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm">{lead.empresa}</h4>
              <p className="text-xs text-gray-500">{lead.pais}</p>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">€{lead.monto.toLocaleString('es-ES')}</span>
              <span className="text-sm font-semibold text-green-600">{lead.probabilidad}%</span>
            </div>

            <div>
              <p className="text-xs text-gray-600 mb-2">
                <span className="font-medium">Próximo:</span> {lead.proximaAccion}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                  {lead.propietario.avatar}
                </div>
                <div>
                  <p className="text-xs font-medium">{lead.propietario.nombre}</p>
                  <p className="text-xs text-orange-500">{lead.propietario.tiempo}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-xs h-7 px-2"
                onClick={() => {
                  setSelectedLead(mockLeadsData.find(ml => ml.id === lead.id)); // Find original lead by ID
                  setShowLead360(true);
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
                Actividad
              </Button>
              <Button size="sm" className="text-xs h-7 px-2 bg-blue-600 text-white"
                onClick={() => toast({ title: "Acción simulada", description: `Acción para ${lead.empresa} en etapa ${lead.etapa}`, status: "info" })}
              >
                {lead.etapa === "Propuesta" ? "Ganar" : "Seguimiento"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );

    const InsightsPanel = () => (
      <Card className="bg-white shadow-lg w-80 h-fit flex-shrink-0" style={{ borderRadius: '16px' }}>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Insights IA</CardTitle>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-blue-600 mb-2">Siguiente Mejor Acción</h4>
            <p className="text-sm text-gray-700">
              Contactar a Carlos Mendoza (FoodTech) - Lead calificado listo para convertir
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-yellow-600 mb-2">Riesgos Detectados</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• German Auto: SLA vencido hace 96h</p>
              <p>• Oportunidad negociación sin aprobación descuento</p>
              <p>• 2 leads sin contacto &gt; 48h</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-green-600 mb-2">Predicción de Cierre</h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Alto:</span> FoodTech Peru (85% - urgencia proyecto)</p>
              <p><span className="font-medium">Medio:</span> German Auto (Budget constraints)</p>
              <p><span className="font-medium">Bajo:</span> Milano Fashion (precio alto)</p>
            </div>
          </div>
        </CardContent>
    </Card>
  );

    const renderLeadsTable = () => (
      <div className="space-y-6">
        {/* Filtros */}
        <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Buscar leads..." className="pl-10 w-[300px]" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Nuevo">Nuevo</SelectItem>
                  <SelectItem value="Contactado">Contactado</SelectItem>
                  <SelectItem value="Calificado">Calificado</SelectItem>
                  <SelectItem value="Propuesta">Propuesta</SelectItem>
                  <SelectItem value="Negociacion">Negociación</SelectItem>
                  <SelectItem value="Perdido">Perdido</SelectItem>
                  <SelectItem value="Convertido">Convertido</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Propietario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Ana García">Ana García</SelectItem>
                  <SelectItem value="Carlos Ruiz">Carlos Ruiz</SelectItem>
                  <SelectItem value="María López">María López</SelectItem>
                </SelectContent>
              </Select>
              <Button className="text-white ml-auto" style={{ backgroundColor: '#4472C4' }}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Lead
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Leads */}
        <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle>Lista de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Monto Potencial</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Probabilidad</TableHead>
                  <TableHead>Propietario</TableHead>
                  <TableHead>Próxima Acción</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadsData.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.empresa}</TableCell>
                    <TableCell>{lead.pais}</TableCell>
                    <TableCell>€{lead.monto.toLocaleString('es-ES')}</TableCell>
                    <TableCell>
                      <Badge className={etapaColorMap[lead.etapa] || 'bg-gray-100 text-gray-800'}>
                        {lead.etapa}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.probabilidad}%</TableCell>
                    <TableCell>{lead.propietario.nombre}</TableCell>
                    <TableCell className="text-sm text-gray-600">{lead.proximaAccion}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" title="Ver detalles"
                        onClick={() => {
                          setSelectedLead(mockLeadsData.find(ml => ml.id === lead.id)); // Find original lead by ID
                          setShowLead360(true);
                        }}
                        ><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" title="Editar"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" title="Más opciones"><MoreHorizontal className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );

    const renderPipelineView = () => (
      <div className="flex gap-6">
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex flex-nowrap gap-4 min-w-full">
            {etapas.map((etapa) => (
              <div key={etapa.nombre} className="w-64 flex-shrink-0 bg-gray-50 rounded-lg p-4 min-h-[600px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-sm">{etapa.nombre}</h3>
                  <span className="text-xs text-gray-500">
                    {etapa.count}{etapa.total !== null && `/${etapa.total}`}
                  </span>
                </div>
                <div className="space-y-3">
                  {getLeadsByEtapa(etapa.nombre).map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
                  {etapa.count === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-8">
                      No hay leads aquí.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <InsightsPanel />
      </div>
    );

    return (
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-[28px] font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: '#000000' }}>
              Gestión de Leads
            </h1>
            <p className="text-[14px] font-medium" style={{ color: '#6B7280', fontFamily: 'Montserrat, sans-serif' }}>
              Captura, calificación y seguimiento de nuevos prospectos comerciales.
            </p>
          </div>
        </div>

        {/* Botones de Vista */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          <Button
            onClick={() => setLeadsView('leads')}
            className={leadsView === 'leads'
              ? 'bg-white shadow-sm text-gray-700'
              : 'bg-transparent text-gray-500 hover:bg-gray-200 hover:text-gray-700'
            }
            size="sm"
            style={leadsView === 'leads' ? { backgroundColor: 'white', color: '#4472C4' } : {}}
          >
            Leads
          </Button>
          <Button
            onClick={() => setLeadsView('pipeline')}
            className={leadsView === 'pipeline'
              ? 'bg-[#4472C4] shadow-sm text-white'
              : 'bg-transparent text-gray-500 hover:bg-gray-200 hover:text-gray-700'
            }
            size="sm"
            style={leadsView === 'pipeline' ? { backgroundColor: '#4472C4', color: 'white' } : {}}
          >
            Pipeline
          </Button>
        </div>

        {/* Contenido según vista activa */}
        {leadsView === 'leads' ? renderLeadsTable() : renderPipelineView()}

        {/* Drawer Lead 360º mejorado */}
        {showLead360 && selectedLead && (
          <div className="fixed inset-y-0 right-0 w-[720px] bg-white shadow-2xl z-50 overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">{selectedLead.name}</h2>
                    <p className="text-gray-600">{selectedLead.company}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusBadge(selectedLead.status)}>
                        {selectedLead.status}
                      </Badge>
                      <Badge className={getScoreBadge(selectedLead.score).color}>
                        Score: {selectedLead.score}
                      </Badge>
                      {selectedLead.consent_gdpr && (
                        <Badge className="bg-green-100 text-green-800">
                          GDPR ✓
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowLead360(false)}>
                    ✕
                  </Button>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button
                    style={{ backgroundColor: '#4472C4', color: 'white' }}
                    onClick={() => {
                      // Logic for converting lead to opportunity
                      setShowLead360(false);
                      toast({
                        title: "Convertir a Oportunidad",
                        description: `Lead ${selectedLead.name} convertido a oportunidad. (Función stub)`,
                        status: "info"
                      });
                    }}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Convertir a Oportunidad
                  </Button>
                  {selectedLead.consent_gdpr && (
                    <>
                      <Button variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button variant="outline">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Información del Lead</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-gray-500">Email</Label>
                        <p>{selectedLead.email}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Teléfono</Label>
                        <p>{selectedLead.phone}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Sector</Label>
                        <p>{selectedLead.sector}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">País</Label>
                        <p>{selectedLead.country}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Fuente</Label>
                        <p>{selectedLead.source}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Owner</Label>
                        <p>{selectedLead.owner}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Monto Potencial</Label>
                        <p>€{selectedLead.monto_potencial?.toLocaleString('es-ES') || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Checklist de Calificación</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {selectedLead.contacto_valido ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm">Contacto validado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedLead.necesidad_identificada ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm">Necesidad identificada</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Duplicados Potenciales</h3>
                    <p className="text-sm text-gray-500">No se encontraron duplicados por email, teléfono o nombre</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Buscar duplicados
                    </Button>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Timeline de Actividad</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Lead creado</span>
                          <p className="text-xs text-gray-500">
                            {new Date(selectedLead.created_at).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-sm">Score calculado: {selectedLead.score}</p>
                          <p className="text-xs text-gray-500">Basado en sector y fuente</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Nuevo Lead mejorado */}
        <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nuevo Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lead_name">Nombre *</Label>
                  <Input id="lead_name" placeholder="Nombre completo" />
                </div>
                <div>
                  <Label htmlFor="lead_company">Empresa</Label>
                  <Input id="lead_company" placeholder="Nombre de la empresa" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lead_email">Email *</Label>
                  <Input id="lead_email" type="email" placeholder="email@empresa.com" />
                </div>
                <div>
                  <Label htmlFor="lead_phone">Teléfono *</Label>
                  <Input id="lead_phone" placeholder="+34 600 000 000" />
                  <p className="text-xs text-gray-500 mt-1">* Email o teléfono requerido</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="lead_sector">Sector</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="textil">Textil</SelectItem>
                      <SelectItem value="alimentacion">Alimentación</SelectItem>
                      <SelectItem value="tecnologia">Tecnología</SelectItem>
                      <SelectItem value="automocion">Automoción</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lead_country">País</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="País" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="españa">España</SelectItem>
                      <SelectItem value="francia">Francia</SelectItem>
                      <SelectItem value="alemania">Alemania</SelectItem>
                      <SelectItem value="peru">Perú</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lead_source">Fuente</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Fuente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="referencia">Referencia</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="lead_owner">Owner *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Asignar propietario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ana">Ana García</SelectItem>
                    <SelectItem value="carlos">Carlos Ruiz</SelectItem>
                    <SelectItem value="maria">María López</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="gdpr_consent" className="rounded" />
                  <Label htmlFor="gdpr_consent" className="text-sm">
                    Consentimiento GDPR para comunicaciones *
                  </Label>
                </div>
                <p className="text-xs text-gray-500">
                  * Requerido para poder enviar WhatsApp y emails
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowLeadModal(false)}>
                  Cancelar
                </Button>
                <Button
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                  onClick={() => setShowLeadModal(false)}
                >
                  Crear Lead
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // Mock data and functions for Actividades
  const mockConversaciones = [
    {
      id: "conv-001",
      cliente_contacto: "Ana García Martín",
      account: "Textiles Barcelona SA",
      channel: "WhatsApp",
      topic: "Consulta sobre estado de envío X123",
      messages_preview: "Hola Ana, ¿puedes decirme el estado de mi envío? Es el X123. Gracias.",
      owner: "Ana García",
      estado: "En curso",
      sla_status: "ok",
      sla_remaining: "<1h",
      sentiment: "neutral",
      last_intent: "Consulta",
      lead_id: null,
      contact_id: "cont-001",
      opportunity_id: null,
      account_id: "acc-001"
    },
    {
      id: "conv-002",
      cliente_contacto: "John Smith",
      account: "European Coffee SL",
      channel: "Email",
      topic: "Propuesta de servicio de logística",
      messages_preview: "Estimado John, adjunto nuestra propuesta de servicio de logística para su consideración...",
      owner: "Carlos Ruiz",
      estado: "Esperando cliente",
      sla_status: "warn",
      sla_remaining: "5h",
      sentiment: "positive",
      last_intent: "Ventas",
      lead_id: null,
      contact_id: "cont-002",
      opportunity_id: "opp-002",
      account_id: "acc-002"
    },
    {
      id: "conv-003",
      cliente_contacto: "Klaus Weber",
      account: "Tech Innovations GmbH",
      channel: "Web",
      topic: "Problema con integración API",
      messages_preview: "Hemos detectado un problema con la integración de la API para el tracking de pedidos...",
      owner: "María López",
      estado: "Nuevo",
      sla_status: "breach",
      sla_remaining: "25h",
      sentiment: "negative",
      last_intent: "Soporte",
      lead_id: null,
      contact_id: "cont-003",
      opportunity_id: null,
      account_id: "acc-003"
    }
  ];

  const getFilteredConversaciones = () => {
    return mockConversaciones.filter(conv => {
      const channelMatch = conversacionesFilters.channel === 'Todos' || conv.channel === conversacionesFilters.channel;
      const ownerMatch = conversacionesFilters.owner === 'all' || conv.owner === conversacionesFilters.owner;
      const estadoMatch = conversacionesFilters.estado === 'all' || conv.estado === conversacionesFilters.estado;

      let slaMatch = true;
      if (conversacionesFilters.sla === '≤ 1h') {
        slaMatch = conv.sla_remaining === '<1h';
      } else if (conversacionesFilters.sla === '≤ 4h') {
        slaMatch = conv.sla_remaining === '<1h' || conv.sla_remaining === '<4h';
      } else if (conversacionesFilters.sla === '≤ 24h') {
        slaMatch = conv.sla_remaining === '5h'; // Mocked example, <1h or <4h would also fall here
      } else if (conversacionesFilters.sla === '> 24h') {
        slaMatch = conv.sla_status === 'breach';
      }

      // This would require a more complex check against actual opportunities
      const hasOpenOppMatch = !conversacionesFilters.hasOpenOpp || (conversacionesFilters.hasOpenOpp && conv.opportunity_id);

      return channelMatch && ownerMatch && estadoMatch && slaMatch && hasOpenOppMatch;
    });
  };

  const filteredConversaciones = getFilteredConversaciones();

  const getSLABadgeStyle = (status) => {
    switch (status) {
      case 'ok': return 'bg-green-100 text-green-800';
      case 'warn': return 'bg-yellow-100 text-yellow-800';
      case 'breach': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleConversationAssign = (conversationIds, newOwner) => {
    console.log(`Assigning conversations ${conversationIds} to ${newOwner}`);
    toast({
      title: "Conversaciones asignadas",
      description: `Conversaciones ${conversationIds.join(', ')} asignadas a ${newOwner}`,
      status: "success"
    });
  };

  const handleConversationReply = (conversationId, message) => {
    console.log(`Replying to conversation ${conversationId} with: ${message}`);
    toast({
      title: "Respuesta enviada",
      description: `Respuesta enviada a la conversación ${conversationId}`,
      status: "success"
    });
  };

  const mockEventos = [
    {
      id: "event-001",
      title: "Demo Producto A - Textiles Barcelona",
      start: "2025-08-29T10:00:00",
      end: "2025-08-29T11:00:00",
      location: "Google Meet",
      attendees: ["ana.garcia@textiles.com"],
      related_to: "account",
      owner: "Ana García"
    },
    {
      id: "event-002",
      title: "Follow-up Propuesta - European Coffee",
      start: "2025-08-30T14:00:00",
      end: "2025-08-30T14:30:00",
      location: "Llamada",
      attendees: ["john@europeancoffee.es"],
      related_to: "opportunity",
      owner: "Carlos Ruiz"
    }
  ];

  const handleCreateCalendarEvent = (eventData) => {
    console.log("Creating new calendar event:", eventData);
    toast({
      title: "Evento creado",
      description: "Evento añadido al calendario.",
      status: "success"
    });
  };

  const mockTareas = [
    {
      id: "task-001",
      titulo: "Revisar docs de Tech Innovations",
      when: "2025-08-28T09:00:00Z",
      type: "Revisión",
      related_to: "Cuenta",
      related_id: "acc-003",
      owner: "María López",
      status: "Pendiente",
      prioridad: "Alta",
      recordatorio: true
    },
    {
      id: "task-002",
      titulo: "Llamar a Elena Ramos",
      when: "2025-08-27T11:00:00Z",
      type: "Llamada",
      related_to: "Contacto",
      related_id: "cont-004",
      owner: "Ana García",
      status: "En curso",
      prioridad: "Media",
      recordatorio: true
    },
    {
      id: "task-003",
      titulo: "Preparar presentación FoodTech",
      when: "2025-08-26T15:00:00Z",
      type: "Preparación",
      related_to: "Oportunidad",
      related_id: "opp-001",
      owner: "Ana García",
      status: "Hecho",
      prioridad: "Alta",
      recordatorio: false
    }
  ];

  const getFilteredTareas = () => {
    return mockTareas.filter(tarea => {
      const ownerMatch = tareasFilters.owner === 'all' || tarea.owner === tareasFilters.owner;
      const statusMatch = tareasFilters.status === 'all' || tarea.status === tareasFilters.status;
      const prioridadMatch = tareasFilters.prioridad === 'all' || tarea.prioridad === tareasFilters.prioridad;

      const dateDesde = tareasFilters.fecha_desde ? new Date(tareasFilters.fecha_desde) : null;
      const dateHasta = tareasFilters.fecha_hasta ? new Date(tareasFilters.fecha_hasta) : null;
      const taskDate = new Date(tarea.when);

      const fechaMatch = (!dateDesde || taskDate >= dateDesde) && (!dateHasta || taskDate <= dateHasta);

      return ownerMatch && statusMatch && prioridadMatch && fechaMatch;
    });
  };

  const filteredTareas = getFilteredTareas();

  const handleCompleteTask = (taskId) => {
    console.log(`Completing task: ${taskId}`);
    toast({
      title: "Tarea completada",
      description: `Tarea ${taskId} marcada como hecha.`,
      status: "success"
    });
    // In a real app, you'd update state or make an API call to mark as complete
  };

  const handleCreateTask = (taskData) => {
    console.log("Creating new task:", taskData);
    toast({
      title: "Tarea creada",
      description: "Nueva tarea añadida a la lista.",
      status: "success"
    });
  };

  const mockEmailThreads = [
    {
      id: "email-001",
      de_para: "Ana García <ana.garcia@textiles.com>",
      asunto: "Re: Estado de envío X123",
      fecha: "2025-08-26T11:00:00Z",
      mensajes: 3,
      relacionado: "Contacto Ana García",
      estado: "Respondido"
    },
    {
      id: "email-002",
      de_para: "Carlos Ruiz <carlos.ruiz@yourcompany.com>",
      asunto: "Nueva propuesta para European Coffee",
      fecha: "2025-08-25T16:00:00Z",
      mensajes: 1,
      relacionado: "Oportunidad OPP-002",
      estado: "Pendiente"
    },
    {
      id: "email-003",
      de_para: "Klaus Weber <klaus@techinnovations.de>",
      asunto: "API Integration Error",
      fecha: "2025-08-24T10:00:00Z",
      mensajes: 2,
      relacionado: "Cuenta Tech Innovations",
      estado: "Escalado"
    }
  ];

  const getFilteredEmailThreads = () => {
    return mockEmailThreads.filter(thread => {
      const ownerMatch = emailFilters.owner === 'all' || (thread.relacionado.includes(emailFilters.owner.split(' ')[0]) && emailFilters.owner !== 'all'); // Simplistic owner filter
      const relatedToMatch = emailFilters.related_to === 'all' || thread.relacionado.includes(emailFilters.related_to);

      const dateDesde = emailFilters.fecha_desde ? new Date(emailFilters.fecha_desde) : null;
      const dateHasta = emailFilters.fecha_hasta ? new Date(emailFilters.fecha_hasta) : null;
      const threadDate = new Date(thread.fecha);

      const fechaMatch = (!dateDesde || threadDate >= dateDesde) && (!dateHasta || threadDate <= dateHasta);

      return ownerMatch && relatedToMatch && fechaMatch;
    });
  };

  const filteredEmailThreads = getFilteredEmailThreads();

  const handleLogCall = (callData) => {
    console.log("Logging call:", callData);
    toast({
      title: "Llamada registrada",
      description: "Registro de llamada guardado.",
      status: "success"
    });
  };


  // Render Conversaciones tab
  const renderConversaciones = () => (
    <div className="space-y-6">
      {/* Filtros según JSON */}
      <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Canal</Label>
              <Select value={conversacionesFilters.channel} onValueChange={(value) =>
                setConversacionesFilters({...conversacionesFilters, channel: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Web">Web</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Owner</Label>
              <Select value={conversacionesFilters.owner} onValueChange={(value) =>
                setConversacionesFilters({...conversacionesFilters, owner: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Ana García">Ana García</SelectItem>
                  <SelectItem value="María López">María López</SelectItem>
                  <SelectItem value="Carlos Ruiz">Carlos Ruiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={conversacionesFilters.estado} onValueChange={(value) =>
                setConversacionesFilters({...conversacionesFilters, estado: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nuevo">Nuevo</SelectItem>
                  <SelectItem value="En curso">En curso</SelectItem>
                  <SelectItem value="Esperando cliente">Esperando cliente</SelectItem>
                  <SelectItem value="Resuelto">Resuelto</SelectItem>
                  <SelectItem value="Escalado">Escalado</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>SLA</Label>
              <Select value={conversacionesFilters.sla} onValueChange={(value) =>
                setConversacionesFilters({...conversacionesFilters, sla: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="≤ 1h">≤ 1h</SelectItem>
                  <SelectItem value="≤ 4h">≤ 4h</SelectItem>
                  <SelectItem value="≤ 24h">≤ 24h</SelectItem>
                  <SelectItem value="> 24h">&gt; 24h</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={conversacionesFilters.hasOpenOpp}
                  onChange={(e) => setConversacionesFilters({...conversacionesFilters, hasOpenOpp: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm">Con Oportunidad abierta</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones en lote */}
      {selectedConversations.length > 0 && (
        <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <span className="text-sm text-gray-600">{selectedConversations.length} conversación(es) seleccionada(s):</span>
              <Button
                size="sm"
                variant="outline"
                style={{ color: '#4472C4', borderColor: '#4472C4' }}
                onClick={() => handleConversationAssign(selectedConversations, 'Ana García')}
              >
                Asignar Owner
              </Button>
              <Button
                size="sm"
                variant="outline"
                style={{ color: '#4472C4', borderColor: '#4472C4' }}
                onClick={() => {
                  console.log('Marcando como resuelto:', selectedConversations);
                  toast({
                    title: "Marcado como resuelto",
                    description: "Conversaciones marcadas como resueltas",
                    status: "success"
                  });
                }}
              >
                Marcar Resuelto
              </Button>
              <Button
                size="sm"
                variant="outline"
                style={{ color: '#4472C4', borderColor: '#4472C4' }}
                onClick={() => toast({
                  title: "Exportando",
                  description: "Exportando conversaciones a CSV",
                  status: "success"
                })}
              >
                Exportar CSV/XLSX
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de conversaciones */}
      <div className="grid gap-4">
        {filteredConversaciones.map((conv) => (
          <Card key={conv.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '12px' }}
                onClick={() => {
                  setSelectedConversation(conv);
                  setShowConversationDetail(true);
                }}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedConversations.includes(conv.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (e.target.checked) {
                        setSelectedConversations([...selectedConversations, conv.id]);
                      } else {
                        setSelectedConversations(selectedConversations.filter(id => id !== conv.id));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {conv.channel}
                    </Badge>
                    <Badge className={getSLABadgeStyle(conv.sla_status)}>
                      {conv.sla_remaining}
                    </Badge>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {conv.estado}
                </Badge>
              </div>

              <div className="mt-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">{conv.cliente_contacto}</p>
                    <p className="text-xs text-gray-500">{conv.account}</p>
                    <p className="text-sm text-gray-700 mt-1">{conv.topic}</p>
                    <p className="text-xs text-gray-400 mt-1">{conv.messages_preview}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>Owner: {conv.owner}</p>
                    <p>Intent: {conv.last_intent}</p>
                    <p className={`capitalize ${conv.sentiment === 'positive' ? 'text-green-600' : conv.sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
                      {conv.sentiment}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredConversaciones.length === 0 && (
        <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
          <CardContent className="p-8 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Sin datos para el filtro seleccionado</p>
          </CardContent>
        </Card>
      )}

      {/* Modal detalle conversación */}
      <Dialog open={showConversationDetail} onOpenChange={setShowConversationDetail}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Conversación {selectedConversation?.channel} - {selectedConversation?.cliente_contacto}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">Último mensaje:</p>
                  <p className="text-sm text-gray-600 mt-2">{selectedConversation?.messages_preview}</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    style={{ color: '#4472C4', borderColor: '#4472C4' }}
                    onClick={() => handleConversationReply(selectedConversation?.id, "Respuesta de prueba")}
                  >
                    Responder
                  </Button>
                  <Button
                    variant="outline"
                    style={{ color: '#4472C4', borderColor: '#4472C4' }}
                  >
                    Usar plantilla
                  </Button>
                  <Button
                    variant="outline"
                    style={{ color: '#4472C4', borderColor: '#4472C4' }}
                  >
                    Asignar
                  </Button>
                  <Button
                    variant="outline"
                    style={{ color: '#4472C4', borderColor: '#4472C4' }}
                  >
                    Escalar a humano
                  </Button>
                  <Button
                    variant="outline"
                    style={{ color: '#4472C4', borderColor: '#4472C4' }}
                  >
                    Cerrar conversación
                  </Button>
                </div>
              </div>
            </div>

            <div className="col-span-1 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Vinculación</h4>
                <p className="text-sm text-gray-600">Lead: {selectedConversation?.lead_id || 'N/A'}</p>
                <p className="text-sm text-gray-600">Contacto: {selectedConversation?.contact_id || 'N/A'}</p>
                <p className="text-sm text-gray-600">Oportunidad: {selectedConversation?.opportunity_id || 'N/A'}</p>
                <p className="text-sm text-gray-600">Cuenta: {selectedConversation?.account_id || 'N/A'}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Health de Cuenta</h4>
                <p className="text-sm text-gray-600">Health Score: 85/100</p>
                <p className="text-sm text-gray-600">Color: Verde</p>
                <p className="text-sm text-gray-600">Credit Hold: No</p>
                <p className="text-sm text-gray-600">DSO: 34 días</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Historial</h4>
                <p className="text-sm text-gray-600">Últimas oportunidades: 2</p>
                <p className="text-sm text-gray-600">Últimos pedidos: 3</p>
                <p className="text-sm text-gray-600">Tickets abiertos: 0</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Render Agenda tab
  const renderAgenda = () => (
    <div className="space-y-6">
      {/* Controles del calendario */}
      <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold">Agosto 2025</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">← Anterior</Button>
                <Button size="sm" variant="outline">Siguiente →</Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant={calendarView === 'week' ? 'default' : 'outline'}
                onClick={() => setCalendarView('week')}
                style={calendarView === 'week' ? { backgroundColor: '#4472C4', color: 'white' } : {}}
              >
                Semana
              </Button>
              <Button
                size="sm"
                variant={calendarView === 'month' ? 'default' : 'outline'}
                onClick={() => setCalendarView('month')}
                style={calendarView === 'month' ? { backgroundColor: '#4472C4', color: 'white' } : {}}
              >
                Mes
              </Button>
              <Button
                className="text-white"
                style={{ backgroundColor: '#4472C4' }}
                onClick={() => setShowEventModal(true)}
              >
                Programar Cita
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista del calendario */}
      <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
        <CardContent className="p-6">
          {calendarView === 'week' ? (
            <div className="grid grid-cols-8 gap-4 h-96">
              <div className="font-medium">Hora</div>
              {['Lun 26', 'Mar 27', 'Mié 28', 'Jue 29', 'Vie 30', 'Sáb 31', 'Dom 1'].map((day) => (
                <div key={day} className="font-medium text-center">{day}</div>
              ))}

              {Array.from({length: 9}, (_, i) => i + 8).map((hour) => (
                <React.Fragment key={hour}>
                  <div className="text-sm text-gray-500">{hour}:00</div>
                  {Array.from({length: 7}).map((_, dayIndex) => (
                    <div key={dayIndex} className="border border-gray-200 min-h-[40px] relative">
                      {/* Renderizar eventos */}
                      {mockEventos
                        .filter(event => {
                          const eventDate = new Date(event.start);
                          const eventHour = eventDate.getHours();
                          const eventDay = eventDate.getDate();
                          // Simplificado: mostrar eventos en days específicos
                          // This is a simplified example based on the mock events, for a real calendar component
                          // you would need more robust date calculations based on the current week/month view.
                          return eventHour === hour && (
                            (dayIndex === 3 && eventDay === 29) || // Jue 29
                            (dayIndex === 4 && eventDay === 30)    // Vie 30
                          );
                        })
                        .map(event => (
                          <div
                            key={event.id}
                            className="absolute inset-1 bg-blue-100 border-l-4 border-blue-500 p-1 cursor-pointer rounded text-xs"
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowEventModal(true);
                            }}
                          >
                            <p className="font-medium truncate">{event.title}</p>
                            <p className="text-gray-600 truncate">{event.owner}</p>
                          </div>
                        ))}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Vista mensual del calendario</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal crear/editar evento */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent ? 'Editar Evento' : 'Programar Cita'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input placeholder="Título del evento" defaultValue={selectedEvent?.title} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha/Hora inicio</Label>
                <Input type="datetime-local" defaultValue={selectedEvent ? selectedEvent.start.slice(0, 16) : ''} />
              </div>
              <div>
                <Label>Fecha/Hora fin</Label>
                <Input type="datetime-local" defaultValue={selectedEvent ? selectedEvent.end.slice(0, 16) : ''} />
              </div>
            </div>
            <div>
              <Label>Ubicación</Label>
              <Input placeholder="Ubicación o enlace" defaultValue={selectedEvent?.location} />
            </div>
            <div>
              <Label>Asistentes</Label>
              <Input placeholder="emails separados por coma" defaultValue={selectedEvent?.attendees?.join(', ')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Relacionado a</Label>
                <Select defaultValue={selectedEvent?.related_to}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Contacto">Contacto</SelectItem>
                    <SelectItem value="Cuenta">Cuenta</SelectItem>
                    <SelectItem value="Oportunidad">Oportunidad</SelectItem>
                    <SelectItem value="Orden de Venta">Orden de Venta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Owner</Label>
                <Select defaultValue={selectedEvent?.owner}>
                  <SelectTrigger>
                    <SelectValue placeholder="Asignar a" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ana García">Ana García</SelectItem>
                    <SelectItem value="María López">María López</SelectItem>
                    <SelectItem value="Carlos Ruiz">Carlos Ruiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setShowEventModal(false);
                setSelectedEvent(null);
              }}>
                Cancelar
              </Button>
              <Button
                className="text-white"
                style={{ backgroundColor: '#4472C4', color: 'white' }}
                onClick={() => {
                  handleCreateCalendarEvent({
                    title: 'Nuevo evento',
                    start: new Date().toISOString(),
                    end: new Date(Date.now() + 3600000).toISOString(),
                    owner: 'Ana García'
                  });
                  setShowEventModal(false);
                  setSelectedEvent(null);
                }}
              >
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Render Tareas tab
  const renderTareas = () => (
    <div className="space-y-6">
      {/* Filtros */}
      <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Filtros de Tareas</CardTitle>
            <Button
              className="text-white"
              style={{ backgroundColor: '#4472C4' }}
              onClick={() => setShowNewTaskModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Tarea
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Owner</Label>
              <Select value={tareasFilters.owner} onValueChange={(value) =>
                setTareasFilters({...tareasFilters, owner: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Ana García">Ana García</SelectItem>
                  <SelectItem value="María López">María López</SelectItem>
                  <SelectItem value="Carlos Ruiz">Carlos Ruiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={tareasFilters.status} onValueChange={(value) =>
                setTareasFilters({...tareasFilters, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="En curso">En curso</SelectItem>
                  <SelectItem value="Hecho">Hecho</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridad</Label>
              <Select value={tareasFilters.prioridad} onValueChange={(value) =>
                setTareasFilters({...tareasFilters, prioridad: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Baja">Baja</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fecha desde</Label>
              <Input
                type="date"
                value={tareasFilters.fecha_desde}
                onChange={(e) => setTareasFilters({...tareasFilters, fecha_desde: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de tareas */}
      <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Relacionado</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Recordatorio</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTareas.map((tarea) => (
                <TableRow key={tarea.id}>
                  <TableCell>
                    {new Date(tarea.when).toLocaleString('es-ES')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tarea.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{tarea.titulo}</TableCell>
                  <TableCell>
                    {tarea.related_to} {tarea.related_id}
                  </TableCell>
                  <TableCell>{tarea.owner}</TableCell>
                  <TableCell>
                    <Badge className={
                      tarea.status === 'Hecho' ? 'bg-green-100 text-green-800' :
                      tarea.status === 'En curso' ? 'bg-blue-100 text-blue-800' :
                      tarea.status === 'Cancelado' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {tarea.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      tarea.prioridad === 'Alta' ? 'bg-red-100 text-red-800' :
                      tarea.prioridad === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {tarea.prioridad}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tarea.recordatorio ? '✓' : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {tarea.status !== 'Hecho' && (
                        <Button
                          size="sm"
                          variant="outline"
                          style={{ color: '#4472C4', borderColor: '#4472C4' }}
                          onClick={() => handleCompleteTask(tarea.id)}
                        >
                          Marcar Hecho
                        </Button>
                      )}
                      <Button
                          size="sm"
                          variant="outline"
                          style={{ color: '#4472C4', borderColor: '#4472C4' }}
                      >
                          Reasignar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredTareas.length === 0 && (
        <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
          <CardContent className="p-8 text-center text-gray-500">
            <CheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Sin datos para el filtro seleccionado</p>
          </CardContent>
        </Card>
      )}

      {/* Modal nueva tarea */}
      <Dialog open={showNewTaskModal} onOpenChange={setShowNewTaskModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Tarea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input placeholder="Título de la tarea" />
            </div>
            <div>
              <Label>Fecha/Hora *</Label>
              <Input type="datetime-local" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Llamada">Llamada</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Reunión">Reunión</SelectItem>
                    <SelectItem value="Seguimiento">Seguimiento</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Relacionado a</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Contacto">Contacto</SelectItem>
                    <SelectItem value="Cuenta">Cuenta</SelectItem>
                    <SelectItem value="Oportunidad">Oportunidad</SelectItem>
                    <SelectItem value="Orden de Venta">Orden de Venta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Owner *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Asignar a" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ana García">Ana García</SelectItem>
                    <SelectItem value="María López">María López</SelectItem>
                    <SelectItem value="Carlos Ruiz">Carlos Ruiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prioridad</Label>
                <Select defaultValue="Media">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baja">Baja</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm">Recordatorio activado</span>
              </label>
            </div>
            <div>
              <Label>Notas</Label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md h-20"
                placeholder="Notas adicionales..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNewTaskModal(false)}>
                Cancelar
              </Button>
              <Button
                className="text-white"
                style={{ backgroundColor: '#4472C4', color: 'white' }}
                onClick={() => {
                  handleCreateTask({
                    titulo: 'Nueva tarea',
                    type: 'Llamada',
                    owner: 'Ana García',
                    when: new Date().toISOString()
                  });
                  setShowNewTaskModal(false);
                }}
              >
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Render Emails/Llamadas tab (Split 30/70)
  const renderEmailsLlamadas = () => (
    <div className="grid grid-cols-10 gap-6 min-h-[600px]">
      {/* Columna izquierda 30% - Threads */}
      <div className="col-span-3">
        <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '12px', height: '100%' }}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Hilos de Email</CardTitle>
            {/* Filtros para emails */}
            <div className="space-y-3">
              <div>
                <Label>Owner</Label>
                <Select value={emailFilters.owner} onValueChange={(value) =>
                  setEmailFilters({...emailFilters, owner: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Ana García">Ana García</SelectItem>
                    <SelectItem value="María López">María López</SelectItem>
                    <SelectItem value="Carlos Ruiz">Carlos Ruiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Relacionado a</Label>
                <Select value={emailFilters.related_to} onValueChange={(value) =>
                  setEmailFilters({...emailFilters, related_to: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Contacto">Contacto</SelectItem>
                    <SelectItem value="Cuenta">Cuenta</SelectItem>
                    <SelectItem value="Oportunidad">Oportunidad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 h-96 overflow-y-auto">
            {filteredEmailThreads.map((thread) => (
              <div
                key={thread.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${selectedThread?.id === thread.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onClick={() => setSelectedThread(thread)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-sm truncate">{thread.de_para}</p>
                    <p className="text-xs text-gray-600 truncate">{thread.asunto}</p>
                    <p className="text-xs text-gray-500 mt-1">{thread.relacionado}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{new Date(thread.fecha).toLocaleDateString('es-ES')}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {thread.mensajes} msg
                    </Badge>
                  </div>
                </div>
                <Badge
                  className={`text-xs mt-2 ${
                    thread.estado === 'Respondido' ? 'bg-green-100 text-green-800' :
                    thread.estado === 'Escalado' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {thread.estado}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Columna derecha 70% - Viewer & Call Logger */}
      <div className="col-span-7 space-y-6">
        {/* Email Thread Viewer */}
        <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">
                {selectedThread ? `Hilo: ${selectedThread.asunto}` : 'Selecciona un hilo de email'}
              </CardTitle>
              {selectedThread && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    style={{ color: '#4472C4', borderColor: '#4472C4' }}
                    onClick={() => toast({title: "Modo Stub", description: 'Abriendo responder email (modo stub)'})}
                  >
                    Responder
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    style={{ color: '#4472C4', borderColor: '#4472C4' }}
                    onClick={() => toast({title: "Modo Stub", description: 'Reenviando email (modo stub)'})}
                  >
                    Reenviar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    style={{ color: '#4472C4', borderColor: '#4472C4' }}
                  >
                    Adjuntar archivo
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedThread ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium">{selectedThread.de_para}</p>
                      <p className="text-sm text-gray-600">{new Date(selectedThread.fecha).toLocaleString('es-ES')}</p>
                    </div>
                    <Badge>{selectedThread.estado}</Badge>
                  </div>
                  <p className="text-sm text-gray-700">
                    Contenido del email simulado para el hilo "{selectedThread.asunto}".
                    En producción aquí se mostraría el contenido real del email obtenido
                    via Gmail API (modo stub).
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  📊 Logger: gmail_thread_logger workflow (stub mode) - Hilo vinculado a {selectedThread.relacionado}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Selecciona un hilo de email para ver los detalles</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call Logger */}
        <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">Registrar Llamada</CardTitle>
              <Button
                size="sm"
                onClick={() => setShowCallLoggerModal(true)}
                className="text-white"
                style={{ backgroundColor: '#4472C4' }}
              >
                <Phone className="w-4 h-4 mr-2" />
                Nueva Llamada
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500 text-center py-6">
              Registra llamadas realizadas para mantener un seguimiento completo de las comunicaciones con clientes.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Call Logger */}
      <Dialog open={showCallLoggerModal} onOpenChange={setShowCallLoggerModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Llamada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Fecha/Hora *</Label>
              <Input type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} />
            </div>
            <div>
              <Label>Duración (minutos)</Label>
              <Input type="number" placeholder="Ej: 15" />
            </div>
            <div>
              <Label>Para/Con *</Label>
              <Input placeholder="Buscar contacto..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Relacionado a</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Contacto">Contacto</SelectItem>
                    <SelectItem value="Cuenta">Cuenta</SelectItem>
                    <SelectItem value="Oportunidad">Oportunidad</SelectItem>
                    <SelectItem value="Orden de Venta">Orden de Venta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Resultado</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Resultado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contestó">Contestó</SelectItem>
                    <SelectItem value="No contestó">No contestó</SelectItem>
                    <SelectItem value="Buzón">Buzón</SelectItem>
                    <SelectItem value="Volver a llamar">Volver a llamar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Notas</Label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md h-24"
                placeholder="Resumen de la conversación..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCallLoggerModal(false)}>
                Cancelar
              </Button>
              <Button
                className="text-white"
                style={{ backgroundColor: '#4472C4', color: 'white' }}
                onClick={() => {
                  handleLogCall({
                    fecha: new Date().toISOString(),
                    duracion: 15,
                    contacto: 'Cliente test',
                    resultado: 'Contestó'
                  });
                  setShowCallLoggerModal(false);
                }}
              >
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Función principal para renderizar Actividades
  const renderActividades = () => {
    const getSubtabHeader = () => {
      switch (actividadesTab) {
        case 'Conversaciones':
          return {
            title: "Conversaciones",
            description: "Inbox omnicanal con triage de IA, asignación, SLA y handoff a humano."
          };
        case 'Agenda':
          return {
            title: "Agenda",
            description: "Calendario semanal de reuniones, demos y seguimientos. Sincronizado en modo stub con Google Calendar."
          };
        case 'Tareas':
          return {
            title: "Tareas",
            description: "Planifica y ejecuta con prioridades, vencimientos y relación con cuentas u oportunidades."
          };
        case 'Emails/Llamadas':
          return {
            title: "Emails y Llamadas",
            description: "Consulta de hilos de correo y registro de llamadas. Envío en modo stub y logging unificado."
          };
        default:
          return {
            title: "Conversaciones",
            description: "Inbox omnicanal con triage de IA, asignación, SLA y handoff a humano."
          };
      }
    };

    const subtabHeader = getSubtabHeader();

    return (
      <div className="activities-root space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {/* Header específico del subtab */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{subtabHeader.title}</h2>
          <p className="text-sm text-gray-600 mt-1">{subtabHeader.description}</p>
        </div>

        {/* Pestañas de Actividades */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {['Conversaciones', 'Agenda', 'Tareas', 'Emails/Llamadas'].map((tabName) => (
            <Button
              key={tabName}
              size="sm"
              onClick={() => setActividadesTab(tabName)}
              style={{
                backgroundColor: actividadesTab === tabName ? '#4472C4' : 'transparent',
                color: actividadesTab === tabName ? 'white' : '#6B7280',
                borderRadius: '8px'
              }}
            >
              {tabName}
            </Button>
          ))}
        </div>

        {/* Contenido según tab activo */}
        {actividadesTab === 'Conversaciones' && renderConversaciones()}
        {actividadesTab === 'Agenda' && renderAgenda()}
        {actividadesTab === 'Tareas' && renderTareas()}
        {actividadesTab === 'Emails/Llamadas' && renderEmailsLlamadas()}
      </div>
    );
  };

  const renderMarketing = () => {
    // Helper para obtener título y descripción específicos por subtab
    const getSubtabHeader = () => {
      switch (marketingTab) {
        case 'Campañas':
          return {
            title: "Campañas",
            description: "Diseña, segmenta y lanza campañas en canales propios y de pago. Mide respuestas y revenue atribuido."
          };
        case 'Ofertas':
          return {
            title: "Ofertas",
            description: "Gestiona ofertas por segmento y vigencia. Publica y retira con un clic."
          };
        case 'Precios':
          return {
            title: "Precios",
            description: "Define margen objetivo, elasticidad y bundles. Sincroniza con el Cotizador."
          };
        default:
          return {
            title: "Campañas",
            description: "Diseña, segmenta y lanza campañas en canales propios y de pago. Mide respuestas y revenue atribuido."
          };
      }
    };

    const subtabHeader = getSubtabHeader();

    const renderCampañas = () => {
      // Filtros para la tabla de campañas
      const filteredCampañas = mockCampañas.filter(campaign => {
        const estadoMatch = campaignFilters.estado === 'all' || campaign.estado === campaignFilters.estado;
        const canalMatch = campaignFilters.canal === 'all' || campaign.channels.some(ch => ch === campaignFilters.canal);

        let fechaMatch = true;
        if (campaignFilters.fecha_desde || campaignFilters.fecha_hasta) {
          const campaignStart = new Date(campaign.start_at);
          const desde = campaignFilters.fecha_desde ? new Date(campaignFilters.fecha_desde) : new Date('1900-01-01');
          const hasta = campaignFilters.fecha_hasta ? new Date(campaignFilters.fecha_hasta) : new Date('2100-12-31');
          fechaMatch = campaignStart >= desde && campaignStart <= hasta;
        }

        return estadoMatch && canalMatch && fechaMatch;
      });

      return (
        <div className="grid grid-cols-12 gap-6">
          {/* Builder izquierda - 35% */}
          <div className="col-span-12 lg:col-span-4">
            <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Campaign Builder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sección Objetivo */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Objetivo</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>Objetivo *</Label>
                      <Select
                        value={campaignData.goal}
                        onValueChange={(value) => setCampaignData({...campaignData, goal: value})}
                      >
                        <SelectTrigger className="bg-gray-50">
                          <SelectValue placeholder="Seleccionar objetivo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Generar leads">Generar leads</SelectItem>
                          <SelectItem value="Reactivar cuentas">Reactivar cuentas</SelectItem>
                          <SelectItem value="Upsell/Bundle">Upsell/Bundle</SelectItem>
                          <SelectItem value="Retención">Retención</SelectItem>
                          <SelectItem value="Tráfico web">Tráfico web</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>KPI principal *</Label>
                      <Select
                        value={campaignData.kpi}
                        onValueChange={(value) => setCampaignData({...campaignData, kpi: value})}
                      >
                        <SelectTrigger className="bg-gray-50">
                          <SelectValue placeholder="Seleccionar KPI" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Leads">Leads</SelectItem>
                          <SelectItem value="Citas">Citas</SelectItem>
                          <SelectItem value="Oportunidades">Oportunidades</SelectItem>
                          <SelectItem value="Ingresos">Ingresos</SelectItem>
                          <SelectItem value="CTR">CTR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Sección Público */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Público</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>Segmento (query) *</Label>
                      <textarea
                        placeholder="sector = 'Retail' AND country IN ('CL','MX') AND health_color != 'rojo'"
                        value={campaignData.audience_query}
                        onChange={(e) => setCampaignData({...campaignData, audience_query: e.target.value})}
                        className="w-full p-3 border rounded-lg bg-gray-50 h-20 text-sm"
                        style={{ fontFamily: 'monospace' }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Tamaño estimado</Label>
                        <p className="text-sm text-gray-600">{campaignData.size_estimate}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={previewSegment}
                        disabled={!campaignData.audience_query.trim() || calculatingSegment}
                        style={{ color: '#4472C4', borderColor: '#4472C4' }}
                      >
                        {calculatingSegment ? 'Calculando...' : 'Ver Detalle'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Sección Canales */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Canales</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>Selecciona canales *</Label>
                      <div className="space-y-2 mt-2">
                        {["WhatsApp", "Email", "Blog/SEO", "Ads: Meta", "Ads: Google"].map(channel => (
                          <label key={channel} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={campaignData.channels.includes(channel)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCampaignData({
                                    ...campaignData,
                                    channels: [...campaignData.channels, channel]
                                  });
                                } else {
                                  setCampaignData({
                                    ...campaignData,
                                    channels: campaignData.channels.filter(c => c !== channel)
                                  });
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{channel}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {campaignData.channels.some(ch => ch.includes('Ads:')) && (
                      <div>
                        <Label>Presupuesto (si Ads)</Label>
                        <Input
                          type="number"
                          placeholder="5000"
                          value={campaignData.budget}
                          onChange={(e) => setCampaignData({...campaignData, budget: e.target.value})}
                          className="bg-gray-50"
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Fecha inicio *</Label>
                        <Input
                          type="date"
                          value={campaignData.schedule.start}
                          onChange={(e) => setCampaignData({
                            ...campaignData,
                            schedule: {...campaignData.schedule, start: e.target.value}
                          })}
                          className="bg-gray-50"
                        />
                      </div>
                      <div>
                        <Label>Fecha fin *</Label>
                        <Input
                          type="date"
                          value={campaignData.schedule.end}
                          onChange={(e) => setCampaignData({
                            ...campaignData,
                            schedule: {...campaignData.schedule, end: e.target.value}
                          })}
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección Mensaje y Creatividades */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Mensaje y Creatividades</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>Asunto / Título *</Label>
                      <Input
                        placeholder="Ej: Optimiza tu logística Q4"
                        value={campaignData.subject}
                        onChange={(e) => setCampaignData({...campaignData, subject: e.target.value})}
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label>Mensaje *</Label>
                      <textarea
                        placeholder="Describe los beneficios de tu propuesta..."
                        value={campaignData.message}
                        onChange={(e) => setCampaignData({...campaignData, message: e.target.value})}
                        className="w-full p-3 border rounded-lg bg-gray-50 h-24 text-sm"
                        style={{ fontFamily: 'monospace' }}
                      />
                    </div>
                    <div>
                      <Label>CTA</Label>
                      <Input
                        placeholder="Agendar demo / Solicitar cotización"
                        value={campaignData.cta}
                        onChange={(e) => setCampaignData({...campaignData, cta: e.target.value})}
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label>Adjuntos/Creatividades</Label>
                      <Input
                        type="file"
                        accept=".png,.jpg,.pdf"
                        className="bg-gray-50"
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          setCampaignData({...campaignData, assets: files});
                        }}
                      />
                    </div>
                  </div>

                  {/* AI Assist RAY-SDR según JSON */}
                  <div className="p-3 bg-blue-50 border sanded-lg border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-blue-800">Asistente RAY-SDR</span>
                    </div>
                    <p className="text-xs text-blue-700 mb-2">Sugiere copy optimizado por tono:</p>
                    <div className="flex gap-2">
                      {["Profesional", "Directo", "Consultivo", "Promocional"].map(tone => (
                        <Button
                          key={tone}
                          size="sm"
                          variant="outline"
                          className="text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
                          onClick={() => {
                            const suggestions = {
                              'Profesional': 'Optimice sus operaciones logísticas con nuestra solución integral',
                              'Directo': '¡Reduzca costos logísticos hasta 25% este Q4!',
                              'Consultivo': 'Analizamos su cadena logística y proponemos mejoras específicas',
                              'Promocional': '🎯 OFERTA ESPECIAL: Consultoría gratuita + 15% descuento'
                            };
                            setCampaignData({
                              ...campaignData,
                              subject: suggestions[tone]
                            });
                            toast({
                              title: "Copy sugerido",
                              description: `Copy sugerido en tono ${tone.toLowerCase()}`,
                              status: "success",
                            });
                          }}
                        >
                          {tone}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Acciones principales */}
                <div className="space-y-2 pt-4 border-t">
                  <Button
                    className="w-full text-white"
                    style={{ backgroundColor: '#4472C4' }}
                    disabled={!campaignData.goal || !campaignData.kpi || !campaignData.audience_query || campaignData.channels.length === 0}
                    onClick={() => {
                      console.log('📊 Telemetry: campaign_saved', {
                        entity: 'campaign',
                        entity_id: 'new',
                        owner: 'current_user',
                        latency_ms: 150
                      });
                      toast({
                        title: "Campaña guardada",
                        description: "Campaña guardada como borrador",
                        status: "success",
                      });
                    }}
                  >
                    Guardar
                  </Button>
                  <Button
                    className="w-full text-white"
                    style={{ backgroundColor: '#4472C4' }}
                    disabled={!campaignData.goal || !campaignData.subject || !campaignData.message || launchingCampaign}
                    onClick={() => marketingLaunchCampaign('new-campaign')}
                  >
                    {launchingCampaign ? 'Publicando...' : 'Publicar'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    style={{ color: '#4472C4', borderColor: '#4472C4' }}
                    onClick={() => {
                      // Generar CSV stub
                      toast({
                        title: "Audiencia exportada",
                        description: "Exportando audiencia a CSV...",
                        status: "success",
                      });
                    }}
                  >
                    Exportar CSV/XLSX
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabla y métricas derecha - 65% */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* KPIs de Marketing */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="p-4 bg-white">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">2,400</p>
                  <p className="text-xs text-gray-600">Entregados</p>
                </div>
              </Card>
              <Card className="p-4 bg-white">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">178</p>
                  <p className="text-xs text-gray-600">Respuestas</p>
                </div>
              </Card>
              <Card className="p-4 bg-white">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">68</p>
                  <p className="text-xs text-gray-600">Leads</p>
                </div>
              </Card>
              <Card className="p-4 bg-white">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">20</p>
                  <p className="text-xs text-gray-600">Oportunidades</p>
                </div>
              </Card>
              <Card className="p-4 bg-white">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">€192K</p>
                  <p className="text-xs text-gray-600">Revenue atribuido</p>
                </div>
              </Card>
            </div>

            {/* Filtros de tabla */}
            <Card className="p-4 bg-white">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Estado</Label>
                  <Select value={campaignFilters.estado} onValueChange={(value) => setCampaignFilters({...campaignFilters, estado: value})}>
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Borrador">Borrador</SelectItem>
                      <SelectItem value="Activa">Activa</SelectItem>
                      <SelectItem value="Pausada">Pausada</SelectItem>
                      <SelectItem value="Finalizada">Finalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Canal</Label>
                  <Select value={campaignFilters.canal} onValueChange={(value) => setCampaignFilters({...campaignFilters, canal: value})}>
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Blog/SEO">Blog/SEO</SelectItem>
                      <SelectItem value="Ads: Meta">Ads: Meta</SelectItem>
                      <SelectItem value="Ads: Google">Ads: Google</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Desde</Label>
                  <Input
                    type="date"
                    value={campaignFilters.fecha_desde}
                    onChange={(e) => setCampaignFilters({...campaignFilters, fecha_desde: e.target.value})}
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Hasta</Label>
                  <Input
                    type="date"
                    value={campaignFilters.fecha_hasta}
                    onChange={(e) => setCampaignFilters({...campaignFilters, fecha_hasta: e.target.value})}
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </Card>

            {/* Tabla de campañas */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Listado de Campañas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Objetivo</TableHead>
                      <TableHead>Canales</TableHead>
                      <TableHead>Inicio</TableHead>
                      <TableHead>Fin</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>KPI</TableHead>
                      <TableHead>Leads</TableHead>
                      <TableHead>Oport.</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampañas.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>{campaign.goal}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {campaign.channels.slice(0, 2).map(ch => (
                              <Badge key={ch} variant="outline" className="text-xs">
                                {ch.replace('Ads: ', '')}
                              </Badge>
                            ))}
                            {campaign.channels.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{campaign.channels.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(campaign.start_at).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>{new Date(campaign.end_at).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>
                          <Badge className={`${
                            campaign.estado === 'Activa' ? 'bg-green-100 text-green-800' :
                            campaign.estado === 'Pausada' ? 'bg-yellow-100 text-yellow-800' :
                            campaign.estado === 'Borrador' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {campaign.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>{campaign.kpi}</TableCell>
                        <TableCell className="font-medium">{campaign.leads}</TableCell>
                        <TableCell className="font-medium">{campaign.oportunidades}</TableCell>
                        <TableCell className="font-medium">€{campaign.revenue_atribuido.toLocaleString()}</TableCell>
                        <TableCell>{campaign.owner}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              style={{ color: '#4472C4', borderColor: '#4472C4' }}
                              onClick={() => {
                                setSelectedCampaign(campaign);
                                toast({
                                  title: "Viendo detalle",
                                  description: `Viendo detalles de ${campaign.name}`,
                                  status: "info"
                                });
                              }}
                            >
                              Ver Detalle
                            </Button>
                            {campaign.estado === 'Borrador' && (
                              <Button
                                size="sm"
                                style={{ backgroundColor: '#4472C4', color: 'white' }}
                                onClick={() => marketingLaunchCampaign(campaign.id)}
                                disabled={launchingCampaign}
                              >
                                Publicar
                              </Button>
                            )}
                            {campaign.estado === 'Activa' && (
                              <Button
                                size="sm"
                                style={{ backgroundColor: '#DA2242', color: 'white' }}
                                onClick={() => {
                                  campaign.estado = 'Pausada';
                                  toast({
                                    title: "Campaña retirada",
                                    description: `Campaña ${campaign.name} retirada`,
                                    status: "success",
                                  });
                                }}
                              >
                                Retirar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredCampañas.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay campañas con los filtros actuales
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      );
    };

    const renderOfertas = () => {
      const filteredOfertas = mockOfertas.filter(offer => {
        const estadoMatch = offerFilters.estado === 'all' || offer.estado === offerFilters.estado;
        const segmentoMatch = !offerFilters.segmento || offer.segmento.toLowerCase().includes(offerFilters.segmento.toLowerCase());

        let vigenciaMatch = true;
        if (offerFilters.vigencia_desde || offerFilters.vigencia_hasta) {
          const offerStart = new Date(offer.vigencia_inicio);
          const desde = offerFilters.vigencia_desde ? new Date(offerFilters.vigencia_desde) : new Date('1900-01-01');
          const hasta = offerFilters.vigencia_hasta ? new Date(offerFilters.vigencia_hasta) : new Date('2100-12-31');
          vigenciaMatch = offerStart >= desde && offerStart <= hasta;
        }

        return estadoMatch && segmentoMatch && vigenciaMatch;
      });

      return (
        <div className="space-y-6">
          {/* Filtros */}
          <Card className="p-4 bg-white">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Estado</Label>
                <Select value={offerFilters.estado} onValueChange={(value) => setOfferFilters({...offerFilters, estado: value})}>
                  <SelectTrigger className="bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Borrador">Borrador</SelectItem>
                      <SelectItem value="Activa">Activa</SelectItem>
                      <SelectItem value="Pausada">Pausada</SelectItem>
                      <SelectItem value="Vencida">Vencida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              <div>
                <Label>Segmento</Label>
                <Input
                  placeholder="Buscar segmento..."
                  value={offerFilters.segmento}
                  onChange={(e) => setOfferFilters({...offerFilters, segmento: e.target.value})}
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>Vigencia desde</Label>
                <Input
                  type="date"
                  value={offerFilters.vigencia_desde}
                  onChange={(e) => setOfferFilters({...offerFilters, vigencia_desde: e.target.value})}
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>Vigencia hasta</Label>
                <Input
                  type="date"
                  value={offerFilters.vigencia_hasta}
                  onChange={(e) => setOfferFilters({...offerFilters, vigencia_hasta: e.target.value})}
                  className="bg-gray-50"
                />
              </div>
            </div>
          </Card>

          {/* Tabla de ofertas */}
          <Card className="bg-white">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Ofertas</CardTitle>
                <Button
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                  onClick={() => setShowOfferEditor(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Oferta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Segmento</TableHead>
                    <TableHead>Vigencia Inicio</TableHead>
                    <TableHead>Vigencia Fin</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Activaciones</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOfertas.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.name}</TableCell>
                      <TableCell>{offer.segmento}</TableCell>
                      <TableCell>{new Date(offer.vigencia_inicio).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>{new Date(offer.vigencia_fin).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>
                        <Badge className={`${
                          offer.estado === 'Activa' ? 'bg-green-100 text-green-800' :
                          offer.estado === 'Pausada' ? 'bg-yellow-100 text-yellow-800' :
                          offer.estado === 'Vencida' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {offer.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>{offer.owner}</TableCell>
                      <TableCell className="font-medium">{offer.activaciones}</TableCell>
                      <TableCell className="font-medium">€{offer.revenue_generado.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            style={{ color: '#4472C4', borderColor: '#4472C4' }}
                            onClick={() => {
                               setSelectedOffer(offer);
                               toast({
                                 title: "Viendo detalle",
                                 description: `Viendo detalles de ${offer.name}`,
                                 status: "info"
                               });
                             }}
                          >
                            Ver Detalle
                          </Button>
                          {offer.estado === 'Borrador' && (
                            <Button
                              size="sm"
                              style={{ backgroundColor: '#4472C4', color: 'white' }}
                              onClick={() => marketingOfferSync(offer.id)}
                            >
                              Publicar
                            </Button>
                          )}
                          {offer.estado === 'Activa' && (
                            <Button
                              size="sm"
                              style={{ backgroundColor: '#DA2242', color: 'white' }}
                              onClick={() => {
                                offer.estado = 'Pausada';
                                console.log('📊 Telemetry: offer_withdrawn', {
                                  entity: 'offer',
                                  entity_id: offer.id,
                                  owner: offer.owner,
                                  channels: offer.canales,
                                  latency_ms: 200
                                });
                                toast({
                                  title: "Oferta retirada",
                                  description: `Oferta ${offer.name} retirada`,
                                  status: "success",
                                });
                              }}
                            >
                              Retirar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredOfertas.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Sin datos para el filtro seleccionado
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    };

    const renderPrecios = () => (
      <div className="space-y-6">
        {/* Panel Margen Objetivo */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Margen Objetivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Margen objetivo (%)</Label>
              <Input
                type="number"
                value={pricingData.margen_objetivo_pct}
                onChange={(e) => setPricingData({...pricingData, margen_objetivo_pct: parseFloat(e.target.value)})}
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label>Margen mínimo (%)</Label>
              <Input
                type="number"
                value={pricingData.min_margin_pct}
                onChange={(e) => setPricingData({...pricingData, min_margin_pct: parseFloat(e.target.value)})}
                className="bg-gray-50"
              />
            </div>
            <Button
              className="w-full text-white"
              style={{ backgroundColor: '#4472C4' }}
              onClick={() => {
                console.log('📊 Telemetry: pricing_saved', {
                  entity: 'pricing',
                  entity_id: 'margin_config',
                  owner: 'current_user',
                  latency_ms: 180
                });
                toast({
                  title: "Configuración guardada",
                  description: "Configuración de márgenes guardada",
                  status: "success",
                });
              }}
            >
              Guardar
            </Button>
          </CardContent>
        </Card>

        {/* Panel Elasticidad */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Elasticidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Modelo</Label>
              <Select
                value={pricingData.modelo_elasticidad}
                onValueChange={(value) => setPricingData({...pricingData, modelo_elasticidad: value})}
              >
                <SelectTrigger className="bg-gray-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lineal">Lineal</SelectItem>
                  <SelectItem value="Logarítmico">Logarítmico</SelectItem>
                  <SelectItem value="Escalonado">Escalonado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Parámetros</Label>
              <textarea
                placeholder='{"elasticidad": 0.8, "base_price": 1000}'
                className="w-full p-3 border rounded-lg bg-gray-50 h-20 text-sm"
                style={{ fontFamily: 'monospace' }}
                onChange={(e) => {
                  try {
                    const params = JSON.parse(e.target.value);
                    setPricingData({...pricingData, parametros_elasticidad: params});
                  } catch (error) {
                    console.error("Invalid JSON for parametros_elasticidad:", error);
                  }
                }}
              />
            </div>
            <Button
              variant="outline"
              className="w-full"
              style={{ color: '#4472C4', borderColor: '#4472C4' }}
              onClick={() => toast({
                title: "Simulando",
                description: "Simulando elasticidad de precios...",
                status: "info"
              })}
            >
              Ver Detalle
            </Button>
          </CardContent>
        </Card>

        {/* Panel Competencia */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Competencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>CSV de competencia</Label>
              <Input
                type="file"
                accept=".csv"
                className="bg-gray-50"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    toast({
                      title: "CSV cargado",
                      description: "CSV de competencia cargado",
                      status: "success",
                    });
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato: ruta, proveedor, precio, fecha
              </p>
            </div>
            <Button
              className="w-full text-white"
              style={{ backgroundColor: '#4472C4' }}
              onClick={() => {
                toast({
                  title: "Datos procesados",
                  description: "Datos de competencia procesados",
                  status: "success",
                });
              }}
            >
              Guardar
            </Button>
          </CardContent>
        </Card>

        {/* Panel Bundles */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Bundles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Reglas</Label>
              <textarea
                placeholder='{"flete_seguro": {"discount": 0.1}, "volumen_alto": {"threshold": 100, "discount": 0.15}}'
                className="w-full p-3 border rounded-lg bg-gray-50 h-20 text-sm"
                style={{ fontFamily: 'monospace' }}
                onChange={(e) => {
                  try {
                    const rules = JSON.parse(e.target.value);
                    setPricingData({...pricingData, bundle_rules: rules});
                  } catch (error) {
                    console.error("Invalid JSON for bundle_rules:", error);
                  }
                }}
              />
            </div>
            <Button
              variant="outline"
              className="w-full"
              style={{ color: '#4472C4', borderColor: '#4472C4' }}
              onClick={() => {
                console.log('📊 Telemetry: pricing_synced_with_quote', {
                  entity: 'pricing',
                  entity_id: 'bundle_sync',
                  owner: 'current_user',
                  latency_ms: 320
                });
                toast({
                  title: "Sincronizado",
                  description: "Bundles sincronizados con Cotizador",
                  status: "success",
                });
              }}
            >
              Sincronizar con Cotizador
            </Button>
          </CardContent>
        </Card>
      </div>
    );

    return (
      <div className="marketing-root space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {/* Header específico del subtab */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{subtabHeader.title}</h2>
          <p className="text-sm text-gray-600 mt-1">{subtabHeader.description}</p>
        </div>

        {/* Pestañas del Marketing */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {['Campañas', 'Ofertas', 'Precios'].map((tabName) => (
            <Button
              key={tabName}
              size="sm"
              onClick={() => setMarketingTab(tabName)}
              style={{
                backgroundColor: marketingTab === tabName ? '#4472C4' : 'transparent',
                color: marketingTab === tabName ? 'white' : '#6B7280',
                borderRadius: '8px'
              }}
            >
              {tabName}
            </Button>
          ))}
        </div>

        {/* Contenido por tab */}
        {marketingTab === 'Campañas' && renderCampañas()}
        {marketingTab === 'Ofertas' && renderOfertas()}
        {marketingTab === 'Precios' && renderPrecios()}
      </div>
    );
  };

  // Funciones de filtrado para Postventa
  const filteredSupportCases = soporteFilters.estado === 'all' && soporteFilters.prioridad === 'all' && soporteFilters.owner === 'all' && soporteFilters.canal === 'all' && !soporteFilters.fecha_desde && !soporteFilters.fecha_hasta
  ? mockSupportCases
  : mockSupportCases.filter(caso => {
    const estadoMatch = soporteFilters.estado === 'all' || caso.estado === soporteFilters.estado;
    const prioridadMatch = soporteFilters.prioridad === 'all' || caso.prioridad === soporteFilters.prioridad;
    const ownerMatch = soporteFilters.owner === 'all' || caso.owner === soporteFilters.owner;
    const canalMatch = soporteFilters.canal === 'all' || caso.canal === soporteFilters.canal;

    let fechaMatch = true;
    if (soporteFilters.fecha_desde || soporteFilters.fecha_hasta) {
      const casoDate = new Date(caso.fecha);
      const desde = soporteFilters.fecha_desde ? new Date(soporteFilters.fecha_desde) : new Date('1900-01-01');
      const hasta = soporteFilters.fecha_hasta ? new Date(soporteFilters.fecha_hasta) : new Date('2100-12-31');
      fechaMatch = casoDate >= desde && casoDate <= hasta;
    }

    return estadoMatch && prioridadMatch && ownerMatch && canalMatch && fechaMatch;
  });

  const filteredNpsData = npsFilters.score === 'all' && !npsFilters.segmento && npsFilters.owner === 'all' && !npsFilters.fecha_desde && !npsFilters.fecha_hasta
    ? mockNpsData
    : mockNpsData.filter(nps => {
      const scoreMatch = npsFilters.score === 'all' ||
        (npsFilters.score === '0-6 Detractor' && nps.score <= 6) ||
        (npsFilters.score === '7-8 Neutral' && nps.score >= 7 && nps.score <= 8) ||
        (npsFilters.score === '9-10 Promotor' && nps.score >= 9);
      const segmentoMatch = !npsFilters.segmento || nps.segmento.toLowerCase().includes(npsFilters.segmento.toLowerCase());
      const ownerMatch = npsFilters.owner === 'all' || nps.owner === npsFilters.owner;

      let fechaMatch = true;
      if (npsFilters.fecha_desde || npsFilters.fecha_hasta) {
        const npsDate = new Date(nps.fecha);
        const desde = npsFilters.fecha_desde ? new Date(npsFilters.fecha_desde) : new Date('1900-01-01');
        const hasta = npsFilters.fecha_hasta ? new Date(npsFilters.fecha_hasta) : new Date('2100-12-31');
        fechaMatch = npsDate >= desde && npsDate <= hasta;
      }

      return scoreMatch && segmentoMatch && ownerMatch && fechaMatch;
    });

  const getSlaConfig = (prioridad, slaStatus) => {
    const targets = { 'Baja': '48h', 'Media': '24h', 'Alta': '8h', 'Crítica': '4h' };
    const badges = {
      'ok': { bg: 'bg-green-100', fg: 'text-green-800' },
      'warn': { bg: 'bg-yellow-100', fg: 'text-yellow-800', border: 'border-yellow-500' },
      'breach': { bg: 'bg-red-100', fg: 'text-red-800', border: 'border-red-500' }
    };

    return {
      target: targets[prioridad] || '24h',
      style: badges[slaStatus] || badges.ok
    };
  };

  const filteredAgingData = cobranzaFilters.bucket === 'all' && cobranzaFilters.estado === 'all' && cobranzaFilters.owner === 'all'
    ? mockAgingData
    : mockAgingData.filter(ar => {
      const bucketMatch = cobranzaFilters.bucket === 'all' || ar.bucket === cobranzaFilters.bucket;
      const estadoMatch = cobranzaFilters.estado === 'all' || ar.estado === cobranzaFilters.estado;
      const ownerMatch = cobranzaFilters.owner === 'all' || ar.owner === cobranzaFilters.owner;

      return bucketMatch && estadoMatch && ownerMatch;
    });

  // Handlers para acciones principales
  const handleSupportAction = async (action, caseId) => {
    const supportCase = mockSupportCases.find(c => c.id === caseId);

    switch(action) {
      case 'responder':
        setSelectedSupportCase(supportCase);
        setShowCaseDrawer(true);
        break;
      case 'escalar_humano':
        await executeWorkflow('support_case_escalated', { case_id: caseId });
        break;
      case 'cerrar_caso':
        await executeWorkflow('support_case_closed', { case_id: caseId });
        break;
      default:
        toast({ title: `Acción ${action} ejecutada`, status: "success" });
    }
  };

  const handleNpsAction = async (action, npsId) => {
    switch(action) {
      case 'enviar_nps':
        await executeWorkflow('nps_trigger_post_pod', { survey_type: 'satisfaction' });
        break;
      case 'registrar_followup':
        const npsItem = mockNpsData.find(n => n.id === npsId);
        await executeWorkflow('nps_handling_detractor_promoter', {
          nps_id: npsId,
          score: npsItem?.score,
          tipo: npsItem?.tipo
        });
        break;
      default:
        toast({ title: `Acción NPS ${action} ejecutada`, status: "success" });
    }
  };

  const handleArAction = async (action, invoiceId) => {
    const arItem = mockAgingData.find(ar => ar.id === invoiceId);

    switch(action) {
      case 'credit_hold':
        await executeWorkflow('alerta_credit_hold', {
          account_id: arItem?.cliente,
          invoice_id: invoiceId
        });
        break;
      case 'recordar':
        await executeWorkflow('accounts_receivable_dunning', {
          invoice_id: invoiceId,
          stage: 'friendly'
        });
        break;
      case 'registrar_promesa':
        setSelectedInvoice(arItem);
        setShowPromiseModal(true);
        break;
      default:
        toast({ title: `Acción cobranza ${action} ejecutada`, status: "success" });
    }
  };

  const handleSavePromise = async () => {
    if (!promiseData.promise_date || !promiseData.promise_amount) {
      toast({ title: "Fecha y monto de promesa son obligatorios", status: "error" });
      return;
    }

    await executeWorkflow('health_score_refresh', {
      account_id: selectedInvoice?.cliente,
      promise_date: promiseData.promise_date,
      promise_amount: promiseData.promise_amount
    });

    setShowPromiseModal(false);
    setPromiseData({ promise_date: '', promise_amount: '', notes: '' });
    setSelectedInvoice(null);
    toast({ title: "Promesa de pago registrada exitosamente", status: "success" });
  };

  // Renderizadores principales
  const renderSoporte = () => (
    <div className="space-y-6">
      {/* Filtros según JSON spec */}
      <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Select value={soporteFilters.estado} onValueChange={(value) => setSoporteFilters({...soporteFilters, estado: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="En curso">En curso</SelectItem>
                <SelectItem value="Pendiente cliente">Pendiente cliente</SelectItem>
                <SelectItem value="Escalado">Escalado</SelectItem>
                <SelectItem value="Cerrado">Cerrado</SelectItem>
                <SelectItem value="Nuevo">Nuevo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={soporteFilters.prioridad} onValueChange={(value) => setSoporteFilters({...soporteFilters, prioridad: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="Baja">Baja</SelectItem>
                <SelectItem value="Media">Media</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Crítica">Crítica</SelectItem>
              </SelectContent>
            </Select>

            <Select value={soporteFilters.owner} onValueChange={(value) => setSoporteFilters({...soporteFilters, owner: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los owners</SelectItem>
                <SelectItem value="Ana García">Ana García</SelectItem>
                <SelectItem value="María López">María López</SelectItem>
                <SelectItem value="Carlos Ruiz">Carlos Ruiz</SelectItem>
              </SelectContent>
            </Select>

            <Select value={soporteFilters.canal} onValueChange={(value) => setSoporteFilters({...soporteFilters, canal: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los canales</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Web">Web</SelectItem>
                <SelectItem value="Phone">Phone</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Desde"
              value={soporteFilters.fecha_desde}
              onChange={(e) => setSoporteFilters({...soporteFilters, fecha_desde: e.target.value})}
            />

            <Input
              type="date"
              placeholder="Hasta"
              value={soporteFilters.fecha_hasta}
              onChange={(e) => setSoporteFilters({...soporteFilters, fecha_hasta: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de casos según JSON columns */}
      <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
        <CardHeader>
          <CardTitle>Cola de Casos de Soporte</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSupportCases.length > 0 ? filteredSupportCases.map((caso) => {
                const slaConfig = getSlaConfig(caso.prioridad, caso.sla_status);
                return (
                  <TableRow key={caso.id}>
                    <TableCell>
                      {new Date(caso.fecha).toLocaleDateString('es-ES', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className="font-medium">{caso.cliente}</TableCell>
                    <TableCell>{caso.asunto}</TableCell>
                    <TableCell>
                      <Badge className={
                        caso.prioridad === 'Crítica' ? 'bg-red-100 text-red-800' :
                        caso.prioridad === 'Alta' ? 'bg-orange-100 text-orange-800' :
                        caso.prioridad === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {caso.prioridad}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        caso.estado === 'Cerrado' ? 'bg-green-100 text-green-800' :
                        caso.estado === 'Escalado' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {caso.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>{caso.owner}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${slaConfig.style.bg} ${slaConfig.style.fg} ${slaConfig.style.border}`}
                      >
                        {caso.sla_remaining}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{caso.canal}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSupportAction('responder', caso.id)}
                          style={{ borderColor: '#4472C4', color: '#4472C4' }}
                        >
                          Responder
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSupportAction('escalar_humano', caso.id)}
                          style={{ borderColor: '#4472C4', color: '#4472C4' }}
                        >
                          Escalar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSupportAction('cerrar_caso', caso.id)}
                          style={{ backgroundColor: '#4472C4', color: 'white' }}
                        >
                          Cerrar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500">
                    No hay casos con los filtros actuales
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderNps = () => {
    const npsMetrics = calculateNpsMetrics();

    return (
      <div className="space-y-6">
        {/* KPIs NPS según JSON spec */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="NPS Actual"
            value={npsMetrics.nps_actual}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="% Promotores"
            value={`${npsMetrics.promotores}%`}
            icon={CheckCircle}
            color="bg-green-500"
          />
          <StatCard
            title="% Neutrales"
            value={`${npsMetrics.neutrales}%`}
            icon={Clock}
            color="bg-yellow-500"
          />
          <StatCard
            title="% Detractores"
            value={`${npsMetrics.detractores}%`}
            icon={AlertTriangle}
            color="bg-red-500"
          />
        </div>

        {/* Filtros NPS */}
        <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select value={npsFilters.score} onValueChange={(value) => setNpsFilters({...npsFilters, score: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los scores</SelectItem>
                  <SelectItem value="0-6 Detractor">0-6 Detractor</SelectItem>
                  <SelectItem value="7-8 Neutral">7-8 Neutral</SelectItem>
                  <SelectItem value="9-10 Promotor">9-10 Promotor</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Segmento"
                value={npsFilters.segmento}
                onChange={(e) => setNpsFilters({...npsFilters, segmento: e.target.value})}
              />

              <Select value={npsFilters.owner} onValueChange={(value) => setNpsFilters({...npsFilters, owner: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los owners</SelectItem>
                  <SelectItem value="Ana García">Ana García</SelectItem>
                  <SelectItem value="María López">María López</SelectItem>
                  <SelectItem value="Carlos Ruiz">Carlos Ruiz</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="Desde"
                value={npsFilters.fecha_desde}
                onChange={(e) => setNpsFilters({...npsFilters, fecha_desde: e.target.value})}
              />

              <Input
                type="date"
                placeholder="Hasta"
                value={npsFilters.fecha_hasta}
                onChange={(e) => setNpsFilters({...npsFilters, fecha_hasta: e.target.value})}
              />
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => handleNpsAction('enviar_nps')}
                style={{ backgroundColor: '#4472C4', color: 'white' }}
                disabled={processingWorkflow}
              >
                <Plus className="w-4 h-4 mr-2" />
                Enviar NPS
              </Button>
              <Button
                variant="outline"
                style={{ borderColor: '#4472C4', color: '#4472C4' }}
              >
                Exportar CSV/XLSX
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla NPS según JSON columns */}
        <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
          <CardHeader>
            <CardTitle>Respuestas NPS</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Comentario</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead>Follow-up</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNpsData.length > 0 ? filteredNpsData.map((nps) => (
                  <TableRow key={nps.id}>
                    <TableCell>
                      {new Date(nps.fecha).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell className="font-medium">{nps.cliente}</TableCell>
                    <TableCell>{nps.contacto}</TableCell>
                    <TableCell>
                      <Badge className={getNpsScoreColor(nps.score)}>
                        {nps.score}/10
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{nps.comentario}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{nps.segmento}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        nps.follow_up === 'Completado' ? 'bg-green-100 text-green-800' :
                        nps.follow_up === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {nps.follow_up}
                      </Badge>
                    </TableCell>
                    <TableCell>{nps.owner}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          style={{ borderColor: '#4472C4', color: '#4472C4' }}
                        >
                          Ver Detalle
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNpsAction('registrar_followup', nps.id)}
                          style={{ borderColor: '#4472C4', color: '#4472C4' }}
                          disabled={processingWorkflow}
                        >
                          Follow-up
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-500">
                      Sin datos para el filtro seleccionado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCobranza = () => (
    <div className="space-y-6">
      {/* Buckets summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['0-30', '31-60', '61-90', '90+'].map(bucket => {
          const bucketData = mockAgingData.filter(ar => ar.bucket === bucket);
          const totalAmount = bucketData.reduce((sum, ar) => sum + ar.monto, 0);
          const count = bucketData.length;

          return (
            <StatCard
              key={bucket}
              title={`${bucket} días`}
              value={`€${totalAmount.toLocaleString()}`}
              icon={Clock}
              color={
                bucket === '0-30' ? 'bg-green-500' :
                bucket === '31-60' ? 'bg-yellow-500' :
                bucket === '61-90' ? 'bg-orange-500' : 'bg-red-500'
              }
              trend={`${count} cuentas`}
            />
          );
        })}
      </div>

      {/* Filtros Cobranza */}
      <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={cobranzaFilters.bucket} onValueChange={(value) => setCobranzaFilters({...cobranzaFilters, bucket: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Bucket" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los buckets</SelectItem>
                <SelectItem value="0-30">0-30 días</SelectItem>
                <SelectItem value="31-60">31-60 días</SelectItem>
                <SelectItem value="61-90">61-90 días</SelectItem>
                <SelectItem value="90+">90+ días</SelectItem>
              </SelectContent>
            </Select>

            <Select value={cobranzaFilters.estado} onValueChange={(value) => setCobranzaFilters({...cobranzaFilters, estado: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Sin gestión">Sin gestión</SelectItem>
                <SelectItem value="Recordado">Recordado</SelectItem>
                <SelectItem value="Promesa">Promesa</SelectItem>
                <SelectItem value="Incumplido">Incumplido</SelectItem>
                <SelectItem value="Plan de pago">Plan de pago</SelectItem>
              </SelectContent>
            </Select>

            <Select value={cobranzaFilters.owner} onValueChange={(value) => setCobranzaFilters({...cobranzaFilters, owner: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los owners</SelectItem>
                <SelectItem value="Ana García">Ana García</SelectItem>
                <SelectItem value="María López">María López</SelectItem>
                <SelectItem value="Carlos Ruiz">Carlos Ruiz</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla Aging según JSON columns */}
      <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
        <CardHeader>
          <CardTitle>Aging de Cuentas por Cobrar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Días</TableHead>
                <TableHead>Promesa</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgingData.length > 0 ? filteredAgingData.map((ar) => (
                <TableRow key={ar.id}>
                  <TableCell className="font-medium">{ar.cliente}</TableCell>
                  <TableCell>€{ar.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    <Badge className={
                      ar.dias <= 30 ? 'bg-green-100 text-green-800' :
                      ar.dias <= 60 ? 'bg-yellow-100 text-yellow-800' :
                      ar.dias <= 90 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {ar.dias} días
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ar.promesa ? new Date(ar.promesa).toLocaleDateString('es-ES') : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      ar.estado === 'Sin gestión' ? 'bg-gray-100 text-gray-800' :
                      ar.estado === 'Recordado' ? 'bg-blue-100 text-blue-800' :
                      ar.estado === 'Promesa' ? 'bg-green-100 text-green-800' :
                      ar.estado === 'Incumplido' ? 'bg-red-100 text-red-800' :
                      'bg-purple-100 text-purple-800'
                    }>
                      {ar.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>{ar.owner}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleArAction('credit_hold', ar.id)}
                        style={{ backgroundColor: '#DA2242', color: 'white' }}
                        disabled={processingWorkflow}
                      >
                        Credit Hold
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArAction('recordar', ar.id)}
                        style={{ borderColor: '#4472C4', color: '#4472C4' }}
                        disabled={processingWorkflow}
                      >
                        Recordar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleArAction('registrar_promesa', ar.id)}
                        style={{ backgroundColor: '#4472C4', color: 'white' }}
                        disabled={processingWorkflow}
                      >
                        Promesa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    No hay cuentas por cobrar en el bucket seleccionado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderPostventa = () => {
    return (
      <div className="postventa-root space-y-6" style={{ fontFamily: 'Montserrat', sans_serif: true }}>
        {/* Pestañas del módulo Postventa */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {['Soporte', 'NPS', 'Cobranza'].map((tabName) => (
            <Button
              key={tabName}
              size="sm"
              onClick={() => setPostventaTab(tabName)}
              style={{
                backgroundColor: postventaTab === tabName ? '#4472C4' : 'transparent',
                color: postventaTab === tabName ? 'white' : '#6B7280',
                borderRadius: '8px'
              }}
            >
              {tabName}
            </Button>
          ))}
        </div>

        {/* Contenido según tab */}
        {postventaTab === 'Soporte' && renderSoporte()}
        {postventaTab === 'NPS' && renderNps()}
        {postventaTab === 'Cobranza' && renderCobranza()}

        {/* Modals */}

        {/* Modal Case Drawer */}
        <Dialog open={showCaseDrawer} onOpenChange={setShowCaseDrawer}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedSupportCase ? `Caso ${selectedSupportCase.id} - ${selectedSupportCase.asunto}` : 'Detalle del Caso'}
              </DialogTitle>
            </DialogHeader>
            {selectedSupportCase && (
              <div className="space-y-6">
                {/* Header fields según JSON */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Cliente</Label>
                    <p className="font-medium">{selectedSupportCase.cliente}</p>
                  </div>
                  <div>
                    <Label>Owner</Label>
                    <p>{selectedSupportCase.owner}</p>
                  </div>
                  <div>
                    <Label>Prioridad</Label>
                    <Badge className={
                      selectedSupportCase.prioridad === 'Crítica' ? 'bg-red-100 text-red-800' :
                      selectedSupportCase.prioridad === 'Alta' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {selectedSupportCase.prioridad}
                    </Badge>
                  </div>
                </div>

                {/* Panels según JSON */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Detalle</h4>
                    <p>{selectedSupportCase.descripcion}</p>
                    {selectedSupportCase.adjuntos?.length > 0 && (
                      <div className="mt-2">
                        <Label>Adjuntos:</Label>
                        {selectedSupportCase.adjuntos.map(file => (
                          <Badge key={file} variant="outline" className="ml-1">{file}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Vínculos</h4>
                    <div className="space-y-2">
                      <p><strong>Contacto:</strong> {selectedSupportCase.contacto}</p>
                      {selectedSupportCase.opportunity_id && (
                        <p><strong>Oportunidad:</strong> {selectedSupportCase.opportunity_id}</p>
                      )}
                      {selectedSupportCase.sales_order_id && (
                        <p><strong>Orden de Venta:</strong> {selectedSupportCase.sales_order_id}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Historial</h4>
                    <div className="space-y-2">
                      {selectedSupportCase.historial?.map((entry, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{entry.evento}</span>
                          <span className="text-gray-500">
                            {new Date(entry.fecha).toLocaleDateString('es-ES')} - {entry.usuario}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reply box según JSON */}
                <div className="border-t pt-4">
                  <Label>Responder</Label>
                  <Textarea placeholder="Escribe tu respuesta..." className="mt-2" />
                  <div className="flex gap-3 mt-3">
                    <Select defaultValue="Email">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Nota interna">Nota interna</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      style={{ backgroundColor: '#4472C4', color: 'white' }}
                      disabled={processingWorkflow}
                    >
                      Responder
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal Promise según JSON spec */}
        <Dialog open={showPromiseModal} onOpenChange={setShowPromiseModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Registrar Promesa de Pago - {selectedInvoice?.cliente}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="promise_date">Fecha promesa *</Label>
                <Input
                  id="promise_date"
                  type="date"
                  value={promiseData.promise_date}
                  onChange={(e) => setPromiseData({...promiseData, promise_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="promise_amount">Monto promesa *</Label>
                <Input
                  id="promise_amount"
                  type="number"
                  step="0.01"
                  value={promiseData.promise_amount}
                  onChange={(e) => setPromiseData({...promiseData, promise_amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={promiseData.notes}
                  onChange={(e) => setPromiseData({...promiseData, notes: e.target.value})}
                  placeholder="Comentarios adicionales..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPromiseModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSavePromise}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                  disabled={processingWorkflow}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };
  const renderAnalytics = () => (
    <div className="analytics-root space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Global Filters según JSON spec */}
      <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle className="text-[16px] font-semibold">Filtros Globales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Rango de fechas *</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={analyticsGlobalFilters.date_desde}
                  onChange={(e) => setAnalyticsGlobalFilters({...analyticsGlobalFilters, date_desde: e.target.value})}
                  className="bg-gray-50"
                />
                <Input
                  type="date"
                  value={analyticsGlobalFilters.date_hasta}
                  onChange={(e) => setAnalyticsGlobalFilters({...analyticsGlobalFilters, date_hasta: e.target.value})}
                  className="bg-gray-50"
                />
              </div>
            </div>
            <div>
              <Label>País</Label>
              <Select>
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="Países" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ES">España</SelectItem>
                  <SelectItem value="FR">Francia</SelectItem>
                  <SelectItem value="DE">Alemania</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sector</Label>
              <Select>
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="Sectores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Alimentación">Alimentación</SelectItem>
                  <SelectItem value="Textil">Textil</SelectItem>
                  <SelectItem value="Automoción">Automoción</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Owner</Label>
              <Select value={analyticsGlobalFilters.owner} onValueChange={(value) => setAnalyticsGlobalFilters({...analyticsGlobalFilters, owner: value})}>
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="Owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Ana García">Ana García</SelectItem>
                  <SelectItem value="María López">María López</SelectItem>
                  <SelectItem value="Carlos Ruiz">Carlos Ruiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Canal</Label>
              <Select>
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="Canales" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Web">Web</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={applyAnalyticsFilters}
              disabled={analyticsLoading || !analyticsGlobalFilters.date_desde || !analyticsGlobalFilters.date_hasta}
              variant="outline"
              style={{ color: '#4472C4', borderColor: '#4472C4' }}
            >
              {analyticsLoading ? 'Aplicando...' : 'Aplicar Filtros'}
            </Button>
            <Button
              onClick={exportAnalytics}
              disabled={exportingAnalytics}
              variant="outline"
              style={{ color: '#4472C4', borderColor: '#4472C4' }}
            >
              {exportingAnalytics ? 'Exportando...' : 'Exportar CSV/XLSX'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs según JSON spec */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {['Resumen', 'Funnel', 'Cohortes', 'Ingresos', 'Cobranza', 'Churn/Retención', 'Insights de IA'].map((tabName) => (
          <Button
            key={tabName}
            size="sm"
            onClick={() => setAnalyticsTab(tabName)}
            style={{
              backgroundColor: analyticsTab === tabName ? '#4472C4' : 'transparent',
              color: analyticsTab === tabName ? 'white' : '#6B7280',
              borderRadius: '8px'
            }}
          >
            {tabName}
          </Button>
        ))}
      </div>

      {/* Contenido según tab activo - IMPLEMENTACIONES COMPLETAS */}
      {analyticsTab === 'Resumen' && (
        <div className="space-y-6">
          {/* KPIs clave */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Leads" value={mockAnalyticsData.kpis.leads} icon={Users} color="bg-blue-500" trend="+12%" />
            <StatCard title="Oportunidades" value={mockAnalyticsData.kpis.oportunidades} icon={Target} color="bg-purple-500" trend="+8%" />
            <StatCard title="Win Rate" value={`${mockAnalyticsData.kpis.win_rate}%`} icon={TrendingUp} color="bg-green-500" trend="+2.1%" />
            <StatCard title="Ingresos (OV)" value={`€${(mockAnalyticsData.kpis.revenue).toLocaleString('es-ES')}`} icon={DollarSign} color="bg-yellow-500" trend="+15%" />
            <StatCard title="Cobrado" value={`€${(mockAnalyticsData.kpis.cobrado).toLocaleString('es-ES')}`} icon={CheckCircle} color="bg-green-600" trend="+18%" />
            <StatCard title="DSO (días)" value={mockAnalyticsData.kpis.dso} icon={Clock} color="bg-orange-500" trend="-3.2 días" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
              <CardHeader>
                <CardTitle className="text-[18px] font-semibold">Ingresos vs Cobranza</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <LineChart className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Gráfico de línea - Evolución ingresos vs cobranza</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
              <CardHeader>
                <CardTitle className="text-[18px] font-semibold">Leads & Oportunidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Gráfico de área - Evolución leads y oportunidades</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {analyticsTab === 'Funnel' && (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Funnel de Ventas</h2>
            <p className="text-sm text-gray-600 mt-1">Conversión por etapa y velocidad entre etapas.</p>
          </div>

          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[18px] font-semibold">Análisis de Conversión</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Tasa Conversión</TableHead>
                    <TableHead>Tiempo Promedio (días)</TableHead>
                    <TableHead>Drop-off</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAnalyticsData.funnel.map((stage, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{stage.etapa}</TableCell>
                      <TableCell className="font-medium">{stage.cantidad}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          {stage.tasa_conversion.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {stage.tiempo_promedio_dias ? stage.tiempo_promedio_dias.toFixed(1) : '-'}
                      </TableCell>
                      <TableCell>
                        {stage.drop_off > 0 && (
                          <Badge className={stage.drop_off > 50 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
                            -{stage.drop_off.toFixed(1)}%
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {analyticsTab === 'Cohortes' && (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Análisis de Cohortes</h2>
            <p className="text-sm text-gray-600 mt-1">Rendimiento por mes de alta, sector y país.</p>
          </div>

          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[18px] font-semibold">Retención por Cohorte (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cohorte</TableHead>
                    <TableHead>Mes 0</TableHead>
                    <TableHead>Mes 1</TableHead>
                    <TableHead>Mes 2</TableHead>
                    <TableHead>Mes 3</TableHead>
                    <TableHead>Mes 4</TableHead>
                    <TableHead>Mes 5</TableHead>
                    <TableHead>Mes 6</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAnalyticsData.cohorts.map((cohort, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{cohort.cohorte}</TableCell>
                      <TableCell><Badge className="bg-green-100 text-green-800">{cohort.mes_0}%</Badge></TableCell>
                      <TableCell><Badge className="bg-blue-100 text-blue-800">{cohort.mes_1}%</Badge></TableCell>
                      <TableCell><Badge className="bg-blue-100 text-blue-800">{cohort.mes_2}%</Badge></TableCell>
                      <TableCell>{cohort.mes_3 ? <Badge className="bg-blue-100 text-blue-800">{cohort.mes_3}%</Badge> : '-'}</TableCell>
                      <TableCell>{cohort.mes_4 ? <Badge className="bg-blue-100 text-blue-800">{cohort.mes_4}%</Badge> : '-'}</TableCell>
                      <TableCell>{cohort.mes_5 ? <Badge className="bg-blue-100 text-blue-800">{cohort.mes_5}%</Badge> : '-'}</TableCell>
                      <TableCell>{cohort.mes_6 ? <Badge className="bg-blue-100 text-blue-800">{cohort.mes_6}%</Badge> : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {analyticsTab === 'Ingresos' && (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Revenue y Atribución</h2>
            <p className="text-sm text-gray-600 mt-1">Ingresos por fuente/canal y atribución a IA.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
              <CardHeader>
                <CardTitle className="text-[18px] font-semibold">Ingresos por Fuente/Canal</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fuente</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Ingresos</TableHead>
                      <TableHead>Win Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAnalyticsData.revenueSources.map((source, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{source.fuente}</TableCell>
                        <TableCell>{source.canal}</TableCell>
                        <TableCell className="font-medium">€{source.ingresos.toLocaleString('es-ES')}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            {source.win_rate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
              <CardHeader>
                <CardTitle className="text-[18px] font-semibold">Atribución de IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Revenue Atribuido a IA</p>
                    <p className="text-2xl font-bold text-blue-900">€{mockAnalyticsData.aiAttribution.revenue_ai.toLocaleString('es-ES')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-700">{mockAnalyticsData.aiAttribution.pct_ai}% del total</p>
                    <p className="text-sm text-blue-700">+{mockAnalyticsData.aiAttribution.uplift}% uplift</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {analyticsTab === 'Cobranza' && (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">DSO y Cobranza</h2>
            <p className="text-sm text-gray-600 mt-1">Aging, promesas y evolución de cobranza.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* DSO Evolution */}
            <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
              <CardHeader>
                <CardTitle className="text-[18px] font-semibold">Evolución DSO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Gráfico de línea - DSO por mes</p>
                    <p className="text-xs mt-1">Jun: {mockAnalyticsData.dsoEvolution[0].dso} → Jul: {mockAnalyticsData.dsoEvolution[1].dso} → Ago: {mockAnalyticsData.dsoEvolution[2].dso}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aging Buckets */}
            <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
              <CardHeader>
                <CardTitle className="text-[18px] font-semibold">Aging Buckets</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bucket</TableHead>
                      <TableHead>Clientes</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Porcentaje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAnalyticsData.agingBuckets.map((bucket, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{bucket.bucket}</TableCell>
                        <TableCell>{bucket.clientes}</TableCell>
                        <TableCell className="font-medium">€{bucket.monto.toLocaleString('es-ES')}</TableCell>
                        <TableCell>
                          <Badge className={
                            bucket.bucket === '90+ días' ? 'bg-red-100 text-red-800' :
                            bucket.bucket === '61-90 días' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {bucket.pct.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {analyticsTab === 'Churn/Retención' && (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Churn y Retención</h2>
            <p className="text-sm text-gray-600 mt-1">Métricas de churn, net retention y tendencias.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <StatCard title="Churn Rate" value={`${mockAnalyticsData.churnData.churn_rate}%`} icon={TrendingDown} color="bg-red-500" trend="-0.8%" />
            <StatCard title="Net Retention" value={`${mockAnalyticsData.churnData.net_retention}%`} icon={TrendingUp} color="bg-green-500" trend="+0.8%" />
            <StatCard title="Tendencia" value="Mejorando" icon={CheckCircle} color="bg-blue-500" trend="3 meses" />
          </div>

          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[18px] font-semibold">Tendencia Churn y Retención</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mes</TableHead>
                    <TableHead>Churn Rate (%)</TableHead>
                    <TableHead>Retention (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAnalyticsData.churnData.trend.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.mes}</TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800">
                          {item.churn.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          {item.retention.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {analyticsTab === 'Insights de IA' && (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Insights de IA</h2>
            <p className="text-sm text-gray-600 mt-1">Anomalías, riesgos y recomendaciones accionables.</p>
          </div>

          <div className="grid gap-4">
            {mockAnalyticsData.insights.map((insight) => (
              <Card key={insight.id} className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-[16px] font-semibold">{insight.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">Agente: {insight.agent}</p>
                    </div>
                    <Badge className={
                      insight.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      insight.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {insight.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Detección</Label>
                      <p className="text-sm text-gray-700">{insight.message}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Recomendación</Label>
                      <p className="text-sm text-gray-700">{insight.recomendacion}</p>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Detectado: {new Date(insight.fecha).toLocaleDateString('es-ES')}</span>
                      <Button variant="outline" size="sm" style={{ color: '#4472C4', borderColor: '#4472C4' }}>
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Function to create a valid page URL
  const createPageUrl = (basePath) => {
    // In a real application, this would be handled by a router (e.g., Next.js, React Router).
    // For this standalone component, we simulate by appending to base URL.
    return `${window.location.origin}${window.location.pathname.replace(/\/+$/, '')}`;
  };

  // Función principal de renderizado según tab
  const renderContent = () => {
    switch (tab) {
      case 'dashboard':
        return renderDashboard();
      case 'clientes':
        return renderClientes();
      case 'leads':
        return renderLeads();
      case 'actividades':
        return renderActividades();
      case 'marketing':
        return renderMarketing();
      case 'postventa':
        return renderPostventa();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="p-6" style={{
      backgroundColor: '#F1F0EC',
      minHeight: '100vh',
      fontFamily: 'Montserrat, sans-serif'
    }}>
      {renderContent()}
    </div>
  );
}
