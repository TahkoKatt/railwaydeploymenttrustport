import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronDown, ChevronUp, Edit, Play, X, Package,
  User, MapPin, Clock, CheckCircle, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

const getChannelConfig = (channel) => {
  const configs = {
    Shopify: { emoji: "🛍️", color: "bg-green-100 text-green-800" },
    Amazon: { emoji: "📦", color: "bg-orange-100 text-orange-800" },
    Meli: { emoji: "🛒", color: "bg-blue-100 text-blue-800" },
    Web: { emoji: "🌐", color: "bg-purple-100 text-purple-800" },
    POS: { emoji: "🏪", color: "bg-gray-100 text-gray-800" }
  };
  return configs[channel] || { emoji: "📋", color: "bg-gray-100 text-gray-800" };
};

const getStatusConfig = (status) => {
  const configs = {
    "Confirmado": { color: "bg-green-100 text-green-800", icon: CheckCircle },
    "Pendiente": { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    "En picking": { color: "bg-blue-100 text-blue-800", icon: Package },
    "Enviado": { color: "bg-purple-100 text-purple-800", icon: CheckCircle },
    "Cancelado": { color: "bg-gray-100 text-gray-800", icon: X },
    "Revisión fraude": { color: "bg-red-100 text-red-800", icon: AlertTriangle }
  };
  return configs[status] || configs["Pendiente"];
};

export default function OrdersTable({ orders = [], onEdit, onProcess, onCancel, onChangeStatus }) {
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [activeTab, setActiveTab] = useState('resume');

  const handleStatusChange = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const handleApplyStatusChange = () => {
    if (!newStatus || !changeReason.trim()) {
      toast.error("Selecciona un estado y proporciona un motivo");
      return;
    }
    
    onChangeStatus?.(selectedOrder, newStatus, changeReason);
    setShowStatusModal(false);
    setNewStatus('');
    setChangeReason('');
    setSelectedOrder(null);
    toast.success(`Estado actualizado a ${newStatus}`);
  };

  const handleRowExpand = (orderId) => {
    setExpandedRow(expandedRow === orderId ? null : orderId);
    if (expandedRow !== orderId) {
      setActiveTab('resume');
    }
  };

  const renderExpandedContent = (order) => {
    switch(activeTab) {
      case 'resume':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div>
              <h4 className="font-medium mb-3 text-gray-900">Información del Pedido</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-medium">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">€{order.total?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Score Riesgo:</span>
                  <Badge className={order.risk_score > 70 ? 'bg-red-100 text-red-800' : order.risk_score > 30 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                    {order.risk_score || 0}/100
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Creado:</span>
                  <span className="font-medium">{new Date(order.created_at || Date.now()).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-gray-900">Acciones Rápidas</h4>
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Pedido
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Package className="w-4 h-4 mr-2" />
                  Enviar a Picking
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start text-red-600">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Marcar Revisión Fraude
                </Button>
              </div>
            </div>
          </div>
        );

      case 'items':
        return (
          <div className="p-4">
            <h4 className="font-medium mb-3 text-gray-900">Productos ({order.items?.length || 0})</h4>
            <div className="space-y-3">
              {(order.items || []).map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">€{(item.unit_price || 0).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Qty: {item.qty || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div className="p-4">
            <h4 className="font-medium mb-3 text-gray-900">Dirección de Envío</h4>
            {order.ship_to ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 mt-1 text-gray-400" />
                  <div>
                    <p className="font-medium">{order.ship_to.name}</p>
                    <p className="text-gray-600">{order.ship_to.address}</p>
                    <p className="text-gray-600">{order.ship_to.city}, {order.ship_to.zip}</p>
                    <p className="text-gray-600">{order.ship_to.country}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Dirección no disponible</p>
            )}
          </div>
        );

      case 'history':
        return (
          <div className="p-4">
            <h4 className="font-medium mb-3 text-gray-900">Historial de Eventos</h4>
            <div className="space-y-3">
              {(order.history || []).map((event, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">{event.event}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.at).toLocaleDateString('es-ES')} - {event.by}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle className="text-[18px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Lista de Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '120px' }}>ID</TableHead>
                <TableHead style={{ width: '220px' }}>Cliente</TableHead>
                <TableHead style={{ width: '140px' }}>Canal</TableHead>
                <TableHead style={{ width: '160px' }}>Estado</TableHead>
                <TableHead style={{ width: '140px' }} className="text-right">Total</TableHead>
                <TableHead style={{ width: '100px' }} className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const channelConfig = getChannelConfig(order.channel);
                const statusConfig = getStatusConfig(order.status);
                const isExpanded = expandedRow === order.id;

                return (
                  <React.Fragment key={order.id}>
                    <TableRow className="cursor-pointer hover:bg-gray-50">
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>
                        <Badge className={channelConfig.color}>
                          {channelConfig.emoji} {order.channel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        €{order.total?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRowExpand(order.id)}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit?.(order)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onProcess?.(order)}
                            disabled={order.status === 'Enviado' || order.status === 'Cancelado'}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={6} className="p-0">
                          <div className="bg-gray-50 border-t">
                            {/* Tabs de expansión */}
                            <div className="flex border-b bg-white">
                              {[
                                { id: 'resume', label: 'Resumen', icon: Package },
                                { id: 'items', label: 'Productos', icon: Package },
                                { id: 'shipping', label: 'Dirección', icon: MapPin },
                                { id: 'history', label: 'Historial', icon: Clock }
                              ].map((tab) => {
                                const TabIcon = tab.icon;
                                return (
                                  <button
                                    key={tab.id}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                      activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                                    onClick={() => setActiveTab(tab.id)}
                                  >
                                    <TabIcon className="w-4 h-4" />
                                    {tab.label}
                                  </button>
                                );
                              })}
                            </div>

                            {renderExpandedContent(order)}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Cambiar Estado */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado - {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newStatus">Nuevo estado</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Confirmado">Confirmado</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="En picking">En picking</SelectItem>
                  <SelectItem value="Enviado">Enviado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                  <SelectItem value="Revisión fraude">Revisión fraude</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reason">Motivo del cambio *</Label>
              <Textarea
                id="reason"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Explica el motivo del cambio de estado..."
                className="h-20"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleApplyStatusChange}
                style={{ backgroundColor: '#4472C4', color: '#FFFFFF' }}
                className="hover:bg-[#3461B3]"
              >
                Aplicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}