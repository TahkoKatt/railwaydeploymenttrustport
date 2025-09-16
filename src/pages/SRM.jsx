
import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import {
  Building2, CheckCircle2, CalendarX2, AlertTriangle, Star, PiggyBank,
  TrendingUp, TrendingDown, Filter, Download, Eye, MoreHorizontal,
  Users, FileText, Shield, Calendar, BarChart3, Activity, Zap,
  MapPin, Phone, Mail, Globe, Award, Clock, DollarSign, Package,
  Truck, Target, Percent, LineChart, Plus, Edit, Trash2, Search,
  Upload, UserPlus, Settings, Archive, Bell, RefreshCw, Send,
  CheckCircle, XCircle, AlertCircle, Info, ExternalLink, Copy,
  ShieldCheck, UserCheck, Construction, Loader2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ControlledError from "@/components/ui/ControlledError";

import SrmRoot from '@/components/srm/SrmRoot';
import { OverlayProvider, useOverlay } from '@/components/srm/OverlayProvider';
import AiLogPanel from '@/components/srm/telemetry/AiLogPanel';
import Measure from '@/components/srm/perf/Measure';
import PerfPanel from '@/components/srm/perf/PerfPanel';

// LAZY IMPORTS
const Lazy = {
  dashboard:    lazy(() => import('@/components/srm/dashboard/DashboardComponent')),
  proveedores:  lazy(() => import('@/components/srm/proveedores/ProveedoresWorkbench')),
  documentos:   lazy(() => import('@/components/srm/documentos/DocumentosWorkbench')),
  contratos:    lazy(() => import('@/components/srm/contratos/ContratosWorkbench')),
  rfq:          lazy(() => import('@/components/srm/rfq/RFQWorkbench')),
  evaluacion:   lazy(() => import('@/components/srm/evaluacion/EvaluacionWorkbench')),
  riesgo:       lazy(() => import('@/components/srm/riesgo/RiesgoWorkbench')),
  tarifario:   lazy(() => import('@/components/srm/tarifario/TarifarioManager')),
};

const prefetchers = {
  proveedores: () => import('@/components/srm/proveedores/ProveedoresWorkbench'),
  documentos:  () => import('@/components/srm/documentos/DocumentosWorkbench'),
  contratos:   () => import('@/components/srm/contratos/ContratosWorkbench'),
  rfq:         () => import('@/components/srm/rfq/RFQWorkbench'),
  evaluacion:  () => import('@/components/srm/evaluacion/EvaluacionWorkbench'),
  riesgo:      () => import('@/components/srm/riesgo/RiesgoWorkbench'),
  tarifario:   () => import('@/components/srm/tarifario/TarifarioManager'),
};

// --- MOCKED DEPENDENCIES for a runnable file ---
const useCurrentUser = () => ({ id: 'mockUser', persona: 'comerciante' });
const useFeatureFlag = (flagName) => {
  switch (flagName) {
    case 'po_services.read_from_v2': return false;
    case 'po_goods.ui_preview_v2': return false;
    case 'ac.v2.ui': return false;
    default: return false;
  }
};

const TabMovedCard = ({ newDestination }) => (
  <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
    <CardHeader>
      <CardTitle className="text-xl font-semibold text-gray-800">Página Movida</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600">Esta funcionalidad se ha movido o ya no está disponible aquí.</p>
      {newDestination && (
        <Button className="mt-4" onClick={() => window.location.search = `?tab=${newDestination}`}>
          Ir a {newDestination.charAt(0).toUpperCase() + newDestination.slice(1)}
        </Button>
      )}
    </CardContent>
  </Card>
);

const aliases_v1_to_v2 = {};
const LEGACY_TABS_WITH_STUBS = [];

const personaConfig = {
  comerciante: {
    default_filters: { date_range: "last_90d", category: "direct", compliance: "apt_only" },
    kpis_order: ["savings_ytd_pct", "suppliers_active", "contracts_due_30", "otif_90d_pct", "rfqs_open", "blocked_suppliers"],
    widgets_order: ["kraljic_matrix", "contracts_expiring", "savings_by_category", "rfqs_sla", "alerts_list"],
    chips_ia_enabled: ["quick_savings", "suggest_supplier", "normalize_rates"]
  },
  operador_logistico: {
    default_filters: { date_range: "last_90d", category: "services", compliance: "all" },
    kpis_extra: [
      { label: "Win-rate cotizaciones", key: "quote_win_rate_pct", value: "24.5%" },
      { label: "TAT RFQ (P50)", key: "rfq_tat_p50_min", value: "142 min" }
    ],
    kpis_order: ["quote_win_rate_pct", "rfq_tat_p50_min", "rfqs_open", "contracts_due_30", "blocked_suppliers", "savings_ytd_pct"],
    widgets_extra: [
      {
        type: "table",
        title: "Ranking carriers (reliability)",
        key: "carriers_reliability",
        columns: ["Carrier/Agente", "Reliability", "Transit time", "Incidencias 90d"]
      }
    ],
    widgets_order: ["carriers_reliability", "rfqs_sla", "contracts_expiring", "alerts_list", "savings_by_category"],
    chips_ia_enabled: ["normalize_rates", "bulk_rfq_lane", "recommend_carrier"],
    chips_ia_extra: [
      { id: "bulk_rfq_lane", label: "RFQ masiva por lane", intent: "ai.bulk_rfq_by_lane" },
      { id: "recommend_carrier", label: "Recomendar carrier", intent: "ai.recommend_carrier" }
    ]
  }
};

const seedData = {
  comerciante: {
    kpis: {
      suppliers_active: { value: 87, trend: "+5 este mes", status: "success" },
      savings_ytd_pct: { value: "12.8%", trend: "+€47k vs target", status: "success" },
      otif_90d_pct: { value: "94.2%", trend: "+1.8pp", status: "success" },
      contracts_due_30: { value: 14, trend: "-3 vs anterior", status: "warning" },
      rfqs_open: { value: 8, trend: "+2 esta semana", status: "info" },
      blocked_suppliers: { value: 3, trend: "-1 este mes", status: "danger" }
    },
    widgets: {
      kraljic_matrix: [
        { name: "Transportes SA", impact_supply: 82, risk: 25, spend: 280000, category: "leverage" },
        { name: "Materiales ABC", impact_supply: 74, risk: 68, spend: 180000, category: "strategic" },
        { name: "Tech Solutions", impact_supply: 45, risk: 38, spend: 95000, category: "routine" },
        { name: "Critical Parts Co", impact_supply: 91, risk: 85, spend: 320000, category: "bottleneck" }
      ],
      contracts_expiring: [
        { supplier: "Transportes SA", contract: "CNT-2024-001", ends: "2025-01-15", days: 19, status: "Renovación en curso" },
        { supplier: "Materiales ABC", contract: "CNT-2024-007", ends: "2025-01-28", days: 32, status: "Por renovar" },
        { supplier: "Tech Solutions", contract: "CNT-2024-012", ends: "2025-02-10", days: 45, status: "Negociación abierta" }
      ],
      savings_by_category: [
        { category: "Transporte", saving_pct: 15.2, amount: 45600 },
        { category: "Materiales", saving_pct: 8.9, amount: 23400 },
        { category: "Servicios IT", saving_pct: 12.1, amount: 18200 },
        { category: "Packaging", saving_pct: 6.8, amount: 12800 }
      ],
      rfqs_sla: [
        { rfq: "RFQ-2024-045", requester: "Ana García", lane: "EU-US Air Express", age: "3 días", sla: "OK", status: "En evaluación" },
        { rfq: "RFQ-2024-048", requester: "Luis Pérez", lane: "Transporte Road ES-FR", age: "7 días", sla: "Warning", status: "Esperando ofertas" }
      ],
      alerts_list: [
        { type: "warning", message: "Proveedor Materiales ABC: Score evaluación bajo (< 80)", priority: "media" },
        { type: "info", message: "Nueva versión tarifario Transportes SA disponible", priority: "baja" },
        { type: "error", message: "Bloqueo compliance: Critical Parts Co", priority: "alta" }
      ]
    }
  },
  operador_logistico: {
    kpis: {
      quote_win_rate_pct: { value: "24.5%", trend: "+3.2pp vs mes anterior", status: "success" },
      rfq_tat_p50_min: { value: "142 min", trend: "-28 min vs target", status: "success" },
      rfqs_open: { value: 12, trend: "+4 esta semana", status: "info" },
      contracts_due_30: { value: 18, trend: "+2 vs anterior", status: "warning" },
      blocked_suppliers: { value: 2, trend: "Sin cambios", status: "info" },
      savings_ytd_pct: { value: "18.3%", trend: "+€67k vs target", status: "success" }
    },
    widgets: {
      carriers_reliability: [
        { carrier: "Maersk Line", reliability: "96.8%", transit_time: "18.2 días", incidents: 2 },
        { carrier: "CMA CGM", reliability: "94.1%", transit_time: "19.5 días", incidents: 5 },
        { carrier: "MSC", reliability: "92.3%", transit_time: "17.8 días", incidents: 8 },
        { carrier: "Hapag Lloyd", reliability: "95.2%", transit_time: "18.9 días", incidents: 3 }
      ],
      rfqs_sla: [
        { rfq: "RFQ-2024-051", requester: "María López", lane: "FCL Asia-Europe", age: "2 días", sla: "OK", status: "Evaluando ofertas" },
        { rfq: "RFQ-2024-052", requester: "Carlos Ruiz", lane: "LCL US-Spain", age: "5 días", sla: "OK", status: "Esperando documentación" },
        { rfq: "RFQ-2024-049", requester: "Ana García", lane: "Air Latam-EU", age: "9 días", sla: "Overdue", status: "Escalado" }
      ]
    }
  }
};

const StatCard = ({ title, value, icon: Icon, color, trend, prefix = '', suffix = '' }) => (
  <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
    <CardHeader className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[12px] font-medium text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {title}
          </p>
          <p className="text-[22px] font-semibold mt-1" style={{ fontFamily: 'Montserrat, sans-serif', color: '#000000' }}>
            {prefix}{typeof value === 'number' ? value.toLocaleString('es-ES') : value}{suffix}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-2 text-[12px] font-medium text-green-600">
          <TrendingUp className="w-3 h-3 mr-1" />
          {trend}
        </div>
      )}
    </CardHeader>
  </Card>
);

