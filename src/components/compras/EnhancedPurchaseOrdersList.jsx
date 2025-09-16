
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Filter, Eye, Send, CheckCircle, Clock, AlertTriangle, Package, 
  FileText, MoreHorizontal, ChevronDown, ChevronUp, AlertCircle, 
  ExternalLink, Truck, Warehouse, Calendar, Zap, Shield
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


/*
OC BIENES V2 - FULLY ACTIVE
Features: ASN required, ACK timer, Risk scoring, Non-destructive actions
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

const getStatusConfig = (status) => {
  const configs = {
    draft: { color: "bg-gray-200 text-gray-800", text: "Borrador" },
    sent: { color: "bg-blue-200 text-blue-900", text: "Enviada" },
    acknowledged: { color: "bg-green-100 text-green-800", text: "Confirmada (ACK)" },
    partially_received: { color: "bg-yellow-100 text-yellow-800", text: "Recibida Parcial" },
    received: { color: "bg-green-200 text-green-900", text: "Recibida" },
    matched: { color: "bg-purple-100 text-purple-800", text: "Conciliada" },
    closed: { color: "bg-gray-400 text-white", text: "Cerrada" },
    cancelled: { color: "bg-red-100 text-red-800", text: "Cancelada" },
  };
  return configs[status] || configs["draft"];
};

const getACKStatusBadge = (ackDue, currentStatus) => {
  if (currentStatus === 'acknowledged') {
    return <Badge className="bg-green-100 text-green-800">ACK ✓</Badge>;
  }
  if (!ackDue) return null;
  
  const now = new Date();
  const dueDate = new Date(ackDue);
  const hoursRemaining = (dueDate - now) / (1000 * 60 * 60);
  
  if (hoursRemaining < 0) return <Badge className="bg-red-100 text-red-800">ACK Vencido</Badge>;
  if (hoursRemaining < 24) return <Badge className="bg-yellow-100 text-yellow-800">ACK 24h</Badge>;
  return <Badge className="bg-blue-100 text-blue-800">ACK Pendiente</Badge>;
};

const getRiskScore = (po) => {
  let score = 0;
  
  // Late ACK (+30 points)
  if (po.ack_due && new Date(po.ack_due) < new Date() && po.status !== 'acknowledged') score += 30;
  
  // Missing ASN when required (+25 points)
  if (po.asn_required && !po.asn_received) score += 25;
  
  // ETA slip (+20 points)
  if (po.eta && new Date(po.eta) < new Date() && !['received', 'closed'].includes(po.status)) score += 20;
  
  // Expedite risk (+15 points)
  if (po.expedite_risk) score += 15;
  
  // Supplier risk (+10 points)
  if (po.supplier_risk_level === 'high') score += 10;
  
  return Math.min(score, 100);
};

const getRiskBadge = (riskScore) => {
  if (riskScore >= 70) return <Badge className="bg-red-100 text-red-800">Alto ({riskScore})</Badge>;
  if (riskScore >= 40) return <Badge className="bg-yellow-100 text-yellow-800">Medio ({riskScore})</Badge>;
  return <Badge className="bg-green-100 text-green-800">Bajo ({riskScore})</Badge>;
};

const HeaderKPIs = ({ data }) => {
  const kpiData = [
    { title: "OC Activas", value: data.activePOs, icon: FileText, color: TRUSTPORT_TOKENS.colors.primary },
    { title: "Recibidas Parcial", value: data.partialPOs, icon: Package, color: TRUSTPORT_TOKENS.colors.warning },
    { title: "ASN Coverage", value: `${data.asnCoverage}%`, icon: CheckCircle, color: TRUSTPORT_TOKENS.colors.success },
    { title: "OCF (h)", value: `${data.avgOCF}h`, icon: Clock, color: TRUSTPORT_TOKENS.colors.primary },
    { title: "3W Match", value: `${data.match3w}%`, icon: Shield, color: TRUSTPORT_TOKENS.colors.success },
    { title: "Riesgo Alto", value: data.highRisk, icon: AlertTriangle, color: TRUSTPORT_TOKENS.colors.danger }
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

const AIInsightsBand = ({ onActionClick }) => {
  const insights = [
    {
      id: "split_wh",
      title: "Dividir por Almacen", 
      description: "La OC PO-001 contiene items para ALM-BCN y ALM-MAD. Dividir optimiza la recepcion.",
      cta: "Dividir OC",
      action: "split_by_wh",
      icon: Package
    },
    {
      id: "auto_3wm",
      title: "Auto-match 3WM",
      description: "2 facturas con coincidencia potencial para OCs ya recibidas.", 
      cta: "Lanzar 3WM",
      action: "launch_3wm_recheck",
      icon: Zap
    },
    {
      id: "expedite_risk",
      title: "Sugerir Expedite",
      description: "PO-002 tiene riesgo de retraso en ETA. Considerar expedite para evitar stockout.",
      cta: "Marcar Expedite", 
      action: "expedite_po",
      icon: AlertTriangle
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
              onClick={() => onActionClick(insight.action, insight.id)}
            >
              {insight.cta}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};


export default function EnhancedPurchaseOrdersList({ isPreview }) {
  const [pos, setPos] = useState([]);
  const [filteredPos, setFilteredPos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: 'all', risk: 'all' });
  const [activeTab, setActiveTab] = useState('my_pos');


  const kpiData = {
    activePOs: 8,
    partialPOs: 2,
    asnCoverage: 88,
    avgOCF: 42,
    match3w: 96,
    highRisk: 1,
  };


  useEffect(() => {
    // Load seeds (Step 2)
    setLoading(true);
    const demoPOs = [
      { 
        id: 'OC-G-001', 
        supplier_name: 'TechSupply SL', 
        warehouse: 'ALM-BCN', 
        status: 'sent', 
        ack_due: '2024-01-15T10:00:00Z', // Past due ACK
        asn_required: true,
        asn_received: false,
        eta: '2024-01-20',
        amount: 15000,
        currency: 'EUR',
        expedite_risk: false,
        supplier_risk_level: 'low',
        ocf_hours: 48,
        asn_coverage_pct: 0,
        three_way_match_pct: 0
      },
      { 
        id: 'OC-G-002', 
        supplier_name: 'Materiales ABC', 
        warehouse: 'ALM-MAD', 
        status: 'acknowledged', 
        ack_due: '2024-01-12T09:00:00Z',
        asn_required: true,
        asn_received: true,
        eta: '2024-01-18', // Past due ETA, but ACKNOWLEDGED
        amount: 22500,
        currency: 'EUR',
        expedite_risk: true,
        supplier_risk_level: 'medium',
        ocf_hours: 32,
        asn_coverage_pct: 100,
        three_way_match_pct: 0
      },
      { 
        id: 'OC-G-003', 
        supplier_name: 'Critical Parts Co', 
        warehouse: 'ALM-BCN', 
        status: 'received', 
        ack_due: '2024-01-10T14:00:00Z',
        asn_required: false,
        asn_received: false,
        eta: '2024-01-16',
        amount: 8900,
        currency: 'EUR',
        grn_id: 'GRN-001',
        discrepancy: false,
        expedite_risk: false,
        supplier_risk_level: 'low',
        ocf_hours: 56,
        asn_coverage_pct: 100,
        three_way_match_pct: 98
      },
      { 
        id: 'OC-G-004', 
        supplier_name: 'Innovaciones S.A.', 
        warehouse: 'ALM-BCN', 
        status: 'partially_received', 
        ack_due: '2024-01-25T11:00:00Z',
        asn_required: true,
        asn_received: true,
        eta: '2024-01-28',
        amount: 30000,
        currency: 'EUR',
        expedite_risk: false,
        supplier_risk_level: 'low',
        ocf_hours: 40,
        asn_coverage_pct: 70,
        three_way_match_pct: 50
      },
      { 
        id: 'OC-G-005', 
        supplier_name: 'Global Connect', 
        warehouse: 'ALM-VAL', 
        status: 'sent', 
        ack_due: '2024-01-20T16:00:00Z',
        asn_required: true,
        asn_received: false,
        eta: '2024-02-05',
        amount: 12000,
        currency: 'EUR',
        expedite_risk: true, // Mark as expedite risk
        supplier_risk_level: 'high', // High supplier risk
        ocf_hours: 60,
        asn_coverage_pct: 0,
        three_way_match_pct: 0
      }
    ];
    setPos(demoPOs);
    setLoading(false);
  }, []);

  const handleAction = (action, poId) => {
    switch (action) {
      case 'view':
        toast.success(`Abriendo detalles de ${poId}`);
        break;
      case 'open_asn':
        toast.success(`Abriendo ASN para ${poId}`);
        break;
      case 'receive_now':
        toast.success(`Iniciando recepción para ${poId}`);
        break;
      case 'launch_3wm':
        toast.success(`Lanzando 3-Way Match para ${poId}`);
        break;
      case 'expedite':
        // Find the PO and update its expedite_risk status
        setPos(prevPos => prevPos.map(p => 
          p.id === poId ? { ...p, expedite_risk: !p.expedite_risk } : p
        ));
        toast.success(`Marcando ${poId} como expedite`);
        break;
      default:
        toast.info(`Acción ${action} para ${poId}`);
    }
  };
  
  const handleAIAction = (action, params) => {
    toast.info(`Ejecutando accion IA: ${action}`, { description: JSON.stringify(params) });
  };


  useEffect(() => {
    let currentFiltered = pos;

    if (filters.search) {
      currentFiltered = currentFiltered.filter(po =>
        po.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        po.supplier_name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.status !== 'all') {
      currentFiltered = currentFiltered.filter(po => po.status === filters.status);
    }

    if (filters.risk !== 'all') {
      currentFiltered = currentFiltered.filter(po => {
          const riskScore = getRiskScore(po);
          if (filters.risk === 'high') return riskScore >= 70;
          if (filters.risk === 'medium') return riskScore >= 40 && riskScore < 70;
          if (filters.risk === 'low') return riskScore < 40;
          return true;
      });
    }

    switch (activeTab) {
      case 'pending_approval':
        // Simulating some pending approval logic.
        // For demo, let's say OC-G-001 is pending approval if its status is 'draft' or 'sent'
        currentFiltered = currentFiltered.filter(po => ['draft', 'sent'].includes(po.status));
        break;
      case 'overdue':
        // Filter for POs with overdue ACK
        currentFiltered = currentFiltered.filter(po => 
          po.ack_due && new Date(po.ack_due) < new Date() && po.status !== 'acknowledged'
        );
        break;
      case 'expedite':
        currentFiltered = currentFiltered.filter(po => po.expedite_risk);
        break;
      case 'all':
      case 'my_pos': // 'my_pos' tab shows all filtered without additional constraints
      default:
        break;
    }


    setFilteredPos(currentFiltered);
  }, [filters, pos, activeTab]);


  const renderExpandedRow = (po) => (
    <TableRow>
      <TableCell colSpan={12} className="bg-gray-50 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Detalles de Suministro</h4>
            <p className="text-sm">ASN Requerido: {po.asn_required ? 'Sí' : 'No'}</p>
            <p className="text-sm">ASN Recibido: {po.asn_received ? 'Sí' : 'No'}</p>
            <p className="text-sm">Riesgo Expedite: {po.expedite_risk ? 'Sí' : 'No'}</p>
            <p className="text-sm">Nivel Riesgo Proveedor: {po.supplier_risk_level}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Timeline</h4>
            <p className="text-sm">ACK Due: {po.ack_due ? new Date(po.ack_due).toLocaleString('es-ES') : 'N/A'}</p>
            <p className="text-sm">ETA: {po.eta ? new Date(po.eta).toLocaleDateString('es-ES') : 'N/A'}</p>
            {po.grn_id && <p className="text-sm">GRN: {po.grn_id}</p>}
          </div>
          <div>
            <h4 className="font-semibold mb-2">KPIs</h4>
            <p className="text-sm">OCF: {po.ocf_hours}h</p>
            <p className="text-sm">ASN Coverage: {po.asn_coverage_pct}%</p>
            <p className="text-sm">3W Match: {po.three_way_match_pct}%</p>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );

  if (loading) {
    return <div className="flex justify-center p-8"><Clock className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: TRUSTPORT_TOKENS.colors.background, minHeight: '100vh', padding: '1.5rem' }}>
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#F1F0EC' }}>
            <h1 className="text-[28px] font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Purchase Orders – Bienes
            </h1>
            <p className="text-gray-500 mt-1 text-[14px] font-medium">
                Creacion, seguimiento y 3-Way Match de ordenes de compra de bienes.
            </p>
        </div>

        <HeaderKPIs data={kpiData} />
        <AIInsightsBand onActionClick={handleAIAction} />

        <Card style={getTrustportCardStyle()}>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="col-span-full lg:col-span-2 relative">
                        <Search className="w-4 h-4 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder="Buscar OC o proveedor..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="pl-8"
                        />
                    </div>
                    <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                        <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Estados</SelectItem>
                            <SelectItem value="sent">Enviada</SelectItem>
                            <SelectItem value="acknowledged">Confirmada</SelectItem>
                            <SelectItem value="partially_received">Recibida Parcial</SelectItem>
                            <SelectItem value="received">Recibida</SelectItem>
                            <SelectItem value="closed">Cerrada</SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                            <SelectItem value="draft">Borrador</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select value={filters.risk} onValueChange={(value) => setFilters({ ...filters, risk: value })}>
                        <SelectTrigger><SelectValue placeholder="Riesgo" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Riesgos</SelectItem>
                            <SelectItem value="high">Alto</SelectItem>
                            <SelectItem value="medium">Medio</SelectItem>
                            <SelectItem value="low">Bajo</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => setFilters({ search: '', status: 'all', risk: 'all' })} variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Limpiar
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card style={getTrustportCardStyle()}>
          <CardHeader>
             <div className="flex justify-between items-center">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="my_pos">Mis OCs</TabsTrigger>
                        <TabsTrigger value="pending_approval">Pend. Aprobacion</TabsTrigger>
                        <TabsTrigger value="overdue">Vencidas (ACK)</TabsTrigger>
                        <TabsTrigger value="expedite">Riesgo Expedite</TabsTrigger>
                        <TabsTrigger value="all">Todas</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex gap-2 pl-4">
                    <Button size="sm" style={{ backgroundColor: TRUSTPORT_TOKENS.colors.primary, color: 'white' }} disabled={isPreview}>
                      Nueva OC
                    </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>OC ID</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Almacén</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>OCF (h)</TableHead>
                  <TableHead>ASN Cov.</TableHead>
                  <TableHead>3W Match</TableHead>
                  <TableHead>Riesgo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPos.map((po) => {
                  const statusConfig = getStatusConfig(po.status);
                  const riskScore = getRiskScore(po);
                  const isExpanded = expandedRow === po.id;
                  
                  return (
                    <React.Fragment key={po.id}>
                      <TableRow className="hover:bg-gray-50">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedRow(isExpanded ? null : po.id)}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{po.id}</TableCell>
                        <TableCell>{po.supplier_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Warehouse className="w-3 h-3 text-gray-400" />
                            {po.warehouse}
                          </div>
                        </TableCell>
                         <TableCell>
                          {po.eta ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              {new Date(po.eta).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                            </div>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>{po.currency} {po.amount.toLocaleString('es-ES')}</TableCell>
                        <TableCell>{po.ocf_hours}</TableCell>
                        <TableCell>
                          <span className={po.asn_coverage_pct < 85 ? 'text-yellow-600' : 'text-green-600'}>
                            {po.asn_coverage_pct}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={po.three_way_match_pct < 95 ? 'text-yellow-600' : 'text-green-600'}>
                            {po.three_way_match_pct}%
                          </span>
                        </TableCell>
                        <TableCell>
                          {getRiskBadge(riskScore)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig.color}>
                            {statusConfig.text}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleAction('view', po.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction('open_asn', po.id)}>
                                <FileText className="w-4 h-4 mr-2" />
                                Abrir ASN
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction('receive_now', po.id)}>
                                <Truck className="w-4 h-4 mr-2" />
                                Recibir Ahora
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAction('launch_3wm', po.id)}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Lanzar 3W Match
                              </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleAction('expedite', po.id)}>
                                <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                                Expedite
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      {isExpanded && renderExpandedRow(po)}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}
