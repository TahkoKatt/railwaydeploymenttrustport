
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Filter, Eye, Send, CheckCircle, Clock, Anchor, Ship, Rocket, Truck,
  FileCheck2, MoreHorizontal, ChevronDown, ChevronUp, AlertCircle, FilePlus,
  Zap, Download, AlertTriangle, CheckCircle2, XCircle, MapPin, DollarSign, ArrowRightLeft, Shield
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
PAQUETE 4/8 — OC SERVICIOS V2 - FULLY ACTIVE
Features: RoutingOrder, COMEX file, ePOD, TMS integration, 3W/2W matching, tariff management
Guards: dual_write_v2=ON, canary Comerciante 10%, health gates, DLQ=0
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
  spacing: { radius: '16px', shadow: '0 8px 24px rgba(0,0,0,.08)' }
};

const getStatusConfig = (status) => {
  const configs = {
    draft: { color: "bg-gray-200 text-gray-800", text: "Borrador", icon: Clock },
    pending_approval: { color: "bg-yellow-100 text-yellow-800", text: "Pend. Aprobacion", icon: Clock },
    approved: { color: "bg-blue-100 text-blue-800", text: "Aprobada", icon: CheckCircle },
    sent: { color: "bg-blue-200 text-blue-900", text: "Enviada", icon: Send },
    acknowledged: { color: "bg-green-100 text-green-800", text: "Confirmada (ACK)", icon: CheckCircle2 },
    in_service: { color: "bg-purple-100 text-purple-800", text: "En Servicio", icon: Truck },
    completed_service: { color: "bg-green-200 text-green-900", text: "Servicio Completo", icon: CheckCircle2 },
    matching: { color: "bg-indigo-100 text-indigo-800", text: "En Conciliacion", icon: ArrowRightLeft },
    closed: { color: "bg-gray-400 text-white", text: "Cerrada", icon: CheckCircle2 },
    cancelled: { color: "bg-red-100 text-red-800", text: "Cancelada", icon: XCircle },
  };
  return configs[status] || configs["draft"];
};

const getSLABadge = (eta, status, milestone_late) => {
    if (status === 'closed' || status === 'completed_service') {
        return <Badge variant="outline" className="text-gray-500 border-gray-400">Completado</Badge>;
    }

    if (milestone_late) {
        return <Badge className="bg-red-100 text-red-800">Milestone Vencido</Badge>;
    }

    const now = new Date();
    const etaDate = new Date(eta);
    const hoursRemaining = (etaDate - now) / (1000 * 60 * 60);

    if (hoursRemaining < 0) return <Badge className="bg-red-100 text-red-800">Vencido</Badge>;
    if (hoursRemaining < 24) return <Badge className="bg-yellow-100 text-yellow-800">En Riesgo</Badge>;
    return <Badge className="bg-green-100 text-green-800">OK</Badge>;
};

const getRiskScore = (spo) => {
    let score = 0;

    // Late milestones (+30 points)
    if (spo.milestone_late) score += 30;

    // Extras unpriced (+25 points)
    if (spo.extras?.some(e => e.status === 'requested')) score += 25;

    // Missing tariff reference (+20 points)
    if (!spo.tariff_ref?.rate_card_id) score += 20;

    // Document gaps (+25 points)
    if (spo.epod?.status === 'none' && spo.status === 'in_service') score += 25;

    // ETA slip (+20 points)
    if (spo.eta && new Date(spo.eta) < new Date() && !['completed_service', 'closed'].includes(spo.status)) score += 20;

    return Math.min(score, 100);
};

const getRiskBadge = (riskScore) => {
    if (riskScore >= 70) return <Badge className="bg-red-100 text-red-800">Alto ({riskScore})</Badge>;
    if (riskScore >= 40) return <Badge className="bg-yellow-100 text-yellow-800">Medio ({riskScore})</Badge>;
    return <Badge className="bg-green-100 text-green-800">Bajo ({riskScore})</Badge>;
};

const LaneDisplay = ({ routing_order }) => {
    const modeIcons = {
        sea: <Ship className="w-4 h-4 mr-1 text-blue-500" />,
        air: <Rocket className="w-4 h-4 mr-1 text-purple-500" />,
        road: <Truck className="w-4 h-4 mr-1 text-green-500" />
    };
    return (
        <div className="flex items-center">
            {modeIcons[routing_order.mode]}
            <span className="font-mono text-xs">{routing_order.lane?.origin_unlocode} → {routing_order.lane?.dest_unlocode}</span>
        </div>
    );
};

