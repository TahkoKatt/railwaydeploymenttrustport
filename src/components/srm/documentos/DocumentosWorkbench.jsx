
// components/srm/documentos/DocumentosWorkbench.jsx
import { useState, useMemo } from 'react';
import { invokeAi } from '@/components/srm/ai/invokeAi';
import { useOverlay } from '@/components/srm/OverlayProvider';
import {
  Upload, Search, Filter, Download, FileText, AlertTriangle, CheckCircle,
  Clock, TrendingUp, Eye, MoreHorizontal, Shield, Bell, Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock documents data
const mockDocuments = [
  {
    id: "DOC-001",
    supplier: "Transportes SA",
    type: "contrato",
    issued_at: "2024-01-15",
    expires_at: "2024-12-31",
    has_file: true,
    file_url: "/docs/contrato-transportes-sa.pdf"
  },
  {
    id: "DOC-002",
    supplier: "Maritimos XXI",
    type: "seguro",
    issued_at: "2023-06-01",
    expires_at: "2024-05-31",
    has_file: false,
    file_url: null
  },
  {
    id: "DOC-003",
    supplier: "Industrias Norte",
    type: "certificado_iso",
    issued_at: "2024-03-01",
    expires_at: "2025-03-01",
    has_file: true,
    file_url: "/docs/iso-industrias-norte.pdf"
  },
  {
    id: "DOC-004",
    supplier: "Global Freight",
    type: "contrato",
    issued_at: null,
    expires_at: "2024-12-15",
    has_file: false,
    file_url: null
  },
  {
    id: "DOC-005",
    supplier: "Materials Corp",
    type: "seguro",
    issued_at: "2024-02-01",
    expires_at: "2025-01-15",
    has_file: true,
    file_url: "/docs/seguro-materials-corp.pdf"
  },
  {
    id: "DOC-006",
    supplier: "Cargo Express",
    type: "contrato",
    issued_at: "2024-01-01",
    expires_at: "2024-01-20", // Already expired
    has_file: true,
    file_url: "/docs/contrato-cargo-express.pdf"
  }
];

const DOCUMENT_TYPES = ['contrato', 'seguro', 'certificado_iso', 'licencia', 'registro_sanitario'];
const CRITICAL_TYPES = ['contrato', 'seguro']; // Types that are critical when missing

// Calculate document status
function statusOf(row) {
  if (!row.has_file && !row.issued_at) {
    return 'missing';
  }
  if (!row.has_file) {
    return 'missing';
  }
  if (!row.expires_at) {
    return 'valid';
  }

  const daysToExpiry = daysTo(row.expires_at);
  if (daysToExpiry < 0) {
    return 'expired';
  }
  if (daysToExpiry <= 30) {
    return 'due_soon';
  }
  return 'valid';
}

// Calculate days to expiry
function daysTo(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  const expiry = new Date(dateStr);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
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

export default function DocumentosWorkbench() {
  const { persona } = useOverlay();
  const [activeTab, setActiveTab] = useState('pendientes');
  const [documents, setDocuments] = useState(mockDocuments);
  const [filters, setFilters] = useState({
    search: '',
    type: 'todos'
  });
  const [busyChip, setBusyChip] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(null);

  // Calculate processed documents with status
  const processedDocs = useMemo(() => {
    return documents.map(doc => ({
      ...doc,
      status: statusOf(doc),
      days_to_expiry: daysTo(doc.expires_at)
    }));
  }, [documents]);

  // snapshot simple para Riesgo (supplier, type, has_file) - BRIDGE-LITE
  try {
    const snapshot = processedDocs.map(r => ({
      supplier: r.supplier,
      type: r.type,
      has_file: r.has_file
    }));
    localStorage.setItem('srm_docs_snapshot', JSON.stringify(snapshot));
  } catch (e) {
      console.error("Failed to save documents snapshot to localStorage:", e);
  }


  // Calculate KPIs
  const kpis = useMemo(() => {
    const valid = processedDocs.filter(d => d.status === 'valid').length;
    const due_soon = processedDocs.filter(d => d.status === 'due_soon').length;
    const expired = processedDocs.filter(d => d.status === 'expired').length;
    const faltantes_criticos = processedDocs.filter(d =>
      d.status === 'missing' && CRITICAL_TYPES.includes(d.type)
    ).length;

    return { valid, due_soon, expired, faltantes_criticos };
  }, [processedDocs]);

  // Filter documents
  const filteredDocs = useMemo(() => {
    let filtered = processedDocs.filter(doc => {
      const searchMatch = !filters.search ||
        doc.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        doc.supplier.toLowerCase().includes(filters.search.toLowerCase());

      const typeMatch = filters.type === 'todos' || doc.type === filters.type;

      return searchMatch && typeMatch;
    });

    // Filter by tab
    switch (activeTab) {
      case 'pendientes':
        return filtered.filter(d => d.status === 'missing' || d.status === 'due_soon');
      case 'vigentes':
        return filtered.filter(d => d.status === 'valid');
      case 'vencidos':
        return filtered.filter(d => d.status === 'expired');
      case 'todos':
      default:
        return filtered;
    }
  }, [processedDocs, filters, activeTab]);

  // AI Chips handlers
  const onValidarCompliance = async () => {
    setBusyChip('compliance');
    const res = await invokeAi({
      action: 'validar_compliance',
      context: { persona, submodule: 'documentos' },
      payload: {
        total_docs: processedDocs.length,
        missing_critical: kpis.faltantes_criticos,
        expired: kpis.expired
      }
    });
    setBusyChip(null);

    if (res.ok) {
      alert(`AI Compliance: ${kpis.faltantes_criticos} documentos críticos faltantes, ${kpis.expired} vencidos requieren atención inmediata`);
    } else {
      alert(`AI error: ${res.error}`);
    }
  };

  const onGenerarRecordatorios = async () => {
    setBusyChip('recordatorios');
    const res = await invokeAi({
      action: 'generar_recordatorios',
      context: { persona, submodule: 'documentos' },
      payload: { due_soon_count: kpis.due_soon }
    });
    setBusyChip(null);

    if (res.ok) {
      alert(`AI Recordatorios: ${kpis.due_soon} notificaciones de vencimiento programadas para próximos 30 días`);
    } else {
      alert(`AI error: ${res.error}`);
    }
  };

  const onAuditarHistorial = async () => {
    setBusyChip('auditar');
    const totalFiles = processedDocs.filter(d => d.has_file).length;
    const res = await invokeAi({
      action: 'auditar_historial',
      context: { persona, submodule: 'documentos' },
      payload: { files_count: totalFiles }
    });
    setBusyChip(null);

    if (res.ok) {
      alert(`AI Auditoría: ${totalFiles} archivos analizados, 2 inconsistencias en fechas detectadas`);
    } else {
      alert(`AI error: ${res.error}`);
    }
  };

  // Handle file upload (stub)
  const onUpload = (docId) => {
    setUploadingDoc(docId);

    // Simulate file upload
    setTimeout(() => {
      setDocuments(prevDocs =>
        prevDocs.map(doc =>
          doc.id === docId
            ? {
                ...doc,
                has_file: true,
                file_url: `/docs/uploaded-${docId.toLowerCase()}.pdf`,
                issued_at: doc.issued_at || new Date().toISOString().split('T')[0]
              }
            : doc
        )
      );
      setUploadingDoc(null);
    }, 1500);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'todos'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'due_soon': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'missing': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'valid': return 'Válido';
      case 'due_soon': return 'Por Vencer';
      case 'expired': return 'Vencido';
      case 'missing': return 'Faltante';
      default: return status;
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      contrato: 'Contrato',
      seguro: 'Seguro',
      certificado_iso: 'Certificado ISO',
      licencia: 'Licencia',
      registro_sanitario: 'Reg. Sanitario'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif', backgroundColor: '#F1F0EC', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Gestión Documental
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Control de vencimientos y compliance documental de proveedores
          </p>
        </div>
        <Button style={{ backgroundColor: '#4472C4' }} className="text-white">
          <Upload className="w-4 h-4 mr-2" />
          Subir Documento
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Documentos Válidos"
          value={kpis.valid}
          trend="+3 renovados"
          icon={CheckCircle}
          color="bg-green-100 text-green-600"
        />
        <KPICard
          title="Por Vencer (30d)"
          value={kpis.due_soon}
          trend="Requieren acción"
          icon={Clock}
          color="bg-yellow-100 text-yellow-600"
        />
        <KPICard
          title="Vencidos"
          value={kpis.expired}
          trend={kpis.expired > 0 ? "Atención urgente" : "Sin vencidos"}
          icon={AlertTriangle}
          color="bg-red-100 text-red-600"
        />
        <KPICard
          title="Faltantes Críticos"
          value={kpis.faltantes_criticos}
          trend={kpis.faltantes_criticos > 0 ? "Bloquean operación" : "Completo"}
          icon={Shield}
          color="bg-red-100 text-red-600"
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
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm">Validar Compliance</h4>
                  <p className="text-xs text-blue-700 mt-1">Verificar cumplimiento documental integral</p>
                </div>
              </div>
              <button
                className="w-full px-3 py-1.5 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                onClick={onValidarCompliance}
                disabled={busyChip === 'compliance'}
                aria-busy={busyChip === 'compliance'}
              >
                {busyChip === 'compliance' ? 'Validando...' : 'Validar Compliance'}
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm">Generar Recordatorios</h4>
                  <p className="text-xs text-blue-700 mt-1">Programar alertas de vencimientos</p>
                </div>
              </div>
              <button
                className="w-full px-3 py-1.5 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                onClick={onGenerarRecordatorios}
                disabled={busyChip === 'recordatorios'}
                aria-busy={busyChip === 'recordatorios'}
              >
                {busyChip === 'recordatorios' ? 'Generando...' : 'Programar Alertas'}
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm">Auditar Historial</h4>
                  <p className="text-xs text-blue-700 mt-1">Revisar consistencia de archivos</p>
                </div>
              </div>
              <button
                className="w-full px-3 py-1.5 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                onClick={onAuditarHistorial}
                disabled={busyChip === 'auditar'}
                aria-busy={busyChip === 'auditar'}
              >
                {busyChip === 'auditar' ? 'Auditando...' : 'Auditar Archivos'}
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
                placeholder="Buscar documento o proveedor..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>

            <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {DOCUMENT_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{getTypeLabel(type)}</SelectItem>
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
              <TabsTrigger value="pendientes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                Pendientes ({processedDocs.filter(d => d.status === 'missing' || d.status === 'due_soon').length})
              </TabsTrigger>
              <TabsTrigger value="vigentes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                Vigentes ({processedDocs.filter(d => d.status === 'valid').length})
              </TabsTrigger>
              <TabsTrigger value="vencidos" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                Vencidos ({processedDocs.filter(d => d.status === 'expired').length})
              </TabsTrigger>
              <TabsTrigger value="todos" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
                Todos ({processedDocs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha Emisión</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Días Restantes</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocs.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.id}</TableCell>
                      <TableCell>{doc.supplier}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          CRITICAL_TYPES.includes(doc.type) ? 'border-red-300 text-red-700 bg-red-50' : 'border-gray-300'
                        }>
                          {getTypeLabel(doc.type)}
                          {CRITICAL_TYPES.includes(doc.type) && <span className="ml-1">*</span>}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {doc.issued_at ? new Date(doc.issued_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        {doc.expires_at ? new Date(doc.expires_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        {doc.days_to_expiry !== null ? (
                          <span className={
                            doc.days_to_expiry < 0 ? 'text-red-600' :
                            doc.days_to_expiry <= 30 ? 'text-yellow-600' : 'text-green-600'
                          }>
                            {doc.days_to_expiry < 0 ? `${Math.abs(doc.days_to_expiry)} días venc.` : `${doc.days_to_expiry} días`}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(doc.status)}>
                          {getStatusLabel(doc.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {doc.status === 'missing' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onUpload(doc.id)}
                              disabled={uploadingDoc === doc.id}
                            >
                              {uploadingDoc === doc.id ? (
                                <Clock className="w-3 h-3 animate-spin" />
                              ) : (
                                <Upload className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                          {doc.has_file && (
                            <Button variant="ghost" size="sm">
                              <Eye className="w-3 h-3" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredDocs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Sin registros</p>
                  <p className="text-sm">Ajusta los filtros o sube nuevos documentos</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Critical Types Legend */}
      <div className="text-xs text-gray-500">
        <p>* Tipos críticos: documentos obligatorios para operación (Contrato, Seguro)</p>
      </div>
    </div>
  );
}
