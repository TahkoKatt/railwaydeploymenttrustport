import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Filter, Eye, Send, CheckCircle, Clock, AlertTriangle, Package,
  MoreHorizontal, ChevronDown, ChevronUp, Download, FileCheck, Truck, 
  AlertCircle, CheckCircle2, XCircle
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
PO BIENES PREVIEW CONFIG (Read-Only):
- Flags: po_goods.dual_write_v2 = on, po_goods.ui_preview_v2 = on, po_goods.read_from_v2 = off (dark)
- Seeds: 3 POs, 2 GRN (1 con discrepancia), ASN requerido
- Smoke: columnas po_id, supplier, warehouse, eta, sla, ack_timer, risk, status, actions (non-destructive)
*/

const getStatusConfig = (status) => {
  const configs = {
    draft: { color: "bg-gray-200 text-gray-800", text: "Borrador" },
    sent: { color: "bg-blue-200 text-blue-900", text: "Enviada" },
    pending_approval: { color: "bg-yellow-100 text-yellow-800", text: "Pend. Aprobación" },
    approved: { color: "bg-green-100 text-green-800", text: "Aprobada" },
    partially_received: { color: "bg-purple-100 text-purple-800", text: "Parcialmente Recibida" },
    completed: { color: "bg-green-200 text-green-900", text: "Completada" },
    cancelled: { color: "bg-red-100 text-red-800", text: "Cancelada" },
  };
  return configs[status] || configs["draft"];
};

const getSLABadge = (eta, status) => {
    if (status === 'completed' || status === 'cancelled') {
        return <Badge variant="outline" className="text-gray-500 border-gray-400">Completado</Badge>;
    }
    
    const now = new Date();
    const etaDate = new Date(eta);
    const hoursRemaining = (etaDate - now) / (1000 * 60 * 60);
    
    if (hoursRemaining < 0) return <Badge className="bg-red-100 text-red-800">Vencido</Badge>;
    if (hoursRemaining < 24) return <Badge className="bg-yellow-100 text-yellow-800">En Riesgo</Badge>;
    return <Badge className="bg-green-100 text-green-800">OK</Badge>;
};

