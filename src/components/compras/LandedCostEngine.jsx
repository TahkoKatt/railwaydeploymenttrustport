
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calculator, TrendingUp, CheckCircle, AlertTriangle, Clock,
  DollarSign, Package, Percent, Eye, PlayCircle, CheckCircle2,
  Search, Filter, Shield, Zap, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/*
LANDED COST V2 - MOTOR CENTRAL - Step 7 RC Plan
Features: Prorrateo, simulate→approve→post, variances, tolerances
Gate G5: T2P≤48h, variance≤2%, posting GL correcto, reverso probado
*/

// TRUSTPORT Design Tokens
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

// Helper function to apply Trustport card styling
const getTrustportCardStyle = () => ({
  backgroundColor: TRUSTPORT_TOKENS.colors.surface,
  borderRadius: TRUSTPORT_TOKENS.spacing.radius,
  boxShadow: TRUSTPORT_TOKENS.spacing.shadow,
  fontFamily: TRUSTPORT_TOKENS.fonts.primary
});


const getSheetStatusConfig = (status) => {
  const configs = {
    draft: { color: "bg-gray-200 text-gray-800", text: "Borrador", icon: Clock },
    simulated: { color: "bg-blue-100 text-blue-800", text: "Simulado", icon: Calculator },
    approved: { color: "bg-green-100 text-green-800", text: "Aprobado", icon: CheckCircle },
    posted: { color: "bg-purple-100 text-purple-800", text: "Contabilizado", icon: CheckCircle2 },
    variance: { color: "bg-red-100 text-red-800", text: "Con Varianza", icon: AlertTriangle },
  };
  return configs[status] || configs["draft"];
};

const getAllocationMethodBadge = (method) => {
  const methods = {
    value: { color: "bg-blue-100 text-blue-800", text: "Valor" },
    weight: { color: "bg-green-100 text-green-800", text: "Peso" },
    volume: { color: "bg-yellow-100 text-yellow-800", text: "Volumen" },
    qty: { color: "bg-purple-100 text-purple-800", text: "Cantidad" },
    fob: { color: "bg-orange-100 text-orange-800", text: "FOB" }
  };
  const config = methods[method] || methods["value"];
  return <Badge className={config.color}>{config.text}</Badge>;
};

