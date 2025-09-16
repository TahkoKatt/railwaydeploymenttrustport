
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, AlertTriangle, Clock, FileText, DollarSign,
  Zap, Eye, Download, RefreshCw, Upload, Shield, Search,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


/*
FACTURAS V2 (AP INGEST + MATCH CENTER) - Step 6 RC Plan
Features: OCR/e-invoice, UBL validation, 3W/2W matching, tolerances
Gate G4: touchless ≥75%, first pass yield ≥95%, 3W ≥95%
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


const getMatchStatusConfig = (status) => {
  const configs = {
    matched_3w: { color: "bg-green-100 text-green-800", icon: CheckCircle2, text: "3W Match" },
    matched_2w: { color: "bg-blue-100 text-blue-800", icon: CheckCircle2, text: "2W Match" },
    exception: { color: "bg-red-100 text-red-800", icon: AlertTriangle, text: "Excepción" },
    pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock, text: "Pendiente" },
    manual_review: { color: "bg-orange-100 text-orange-800", icon: Eye, text: "Revisión Manual" },
    posted: { color: "bg-gray-100 text-gray-800", icon: Shield, text: "Contabilizada" }
  };
  return configs[status] || configs["pending"];
};

const getValidationStatusBadge = (fiscal_valid, schema_valid, signature_valid) => {
  const allValid = fiscal_valid && schema_valid && signature_valid;
  if (allValid) return <Badge className="bg-green-100 text-green-800">Validación ✓</Badge>;
  return <Badge className="bg-red-100 text-red-800">Error Validación</Badge>;
};

const MatchCenterMetrics = ({ data }) => {
  const total = data.length;
  const matched3W = data.filter(f => f.match_status === 'matched_3w').length;
  const matched2W = data.filter(f => f.match_status === 'matched_2w').length;
  const touchless = data.filter(f => f.touchless === true).length;
  const exceptions = data.filter(f => f.match_status === 'exception').length;

  const touchlessRate = total > 0 ? (touchless / total * 100) : 0;
  const matchRate3W = total > 0 ? (matched3W / total * 100) : 0;
  const firstPassYield = total > 0 ? ((matched3W + matched2W) / total * 100) : 0;

  const kpiData = [
    { title: "Touchless Rate", value: `${touchlessRate.toFixed(1)}%`, icon: Zap, color: touchlessRate >= 75 ? TRUSTPORT_TOKENS.colors.success : TRUSTPORT_TOKENS.colors.danger, progress: touchlessRate },
    { title: "3W Match Rate", value: `${matchRate3W.toFixed(1)}%`, icon: CheckCircle2, color: matchRate3W >= 95 ? TRUSTPORT_TOKENS.colors.success : TRUSTPORT_TOKENS.colors.danger, progress: matchRate3W },
    { title: "First Pass Yield", value: `${firstPassYield.toFixed(1)}%`, icon: Shield, color: firstPassYield >= 95 ? TRUSTPORT_TOKENS.colors.success : TRUSTPORT_TOKENS.colors.danger, progress: firstPassYield },
    { title: "Excepciones", value: exceptions, icon: AlertTriangle, color: exceptions === 0 ? TRUSTPORT_TOKENS.colors.success : TRUSTPORT_TOKENS.colors.warning, progress: null }
  ];


  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
       {kpiData.map((kpi, index) => (
        <Card key={index} style={getTrustportCardStyle()}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">{kpi.title}</p>
                <p className="text-2xl font-semibold">{kpi.value}</p>
              </div>
              <div className="p-2 rounded-lg" style={{backgroundColor: `${kpi.color}20`}}>
                <kpi.icon className={`w-5 h-5`} style={{color: kpi.color}} />
              </div>
            </div>
            {kpi.progress !== null && <Progress value={kpi.progress} className="mt-2" />}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const AIInsightsBand = ({ onActionClick }) => {
  const insights = [
    {
      id: "auto_match",
      title: "Lanzar Auto-Match",
      description: "Detectadas 3 facturas con PO y GRN/ePOD que superan el 98% de coincidencia.",
      cta: "Iniciar 3W Match",
      action: "launch_3wm",
      icon: Zap
    },
    {
      id: "resolve_exceptions",
      title: "Resolver Excepciones en Lote",
      description: "2 facturas tienen la misma excepción de 'precio fuera de tolerancia'. Resuelvelas en lote.",
      cta: "Resolver en Lote",
      action: "resolve_batch_exceptions",
      icon: Shield
    },
    {
      id: "request_credit_note",
      title: "Solicitar Nota de Crédito",
      description: "Factura INV-003 con discrepancia persistente. Sugerencia: solicitar nota de crédito.",
      cta: "Pedir Nota Crédito",
      action: "request_credit_note",
      icon: FileText
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
              onClick={() => onActionClick(insight.action, {})}
            >
              {insight.cta}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};


export default function FacturasMatchCenter() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredFacturas, setFilteredFacturas] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'all', channel: 'all'});
  const [activeTab, setActiveTab] = useState('inbox');


  useEffect(() => {
    // Load seeds (Step 6)
    setLoading(true);
    const demoFacturas = [
      {
        id: 'INV-001',
        supplier_name: 'TechSupply SL',
        po_id: 'PO-001',
        amount: 15000,
        currency: 'EUR',
        match_status: 'matched_3w',
        match_type: 'auto',
        touchless: true,
        fiscal_valid: true,
        schema_valid: true,
        signature_valid: true,
        ingest_channel: 'email',
        received_date: '2024-01-16T10:30:00Z',
        tolerance_variance_pct: 0.5
      },
      {
        id: 'INV-002',
        supplier_name: 'Materiales ABC',
        po_id: 'PO-002',
        amount: 22750,
        currency: 'EUR',
        match_status: 'matched_3w',
        match_type: 'auto',
        touchless: true,
        fiscal_valid: true,
        schema_valid: true,
        signature_valid: true,
        ingest_channel: 'peppol',
        received_date: '2024-01-17T14:15:00Z',
        tolerance_variance_pct: 1.1
      },
      {
        id: 'INV-003',
        supplier_name: 'Critical Parts Co',
        po_id: 'SPO-001',
        amount: 12800,
        currency: 'EUR',
        match_status: 'exception',
        match_type: 'manual',
        touchless: false,
        fiscal_valid: true,
        schema_valid: false,
        signature_valid: true,
        exception_type: 'tariff_missing',
        ingest_channel: 'sftp',
        received_date: '2024-01-18T09:45:00Z',
        tolerance_variance_pct: 15.2
      },
      {
        id: 'INV-004',
        supplier_name: 'Logística Express',
        po_id: 'SPO-002',
        amount: 8900,
        currency: 'EUR',
        match_status: 'matched_2w',
        match_type: 'auto',
        touchless: true,
        fiscal_valid: true,
        schema_valid: true,
        signature_valid: true,
        ingest_channel: 'api',
        received_date: '2024-01-19T11:20:00Z',
        tolerance_variance_pct: 2.1
      },
      {
        id: 'INV-005',
        supplier_name: 'Global Supplies',
        po_id: 'PO-003',
        amount: 5000,
        currency: 'USD',
        match_status: 'pending',
        match_type: 'auto',
        touchless: false,
        fiscal_valid: true,
        schema_valid: true,
        signature_valid: true,
        ingest_channel: 'email',
        received_date: '2024-01-20T09:00:00Z',
        tolerance_variance_pct: 0.0
      },
      {
        id: 'INV-006',
        supplier_name: 'Innovate Solutions',
        po_id: 'PO-004',
        amount: 7500,
        currency: 'EUR',
        match_status: 'manual_review',
        match_type: 'manual',
        touchless: false,
        fiscal_valid: true,
        schema_valid: true,
        signature_valid: false,
        ingest_channel: 'peppol',
        received_date: '2024-01-21T16:00:00Z',
        tolerance_variance_pct: 0.8
      },
      {
        id: 'INV-007',
        supplier_name: 'Componentes Modernos',
        po_id: 'PO-005',
        amount: 3000,
        currency: 'EUR',
        match_status: 'posted',
        match_type: 'auto',
        touchless: true,
        fiscal_valid: true,
        schema_valid: true,
        signature_valid: true,
        ingest_channel: 'api',
        received_date: '2024-01-22T11:00:00Z',
        tolerance_variance_pct: 0.1
      }
    ];
    setFacturas(demoFacturas);
    setLoading(false);
  }, []);

  const handleAction = (action, facturaId) => {
    switch (action) {
      case 'view':
        toast.success(`Abriendo detalles de ${facturaId}`);
        break;
      case 'resolve_exception':
        toast.success(`Resolviendo excepción de ${facturaId}`);
        break;
      case 'post_ap':
        toast.success(`Contabilizando ${facturaId} en AP`);
        break;
      case 'download_pdf':
        toast.success(`Descargando PDF de ${facturaId}`);
        break;
      default:
        toast.info(`Acción ${action} para ${facturaId}`);
    }
  };

  const handleAIAction = (action, params) => {
      toast.info(`Ejecutando accion IA: ${action}`, { description: JSON.stringify(params) });
  };

  useEffect(() => {
    let currentFiltered = facturas;

    if (filters.search) {
      currentFiltered = currentFiltered.filter(f => 
        f.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        f.supplier_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        f.po_id.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.status !== 'all') {
      currentFiltered = currentFiltered.filter(f => f.match_status === filters.status);
    }

    if (filters.channel !== 'all') {
      currentFiltered = currentFiltered.filter(f => f.ingest_channel === filters.channel);
    }

    setFilteredFacturas(currentFiltered);
  }, [filters, facturas]);
  
  const getFacturasForTab = (tab) => {
    switch(tab) {
      case 'review':
        return filteredFacturas.filter(f => f.match_status === 'manual_review');
      case 'exceptions':
        return filteredFacturas.filter(f => f.match_status === 'exception');
      case 'posted':
        return filteredFacturas.filter(f => f.match_status === 'posted');
      case 'inbox':
        return filteredFacturas.filter(f =>
          ['pending', 'manual_review', 'exception'].includes(f.match_status)
        );
      case 'match_center':
        return filteredFacturas.filter(f =>
          ['matched_3w', 'matched_2w', 'posted'].includes(f.match_status)
        );
      default:
        return filteredFacturas;
    }
  }

  const renderTableContent = (facturasToRender) => (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Factura ID</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>PO/SPO</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Match Status</TableHead>
            <TableHead>Validación</TableHead>
            <TableHead>Canal</TableHead>
            <TableHead>Tolerancia</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {facturasToRender.map((factura) => {
            const matchConfig = getMatchStatusConfig(factura.match_status);
            const MatchIcon = matchConfig.icon;

            return (
              <TableRow key={factura.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{factura.id}</TableCell>
                <TableCell>{factura.supplier_name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {factura.po_id.startsWith('SPO') ?
                      <FileText className="w-3 h-3 text-blue-500" /> :
                      <DollarSign className="w-3 h-3 text-green-500" />
                    }
                    {factura.po_id}
                  </div>
                </TableCell>
                <TableCell>{factura.currency} {factura.amount.toLocaleString('es-ES')}</TableCell>
                <TableCell>
                  <Badge className={matchConfig.color}>
                    <MatchIcon className="w-3 h-3 mr-1" />
                    {matchConfig.text}
                  </Badge>
                </TableCell>
                <TableCell>
                  {getValidationStatusBadge(factura.fiscal_valid, factura.schema_valid, factura.signature_valid)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{factura.ingest_channel.toUpperCase()}</Badge>
                </TableCell>
                <TableCell>
                  <span className={factura.tolerance_variance_pct > 5 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                    {factura.tolerance_variance_pct.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleAction('view', factura.id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {factura.match_status === 'exception' && (
                      <Button variant="ghost" size="sm" onClick={() => handleAction('resolve_exception', factura.id)}>
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                      </Button>
                    )}
                    {factura.match_status.startsWith('matched') && (
                      <Button variant="ghost" size="sm" onClick={() => handleAction('post_ap', factura.id)}>
                        <Shield className="w-4 h-4 text-green-600" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleAction('download_pdf', factura.id)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
  );

  if (loading) {
    return <div className="flex justify-center p-8"><RefreshCw className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: TRUSTPORT_TOKENS.colors.background, minHeight: '100vh', padding: '1.5rem' }}>
       <div className="p-6 rounded-lg" style={{ backgroundColor: '#F1F0EC' }}>
            <h1 className="text-[28px] font-bold text-gray-900" style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
                Facturas
            </h1>
            <p className="text-gray-500 mt-1 text-[14px] font-medium">
                Ingestion OCR/e-invoice, validacion fiscal, matching 3W/2W y posteo AP.
            </p>
        </div>
      <MatchCenterMetrics data={facturas} />
      <AIInsightsBand onActionClick={handleAIAction} />

      <Card style={getTrustportCardStyle()}>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="col-span-full lg:col-span-2 relative">
                        <Search className="w-4 h-4 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder="Buscar Factura, Proveedor, PO..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="pl-8"
                        />
                    </div>
                    <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                        <SelectTrigger><SelectValue placeholder="Estado Match" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Estados</SelectItem>
                            <SelectItem value="matched_3w">3W Match</SelectItem>
                            <SelectItem value="matched_2w">2W Match</SelectItem>
                            <SelectItem value="exception">Excepción</SelectItem>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="manual_review">Revisión Manual</SelectItem>
                            <SelectItem value="posted">Contabilizada</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select value={filters.channel} onValueChange={(value) => setFilters({ ...filters, channel: value })}>
                        <SelectTrigger><SelectValue placeholder="Canal" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Canales</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="peppol">Peppol</SelectItem>
                            <SelectItem value="sftp">SFTP</SelectItem>
                            <SelectItem value="api">API</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => setFilters({ search: '', status: 'all', channel: 'all' })} variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Limpiar
                    </Button>
                </div>
            </CardContent>
        </Card>

      <Card style={getTrustportCardStyle()}>
        <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                {/* This div previously contained the TabsList and the Button, and was inside CardHeader */}
                <div className="flex justify-between items-center">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="inbox">Inbox</TabsTrigger>
                        <TabsTrigger value="review">En Revisión</TabsTrigger>
                        <TabsTrigger value="match_center">Match Center</TabsTrigger>
                        <TabsTrigger value="exceptions">Excepciones</TabsTrigger>
                        <TabsTrigger value="posted">Contabilizadas</TabsTrigger>
                    </TabsList>
                    <div className="flex gap-2 pl-4">
                        <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Ingestar Factura
                        </Button>
                    </div>
                </div>
                {/* TabsContent components are direct children of Tabs */}
                <TabsContent value="inbox">{renderTableContent(getFacturasForTab('inbox'))}</TabsContent>
                <TabsContent value="review">{renderTableContent(getFacturasForTab('review'))}</TabsContent>
                <TabsContent value="match_center">{renderTableContent(getFacturasForTab('match_center'))}</TabsContent>
                <TabsContent value="exceptions">{renderTableContent(getFacturasForTab('exceptions'))}</TabsContent>
                <TabsContent value="posted">{renderTableContent(getFacturasForTab('posted'))}</TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
