
import React, { useState, useEffect } from "react";
import {
  Warehouse, Package, TrendingUp, AlertTriangle, MapPin,
  CheckCircle, Clock, BarChart3, Plus, Filter, Search,
  Eye, MoreHorizontal, Package2, Truck, Users, FileText,
  Layers, ZoomIn, ZoomOut, RotateCcw, Edit, History,
  Scan, Archive, Calendar, CheckSquare, Download, Check, User, Bot, Move, ArrowUp,
  Target, Activity, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { toast } from "sonner";

// Importar componentes específicos de WMS actualizados
import DashboardWMS from "../components/wms/DashboardWMS";
import RecepcionesWizard from "../components/wms/RecepcionesWizard";
import UbicacionesEditor from "../components/wms/UbicacionesEditor";
import PickingMobile from "../components/wms/PickingMobile";
import PackingManager from "../components/wms/PackingManager";
import CrossDockManager from "../components/wms/CrossDockManager";

// NUEVOS IMPORTS para workbenches estandarizados
import ReceiptsWorkbench from "../components/wms/ReceiptsWorkbench";
import InventoryWorkbench from "../components/wms/InventoryWorkbench";

// DATOS MOCK - MOVER AL INICIO ANTES DE SU USO
const mockInventoryData = [
  {
    id: "inv_001",
    productId: "PROD-001",
    productName: "Monitor Samsung 24\"",
    barcode: "1234567890123",
    category: "Electronicos",
    image: "/api/placeholder/40/40",
    ownerId: "owner_abc",
    locationId: "LOC-A-01",
    zone: "Picking",
    uom: "Unidad",
    quantity: 120,
    minStock: 50,
    maxStock: 200,
    unitValue: 250.50,
    totalValue: 30060.00,
    lastMovement: "2025-08-26T10:30:00Z",
    status: "optimal",
    updatedAt: "2025-08-26T10:30:00Z"
  },
  {
    id: "inv_002",
    productId: "PROD-002",
    productName: "Teclado Logitech MX",
    barcode: "2345678901234",
    category: "Accesorios",
    image: "/api/placeholder/40/40",
    ownerId: "owner_def",
    locationId: "LOC-B-05",
    zone: "Storage",
    uom: "Caja",
    quantity: 25,
    minStock: 30,
    maxStock: 100,
    unitValue: 85.00,
    totalValue: 2125.00,
    lastMovement: "2025-08-26T09:15:00Z",
    status: "low",
    updatedAt: "2025-08-26T09:15:00Z"
  },
  {
    id: "inv_003",
    productId: "PROD-003",
    productName: "Mouse Inalambrico",
    barcode: "3456789012345",
    category: "Accesorios",
    image: "/api/placeholder/40/40",
    ownerId: "owner_abc",
    locationId: "LOC-C-12",
    zone: "Picking",
    uom: "Unidad",
    quantity: 8,
    minStock: 15,
    maxStock: 80,
    unitValue: 32.50,
    totalValue: 260.00,
    lastMovement: "2025-08-26T11:45:00Z",
    status: "critical",
    updatedAt: "2025-08-26T11:45:00Z"
  }
];

const mockDiscrepanciesData = [
  { type: "Faltante", count: 9 },
  { type: "Lote incorrecto", count: 3 },
  { type: "Ubicacion invalida", count: 2 },
  { type: "Peso fuera rango", count: 1 }
];

const mockDiscrepanciesTable = [
  {
    id: "disc_001",
    date: "26/08/2025",
    type: "Faltante",
    sku: "PROD-001",
    lot: "L-2412-A",
    location: "LOC-A-01",
    operator: "Maria Garcia",
    status: "Abierta"
  },
  {
    id: "disc_002",
    date: "25/08/2025",
    type: "Lote incorrecto",
    sku: "PROD-002",
    lot: "L-2411-B",
    location: "LOC-B-05",
    operator: "Luis Perez",
    status: "Resuelta"
  }
];


// WMS-TKN-004: Guardarrailes de tema - filtrar clases Tailwind
const TAILWIND_PATTERN = /^(text-|bg-|border-|shadow-|rounded-|p-|m-|w-|h-|flex|grid|justify-|items-|space-|gap-|opacity-|transform|transition|hover:|focus:|active:)/;

// Filtro para remover clases Tailwind de datos JSON
const stripTailwindClasses = (classString) => {
  if (!classString || typeof classString !== 'string') return '';

  return classString
    .split(' ')
    .filter(cls => !TAILWIND_PATTERN.test(cls))
    .join(' ');
};

// Sanitizar objeto recursivamente removiendo clases Tailwind
const sanitizeStyleData = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeStyleData);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.includes('class') || key.includes('className') || key.includes('style_class')) {
      sanitized[key] = stripTailwindClasses(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeStyleData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

// Tokens de Trustport - WMS-TKN-004
const TRUSTPORT_TOKENS = {
  fonts: {
    primary: 'Montserrat, sans-serif'
  },
  colors: {
    primary: '#4472C4',
    secondary: '#DB2142',
    background: '#F1F0EC',
    backgroundAlt: '#F5F6F7',
    surface: '#FFFFFF',
    border: '#D9D9D9',
    // Colores de acento mantenidos
    green: '#00A878',
    yellow: '#FFC857',
    red: '#DB2142',
    violet: '#6C7DF7'
  },
  spacing: {
    radius: '16px',
    shadow: '0 8px 24px rgba(0,0,0,.08)'
  }
};

// Helper para aplicar tokens consistentemente
const getTrustportCardStyle = () => ({
  backgroundColor: TRUSTPORT_TOKENS.colors.surface,
  borderRadius: TRUSTPORT_TOKENS.spacing.radius,
  boxShadow: TRUSTPORT_TOKENS.spacing.shadow,
  fontFamily: TRUSTPORT_TOKENS.fonts.primary
});

const getTrustportButtonStyle = (variant = 'primary') => {
  const base = {
    fontFamily: TRUSTPORT_TOKENS.fonts.primary,
    borderRadius: '8px'
  };

  if (variant === 'primary') {
    return {
      ...base,
      backgroundColor: TRUSTPORT_TOKENS.colors.primary,
      color: TRUSTPORT_TOKENS.colors.surface
    };
  }

  return base;
};

// WMS-RTR-001: Router hardening + normalizador ASCII
const WMS_CANONICAL_TABS = {
  dashboard: 'dashboard',
  recepciones: 'recepciones',
  inventario: 'inventario',
  ubicaciones: 'ubicaciones',
  picking: 'picking',
  packing: 'packing',
  'cross-dock': 'cross-dock',
  discrepancias: 'discrepancias',
};

// Normalizador ASCII - remueve tildes y caracteres especiales
const normalizeToASCII = (str) => {
  if (!str) return '';

  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos
    .replace(/ñ/g, 'n')
    .replace(/Ñ/g, 'N')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/[^a-z0-9-]/g, ''); // Solo ASCII lowercase, números y guiones
};

// Mapa de redirects para URLs antiguas - WMS-RTR-002
const WMS_REDIRECT_MAP = {
  'inventory': 'inventario',
  'recepcion': 'recepciones',
  'ubicacion': 'ubicaciones',
  'picking': 'picking',
  'packing': 'packing',
  'crossdock': 'cross-dock',
  'cross_dock': 'cross-dock',
  'warehouse': 'dashboard',
  // Variantes con tildes
  'recepción': 'recepciones',
  'ubicación': 'ubicaciones',
  // Variantes en inglés
  'receiving': 'recepciones',
  'locations': 'ubicaciones',
  'discrepancies': 'discrepancias'
};

// Logger para telemetría - WMS-LOG-007 (ajustado para QA)
const logRouteResolve = (incoming, normalized, resolved, reason) => {
  console.log('[WMS-RTR] Route resolution:', {
    incoming,
    normalized,
    resolved,
    reason,
    timestamp: new Date().toISOString()
  });
};

// Logger para eventos - WMS-EVT (nuevo para QA)
const logWMSEvent = (eventType, payload) => {
  console.log('[WMS-EVT] Event emitted:', {
    eventType,
    payload,
    timestamp: new Date().toISOString()
  });
};

// Logger para datos - WMS-DATA-005 (ajustado para QA)
const logDataStatus = (component, status, context) => {
  console.log('[WMS-DATA-005] Data status:', {
    component,
    status,
    context,
    timestamp: new Date().toISOString()
  });
};

// Resolver tab con lógica hardening
const resolveWMSTab = (rawTab) => {
  const incoming = rawTab || '';
  const normalized = normalizeToASCII(incoming);

  // Caso 1: Sin tab → dashboard
  if (!normalized) {
    logRouteResolve(incoming, normalized, 'dashboard', 'fallback_empty');
    return 'dashboard';
  }

  // Caso 2: Tab válido directo
  if (WMS_CANONICAL_TABS[normalized]) {
    logRouteResolve(incoming, normalized, normalized, 'direct_match');
    return normalized;
  }

  // Caso 3: Redirect disponible
  if (WMS_REDIRECT_MAP[normalized]) {
    const redirected = WMS_REDIRECT_MAP[normalized];
    logRouteResolve(incoming, normalized, redirected, 'redirect_applied');
    // En una implementación real, aquí haríamos el redirect 301
    return redirected;
  }

  // Caso 4: Tab inválido → STUB controlado (NO dashboard)
  logRouteResolve(incoming, normalized, 'invalid', 'invalid_tab');
  return 'invalid';
};

// WMS-REN-003: Registro de tipos soportados
const WMS_SUPPORTED_TYPES = {
  // Charts
  'line_chart': true,
  'bar_chart': true,
  'heatmap': true,
  'kpi_card': true,

  // Tables
  'data_table': true,
  'exceptions_table': true,
  'orders_table': true,

  // Layouts
  'dashboard_grid': true,
  'card_layout': true,
  'tabs_layout': true,

  // WMS específicos
  'occupancy_heatmap': true,
  'throughput_chart': true,
  'waves_capacity': true
};

// Adaptador de columnas: string → objeto
const adaptColumns = (columns) => {
  if (!columns) return [];

  return columns.map((col, index) => {
    if (typeof col === 'string') {
      return {
        key: slugifyColumn(col),
        title: col,
        index
      };
    }
    return col;
  });
};

// Helper para slugificar títulos de columnas
const slugifyColumn = (title) => {
  return normalizeToASCII(title.toLowerCase().replace(/\s+/g, '_'));
};

// Generador de IDs estables para widgets sin ID
const generateStableId = (namespace, path, index) => {
  const seed = `${namespace}:${path}:${index}`;
  // Simple hash para generar ID estable
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `widget_${Math.abs(hash)}`;
};

// STUB para tipos desconocidos - WMS-REN-003
const UnsupportedTypeStub = ({ type, context, data }) => (
  <Card className="bg-orange-50 border border-orange-200" style={getTrustportCardStyle()}>
    <CardContent className="p-6 text-center">
      <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
      <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
        Tipo No Soportado
      </h3>
      <p className="text-orange-700 mb-4">
        El tipo "<code className="bg-orange-100 px-2 py-1 rounded text-sm">{type}</code>" no está implementado aún.
      </p>
      <div className="text-sm text-orange-600 space-y-1">
        <p><strong>Contexto:</strong> {context}</p>
        {data && <p><strong>Datos disponibles:</strong> {Object.keys(data).length} propiedades</p>}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-4 border-orange-300 text-orange-700 hover:bg-orange-100"
        style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}
        onClick={() => toast.info(`Tipo ${type} reportado para implementación futura`)}
      >
        Reportar Tipo Faltante
      </Button>
    </CardContent>
  </Card>
);

