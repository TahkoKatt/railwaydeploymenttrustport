import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Ship, Plane, Truck, Package, Search, Filter, Plus, Eye, 
  Clock, CheckCircle, AlertCircle, Calendar, DollarSign 
} from "lucide-react";
import { toast } from "sonner";

const getModeIcon = (mode) => {
  const icons = {
    FCL: Ship,
    LCL: Ship,
    AIR: Plane,
    ROAD: Truck
  };
  return icons[mode] || Package;
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

export default function QuotationsList({ onNewQuote, onViewQuote }) {
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    mode: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // Mock data inicial
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = async () => {
    setLoading(true);
    // Simular carga de datos
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockQuotes = [
      {
        id: "1",
        quote_id: "Q-2025-00067",
        status: "quoted",
        shipment_mode: "FCL",
        incoterm: "FOB",
        origin_port: "Valencia, ES",
        destination_port: "Callao, PE",
        etd: "2025-09-20",
        weight_kg: 21000,
        volume_cbm: 28,
        cargo_description: "Maquinaria industrial",
        customer_name: "Importadora Lima SAC",
        currency: "EUR",
        candidates_json: {
          candidates: [
            {
              tariff_id: "TAR-4521",
              carrier: "MSC",
              price_total: 2450,
              transit_time_days: 26,
              score: 0.86
            },
            {
              tariff_id: "TAR-4610", 
              carrier: "MAERSK",
              price_total: 2590,
              transit_time_days: 24,
              score: 0.83
            }
          ]
        },
        selected_tariff_id: "TAR-4521",
        expires_at: "2025-09-25T23:59:59Z",
        owner_id: "user-1",
        created_date: "2025-08-26T10:00:00Z"
      },
      {
        id: "2",
        quote_id: "Q-2025-00068",
        status: "pending",
        shipment_mode: "AIR",
        incoterm: "DDP",
        origin_port: "Madrid, ES",
        destination_port: "Miami, US",
        etd: "2025-09-15",
        weight_kg: 850,
        volume_cbm: 2.5,
        cargo_description: "Productos farmacéuticos",
        customer_name: "Pharma Solutions Inc",
        currency: "EUR",
        candidates_json: { candidates: [] },
        selected_tariff_id: null,
        expires_at: "2025-09-18T23:59:59Z",
        owner_id: "user-2",
        created_date: "2025-08-26T14:30:00Z"
      },
      {
        id: "3",
        quote_id: "Q-2025-00069",
        status: "selected",
        shipment_mode: "LCL",
        incoterm: "CIF",
        origin_port: "Barcelona, ES",
        destination_port: "Santos, BR",
        etd: "2025-09-25",
        weight_kg: 5200,
        volume_cbm: 12,
        cargo_description: "Repuestos automotrices",
        customer_name: "AutoParts Brasil Ltda",
        currency: "EUR",
        candidates_json: {
          candidates: [
            {
              tariff_id: "TAR-4890",
              carrier: "HAPAG LLOYD",
              price_total: 1350,
              transit_time_days: 18,
              score: 0.91
            }
          ]
        },
        selected_tariff_id: "TAR-4890",
        expires_at: "2025-09-30T23:59:59Z",
        owner_id: "user-1",
        created_date: "2025-08-25T09:15:00Z"
      }
    ];

    setQuotes(mockQuotes);
    setFilteredQuotes(mockQuotes);
    setLoading(false);
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = quotes;

    if (filters.search && filters.search.trim()) {
      filtered = filtered.filter(quote => 
        (quote.quote_id || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (quote.customer_name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (quote.origin_port || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (quote.destination_port || '').toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(quote => quote.status === filters.status);
    }

    if (filters.mode !== 'all') {
      filtered = filtered.filter(quote => quote.shipment_mode === filters.mode);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(quote => 
        quote.etd && new Date(quote.etd) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(quote => 
        quote.etd && new Date(quote.etd) <= new Date(filters.dateTo)
      );
    }

    setFilteredQuotes(filtered);
  }, [quotes, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getBestCandidate = (quote) => {
    if (!quote || !quote.candidates_json || !quote.candidates_json.candidates || !Array.isArray(quote.candidates_json.candidates) || quote.candidates_json.candidates.length === 0) {
      return null;
    }
    return quote.candidates_json.candidates.reduce((best, current) => 
      (current.score || 0) > (best.score || 0) ? current : best
    );
  };

  const formatCurrency = (amount, currency = 'EUR') => {
    if (!amount && amount !== 0) return '';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(amount);
  };

  const isExpiringSoon = (expiresAt) => {
    if (!expiresAt) return false;
    const now = new Date();
    const expires = new Date(expiresAt);
    const hoursLeft = (expires - now) / (1000 * 60 * 60);
    return hoursLeft <= 48 && hoursLeft > 0;
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar cotizaciones..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="quoted">Cotizada</SelectItem>
                <SelectItem value="selected">Seleccionada</SelectItem>
                <SelectItem value="booked">Reservada</SelectItem>
                <SelectItem value="expired">Expirada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.mode} onValueChange={(value) => handleFilterChange('mode', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Modo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los modos</SelectItem>
                <SelectItem value="FCL">FCL</SelectItem>
                <SelectItem value="LCL">LCL</SelectItem>
                <SelectItem value="AIR">Aéreo</SelectItem>
                <SelectItem value="ROAD">Terrestre</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="ETD desde"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />

            <Input
              type="date"
              placeholder="ETD hasta"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de cotizaciones */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Cotizaciones Activas ({filteredQuotes.length})
          </CardTitle>
          <Button 
            onClick={onNewQuote}
            style={{ backgroundColor: '#FF8A33', color: 'white' }}
            className="hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cotización
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Cargando cotizaciones...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cotización</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Modo</TableHead>
                  <TableHead>ETD</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Mejor Oferta</TableHead>
                  <TableHead>Expira</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => {
                  const ModeIcon = getModeIcon(quote.shipment_mode);
                  const statusConfig = getStatusConfig(quote.status);
                  const bestCandidate = getBestCandidate(quote);
                  const expiringSoon = isExpiringSoon(quote.expires_at);
                  const expired = isExpired(quote.expires_at);

                  return (
                    <TableRow key={quote.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <ModeIcon className="w-4 h-4 text-gray-500" />
                          {quote.quote_id || ''}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="font-medium">{quote.customer_name || ''}</p>
                          <p className="text-sm text-gray-500">
                            {quote.weight_kg ? `${quote.weight_kg.toLocaleString()}kg` : ''} {quote.volume_cbm ? `• ${quote.volume_cbm}cbm` : ''}
                          </p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{quote.origin_port || ''}</p>
                          <p className="text-gray-500">↓ {quote.destination_port || ''}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50">
                          {quote.shipment_mode || ''} {quote.incoterm ? `• ${quote.incoterm}` : ''}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3" />
                          {formatDate(quote.etd)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0`}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        {bestCandidate ? (
                          <div className="text-sm">
                            <p className="font-medium flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {formatCurrency(bestCandidate.price_total, quote.currency)}
                            </p>
                            <p className="text-gray-500">{bestCandidate.carrier || ''}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Sin ofertas</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className={`text-sm ${expired ? 'text-red-600' : expiringSoon ? 'text-yellow-600' : 'text-gray-600'}`}>
                          <div className="flex items-center gap-1">
                            {expired ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {formatDate(quote.expires_at)}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewQuote && onViewQuote(quote)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          
          {!loading && filteredQuotes.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No se encontraron cotizaciones</p>
              <p className="text-gray-400 text-sm">Ajusta los filtros o crea una nueva cotización</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}