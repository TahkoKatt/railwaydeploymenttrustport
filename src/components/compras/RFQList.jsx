import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Filter, Plus, Users, TableIcon, Activity, ArrowRight,
  Send, Bell, Lock, Award, X, ChevronDown, ChevronUp,
  Inbox, Mail, PiggyBank, Clock, Eye, FileText,
  Calendar, DollarSign, TrendingUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const getStatusConfig = (status) => {
  const configs = {
    "Borrador": { color: "bg-gray-100 text-gray-800" },
    "Publicada": { color: "bg-blue-100 text-blue-800" },
    "En Concurso": { color: "bg-green-100 text-green-800" },
    "Cerrada": { color: "bg-yellow-100 text-yellow-800" },
    "Adjudicada": { color: "bg-purple-100 text-purple-800" },
    "Cancelada": { color: "bg-red-100 text-red-800" },
    "Convertida a OC": { color: "bg-indigo-100 text-indigo-800" }
  };
  return configs[status] || configs["Borrador"];
};

export default function RFQList({ 
  onNewRFQ, 
  onInviteSuppliers, 
  onOpenTenderBoard, 
  onStartReverseAuction, 
  onConvertToPO 
}) {
  const [rfqs, setRFQs] = useState([]);
  const [filteredRFQs, setFilteredRFQs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [activeTab, setActiveTab] = useState('resume');
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category: 'all',
    owner: 'all'
  });

  // Métricas calculadas
  const metrics = {
    open_count: rfqs.filter(rfq => ['Publicada', 'En Concurso'].includes(rfq.status)).length,
    offers_total: rfqs.reduce((sum, rfq) => sum + (rfq.offers_count || 0), 0),
    potential_saving_pct: 8.2,
    avg_cycle_hours: 72,
    delta_open: "+3 esta semana"
  };

  // Mock data inicial
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockRFQs = [
      {
        id: "RFQ-2025-0010",
        status: "En Concurso",
        source: "Requisición",
        requisition_id: "REQ-1001",
        category: "Materias Primas",
        owner_name: "Ana Torres",
        deadline: "2025-09-03T18:00:00Z",
        incoterm: "DAP",
        payment_terms: "30 días",
        invited_suppliers_count: 2,
        offers_count: 2,
        best_offer_total: 1425.00,
        ia_saving_pct: 6.4,
        items: [
          {
            line_id: "1",
            sku_or_desc: "MP-ALG-500",
            qty: 500,
            uom: "kg",
            specs: "Algodón orgánico blanco",
            max_lead_days: 12
          }
        ],
        invited_suppliers: [
          { supplier_id: "S-IBERIA", name: "Iberia Components", email: "rfq@iberia.com" },
          { supplier_id: "S-LATAM", name: "Latam Raw", email: "sales@latamraw.com" }
        ],
        weights: { price: 0.4, leadtime: 0.25, quality: 0.2, service: 0.1, terms: 0.05 },
        created_date: "2025-08-30T10:00:00Z",
        history: [
          { event: "RFQ creada", at: "2025-08-30T10:00:00Z", by: "ana.torres@company.com" },
          { event: "RFQ publicada", at: "2025-08-30T10:30:00Z", by: "system" },
          { event: "Oferta recibida de Iberia", at: "2025-09-01T10:00:00Z", by: "system" },
          { event: "Oferta recibida de Latam Raw", at: "2025-09-01T12:30:00Z", by: "system" }
        ]
      },
      {
        id: "RFQ-2025-0011",
        status: "Publicada",
        source: "Manual",
        requisition_id: null,
        category: "Electrónica",
        owner_name: "Luis Gómez",
        deadline: "2025-09-05T15:00:00Z",
        incoterm: "CPT",
        payment_terms: "Prepago",
        invited_suppliers_count: 2,
        offers_count: 0,
        best_offer_total: null,
        ia_saving_pct: null,
        items: [
          {
            line_id: "1",
            sku_or_desc: "HEAD-100",
            qty: 200,
            uom: "ud",
            specs: "Auriculares BT 5.0",
            max_lead_days: 10
          }
        ],
        invited_suppliers: [
          { supplier_id: "S-TECHDROP", name: "TechDrop Europe", email: "bids@techdrop.eu" },
          { supplier_id: "S-GADGETS", name: "Global Gadgets", email: "offers@gg.com" }
        ],
        weights: { price: 0.45, leadtime: 0.25, quality: 0.15, service: 0.1, terms: 0.05 },
        created_date: "2025-09-01T14:00:00Z",
        history: [
          { event: "RFQ creada", at: "2025-09-01T14:00:00Z", by: "luis.gomez@company.com" },
          { event: "RFQ publicada", at: "2025-09-01T14:15:00Z", by: "system" }
        ]
      },
      {
        id: "RFQ-2025-0012",
        status: "Adjudicada",
        source: "Manual",
        requisition_id: null,
        category: "Servicios Profesionales",
        owner_name: "Carmen Silva",
        deadline: "2025-08-25T12:00:00Z",
        incoterm: "N/A",
        payment_terms: "60 días",
        invited_suppliers_count: 3,
        offers_count: 3,
        best_offer_total: 2800.00,
        ia_saving_pct: 12.5,
        items: [
          {
            line_id: "1",
            sku_or_desc: "Consultoría IT - Migración Cloud",
            qty: 1,
            uom: "proyecto",
            specs: "Migración completa a AWS",
            max_lead_days: 45
          }
        ],
        invited_suppliers: [
          { supplier_id: "S-ACME", name: "ACME Consulting", email: "rfqs@acme.com" },
          { supplier_id: "S-TECH", name: "TechSolutions", email: "bid@tech.com" },
          { supplier_id: "S-CLOUD", name: "CloudExperts", email: "sales@cloud.com" }
        ],
        weights: { price: 0.3, leadtime: 0.2, quality: 0.3, service: 0.15, terms: 0.05 },
        awarded_supplier: "S-ACME",
        created_date: "2025-08-20T09:00:00Z",
        history: [
          { event: "RFQ creada", at: "2025-08-20T09:00:00Z", by: "carmen.silva@company.com" },
          { event: "RFQ adjudicada a ACME Consulting", at: "2025-08-26T16:00:00Z", by: "carmen.silva@company.com" }
        ]
      }
    ];

    setRFQs(mockRFQs);
    setFilteredRFQs(mockRFQs);
    setLoading(false);
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = rfqs;

    if (filters.search && filters.search.trim()) {
      filtered = filtered.filter(rfq => 
        rfq.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        rfq.category.toLowerCase().includes(filters.search.toLowerCase()) ||
        rfq.owner_name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(rfq => rfq.status === filters.status);
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(rfq => rfq.category === filters.category);
    }

    setFilteredRFQs(filtered);
  }, [filters, rfqs]);

  const handleRFQAction = (action, rfq) => {
    switch(action) {
      case 'publish':
        toast.success(`RFQ ${rfq.id} publicada - Evento: srm.rfq.sent`);
        break;
      case 'remind':
        toast.success(`Recordatorio enviado para RFQ ${rfq.id}`);
        break;
      case 'close':
        toast.success(`RFQ ${rfq.id} cerrada - Evento: srm.rfq.closed`);
        break;
      case 'award':
        toast.success(`RFQ ${rfq.id} adjudicada - Evento: srm.rfq.awarded`);
        break;
      case 'convert':
        toast.success(`Convirtiendo a OC - Evento: p2p.po.created`);
        onConvertToPO?.(rfq);
        break;
      case 'cancel':
        toast.success(`RFQ ${rfq.id} cancelada - Evento: srm.rfq.cancelled`);
        break;
      case 'tender_board':
        onOpenTenderBoard?.(rfq);
        break;
      case 'auction':
        onStartReverseAuction?.(rfq);
        break;
      case 'invite':
        onInviteSuppliers?.(rfq);
        break;
      default:
        toast.info(`Acción ${action} en ${rfq.id}`);
    }
  };

  const renderExpandedRow = (rfq) => {
    return (
      <div className="grid grid-cols-12 gap-6 p-6 bg-gray-50">
        {/* Contenido Principal - 8 columnas */}
        <div className="col-span-12 lg:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="resume">Resumen</TabsTrigger>
              <TabsTrigger value="items">Ítems</TabsTrigger>
              <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
              <TabsTrigger value="offers">Ofertas</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="resume" className="mt-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Información General</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Categoría:</strong> {rfq.category}</div>
                        <div><strong>Comprador:</strong> {rfq.owner_name}</div>
                        <div><strong>Incoterm:</strong> {rfq.incoterm}</div>
                        <div><strong>Pago:</strong> {rfq.payment_terms}</div>
                        <div><strong>Cierre:</strong> {new Date(rfq.deadline).toLocaleString('es-ES')}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Métricas</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Proveedores Invitados:</strong> {rfq.invited_suppliers_count}</div>
                        <div><strong>Ofertas Recibidas:</strong> {rfq.offers_count}</div>
                        {rfq.best_offer_total && (
                          <div><strong>Mejor Oferta:</strong> €{rfq.best_offer_total.toFixed(2)}</div>
                        )}
                        {rfq.ia_saving_pct && (
                          <div><strong>Ahorro IA:</strong> {rfq.ia_saving_pct}%</div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="items" className="mt-4">
              <Card>
                <CardContent className="pt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Línea</TableHead>
                        <TableHead>SKU/Descripción</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>UM</TableHead>
                        <TableHead>Especificaciones</TableHead>
                        <TableHead>Lead Max</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rfq.items?.map((item) => (
                        <TableRow key={item.line_id}>
                          <TableCell>{item.line_id}</TableCell>
                          <TableCell className="font-medium">{item.sku_or_desc}</TableCell>
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>{item.uom}</TableCell>
                          <TableCell>{item.specs}</TableCell>
                          <TableCell>{item.max_lead_days} días</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suppliers" className="mt-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {rfq.invited_suppliers?.map((supplier) => (
                      <div key={supplier.supplier_id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <p className="text-sm text-gray-500">{supplier.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-800">Invitado</Badge>
                          {rfq.offers_count > 0 && (
                            <Badge className="bg-green-100 text-green-800">Oferta Recibida</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="offers" className="mt-4">
              <Card>
                <CardContent className="pt-4">
                  {rfq.offers_count > 0 ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <h5 className="font-medium text-green-800">Iberia Components</h5>
                        <p className="text-sm text-green-700">€1,425.00 - Lead time: 10 días</p>
                        <p className="text-xs text-green-600 mt-1">Score IA: 84% (Mejor balance precio/lead)</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <h5 className="font-medium text-blue-800">Latam Raw</h5>
                        <p className="text-sm text-blue-700">€1,380.00 - Lead time: 8 días</p>
                        <p className="text-xs text-blue-600 mt-1">Score IA: 81% (Lead time mejor; revisar prepago)</p>
                      </div>
                      <Button 
                        onClick={() => handleRFQAction('tender_board', rfq)}
                        className="w-full"
                        style={{ backgroundColor: '#4472C4', color: 'white' }}
                      >
                        <TableIcon className="w-4 h-4 mr-2" />
                        Abrir Comparativa (Tender Board)
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay ofertas recibidas aún</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {rfq.history?.map((event, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.event}</p>
                          <p className="text-xs text-gray-500">{new Date(event.at).toLocaleString('es-ES')} - {event.by}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Panel Lateral SRM - 4 columnas */}
        <div className="col-span-12 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tarifario & Contratos (SRM)</CardTitle>
              <p className="text-sm text-gray-600">Precios de referencia y condiciones</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">Iberia Components</h5>
                    <Badge className="bg-green-100 text-green-800">A+</Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div><strong>Precio Ref:</strong> €2.90/kg</div>
                    <div><strong>Lead Time:</strong> 8-12 días</div>
                    <div><strong>OTIF:</strong> 94.2%</div>
                    <div><strong>Contrato:</strong> Vigente hasta 2026</div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">Latam Raw</h5>
                    <Badge className="bg-yellow-100 text-yellow-800">B</Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div><strong>Precio Ref:</strong> €3.10/kg</div>
                    <div><strong>Lead Time:</strong> 6-10 días</div>
                    <div><strong>OTIF:</strong> 87.5%</div>
                    <div><strong>Contrato:</strong> Spot</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] font-medium text-gray-600">RFQs Abiertas</p>
                <p className="text-[22px] font-semibold mt-1">{metrics.open_count}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <Inbox className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-[12px] font-medium text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              {metrics.delta_open}
            </div>
          </CardContent>
        </Card>

        <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] font-medium text-gray-600">Ofertas Recibidas</p>
                <p className="text-[22px] font-semibold mt-1">{metrics.offers_total}</p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] font-medium text-gray-600">Ahorro Potencial (IA)</p>
                <p className="text-[22px] font-semibold mt-1">{metrics.potential_saving_pct}%</p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-100">
                <PiggyBank className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] font-medium text-gray-600">Ciclo Promedio</p>
                <p className="text-[22px] font-semibold mt-1">{metrics.avg_cycle_hours}h</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="col-span-full lg:col-span-2 relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Buscar RFQ, categoría o comprador..."
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
                <SelectItem value="Borrador">Borrador</SelectItem>
                <SelectItem value="Publicada">Publicada</SelectItem>
                <SelectItem value="En Concurso">En Concurso</SelectItem>
                <SelectItem value="Cerrada">Cerrada</SelectItem>
                <SelectItem value="Adjudicada">Adjudicada</SelectItem>
                <SelectItem value="Convertida a OC">Convertida a OC</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Materias Primas">Materias Primas</SelectItem>
                <SelectItem value="Electrónica">Electrónica</SelectItem>
                <SelectItem value="Servicios Profesionales">Servicios</SelectItem>
                <SelectItem value="Logística">Logística</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setFilters({ search: '', status: 'all', category: 'all', owner: 'all' })}
              variant="outline"
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla Principal */}
      <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle>Listado de Cotizaciones (RFQ)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>RFQ</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Comprador</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Cierre</TableHead>
                <TableHead>Invitados</TableHead>
                <TableHead>Ofertas</TableHead>
                <TableHead>Mejor Oferta</TableHead>
                <TableHead>Ahorro (IA)</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRFQs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                    No hay cotizaciones (RFQ)
                  </TableCell>
                </TableRow>
              ) : (
                filteredRFQs.map((rfq) => {
                  const statusConfig = getStatusConfig(rfq.status);
                  const isExpanded = expandedRow === rfq.id;
                  
                  return (
                    <React.Fragment key={rfq.id}>
                      <TableRow className={isExpanded ? "bg-gray-50" : ""}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedRow(isExpanded ? null : rfq.id)}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{rfq.id}</TableCell>
                        <TableCell>{rfq.category}</TableCell>
                        <TableCell>{rfq.owner_name}</TableCell>
                        <TableCell>
                          <Badge className={statusConfig.color}>
                            {rfq.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(rfq.deadline).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell className="text-center">{rfq.invited_suppliers_count}</TableCell>
                        <TableCell className="text-center">{rfq.offers_count}</TableCell>
                        <TableCell className="text-right">
                          {rfq.best_offer_total ? `€${rfq.best_offer_total.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {rfq.ia_saving_pct ? `${rfq.ia_saving_pct}%` : '-'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {rfq.status === 'Borrador' && (
                                <DropdownMenuItem onClick={() => handleRFQAction('publish', rfq)}>
                                  <Send className="mr-2 h-4 w-4" />
                                  Publicar/Enviar
                                </DropdownMenuItem>
                              )}
                              {['Publicada', 'En Concurso'].includes(rfq.status) && (
                                <DropdownMenuItem onClick={() => handleRFQAction('remind', rfq)}>
                                  <Bell className="mr-2 h-4 w-4" />
                                  Recordatorio
                                </DropdownMenuItem>
                              )}
                              {rfq.offers_count >= 2 && (
                                <DropdownMenuItem onClick={() => handleRFQAction('tender_board', rfq)}>
                                  <TableIcon className="mr-2 h-4 w-4" />
                                  Comparativa
                                </DropdownMenuItem>
                              )}
                              {rfq.offers_count >= 2 && (
                                <DropdownMenuItem onClick={() => handleRFQAction('auction', rfq)}>
                                  <Activity className="mr-2 h-4 w-4" />
                                  Subasta Inversa
                                </DropdownMenuItem>
                              )}
                              {rfq.status === 'En Concurso' && (
                                <DropdownMenuItem onClick={() => handleRFQAction('award', rfq)}>
                                  <Award className="mr-2 h-4 w-4" />
                                  Adjudicar
                                </DropdownMenuItem>
                              )}
                              {rfq.status === 'Adjudicada' && (
                                <DropdownMenuItem onClick={() => handleRFQAction('convert', rfq)}>
                                  <ArrowRight className="mr-2 h-4 w-4" />
                                  Convertir a OC
                                </DropdownMenuItem>
                              )}
                              {!['Adjudicada', 'Convertida a OC', 'Cancelada'].includes(rfq.status) && (
                                <DropdownMenuItem onClick={() => handleRFQAction('cancel', rfq)}>
                                  <X className="mr-2 h-4 w-4" />
                                  Cancelar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={11} className="p-0">
                            {renderExpandedRow(rfq)}
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