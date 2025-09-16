import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Search, Filter, RefreshCcw, Plus, PackageCheck, Download,
  ShoppingBag, ClipboardList, ShieldAlert, XOctagon,
  Check, Pause, Play, Package, Truck, Eye, Printer,
  ChevronDown, ChevronUp, Bot, AlertTriangle, TrendingUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const getChannelConfig = (channel) => {
  const configs = {
    "Shopify": { color: "bg-green-100 text-green-800", icon: "🛍️" },
    "Amazon": { color: "bg-orange-100 text-orange-800", icon: "📦" },
    "Meli": { color: "bg-yellow-100 text-yellow-800", icon: "🛒" },
    "Woo": { color: "bg-purple-100 text-purple-800", icon: "🌐" },
    "POS": { color: "bg-blue-100 text-blue-800", icon: "🏪" }
  };
  return configs[channel] || configs["Shopify"];
};

const getStatusConfig = (status) => {
  const configs = {
    "Nuevo": { color: "bg-blue-100 text-blue-800" },
    "En Revisión": { color: "bg-yellow-100 text-yellow-800" },
    "Aprobado": { color: "bg-green-100 text-green-800" },
    "En Preparación": { color: "bg-purple-100 text-purple-800" },
    "Parcialmente Cumplido": { color: "bg-orange-100 text-orange-800" },
    "Cumplido": { color: "bg-green-100 text-green-800" },
    "Cancelado": { color: "bg-red-100 text-red-800" }
  };
  return configs[status] || configs["Nuevo"];
};

const getPaymentStatusConfig = (status) => {
  const configs = {
    "Pendiente": { color: "bg-gray-100 text-gray-800" },
    "Autorizado": { color: "bg-blue-100 text-blue-800" },
    "Pagado": { color: "bg-green-100 text-green-800" },
    "Reembolsado": { color: "bg-red-100 text-red-800" }
  };
  return configs[status] || configs["Pendiente"];
};

const getRiskConfig = (level) => {
  const configs = {
    "Bajo": { color: "bg-green-100 text-green-800", width: 25 },
    "Medio": { color: "bg-yellow-100 text-yellow-800", width: 60 },
    "Alto": { color: "bg-red-100 text-red-800", width: 90 }
  };
  return configs[level] || configs["Bajo"];
};

