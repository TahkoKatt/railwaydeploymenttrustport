import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Ship, Plane, Truck, Package, Calendar, DollarSign, Weight, Ruler } from "lucide-react";
import { toast } from "sonner";

export default function QuotationForm({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    cargo_description: '',
    shipment_mode: '',
    incoterm: '',
    origin_port: '',
    destination_port: '',
    etd: '',
    weight_kg: '',
    volume_cbm: '',
    currency: 'EUR',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'El nombre del cliente es obligatorio';
    }

    if (!formData.cargo_description.trim()) {
      newErrors.cargo_description = 'La descripción de la carga es obligatoria';
    }

    if (!formData.shipment_mode) {
      newErrors.shipment_mode = 'Selecciona el modo de transporte';
    }

    if (!formData.incoterm) {
      newErrors.incoterm = 'Selecciona el incoterm';
    }

    if (!formData.origin_port.trim()) {
      newErrors.origin_port = 'El puerto de origen es obligatorio';
    }

    if (!formData.destination_port.trim()) {
      newErrors.destination_port = 'El puerto de destino es obligatorio';
    }

    if (!formData.etd) {
      newErrors.etd = 'La fecha ETD es obligatoria';
    }

    if (!formData.weight_kg || formData.weight_kg <= 0) {
      newErrors.weight_kg = 'El peso debe ser mayor a 0';
    }

    if (!formData.volume_cbm || formData.volume_cbm <= 0) {
      newErrors.volume_cbm = 'El volumen debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, completa todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generar ID único para la cotización
      const quoteId = `Q-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
      
      const quoteData = {
        ...formData,
        quote_id: quoteId,
        status: 'draft',
        weight_kg: parseFloat(formData.weight_kg),
        volume_cbm: parseFloat(formData.volume_cbm),
        candidates_json: { candidates: [] },
        selected_tariff_id: null,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
        owner_id: 'current-user'
      };

      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));

      onSubmit(quoteData);
      toast.success(`Cotización ${quoteId} creada exitosamente`);
      
      // Reset form
      setFormData({
        customer_name: '',
        cargo_description: '',
        shipment_mode: '',
        incoterm: '',
        origin_port: '',
        destination_port: '',
        etd: '',
        weight_kg: '',
        volume_cbm: '',
        currency: 'EUR',
        notes: ''
      });
      
      onClose();
    } catch (error) {
      toast.error('Error al crear la cotización');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModeIcon = (mode) => {
    const icons = {
      FCL: Ship,
      LCL: Ship,
      AIR: Plane,
      ROAD: Truck
    };
    const IconComponent = icons[mode] || Package;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-500" />
            Nueva Cotización COMEX
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Cliente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cliente y Carga</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer_name">Cliente *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  placeholder="Nombre del cliente o empresa"
                  className={errors.customer_name ? 'border-red-500' : ''}
                />
                {errors.customer_name && (
                  <p className="text-sm text-red-500 mt-1">{errors.customer_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cargo_description">Descripción de la Carga *</Label>
                <Textarea
                  id="cargo_description"
                  value={formData.cargo_description}
                  onChange={(e) => handleInputChange('cargo_description', e.target.value)}
                  placeholder="Descripción detallada de los productos a transportar"
                  className={errors.cargo_description ? 'border-red-500' : ''}
                  rows={3}
                />
                {errors.cargo_description && (
                  <p className="text-sm text-red-500 mt-1">{errors.cargo_description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detalles del Transporte */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Detalles del Transporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shipment_mode">Modo de Transporte *</Label>
                  <Select value={formData.shipment_mode} onValueChange={(value) => handleInputChange('shipment_mode', value)}>
                    <SelectTrigger className={errors.shipment_mode ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar modo">
                        {formData.shipment_mode && (
                          <div className="flex items-center gap-2">
                            {getModeIcon(formData.shipment_mode)}
                            {formData.shipment_mode}
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FCL">
                        <div className="flex items-center gap-2">
                          <Ship className="w-4 h-4" />
                          FCL (Full Container Load)
                        </div>
                      </SelectItem>
                      <SelectItem value="LCL">
                        <div className="flex items-center gap-2">
                          <Ship className="w-4 h-4" />
                          LCL (Less than Container Load)
                        </div>
                      </SelectItem>
                      <SelectItem value="AIR">
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4" />
                          Aéreo
                        </div>
                      </SelectItem>
                      <SelectItem value="ROAD">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          Terrestre
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.shipment_mode && (
                    <p className="text-sm text-red-500 mt-1">{errors.shipment_mode}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="incoterm">Incoterm *</Label>
                  <Select value={formData.incoterm} onValueChange={(value) => handleInputChange('incoterm', value)}>
                    <SelectTrigger className={errors.incoterm ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar incoterm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                      <SelectItem value="FCA">FCA - Free Carrier</SelectItem>
                      <SelectItem value="FOB">FOB - Free on Board</SelectItem>
                      <SelectItem value="CIF">CIF - Cost, Insurance & Freight</SelectItem>
                      <SelectItem value="DAP">DAP - Delivered at Place</SelectItem>
                      <SelectItem value="DDP">DDP - Delivered Duty Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.incoterm && (
                    <p className="text-sm text-red-500 mt-1">{errors.incoterm}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origin_port">Puerto de Origen *</Label>
                  <Input
                    id="origin_port"
                    value={formData.origin_port}
                    onChange={(e) => handleInputChange('origin_port', e.target.value)}
                    placeholder="Valencia, ES"
                    className={errors.origin_port ? 'border-red-500' : ''}
                  />
                  {errors.origin_port && (
                    <p className="text-sm text-red-500 mt-1">{errors.origin_port}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="destination_port">Puerto de Destino *</Label>
                  <Input
                    id="destination_port"
                    value={formData.destination_port}
                    onChange={(e) => handleInputChange('destination_port', e.target.value)}
                    placeholder="Callao, PE"
                    className={errors.destination_port ? 'border-red-500' : ''}
                  />
                  {errors.destination_port && (
                    <p className="text-sm text-red-500 mt-1">{errors.destination_port}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="etd">Fecha ETD *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="etd"
                      type="date"
                      value={formData.etd}
                      onChange={(e) => handleInputChange('etd', e.target.value)}
                      className={`pl-10 ${errors.etd ? 'border-red-500' : ''}`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  {errors.etd && (
                    <p className="text-sm text-red-500 mt-1">{errors.etd}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="weight_kg">Peso (kg) *</Label>
                  <div className="relative">
                    <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="weight_kg"
                      type="number"
                      value={formData.weight_kg}
                      onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                      placeholder="21000"
                      className={`pl-10 ${errors.weight_kg ? 'border-red-500' : ''}`}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  {errors.weight_kg && (
                    <p className="text-sm text-red-500 mt-1">{errors.weight_kg}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="volume_cbm">Volumen (cbm) *</Label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="volume_cbm"
                      type="number"
                      value={formData.volume_cbm}
                      onChange={(e) => handleInputChange('volume_cbm', e.target.value)}
                      placeholder="28"
                      className={`pl-10 ${errors.volume_cbm ? 'border-red-500' : ''}`}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {errors.volume_cbm && (
                    <p className="text-sm text-red-500 mt-1">{errors.volume_cbm}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currency">Moneda</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="USD">USD - Dólar</SelectItem>
                    <SelectItem value="GBP">GBP - Libra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Requisitos especiales, instrucciones adicionales..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: '#FF8A33', color: 'white' }}
              className="hover:opacity-90"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                'Crear Cotización'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}