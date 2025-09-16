import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Ship, Plane, Truck, Package, Calendar, DollarSign, Weight, Ruler, 
  Clock, Star, Award, CheckCircle, ArrowRight, MessageSquare, Send 
} from "lucide-react";
import { toast } from "sonner";

export default function QuotationDetail({ quote, open, onClose, onUpdate }) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [justification, setJustification] = useState('');
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  if (!quote) return null;

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

  const getStatusConfig = (status) => {
    const configs = {
      draft: { label: "Borrador", bg: "bg-gray-100", text: "text-gray-800" },
      pending: { label: "Pendiente", bg: "bg-yellow-100", text: "text-yellow-800" },
      quoted: { label: "Cotizada", bg: "bg-blue-100", text: "text-blue-800" },
      selected: { label: "Seleccionada", bg: "bg-green-100", text: "text-green-800" },
      booked: { label: "Reservada", bg: "bg-purple-100", text: "text-purple-800" },
      expired: { label: "Expirada", bg: "bg-red-100", text: "text-red-800" }
    };
    return configs[status] || configs.draft;
  };

  const formatCurrency = (amount, currency = 'EUR') => {
    if (!amount && amount !== 0) return '';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return '';
    }
  };

  const getScoreColor = (score) => {
    if (!score && score !== 0) return 'text-gray-400';
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStars = (score) => {
    if (!score && score !== 0) return null;
    const stars = Math.round(score * 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setShowSelectModal(true);
  };

  const confirmSelection = async () => {
    if (!selectedCandidate || !justification.trim()) {
      toast.error('Por favor, añade una justificación para la selección');
      return;
    }

    setIsSelecting(true);

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedQuote = {
        ...quote,
        status: 'selected',
        selected_tariff_id: selectedCandidate.tariff_id,
        selection_justification: justification
      };

      if (onUpdate) {
        onUpdate(updatedQuote);
      }
      toast.success(`Seleccionado ${selectedCandidate.carrier || 'carrier'} - ${selectedCandidate.tariff_id || 'tariff'}`);
      setShowSelectModal(false);
      setJustification('');
    } catch (error) {
      toast.error('Error al seleccionar la oferta');
    } finally {
      setIsSelecting(false);
    }
  };

  const statusConfig = getStatusConfig(quote.status);
  const candidates = (quote.candidates_json && quote.candidates_json.candidates && Array.isArray(quote.candidates_json.candidates)) 
    ? quote.candidates_json.candidates 
    : [];
  const hasSelection = quote.selected_tariff_id;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {getModeIcon(quote.shipment_mode)}
                Cotización {quote.quote_id || ''}
              </DialogTitle>
              <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0`}>
                {statusConfig.label}
              </Badge>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información del Shipment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detalles del Shipment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Cliente</p>
                    <p className="font-medium">{quote.customer_name || ''}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Modo • Incoterm</p>
                    <p className="font-medium">{quote.shipment_mode || ''} {quote.incoterm ? `• ${quote.incoterm}` : ''}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Origen</p>
                    <p className="font-medium">{quote.origin_port || ''}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Destino</p>
                    <p className="font-medium">{quote.destination_port || ''}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      ETD
                    </p>
                    <p className="font-medium">{formatDate(quote.etd)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Peso • Volumen</p>
                    <p className="font-medium">
                      {quote.weight_kg ? `${quote.weight_kg.toLocaleString()}kg` : ''} 
                      {quote.volume_cbm ? ` • ${quote.volume_cbm}cbm` : ''}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-gray-500 text-sm">Descripción de la carga</p>
                  <p className="text-sm">{quote.cargo_description || ''}</p>
                </div>

                {quote.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-gray-500 text-sm">Notas</p>
                      <p className="text-sm">{quote.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Información de Expiracion y Timing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estado y Timing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Estado</p>
                    <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0 mt-1`}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-500">Moneda</p>
                    <p className="font-medium">{quote.currency || ''}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Expira</p>
                    <p className="font-medium">{formatDate(quote.expires_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Candidatos</p>
                    <p className="font-medium">{candidates.length} ofertas</p>
                  </div>
                </div>

                {hasSelection && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-gray-500 text-sm">Selección actual</p>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{quote.selected_tariff_id}</span>
                      </div>
                      {quote.selection_justification && (
                        <p className="text-sm text-gray-600 mt-2">{quote.selection_justification}</p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lista de Candidatos/Ofertas */}
          {candidates.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">
                  Ofertas Recibidas ({candidates.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidates.map((candidate, index) => (
                    <div 
                      key={candidate.tariff_id || index} 
                      className={`border rounded-lg p-4 ${
                        candidate.tariff_id === quote.selected_tariff_id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <h4 className="font-semibold flex items-center gap-2">
                              {candidate.carrier || ''}
                              {candidate.tariff_id === quote.selected_tariff_id && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </h4>
                            <p className="text-sm text-gray-500">{candidate.tariff_id || ''}</p>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            {getScoreStars(candidate.score) && (
                              <div className="flex items-center gap-1">
                                {getScoreStars(candidate.score)}
                              </div>
                            )}
                            <span className={`text-sm font-medium ${getScoreColor(candidate.score)}`}>
                              Score: {candidate.score ? (candidate.score * 100).toFixed(0) : '0'}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              {formatCurrency(candidate.price_total, quote.currency)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {candidate.transit_time_days || ''} días tránsito
                            </p>
                          </div>

                          {candidate.tariff_id !== quote.selected_tariff_id && quote.status === 'quoted' && (
                            <Button
                              size="sm"
                              onClick={() => handleSelectCandidate(candidate)}
                              style={{ backgroundColor: '#FF8A33', color: 'white' }}
                              className="hover:opacity-90"
                            >
                              Seleccionar
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Breakdown de precios */}
                      {candidate.breakdown && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Base</p>
                              <p className="font-medium">{formatCurrency(candidate.breakdown.base, quote.currency)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">BAF</p>
                              <p className="font-medium">{formatCurrency(candidate.breakdown.baf, quote.currency)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Documentos</p>
                              <p className="font-medium">{formatCurrency(candidate.breakdown.docs, quote.currency)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Reason codes */}
                      {candidate.reason_codes && Array.isArray(candidate.reason_codes) && candidate.reason_codes.length > 0 && (
                        <div className="mt-3 flex gap-2">
                          {candidate.reason_codes.map((reason, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {(reason || '').replace('_', ' ').toLowerCase()}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {candidates.length === 0 && (
            <Card className="mt-6">
              <CardContent className="py-8">
                <div className="text-center text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">Sin ofertas disponibles</p>
                  <p className="text-sm">Las ofertas aparecerán aquí cuando los carriers respondan</p>
                </div>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación de Selección */}
      <Dialog open={showSelectModal} onOpenChange={setShowSelectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Selección</DialogTitle>
          </DialogHeader>
          
          {selectedCandidate && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{selectedCandidate.carrier || ''}</h4>
                    <p className="text-sm text-gray-500">{selectedCandidate.tariff_id || ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(selectedCandidate.price_total, quote.currency)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedCandidate.transit_time_days || ''} días
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="justification">Justificación de la selección *</Label>
                <Textarea
                  id="justification"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explica por qué seleccionas esta oferta..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSelectModal(false)}
                  disabled={isSelecting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmSelection}
                  disabled={isSelecting || !justification.trim()}
                  style={{ backgroundColor: '#FF8A33', color: 'white' }}
                  className="hover:opacity-90"
                >
                  {isSelecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Seleccionando...
                    </>
                  ) : (
                    'Confirmar Selección'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}