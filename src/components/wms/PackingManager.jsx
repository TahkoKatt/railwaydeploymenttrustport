
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Package, Printer, Scale, Truck, Eye, CheckCircle, 
  Clock, AlertTriangle, MoreHorizontal, Filter, Scan,
  Plus, Minus, RotateCcw, Download
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Tokens Trustport v1.1
const TRUSTPORT_TOKENS = {
  colors: {
    primary: '#4472C4',
    secondary: '#DB2142',
    green: '#00A878',
    yellow: '#FFC857',
    background: '#F1F0EC',
    surface: '#FFFFFF'
  },
  fonts: { primary: 'Montserrat, sans-serif' },
  shadow: '0 8px 24px rgba(0,0,0,.08)',
  radius: '16px'
};

// Mock data según seed_data spec
const mockPackingOrders = [
  {
    order_id: 'ORD-001',
    owner_id: 'ACME',
    lines: 3,
    picked_lines: 3,
    weight_kg: 12.5,
    packages: 1,
    sscc: 'SSCC-001234567890',
    status: 'pendiente',
    eta: '14:30',
    items: [
      { sku: 'PROD-001', description: 'Monitor Samsung 24"', qty: 1, packed_qty: 0 },
      { sku: 'PROD-002', description: 'Teclado Logitech MX', qty: 1, packed_qty: 0 },
      { sku: 'PROD-003', description: 'Mouse Inalámbrico', qty: 1, packed_qty: 0 }
    ]
  },
  {
    order_id: 'ORD-002',
    owner_id: 'BETA',
    lines: 2,
    picked_lines: 2,
    weight_kg: 8.2,
    packages: 1,
    sscc: 'SSCC-001234567891',
    status: 'empaque',
    eta: '15:00',
    items: [
      { sku: 'PROD-004', description: 'Tablet 10"', qty: 2, packed_qty: 1 }
    ]
  },
  {
    order_id: 'ORD-003',
    owner_id: 'ACME',
    lines: 5,
    picked_lines: 5,
    weight_kg: 18.7,
    packages: 2,
    sscc: 'SSCC-001234567892',
    status: 'cerrado',
    eta: '13:45',
    items: [
      { sku: 'PROD-005', description: 'Impresora Láser', qty: 1, packed_qty: 1 },
      { sku: 'PROD-006', description: 'Cables USB', qty: 4, packed_qty: 4 }
    ]
  }
];

const mockKPIs = {
  orders_pending: 6,
  avg_pack_time: 8.5,
  labels_printed: 24,
  weight_exceptions: 1
};

const mockPackages = [
  { package_id: 'PKG-001', sscc: 'SSCC-001234567890', items: 3, weight_kg: 12.5 },
  { package_id: 'PKG-002', sscc: 'SSCC-001234567891', items: 2, weight_kg: 8.2 }
];