const getAckTimerBadge = (ackStatus, ackTimer) => {
    if (ackStatus === 'acknowledged') return <Badge className="bg-green-100 text-green-800">ACK OK</Badge>;
    if (ackStatus === 'pending') {
        const hoursLeft = ackTimer || 48;
        if (hoursLeft < 12) return <Badge className="bg-red-100 text-red-800">{hoursLeft}h restantes</Badge>;
        if (hoursLeft < 24) return <Badge className="bg-yellow-100 text-yellow-800">{hoursLeft}h restantes</Badge>;
        return <Badge className="bg-blue-100 text-blue-800">{hoursLeft}h restantes</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">N/A</Badge>;
};

const getRiskScore = (po) => {
    let score = 0;
    
    // ASN overdue (+40 points)
    if (po.asn_overdue) score += 40;
    
    // No supplier rating (+20 points)
    if (!po.supplier_rating || po.supplier_rating < 3.5) score += 20;
    
    // Critical items (+30 points)
    if (po.has_critical_items) score += 30;
    
    // Payment terms risk (+10 points)
    if (po.payment_terms === "Contado") score += 10;
    
    return Math.min(score, 100);
};

const getRiskBadge = (riskScore) => {
    if (riskScore >= 70) return <Badge className="bg-red-100 text-red-800">Alto ({riskScore})</Badge>;
    if (riskScore >= 40) return <Badge className="bg-yellow-100 text-yellow-800">Medio ({riskScore})</Badge>;
    return <Badge className="bg-green-100 text-green-800">Bajo ({riskScore})</Badge>;
};

const WarehouseDisplay = ({ warehouse }) => (
    <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-gray-500" />
        <span className="text-sm">{warehouse}</span>
    </div>
);

export default function OrdenesCompraList() {
    const [pos, setPOs] = useState([]);
    const [filteredPOs, setFilteredPOs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        warehouse: 'all',
        supplier: 'all'
    });

    useEffect(() => {
        loadDemoPOs();
    }, []);

    const loadDemoPOs = async () => {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 350));
        
        const demoPOs = [
            { 
                id: 'PO-G-001', 
                supplier_name: 'Proveedores Unidos SL',
                warehouse: 'ALM-BCN-01',
                eta: '2025-09-01T14:00:00Z',
                status: 'sent',
                amount: 15600,
                currency: 'EUR',
                ack_status: 'pending',
                ack_timer: 36,
                asn_required: true,
                asn_overdue: true,
                supplier_rating: 4.2,
                has_critical_items: true,
                payment_terms: '30 días'
            },
            { 
                id: 'PO-G-002', 
                supplier_name: 'Componentes Tech SA',
                warehouse: 'ALM-MAD-01',
                eta: '2025-08-30T10:00:00Z',
                status: 'partially_received',
                amount: 8900,
                currency: 'EUR',
                ack_status: 'acknowledged',
                ack_timer: null,
                asn_required: true,
                asn_overdue: false,
                supplier_rating: 3.8,
                has_critical_items: false,
                payment_terms: '45 días'
            },
            { 
                id: 'PO-G-003', 
                supplier_name: 'Industrial Norte SL',
                warehouse: 'ALM-SEV-01',
                eta: '2025-09-05T09:00:00Z',
                status: 'approved',
                amount: 22300,
                currency: 'EUR',
                ack_status: 'pending',
                ack_timer: 18,
                asn_required: false,
                asn_overdue: false,
                supplier_rating: 4.7,
                has_critical_items: true,
                payment_terms: 'Contado'
            }
        ];
        
        setPOs(demoPOs);
        setFilteredPOs(demoPOs);
        setLoading(false);
    };

    const handleAction = async (action, poId) => {
        // Non-destructive actions only for preview safety
        const actionMessages = {
            send: `PO ${poId} enviada a proveedor`,
            export: `Exportando datos de ${poId}`,
            open_asn: `Abriendo ASN para ${poId}`,
            open_wms_receipt: `Abriendo recepción WMS para ${poId}`,
            request_supplier_ack: `Solicitando ACK del proveedor para ${poId}`,
            expedite: `Acelerando PO ${poId}`,
            view_details: `Abriendo detalles de ${poId}`
        };
        
        toast.success(actionMessages[action] || `Acción '${action}' ejecutada para ${poId}`);
        
        // Simulate Action Center integration for exceptions
        if (['request_supplier_ack', 'expedite'].includes(action)) {
            toast.info(`Tarea creada en Action Center para resolver ${poId}`);
        }
    };

    const renderExpandedRow = (po) => {
        const riskScore = getRiskScore(po);
        
        return (
            <div className="p-4 bg-gray-50/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Estado Recepción</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    {po.asn_required ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                                    ASN Requerido
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    {po.asn_overdue ? <AlertCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                    {po.asn_overdue ? 'ASN Vencido' : 'ASN En Plazo'}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Truck className="w-4 h-4 text-blue-500" />
                                    {po.status === 'partially_received' ? '60% Recibido' : 'Pendiente Recepción'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader><CardTitle className="text-base">Proveedor & Términos</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Rating:</span>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <CheckCircle key={i} className={`w-3 h-3 ${i < Math.floor(po.supplier_rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                                        ))}
                                        <span className="ml-1">{po.supplier_rating}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span>Pago:</span>
                                    <span className="font-medium">{po.payment_terms}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Items Críticos:</span>
                                    <span className={po.has_critical_items ? 'text-red-600 font-medium' : 'text-gray-500'}>
                                        {po.has_critical_items ? 'Sí' : 'No'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader><CardTitle className="text-base">Acciones Rápidas</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full" variant="outline" onClick={() => handleAction('open_asn', po.id)}>
                                <FileCheck className="w-4 h-4 mr-2" />
                                Ver ASN
                            </Button>
                            <Button className="w-full" variant="outline" onClick={() => handleAction('open_wms_receipt', po.id)}>
                                <Package className="w-4 h-4 mr-2" />
                                Recepción WMS
                            </Button>
                            {po.ack_status === 'pending' && (
                                <Button className="w-full" style={{ backgroundColor: '#4472C4', color: '#FFFFFF' }} onClick={() => handleAction('request_supplier_ack', po.id)}>
                                    <Send className="w-4 h-4 mr-2" />
                                    Req. ACK Urgente
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    // Apply filters
    useEffect(() => {
        let filtered = pos;
        
        if (filters.search) {
            filtered = filtered.filter(po => 
                po.id.toLowerCase().includes(filters.search.toLowerCase()) ||
                po.supplier_name.toLowerCase().includes(filters.search.toLowerCase())
            );
        }
        
        if (filters.status !== 'all') {
            filtered = filtered.filter(po => po.status === filters.status);
        }
        
        if (filters.warehouse !== 'all') {
            filtered = filtered.filter(po => po.warehouse === filters.warehouse);
        }
        
        setFilteredPOs(filtered);
    }, [filters, pos]);

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="col-span-full lg:col-span-2 relative">
                            <Search className="w-4 h-4 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <Input
                                placeholder="Buscar PO o proveedor..."
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
                                <SelectItem value="approved">Aprobada</SelectItem>
                                <SelectItem value="partially_received">Parcialmente Recibida</SelectItem>
                                <SelectItem value="completed">Completada</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.warehouse}
                            onValueChange={(value) => setFilters({ ...filters, warehouse: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Almacén" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="ALM-BCN-01">ALM-BCN-01</SelectItem>
                                <SelectItem value="ALM-MAD-01">ALM-MAD-01</SelectItem>
                                <SelectItem value="ALM-SEV-01">ALM-SEV-01</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button 
                            onClick={() => setFilters({ search: '', status: 'all', warehouse: 'all', supplier: 'all' })}
                            variant="outline"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Limpiar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Main Table */}
            <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
                <CardHeader>
                    <CardTitle>PO Bienes Workbench (Preview)</CardTitle>
                    <p className="text-sm text-gray-500">
                        Órdenes de compra de bienes con ASN, recepción WMS y excepciones a Action Center.
                    </p>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead></TableHead>
                                <TableHead>PO ID</TableHead>
                                <TableHead>Proveedor</TableHead>
                                <TableHead>Almacén</TableHead>
                                <TableHead>ETA</TableHead>
                                <TableHead>SLA</TableHead>
                                <TableHead>ACK Timer</TableHead>
                                <TableHead>Riesgo</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-8">
                                        Cargando POs de bienes...
                                    </TableCell>
                                </TableRow>
                            ) : filteredPOs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                                        No se encontraron órdenes de compra con los filtros aplicados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPOs.map((po) => {
                                    const statusConfig = getStatusConfig(po.status);
                                    const isExpanded = expandedRow === po.id;
                                    const riskScore = getRiskScore(po);
                                    
                                    return (
                                        <React.Fragment key={po.id}>
                                            <TableRow className={isExpanded ? "bg-gray-50" : ""}>
                                                <TableCell>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8" 
                                                        onClick={() => setExpandedRow(isExpanded ? null : po.id)}
                                                    >
                                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </Button>
                                                </TableCell>
                                                <TableCell className="font-medium">{po.id}</TableCell>
                                                <TableCell>{po.supplier_name}</TableCell>
                                                <TableCell><WarehouseDisplay warehouse={po.warehouse} /></TableCell>
                                                <TableCell className="text-sm">
                                                    {new Date(po.eta).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                                </TableCell>
                                                <TableCell>{getSLABadge(po.eta, po.status)}</TableCell>
                                                <TableCell>{getAckTimerBadge(po.ack_status, po.ack_timer)}</TableCell>
                                                <TableCell>{getRiskBadge(riskScore)}</TableCell>
                                                <TableCell><Badge className={statusConfig.color}>{statusConfig.text}</Badge></TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleAction('view_details', po.id)}>
                                                                <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleAction('export', po.id)}>
                                                                <Download className="mr-2 h-4 w-4" /> Exportar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleAction('open_asn', po.id)}>
                                                                <FileCheck className="mr-2 h-4 w-4" /> Ver ASN
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleAction('open_wms_receipt', po.id)}>
                                                                <Package className="mr-2 h-4 w-4" /> Recepción WMS
                                                            </DropdownMenuItem>
                                                            {riskScore > 40 && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => handleAction('request_supplier_ack', po.id)}>
                                                                        <AlertTriangle className="mr-2 h-4 w-4" /> Req. ACK Urgente
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleAction('expedite', po.id)}>
                                                                        <Clock className="mr-2 h-4 w-4" /> Acelerar
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                            {isExpanded && (
                                                <TableRow>
                                                    <TableCell colSpan={10} className="p-0">
                                                        {renderExpandedRow(po)}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}