const SRM_ROOT_STYLE = { background:'#F1F0EC', fontFamily: 'Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' };

export default function SRM() {
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [error, setError] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState('comerciante');
  const [dashboardFilters, setDashboardFilters] = useState({
    date_range: 'last_90d',
    category: 'all',
    compliance: 'all'
  });
  const [suppliers, setSuppliers] = useState([]);
  
  useEffect(() => {
    const config = personaConfig[selectedPersona];
    setDashboardFilters(prev => ({ ...prev, ...config.default_filters }));
  }, [selectedPersona]);
  
  const validTabs = ['dashboard','proveedores','documentos','contratos','rfq','evaluacion','riesgo','tarifario'];
  let tab = searchParams.get("tab") || "dashboard";
  const safeTab = validTabs.includes(tab) ? tab : 'dashboard';

  useEffect(() => {
    window.__srmNavT0 = performance.now();
  }, [safeTab]);

  useEffect(() => {
    try {
      const asciiOnlyRegex = /^[a-zA-Z0-9_-]+$/;
      if (!tab || !asciiOnlyRegex.test(tab)) {
         throw new Error(`El tab "${tab}" contiene caracteres invalidos.`);
      }
      setError(null);
    } catch (e) {
      setError({
        title: "Error de Ruta Invalida",
        message: e.message,
        code: 'ASCII_VALIDATION_FAILED',
        fallbackLabel: 'Ir al Dashboard de SRM'
      });
    }
  }, [tab]); 

  if (error) {
    return (
      <SrmRoot>
        <ControlledError
          error={error}
          onGoHome={() => window.location.search = '?tab=dashboard'}
          onGoBack={() => window.history.back()}
        />
      </SrmRoot>
    );
  }

  const Comp = Lazy[safeTab];

  return (
    <SrmRoot>
      <OverlayProvider>
        <div style={SRM_ROOT_STYLE} className="p-4 md:p-6">
          <Suspense fallback={
            <Card className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Cargando...</h3>
                    <p className="mt-1 text-sm text-gray-500">Preparando el workbench, por favor espera.</p>
                </div>
            </Card>
          }>
            <Measure tab={safeTab}>
              <Comp 
                dashboardFilters={dashboardFilters}
                setDashboardFilters={setDashboardFilters}
                suppliers={suppliers}
                personaConfig={personaConfig}
                seedData={seedData}
                selectedPersona={selectedPersona}
                setSelectedPersona={setSelectedPersona}
                searchParams={searchParams}
              />
            </Measure>
          </Suspense>
          
          {searchParams.get('perf') === '1' && <PerfPanel />}
          {searchParams.get('ai_logs') === '1' && <AiLogPanel />}
        </div>
      </OverlayProvider>
    </SrmRoot>
  );
}
