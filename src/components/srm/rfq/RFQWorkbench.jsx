// components/srm/rfq/RFQWorkbench.jsx
import { useState, useMemo } from 'react';
import { invokeAi } from '@/components/srm/ai/invokeAi';
import { useOverlay } from '@/components/srm/OverlayProvider';
import {
  Plus, Search, Send, Award, Clock, AlertCircle, CheckCircle, FileText, 
  Users, MapPin, TrendingUp, Filter, Download, MoreHorizontal, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock RFQs data
const mockRFQs = [
  {
    rfq_code: "RFQ-2024-001",
    origin: "Valencia, ES",
    destination: "Lima, PE", 
    incoterm: "CIF",
    valid_from: "2024-01-15",
    valid_to: "2024-12-31",
    estado: "answered",
    proveedores_inv: 5,
    respuestas: 3,
    sent_at: "2024-01-16T08:00:00Z",
    value: 125000
  },
  {
    rfq_code: "RFQ-2024-002",
    origin: "Shanghai, CN",
    destination: "Rotterdam, NL",
    incoterm: "FOB", 
    valid_from: "2024-02-01",
    valid_to: "2024-11-30",
    estado: "sent",
    proveedores_inv: 8,
    respuestas: 0,
    sent_at: "2024-02-02T10:30:00Z",
    value: 85000
  },
  {
    rfq_code: "RFQ-2024-003",
    origin: "Miami, US",
    destination: "Madrid, ES",
    incoterm: "DDP",
    valid_from: "2024-03-01", 
    valid_to: "2024-06-30",
    estado: "expired",
    proveedores_inv: 4,
    respuestas: 1,
    sent_at: "2024-03-02T14:15:00Z",
    value: 65000
  },
  {
    rfq_code: "RFQ-2024-004",
    origin: "Hamburg, DE",
    destination: "New York, US",
    incoterm: "FOB",
    valid_from: "2024-04-01",
    valid_to: "2024-12-31",
    estado: "draft",
    proveedores_inv: 6,
    respuestas: 0,
    sent_at: null,
    value: 95000
  }
];

const KPICard = ({ title, value, trend, icon: Icon, color }) => (
  <Card className="bg-white shadow-sm" style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
    <CardContent className="p-5">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {value}
          </p>
          {trend && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-current" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function RFQWorkbench() {
  const { persona } = useOverlay();
  const [activeTab, setActiveTab] = useState('abiertas');
  const [rfqs, setRfqs] = useState(mockRFQs);
  const [filters, setFilters] = useState({
    search: '',
    estado: 'todos',
    incoterm: 'todos'
  });
  const [showNewRFQModal, setShowNewRFQModal] = useState(false);
  const [newRFQ, setNewRFQ] = useState({
    origin: '',
    destination: '',
    incoterm: 'CIF',
    valid_from: '',
    valid_to: '',
    proveedores: ''
  });
  const [busyChip, setBusyChip] = useState(null);

  // Calculate SLA remaining and expired status
  const processedRFQs = useMemo(() => {
    return rfqs.map(rfq => {
      const today = new Date();
      const validTo = new Date(rfq.valid_to);
      const sla_restante = Math.ceil((validTo - today) / (1000 * 60 * 60 * 24));
      
      // Auto-expire if past valid_to and not already awarded
      const estado = (sla_restante < 0 && rfq.estado !== 'awarded') ? 'expired' : rfq.estado;
      
      return {
        ...rfq,
        estado,
        sla_restante
      };
    });
  }, [rfqs]);

  // Filter RFQs based on current filters and active tab
  const filteredRFQs = useMemo(() => {
    let filtered = processedRFQs.filter(rfq => {
      const textMatch = filters.search === '' || 
        rfq.rfq_code.toLowerCase().includes(filters.search.toLowerCase()) ||
        rfq.origin.toLowerCase().includes(filters.search.toLowerCase()) ||
        rfq.destination.toLowerCase().includes(filters.search.toLowerCase());
      
      const estadoMatch = filters.estado === 'todos' || rfq.estado === filters.estado;
      const incotermMatch = filters.incoterm === 'todos' || rfq.incoterm === filters.incoterm;
      
      return textMatch && estadoMatch && incotermMatch;
    });

    // Filter by tab
    switch (activeTab) {
      case 'abiertas':
        return filtered.filter(rfq => ['draft', 'sent'].includes(rfq.estado));
      case 'evaluacion':
        return filtered.filter(rfq => rfq.estado === 'answered');
      case 'adjudicadas':
        return filtered.filter(rfq => rfq.estado === 'awarded');
      case 'vencidas':
        return filtered.filter(rfq => rfq.estado === 'expired');
      default:
        return filtered;
    }
  }, [processedRFQs, filters, activeTab]);

  // AI Chips handlers
  const onBulkRFQByLane = async () => {
    setBusyChip('bulk_rfq');
    const res = await invokeAi({
      action: 'bulk_rfq_by_lane',
      context: { persona, submodule: 'rfq' },
      payload: { existing_rfqs: rfqs.length, persona }
    });
    setBusyChip(null);
    
    if (res.ok) {
      // Simulate creating 2 draft RFQs
      const newRfqs = [
        {
          rfq_code: `RFQ-2024-${String(rfqs.length + 1).padStart(3, '0')}`,
          origin: "Barcelona, ES",
          destination: "Santos, BR",
          incoterm: "FOB",
          valid_from: "2024-04-01",
          valid_to: "2024-12-31",
          estado: 'draft',
          proveedores_inv: 6,
          respuestas: 0,
          sent_at: null,
          value: 78000
        },
        {
          rfq_code: `RFQ-2024-${String(rfqs.length + 2).padStart(3, '0')}`,
          origin: "Hamburg, DE", 
          destination: "Buenos Aires, AR",
          incoterm: "CIF",
          valid_from: "2024-04-01",
          valid_to: "2024-12-31",
          estado: 'draft',
          proveedores_inv: 4,
          respuestas: 0,
          sent_at: null,
          value: 92000
        }
      ];
      setRfqs([...rfqs, ...newRfqs]);
      alert(`AI Bulk RFQ: Generadas ${newRfqs.length} RFQs draft para lanes populares`);
    } else {
      alert(`AI error: ${res.error}`);
    }
  };

  const onRecommendCarrier = async () => {
    setBusyChip('recommend_carrier');
    const answeredRFQs = processedRFQs.filter(rfq => rfq.estado === 'answered');
    const res = await invokeAi({
      action: 'recommend_carrier',
      context: { persona, submodule: 'rfq' },
      payload: { answered_rfqs: answeredRFQs.length }
    });
    setBusyChip(null);
    
    if (res.ok) {
      alert(`AI Recommend Carrier: Para ${answeredRFQs.length} RFQs answered, sugiere proveedor Maersk Line (score: 8.7/10)`);
    } else {
      alert(`AI error: ${res.error}`);
    }
  };

  const onOptimizarSourcing = async () => {
    setBusyChip('optimizar');
    const totalValue = processedRFQs.reduce((sum, rfq) => sum + rfq.value, 0);
    const res = await invokeAi({
      action: 'optimizar_sourcing',
      context: { persona, submodule: 'rfq' },
      payload: { total_value: totalValue, rfq_count: processedRFQs.length }
    });
    setBusyChip(null);
    
    if (res.ok) {
      alert(`AI Sourcing: Portfolio de €${(totalValue/1000).toFixed(0)}k optimizable consolidando ${processedRFQs.filter(r => r.value < 50000).length} RFQs menores`);
    } else {
      alert(`AI error: ${res.error}`);
    }
  };

  const createRFQ = () => {
    const rfq_code = `RFQ-2024-${String(rfqs.length + 1).padStart(3, '0')}`;
    const proveedoresCount = newRFQ.proveedores.split(',').filter(p => p.trim()).length;
    
    const newRfq = {
      rfq_code,
      origin: newRFQ.origin,
      destination: newRFQ.destination,
      incoterm: newRFQ.incoterm,
      valid_from: newRFQ.valid_from,
      valid_to: newRFQ.valid_to,
      estado: 'draft',
      proveedores_inv: proveedoresCount,
      respuestas: 0,
      sent_at: null,
      value: 50000 + Math.floor(Math.random() * 100000) // Random value for demo
    };
    
    setRfqs([...rfqs, newRfq]);
    setNewRFQ({
      origin: '',
      destination: '',
      incoterm: 'CIF',
      valid_from: '',
      valid_to: '',
      proveedores: ''
    });
    setShowNewRFQModal(false);
  };

  const sendRFQ = (rfqCode) => {
    setRfqs(rfqs.map(rfq => 
      rfq.rfq_code === rfqCode 
        ? { ...rfq, estado: 'sent', sent_at: new Date().toISOString() }
        : rfq
    ));
  };

  const awardRFQ = (rfqCode) => {
    setRfqs(rfqs.map(rfq => 
      rfq.rfq_code === rfqCode 
        ? { ...rfq, estado: 'awarded' }
        : rfq
    ));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      estado: 'todos',
      incoterm: 'todos'
    });
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'answered': return 'bg-green-100 text-green-800';
      case 'awarded': return 'bg-purple-100 text-purple-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSLAColor = (sla_restante) => {
    if (sla_restante < 0) return 'text-red-600';
    if (sla_restante <= 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  const canAward = persona === 'comerciante';

  return (
    <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif', backgroundColor: '#F1F0EC', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            RFQ Workbench
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de solicitudes de cotización y sourcing estratégico
          </p>
        </div>
        <Dialog open={showNewRFQModal} onOpenChange={setShowNewRFQModal}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: '#4472C4' }} className="text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nueva RFQ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva RFQ</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Origen</Label>
                  <Input
                    value={newRFQ.origin}
                    onChange={(e) => setNewRFQ({...newRFQ, origin: e.target.value})}
                    placeholder="Valencia, ES"
                  />
                </div>
                <div>
                  <Label>Destino</Label>
                  <Input
                    value={newRFQ.destination}
                    onChange={(e) => setNewRFQ({...newRFQ, destination: e.target.value})}
                    placeholder="Lima, PE"
                  />
                </div>
              </div>
              <div>
                <Label>Incoterm</Label>
                <Select value={newRFQ.incoterm} onValueChange={(value) => setNewRFQ({...newRFQ, incoterm: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXW">EXW</SelectItem>
                    <SelectItem value="FCA">FCA</SelectItem>
                    <SelectItem value="FOB">FOB</SelectItem>
                    <SelectItem value="CIF">CIF</SelectItem>
                    <SelectItem value="DAP">DAP</SelectItem>
                    <SelectItem value="DDP">DDP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Válido desde</Label>
                  <Input
                    type="date"
                    value={newRFQ.valid_from}
                    onChange={(e) => setNewRFQ({...newRFQ, valid_from: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Válido hasta</Label>
                  <Input
                    type="date"
                    value={newRFQ.valid_to}
                    onChange={(e) => setNewRFQ({...newRFQ, valid_to: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label>Proveedores (separados por coma)</Label>
                <Input
                  value={newRFQ.proveedores}
                  onChange={(e) => setNewRFQ({...newRFQ, proveedores: e.target.value})}
                  placeholder="Maersk, CMA CGM, MSC"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewRFQModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={createRFQ} style={{ backgroundColor: '#4472C4' }} className="text-white">
                  Crear RFQ
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="RFQs Abiertas"
          value={processedRFQs.filter(r => ['draft', 'sent'].includes(r.estado)).length}
          trend="+2 esta semana"
          icon={FileText}
          color="bg-blue-100 text-blue-600"
        />
        <KPICard
          title="Valor Pipeline"
          value={`€${(processedRFQs.reduce((sum, r) => sum + r.value, 0) / 1000).toFixed(0)}k`}
          trend="+€45k vs anterior"
          icon={TrendingUp}
          color="bg-green-100 text-green-600"
        />
        <KPICard
          title="TAT Promedio"
          value="4.2 días"
          trend="+3 evaluando"
          icon={Clock}
          color="bg-yellow-100 text-yellow-600"
        />
        <KPICard
          title="Win Rate"
          value="68%"
          trend="+5pp vs trimestre"
          icon={Award}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* AI Insights Panel */}
      <Card className="bg-white shadow-sm" style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">AI Insights & Recomendaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm">Bulk RFQ by Lane</h4>
                  <p className="text-xs text-blue-700 mt-1">Generar RFQs masivas por rutas populares</p>
                </div>
              </div>
              <button
                className="w-full px-3 py-1.5 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                onClick={onBulkRFQByLane}
                disabled={busyChip === 'bulk_rfq'}
                aria-busy={busyChip === 'bulk_rfq'}
              >
                {busyChip === 'bulk_rfq' ? 'Generando...' : 'Generar RFQs'}
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm">Recommend Carrier</h4>
                  <p className="text-xs text-blue-700 mt-1">Sugerir mejor proveedor para RFQs answered</p>
                </div>
              </div>
              <button
                className="w-full px-3 py-1.5 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                onClick={onRecommendCarrier}
                disabled={busyChip === 'recommend_carrier'}
                aria-busy={busyChip === 'recommend_carrier'}
              >
                {busyChip === 'recommend_carrier' ? 'Analizando...' : 'Recomendar Proveedor'}
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm">Optimizar Sourcing</h4>
                  <p className="text-xs text-blue-700 mt-1">Consolidar y optimizar portfolio RFQ</p>
                </div>
              </div>
              <button
                className="w-full px-3 py-1.5 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                onClick={onOptimizarSourcing}
                disabled={busyChip === 'optimizar'}
                aria-busy={busyChip === 'optimizar'}
              >
                {busyChip === 'optimizar' ? 'Optimizando...' : 'Optimizar Portfolio'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar RFQ, ruta o proveedor..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.estado} onValueChange={(value) => setFilters(prev => ({ ...prev, estado: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="answered">Answered</SelectItem>
                <SelectItem value="awarded">Awarded</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.incoterm} onValueChange={(value) => setFilters(prev => ({ ...prev, incoterm: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Incoterm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="EXW">EXW</SelectItem>
                <SelectItem value="FCA">FCA</SelectItem>
                <SelectItem value="FOB">FOB</SelectItem>
                <SelectItem value="CIF">CIF</SelectItem>
                <SelectItem value="DAP">DAP</SelectItem>
                <SelectItem value="DDP">DDP</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Limpiar
            </Button>

            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table with Tabs */}
      <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
              <TabsTrigger value="abiertas" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                Abiertas ({processedRFQs.filter(r => ['draft', 'sent'].includes(r.estado)).length})
              </TabsTrigger>
              <TabsTrigger value="evaluacion" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                En Evaluación ({processedRFQs.filter(r => r.estado === 'answered').length})
              </TabsTrigger>
              <TabsTrigger value="adjudicadas" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                Adjudicadas ({processedRFQs.filter(r => r.estado === 'awarded').length})
              </TabsTrigger>
              <TabsTrigger value="vencidas" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                Vencidas ({processedRFQs.filter(r => r.estado === 'expired').length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RFQ Code</TableHead>
                    <TableHead>Lane</TableHead>
                    <TableHead>Incoterm</TableHead>
                    <TableHead>Validez</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Prov. Inv.</TableHead>
                    <TableHead>Respuestas</TableHead>
                    <TableHead>Valor Est.</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRFQs.map((rfq) => (
                    <TableRow key={rfq.rfq_code}>
                      <TableCell className="font-medium">{rfq.rfq_code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <span>{rfq.origin.split(',')[0]}</span>
                          <span className="text-gray-400">→</span>
                          <span>{rfq.destination.split(',')[0]}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{rfq.incoterm}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>{new Date(rfq.valid_from).toLocaleDateString()}</div>
                          <div className="text-gray-500">→ {new Date(rfq.valid_to).toLocaleDateString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(rfq.estado)}>
                          {rfq.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>{rfq.proveedores_inv}</TableCell>
                      <TableCell>{rfq.respuestas}</TableCell>
                      <TableCell>€{(rfq.value / 1000).toFixed(0)}k</TableCell>
                      <TableCell>
                        <span className={getSLAColor(rfq.sla_restante)}>
                          {rfq.sla_restante > 0 ? `${rfq.sla_restante}d` : `${Math.abs(rfq.sla_restante)}d venc.`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {rfq.estado === 'draft' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendRFQ(rfq.rfq_code)}
                            >
                              <Send className="w-3 h-3" />
                            </Button>
                          )}
                          {rfq.estado === 'answered' && canAward && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => awardRFQ(rfq.rfq_code)}
                            >
                              <Award className="w-3 h-3" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredRFQs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Sin registros</p>
                  <p className="text-sm">Ajusta los filtros o crea nuevas RFQs</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}