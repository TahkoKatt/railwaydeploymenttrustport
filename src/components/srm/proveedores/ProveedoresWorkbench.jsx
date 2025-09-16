// components/srm/proveedores/ProveedoresWorkbench.jsx
import { useMemo, useState } from 'react';
import { useOverlay } from '@/components/srm/OverlayProvider';
import { invokeAi } from '@/components/srm/ai/invokeAi';
import {
  Search, Plus, Filter, Download, Users, TrendingUp, ShieldCheck, 
  AlertTriangle, Award, UserPlus, MoreHorizontal, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORIES = ['directo','indirecto','logistica'];
const RISK_LEVELS = ['bajo','medio','alto'];

const WEIGHTS = {
  comerciante: { otif:0.35, lead_var:0.15, claims:0.20, compliance:0.15, spend_trust:0.15 },
  operador_logistico: { otif:0.40, lead_var:0.25, claims:0.20, compliance:0.15, spend_trust:0.00 },
};

function computeScore(row, persona) {
  const w = WEIGHTS[persona] || WEIGHTS.comerciante;
  const otif = clamp(row.otif_pct, 0, 100)/100;
  const lead = 1 - clamp(row.lead_time_var, 0, 100)/100;
  const claims = 1 - clamp(row.claims_rate, 0, 100)/100;
  const compl = row.compliance_ok ? 1 : 0;
  const spendTrust = clamp(row.spend_share, 0, 100)/100;
  const s = (otif*w.otif)+(lead*w.lead_var)+(claims*w.claims)+(compl*w.compliance)+(spendTrust*w.spend_trust);
  return Math.round(s*100);
}

function clamp(n, a, b){ return Math.max(a, Math.min(b, Number(n)||0)); }

function riskBucket(row){
  const impacto = clamp(row.spend_share,0,100);
  const riesgoS = 100 - clamp(row.otif_pct,0,100);
  if(impacto>=60 && riesgoS>=40) return 'alto';
  if(impacto>=40 || riesgoS>=25) return 'medio';
  return 'bajo';
}

const seedRows = [
  { id:'SUP-001', name:'Transporte Atlas', category:'logistica', otif_pct:94, lead_time_var:12, claims_rate:3, compliance_ok:true, spend_share:28 },
  { id:'SUP-002', name:'Maritimos XXI', category:'logistica', otif_pct:88, lead_time_var:22, claims_rate:6, compliance_ok:false, spend_share:41 },
  { id:'SUP-003', name:'Industrias Norte', category:'directo', otif_pct:97, lead_time_var:8, claims_rate:1, compliance_ok:true, spend_share:12 },
  { id:'SUP-004', name:'Global Freight', category:'logistica', otif_pct:92, lead_time_var:15, claims_rate:2, compliance_ok:true, spend_share:33 },
  { id:'SUP-005', name:'Materials Corp', category:'indirecto', otif_pct:89, lead_time_var:18, claims_rate:4, compliance_ok:false, spend_share:19 },
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

export default function ProveedoresWorkbench() {
  const { persona } = useOverlay();
  const [activeTab, setActiveTab] = useState('activos');
  const [filters, setFilters] = useState({
    search: '',
    category: 'todos',
    risk: 'todos'
  });
  const [rows] = useState(seedRows);
  const [busyChip, setBusyChip] = useState(null);

  const data = useMemo(()=>{
    return rows.map(r => ({ ...r, score: computeScore(r, persona), risk: riskBucket(r) }));
  }, [rows, persona]);

  const filteredData = useMemo(()=>{
    return data.filter(r => {
      const searchMatch = !filters.search || 
        r.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        r.id.toLowerCase().includes(filters.search.toLowerCase());
      const categoryMatch = filters.category === 'todos' || r.category === filters.category;
      const riskMatch = filters.risk === 'todos' || r.risk === filters.risk;
      
      // Filter by tab
      let tabMatch = true;
      if (activeTab === 'riesgo') {
        tabMatch = r.risk === 'alto' || r.risk === 'medio';
      } else if (activeTab === 'bloqueados') {
        tabMatch = !r.compliance_ok;
      } else if (activeTab === 'activos') {
        tabMatch = r.compliance_ok;
      }
      
      return searchMatch && categoryMatch && riskMatch && tabMatch;
    });
  }, [data, filters, activeTab]);

  // AI Chips handlers
  const onEvaluarProveedores = async () => {
    setBusyChip('evaluar');
    const res = await invokeAi({
      action: 'evaluar_proveedores',
      context: { persona, submodule: 'proveedores' },
      payload: { total_suppliers: data.length, low_score: data.filter(r => r.score < 70).length }
    });
    setBusyChip(null);
    
    if (res.ok) {
      alert(`AI Evaluación: ${data.filter(r => r.score < 70).length} proveedores necesitan mejoras en scoring`);
    } else {
      alert(`AI error: ${res.error}`);
    }
  };

  const onOptimizarCartera = async () => {
    setBusyChip('optimizar');
    const res = await invokeAi({
      action: 'optimizar_cartera',
      context: { persona, submodule: 'proveedores' },
      payload: { active_suppliers: data.filter(r => r.compliance_ok).length }
    });
    setBusyChip(null);
    
    if (res.ok) {
      alert('AI Optimización: Cartera balanceada, considerar consolidar proveedores de baja rotación');
    } else {
      alert(`AI error: ${res.error}`);
    }
  };

  const onDetectarRiesgos = async () => {
    setBusyChip('riesgos');
    const highRisk = data.filter(r => r.risk === 'alto').length;
    const res = await invokeAi({
      action: 'detectar_riesgos',
      context: { persona, submodule: 'proveedores' },
      payload: { high_risk_count: highRisk }
    });
    setBusyChip(null);
    
    if (res.ok) {
      alert(`AI Riesgos: ${highRisk} proveedores de alto riesgo identificados`);
    } else {
      alert(`AI error: ${res.error}`);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'todos',
      risk: 'todos'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'alto': return 'bg-red-100 text-red-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'bajo': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif', backgroundColor: '#F1F0EC', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Gestión de Proveedores
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Scorecard, evaluación y gestión de riesgos de la cartera de proveedores
          </p>
        </div>
        <Button style={{ backgroundColor: '#4472C4' }} className="text-white">
          <UserPlus className="w-4 h-4 mr-2" />
          Invitar Proveedor
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Proveedores Activos"
          value={data.filter(r => r.compliance_ok).length}
          trend="+2 este mes"
          icon={Users}
          color="bg-blue-100 text-blue-600"
        />
        <KPICard
          title="Score Promedio"
          value={Math.round(data.reduce((acc, r) => acc + r.score, 0) / data.length)}
          trend="+3.2 pts"
          icon={Award}
          color="bg-green-100 text-green-600"
        />
        <KPICard
          title="Alto Riesgo"
          value={data.filter(r => r.risk === 'alto').length}
          trend="-1 vs anterior"
          icon={AlertTriangle}
          color="bg-red-100 text-red-600"
        />
        <KPICard
          title="OTIF Cartera"
          value={`${Math.round(data.reduce((acc, r) => acc + r.otif_pct, 0) / data.length)}%`}
          trend="+2.1pp"
          icon={TrendingUp}
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
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm">Evaluar Proveedores</h4>
                  <p className="text-xs text-blue-700 mt-1">Revisar scoring y métricas de desempeño</p>
                </div>
              </div>
              <button
                className="w-full px-3 py-1.5 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                onClick={onEvaluarProveedores}
                disabled={busyChip === 'evaluar'}
              >
                {busyChip === 'evaluar' ? 'Evaluando...' : 'Evaluar Cartera'}
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm">Optimizar Cartera</h4>
                  <p className="text-xs text-blue-700 mt-1">Balancear concentración y diversificación</p>
                </div>
              </div>
              <button
                className="w-full px-3 py-1.5 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                onClick={onOptimizarCartera}
                disabled={busyChip === 'optimizar'}
              >
                {busyChip === 'optimizar' ? 'Analizando...' : 'Optimizar Portfolio'}
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm">Detectar Riesgos</h4>
                  <p className="text-xs text-blue-700 mt-1">Identificar patrones de riesgo emergente</p>
                </div>
              </div>
              <button
                className="w-full px-3 py-1.5 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                onClick={onDetectarRiesgos}
                disabled={busyChip === 'riesgos'}
              >
                {busyChip === 'riesgos' ? 'Detectando...' : 'Analizar Riesgos'}
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
            
            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.risk} onValueChange={(value) => setFilters(prev => ({ ...prev, risk: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Riesgo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {RISK_LEVELS.map(risk => (
                  <SelectItem key={risk} value={risk}>{risk}</SelectItem>
                ))}
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
              <TabsTrigger value="activos" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                Activos ({data.filter(r => r.compliance_ok).length})
              </TabsTrigger>
              <TabsTrigger value="riesgo" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                En Riesgo ({data.filter(r => r.risk === 'alto' || r.risk === 'medio').length})
              </TabsTrigger>
              <TabsTrigger value="bloqueados" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                Bloqueados ({data.filter(r => !r.compliance_ok).length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>OTIF %</TableHead>
                    <TableHead>Claims %</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Riesgo</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map(supplier => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.id}</TableCell>
                      <TableCell>{supplier.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{supplier.category}</Badge>
                      </TableCell>
                      <TableCell>{supplier.otif_pct}%</TableCell>
                      <TableCell>{supplier.claims_rate}%</TableCell>
                      <TableCell>
                        {supplier.compliance_ok ? (
                          <Badge className="bg-green-100 text-green-800">OK</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Bloqueado</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getScoreColor(supplier.score)}>
                          {supplier.score}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskColor(supplier.risk)}>
                          {supplier.risk}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
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
              
              {filteredData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Sin registros</p>
                  <p className="text-sm">Ajusta los filtros o agrega nuevos proveedores</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}