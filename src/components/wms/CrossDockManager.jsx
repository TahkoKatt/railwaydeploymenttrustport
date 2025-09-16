
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
  Zap, Scan, CheckCircle, AlertTriangle, Clock, Dock,
  MoreHorizontal, Filter, Eye, Printer, Download,
  ArrowRightLeft, MapPin, Package
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
const mockCandidates = [
  {
    candidate_id: 'CD-001',
    in_receipt_id: 'REC-001',
    out_order_id: 'ORD-001',
    owner_id: 'ACME',
    sku: 'PROD-001',
    lot: 'L-2412-A',
    qty_in: 100,
    qty_needed: 80,
    qty_to_cd: 80,
    eta_outbound: '14:30',
    dock: 'DOCK-A',
    priority: 'alta',
    score: 95,
    status: 'candidato'
  },
  {
    candidate_id: 'CD-002',
    in_receipt_id: 'REC-002',
    out_order_id: 'ORD-002',
    owner_id: 'BETA',
    sku: 'PROD-002',
    lot: 'L-2412-B',
    qty_in: 50,
    qty_needed: 30,
    qty_to_cd: 30,
    eta_outbound: '15:45',
    dock: 'DOCK-B',
    priority: 'media',
    score: 78,
    status: 'aprobado'
  },
  {
    candidate_id: 'CD-003',
    in_receipt_id: 'REC-003',
    out_order_id: 'ORD-003',
    owner_id: 'ACME',
    sku: 'PROD-003',
    lot: 'L-2412-C',
    qty_in: 25,
    qty_needed: 25,
    qty_to_cd: 25,
    eta_outbound: '16:00',
    dock: 'DOCK-A',
    priority: 'baja',
    score: 65,
    status: 'ejecutado'
  }
];

const mockKPIs = {
  cd_candidates: 8,
  cd_executed_today: 3,
  avg_cd_time_min: 12,
  blocked_cases: 1
};

const mockRules = [
  { key: 'owner_match', label: 'Owner Match', status: true },
  { key: 'sku_match', label: 'SKU Match', status: true },
  { key: 'lote_compatible', label: 'Lote Compatible', status: true },
  { key: 'fefo_ok', label: 'FEFO OK', status: true },
  { key: 'eta_window_ok', label: 'ETA Window OK', status: true },
  { key: 'capacidad_anden', label: 'Capacidad Anden', status: false }
];