export default function PedidosMulticanalList({ 
  onSyncNow, 
  onNewManualOrder, 
  onBulkFulfill, 
  onExportCSV 
}) {
  const [salesOrders, setSalesOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [activeTab, setActiveTab] = useState('resume');
  
  const [filters, setFilters] = useState({
    search: '',
    channel: 'all',
    status: 'all',
    payment_status: 'all',
    fulfillment_status: 'all',
    risk: 'all',
    warehouse: 'all'
  });

  // Métricas calculadas
  const metrics = {
    orders_today: salesOrders.filter(order => {
      const today = new Date().toDateString();
      return new Date(order.created_date).toDateString() === today;
    }).length,
    to_fulfill: salesOrders.filter(order => 
      order.status === "Aprobado" && order.fulfillment_status === "Sin Cumplir"
    ).length,
    on_hold: salesOrders.filter(order => order.on_hold).length,
    cancel_rate_pct: 3.2,
    delta_orders: "+5 vs ayer"
  };

  // Mock data inicial
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockSalesOrders = [
      {
        id: "SO-SH-10001",
        channel: "Shopify",
        external_id: "SH-783421",
        status: "En Revisión",
        payment_status: "Autorizado",
        fulfillment_status: "Sin Cumplir",
        on_hold: false,
        risk_score: { level: "Medio", value: 52 },
        currency: "EUR",
        totals: { 
          subtotal: 89.90, 
          tax: 18.88, 
          shipping: 4.50, 
          discount: 0, 
          grand_total: 113.28 
        },
        customer: { 
          name: "Ana Torres", 
          email: "ana@ejemplo.com", 
          phone: "+34666123456" 
        },
        billing_address: {
          name: "Ana Torres",
          address: "C/ Mayor 12, 3º A",
          city: "Madrid",
          zip: "28001",
          country: "ES"
        },
        shipping_address: {
          name: "Ana Torres",
          address: "C/ Mayor 12, 3º A", 
          city: "Madrid",
          zip: "28001",
          country: "ES"
        },
        assigned_warehouse: null,
        shipping_method: "Estándar",
        items: [
          {
            line_id: "1",
            sku: "TSHIRT-BLUE-S",
            description: "Camiseta Azul Talla S",
            qty: 2,
            uom: "ud",
            price: 19.95,
            tax_rate: 0.21,
            discount_pct: 0,
            qty_allocated: 0,
            qty_fulfilled: 0,
            backorder_qty: 1
          },
          {
            line_id: "2",
            sku: "JEANS-DARK-M",
            description: "Jeans Oscuros Talla M",
            qty: 1,
            uom: "ud",
            price: 49.99,
            tax_rate: 0.21,
            discount_pct: 0,
            qty_allocated: 1,
            qty_fulfilled: 0,
            backorder_qty: 0
          }
        ],
        tags: ["online", "promoción verano"],
        created_date: "2025-01-15T10:30:00Z",
        timeline: [
          { event: "Pedido recibido desde Shopify", at: "2025-01-15T10:30:00Z", by: "system" },
          { event: "IA-Fraude: Score 52 - Revisión manual", at: "2025-01-15T10:31:00Z", by: "IA-Fraude" }
        ]
      },
      {
        id: "SO-AMZ-55002",
        channel: "Amazon",
        external_id: "AMZ-55002",
        status: "Aprobado",
        payment_status: "Pagado",
        fulfillment_status: "Sin Cumplir",
        on_hold: false,
        risk_score: { level: "Bajo", value: 18 },
        currency: "EUR",
        totals: { 
          subtotal: 65.00, 
          tax: 13.65, 
          shipping: 0, 
          discount: 0, 
          grand_total: 78.65 
        },
        customer: { 
          name: "María López", 
          email: "maria@ejemplo.com", 
          phone: "+34677987654" 
        },
        billing_address: {
          name: "María López",
          address: "Av. Diagonal 100",
          city: "Barcelona",
          zip: "08019",
          country: "ES"
        },
        shipping_address: {
          name: "María López",
          address: "Av. Diagonal 100",
          city: "Barcelona", 
          zip: "08019",
          country: "ES"
        },
        assigned_warehouse: "BCN-01",
        shipping_method: "Express",
        items: [
          {
            line_id: "1",
            sku: "HEAD-100",
            description: "Auriculares Bluetooth",
            qty: 1,
            uom: "ud",
            price: 65.00,
            tax_rate: 0.21,
            discount_pct: 0,
            qty_allocated: 1,
            qty_fulfilled: 0,
            backorder_qty: 0
          }
        ],
        tags: ["amazon", "prime"],
        created_date: "2025-01-15T09:15:00Z",
        timeline: [
          { event: "Pedido recibido desde Amazon", at: "2025-01-15T09:15:00Z", by: "system" },
          { event: "IA-Fraude: Score 18 - Aprobado automáticamente", at: "2025-01-15T09:16:00Z", by: "IA-Fraude" },
          { event: "IA-Asignación: BCN-01 recomendado", at: "2025-01-15T09:17:00Z", by: "IA-Asignación" }
        ]
      },
      {
        id: "SO-ML-78003",
        channel: "Meli",
        external_id: "ML-78003",
        status: "En Revisión",
        payment_status: "Pendiente",
        fulfillment_status: "Sin Cumplir",
        on_hold: true,
        risk_score: { level: "Alto", value: 87 },
        currency: "EUR",
        totals: { 
          subtotal: 299.00, 
          tax: 62.79, 
          shipping: 9.99, 
          discount: 30.00, 
          grand_total: 341.78 
        },
        customer: { 
          name: "Carlos Ruiz", 
          email: "carlos@ejemplo.com", 
          phone: "+34655111222" 
        },
        billing_address: {
          name: "Carlos Ruiz",
          address: "C/ Falsa 123",
          city: "Valencia",
          zip: "46001",
          country: "ES"
        },
        shipping_address: {
          name: "Carlos Ruiz",
          address: "C/ Falsa 123",
          city: "Valencia",
          zip: "46001",
          country: "ES"
        },
        assigned_warehouse: null,
        shipping_method: "24h",
        items: [
          {
            line_id: "1",
            sku: "LAPTOP-PRO-15",
            description: "Laptop Pro 15 pulgadas",
            qty: 1,
            uom: "ud",
            price: 299.00,
            tax_rate: 0.21,
            discount_pct: 10,
            qty_allocated: 0,
            qty_fulfilled: 0,
            backorder_qty: 0
          }
        ],
        tags: ["mercadolibre", "high-value"],
        created_date: "2025-01-15T11:45:00Z",
        timeline: [
          { event: "Pedido recibido desde MercadoLibre", at: "2025-01-15T11:45:00Z", by: "system" },
          { event: "IA-Fraude: Score 87 - HOLD por alto riesgo", at: "2025-01-15T11:46:00Z", by: "IA-Fraude" }
        ]
      }
    ];

    setSalesOrders(mockSalesOrders);
    setFilteredOrders(mockSalesOrders);
    setLoading(false);
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = salesOrders;

    if (filters.search && filters.search.trim()) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.items.some(item => item.sku.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    if (filters.channel !== 'all') {
      filtered = filtered.filter(order => order.channel === filters.channel);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    if (filters.payment_status !== 'all') {
      filtered = filtered.filter(order => order.payment_status === filters.payment_status);
    }

    if (filters.fulfillment_status !== 'all') {
      filtered = filtered.filter(order => order.fulfillment_status === filters.fulfillment_status);
    }

    if (filters.risk !== 'all') {
      filtered = filtered.filter(order => order.risk_score?.level === filters.risk);
    }

    setFilteredOrders(filtered);
  }, [filters, salesOrders]);

  const handleOrderAction = (action, order) => {
    switch(action) {
      case 'approve':
        toast.success(`Pedido ${order.id} aprobado - Evento: ecom.order.approved`);
        break;
      case 'hold':
        toast.success(`Pedido ${order.id} puesto en hold`);
        break;
      case 'unhold':
        toast.success(`Hold removido de ${order.id}`);
        break;
      case 'allocate':
        toast.success(`Stock asignado para ${order.id}`);
        break;
      case 'fulfill':
        toast.success(`Fulfillment creado para ${order.id}`);
        break;
      case 'dropship':
        toast.success(`${order.id} convertido a dropship`);
        break;
      case 'cancel':
        toast.success(`Pedido ${order.id} cancelado`);
        break;
      default:
        toast.info(`Acción ${action} en ${order.id}`);
    }
  };

  const renderExpandedRow = (order) => {
    return (
      <div className="grid grid-cols-12 gap-6 p-6 bg-gray-50">
        {/* Contenido Principal - 8 columnas */}
        <div className="col-span-12 lg:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="resume">Resumen</TabsTrigger>
              <TabsTrigger value="items">Ítems</TabsTrigger>
              <TabsTrigger value="fulfillment">Cumplimiento</TabsTrigger>
              <TabsTrigger value="timeline">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="resume" className="mt-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Información del Cliente</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Nombre:</strong> {order.customer.name}</div>
                        <div><strong>Email:</strong> {order.customer.email}</div>
                        <div><strong>Teléfono:</strong> {order.customer.phone}</div>
                        <div><strong>Ciudad:</strong> {order.shipping_address.city}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Información del Pedido</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Canal:</strong> {order.channel}</div>
                        <div><strong>Total:</strong> {order.currency}{order.totals.grand_total.toFixed(2)}</div>
                        <div><strong>Método Envío:</strong> {order.shipping_method}</div>
                        <div><strong>Almacén:</strong> {order.assigned_warehouse || "Sin asignar"}</div>
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
                        <TableHead>SKU</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Asignado</TableHead>
                        <TableHead>Backorder</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items?.map((item) => (
                        <TableRow key={item.line_id}>
                          <TableCell className="font-medium">{item.sku}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>{order.currency}{item.price.toFixed(2)}</TableCell>
                          <TableCell>{item.qty_allocated}</TableCell>
                          <TableCell>
                            {item.backorder_qty > 0 && (
                              <Badge className="bg-red-100 text-red-800">
                                {item.backorder_qty} faltante
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fulfillment" className="mt-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <h5 className="font-medium">Estado de Cumplimiento</h5>
                        <p className="text-sm text-gray-600">{order.fulfillment_status}</p>
                      </div>
                      <Button 
                        onClick={() => handleOrderAction('fulfill', order)}
                        style={{ backgroundColor: '#4472C4', color: 'white' }}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Crear Fulfillment
                      </Button>
                    </div>
                    
                    {order.assigned_warehouse && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h5 className="font-medium text-green-800">Almacén Asignado</h5>
                        <p className="text-sm text-green-700">{order.assigned_warehouse}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {order.timeline?.map((event, index) => (
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

        {/* Panel Lateral IA - 4 columnas */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600" />
                Recomendaciones (IA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-800">Asignación Recomendada</h5>
                  <p className="text-sm text-blue-700">Almacén: MAD-01 (menor costo flete)</p>
                  <p className="text-xs text-blue-600">Confianza: 94%</p>
                </div>
                
                {order.items?.some(item => item.backorder_qty > 0) && (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <h5 className="font-medium text-orange-800">Backorder Detectado</h5>
                    <p className="text-sm text-orange-700">1 SKU sin stock disponible</p>
                    <Button size="sm" className="mt-2" style={{ backgroundColor: '#4472C4', color: 'white' }}>
                      Crear OC Auto
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Backorder / Abastecimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.items?.filter(item => item.backorder_qty > 0).map(item => (
                  <div key={item.line_id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{item.sku}</p>
                        <p className="text-xs text-gray-500">Faltante: {item.backorder_qty}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Crear OC
                      </Button>
                    </div>
                  </div>
                ))}
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
                <p className="text-[12px] font-medium text-gray-600">Pedidos Hoy</p>
                <p className="text-[22px] font-semibold mt-1">{metrics.orders_today}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-[12px] font-medium text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              {metrics.delta_orders}
            </div>
          </CardContent>
        </Card>

        <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] font-medium text-gray-600">Pendientes de Cumplir</p>
                <p className="text-[22px] font-semibold mt-1">{metrics.to_fulfill}</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <ClipboardList className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] font-medium text-gray-600">En Hold (Riesgo)</p>
                <p className="text-[22px] font-semibold mt-1">{metrics.on_hold}</p>
              </div>
              <div className="p-2 rounded-lg bg-red-100">
                <ShieldAlert className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] font-medium text-gray-600">Cancelación</p>
                <p className="text-[22px] font-semibold mt-1">{metrics.cancel_rate_pct}%</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-100">
                <XOctagon className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="ID, cliente, email, SKU..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-8"
              />
            </div>
            
            <Select
              value={filters.channel}
              onValueChange={(value) => setFilters({ ...filters, channel: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Canales</SelectItem>
                <SelectItem value="Shopify">Shopify</SelectItem>
                <SelectItem value="Amazon">Amazon</SelectItem>
                <SelectItem value="Meli">MercadoLibre</SelectItem>
                <SelectItem value="Woo">WooCommerce</SelectItem>
                <SelectItem value="POS">POS B2B</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="Nuevo">Nuevo</SelectItem>
                <SelectItem value="En Revisión">En Revisión</SelectItem>
                <SelectItem value="Aprobado">Aprobado</SelectItem>
                <SelectItem value="En Preparación">En Preparación</SelectItem>
                <SelectItem value="Cumplido">Cumplido</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.risk}
              onValueChange={(value) => setFilters({ ...filters, risk: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Riesgo IA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Riesgos</SelectItem>
                <SelectItem value="Bajo">Bajo</SelectItem>
                <SelectItem value="Medio">Medio</SelectItem>
                <SelectItem value="Alto">Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla Principal */}
      <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle>Pedidos Multicanal</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox />
                </TableHead>
                <TableHead></TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Ítems</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Cumplimiento</TableHead>
                <TableHead>Riesgo (IA)</TableHead>
                <TableHead>Almacén</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                    No hay pedidos con los filtros aplicados
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const channelConfig = getChannelConfig(order.channel);
                  const statusConfig = getStatusConfig(order.status);
                  const paymentConfig = getPaymentStatusConfig(order.payment_status);
                  const riskConfig = getRiskConfig(order.risk_score?.level);
                  const isExpanded = expandedRow === order.id;
                  
                  return (
                    <React.Fragment key={order.id}>
                      <TableRow className={isExpanded ? "bg-gray-50" : ""}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedItems.includes(order.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedItems([...selectedItems, order.id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== order.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedRow(isExpanded ? null : order.id)}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <Badge className={channelConfig.color}>
                            {channelConfig.icon} {order.channel}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.customer.name}</TableCell>
                        <TableCell className="text-center">{order.items?.length || 0}</TableCell>
                        <TableCell className="text-right">
                          {order.currency}{order.totals.grand_total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className={paymentConfig.color}>
                            {order.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusConfig(order.fulfillment_status).color}>
                            {order.fulfillment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={order.risk_score?.value || 0} 
                              className="w-16 h-2"
                            />
                            <Badge className={riskConfig.color} style={{ fontSize: '10px' }}>
                              {order.risk_score?.level}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{order.assigned_warehouse || "-"}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {order.status === 'En Revisión' && (
                                <DropdownMenuItem onClick={() => handleOrderAction('approve', order)}>
                                  <Check className="mr-2 h-4 w-4" />
                                  Aprobar Pedido
                                </DropdownMenuItem>
                              )}
                              {!order.on_hold && (
                                <DropdownMenuItem onClick={() => handleOrderAction('hold', order)}>
                                  <Pause className="mr-2 h-4 w-4" />
                                  Poner en Hold
                                </DropdownMenuItem>
                              )}
                              {order.on_hold && (
                                <DropdownMenuItem onClick={() => handleOrderAction('unhold', order)}>
                                  <Play className="mr-2 h-4 w-4" />
                                  Quitar Hold
                                </DropdownMenuItem>
                              )}
                              {order.status === 'Aprobado' && (
                                <DropdownMenuItem onClick={() => handleOrderAction('allocate', order)}>
                                  <Package className="mr-2 h-4 w-4" />
                                  Asignar Stock
                                </DropdownMenuItem>
                              )}
                              {order.fulfillment_status === 'Sin Cumplir' && (
                                <DropdownMenuItem onClick={() => handleOrderAction('fulfill', order)}>
                                  <PackageCheck className="mr-2 h-4 w-4" />
                                  Crear Fulfillment
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleOrderAction('dropship', order)}>
                                <Truck className="mr-2 h-4 w-4" />
                                Convertir a Dropship
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOrderAction('cancel', order)}>
                                <XOctagon className="mr-2 h-4 w-4" />
                                Cancelar Pedido
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={12} className="p-0">
                            {renderExpandedRow(order)}
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