const LandedCostMetrics = ({ sheets }) => {
  const total = sheets.length;
  const posted = sheets.filter(s => s.status === 'posted').length;
  const avgVariance = sheets.length > 0
    ? sheets.reduce((sum, s) => sum + (s.variance_pct || 0), 0) / sheets.length
    : 0;
  const avgT2P = sheets.length > 0
    ? sheets.reduce((sum, s) => sum + (s.t2p_hours || 0), 0) / sheets.length
    : 0;

  const kpiData = [
    { title: "Sheets Procesados", value: `${posted}/${total}`, icon: TrendingUp, color: TRUSTPORT_TOKENS.colors.primary },
    { title: "Varianza Promedio", value: `${avgVariance.toFixed(1)}%`, icon: Percent, color: avgVariance <= 2 ? TRUSTPORT_TOKENS.colors.success : TRUSTPORT_TOKENS.colors.danger },
    { title: "T2P Promedio", value: `${avgT2P.toFixed(0)}h`, icon: Clock, color: avgT2P <= 48 ? TRUSTPORT_TOKENS.colors.success : TRUSTPORT_TOKENS.colors.danger },
    { title: "Total Landed", value: `€${sheets.reduce((sum, s) => sum + (s.total_landed || 0), 0).toLocaleString('es-ES')}`, icon: DollarSign, color: TRUSTPORT_TOKENS.colors.success },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

const AIInsightsBand = ({ onActionClick }) => {
  const insights = [
    {
      id: "variance_alert",
      title: "Resolver Varianza",
      description: "Sheet LC-003 con varianza >5%. Revisar costos de flete asociados a SPO-001.",
      cta: "Abrir Sheet",
      action: "resolve_variance",
      icon: AlertTriangle
    },
    {
      id: "auto_approve",
      title: "Aprobación Automática",
      description: "Sheet LC-002 con varianza <2.5%. Apto para aprobación automática.",
      cta: "Aprobar Ahora",
      action: "auto_approve",
      icon: Zap
    },
    {
      id: "t2p_risk",
      title: "Riesgo en T2P",
      description: "El T2P de LC-003 supera las 48h. Priorizar para no impactar cierre.",
      cta: "Priorizar Tarea",
      action: "prioritize_task",
      icon: Clock
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
              onClick={() => onActionClick(insight.action, {sheet_id: 'LC-003'})} // Example sheet_id for demo purposes
            >
              {insight.cta}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};


export default function LandedCostEngine() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: 'all', method: 'all' });
  const [activeTab, setActiveTab] = useState('all');
  const [filteredSheets, setFilteredSheets] = useState([]);


  useEffect(() => {
    // Load seeds (Step 7)
    setLoading(true);
    const demoSheets = [
      {
        id: 'LC-001',
        grn_id: 'GRN-001',
        po_id: 'PO-001',
        supplier_name: 'TechSupply SL',
        status: 'posted',
        allocation_method: 'value',
        total_fob: 15000,
        total_costs: 2100,
        total_landed: 17100,
        variance_pct: 1.2,
        t2p_hours: 36,
        fx_rate: 1.0894,
        created_date: '2024-01-16T10:00:00Z',
        posted_date: '2024-01-17T14:30:00Z'
      },
      {
        id: 'LC-002',
        grn_id: 'GRN-002',
        po_id: 'PO-002',
        supplier_name: 'Materiales ABC',
        status: 'approved',
        allocation_method: 'weight',
        total_fob: 22500,
        total_costs: 3200,
        total_landed: 25700,
        variance_pct: 2.5,
        t2p_hours: 42,
        fx_rate: 1.0894,
        created_date: '2024-01-17T09:15:00Z',
        posted_date: null
      },
      {
        id: 'LC-003',
        grn_id: 'GRN-003',
        po_id: 'SPO-001',
        supplier_name: 'Critical Parts Co',
        status: 'variance',
        allocation_method: 'fob',
        total_fob: 8900,
        total_costs: 1800,
        total_landed: 10700,
        variance_pct: 5.8,
        t2p_hours: 68,
        fx_rate: 1.0894,
        created_date: '2024-01-18T11:45:00Z',
        posted_date: null
      },
      {
        id: 'LC-004',
        grn_id: 'GRN-004',
        po_id: 'PO-003',
        supplier_name: 'Global Imports',
        status: 'draft',
        allocation_method: 'volume',
        total_fob: 5000,
        total_costs: 500,
        total_landed: 5500,
        variance_pct: 0,
        t2p_hours: 0,
        fx_rate: 1.0894,
        created_date: '2024-01-19T10:00:00Z',
        posted_date: null
      },
      {
        id: 'LC-005',
        grn_id: 'GRN-005',
        po_id: 'SPO-002',
        supplier_name: 'Industrias del Este',
        status: 'simulated',
        allocation_method: 'qty',
        total_fob: 12000,
        total_costs: 1300,
        total_landed: 13300,
        variance_pct: 1.5,
        t2p_hours: 12,
        fx_rate: 1.0894,
        created_date: '2024-01-20T09:00:00Z',
        posted_date: null
      }
    ];
    setSheets(demoSheets);
    setLoading(false);
  }, []);

  const handleAction = (action, sheetId) => {
    switch (action) {
      case 'simulate':
        toast.success(`Simulando costes para ${sheetId}`);
        // In a real app, you'd update the sheet status here
        setSheets(prevSheets => prevSheets.map(s => s.id === sheetId ? { ...s, status: 'simulated' } : s));
        break;
      case 'approve':
        toast.success(`Aprobando ${sheetId}`);
        setSheets(prevSheets => prevSheets.map(s => s.id === sheetId ? { ...s, status: 'approved' } : s));
        break;
      case 'post':
        toast.success(`Contabilizando ${sheetId}`);
        setSheets(prevSheets => prevSheets.map(s => s.id === sheetId ? { ...s, status: 'posted', posted_date: new Date().toISOString() } : s));
        break;
      case 'view': // Changed from view_details to view as per outline
        toast.success(`Abriendo detalles de ${sheetId}`);
        break;
      case 'resolve_variance':
        toast.success(`Resolviendo varianza de ${sheetId}`);
        // In a real app, this would open a form/modal
        setSheets(prevSheets => prevSheets.map(s => s.id === sheetId ? { ...s, status: 'approved', variance_pct: 0.8 } : s)); // Example: sets to approved with resolved variance
        break;
      default:
        toast.info(`Acción ${action} para ${sheetId}`);
    }
  };

  const handleAIAction = (action, params) => {
    toast.info(`Ejecutando accion IA: ${action}`, { description: JSON.stringify(params) });
    if (action === 'auto_approve' && params.sheet_id === 'LC-002') {
      handleAction('approve', 'LC-002');
    }
    if (action === 'resolve_variance' && params.sheet_id === 'LC-003') {
      handleAction('resolve_variance', 'LC-003');
    }
    // Implement other AI actions as needed
  };

  useEffect(() => {
    let currentFiltered = sheets;

    if (filters.search) {
      currentFiltered = currentFiltered.filter(s =>
        s.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.grn_id.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.supplier_name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      currentFiltered = currentFiltered.filter(s => s.status === filters.status);
    }

    if (filters.method !== 'all') {
      currentFiltered = currentFiltered.filter(s => s.allocation_method === filters.method);
    }

    setFilteredSheets(currentFiltered);
  }, [filters, sheets]);

  const getSheetsForTab = (tab) => {
    switch(tab) {
      case 'inbox': // Corresponds to pending and variance
        return filteredSheets.filter(s => ['draft', 'simulated', 'variance'].includes(s.status));
      case 'approved':
        return filteredSheets.filter(s => s.status === 'approved');
      case 'posted':
        return filteredSheets.filter(s => s.status === 'posted');
      case 'all':
      default:
        return filteredSheets;
    }
  }

  const renderTableContent = (sheetsToRender) => (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sheet ID</TableHead>
            <TableHead>GRN</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Valor FOB</TableHead>
            <TableHead>Costes Indirectos</TableHead>
            <TableHead>Total Landed</TableHead>
            <TableHead>Varianza</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sheetsToRender.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                    No se encontraron sheets para esta categoría con los filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                sheetsToRender.map((sheet) => {
                  const statusConfig = getSheetStatusConfig(sheet.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <TableRow key={sheet.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{sheet.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3 text-gray-400" />
                          {sheet.grn_id}
                        </div>
                      </TableCell>
                      <TableCell>{sheet.supplier_name}</TableCell>
                      <TableCell>€{sheet.total_fob.toLocaleString('es-ES')}</TableCell>
                      <TableCell>€{sheet.total_costs.toLocaleString('es-ES')}</TableCell> {/* Using total_costs for indirect_costs */}
                      <TableCell className="font-medium">€{sheet.total_landed.toLocaleString('es-ES')}</TableCell>
                      <TableCell>
                        <span className={sheet.variance_pct > 2 ? 'text-red-600 font-medium' : 'text-green-600'}>
                          {sheet.variance_pct.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>{getAllocationMethodBadge(sheet.allocation_method)}</TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleAction('view', sheet.id)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {/* Simplified buttons based on outline */}
                          {(sheet.status === 'draft' || sheet.status === 'simulated') && (
                            <Button variant="ghost" size="sm" onClick={() => handleAction('simulate', sheet.id)}>
                              <Calculator className="w-4 h-4 text-blue-600" />
                            </Button>
                          )}
                          {sheet.status !== 'posted' && (
                            <Button variant="ghost" size="sm" onClick={() => handleAction('approve', sheet.id)}>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          {sheet.status === 'approved' && (
                            <Button variant="ghost" size="sm" onClick={() => handleAction('post', sheet.id)}>
                              <Shield className="w-4 h-4 text-purple-600" />
                            </Button>
                          )}
                           {sheet.status === 'variance' && (
                            <Button variant="ghost" size="sm" onClick={() => handleAction('resolve_variance', sheet.id)}>
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
        </TableBody>
      </Table>
  );


  if (loading) {
    return <div className="flex justify-center p-8"><RefreshCw className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: TRUSTPORT_TOKENS.colors.background, minHeight: '100vh', padding: '1.5rem' }}>
       <div className="p-6 rounded-lg" style={{ backgroundColor: '#F1F0EC' }}>
            <h1 className="text-[28px] font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Landed Cost
            </h1>
            <p className="text-gray-500 mt-1 text-[14px] font-medium">
                Motor de prorrateo y capitalización de costes indirectos.
            </p>
        </div>

      <LandedCostMetrics sheets={sheets} />
      <AIInsightsBand onActionClick={handleAIAction} />

       <Card style={getTrustportCardStyle()}>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="col-span-full lg:col-span-2 relative">
                        <Search className="w-4 h-4 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder="Buscar Sheet, GRN o Proveedor..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="pl-8"
                        />
                    </div>
                    <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                        <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Estados</SelectItem>
                            <SelectItem value="posted">Contabilizado</SelectItem>
                            <SelectItem value="approved">Aprobado</SelectItem>
                            <SelectItem value="variance">Con Varianza</SelectItem>
                            <SelectItem value="draft">Borrador</SelectItem>
                            <SelectItem value="simulated">Simulado</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select value={filters.method} onValueChange={(value) => setFilters({ ...filters, method: value })}>
                        <SelectTrigger><SelectValue placeholder="Método" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Métodos</SelectItem>
                            <SelectItem value="value">Valor</SelectItem>
                            <SelectItem value="weight">Peso</SelectItem>
                            <SelectItem value="volume">Volumen</SelectItem>
                            <SelectItem value="qty">Cantidad</SelectItem>
                            <SelectItem value="fob">FOB</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => setFilters({ search: '', status: 'all', method: 'all' })} variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Limpiar
                    </Button>
                </div>
            </CardContent>
        </Card>

      <Card style={getTrustportCardStyle()}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="inbox">Bandeja de Entrada</TabsTrigger>
                <TabsTrigger value="approved">Aprobados</TabsTrigger>
                <TabsTrigger value="posted">Contabilizados</TabsTrigger>
                <TabsTrigger value="all">Todos</TabsTrigger>
              </TabsList>
              <div className="flex gap-2 pl-4">
                <Button size="sm" style={{ backgroundColor: TRUSTPORT_TOKENS.colors.primary, color: 'white' }}>
                  Nuevo Sheet
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="inbox">{renderTableContent(getSheetsForTab('inbox'))}</TabsContent>
            <TabsContent value="approved">{renderTableContent(getSheetsForTab('approved'))}</TabsContent>
            <TabsContent value="posted">{renderTableContent(getSheetsForTab('posted'))}</TabsContent>
            <TabsContent value="all">{renderTableContent(getSheetsForTab('all'))}</TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
