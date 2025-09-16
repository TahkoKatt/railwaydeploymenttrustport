
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Filter, Eye, Send, CheckCircle, Clock, AlertTriangle,
  Package, FileText, DollarSign, MoreHorizontal, ChevronDown,
  ChevronUp, Download, Upload, Truck, MapPin, Calendar,
  RotateCcw, AlertCircle, CheckCircle2, XCircle, Zap, Shield, RefreshCw // Added RefreshCw import
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

/*
PAQUETE 8/8 — DEVOLUCIONES Y NOTAS DEBITO V2 - ARMADO
Features: RTV bienes, Claims servicios, UBL debit/credit, integracion fiscal
Pipeline P2P COMPLETO - Activacion escalonada pendiente gates GREEN
*/

const TRUSTPORT_TOKENS = {
  colors: {
    primary: '#4472C4',
    background: '#F1F0EC',
    surface: '#FFFFFF',
    success: '#00A878',
    warning: '#FFC857',
    danger: '#DB2142',
  },
  spacing: { radius: '16px', shadow: '0 8px 24px rgba(0,0,0,.08)' },
  fonts: { primary: 'Montserrat, sans-serif' }
};

const getTrustportCardStyle = () => ({
  backgroundColor: TRUSTPORT_TOKENS.colors.surface,
  borderRadius: TRUSTPORT_TOKENS.spacing.radius,
  boxShadow: TRUSTPORT_TOKENS.spacing.shadow,
  fontFamily: TRUSTPORT_TOKENS.fonts.primary
});


