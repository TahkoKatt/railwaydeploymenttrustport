
import React, { useState, useEffect } from "react";
import {
  FileText, CalendarCheck2, FileSignature, FolderUp, ShieldCheck, MapPin,
  Gavel, Receipt, Archive, TrendingUp, AlertTriangle, CheckCircle, Clock,
  Plus, Search, Filter, Eye, Edit, MoreHorizontal, Download, Upload,
  Plane, Ship, Truck, Globe2, Package, Users, DollarSign, BarChart3,
  Calendar, Settings, Bell, Send, Phone, Mail, MessageSquare, Zap,
  AlertCircle, Bot, Info, RefreshCw, Percent, FileCheck2, GitMerge, Tag, Layers,
  TrendingDown // Added TrendingDown for KPI trends
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import QuotationDetail from "@/components/comex/QuotationDetail";
import RoutingOrder from "@/components/comex/RoutingOrder";
import BookingManagement from "@/components/comex/BookingManagement";
import BlAwbManagement from "@/components/comex/BlAwbManagement";
import DocsManagement from "@/components/comex/DocsManagement";
import ComplianceManagement from "@/components/comex/ComplianceManagement";
import TrackingManagement from "@/components/comex/TrackingManagement";
import AduanasManagement from "@/components/comex/AduanasManagement";
import LiquidacionManagement from "@/components/comex/LiquidacionManagement";
import ArchivoManagement from "@/components/comex/ArchivoManagement";

// Add new imports for charts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast is used for notifications. If not, replace toast.success with alert() or console.log()

// Placeholder components for Cotizaciones module
const QuotationsList = ({ onNewQuote, onViewQuote }) => {
  const mockQuotes = [
    { id: 'Q001', code: 'QUO-ES-2025-001', customer: 'Textiles Barcelona SA', status: 'pending', value: 15250, currency: 'EUR', date: '2025-08-20' },
    { id: 'Q002', code: 'QUO-PE-2025-002', customer: 'Cafe Peruano Export SAC', status: 'sent', value: 18750, currency: 'EUR', date: '2025-08-22' },
    { id: 'Q003', code: 'QUO-MX-2025-003', customer: 'Artesanias Mexicanas SA', status: 'accepted', value: 8500, currency: 'EUR', date: '2025-08-26' },
  ];
  return (
    <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-[18px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Cotizaciones ({mockQuotes.length})
        </CardTitle>
        <Button onClick={onNewQuote} style={{ backgroundColor: '#4472C4', color: 'white' }}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cotizacion
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Codigo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockQuotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell className="font-medium">{quote.code}</TableCell>
                <TableCell>{quote.customer}</TableCell>
                <TableCell>{quote.currency} {quote.value.toLocaleString()}</TableCell>
                <TableCell><Badge variant="outline">{quote.status}</Badge></TableCell>
                <TableCell>{quote.date}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => onViewQuote(quote)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const QuotationForm = ({ open, onClose, onSubmit }) => {
  const [customer, setCustomer] = useState('');
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (!customer || !value) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    const newQuoteData = {
      id: `Q${Math.floor(Math.random() * 1000)}`,
      code: `QUO-NEW-${Math.floor(Math.random() * 1000)}`,
      customer,
      status: 'draft',
      value: parseFloat(value),
      currency: 'EUR',
      date: new Date().toISOString().split('T')[0],
    };
    onSubmit(newQuoteData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva Cotizacion</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="customerName">Cliente</Label>
            <Input id="customerName" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Nombre del cliente" />
          </div>
          <div>
            <Label htmlFor="quoteValue">Valor Estimado</Label>
            <Input id="quoteValue" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0.00" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button style={{ backgroundColor: '#4472C4', color: 'white' }} onClick={handleSubmit}>Guardar Cotizacion</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function COMEX() {
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get('tab') || 'dashboard';

  // Estados principales - todos juntos al inicio
  const [selectedShipmentType, setSelectedShipmentType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para Cotizaciones
  const [showNewQuoteForm, setShowNewQuoteForm] = useState(false);
  const [showQuoteDetail, setShowQuoteDetail] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [quotes, setQuotes] = useState([]);

  // Estados funcionales existentes
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showCreateBookingModal, setShowCreateBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetailModal, setShowBookingDetailModal] = useState(false);

  // Estados para Routing Order
  const [showCreateRoutingOrder, setShowCreateRoutingOrder] = useState(false);

  // Estados especificos por submodulo
  const [bookingFilters, setBookingFilters] = useState({ search: '', carrier: 'all', status: 'all' });
  const [docsFilters, setDocsFilters] = useState({ search: '', type: 'all', validation: 'all' });
  const [complianceFilters, setComplianceFilters] = useState({ search: '', result: 'all', risk: 'all' });

  // Estados para DOCS
  const [docsTab, setDocsTab] = useState('uploaded');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Estados para COMPLIANCE
  const [complianceTab, setComplianceTab] = useState('screening');
  const [selectedCompliance, setSelectedCompliance] = useState(null);
  const [showComplianceModal, setShowComplianceModal] = useState(false);

  // Estados para TRACKING
  const [trackingTab, setTrackingTab] = useState('active');
  const [selectedTracking, setSelectedTracking] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  // Estados para ADUANAS
  const [aduanasTab, setAduanasTab] = useState('declaraciones');
  const [selectedDeclaration, setSelectedDeclaration] = useState(null);
  const [showDeclarationModal, setShowDeclarationModal] = useState(false);
  const [showHSClassifierModal, setShowHSClassifierModal] = useState(false);
  const [aduanasFilters, setAduanasFilters] = useState({
    search: '',
    status: 'all',
    channel: 'all',
    regime: 'all'
  });

  // Estados para LIQUIDACION
  const [liquidacionTab, setLiquidacionTab] = useState('pendientes');
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showCreateSettlementModal, setShowCreateSettlementModal] = useState(false);
  const [liquidacionFilters, setLiquidacionFilters] = useState({
    search: '',
    status: 'all',
    currency: 'all',
    period: 'all'
  });

  // Estados para ARCHIVO
  const [archivoTab, setArchivoTab] = useState('expedientes');
  const [selectedArchiveItem, setSelectedArchiveItem] = useState(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showBulkArchiveModal, setShowBulkArchiveModal] = useState(false);
  const [archivoFilters, setArchivoFilters] = useState({
    search: '',
    status: 'all',
    year: 'all',
    mode: 'all',
    retention: 'all'
  });
  const [selectedArchiveItems, setSelectedArchiveItems] = useState([]);
  const [archiveSearchMode, setArchiveSearchMode] = useState('simple');

  // Estados para BL/AWB
  const [blAwbTab, setBlAwbTab] = useState('active');
  const [selectedBLAWB, setSelectedBLAWB] = useState(null);
  const [showBLAWBModal, setShowBLAWBModal] = useState(false);
  const [showCreateBLAWBModal, setShowCreateBLAWBModal] = useState(false);
  const [showBLAWBTrackingModal, setShowBLAWBTrackingModal] = useState(false);
  const [selectedBLAWBForTracking, setSelectedBLAWBForTracking] = useState(null);
  const [blAwbFilters, setBlAwbFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    carrier: 'all',
    date_range: 'all'
  });

  // COMEX-specific dashboard data
  const dashboardData = {
    kpis: {
      dash_kpi_otd: { label: "OTD", value: 93.4, unit: "%", target: 95.0, delta: 2.1, trend: "up" },
      dash_kpi_eta_precision: { label: "Precisión ETA", value: 88.7, unit: "%", target: 90.0, delta: -1.2, trend: "down" },
      dash_kpi_customs_leadtime: { label: "Lead time Aduanas", value: 28, unit: "h", target: 24, delta: 4, trend: "up_bad" },
      dash_kpi_margin: { label: "Margen Neto", value: 145680, unit: "€", delta: 12000, trend: "up" },
      dash_kpi_dd_risk: { label: "Riesgo D&D", value: 23400, unit: "€", delta: -8000, trend: "down_good" },
      dash_kpi_dso: { label: "DSO", value: 42, unit: "días", delta: -3, trend: "down_good" }
    },
    alerts: [
      { id: "coo_pending", title: "COO pendiente antes de filing", expediente: "SI-ES-20319", severity: "high" },
      { id: "eta_changed", title: "ETA actualizada por carrier", expediente: "SI-FR-18765", severity: "medium" }
    ],
    state_bars: [
      { id: "si_ready", label: "SI Ready", value: 0 },
      { id: "booking_conf", label: "Booking Confirmed", value: 1 },
      { id: "docs_ready", label: "Docs Ready", value: 1 },
      { id: "filed", label: "Filed", value: 0 },
      { id: "released", label: "Released", value: 0 }
    ],
    aiInsights: [
      {
        id: 'dash_ai_eta',
        icon: AlertTriangle,
        title: 'Predictor ETA',
        desc: '3 embarques llegarán con retraso. Ajusta expectativas de clientes.',
        cta: { label: 'Ver afectaciones', action: 'open_tracking_delays' }
      },
      {
        id: 'dash_ai_compliance',
        icon: Tag,
        title: 'Compliance Screen',
        desc: '2 expedientes con riesgo medio de sanciones.',
        cta: { label: 'Revisar ahora', action: 'open_compliance' }
      },
      {
        id: 'dash_ai_cost',
        icon: Layers,
        title: 'Cost Optimizer',
        desc: 'Ahorro potencial del 5% re-rutando 2 embarques.',
        cta: { label: 'Ver propuesta', action: 'open_rerouting_proposal' }
      }
    ],
    charts: {
      spend_by_category: [
        { name: 'Fletes', value: 400000 },
        { name: 'Aduanas', value: 150000 },
        { name: 'Documentos', value: 80000 },
        { name: 'Seguros', value: 60000 }
      ],
      p2p_throughput_hourly: [
        { hour: "08:00", expedientes: 12, documentos: 8 },
        { hour: "10:00", expedientes: 18, documentos: 15 },
        { hour: "12:00", expedientes: 22, documentos: 20 },
        { hour: "14:00", expedientes: 16, documentos: 12 },
        { hour: "16:00", expedientes: 25, documentos: 22 },
      ],
      commitments_pipeline: [
        { stage: 'SI Ready', value: 85 },
        { stage: 'Booking', value: 72 },
        { stage: 'Docs Ready', value: 68 },
        { stage: 'Filed', value: 45 },
        { stage: 'Released', value: 42 }
      ]
    }
  };

  // Design tokens following Trustport standard
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

  const getTrustportCardStyle = () => ({
    backgroundColor: TRUSTPORT_TOKENS.colors.surface,
    borderRadius: TRUSTPORT_TOKENS.radius,
    boxShadow: TRUSTPORT_TOKENS.shadow,
    fontFamily: TRUSTPORT_TOKENS.fonts.primary,
    border: `1px solid ${TRUSTPORT_TOKENS.colors.border}`,
  });

  // KPI configuration for COMEX
  const kpiMap = {
    dash_kpi_otd: { Icon: CheckCircle, color: TRUSTPORT_TOKENS.colors.success },
    dash_kpi_eta_precision: { Icon: Clock, color: TRUSTPORT_TOKENS.colors.warning },
    dash_kpi_customs_leadtime: { Icon: FileText, color: TRUSTPORT_TOKENS.colors.danger },
    dash_kpi_margin: { Icon: DollarSign, color: TRUSTPORT_TOKENS.colors.primary },
    dash_kpi_dd_risk: { Icon: AlertTriangle, color: TRUSTPORT_TOKENS.colors.warning },
    dash_kpi_dso: { Icon: Calendar, color: TRUSTPORT_TOKENS.colors.primary }
  };

  const formatKpiValue = (kpiData) => {
    const { value, unit, delta } = kpiData;
    let formattedValue = value;
    let formattedDelta = delta;

    switch (unit) {
      case '€':
        formattedValue = `€${(value / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}K`;
        formattedDelta = delta > 0 ? `+€${(delta / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}K` : `€${(delta / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}K`;
        break;
      case '%':
        formattedValue = `${value}%`;
        formattedDelta = delta > 0 ? `+${delta}%` : `${delta}%`;
        break;
      case 'h':
        formattedValue = `${value}h`;
        formattedDelta = delta > 0 ? `+${delta}h` : `${delta}h`;
        break;
      case 'días':
        formattedValue = `${value} días`;
        formattedDelta = delta > 0 ? `+${delta}` : `${delta}`;
        break;
      default:
        formattedValue = value;
    }

    return { formattedValue, formattedDelta };
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
      case 'down_good': // e.g., lower DSO is good
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
      case 'up_bad': // e.g., higher lead time is bad
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const handleAIAction = (action) => {
    const actionMessages = {
      open_tracking_delays: "Abriendo tracking de retrasos de embarques",
      open_compliance: "Abriendo revisión de compliance",
      open_rerouting_proposal: "Abriendo propuesta de re-ruteo"
    };
    console.log(actionMessages[action] || `Ejecutando acción: ${action}`);
    // If react-hot-toast is fully configured, you might use:
    // toast.success(actionMessages[action] || `Ejecutando acción: ${action}`);
  };

  // Formatters (kept as they might be used elsewhere, but not in the new KPI rendering)
  const formatters = {
    pct: (value) => `${(value * 100).toFixed(1)}%`,
    currency: (value) => new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR', 
      maximumFractionDigits: 0 
    }).format(value),
    hours: (value) => `${value}h`,
    days: (value) => `${value} dias`,
    count: (value) => value.toString()
  };

  // StatCard component - This component is no longer used in the new dashboard structure, but kept if other parts of the app use it.
  const StatCard = ({ title, value, icon: Icon, color, bgColor, trend }) => (
    <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[12px] font-medium text-gray-600">{title}</p>
            <p className="text-[22px] font-semibold mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {value}
            </p>
          </div>
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
        {trend && (
          <div className={`flex items-center mt-2 text-[12px] font-medium ${color}`}>
            <TrendingUp className="w-3 h-3 mr-1" />
            {trend}
          </div>
        )}
      </CardHeader>
    </Card>
  );

  // Mock data para Bookings
  const mockBookingData = [
    {
      id: "bkg-001",
      booking_number: "MSC240828001",
      carrier: "MSC",
      vessel: "MSC BARCELONA",
      voyage: "425W",
      service: "AEGEAN EXPRESS",
      origin_port: "Valencia",
      destination_port: "New York",
      etd: "2025-08-30T14:00:00Z",
      eta: "2025-09-15T08:00:00Z",
      cut_off_doc: "2025-08-28T18:00:00Z",
      cut_off_cargo: "2025-08-29T10:00:00Z",
      status: "confirmed",
      containers: [{ type: "40HC", quantity: 2, booking_ref: "MSC240828001-01" }],
      si_reference: "SI-ES-20319",
      created_at: "2025-08-25T11:20:00Z",
      confirmed_at: "2025-08-26T09:30:00Z",
      rate: { amount: 3200, currency: "EUR", validity: "2025-09-30T23:59:59Z" }
    }
  ];

  // Helper functions
  const getStatusBadge = (status) => {
    const configs = {
      draft: { label: "Borrador", color: "bg-gray-100 text-gray-800" },
      validated: { label: "Validado", color: "bg-green-100 text-green-800" },
      sent: { label: "Enviado", color: "bg-blue-100 text-blue-800" },
      confirmed: { label: "Confirmado", color: "bg-green-100 text-green-800" },
      requested: { label: "Solicitado", color: "bg-yellow-100 text-yellow-800" },
      quoting: { label: "Cotizando", color: "bg-orange-100 text-orange-800" },
      cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800" }
    };
    return configs[status] || configs.draft;
  };

  const getModeIcon = (mode) => {
    const icons = {
      FCL: Ship,
      LCL: Package,
      AIR: Plane
    };
    return icons[mode] || Ship;
  };

  const getRiskBadge = (level) => {
    const configs = {
      low: { label: "Bajo", color: "bg-green-100 text-green-800" },
      medium: { label: "Medio", color: "bg-yellow-100 text-yellow-800" },
      high: { label: "Alto", color: "bg-red-100 text-red-800" }
    };
    return configs[level] || configs.low;
  };

  const getMilestoneStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'blocked':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Filtros aplicados para Bookings
  const filteredBookingData = mockBookingData.filter(booking => {
    const searchMatch = !bookingFilters.search ||
      booking.booking_number.toLowerCase().includes(bookingFilters.search.toLowerCase()) ||
      booking.carrier.toLowerCase().includes(bookingFilters.search.toLowerCase()) ||
      booking.si_reference.toLowerCase().includes(bookingFilters.search.toLowerCase());
    const carrierMatch = bookingFilters.carrier === 'all' || booking.carrier === bookingFilters.carrier;
    const statusMatch = bookingFilters.status === 'all' || booking.status === bookingFilters.status;
    return searchMatch && carrierMatch && statusMatch;
  });

  // Dashboard principal COMEX
  const renderDashboard = () => (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto" style={{ backgroundColor: TRUSTPORT_TOKENS.colors.main_bg }}>
      <div className="flex-1 min-h-0 p-6">
        <div className="max-w-7xl mx-auto space-y-6 h-full">
          {/* Header Block */}
          <div>
            <h1 className="text-[28px] font-semibold text-gray-900" style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
              COMEX — Dashboard
            </h1>
            <p className="text-[14px] text-gray-500 mt-1">
              Visión general y métricas clave de tus operaciones de comercio exterior.
            </p>
          </div>

          {/* Filters Row */}
          <Card style={getTrustportCardStyle()}>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Filtros:</span>
                </div>
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  {['Hoy', '24h', '7d', '30d'].map(period => (
                    <button
                      key={period}
                      className="px-3 py-1 rounded-md text-sm font-medium transition-colors bg-white text-gray-900 shadow-sm"
                    >
                      {period}
                    </button>
                  ))}
                </div>
                <Button style={{ backgroundColor: TRUSTPORT_TOKENS.colors.primary, color: 'white' }} className="hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Object.entries(dashboardData.kpis).map(([key, kpiData]) => {
              const kpi = kpiMap[key];
              const Icon = kpi.Icon;
              const { formattedValue, formattedDelta } = formatKpiValue(kpiData);
              
              return (
                <Card key={key} className="hover:shadow-lg transition-shadow" style={getTrustportCardStyle()}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-600 truncate">{kpiData.label}</p>
                        <p className="text-2xl font-semibold text-gray-900 truncate">
                          {formattedValue}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {getTrendIcon(kpiData.trend)}
                          <span className="text-xs text-gray-500">{formattedDelta}</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${kpi.color}20` }}>
                        <Icon className="w-5 h-5" style={{ color: kpi.color }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* AI Insights Panel */}
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
                {dashboardData.aiInsights.map(insight => (
                  <div key={insight.id} className="bg-white/50 rounded-lg p-4 flex flex-col justify-between h-auto">
                    <div>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <insight.icon className="w-4 h-4" style={{ color: TRUSTPORT_TOKENS.colors.primary }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-blue-900 text-sm">{insight.title}</h4>
                          <p className="text-xs text-blue-700 mt-1">{insight.desc}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                      onClick={() => handleAIAction(insight.cta.action)}
                    >
                      {insight.cta.label}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Costos por Categoria */}
            <Card style={getTrustportCardStyle()}>
              <CardHeader>
                <CardTitle className="text-md font-semibold text-gray-900">Costos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.charts.spend_by_category} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12, fill: TRUSTPORT_TOKENS.colors.text_muted }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }} />
                      <Bar dataKey="value" fill={TRUSTPORT_TOKENS.colors.primary} radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Expedientes por Hora */}
            <Card style={getTrustportCardStyle()}>
              <CardHeader>
                <CardTitle className="text-md font-semibold text-gray-900">Expedientes por Hora</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.charts.p2p_throughput_hourly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="expedientes" name="Expedientes" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="documentos" name="Documentos" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pipeline de Estados */}
            <Card style={getTrustportCardStyle()}>
              <CardHeader>
                <CardTitle className="text-md font-semibold text-gray-900">Pipeline de Estados</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.charts.commitments_pipeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill={TRUSTPORT_TOKENS.colors.success} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  // SUBMODULO 3: BOOKING - COMPLETO
  const renderBooking = () => (
    <BookingManagement />
  );

  // Simplified render functions for other tabs
  const renderBLAWB = () => (
    <BlAwbManagement />
  );

  const renderDocs = () => (
    <DocsManagement />
  );

  const renderCompliance = () => (
    <ComplianceManagement />
  );

  const renderTracking = () => (
    <TrackingManagement />
  );

  const renderAduanas = () => (
    <AduanasManagement />
  );

  const renderLiquidacion = () => (
    <LiquidacionManagement />
  );

  const renderArchivo = () => (
    <ArchivoManagement />
  );

  const renderCotizaciones = () => {
    const handleNewQuote = () => {
      setShowNewQuoteForm(true);
    };

    const handleViewQuote = (quote) => {
      setSelectedQuote(quote);
      setShowQuoteDetail(true);
    };

    const handleSubmitQuote = (newQuoteData) => {
      setQuotes(prev => [newQuoteData, ...prev]);
    };

    const handleUpdateQuote = (updatedQuote) => {
      setQuotes(prev => prev.map(q => 
        q.id === updatedQuote.id ? updatedQuote : q
      ));
      setSelectedQuote(updatedQuote);
    };

    return (
      <div className="space-y-6">
        <QuotationsList 
          onNewQuote={handleNewQuote}
          onViewQuote={handleViewQuote}
        />

        <QuotationForm
          open={showNewQuoteForm}
          onClose={() => setShowNewQuoteForm(false)}
          onSubmit={handleSubmitQuote}
        />

        <QuotationDetail
          quote={selectedQuote}
          open={showQuoteDetail}
          onClose={() => setShowQuoteDetail(false)}
          onUpdate={handleUpdateQuote}
        />
      </div>
    );
  };

  // Funcion de renderizado principal
  const renderContent = () => {
    switch(tab) {
      case 'dashboard':
        return renderDashboard();
      case 'routing-order':
        return <RoutingOrder />;
      case 'booking':
        return renderBooking();
      case 'bl-awb':
        return renderBLAWB();
      case 'docs':
        return renderDocs();
      case 'compliance':
        return renderCompliance();
      case 'tracking':
        return renderTracking();
      case 'aduanas':
        return renderAduanas();
      case 'liquidacion':
        return renderLiquidacion();
      case 'archivo':
        return renderArchivo();
      case 'cotizaciones':
        return renderCotizaciones();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden" style={{ backgroundColor: '#F1F0EC' }}>
      {renderContent()}

      {/* MODALES */}
      {/* Modal Crear Routing Order */}
      <Dialog open={showCreateRoutingOrder} onOpenChange={setShowCreateRoutingOrder}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo Routing Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">Completa los detalles para crear un nuevo routing order.</p>
            <div>
              <Label htmlFor="roReference">Referencia RO</Label>
              <Input id="roReference" placeholder="Ej: RO-ES-20320" />
            </div>
            <div>
              <Label htmlFor="shipper">Embarcador</Label>
              <Input id="shipper" placeholder="Nombre del embarcador" />
            </div>
            <div>
              <Label htmlFor="consignee">Consignatario</Label>
              <Input id="consignee" placeholder="Nombre del consignatario" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateRoutingOrder(false)}>
                Cancelar
              </Button>
              <Button
                style={{ backgroundColor: '#4472C4', color: 'white' }}
                onClick={() => {
                  console.log("Nuevo Routing Order guardado");
                  setShowCreateRoutingOrder(false);
                }}
              >
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Crear Booking */}
      <Dialog open={showCreateBookingModal} onOpenChange={setShowCreateBookingModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>RFQ Spot Bidding - Nueva Cotizacion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>S/I Reference</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar S/I..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SI-ES-20319">SI-ES-20319 - Valencia → New York</SelectItem>
                  <SelectItem value="SI-PE-90112">SI-PE-90112 - Lima → Madrid</SelectItem>
                  <SelectItem value="SI-MX-45678">SI-MX-45678 - Veracruz → Barcelona</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ETD Preferido</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Carriers para RFQ</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="msc" defaultChecked />
                    <label htmlFor="msc">MSC</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="hapag" defaultChecked />
                    <label htmlFor="hapag">Hapag-Lloyd</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="cma" />
                    <label htmlFor="cma">CMA CGM</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateBookingModal(false)}>
                Cancelar
              </Button>
              <Button 
                style={{ backgroundColor: '#4472C4', color: 'white' }}
                onClick={() => setShowCreateBookingModal(false)}
              >
                Enviar RFQ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Detalle Booking */}
      <Dialog open={showBookingDetailModal} onOpenChange={setShowBookingDetailModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalle Booking - {selectedBooking?.booking_number}</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Carrier</Label>
                  <p className="font-medium">{selectedBooking.carrier}</p>
                </div>
                <div>
                  <Label>Vessel/Service</Label>
                  <p className="font-medium">{selectedBooking.vessel}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.service}</p>
                </div>
                <div>
                  <Label>Voyage</Label>
                  <p className="font-medium">{selectedBooking.voyage}</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowBookingDetailModal(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
