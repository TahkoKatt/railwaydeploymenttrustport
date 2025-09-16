import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, X, Ship, Plane, Package } from "lucide-react";

const RoutingOrderDetail = ({ routingOrder, open, onClose }) => {
  if (!routingOrder) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Detalle S/I - {routingOrder.codigo}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Shipper</h4>
            <p className="font-medium">{routingOrder.shipper.name}</p>
            <p className="text-sm text-gray-600">{routingOrder.shipper.address}</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Consignee</h4>
            <p className="font-medium">{routingOrder.consignee.name}</p>
            <p className="text-sm text-gray-600">{routingOrder.consignee.address}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div>
            <h4 className="font-semibold mb-2">Commodity</h4>
            <p className="text-sm">{routingOrder.commodity}</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Containers</h4>
            <p className="text-sm">{routingOrder.containers}</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Delivery Terms</h4>
            <p className="text-sm">{routingOrder.deliveryTerms}</p>
          </div>
        </div>

        {routingOrder.specialInstructions && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Special Instructions</h4>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm">{routingOrder.specialInstructions}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const GenerateRoutingOrderModal = ({ open, onClose, onGenerate }) => {
  const [salesOrder, setSalesOrder] = useState('');
  const [transportMode, setTransportMode] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleGenerate = () => {
    if (!salesOrder || !transportMode) {
      alert('Por favor complete los campos obligatorios');
      return;
    }
    
    onGenerate({
      salesOrder,
      transportMode,
      specialInstructions
    });
    
    // Reset form
    setSalesOrder('');
    setTransportMode('');
    setSpecialInstructions('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Generar Shipping Instructions desde CRM</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="salesOrder">Sales Order CRM</Label>
            <Select value={salesOrder} onValueChange={setSalesOrder}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar SO..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SO-ES-7781">SO-ES-7781</SelectItem>
                <SelectItem value="SO-PE-3012">SO-PE-3012</SelectItem>
                <SelectItem value="SO-MX-8901">SO-MX-8901</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="transportMode">Modo de Transporte</Label>
            <Select value={transportMode} onValueChange={setTransportMode}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar modo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FCL">FCL - Full Container Load</SelectItem>
                <SelectItem value="LCL">LCL - Less Container Load</SelectItem>
                <SelectItem value="AIR">AIR - Air Freight</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="specialInstructions">Instrucciones Especiales</Label>
            <Textarea
              id="specialInstructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Instrucciones adicionales para el transitario..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleGenerate}
            style={{ backgroundColor: '#4472C4', color: 'white' }}
          >
            Generar S/I
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function RoutingOrder() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoutingOrder, setSelectedRoutingOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Mock data replicating the screenshots
  const routingOrders = [
    {
      id: 1,
      codigo: 'SI-ES-20319',
      crmSo: 'SO-ES-7781',
      modo: 'FCL',
      ruta: 'Valencia → New York',
      paisOrigen: 'ES',
      paisDestino: 'US',
      cutOffDoc: '28/8/2025 20:00',
      estado: 'Validado',
      shipper: {
        name: 'Textiles Barcelona SA',
        address: 'Calle Mayor 123, Barcelona'
      },
      consignee: {
        name: 'American Imports LLC',
        address: '5th Avenue 456, New York'
      },
      commodity: 'Textile products',
      containers: '2 x 40HC',
      deliveryTerms: 'CIF New York',
      specialInstructions: 'Fragile cargo - handle with care'
    },
    {
      id: 2,
      codigo: 'SI-PE-90112',
      crmSo: 'SO-PE-3012',
      modo: 'AIR',
      ruta: 'Lima → Madrid',
      paisOrigen: 'PE',
      paisDestino: 'ES',
      cutOffDoc: '29/8/2025 18:00',
      estado: 'Enviado',
      shipper: {
        name: 'Cafe Peruano Export SAC',
        address: 'Av. Principal 789, Lima'
      },
      consignee: {
        name: 'European Coffee Imports SL',
        address: 'Calle Gran Via 321, Madrid'
      },
      commodity: 'Coffee beans',
      containers: '5 x Pallets',
      deliveryTerms: 'FOB Lima',
      specialInstructions: 'Temperature controlled transport required'
    },
    {
      id: 3,
      codigo: 'SI-MX-45678',
      crmSo: 'SO-MX-8901',
      modo: 'LCL',
      ruta: 'Veracruz → Barcelona',
      paisOrigen: 'MX',
      paisDestino: 'ES',
      cutOffDoc: '2/9/2025 19:00',
      estado: 'Borrador',
      shipper: {
        name: 'Artesanias Mexicanas SA',
        address: 'Puerto de Veracruz, Mexico'
      },
      consignee: {
        name: 'Mediterranean Imports SL',
        address: 'Puerto de Barcelona, España'
      },
      commodity: 'Handicrafts and textiles',
      containers: '1 x 20DC (Shared)',
      deliveryTerms: 'CIF Barcelona',
      specialInstructions: 'Handle with care - fragile items'
    }
  ];

  const getModeIcon = (mode) => {
    switch(mode) {
      case 'FCL':
      case 'LCL':
        return <Ship className="w-4 h-4 text-blue-600" />;
      case 'AIR':
        return <Plane className="w-4 h-4 text-purple-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (estado) => {
    const configs = {
      'Validado': 'bg-green-100 text-green-800',
      'Enviado': 'bg-blue-100 text-blue-800',
      'Borrador': 'bg-gray-100 text-gray-800'
    };
    return configs[estado] || 'bg-gray-100 text-gray-800';
  };

  const handleViewDetail = (routingOrder) => {
    setSelectedRoutingOrder(routingOrder);
    setShowDetailModal(true);
  };

  const handleGenerateRoutingOrder = (data) => {
    console.log('Generating new routing order:', data);
    // Aquí se integrará con la API
  };

  const filteredOrders = routingOrders.filter(order =>
    order.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.crmSo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#F1F0EC', minHeight: '100vh', padding: '24px' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Shipping Instructions (S/I)
            </h1>
            <p className="text-gray-500 mt-1 text-[14px] font-medium">
              Creacion y gestion de instrucciones de embarque
            </p>
          </div>
          <Button 
            onClick={() => setShowGenerateModal(true)}
            style={{ backgroundColor: '#4472C4', color: 'white' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Generar S/I
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por codigo, SO, consignatario..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select defaultValue="todos">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="validado">Validado</SelectItem>
              <SelectItem value="enviado">Enviado</SelectItem>
              <SelectItem value="borrador">Borrador</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="todos">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="FCL">FCL</SelectItem>
              <SelectItem value="LCL">LCL</SelectItem>
              <SelectItem value="AIR">AIR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle className="text-[18px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Shipping Instructions ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Codigo S/I</TableHead>
                  <TableHead>CRM SO</TableHead>
                  <TableHead>Modo</TableHead>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Cut-off Doc</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.codigo}</TableCell>
                    <TableCell>
                      <span className="text-blue-600 cursor-pointer hover:underline">
                        {order.crmSo}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getModeIcon(order.modo)}
                        <span>{order.modo}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.ruta}</p>
                        <p className="text-xs text-gray-500">
                          {order.paisOrigen} → {order.paisDestino}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.cutOffDoc.split(' ')[0]}</p>
                        <p className="text-xs text-gray-500">{order.cutOffDoc.split(' ')[1]}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(order.estado)}>
                        {order.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleViewDetail(order)}>
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Duplicar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modals */}
        <RoutingOrderDetail
          routingOrder={selectedRoutingOrder}
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        />

        <GenerateRoutingOrderModal
          open={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          onGenerate={handleGenerateRoutingOrder}
        />
      </div>
    </div>
  );
}