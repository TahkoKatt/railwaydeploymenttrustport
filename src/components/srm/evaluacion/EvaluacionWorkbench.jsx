
// components/srm/evaluacion/EvaluacionWorkbench.jsx
import { useState, useMemo } from 'react';
import { invokeAi } from '@/components/srm/ai/invokeAi';
import { useOverlay } from '@/components/srm/OverlayProvider';
import {
  Download, Search, Filter, TrendingUp, Award, AlertTriangle, Users,
  BarChart3, Eye, Plus, MoreHorizontal, Target, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

// Mock evaluation data
const mockEvaluations = [
  {
    supplier_id: "SUP-001",
    supplier: "Transporte Atlas",
    overall_score: 88,
    otif: 94,
    compliance: 95,
    claims: 97,
    lead_var: 88,
    last_audit_at: "2024-11-15",
    auditor: "Ana Garcia"
  },
  {
    supplier_id: "SUP-002", 
    supplier: "Maritimos XXI",
    overall_score: 65,
    otif: 88,
    compliance: 0,
    claims: 94,
    lead_var: 78,
    last_audit_at: "2024-10-20",
    auditor: "Carlos Ruiz"
  },
  {
    supplier_id: "SUP-003",
    supplier: "Industrias Norte", 
    overall_score: 92,
    otif: 97,
    compliance: 100,
    claims: 99,
    lead_var: 92,
    last_audit_at: "2024-11-10",
    auditor: "Maria Lopez"
  },
  {
    supplier_id: "SUP-004",
    supplier: "Global Freight",
    overall_score: 76,
    otif: 92,
    compliance: 100,
    claims: 98,
    lead_var: 85,
    last_audit_at: "2024-11-01",
    auditor: "Luis Perez"
  },
  {
    supplier_id: "SUP-005",
    supplier: "Materials Corp",
    overall_score: 58,
    otif: 89,
    compliance: 0,
    claims: 96,
    lead_var: 82,
    last_audit_at: "2024-09-25",
    auditor: "Ana Garcia"
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

export default function EvaluacionWorkbench() {
  const { persona } = useOverlay();
  const [evaluations] = useState(mockEvaluations);
  const [activeTab, setActiveTab] = useState('todos');
  const [filters, setFilters] = useState({
    search: '',
    status: 'todos',
    score_range: 'todos'
  });
  const [busyChip, setBusyChip] = useState(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showScorecard, setShowScorecard] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [improvementPlan, setImprovementPlan] = useState('');

  // Process evaluations with status
  const processedEvals = useMemo(() => {
    return evaluations.map(evaluation => ({
      ...evaluation,
      status: evaluation.overall_score < 70 ? 'gate_fail' : 'approved'
    }));
  }, [evaluations]);

  // Snapshot for Riesgo module - BRIDGE-LITE
  try {
    const snapshot = processedEvals.map(r => ({
      supplier_id: r.supplier_id || r.id || r.supplier,
      supplier: r.supplier,
      overall_score: Number(r.overall_score ?? r.score ?? 0)
    }));
    localStorage.setItem('srm_eval_snapshot', JSON.stringify(snapshot));
  } catch {}

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = processedEvals.length;
    const approved = processedEvals.filter(e => e.status === 'approved').length;
    const gate_fail = processedEvals.filter(e => e.status === 'gate_fail').length;
    const avg_score = Math.round(processedEvals.reduce((sum, e) => sum + e.overall_score, 0) / total);
    
    return { total, approved, gate_fail, avg_score };
  }, [processedEvals]);

  // Filter evaluations
  const filteredEvals = useMemo(() => {
    let filtered = processedEvals.filter(evaluation => {
      const searchMatch = !filters.search || 
        evaluation.supplier.toLowerCase().includes(filters.search.toLowerCase()) ||
        evaluation.supplier_id.toLowerCase().includes(filters.search.toLowerCase());
      
      const statusMatch = filters.status === 'todos' || evaluation.status === filters.status;
      
      let scoreMatch = true;
      if (filters.score_range !== 'todos') {
        switch (filters.score_range) {
          case 'high':
            scoreMatch = evaluation.overall_score >= 80;
            break;
          case 'medium':
            scoreMatch = evaluation.overall_score >= 70 && evaluation.overall_score < 80;
            break;
          case 'low':
            scoreMatch = evaluation.overall_score < 70;
            break;
        }
      }
      
      return searchMatch && statusMatch && scoreMatch;
    });

    // Filter by tab
    switch (activeTab) {
      case 'aprobados':
        return filtered.filter(e => e.status === 'approved');
      case 'gate_fail':
        return filtered.filter(e => e.status === 'gate_fail');
      case 'todos':
      default:
        return filtered;
    }
  }, [processedEvals, filters, activeTab]);

  // AI Chips handlers
  const onEvaluarProveedores = async () => {
    setBusyChip('evaluar');
    const res = await invokeAi({
      action: 'evaluar_proveedores',
      context: { persona, submodule: 'evaluacion' },
      payload: { total_evaluations: evaluations.length, gate_fails: kpis.gate_fail }
    });
    setBusyChip(null);
    
    if (res.ok) {
      alert(`AI Evaluacion: ${kpis.gate_fail} proveedores requieren atencion inmediata`);
    } else {
      alert(`AI error: ${res.error}`);
    }
  };

  const onOptimizarScoring = async () => {
    setBusyChip('optimizar');
    const res = await invokeAi({
      action: 'optimizar_scoring',
      context: { persona, submodule: 'evaluacion' },
      payload: { avg_score: kpis.avg_score }
    });
    setBusyChip(null);
    
    if (res.ok) {
      alert('AI Scoring: Nuevos pesos recomendados para mejorar precision de evaluacion');
    } else {
      alert(`AI error: ${res.error}`);
    }
  };

  const onGenerarPlanes = async () => {
    setBusyChip('planes');
    const res = await invokeAi({
      action: 'generar_planes',
      context: { persona, submodule: 'evaluacion' },
      payload: { gate_fails: filteredEvals.filter(e => e.status === 'gate_fail') }
    });
    setBusyChip(null);
    
    if (res.ok) {
      alert('AI Planes: Planes de mejora generados automaticamente para proveedores en gate fail');
    } else {
      alert(`AI error: ${res.error}`);
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ['Supplier ID', 'Supplier', 'Overall Score', 'OTIF', 'Compliance', 'Claims', 'Lead Var', 'Status', 'Last Audit', 'Auditor'];
    const csvData = filteredEvals.map(evaluation => [
      evaluation.supplier_id,
      evaluation.supplier,
      evaluation.overall_score,
      evaluation.otif,
      evaluation.compliance,
      evaluation.claims,
      evaluation.lead_var,
      evaluation.status,
      evaluation.last_audit_at,
      evaluation.auditor
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluaciones_proveedores_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle improvement plan
  const handleCreatePlan = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowPlanModal(true);
  };

  const handleSavePlan = () => {
    alert(`Plan de mejora guardado para ${selectedEvaluation?.supplier}: ${improvementPlan}`);
    setShowPlanModal(false);
    setImprovementPlan('');
    setSelectedEvaluation(null);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'todos',
      score_range: 'todos'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'gate_fail': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCreatePlan = persona === 'comerciante';

  return (
    <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif', backgroundColor: '#F1F0EC', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Evaluacion de Proveedores
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Scorecards, umbrales de calidad y planes de mejora continua
          </p>
        </div>
        <Button onClick={handleExport} style={{ backgroundColor: '#4472C4' }} className="text-white">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Evaluaciones"
          value={kpis.total}
          trend="+2 este mes"
          icon={Users}
          color="bg-blue-100 text-blue-600"
        />
        <KPICard
          title="Aprobados"
          value={kpis.approved}
          trend="+1 vs anterior"
          icon={CheckCircle}
          color="bg-green-100 text-green-600"
        />
        <KPICard
          title="Gate Fail"
          value={kpis.gate_fail}
          trend="-1 mejorado"
          icon={XCircle}
          color="bg-red-100 text-red-600"
        />
        <KPICard
          title="Score Promedio"
          value={`${kpis.avg_score}%`}
          trend="+2.3 pts"
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
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm">Evaluar Proveedores</h4>
                  <p className="text-xs text-blue-700 mt-1">Revisar scoring y metricas de desempeño</p>
                </div>
              </div>
              <button
                className="w-full px-3 py-1.5 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                onClick={onEvaluarProveedores}
                disabled={busyChip === 'evaluar'}
              >
                {busyChip === 'evaluar' ? 'Evaluando...' : 'Ejecutar Evaluacion'}
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm">Optimizar Scoring</h4>
                  <p className="text-xs text-blue-700 mt-1">Ajustar pesos para mayor precision</p>
                </div>
              </div>
              <button
                className="w-full px-3 py-1.5 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                onClick={onOptimizarScoring}
                disabled={busyChip === 'optimizar'}
              >
                {busyChip === 'optimizar' ? 'Optimizando...' : 'Optimizar Modelo'}
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm">Generar Planes</h4>
                  <p className="text-xs text-blue-700 mt-1">Crear planes de mejora automaticos</p>
                </div>
              </div>
              <button
                className="w-full px-3 py-1.5 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                onClick={onGenerarPlanes}
                disabled={busyChip === 'planes'}
              >
                {busyChip === 'planes' ? 'Generando...' : 'Crear Planes'}
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
                placeholder="Buscar proveedor o ID..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="approved">Aprobados</SelectItem>
                <SelectItem value="gate_fail">Gate Fail</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.score_range} onValueChange={(value) => setFilters(prev => ({ ...prev, score_range: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="high">80+ Alto</SelectItem>
                <SelectItem value="medium">70-79 Medio</SelectItem>
                <SelectItem value="low">Sub-70 Bajo</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table with Tabs */}
      <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
              <TabsTrigger value="todos" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                Todos ({processedEvals.length})
              </TabsTrigger>
              <TabsTrigger value="aprobados" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                Aprobados ({kpis.approved})
              </TabsTrigger>
              <TabsTrigger value="gate_fail" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                Gate Fail ({kpis.gate_fail})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proveedor ID</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Score Global</TableHead>
                    <TableHead>OTIF</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Claims</TableHead>
                    <TableHead>Lead Var</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Ultima Auditoria</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvals.map(evaluation => (
                    <TableRow key={evaluation.supplier_id}>
                      <TableCell className="font-medium">{evaluation.supplier_id}</TableCell>
                      <TableCell>{evaluation.supplier}</TableCell>
                      <TableCell>
                        <Badge className={getScoreColor(evaluation.overall_score)}>
                          {evaluation.overall_score}
                        </Badge>
                      </TableCell>
                      <TableCell>{evaluation.otif}%</TableCell>
                      <TableCell>{evaluation.compliance}%</TableCell>
                      <TableCell>{evaluation.claims}%</TableCell>
                      <TableCell>{evaluation.lead_var}%</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(evaluation.status)}>
                          {evaluation.status === 'approved' ? 'Aprobado' : 'Gate Fail'}
                        </Badge>
                      </TableCell>
                      <TableCell>{evaluation.last_audit_at}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleCreatePlan(evaluation)}
                            disabled={!canCreatePlan}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredEvals.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Sin evaluaciones</p>
                  <p className="text-sm">Ajusta los filtros o programa nuevas auditorias</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Improvement Plan Modal */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Plan de Mejora - {selectedEvaluation?.supplier}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Acciones de Mejora</Label>
              <Textarea
                placeholder="Describe las acciones especificas para mejorar el desempeño del proveedor..."
                value={improvementPlan}
                onChange={(e) => setImprovementPlan(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPlanModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSavePlan} disabled={!improvementPlan.trim()}>
                Guardar Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