const getStatusConfig = (status, type = 'rtv') => {
  const configs = {
    rtv: {
      draft: { color: "bg-gray-200 text-gray-800", text: "Borrador", icon: Clock },
      requested: { color: "bg-blue-100 text-blue-800", text: "Solicitada", icon: Send },
      approved: { color: "bg-green-100 text-green-800", text: "Aprobada", icon: CheckCircle },
      in_transit: { color: "bg-yellow-100 text-yellow-800", text: "En Tránsito", icon: Truck },
      received: { color: "bg-green-200 text-green-900", text: "Recibida", icon: CheckCircle2 },
      closed: { color: "bg-gray-400 text-white", text: "Cerrada", icon: CheckCircle2 },
      cancelled: { color: "bg-red-100 text-red-800", text: "Cancelada", icon: XCircle }
    },
    claim: {
      draft: { color: "bg-gray-200 text-gray-800", text: "Borrador", icon: Clock },
      submitted: { color: "bg-blue-100 text-blue-800", text: "Enviada", icon: Send },
      under_review: { color: "bg-yellow-100 text-yellow-800", text: "En Revisión", icon: Eye },
      approved: { color: "bg-green-100 text-green-800", text: "Aprobada", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", text: "Rechazada", icon: XCircle },
      closed: { color: "bg-gray-400 text-white", text: "Cerrada", icon: CheckCircle2 }
    },
    doc: {
      draft: { color: "bg-gray-200 text-gray-800", text: "Borrador", icon: Clock },
      issued: { color: "bg-blue-100 text-blue-800", text: "Emitida", icon: FileText },
      sent: { color: "bg-blue-200 text-blue-900", text: "Enviada", icon: Send },
      acknowledged: { color: "bg-green-100 text-green-800", text: "Confirmada", icon: CheckCircle },
      posted: { color: "bg-purple-100 text-purple-800", text: "Contabilizada", icon: CheckCircle2 },
      paid: { color: "bg-green-200 text-green-900", text: "Cobrada/Pagada", icon: DollarSign },
      cancelled: { color: "bg-red-100 text-red-800", text: "Cancelada", icon: XCircle }
    }
  };
  return configs[type][status] || configs[type]["draft"];
};

const getReasonBadge = (reason) => {
  const reasons = {
    quality: { color: "bg-red-100 text-red-800", text: "Calidad" },
    shortage: { color: "bg-orange-100 text-orange-800", text: "Faltante" },
    overage: { color: "bg-blue-100 text-blue-800", text: "Sobrante" },
    damage: { color: "bg-red-100 text-red-800", text: "Daño" },
    wrong_item: { color: "bg-yellow-100 text-yellow-800", text: "Item Incorrecto" },
    pricing: { color: "bg-purple-100 text-purple-800", text: "Precio" },
    late_delivery: { color: "bg-red-100 text-red-800", text: "Entrega Tardía" },
    no_show: { color: "bg-red-100 text-red-800", text: "No Show" },
    detour: { color: "bg-yellow-100 text-yellow-800", text: "Desvío" },
    waiting_time: { color: "bg-orange-100 text-orange-800", text: "Tiempo Espera" },
    surcharge_dispute: { color: "bg-purple-100 text-purple-800", text: "Disputa Recargo" }
  };
  const config = reasons[reason] || { color: "bg-gray-100 text-gray-800", text: "Desconocida" }; // Default for unknown reason
  return <Badge className={config.color}>{config.text}</Badge>;
};

const getSLABadge = (dueAt, status) => {
  if (['closed', 'posted', 'paid'].includes(status)) {
    return <Badge variant="outline" className="text-gray-500 border-gray-400">Completado</Badge>;
  }
  
  const now = new Date();
  const due = new Date(dueAt);
  const hoursRemaining = (due - now) / (1000 * 60 * 60);
  
  if (hoursRemaining < 0) return <Badge className="bg-red-100 text-red-800">Vencido</Badge>;
  if (hoursRemaining < 24) return <Badge className="bg-yellow-100 text-yellow-800">En Riesgo</Badge>;
  return <Badge className="bg-green-100 text-green-800">OK</Badge>;
};

const WorkbenchKPIs = ({ kpis }) => { // Changed from data to kpis
  const kpiData = [
    { 
      title: "Recovery Rate", 
      value: `${kpis.recoveryRate}%`, 
      icon: RotateCcw, 
      color: TRUSTPORT_TOKENS.colors.success,
      target: "70%"
    },
    { 
      title: "Cycle Time", 
      value: `${kpis.cycleTimeHours}h`, 
      icon: Clock, 
      color: TRUSTPORT_TOKENS.colors.primary,
      target: "48h"
    },
    { 
      title: "Success Rate", 
      value: `${kpis.successRate}%`, 
      icon: CheckCircle, 
      color: TRUSTPORT_TOKENS.colors.success,
      target: "80%"
    },
    { 
      title: "Total Recovered", 
      value: `€${kpis.totalRecovered.toLocaleString('es-ES')}`, 
      icon: DollarSign, 
      color: TRUSTPORT_TOKENS.colors.warning
    },
    { 
      title: "Active RTVs", 
      value: kpis.activeRTVs, 
      icon: Package, 
      color: TRUSTPORT_TOKENS.colors.primary
    },
    { 
      title: "Open Claims", 
      value: kpis.openClaims, 
      icon: AlertTriangle, 
      color: TRUSTPORT_TOKENS.colors.danger
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
      {kpiData.map((kpi, index) => (
        <Card key={index} style={{ 
          backgroundColor: TRUSTPORT_TOKENS.colors.surface,
          borderRadius: TRUSTPORT_TOKENS.spacing.radius,
          boxShadow: TRUSTPORT_TOKENS.spacing.shadow
        }}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-gray-600">{kpi.title}</p>
                <p className="text-xl font-semibold">{kpi.value}</p>
                {kpi.target && <p className="text-xs text-gray-500">Target: {kpi.target}</p>}
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
      id: "approve_refund",
      title: "Aprobar Reembolso", 
      description: "RTV-002 con evidencia validada y en transito. Apto para aprobar reembolso anticipado.",
      cta: "Aprobar Reembolso",
      action: "approve_refund",
      icon: CheckCircle
    },
    {
      id: "generate_debit_note",
      title: "Generar Nota de Débito",
      description: "Claim CLM-001 aprobado. Generar nota de débito UBL para enviar a proveedor.", 
      cta: "Generar y Enviar",
      action: "generate_debit_note",
      icon: FileText
    },
    {
      id: "escalate_claim",
      title: "Escalar Claim",
      description: "Claim CLM-002 sin respuesta del proveedor hace 72h. Escalar a gestor de cuenta.",
      cta: "Escalar a Gestor", 
      action: "escalate_claim",
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


export default function DevolucionesNotasDebito() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('returns');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    reason: 'all'
  });

  // Seeds demo data for KPIs
  const [kpis, setKpis] = useState({
    recoveryRate: 73,
    cycleTimeHours: 42,
    successRate: 81,
    totalRecovered: 25600,
    activeRTVs: 8,
    openClaims: 3
  });

  // Seeds demo data for tables
  const [data, setData] = useState({
    returns: [],
    claims: [],
    debitCredit: [],
  });

  const [filteredData, setFilteredData] = useState({ returns: [], claims: [], docs: [] });

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay

    const demoTableData = {
      returns: [
        {
          id: 'RTV-001',
          po_id: 'PO-G-001',
          grn_id: 'GRN-001',
          sku: 'COMP-001',
          qty: 3,
          reason: 'quality',
          status: 'approved',
          sla_due: '2024-01-25T16:00:00Z',
          refund_amount: 1200,
          currency: 'EUR',
          evidence_count: 3
        },
        {
          id: 'RTV-002',
          po_id: 'PO-G-002',
          grn_id: 'GRN-002',
          sku: 'SERV-002',
          qty: 1,
          reason: 'wrong_item',
          status: 'requested',
          sla_due: '2024-02-10T10:00:00Z',
          refund_amount: 500,
          currency: 'EUR',
          evidence_count: 1
        },
        {
          id: 'RTV-003',
          po_id: 'PO-G-003',
          grn_id: 'GRN-003',
          sku: 'PROD-003',
          qty: 5,
          reason: 'damage',
          status: 'draft',
          sla_due: '2024-02-20T12:00:00Z',
          refund_amount: 800,
          currency: 'EUR',
          evidence_count: 2
        }
      ],
      claims: [
        {
          id: 'CLM-001',
          spo_id: 'SPO-002',
          lane: 'USJFK-ESBCN',
          cause: 'late_delivery',
          status: 'approved',
          penalty_amount: 350,
          currency: 'EUR',
          evidence_count: 2,
          epod_attached: true
        },
        {
          id: 'CLM-002',
          spo_id: 'SPO-003',
          lane: 'NYC-LDN',
          cause: 'waiting_time',
          status: 'submitted',
          penalty_amount: 150,
          currency: 'USD',
          evidence_count: 1,
          epod_attached: false
        }
      ],
      debitCredit: [
        {
          id: 'DBN-001',
          type: 'debit',
          counterparty: 'TechSupply SL',
          base_doc: 'RTV-001',
          tax: 240,
          total: 1440,
          currency: 'EUR',
          status: 'issued',
          ubl_generated: true
        },
        {
          id: 'CRN-001',
          type: 'credit',
          counterparty: 'GlobalTrans',
          base_doc: 'CLM-001',
          tax: 70,
          total: 420,
          currency: 'EUR',
          status: 'acknowledged',
          ubl_generated: true
        },
        {
          id: 'DBN-002',
          type: 'debit',
          counterparty: 'LogiFast',
          base_doc: 'CLM-002',
          tax: 30,
          total: 180,
          currency: 'USD',
          status: 'draft',
          ubl_generated: false
        }
      ]
    };

    setData(demoTableData);
    // KPIs are already initialized in state, so no need to update from demoData here unless dynamic
    setLoading(false);
  };

  const handleAction = (action, itemId) => {
    const actionMessages = {
      create_rtv: `Creando RTV para ${itemId}`,
      print_labels: `Imprimiendo etiquetas para ${itemId}`,
      schedule_pickup: `Programando recogida para ${itemId}`,
      approve_refund: `Aprobando reembolso de ${itemId}`,
      post_gl: `Contabilizando ${itemId}`,
      init_claim: `Iniciando claim para ${itemId}`,
      attach_epod: `Adjuntando ePOD a ${itemId}`,
      apply_penalty: `Aplicando penalidad a ${itemId}`,
      escalate: `Escalando ${itemId}`,
      generate_ubl: `Generando UBL para ${itemId}`,
      send_to_vendor: `Enviando a proveedor ${itemId}`,
      register_response: `Registrando respuesta de ${itemId}`,
      close: `Cerrando ${itemId}`
    };
    
    toast.success(actionMessages[action] || `Acción "${action}" ejecutada para ${itemId}`);
  };
  
   const handleAIAction = (action, params) => {
      toast.info(`Ejecutando acción IA: ${action}`, { description: JSON.stringify(params) });
    };

  useEffect(() => {
    const filterItems = (items, type) => {
        return items.filter(item => {
            const searchFields = [item.id, item.po_id, item.grn_id, item.sku, item.spo_id, item.lane, item.counterparty, item.base_doc].map(String).join(' ').toLowerCase();
            const matchesSearch = filters.search === '' || searchFields.includes(filters.search.toLowerCase());
            
            const matchesStatus = filters.status === 'all' || item.status === filters.status;
            
            let matchesReason = true;
            if (filters.reason !== 'all') {
                if (type === 'rtv') {
                    matchesReason = item.reason === filters.reason;
                } else if (type === 'claim') {
                    matchesReason = item.cause === filters.reason;
                }
            }
            return matchesSearch && matchesStatus && matchesReason;
        });
    };

    const filteredReturns = filterItems(data.returns, 'rtv');
    const filteredClaims = filterItems(data.claims, 'claim');
    const filteredDocs = filterItems(data.debitCredit, 'doc');

    setFilteredData({ returns: filteredReturns, claims: filteredClaims, docs: filteredDocs });
  }, [data, filters]); // Active tab is handled by rendering specific table, not filtering all data.

  const renderReturnsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>RTV ID</TableHead>
          <TableHead>PO</TableHead>
          <TableHead>GRN</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>SLA</TableHead>
          <TableHead>Refund</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.returns.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="text-center text-gray-500 py-8">
              No se encontraron devoluciones que coincidan con los filtros.
            </TableCell>
          </TableRow>
        ) : (
          filteredData.returns.map((rtv) => {
            const statusConfig = getStatusConfig(rtv.status, 'rtv');
            const StatusIcon = statusConfig.icon;
            
            return (
              <TableRow key={rtv.id}>
                <TableCell className="font-medium">{rtv.id}</TableCell>
                <TableCell>{rtv.po_id}</TableCell>
                <TableCell>{rtv.grn_id}</TableCell>
                <TableCell>{rtv.sku}</TableCell>
                <TableCell>{rtv.qty}</TableCell>
                <TableCell>{getReasonBadge(rtv.reason)}</TableCell>
                <TableCell>
                  <Badge className={statusConfig.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.text}
                  </Badge>
                </TableCell>
                <TableCell>{getSLABadge(rtv.sla_due, rtv.status)}</TableCell>
                <TableCell>{rtv.currency} {rtv.refund_amount.toLocaleString('es-ES')}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAction('print_labels', rtv.id)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Imprimir Etiquetas
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('schedule_pickup', rtv.id)}>
                        <Truck className="mr-2 h-4 w-4" />
                        Programar Recogida
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleAction('approve_refund', rtv.id)}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Aprobar Reembolso
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('post_gl', rtv.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Contabilizar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  const renderClaimsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Claim ID</TableHead>
          <TableHead>SPO</TableHead>
          <TableHead>Lane</TableHead>
          <TableHead>Cause</TableHead>
          <TableHead>Evidence</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Penalty</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.claims.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-gray-500 py-8">
              No se encontraron claims que coincidan con los filtros.
            </TableCell>
          </TableRow>
        ) : (
          filteredData.claims.map((claim) => {
            const statusConfig = getStatusConfig(claim.status, 'claim');
            const StatusIcon = statusConfig.icon;
            
            return (
              <TableRow key={claim.id}>
                <TableCell className="font-medium">{claim.id}</TableCell>
                <TableCell>{claim.spo_id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    {claim.lane}
                  </div>
                </TableCell>
                <TableCell>{getReasonBadge(claim.cause)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {claim.epod_attached && <Badge variant="outline" className="text-xs">ePOD</Badge>}
                    <span className="text-sm">{claim.evidence_count} docs</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusConfig.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.text}
                  </Badge>
                </TableCell>
                <TableCell>{claim.currency} {claim.penalty_amount.toLocaleString('es-ES')}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAction('attach_epod', claim.id)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Adjuntar ePOD
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('apply_penalty', claim.id)}>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Aplicar Penalidad
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleAction('escalate', claim.id)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Escalar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('post_gl', claim.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Contabilizar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  const renderDocsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Doc ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Counterparty</TableHead>
          <TableHead>Base Doc</TableHead>
          <TableHead>Tax</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.docs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-gray-500 py-8">
              No se encontraron documentos que coincidan con los filtros.
            </TableCell>
          </TableRow>
        ) : (
          filteredData.docs.map((doc) => {
            const statusConfig = getStatusConfig(doc.status, 'doc');
            const StatusIcon = statusConfig.icon;
            
            return (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.id}</TableCell>
                <TableCell>
                  <Badge className={doc.type === 'debit' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                    {doc.type.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{doc.counterparty}</TableCell>
                <TableCell>
                  <Badge variant="outline">{doc.base_doc}</Badge>
                </TableCell>
                <TableCell>{doc.currency} {doc.tax.toLocaleString('es-ES')}</TableCell>
                <TableCell className="font-semibold">{doc.currency} {doc.total.toLocaleString('es-ES')}</TableCell>
                <TableCell>
                  <Badge className={statusConfig.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.text}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!doc.ubl_generated && (
                        <DropdownMenuItem onClick={() => handleAction('generate_ubl', doc.id)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Generar UBL
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleAction('send_to_vendor', doc.id)}>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar a Proveedor
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleAction('register_response', doc.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Registrar Respuesta
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('close', doc.id)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Cerrar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: TRUSTPORT_TOKENS.colors.background }}>
        <RefreshCw className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: TRUSTPORT_TOKENS.colors.background, minHeight: '100vh', padding: '1.5rem' }}>
      {/* Header */}
      <div className="p-6 rounded-lg" style={{ backgroundColor: '#F1F0EC' }}>
        <h1 className="text-[28px] font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Devoluciones y Notas Debito
        </h1>
        <p className="text-gray-500 mt-1 text-[14px] font-medium">
          RTV, claims y ajuste fiscal.
        </p>
      </div>

      {/* KPIs */}
      <WorkbenchKPIs kpis={kpis} />

      {/* AI Insights Band */}
      <AIInsightsBand onActionClick={handleAIAction} />

      {/* Filter Section */}
      <Card style={getTrustportCardStyle()}>
        <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="col-span-full lg:col-span-2 relative">
                    <Search className="w-4 h-4 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <Input
                        placeholder="Buscar RTV, Claim, Documento..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="pl-8"
                    />
                </div>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Estados</SelectItem>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="requested">Solicitada</SelectItem>
                        <SelectItem value="approved">Aprobada</SelectItem>
                        <SelectItem value="issued">Emitida</SelectItem> {/* Added for docs */}
                        <SelectItem value="submitted">Enviada</SelectItem> {/* Added for claims */}
                        <SelectItem value="in_transit">En Tránsito</SelectItem> {/* Added for RTV */}
                        <SelectItem value="under_review">En Revisión</SelectItem> {/* Added for claims */}
                        <SelectItem value="received">Recibida</SelectItem> {/* Added for RTV */}
                        <SelectItem value="acknowledged">Confirmada</SelectItem> {/* Added for docs */}
                        <SelectItem value="posted">Contabilizada</SelectItem> {/* Added for docs */}
                        <SelectItem value="paid">Cobrada/Pagada</SelectItem> {/* Added for docs */}
                        <SelectItem value="rejected">Rechazada</SelectItem> {/* Added for claims */}
                        <SelectItem value="cancelled">Cancelada</SelectItem> {/* Added for RTV/Docs */}
                        <SelectItem value="closed">Cerrada</SelectItem>
                    </SelectContent>
                </Select>
                 <Select value={filters.reason} onValueChange={(value) => setFilters({ ...filters, reason: value })}>
                    <SelectTrigger><SelectValue placeholder="Causal" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las Causales</SelectItem>
                        <SelectItem value="quality">Calidad</SelectItem>
                        <SelectItem value="damage">Daño</SelectItem>
                        <SelectItem value="late_delivery">Entrega Tardía</SelectItem>
                        <SelectItem value="shortage">Faltante</SelectItem>
                        <SelectItem value="overage">Sobrante</SelectItem>
                        <SelectItem value="wrong_item">Item Incorrecto</SelectItem>
                        <SelectItem value="pricing">Precio</SelectItem>
                        <SelectItem value="no_show">No Show</SelectItem>
                        <SelectItem value="detour">Desvío</SelectItem>
                        <SelectItem value="waiting_time">Tiempo Espera</SelectItem>
                        <SelectItem value="surcharge_dispute">Disputa Recargo</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={() => setFilters({ search: '', status: 'all', reason: 'all' })} variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Limpiar
                </Button>
            </div>
        </CardContent>
    </Card>

      {/* Main Workbench */}
      <Card style={getTrustportCardStyle()}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="returns">Devoluciones (RTV)</TabsTrigger>
                <TabsTrigger value="claims">Claims (Servicios)</TabsTrigger>
                <TabsTrigger value="docs">Notas Débito/Crédito</TabsTrigger>
                <TabsTrigger value="exceptions">Excepciones</TabsTrigger>
              </TabsList>
              <div className="flex gap-2 pl-4">
                <Button 
                  size="sm" 
                  style={{ backgroundColor: TRUSTPORT_TOKENS.colors.primary, color: 'white' }}
                >
                  Nueva Devolución
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="returns">{renderReturnsTable()}</TabsContent>
            <TabsContent value="claims">{renderClaimsTable()}</TabsContent>
            <TabsContent value="docs">{renderDocsTable()}</TabsContent>
            <TabsContent value="exceptions">
              <div className="text-center py-12 text-gray-500">No hay excepciones pendientes.</div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