export default function CrossDockManager() {
  // Estado según spec base44 v1.1
  const [selectedPersona] = useState(() => localStorage.getItem('selectedPersona') || 'operador');
  
  // Top filters según layout spec
  const [filters, setFilters] = useState({
    warehouse_id: 'MAD-01',
    owner_id: null,
    eta_window: '24h',
    status: 'candidato'
  });

  // Estado del cross-dock
  const [candidates, setCandidates] = useState(mockCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('review');
  const [selectedRows, setSelectedRows] = useState([]);

  // Aplicar filtros de persona al montar
  useEffect(() => {
    const getPersonaConfig = () => {
      const configs = {
        comerciante: {
          default_filters: { status: 'candidato', eta_window: '24h' },
          quick_actions: [],
          kpi_priority: ['cd_candidates', 'cd_executed_today', 'avg_cd_time_min', 'blocked_cases']
        },
        operador: {
          default_filters: { status: 'candidato', eta_window: 'hoy' },
          quick_actions: ['execute_bulk', 'assign_dock', 'print_labels'],
          kpi_priority: ['cd_executed_today', 'cd_candidates', 'avg_cd_time_min', 'blocked_cases']
        }
      };
      return configs[selectedPersona] || configs.operador;
    };

    const config = getPersonaConfig();
    setFilters(prev => ({ ...prev, ...config.default_filters }));
  }, [selectedPersona]);

  // API handlers según spec
  const handleReview = async (candidateId) => {
    try {
      // GET /wms/crossdock/{candidate_id}
      console.log('[WMS-API] Reviewing candidate:', candidateId);
      const candidate = candidates.find(c => c.candidate_id === candidateId);
      setSelectedCandidate(candidate);
      setShowCandidateModal(true);
    } catch (error) {
      toast.error('Error cargando candidato');
    }
  };

  const handleApprove = async (candidateId) => {
    try {
      // POST /wms/crossdock/{candidate_id}/approve
      console.log('[WMS-API] Approving candidate:', candidateId);
      
      const updatedCandidates = candidates.map(c =>
        c.candidate_id === candidateId ? { ...c, status: 'aprobado' } : c
      );
      setCandidates(updatedCandidates);
      toast.success('Candidato aprobado');
    } catch (error) {
      toast.error('Error aprobando candidato');
    }
  };

  const handleAssignDock = async (candidateId, dock) => {
    try {
      // POST /wms/crossdock/{candidate_id}/assign-dock
      console.log('[WMS-API] Assigning dock:', { candidateId, dock });
      
      const updatedCandidates = candidates.map(c =>
        c.candidate_id === candidateId ? { ...c, dock } : c
      );
      setCandidates(updatedCandidates);
      toast.success(`Andén ${dock} asignado`);
    } catch (error) {
      toast.error('Error asignando andén');
    }
  };

  const handlePrintLabels = async (candidateId) => {
    try {
      // POST /wms/labels/print
      console.log('[WMS-API] Printing labels for candidate:', candidateId);
      toast.success('Etiquetas enviadas a impresora');
    } catch (error) {
      toast.error('Error imprimiendo etiquetas');
    }
  };

  const handleExecute = async (candidateId) => {
    try {
      // POST /wms/crossdock/{candidate_id}/execute
      console.log('[WMS-API] Executing cross-dock:', candidateId);
      
      const updatedCandidates = candidates.map(c =>
        c.candidate_id === candidateId ? { ...c, status: 'ejecutado' } : c
      );
      setCandidates(updatedCandidates);
      toast.success('Cross-dock ejecutado exitosamente');
      // Emitir evento: wms.crossdock.executed.v1
    } catch (error) {
      toast.error('Error ejecutando cross-dock');
    }
  };

  const handleBlock = async (candidateId, reason) => {
    try {
      // POST /wms/crossdock/{candidate_id}/block
      console.log('[WMS-API] Blocking candidate:', { candidateId, reason });
      
      const updatedCandidates = candidates.map(c =>
        c.candidate_id === candidateId ? { ...c, status: 'bloqueado' } : c
      );
      setCandidates(updatedCandidates);
      toast.success('Candidato bloqueado');
    } catch (error) {
      toast.error('Error bloqueando candidato');
    }
  };

  const handleExecuteBulk = async () => {
    try {
      // POST /wms/crossdock/execute-batch
      console.log('[WMS-API] Executing bulk cross-dock:', selectedRows);
      
      const updatedCandidates = candidates.map(c =>
        selectedRows.includes(c.candidate_id) ? { ...c, status: 'ejecutado' } : c
      );
      setCandidates(updatedCandidates);
      setSelectedRows([]);
      toast.success(`${selectedRows.length} candidatos ejecutados`);
    } catch (error) {
      toast.error('Error en ejecución masiva');
    }
  };

  const handleCreateCrossDock = async (inboundId, outboundId) => {
    try {
      const crossdockId = `CD-${Date.now()}`;
      
      // Eventos para QA
      console.log('[WMS-EVT] wms.crossdock.created.v1:', {
        crossdock_id: crossdockId,
        in_receipt_id: inboundId,
        out_order_id: outboundId
      });
      
      setTimeout(() => {
        console.log('[WMS-EVT] wms.crossdock.ship_ready.v1:', {
          crossdock_id: crossdockId,
          dwell_time_minutes: 45
        });
      }, 2000);

      toast.success(`Cross-dock ${crossdockId} creado exitosamente`);
    } catch (error) {
      toast.error('Error creando cross-dock');
    }
  };

  // Filtrar candidatos
  const filteredCandidates = candidates.filter(candidate => {
    const ownerMatch = !filters.owner_id || candidate.owner_id === filters.owner_id;
    const statusMatch = candidate.status === filters.status;
    return ownerMatch && statusMatch;
  });

  const getStatusBadge = (status) => {
    const configs = {
      candidato: { bg: 'bg-blue-100', color: 'text-blue-600', label: 'Candidato' },
      aprobado: { bg: 'bg-yellow-100', color: 'text-yellow-600', label: 'Aprobado' },
      ejecutado: { bg: 'bg-green-100', color: 'text-green-600', label: 'Ejecutado' },
      bloqueado: { bg: 'bg-red-100', color: 'text-red-600', label: 'Bloqueado' }
    };
    return configs[status] || configs.candidato;
  };

  const getPriorityBadge = (priority) => {
    const configs = {
      alta: { bg: 'bg-red-100', color: 'text-red-600', label: 'Alta' },
      media: { bg: 'bg-yellow-100', color: 'text-yellow-600', label: 'Media' },
      baja: { bg: 'bg-blue-100', color: 'text-blue-600', label: 'Baja' }
    };
    return configs[priority] || configs.media;
  };

  return (
    <div className="space-y-6">
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
              {['hoy', '24h', '48h', '7d'].map(window => (
                <button
                  key={window}
                  onClick={() => setFilters(prev => ({ ...prev, eta_window: window }))}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filters.eta_window === window
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {window}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {['candidato', 'aprobado', 'ejecutado', 'bloqueado'].map(status => (
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
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        {/* Candidates Table - 8 columnas */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="bg-white shadow-sm" style={{ boxShadow: TRUSTPORT_TOKENS.shadow, borderRadius: TRUSTPORT_TOKENS.radius }}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[18px] font-semibold" style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
                  Candidatos Cross-dock
                </CardTitle>
                <div className="flex gap-2">
                  {selectedRows.length > 0 && (
                    <Button 
                      onClick={handleExecuteBulk}
                      className="text-white"
                      style={{ backgroundColor: TRUSTPORT_TOKENS.colors.primary }}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Ejecutar Selección ({selectedRows.length})
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRows.length === filteredCandidates.length && filteredCandidates.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRows(filteredCandidates.map(c => c.candidate_id));
                          } else {
                            setSelectedRows([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Orden</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Qty CD</TableHead>
                    <TableHead>ETA Out</TableHead>
                    <TableHead>Andén</TableHead>
                    <TableHead>Prio</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.map((candidate) => {
                    const statusConfig = getStatusBadge(candidate.status);
                    const priorityConfig = getPriorityBadge(candidate.priority);
                    
                    return (
                      <TableRow key={candidate.candidate_id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.includes(candidate.candidate_id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedRows([...selectedRows, candidate.candidate_id]);
                              } else {
                                setSelectedRows(selectedRows.filter(id => id !== candidate.candidate_id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-sm">{candidate.candidate_id}</TableCell>
                        <TableCell className="text-sm">{candidate.in_receipt_id}</TableCell>
                        <TableCell className="text-sm">{candidate.out_order_id}</TableCell>
                        <TableCell className="text-sm">{candidate.owner_id}</TableCell>
                        <TableCell className="text-sm">{candidate.sku}</TableCell>
                        <TableCell className="text-right text-sm">{candidate.qty_to_cd}</TableCell>
                        <TableCell className="text-sm">{candidate.eta_outbound}</TableCell>
                        <TableCell className="text-sm">{candidate.dock}</TableCell>
                        <TableCell>
                          <Badge className={`${priorityConfig.bg} ${priorityConfig.color}`}>
                            {priorityConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{candidate.score}</TableCell>
                        <TableCell>
                          <Badge className={`${statusConfig.bg} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleReview(candidate.candidate_id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Revisar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleApprove(candidate.candidate_id)}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Aprobar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAssignDock(candidate.candidate_id, 'DOCK-C')}>
                                <Dock className="w-4 h-4 mr-2" />
                                Asignar Andén
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePrintLabels(candidate.candidate_id)}>
                                <Printer className="w-4 h-4 mr-2" />
                                Imprimir Etiquetas
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExecute(candidate.candidate_id)}>
                                <Zap className="w-4 h-4 mr-2" />
                                Ejecutar CD
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBlock(candidate.candidate_id, 'Manual block')}>
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Bloquear
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

        {/* KPIs y Workbench - 4 columnas */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* KPIs */}
          <Card className="bg-white shadow-sm" style={{ boxShadow: TRUSTPORT_TOKENS.shadow, borderRadius: TRUSTPORT_TOKENS.radius }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">KPIs Cross-dock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{mockKPIs.cd_candidates}</p>
                  <p className="text-xs text-blue-600">Candidatos</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{mockKPIs.cd_executed_today}</p>
                  <p className="text-xs text-green-600">Ejecutados Hoy</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{mockKPIs.avg_cd_time_min}</p>
                  <p className="text-xs text-yellow-600">Tiempo Medio (min)</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{mockKPIs.blocked_cases}</p>
                  <p className="text-xs text-red-600">Bloqueados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workbench */}
          <Card className="bg-white shadow-sm" style={{ boxShadow: TRUSTPORT_TOKENS.shadow, borderRadius: TRUSTPORT_TOKENS.radius }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Estación Cross-dock</CardTitle>
              <div className="flex border-b">
                {[
                  { key: 'review', label: 'Revisión', icon: Eye },
                  { key: 'execute', label: 'Ejecución', icon: Zap }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 ${
                        activeTab === tab.key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === 'review' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Reglas de Elegibilidad</Label>
                    <div className="mt-2 space-y-2">
                      {mockRules.map(rule => (
                        <div key={rule.key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{rule.label}</span>
                          {rule.status ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprobar CD
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Dock className="w-4 h-4 mr-2" />
                      Asignar Andén
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'execute' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="scanInput">Escanear Pallet/SSCC</Label>
                    <div className="mt-1 relative">
                      <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="scanInput"
                        placeholder="Escanear código..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Checklist de Ejecución</Label>
                    <div className="mt-2 space-y-2">
                      {[
                        { key: 'sellos', label: 'Sellos OK' },
                        { key: 'foto', label: 'Foto Carga?' },
                        { key: 'peso', label: 'Peso OK' }
                      ].map(item => (
                        <div key={item.key} className="flex items-center space-x-2">
                          <Checkbox id={item.key} />
                          <Label htmlFor={item.key} className="text-sm">{item.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 text-white"
                      style={{ backgroundColor: TRUSTPORT_TOKENS.colors.green }}
                      // Added for testing QA event
                      onClick={() => handleCreateCrossDock('REC-Test', 'ORD-Test')} 
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Ejecutar CD
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimir
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Candidate Detail */}
      <Dialog open={showCandidateModal} onOpenChange={setShowCandidateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle Candidato - {selectedCandidate?.candidate_id}</DialogTitle>
          </DialogHeader>
          {selectedCandidate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Receipt ID</Label>
                  <p className="font-medium">{selectedCandidate.in_receipt_id}</p>
                </div>
                <div>
                  <Label>Orden ID</Label>
                  <p className="font-medium">{selectedCandidate.out_order_id}</p>
                </div>
                <div>
                  <Label>Cliente</Label>
                  <p className="font-medium">{selectedCandidate.owner_id}</p>
                </div>
                <div>
                  <Label>SKU</Label>
                  <p className="font-medium">{selectedCandidate.sku}</p>
                </div>
                <div>
                  <Label>Lote</Label>
                  <p className="font-medium">{selectedCandidate.lot}</p>
                </div>
                <div>
                  <Label>ETA Outbound</Label>
                  <p className="font-medium">{selectedCandidate.eta_outbound}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm text-center">
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-lg font-bold text-blue-600">{selectedCandidate.qty_in}</p>
                  <p className="text-blue-600">Qty In</p>
                </div>
                <div className="p-3 bg-orange-50 rounded">
                  <p className="text-lg font-bold text-orange-600">{selectedCandidate.qty_needed}</p>
                  <p className="text-orange-600">Qty Needed</p>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-lg font-bold text-green-600">{selectedCandidate.qty_to_cd}</p>
                  <p className="text-green-600">Qty CD</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCandidateModal(false)}>
                  Cerrar
                </Button>
                <Button 
                  onClick={() => handleApprove(selectedCandidate.candidate_id)}
                  className="text-white"
                  style={{ backgroundColor: TRUSTPORT_TOKENS.colors.green }}
                >
                  Aprobar Cross-dock
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