export default function PackingManager() {
  // Estado según spec base44 v1.1
  const [selectedPersona] = useState(() => localStorage.getItem('selectedPersona') || 'operador');
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState('pack');
  
  // Top filters según layout spec
  const [filters, setFilters] = useState({
    warehouse_id: 'MAD-01',
    owner_id: null,
    status: 'pendiente',
    today_only: true
  });

  // Estado del packing
  const [packingOrders, setPackingOrders] = useState(mockPackingOrders);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [scanInput, setScanInput] = useState('');
  const [scaleWeight, setScaleWeight] = useState(0);
  const [labelTemplate, setLabelTemplate] = useState('SSCC_100x150');
  const [kpis, setKpis] = useState(mockKPIs);

  // Aplicar filtros de persona al montar
  useEffect(() => {
    const getPersonaConfig = () => {
      const configs = {
        comerciante: {
          default_filters: { status: 'pendiente' },
          quick_actions: ['close_and_handoff_selected'],
          kpi_priority: ['orders_pending', 'avg_pack_time', 'labels_printed', 'weight_exceptions']
        },
        operador: {
          default_filters: { status: 'empaque' },
          quick_actions: ['print_sscc_bulk', 'weigh'],
          kpi_priority: ['avg_pack_time', 'labels_printed', 'orders_pending', 'weight_exceptions']
        }
      };
      return configs[selectedPersona] || configs.operador;
    };

    const config = getPersonaConfig();
    setFilters(prev => ({ ...prev, ...config.default_filters }));
  }, [selectedPersona]);

  // Filtrar órdenes según filtros activos
  const filteredOrders = packingOrders.filter(order => {
    const statusMatch = filters.status === 'all' || order.status === filters.status;
    const ownerMatch = !filters.owner_id || order.owner_id === filters.owner_id;
    return statusMatch && ownerMatch;
  });

  // API handlers según spec v1.1
  const handleScan = async (value) => {
    try {
      console.log('[WMS-API] Scanning:', { value });
      setScanInput(value);
      toast.success(`Escaneado: ${value}`);
    } catch (error) {
      toast.error('Error en escaneo');
    }
  };

  const handleWeigh = async (orderId, packageId = null) => {
    try {
      // POST /wms/packing/{order_id}/weigh
      const payload = {
        package_id: packageId,
        gross_kg: scaleWeight,
        tare_kg: 0.5
      };
      console.log('[WMS-API] Weighing:', { orderId, payload });
      
      const updatedOrders = packingOrders.map(order =>
        order.order_id === orderId ? { ...order, weight_kg: scaleWeight } : order
      );
      setPackingOrders(updatedOrders);
      toast.success(`Peso registrado: ${scaleWeight} kg`);
    } catch (error) {
      toast.error('Error registrando peso');
    }
  };

  const handlePrintSSCC = async (orderIds = null) => {
    try {
      const endpoint = orderIds ? 
        'POST /wms/labels/print-batch' : 
        'POST /wms/labels/print';
        
      console.log('[WMS-API] Printing SSCC:', { endpoint, orderIds, template: labelTemplate });
      toast.success('Etiquetas SSCC enviadas a impresora');
      
      // Actualizar KPI
      setKpis(prev => ({ ...prev, labels_printed: prev.labels_printed + (orderIds?.length || 1) }));
    } catch (error) {
      toast.error('Error imprimiendo etiquetas');
    }
  };

  const handleCloseAndHandoff = async (orderIds) => {
    try {
      // POST /wms/packing/close-batch con Idempotency-Key
      console.log('[WMS-API] Closing batch and handoff to TMS:', { orderIds });
      
      const updatedOrders = packingOrders.map(order =>
        orderIds.includes(order.order_id) ? { ...order, status: 'cerrado' } : order
      );
      setPackingOrders(updatedOrders);
      setSelectedOrders([]);
      
      toast.success(`${orderIds.length} órdenes cerradas y enviadas a TMS`);
      
      // Actualizar KPIs
      setKpis(prev => ({ 
        ...prev, 
        orders_pending: prev.orders_pending - orderIds.length 
      }));
    } catch (error) {
      toast.error('Error cerrando órdenes');
    }
  };

  const handleAddItem = async (orderId, packageId, itemData) => {
    try {
      // POST /wms/packing/{order_id}/packages/{package_id}/items
      console.log('[WMS-API] Adding item:', { orderId, packageId, itemData });
      toast.success(`Item añadido: ${itemData.sku}`);
    } catch (error) {
      toast.error('Error añadiendo item');
    }
  };

  const handleRemoveItem = async (orderId, packageId, itemId) => {
    try {
      // DELETE /wms/packing/{order_id}/packages/{package_id}/items/{item_id}
      console.log('[WMS-API] Removing item:', { orderId, packageId, itemId });
      toast.success('Item removido');
    } catch (error) {
      toast.error('Error removiendo item');
    }
  };

  const handleCompletePacking = async (orderId) => {
    try {
      // Generar SSCC y completar empaque
      const sscc = `00123456789${Math.random().toString().substr(2, 8)}`;
      
      // Eventos para QA
      console.log('[WMS-EVT] wms.packing.completed.v1:', {
        order_id: orderId,
        sscc: sscc,
        status: 'ready_to_ship'
      });
      
      console.log('[WMS-EVT] wms.label.printed.v1:', {
        sscc: sscc,
        zpl_payload: `^XA^FO50,50^A0N,50,50^FD${sscc}^FS^XZ`
      });

      toast.success(`Empaque completado - SSCC: ${sscc}`);
    } catch (error) {
      toast.error('Error completando empaque');
    }
  };

  const getStatusBadge = (status) => {
    const badgeMap = {
      pendiente: { bg: 'bg-blue-100', color: 'text-blue-600', label: 'Pendiente' },
      empaque: { bg: 'bg-yellow-100', color: 'text-yellow-600', label: 'Empaque' },
      cerrado: { bg: 'bg-green-100', color: 'text-green-600', label: 'Cerrado' },
      bloqueado: { bg: 'bg-red-100', color: 'text-red-600', label: 'Bloqueado' }
    };
    return badgeMap[status] || badgeMap.pendiente;
  };

  const handleBulkAction = (action) => {
    if (selectedOrders.length === 0) {
      toast.error('Selecciona al menos una orden');
      return;
    }

    switch(action) {
      case 'print_sscc_bulk':
        handlePrintSSCC(selectedOrders);
        break;
      case 'close_bulk':
        if (confirm('¿Confirmas cerrar y enviar a TMS?')) {
          handleCloseAndHandoff(selectedOrders);
        }
        break;
      case 'export_csv':
        toast.success('Exportando CSV...');
        break;
    }
  };

  return (
    <div className="space-y-6" style={{ backgroundColor: TRUSTPORT_TOKENS.colors.background, minHeight: '100vh' }}>
      {/* Top Filters según spec */}
      <Card className="bg-white shadow-sm" style={{ boxShadow: TRUSTPORT_TOKENS.shadow, borderRadius: TRUSTPORT_TOKENS.radius }}>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>

            <Select value={filters.warehouse_id} onValueChange={(value) => setFilters(prev => ({ ...prev, warehouse_id: value }))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Almacén" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MAD-01">Madrid 01</SelectItem>
                <SelectItem value="BCN-01">Barcelona 01</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.owner_id || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, owner_id: value === 'all' ? null : value }))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Cliente 3PL" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ACME">ACME Corp</SelectItem>
                <SelectItem value="BETA">Beta Inc</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {['pendiente', 'empaque', 'cerrado'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilters(prev => ({ ...prev, status }))}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filters.status === status
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="today_only"
                checked={filters.today_only}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, today_only: checked }))}
              />
              <Label htmlFor="today_only" className="text-sm">Solo hoy</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Layout con 3 panes según spec */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Pane 1: Orders Table */}
        <div className="col-span-12 lg:col-span-6">
          <Card className="bg-white shadow-sm" style={{ boxShadow: TRUSTPORT_TOKENS.shadow, borderRadius: TRUSTPORT_TOKENS.radius }}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[18px] font-semibold" style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
                  Órdenes para empaque
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('print_sscc_bulk')}
                    disabled={selectedOrders.length === 0}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir SSCC
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleBulkAction('close_bulk')}
                    disabled={selectedOrders.length === 0}
                    style={{ backgroundColor: TRUSTPORT_TOKENS.colors.primary }}
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Cerrar y enviar a TMS
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedOrders(filteredOrders.map(o => o.order_id));
                          } else {
                            setSelectedOrders([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead style={{ width: '140px' }}>Orden</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Líneas</TableHead>
                    <TableHead className="text-right">Pick OK</TableHead>
                    <TableHead className="text-right">Peso kg</TableHead>
                    <TableHead className="text-right">Bultos</TableHead>
                    <TableHead>SSCC</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const statusConfig = getStatusBadge(order.status);
                    const isSelected = selectedOrders.includes(order.order_id);
                    
                    return (
                      <TableRow key={order.order_id}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedOrders([...selectedOrders, order.order_id]);
                              } else {
                                setSelectedOrders(selectedOrders.filter(id => id !== order.order_id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{order.order_id}</TableCell>
                        <TableCell>{order.owner_id}</TableCell>
                        <TableCell className="text-right">{order.lines}</TableCell>
                        <TableCell className="text-right">{order.picked_lines}</TableCell>
                        <TableCell className="text-right">{order.weight_kg}</TableCell>
                        <TableCell className="text-right">{order.packages}</TableCell>
                        <TableCell className="font-mono text-xs">{order.sscc}</TableCell>
                        <TableCell>
                          <Badge className={`${statusConfig.bg} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.eta}
                          {/* Add a button here to call handleCompletePacking for testing */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleCompletePacking(order.order_id)}
                            title="Test Complete Packing (QA)"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Abrir
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleWeigh(order.order_id)}>
                                <Scale className="w-4 h-4 mr-2" />
                                Pesar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePrintSSCC([order.order_id])}>
                                <Printer className="w-4 h-4 mr-2" />
                                Imprimir SSCC
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCloseAndHandoff([order.order_id])}>
                                <Truck className="w-4 h-4 mr-2" />
                                Cerrar y handoff
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Pane 2: Workbench */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="bg-white shadow-sm" style={{ boxShadow: TRUSTPORT_TOKENS.shadow, borderRadius: TRUSTPORT_TOKENS.radius }}>
            <CardHeader>
              <CardTitle className="text-[18px] font-semibold" style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
                Estación de empaque
              </CardTitle>
              <div className="flex border-b border-gray-200">
                {['pack', 'labels'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveWorkbenchTab(tab)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeWorkbenchTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'pack' ? 'Empaque' : 'Etiquetas'}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {activeWorkbenchTab === 'pack' && (
                <div className="space-y-4">
                  {/* Scan Input */}
                  <div>
                    <Label>Scan SKU o SSCC</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        placeholder="Escanear código..."
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleScan(scanInput)}
                      />
                      <Button onClick={() => handleScan(scanInput)}>
                        <Scan className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Scale Widget */}
                  <div>
                    <Label>Balanza (kg)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="number"
                        step="0.1"
                        value={scaleWeight}
                        onChange={(e) => setScaleWeight(parseFloat(e.target.value) || 0)}
                        placeholder="0.0"
                      />
                      <Button onClick={() => setScaleWeight(scaleWeight + 0.1)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Tolerancia: ±2%</p>
                  </div>

                  {/* Packages Table */}
                  <div>
                    <Label>Paquetes</Label>
                    <Table className="mt-1">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Paquete</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Peso kg</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockPackages.map((pkg) => (
                          <TableRow key={pkg.package_id}>
                            <TableCell className="font-mono text-xs">{pkg.sscc}</TableCell>
                            <TableCell>{pkg.items}</TableCell>
                            <TableCell>{pkg.weight_kg}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Añadir
                    </Button>
                    <Button size="sm" variant="outline">
                      <Minus className="w-4 h-4 mr-2" />
                      Quitar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Scale className="w-4 h-4 mr-2" />
                      Pesar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Printer className="w-4 h-4 mr-2" />
                      SSCC
                    </Button>
                  </div>
                </div>
              )}

              {activeWorkbenchTab === 'labels' && (
                <div className="space-y-4">
                  {/* Label Preset */}
                  <div>
                    <Label>Plantilla de etiqueta</Label>
                    <Select value={labelTemplate} onValueChange={setLabelTemplate}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SSCC_100x150">SSCC 100x150</SelectItem>
                        <SelectItem value="SSCC_100x100">SSCC 100x100</SelectItem>
                        <SelectItem value="SHIP_100x150">Envío 100x150</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Printer Select */}
                  <div>
                    <Label>Impresora</Label>
                    <Select defaultValue="printer_01">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="printer_01">Zebra ZT410 (Empaque 1)</SelectItem>
                        <SelectItem value="printer_02">Zebra ZT610 (Empaque 2)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button 
                      size="sm" 
                      onClick={() => handlePrintSSCC()}
                      style={{ backgroundColor: TRUSTPORT_TOKENS.colors.primary }}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimir SSCC
                    </Button>
                    <Button size="sm" variant="outline">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reimprimir último
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pane 3: KPIs */}
        <div className="col-span-12 lg:col-span-2">
          <Card className="bg-white shadow-sm" style={{ boxShadow: TRUSTPORT_TOKENS.shadow, borderRadius: TRUSTPORT_TOKENS.radius }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold" style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
                KPIs de packing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="text-xl font-bold text-blue-900">{kpis.orders_pending}</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">Órdenes pendientes</p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span className="text-xl font-bold text-green-900">{kpis.avg_pack_time}</span>
                </div>
                <p className="text-sm text-green-700 mt-1">Tiempo medio pack (min)</p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Printer className="w-5 h-5 text-purple-600" />
                  <span className="text-xl font-bold text-purple-900">{kpis.labels_printed}</span>
                </div>
                <p className="text-sm text-purple-700 mt-1">Etiquetas impresas</p>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span className="text-xl font-bold text-orange-900">{kpis.weight_exceptions}</span>
                </div>
                <p className="text-sm text-orange-700 mt-1">Excepciones de peso</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalle de orden {selectedOrder.order_id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cliente</Label>
                  <p className="font-medium">{selectedOrder.owner_id}</p>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Badge className={`${getStatusBadge(selectedOrder.status).bg} ${getStatusBadge(selectedOrder.status).color}`}>
                    {getStatusBadge(selectedOrder.status).label}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label>Items</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Empacado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{item.sku}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.qty}</TableCell>
                        <TableCell>{item.packed_qty}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