// Adaptador de datos de tabla tolerante
const adaptTableData = (data, columns) => {
  const adaptedColumns = adaptColumns(columns);

  if (!data || !Array.isArray(data)) {
    return { data: [], columns: adaptedColumns };
  }

  return {
    data: data.map((row, index) => ({
      ...row,
      _stable_id: row.id || generateStableId('wms.table', 'data', index)
    })),
    columns: adaptedColumns
  };
};

// Wrapper para componentes con manejo de errores
const SafeComponent = ({ children, fallback, context }) => {
  try {
    return children;
  } catch (error) {
    console.error(`[WMS-REN-003] Error in ${context}:`, error);
    return fallback || <UnsupportedTypeStub type="error" context={context} data={{ error: error.message }} />;
  }
};

// STUB para tipos de vista desconocidos - WMS-REN-003
const UnknownTabView = ({ tab }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
    <div className="max-w-4xl mx-auto">
      <Card style={getTrustportCardStyle()}>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
          <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
            Tab Desconocido
          </h2>
          <p className="text-gray-600 mb-6">
            El tab "<code className="bg-gray-100 px-2 py-1 rounded">{tab}</code>" no existe o no está disponible.
          </p>
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              <p>Tabs válidos disponibles:</p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {Object.keys(WMS_CANONICAL_TABS).map(validTab => (
                  <Badge key={validTab} variant="outline">
                    {validTab}
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              onClick={() => window.location.href = window.location.pathname + '?tab=dashboard'}
              className="hover:bg-blue-700"
              style={getTrustportButtonStyle('primary')}
            >
              Ir al Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Persona overlays según especificación (ASCII-only keys)
const personaConfig = {
  comerciante: {
    default_filters: { owner_id: null, time_window: "7d" },
    kpi_priority: ["kpi_accuracy", "kpi_occupancy", "kpi_dwell", "kpi_issues", "kpi_productivity", "kpi_otd"],
    default_tab: "excepciones",
    primary_actions: ["reponer_sugerido"], // Acción específica para QA
    alerts: [
      { rule: "accuracy<0.99", level: "warning", message: "Exactitud < 99% en ultimas 24h. Ejecuta conteo ciego en top SKUs." }
    ]
  },
  operador: {
    default_filters: { owner_id: "ACME", time_window: "Hoy" },
    kpi_priority: ["kpi_otd", "kpi_productivity", "kpi_occupancy", "kpi_issues", "kpi_dwell", "kpi_accuracy"],
    default_tab: "ordenes_hoy",
    primary_actions: ["crear_oleada"], // Acción específica para QA
    alerts: [
      { rule: "otd<0.95", level: "warning", message: "OTD por debajo del objetivo. Crea oleadas por ventana OTD." }
    ]
  }
};

// WMS-OVL-006: Verificador de overlays por submódulo
const hasPersonaOverlay = (persona, submodule) => {
  const overlayMap = {
    dashboard: ['comerciante', 'operador'], // Solo dashboard tiene overlays
    recepciones: [], // Sin overlays definidos
    inventario: [], // Sin overlays definidos
    ubicaciones: [], // Sin overlays definidos
    picking: [],
    packing: [],
    'cross-dock': [],
    discrepancias: [], // Sin overlays definidos
  };

  return overlayMap[submodule]?.includes(persona) || false;
};

// Logger para overlays - WMS-LOG-007 (ajustado para QA)
const logOverlayChange = (persona, submodule, hasOverlay, action) => {
  console.log('[WMS-OVL-006] Overlay change:', {
    persona,
    submodule,
    hasOverlay,
    action,
    timestamp: new Date().toISOString()
  });
};

export default function WMS() {
  const urlParams = new URLSearchParams(window.location.search);
  const rawTab = urlParams.get('tab');

  // WMS-RTR-001: Aplicar router hardening
  const resolvedTab = resolveWMSTab(rawTab);

  // TODOS los hooks aquí, antes de cualquier return
  const [selectedPersona] = useState(() => {
    return localStorage.getItem('selectedPersona') || 'comerciante';
  });

  const [dashboardFilters, setDashboardFilters] = useState({
    warehouse_id: 'MAD-01',
    owner_id: null,
    time_window: 'Hoy',
  });
  const [activeTab, setActiveTab] = useState('excepciones');
  const [realtimeData, setRealtimeData] = useState({}); // Keep for potential future use or other non-dashboard parts
  const [aiSuggestions, setAiSuggestions] = useState([]); // Keep for potential future use or other non-dashboard parts

  // These inventory specific states are now part of InventoryWorkbench.
  // They are commented out here but would be moved into InventoryWorkbench.
  // const [inventoryFilters, setInventoryFilters] = useState({
  //   search: '',
  //   status: 'all',
  //   zone: 'all',
  //   category: 'all',
  //   uom: 'all'
  // });
  // const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  // const [showEditModal, setShowEditModal] = useState(false);
  // const [showHistoryModal, setShowHistoryModal] = useState(false);
  // const [mapLayers, setMapLayers] = useState({
  //   optimal: true,
  //   low: true,
  //   critical: true
  // });

  // WMS-DATA-005: Estado de datos para render no-bloqueante
  const [dataStatus, setDataStatus] = useState({
    kpis: 'loading',
    charts: 'loading',
    tables: 'loading'
  });

  // WMS-OVL-006: Aplicar configuración por persona SOLO si tiene overlays
  useEffect(() => {
    const hasOverlay = hasPersonaOverlay(selectedPersona, resolvedTab);

    if (!hasOverlay) {
      logOverlayChange(selectedPersona, resolvedTab, false, 'skip_no_overlay');
      return; // NO aplicar cambios si no hay overlay definido
    }

    // Solo aplicar overlays en submódulos que los soportan
    if (resolvedTab === 'dashboard') {
      const config = personaConfig[selectedPersona];
      logOverlayChange(selectedPersona, resolvedTab, true, 'apply_overlay');

      setDashboardFilters(prev => ({ ...prev, ...config.default_filters }));
      setActiveTab(config.default_tab);
    }

  }, [selectedPersona, resolvedTab]);

  // WMS-VIEW log según criterios QA
  useEffect(() => {
    const startTime = performance.now();

    console.log('[WMS-VIEW] View mounting:', {
      resolvedTab,
      rawTab,
      selectedPersona,
      hasOverlay: hasPersonaOverlay(selectedPersona, resolvedTab),
      timestamp: new Date().toISOString()
    });

    // WMS-DATA-005: Simular carga de datos async
    logDataStatus('WMS-Dashboard', 'loading', resolvedTab);
    setTimeout(() => {
      setDataStatus({
        kpis: 'ready',
        charts: 'ready',
        tables: 'ready'
      });
      logDataStatus('WMS-Dashboard', 'ready', resolvedTab);

      // Performance tracking para SLOs
      const paintTime = performance.now() - startTime;
      if (paintTime > 300) {
        console.warn('[WMS-PERF] First paint exceeded 300ms:', paintTime);
      }
    }, 100); // Reducido para SLO <300ms

  }, [resolvedTab, rawTab, selectedPersona]);

  // Si tab inválido, mostrar vista de error controlada
  if (resolvedTab === 'invalid') {
    return <UnknownTabView tab={rawTab} />;
  }

  // Seed data - WMS-TKN-004: sanitizado
  const seedData = sanitizeStyleData({
    warehouses: [{ id: "MAD-01", name: "Madrid 01" }],
    owners: [{ id: "ACME", name: "ACME 3PL" }],
    kpis: {
      kpi_accuracy: { title: "Exactitud Inventario", value: 0.987, target: 0.99, trend: "+0.3%", status: "warning" },
      kpi_occupancy: { title: "Ocupacion Almacen", value: 0.762, trend: "+2.1%", status: "success" },
      kpi_productivity: { title: "Productividad Picking (und/h)", value: 24.8, trend: "+1.2", status: "success" },
      kpi_dwell: { title: "Tiempo Dwell Promedio", value: 142, trend: "-18 min", status: "success" },
      kpi_otd: { title: "On-Time Delivery Rate", value: 0.942, target: 0.95, trend: "+2.1%", status: "success" },
      kpi_issues: { title: "Incidencias Abiertas", value: 15, trend: "-8", status: "warning" }
    },
    charts: {
      occupancy_heatmap: [
        { zone: "A", level: 0.85, color: "#FFC857" },
        { zone: "B", level: 0.92, color: "#DB2142" },
        { zone: "C", level: 0.67, color: "#00A878" },
        { zone: "D", level: 0.78, color: "#4472C4" }
      ],
      throughput: [
        { hour: "08:00", receiving: 45, picking: 32, packing: 28, shipping: 15 },
        { hour: "09:00", receiving: 38, picking: 42, packing: 35, shipping: 22 },
        { hour: "10:00", receiving: 52, picking: 48, packing: 41, shipping: 28 },
        { hour: "11:00", receiving: 41, picking: 55, packing: 48, shipping: 32 },
        { hour: "12:00", receiving: 35, picking: 38, packing: 42, shipping: 38 }
      ],
      waves_capacity: [
        { wave: "WAVE-001", capacity: 500, assigned: 420, status: "active" },
        { wave: "WAVE-002", capacity: 500, assigned: 380, status: "active" },
        { wave: "WAVE-003", capacity: 500, assigned: 150, status: "planned" }
      ]
    },
    exceptions: [
      { id: "EXC-001", type: "faltante", detail: "SKU-12345 - Falta 1 unidad", severity: "high", owner_id: "ACME", location_id: "LOC-A-01", created_at: "2025-08-26T10:30:00Z", sla_due: "2h" },
      { id: "EXC-002", type: "dano", detail: "Monitor Samsung - Pantalla rota", severity: "medium", owner_id: "ACME", location_id: "LOC-B-05", created_at: "2025-08-26T09:15:00Z", sla_due: "4h" },
      { id: "EXC-003", type: "temp", detail: "Zona fria fuera de rango", severity: "low", owner_id: null, location_id: "ZONA-FRIO", created_at: "2025-08-26T11:45:00Z", sla_due: "1h" }
    ],
    orders_today: [
      { order_id: "ORD-001", owner_id: "ACME", lines: 5, status: "en_picking", priority: "alta", eta: "14:30", zone: "A" },
      { order_id: "ORD-002", owner_id: "ACME", lines: 12, status: "empaque", priority: "media", eta: "15:00", zone: "B" },
      { order_id: "ORD-003", owner_id: "ACME", lines: 3, status: "despachado", priority: "baja", eta: "13:45", zone: "C" }
    ]
  });

  // Removed getStatusConfig, filteredInventory, handleInventoryAction, handleStockEdit, toggleMapLayer
  // as they are assumed to be moved into InventoryWorkbench.

  const renderUbicaciones = () => <UbicacionesEditor />;

  const renderPicking = () => <PickingMobile />;

  const renderDiscrepancias = () => (
    <div className="space-y-6">
      {/* KPIs de Discrepancias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Discrepancias" value="15" icon={AlertTriangle} color="bg-red-500" trend="-8 vs anterior" />
        <StatCard title="Casos Abiertos" value="9" icon={Clock} color="bg-orange-500" trend="+2 este mes" />
        <StatCard title="Casos Resueltos" value="6" icon={CheckCircle} color="bg-green-500" trend="+14 este mes" />
        <StatCard title="Tiempo Resolucion" value="4.2h" icon={BarChart3} color="bg-blue-500" trend="-1.8h vs anterior" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras por tipo */}
        <Card style={getTrustportCardStyle()}>
          <CardHeader>
            <CardTitle className="text-[18px] font-semibold" style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
              Discrepancias por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockDiscrepanciesData}>
                  <CartesianGrid strokeDashArray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill={TRUSTPORT_TOKENS.colors.primary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de casos */}
        <Card style={getTrustportCardStyle()}>
          <CardHeader>
            <CardTitle className="text-[18px] font-semibold" style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
              Casos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDiscrepanciesTable.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>
                      <Badge className={item.status === 'Abierta' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}>
                        {item.status}
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
                          <DropdownMenuItem>Abrir incidencia</DropdownMenuItem>
                          <DropdownMenuItem>Asignar a calidad</DropdownMenuItem>
                          <DropdownMenuItem>Marcar resuelto</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Small helper component for StatCard that was previously defined globally or within renderDashboard
  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card style={getTrustportCardStyle()}>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[12px] font-medium text-gray-600">{title}</p>
            <p className="text-[22px] font-semibold mt-1" style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
              {value}
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

  // Performance tracking para cambios de tab según SLO <100ms
  const handleTabChange = (newTab) => {
    const startTime = performance.now();

    // Log transition para QA
    console.log('[WMS-RTR] Tab transition:', { from: activeTab, to: newTab });

    setActiveTab(newTab); // Update the active tab

    // Use a setTimeout with 0 to allow the DOM to update before measuring
    // This is a common pattern for measuring post-render performance
    setTimeout(() => {
      const transitionTime = performance.now() - startTime;
      if (transitionTime > 100) {
        console.warn('[WMS-PERF] Tab change exceeded 100ms:', transitionTime);
      }
    }, 0);
  };

  // WMS-DATA-005: Render no-bloqueante con skeleton/polling
  const renderContent = () => {
    switch (resolvedTab) {
      case 'recepciones':
        return <ReceiptsWorkbench />;
      case 'inventario':
        return <InventoryWorkbench
          getTrustportCardStyle={getTrustportCardStyle}
          getTrustportButtonStyle={getTrustportButtonStyle}
          TRUSTPORT_TOKENS={TRUSTPORT_TOKENS}
          mockInventoryData={mockInventoryData} // Pass mock data
          logWMSEvent={logWMSEvent}
          toast={toast}
        />;
      case 'ubicaciones':
        return renderUbicaciones();
      case 'picking':
        return renderPicking();
      case 'packing':
        return <PackingManager />;
      case 'cross-dock':
        return <CrossDockManager />;
      case 'discrepancias':
        return renderDiscrepancias();
      case 'dashboard':
      default:
        // CAMBIO: Usar el nuevo DashboardWMS estandarizado
        return (
          <DashboardWMS
            selectedPersona={selectedPersona}
            personaConfig={personaConfig}
            dashboardFilters={dashboardFilters}
            setDashboardFilters={setDashboardFilters}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            dataStatus={dataStatus}
            seedData={seedData}
            handleTabChange={handleTabChange}
            getTrustportCardStyle={getTrustportCardStyle}
            getTrustportButtonStyle={getTrustportButtonStyle}
            TRUSTPORT_TOKENS={TRUSTPORT_TOKENS}
            logWMSEvent={logWMSEvent}
            toast={toast}
          />
        );
    }
  };

  return (
    <div>
      {/* HEADER DINÁMICO POR SUBMÓDULO - Ya no necesita headers individuales para workbenches */}
      {resolvedTab === 'dashboard' && (
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900" style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
              WMS — Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-[14px] font-medium">
              Vista ejecutiva en tiempo real: exactitud, ocupación, throughput, excepciones
            </p>
          </div>
          <div className="flex gap-3">
            {personaConfig[selectedPersona].primary_actions.includes('crear_oleada') && (
              <Button className="" style={getTrustportButtonStyle('primary')}>
                <Layers className="w-4 h-4 mr-2" />
                Crear oleada
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Solo mostrar headers para submódulos que aún no son workbenches */}
      {resolvedTab === 'ubicaciones' && (
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900" style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
              Ubicaciones
            </h1>
            <p className="text-gray-500 mt-1 text-[14px] font-medium">Gestión de ubicaciones y zonas</p>
          </div>
        </div>
      )}

      {resolvedTab === 'picking' && (
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900" style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
              Picking
            </h1>
            <p className="text-gray-500 mt-1 text-[14px] font-medium">
              Planificación y ejecución de picking (wave/waveless)
            </p>
          </div>
        </div>
      )}

      {resolvedTab === 'packing' && (
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900" style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
              Packing
            </h1>
            <p className="text-gray-500 mt-1 text-[14px] font-medium">
              Empaque, generación SSCC, cierre y handoff TMS
            </p>
          </div>
        </div>
      )}

      {resolvedTab === 'cross-dock' && (
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900" style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
              Cross-dock
            </h1>
            <p className="text-gray-500 mt-1 text-[14px] font-medium">
              Detectar candidatos y ejecutar cross-dock de inbound a outbound sin putaway
            </p>
          </div>
        </div>
      )}

      {resolvedTab === 'discrepancias' && (
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900" style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
              Discrepancias
            </h1>
            <p className="text-gray-500 mt-1 text-[14px] font-medium">Gestión de incidencias y discrepancias</p>
          </div>
        </div>
      )}

      {/* CONTENIDO CON FALLBACK NO-BLOQUEANTE */}
      <div style={{ backgroundColor: TRUSTPORT_TOKENS.colors.background, minHeight: '400px' }}>
        {/* Solo agregar padding para submódulos que no son workbenches */}
        <div className={resolvedTab === 'recepciones' || resolvedTab === 'inventario' ? '' : 'p-6'}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
