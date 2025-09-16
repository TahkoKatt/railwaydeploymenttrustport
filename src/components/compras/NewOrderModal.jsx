import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Package, DollarSign } from "lucide-react";
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

export default function NewOrderModal({ isOpen, onClose, onSave }) {
  const [orderData, setOrderData] = useState({
    channel: '',
    customer_name: '',
    customer_id: '',
    items: [{ sku: '', name: '', qty: 1, unit_price: 0, currency: 'EUR' }],
    currency: 'EUR',
    ship_to: {
      name: '',
      address: '',
      city: '',
      zip: '',
      country: 'ES'
    }
  });

  const [saving, setSaving] = useState(false);

  const handleAddItem = () => {
    setOrderData({
      ...orderData,
      items: [...orderData.items, { sku: '', name: '', qty: 1, unit_price: 0, currency: 'EUR' }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = orderData.items.filter((_, i) => i !== index);
    setOrderData({ ...orderData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderData({ ...orderData, items: newItems });
  };

  const calculateTotal = () => {
    return orderData.items.reduce((total, item) => {
      return total + (item.qty * item.unit_price);
    }, 0);
  };

  const handleSave = async (saveAndNew = false) => {
    // Validaciones
    if (!orderData.channel) {
      toast.error("Selecciona un canal");
      return;
    }
    
    if (!orderData.customer_name.trim()) {
      toast.error("Introduce el nombre del cliente");
      return;
    }

    if (orderData.items.length === 0 || !orderData.items[0].sku) {
      toast.error("Añade al menos un producto");
      return;
    }

    // Validar que la suma de líneas coincida con el total
    const calculatedTotal = calculateTotal();
    if (calculatedTotal <= 0) {
      toast.error("El total debe ser mayor que cero");
      return;
    }

    setSaving(true);

    try {
      const newOrder = {
        ...orderData,
        total: calculatedTotal,
        status: 'Pendiente',
        risk_score: Math.floor(Math.random() * 30) + 10, // Mock score bajo para pedidos manuales
        history: [
          {
            event: 'Creado manualmente',
            at: new Date().toISOString(),
            by: 'usuario',
            meta: { channel: orderData.channel }
          }
        ]
      };

      await onSave?.(newOrder);
      
      if (saveAndNew) {
        // Reset form but keep channel
        setOrderData({
          ...orderData,
          customer_name: '',
          customer_id: '',
          items: [{ sku: '', name: '', qty: 1, unit_price: 0, currency: 'EUR' }],
          ship_to: {
            name: '',
            address: '',
            city: '',
            zip: '',
            country: 'ES'
          }
        });
        toast.success("Pedido creado. Crear otro...");
      } else {
        onClose();
        toast.success("Pedido creado exitosamente");
      }
    } catch (error) {
      toast.error("Error al crear el pedido");
    } finally {
      setSaving(false);
    }
  };

  const total = calculateTotal();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Nuevo Pedido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="channel">Canal *</Label>
                  <Select value={orderData.channel} onValueChange={(value) => setOrderData({...orderData, channel: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar canal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shopify">
                        <div className="flex items-center gap-2">
                          🛍️ Shopify
                        </div>
                      </SelectItem>
                      <SelectItem value="Amazon">
                        <div className="flex items-center gap-2">
                          📦 Amazon
                        </div>
                      </SelectItem>
                      <SelectItem value="Meli">
                        <div className="flex items-center gap-2">
                          🛒 MercadoLibre
                        </div>
                      </SelectItem>
                      <SelectItem value="Web">
                        <div className="flex items-center gap-2">
                          🌐 Tienda Web
                        </div>
                      </SelectItem>
                      <SelectItem value="POS">
                        <div className="flex items-center gap-2">
                          🏪 Punto de Venta
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="customer">Cliente *</Label>
                  <Input
                    id="customer"
                    value={orderData.customer_name}
                    onChange={(e) => setOrderData({...orderData, customer_name: e.target.value})}
                    placeholder="Nombre del cliente"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Productos */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Productos</h3>
                <Button size="sm" onClick={handleAddItem} style={{ backgroundColor: '#4472C4' }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Producto
                </Button>
              </div>

              <div className="space-y-4">
                {orderData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 p-3 border rounded-lg">
                    <div className="col-span-3">
                      <Label>SKU</Label>
                      <Input
                        value={item.sku}
                        onChange={(e) => handleItemChange(index, 'sku', e.target.value)}
                        placeholder="SKU-001"
                      />
                    </div>
                    <div className="col-span-4">
                      <Label>Nombre</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        placeholder="Nombre del producto"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Precio €</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        disabled={orderData.items.length === 1}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total:</span>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <span className="text-xl font-bold">€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dirección de Envío */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Dirección de Envío</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="shipName">Nombre</Label>
                  <Input
                    id="shipName"
                    value={orderData.ship_to.name}
                    onChange={(e) => setOrderData({
                      ...orderData,
                      ship_to: { ...orderData.ship_to, name: e.target.value }
                    })}
                    placeholder="Nombre del destinatario"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={orderData.ship_to.address}
                    onChange={(e) => setOrderData({
                      ...orderData,
                      ship_to: { ...orderData.ship_to, address: e.target.value }
                    })}
                    placeholder="Calle y número"
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={orderData.ship_to.city}
                    onChange={(e) => setOrderData({
                      ...orderData,
                      ship_to: { ...orderData.ship_to, city: e.target.value }
                    })}
                    placeholder="Madrid"
                  />
                </div>
                <div>
                  <Label htmlFor="zip">Código Postal</Label>
                  <Input
                    id="zip"
                    value={orderData.ship_to.zip}
                    onChange={(e) => setOrderData({
                      ...orderData,
                      ship_to: { ...orderData.ship_to, zip: e.target.value }
                    })}
                    placeholder="28001"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={() => handleSave(true)}
              variant="outline"
              disabled={saving}
              style={{ color: '#4472C4', borderColor: '#4472C4' }}
              className="hover:bg-blue-50"
            >
              Guardar y Crear Otro
            </Button>
            <Button 
              onClick={() => handleSave(false)}
              disabled={saving}
              style={{ backgroundColor: '#4472C4', color: '#FFFFFF' }}
              className="hover:bg-[#3461B3]"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}