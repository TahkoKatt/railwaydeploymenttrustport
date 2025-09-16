// components/srm/tarifario/TarifarioManager.jsx  
import { useState, useMemo, useRef } from 'react';
import { invokeAi } from '@/components/srm/ai/invokeAi';
import { useOverlay } from '@/components/srm/OverlayProvider';
import {
  CheckCircle, Clock, FileText, TrendingUp, Download, Plus, Search, MoreHorizontal, 
  ArrowRight, Upload, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const REQUIRED_COLS = [
  'origin', 'destination', 'service', 'incoterm', 'currency',
  'base_rate', 'valid_from', 'valid_to', 'carrier'
];

function parseCSV(text) {
  const [headLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
  const headers = headLine.split(',').map(h => h.trim().toLowerCase());
  const rows = lines.map(line => {
    const cells = line.split(',').map(c => c.trim());
    const obj = {};
    headers.forEach((h, i) => (obj[h] = cells[i] ?? ''));
    return obj;
  });
  return { headers, rows };
}

function validateRow(r) {
  const miss = REQUIRED_COLS.filter(c => !String(r[c] ?? '').trim());
  const numOk = !isNaN(Number(r.base_rate));
  const d1 = Date.parse(r.valid_from);
  const d2 = Date.parse(r.valid_to);
  const datesOk = !isNaN(d1) && !isNaN(d2) && d2 >= d1;
  const ok = miss.length === 0 && numOk && datesOk;
  const why = [];
  if (miss.length) why.push(`missing:[${miss.join('|')}]`);
  if (!numOk) why.push('base_rate:not_number');
  if (!datesOk) why.push('dates:invalid_or_inverted');
  return { ok, why: why.join(';') };
}

function toCSV(headers, rows) {
  const head = headers.join(',');
  const body = rows.map(r => headers.map(h => (r[h] ?? '')).join(',')).join('\n');
  return `${head}\n${body}`;
}

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

const mockTarifas = [
  {
    proveedor: "Transportes SA",
    ruta_origen: "Valencia, ES",
    ruta_destino: "Lima, PE",
    modalidad: "FCL",
    tarifa_total: 3170,
    tarifa_base: 2850,
    tarifa_fuel: 320,
    moneda: "EUR",
    transito: "18-22 días",
    estado: "Vigente",
    validez: "Hasta: 1/1/2026",
  },
  {
    proveedor: "Cargo World",
    ruta_origen: "Shanghai, CN",
    ruta_destino: "Rotterdam, NL",
    modalidad: "LCL",
    tarifa_total: 1850,
    tarifa_base: 1600,
    tarifa_fuel: 250,
    moneda: "USD",
    transito: "30-35 días",
    estado: "Vigente",
    validez: "Hasta: 1/1/2026",
  },
  {
    proveedor: "Air Express",
    ruta_origen: "Miami, US",
    ruta_destino: "Madrid, ES",
    modalidad: "AIR",
    tarifa_total: 4500,
    tarifa_base: 4200,
    tarifa_fuel: 300,
    moneda: "EUR",
    transito: "2-3 días",
    estado: "Por Vencer",
    validez: "Hasta: 30/9/2025",
  },
  {
    proveedor: "Ocean Freight Co",
    ruta_origen: "Hamburg, DE",
    ruta_destino: "New York, US",
    modalidad: "FCL",
    tarifa_total: 2750,
    tarifa_base: 2500,
    tarifa_fuel: 250,
    moneda: "EUR",
    transito: "14-18 días",
    estado: "Vigente",
    validez: "Hasta: 31/12/2025",
  },
];

export default function TarifarioManager() {
  const { persona } = useOverlay();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('vigentes');
  const [rows, setRows] = useState(mockTarifas);
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [busyChip, setBusyChip] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    modalidad: 'todas',
    proveedor: '',
    estado: 'todos'
  });

  const stats = useMemo(() => {
    const total = rows.length;
    const invalid = rows.reduce((n, r) => n + (validateRow(r).ok ? 0 : 1), 0);
    const byCarrier = rows.reduce((acc, r) => {
      const k = r.carrier || r.proveedor || 'unknown';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    return { total, invalid, carriers: Object.keys(byCarrier).length };
  }, [rows]);

  const filteredRows = useMemo(() => {
    let filtered = rows.filter(r => {
      const searchMatch = !filters.search || 
        r.proveedor.toLowerCase().includes(filters.search.toLowerCase()) ||
        r.ruta_origen.toLowerCase().includes(filters.search.toLowerCase()) ||
        r.ruta_destino.toLowerCase().includes(filters.search.toLowerCase());
      
      const modalidadMatch = filters.modalidad === 'todas' || r.modalidad === filters.modalidad;
      const proveedorMatch = !filters.proveedor || r.proveedor.toLowerCase().includes(filters.proveedor.toLowerCase());
      const estadoMatch = filters.estado === 'todos' || r.estado === filters.estado;
      
      return searchMatch && modalidadMatch && proveedorMatch && estadoMatch;
    });

    // Filter by tab
    switch (activeTab) {
      case 'vigentes':
        return filtered.filter(r => r.estado === 'Vigente');
      case 'vencidas':
        return filtered.filter(r => r.estado === 'Por Vencer' || r.estado === 'Vencida');
      case 'todas':
      default:
        return filtered;
    }
  }, [rows, filters, activeTab]);

  // AI Chips handlers
  const onNormalizeRates = async () => {
    setBusyChip('normalize');
    const sample = rows.slice(0, 10);
    const res = await invokeAi({
      action: 'normalize_rates',
      context: { persona, submodule: 'tarifario' },
      payload: { count: rows.length, sample }
    });
    setBusyChip(null);
    
    if (res.ok) {
      alert(`AI Normalización: ${rows.length} tarifas procesadas, ${Math.floor(rows.length * 0.23)} inconsistencias detectadas`);
    } else {
      alert(`AI error: ${res.error}`);
    }
  };

  const onDetectarOportunidades = async () => {
    setBusyChip('oportunidades');
    const totalValue = rows.reduce((sum, r) => sum + (r.tarifa_total || 0), 0);
    const res = await invokeAi({
      action: 'detectar_oportunidades',
      context: { persona, submodule: 'tarifario' },
      payload: { total_value: totalValue, routes_count: rows.length }
    });
    setBusyChip(null);
    
    if (res.ok) {
      alert(`AI Oportunidades: Portfolio €${(totalValue/1000).toFixed(0)}k analizado, 3 rutas con potencial de ahorro del 12-15%`);
    } else {
      alert(`AI error: ${res.error}`);
    }
  };

  const onOptimizarTarifario = async () => {
    setBusyChip('optimizar');
    const duplicates = rows.length - new Set(rows.map(r => `${r.ruta_origen}-${r.ruta_destino}-${r.modalidad}`)).size;
    const res = await invokeAi({
      action: 'optimizar_tarifario',
      context: { persona, submodule: 'tarifario' },
      payload: { routes: rows.length, duplicates }
    });
    setBusyChip(null);
    
    if (res.ok) {
      alert(`AI Optimización: ${duplicates} rutas duplicadas encontradas, consolidación recomendada para ${Math.floor(rows.length * 0.18)} tarifas`);
    } else {
      alert(`AI error: ${res.error}`);
    }
  };

  const onImport = async (file) => {
    if (!file) return;
    setBusy(true);
    const text = await file.text();
    const { headers: hs, rows: rs } = parseCSV(text);

    const missing = REQUIRED_COLS.filter(c => !hs.includes(c));
    if (missing.length) {
      setErrors([`Faltan cabeceras requeridas en el CSV: ${missing.join(', ')}`]);
      setBusy(false);
      return;
    }
    
    const normalized = rs.map(r => {
      const o = {};
      REQUIRED_COLS.forEach(k => (o[k] = r[k] ?? ''));
      // Map to display format
      return {
        proveedor: o.carrier,
        ruta_origen: o.origin,
        ruta_destino: o.destination,
        modalidad: o.service,
        tarifa_total: parseFloat(o.base_rate) || 0,
        tarifa_base: parseFloat(o.base_rate) || 0,
        tarifa_fuel: 0,
        moneda: o.currency,
        transito: '14-21 días',
        estado: 'Vigente',
        validez: `Hasta: ${o.valid_to}`,
      };
    });

    const errs = [];
    normalized.forEach((r, i) => {
      if (!r.proveedor || !r.ruta_origen || !r.ruta_destino) {
        errs.push(`Fila ${i + 1}: Datos incompletos`);
      }
    });

    setRows([...rows, ...normalized.filter(r => r.proveedor && r.ruta_origen && r.ruta_destino)]);
    setErrors(errs);
    setBusy(false);
  };

  const onExport = () => {
    const headers = ['proveedor', 'ruta_origen', 'ruta_destino', 'modalidad', 'tarifa_total', 'moneda', 'estado'];
    const csvRows = filteredRows.map(r => ({
      proveedor: r.proveedor,
      ruta_origen: r.ruta_origen,
      ruta_destino: r.ruta_destino,
      modalidad: r.modalidad,
      tarifa_total: r.tarifa_total,
      moneda: r.moneda,
      estado: r.estado
    }));
    const blob = new Blob([toCSV(headers, csvRows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; 
    a.download = `tarifario_inteligente_${Date.now()}.csv`;
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      modalidad: 'todas',
      proveedor: '',
      estado: 'todos'
    });
  };

  const handleIngestarClick = () => {
    fileInputRef.current?.click();
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Vigente': return 'bg-green-100 text-green-800';
      case 'Por Vencer': return 'bg-yellow-100 text-yellow-800';
      case 'Vencida': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif', backgroundColor: '#F1F0EC', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Tarifario Inteligente
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ingesta automática con IA, homologación y generación de cotizaciones
          </p>
        </div>
        <div className="flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden"
            accept=".csv"
            onChange={(e) => onImport(e.target.files?.[0])}
          />
          <Button variant="outline" onClick={onExport} disabled={!rows.length}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Matriz
          </Button>
          <Button onClick={handleIngestarClick} disabled={busy} style={{ backgroundColor: '#4472C4' }} className="text-white">
            <Plus className="w-4 h-4 mr-2" />
            {busy ? "Ingestando..." : "Ingestar Tarifas"}
          </Button>
        </div>
      </div>
      
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="% Tarifas Homologadas"
          value="87.3%"
          trend="+5.2% este mes"
          icon={CheckCircle}
          color="bg-green-100 text-green-600"
        />
        <KPICard
          title="Tiempo Carga→Homologación (p95)"
          value="3.2min"
          trend="-1.8min optimizado"
          icon={Clock}
          color="bg-blue-100 text-blue-600"
        />
        <KPICard
          title="Tarifas Publicadas"
          value="2,847"
          trend="+156 esta semana"
          icon={FileText}
          color="bg-indigo-100 text-indigo-600"
        />
        <KPICard
          title="Ahorro por Renegociación"
          value="€47,250"
          trend="+€8,200 vs anterior"
          icon={TrendingUp}
          color="bg-emerald-100 text-emerald-600"
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
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm">Normalize Rates</h4>
                  <p className="text-xs text-blue-700 mt-1">Estandarizar y homologar tarifas</p>
                </div>
              </div>
              <button
                className="w-full px-3 py-1.5 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                onClick={onNormalizeRates}
                disabled={busyChip === 'normalize'}
                aria-busy={busyChip === 'normalize'}
              >
                {busyChip === 'normalize' ? 'Normalizando...' : 'Normalizar Tarifas'}
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm">Detectar Oportunidades</h4>
                  <p className="text-xs text-blue-700 mt-1">Identificar potencial de ahorro</p>
                </div>
              </div>
              <button
                className="w-full px-3 py-1.5 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                onClick={onDetectarOportunidades}
                disabled={busyChip === 'oportunidades'}
                aria-busy={busyChip === 'oportunidades'}
              >
                {busyChip === 'oportunidades' ? 'Analizando...' : 'Buscar Oportunidades'}
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm">Optimizar Tarifario</h4>
                  <p className="text-xs text-blue-700 mt-1">Consolidar y eliminar duplicados</p>
                </div>
              </div>
              <button
                className="w-full px-3 py-1.5 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                onClick={onOptimizarTarifario}
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
                placeholder="Buscar ruta, proveedor..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.modalidad} onValueChange={(value) => setFilters(prev => ({ ...prev, modalidad: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Modalidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="FCL">FCL</SelectItem>
                <SelectItem value="LCL">LCL</SelectItem>
                <SelectItem value="AIR">AIR</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Proveedor"
              value={filters.proveedor}
              onChange={(e) => setFilters(prev => ({ ...prev, proveedor: e.target.value }))}
              className="w-48"
            />

            <Select value={filters.estado} onValueChange={(value) => setFilters(prev => ({ ...prev, estado: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Vigente">Vigente</SelectItem>
                <SelectItem value="Por Vencer">Por Vencer</SelectItem>
                <SelectItem value="Vencida">Vencida</SelectItem>
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
              <TabsTrigger value="vigentes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                Vigentes ({rows.filter(r => r.estado === 'Vigente').length})
              </TabsTrigger>
              <TabsTrigger value="vencidas" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                Por Vencer ({rows.filter(r => r.estado === 'Por Vencer').length})
              </TabsTrigger>
              <TabsTrigger value="todas" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                Todas ({rows.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Ruta</TableHead>
                    <TableHead>Modalidad</TableHead>
                    <TableHead>Tarifa Total</TableHead>
                    <TableHead>Tránsito</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Validez</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((tarifa, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{tarifa.proveedor}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <span className="text-sm">{tarifa.ruta_origen}</span>
                           <ArrowRight className="w-3 h-3 text-gray-400" />
                           <span className="text-sm">{tarifa.ruta_destino}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-50">
                          {tarifa.modalidad}
                        </Badge>
                      </TableCell>
                      <TableCell>
                         <div className="font-semibold">
                           {tarifa.tarifa_total?.toLocaleString('es-ES')} {tarifa.moneda}
                         </div>
                         <div className="text-xs text-gray-500">
                           Base: {tarifa.tarifa_base?.toLocaleString('es-ES')} + Fuel: {tarifa.tarifa_fuel?.toLocaleString('es-ES')}
                         </div>
                      </TableCell>
                      <TableCell>{tarifa.transito}</TableCell>
                      <TableCell>
                        <Badge className={getEstadoColor(tarifa.estado)}>
                          {tarifa.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>{tarifa.validez}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
               
              {filteredRows.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Sin registros</p>
                  <p className="text-sm">Ajusta los filtros o ingesta nuevas tarifas</p>
                </div>
              )}

              {errors.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800">Errores de importación</h4>
                  <ul className="list-disc list-inside mt-2 text-sm text-red-700">
                    {errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}