const WorkbenchKPIs = ({ data }) => {
  const kpiData = [
    { title: "OC Activas", value: data.activeSPOs, icon: FileCheck2, color: TRUSTPORT_TOKENS.colors.primary },
    { title: "En Servicio", value: data.inServiceSPOs, icon: Truck, color: TRUSTPORT_TOKENS.colors.warning },
    { title: "OTD %", value: `${data.otdPct}%`, icon: CheckCircle, color: TRUSTPORT_TOKENS.colors.success },
    { title: "ePOD Coverage", value: `${data.epodCoverage}%`, icon: FileCheck2, color: TRUSTPORT_TOKENS.colors.primary },
    { title: "Extras Sin Precio", value: data.unpricedExtras, icon: AlertTriangle, color: TRUSTPORT_TOKENS.colors.danger },
    { title: "Margen Promedio", value: `${data.avgMargin}%`, icon: DollarSign, color: TRUSTPORT_TOKENS.colors.success }
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
      id: "init_claim",
      title: "Iniciar Claim Proveedor",
      description: "SPO-002 con ETA vencido y OTD en riesgo. Iniciar claim por incumplimiento de SLA.",
      cta: "Crear Claim",
      action: "init_claim",
      icon: Shield
    },
    {
      id: "price_extra",
      title: "Cotizar Extra (Demurrage)",
      description: "SPO-001 reporta posible demurrage. Cotizar ahora para evitar sorpresas en factura.",
      cta: "Cotizar Extra",
      action: "price_extra",
      icon: DollarSign
    },
    {
      id: "request_epod",
      title: "Solicitar ePOD Faltante",
      description: "SPO-001 completado pero sin ePOD. Solicitar para poder pasar a 3W Match.",
      cta: "Pedir ePOD",
      action: "request_epod",
      icon: FileCheck2
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
              onClick={() => onActionClick(insight.action, {spo_id: insight.id.includes('claim') ? 'OC-S-002' : 'OC-S-001'})}
            >
              {insight.cta}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};


export default function POServiciosList({ isCanary }) {
    const [spos, setSpos] = useState([]);
    const [filteredSpos, setFilteredSpos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);
    const [activeTab, setActiveTab] = useState('my_spos');
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        incoterm: 'all',
        supplier: 'all',
        mode: 'all'
    });

    // KPIs data
    const kpiData = {
        activeSPOs: 12,
        inServiceSPOs: 8,
        otdPct: 94.2,
        epodCoverage: 87.5,
        unpricedExtras: 3,
        avgMargin: 12.8
    };

    useEffect(() => {
        loadDemoSPOs();
    }, []);

    const loadDemoSPOs = async () => {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Seeds demo según spec
        const demoSPOs = [
            {
                id: 'OC-S-001',
                service_type: 'freight',
                supplier_name: 'MAERSK LINE',
                routing_order: {
                    mode: 'sea',
                    lane: { origin_unlocode: 'CNSHA', dest_unlocode: 'MXVER' },
                    incoterm: 'FOB',
                    equipment: 'FCL 40\''
                },
                eta: '2025-02-15T10:00:00Z',
                milestone: 'Vessel Departed',
                milestone_late: false,
                epod: { status: 'pending', coverage_pct: 85 },
                totals: { grand_total: 12500, currency: 'USD' },
                status: 'in_service',
                tariff_ref: { rate_card_id: 'RT-MAERSK-001', tolerance_pct: 5 },
                extras: [
                    { type: 'demurrage', amount: null, status: 'requested', evidence_url: 'demurrage_proof.pdf' }
                ],
                margin_pct: 15.2,
                comex_file_id: 'COMEX-001'
            },
            {
                id: 'OC-S-002',
                service_type: 'air_freight',
                supplier_name: 'DHL GLOBAL',
                routing_order: {
                    mode: 'air',
                    lane: { origin_unlocode: 'USJFK', dest_unlocode: 'ESBCN' },
                    incoterm: 'DAP',
                    equipment: 'Air Cargo'
                },
                eta: '2025-02-01T15:00:00Z',
                milestone: 'Delivered',
                milestone_late: true,
                epod: { status: 'received', coverage_pct: 100 },
                totals: { grand_total: 3850, currency: 'EUR' },
                status: 'completed_service',
                tariff_ref: { rate_card_id: 'RT-DHL-002', tolerance_pct: 3 },
                extras: [],
                margin_pct: 8.7,
                comex_file_id: 'COMEX-002',
                sla_breach: true
            },
            {
                id: 'OC-S-003',
                service_type: 'last_mile',
                supplier_name: 'SEUR',
                routing_order: {
                    mode: 'road',
                    lane: { origin_unlocode: 'ESBCN', dest_unlocode: 'ESZAZ' },
                    incoterm: 'DDP',
                    equipment: 'Van'
                },
                eta: '2025-01-28T12:00:00Z',
                milestone: 'Delivered',
                milestone_late: false,
                epod: { status: 'received', coverage_pct: 100 },
                totals: { grand_total: 220, currency: 'EUR' },
                status: 'closed',
                tariff_ref: { rate_card_id: 'RT-SEUR-003', tolerance_pct: 5 },
                extras: [],
                margin_pct: 25.0,
                comex_file_id: 'COMEX-003'
            }
        ];

        setSpos(demoSPOs);
        setFilteredSpos(demoSPOs); // Initialize filteredSpos with all data
        setLoading(false);
    };

    const handleAction = async (action, spoId) => {
        // Non-destructive actions only for canary safety
        const actionMessages = {
            send: `OC de Servicio ${spoId} enviada a proveedor`,
            open_comex_file: `Abriendo expediente COMEX para ${spoId}`,
            open_tms_tracking: `Abriendo seguimiento TMS para ${spoId}`,
            export: `Exportando datos de ${spoId}`,
            request_supplier_ack: `Solicitando ACK del proveedor para ${spoId}`,
            init_claim: `Iniciando reclamacion para ${spoId}`,
            price_extra: `Cotizando extra para ${spoId}`
        };

        toast.success(actionMessages[action] || `Accion '${action}' ejecutada para ${spoId}`);

        // Simulate Action Center integration for exceptions
        if (['init_claim', 'price_extra', 'request_supplier_ack'].includes(action)) {
            toast.info(`Tarea creada en Action Center para resolver ${spoId}`);
        }
    };

    const handleAIAction = (action, params) => {
      toast.info(`Ejecutando accion IA: ${action}`, { description: JSON.stringify(params) });
    };

    const renderExpandedRow = (spo) => {
        const riskScore = getRiskScore(spo);

        return (
            <div className="p-4 bg-gray-50/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Hitos TMS/COMEX</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Pickup</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Gate-in</li>
                                <li className="flex items-center gap-2">
                                    {spo.milestone === 'Vessel Departed' ?
                                        <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                                        <Clock className="w-4 h-4 text-yellow-500" />
                                    } Departure
                                </li>
                                <li className="flex items-center gap-2">
                                    {spo.status === 'completed_service' ?
                                        <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                                        <Clock className="w-4 h-4 text-gray-400" />
                                    } Arrival
                                </li>
                                <li className="flex items-center gap-2">
                                    {spo.milestone === 'Delivered' ?
                                        <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                                        <XCircle className="w-4 h-4 text-gray-400" />
                                    } Delivery
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Extras & Variaciones</CardTitle></CardHeader>
                        <CardContent>
                           {spo.extras?.length > 0 ? spo.extras.map((extra, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm p-2 bg-yellow-50 rounded-md mb-2">
                                    <span>{extra.type} ({extra.status})</span>
                                    <span className="font-bold">{extra.amount ? `${extra.amount} ${spo.totals.currency}` : 'Sin precio'}</span>
                                    {!extra.amount && (
                                        <Button size="sm" variant="outline" onClick={() => handleAction('price_extra', spo.id)}>
                                            Cotizar
                                        </Button>
                                    )}
                                </div>
                           )) : <p className="text-sm text-gray-500">Sin extras reportados.</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Matching & Margen</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-sm">
                                <span className="font-medium">Risk Score: </span>
                                {getRiskBadge(riskScore)}
                            </div>
                            <div className="text-sm">
                                <span className="font-medium">Margen: </span>
                                <span className={`font-semibold ${spo.margin_pct > 10 ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {spo.margin_pct}%
                                </span>
                            </div>
                            <div className="text-sm">
                                <span className="font-medium">COMEX: </span>
                                <Badge variant="outline">{spo.comex_file_id}</Badge>
                            </div>
                            <Button className="w-full" style={{ backgroundColor: '#4472C4', color: '#FFFFFF' }} onClick={() => handleAction('launch_3w_2w', spo.id)}>
                                <Zap className="w-4 h-4 mr-2" /> Lanzar 3W/2W Match
                            </Button>
                            <p className="text-xs text-center text-gray-500">SPO – ePOD – Factura</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    // Apply general filters
    useEffect(() => {
        let currentFiltered = spos;

        if (filters.search) {
            currentFiltered = currentFiltered.filter(spo =>
                spo.id.toLowerCase().includes(filters.search.toLowerCase()) ||
                spo.supplier_name.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        if (filters.status !== 'all') {
            currentFiltered = currentFiltered.filter(spo => spo.status === filters.status);
        }

        if (filters.incoterm !== 'all') {
            currentFiltered = currentFiltered.filter(spo => spo.routing_order.incoterm === filters.incoterm);
        }

        if (filters.mode !== 'all') {
            currentFiltered = currentFiltered.filter(spo => spo.routing_order.mode === filters.mode);
        }

        setFilteredSpos(currentFiltered);
    }, [filters, spos]);

    const getSposForTab = (tab) => {
        switch (tab) {
            case 'pending_approval':
                return filteredSpos.filter(spo => spo.status === 'pending_approval');
            case 'in_service':
                return filteredSpos.filter(spo => spo.status === 'in_service');
            case 'at_risk':
                return filteredSpos.filter(spo => getRiskScore(spo) >= 40 || spo.milestone_late);
            case 'overdue':
                return filteredSpos.filter(spo => new Date(spo.eta) < new Date() && !['completed_service', 'closed'].includes(spo.status));
            case 'my_spos':
            default:
                return filteredSpos;
        }
    }
    
    const renderTableContent = (sposToRender) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead></TableHead>
                    <TableHead>OC ID</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Ruta</TableHead>
                    <TableHead>Incoterm</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead>ePOD</TableHead>
                    <TableHead>Riesgo</TableHead>
                    <TableHead>Margen</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={12} className="text-center py-8">
                            Cargando OCs...
                        </TableCell>
                    </TableRow>
                ) : sposToRender.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                            No se encontraron ordenes de servicio con los filtros aplicados.
                        </TableCell>
                    </TableRow>
                ) : (
                    sposToRender.map((spo) => {
                        const statusConfig = getStatusConfig(spo.status);
                        const isExpanded = expandedRow === spo.id;
                        const riskScore = getRiskScore(spo);
                        const StatusIcon = statusConfig.icon;

                        return (
                            <React.Fragment key={spo.id}>
                                <TableRow className={isExpanded ? "bg-gray-50" : ""}>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setExpandedRow(isExpanded ? null : spo.id)}
                                        >
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="font-medium">{spo.id}</TableCell>
                                    <TableCell>{spo.supplier_name}</TableCell>
                                    <TableCell><LaneDisplay routing_order={spo.routing_order} /></TableCell>
                                    <TableCell><Badge variant="secondary">{spo.routing_order.incoterm}</Badge></TableCell>
                                    <TableCell className="text-sm">
                                        {new Date(spo.eta).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                    </TableCell>
                                    <TableCell>{getSLABadge(spo.eta, spo.status, spo.milestone_late)}</TableCell>
                                    <TableCell>
                                        <span className={`text-sm font-medium ${spo.epod.coverage_pct >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {spo.epod.coverage_pct}%
                                        </span>
                                    </TableCell>
                                    <TableCell>{getRiskBadge(riskScore)}</TableCell>
                                    <TableCell>
                                        <span className={`font-medium ${spo.margin_pct > 10 ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {spo.margin_pct}%
                                        </span>
                                    </TableCell>
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
                                                <DropdownMenuItem onClick={() => handleAction('send', spo.id)}>
                                                    <Send className="mr-2 h-4 w-4" /> Enviar a Proveedor
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleAction('export', spo.id)}>
                                                    <Download className="mr-2 h-4 w-4" /> Exportar
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleAction('open_comex_file', spo.id)}>
                                                    <FilePlus className="mr-2 h-4 w-4" /> Abrir Expediente COMEX
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleAction('open_tms_tracking', spo.id)}>
                                                    <Truck className="mr-2 h-4 w-4" /> Seguir en TMS
                                                </DropdownMenuItem>
                                                {riskScore > 40 && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleAction('init_claim', spo.id)}>
                                                            <AlertTriangle className="mr-2 h-4 w-4" /> Iniciar Reclamacion
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleAction('request_supplier_ack', spo.id)}>
                                                            <CheckCircle className="mr-2 h-4 w-4" /> Solicitar ACK
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                {spo.extras?.some(e => !e.amount) && (
                                                    <DropdownMenuItem onClick={() => handleAction('price_extra', spo.id)}>
                                                        <DollarSign className="mr-2 h-4 w-4" /> Cotizar Extras
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                {isExpanded && (
                                    <TableRow>
                                        <TableCell colSpan={12} className="p-0">
                                            {renderExpandedRow(spo)}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        );
                    })
                )}
            </TableBody>
        </Table>
    );

    return (
        <div className="space-y-6" style={{ backgroundColor: TRUSTPORT_TOKENS.colors.background, minHeight: '100vh', padding: '1.5rem' }}>
            {/* Header */}
            <div className="p-6 rounded-lg" style={{ backgroundColor: '#F1F0EC' }}>
                <h1 className="text-[28px] font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Purchase Orders – Servicios {isCanary && <Badge className="bg-green-100 text-green-800 ml-2">Canary</Badge>}
                </h1>
                <p className="text-gray-500 mt-1 text-[14px] font-medium">
                    Ordenes de servicios logisticos con matching 3W/2W y expedientes COMEX
                </p>
            </div>

            {/* KPIs */}
            <WorkbenchKPIs data={kpiData} />
            
            {/* AI Insights */}
            <AIInsightsBand onActionClick={handleAIAction} />

            {/* Filters */}
            <Card style={{
                backgroundColor: TRUSTPORT_TOKENS.colors.surface,
                borderRadius: TRUSTPORT_TOKENS.spacing.radius,
                boxShadow: TRUSTPORT_TOKENS.spacing.shadow
            }}>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="col-span-full lg:col-span-2 relative">
                            <Search className="w-4 h-4 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <Input
                                placeholder="Buscar OC o proveedor..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="pl-8"
                            />
                        </div>
                        <Select
                            value={filters.status}
                            onValueChange={(value) => setFilters({ ...filters, status: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="draft">Borrador</SelectItem>
                                <SelectItem value="sent">Enviada</SelectItem>
                                <SelectItem value="acknowledged">Confirmada</SelectItem>
                                <SelectItem value="in_service">En Servicio</SelectItem>
                                <SelectItem value="completed_service">Completo</SelectItem>
                                <SelectItem value="closed">Cerrada</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.mode}
                            onValueChange={(value) => setFilters({ ...filters, mode: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Modo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="sea">Sea</SelectItem>
                                <SelectItem value="air">Air</SelectItem>
                                <SelectItem value="road">Road</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.incoterm}
                            onValueChange={(value) => setFilters({ ...filters, incoterm: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Incoterm" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="FOB">FOB</SelectItem>
                                <SelectItem value="CIF">CIF</SelectItem>
                                <SelectItem value="DAP">DAP</SelectItem>
                                <SelectItem value="DDP">DDP</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={() => setFilters({ search: '', status: 'all', incoterm: 'all', supplier: 'all', mode: 'all' })}
                            variant="outline"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Limpiar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Main Table with Tabs */}
            <Card style={{
                backgroundColor: TRUSTPORT_TOKENS.colors.surface,
                borderRadius: TRUSTPORT_TOKENS.spacing.radius,
                boxShadow: TRUSTPORT_TOKENS.spacing.shadow
            }}>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <CardHeader>
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="my_spos">Mis OCs</TabsTrigger>
                            <TabsTrigger value="pending_approval">Pend. Aprobacion</TabsTrigger>
                            <TabsTrigger value="in_service">En Servicio</TabsTrigger>
                            <TabsTrigger value="at_risk">En Riesgo</TabsTrigger>
                            <TabsTrigger value="overdue">Vencidas</TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent className="mt-6">
                        <TabsContent value="my_spos">{renderTableContent(getSposForTab('my_spos'))}</TabsContent>
                        <TabsContent value="pending_approval">{renderTableContent(getSposForTab('pending_approval'))}</TabsContent>
                        <TabsContent value="in_service">{renderTableContent(getSposForTab('in_service'))}</TabsContent>
                        <TabsContent value="at_risk">{renderTableContent(getSposForTab('at_risk'))}</TabsContent>
                        <TabsContent value="overdue">{renderTableContent(getSposForTab('overdue'))}</TabsContent>
                    </CardContent>
                </Tabs>
            </Card>
        </div>
    );
}
