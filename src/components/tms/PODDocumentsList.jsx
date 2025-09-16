import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, Filter, FileText, Eye, Download, AlertTriangle,
  CheckCircle, Clock, X, MoreHorizontal, Upload, Send, Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const mockDocuments = [
  {
    id: "DOC-001",
    type: "albaran",
    reference: "ALB-2025-001234",
    client: "Mercadona Valencia",
    driver: "María Ortega",
    vehicle: "1234ABC",
    route: "Ruta Valencia Centro",
    deliveryDate: "26/08/2025",
    deliveryTime: "14:30",
    status: "delivered",
    signedBy: "Juan García",
    signatureTime: "26/08/2025 14:35",
    documents: ["albarán", "firma"],
    issues: []
  },
  {
    id: "DOC-002", 
    type: "cmr",
    reference: "CMR-2025-005678",
    client: "El Corte Inglés Madrid",
    driver: "Luis Pérez",
    vehicle: "5678DEF",
    route: "Ruta Madrid Norte",
    deliveryDate: "26/08/2025",
    deliveryTime: "16:45",
    status: "pending",
    signedBy: null,
    signatureTime: null,
    documents: ["cmr"],
    issues: []
  },
  {
    id: "DOC-003",
    type: "albaran",
    reference: "ALB-2025-001235",
    client: "Carrefour Barcelona",
    driver: "Ana García", 
    vehicle: "9876GHI",
    route: "Ruta BCN Sur",
    deliveryDate: "26/08/2025",
    deliveryTime: "12:15",
    status: "late",
    signedBy: null,
    signatureTime: null,
    documents: ["albarán"],
    issues: ["Retraso 45 min"]
  },
  {
    id: "DOC-004",
    type: "factura",
    reference: "FAC-2025-000892",
    client: "Alcampo Sevilla",
    driver: "Carlos Ruiz",
    vehicle: "4567JKL",
    route: "Ruta Sevilla Express",
    deliveryDate: "25/08/2025",
    deliveryTime: "11:20",
    status: "issue",
    signedBy: "Rechazado",
    signatureTime: "25/08/2025 11:25",
    documents: ["factura", "rechazo"],
    issues: ["Productos dañados", "Falta mercancía"]
  }
];

export default function PODDocumentsList() {
  const [documents] = useState(mockDocuments);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'deliveryDate',
    direction: 'desc'
  });

  // Configuración de estados según JSON
  const statusConfig = {
    pending: { bg: "#F3F4F6", color: "#374151", label: "Pendiente", icon: Clock },
    delivered: { bg: "rgba(16,185,129,0.12)", color: "#10B981", label: "Entregado", icon: CheckCircle },
    late: { bg: "rgba(219,33,66,0.12)", color: "#DB2142", label: "Retrasado", icon: AlertTriangle },
    issue: { bg: "rgba(245,158,11,0.12)", color: "#F59E0B", label: "Incidencia", icon: X }
  };

  // Tipos de documento según JSON
  const documentTypes = {
    albaran: { label: "Albarán", icon: FileText },
    cmr: { label: "CMR", icon: FileText },
    factura: { label: "Factura", icon: FileText },
    pod: { label: "POD", icon: FileText }
  };

  const handleSelectAll = (checked) => {
    setSelectedDocs(checked ? filteredDocuments.map(doc => doc.id) : []);
  };

  const handleSelectDoc = (docId, checked) => {
    setSelectedDocs(prev => 
      checked 
        ? [...prev, docId]
        : prev.filter(id => id !== docId)
    );
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleBulkAction = (action) => {
    const actions = {
      download: () => toast.success(`Descargando ${selectedDocs.length} documentos`),
      resend: () => toast.success(`Reenviando ${selectedDocs.length} documentos`),
      archive: () => toast.success(`Archivando ${selectedDocs.length} documentos`)
    };
    actions[action]?.();
    setSelectedDocs([]);
  };

  const filteredDocuments = documents.filter(doc => {
    const searchMatch = !filters.search ||
      doc.reference.toLowerCase().includes(filters.search.toLowerCase()) ||
      doc.client.toLowerCase().includes(filters.search.toLowerCase()) ||
      doc.driver.toLowerCase().includes(filters.search.toLowerCase()) ||
      doc.route.toLowerCase().includes(filters.search.toLowerCase());

    const statusMatch = filters.status === 'all' || doc.status === filters.status;
    const typeMatch = filters.type === 'all' || doc.type === filters.type;

    return searchMatch && statusMatch && typeMatch;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    const aValue = sortConfig.key === 'deliveryDate' 
      ? new Date(a.deliveryDate.split('/').reverse().join('-'))
      : a[sortConfig.key];
    const bValue = sortConfig.key === 'deliveryDate'
      ? new Date(b.deliveryDate.split('/').reverse().join('-'))
      : b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card style={{ 
        borderRadius: '12px', 
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        border: '1px solid #E5E7EB'
      }}>
        <CardHeader className="pb-3">
          <CardTitle style={{ fontSize: '18px', fontWeight: 600 }}>
            Documentos POD
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar entrega por cliente, ruta o documento..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="pl-10"
                style={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  height: '40px',
                  fontSize: '14px'
                }}
              />
            </div>

            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
              <SelectTrigger style={{ width: 160, height: 40, borderRadius: '8px', backgroundColor: '#F9FAFB' }}>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="late">Retrasado</SelectItem>
                <SelectItem value="issue">Incidencia</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
              <SelectTrigger style={{ width: 160, height: 40, borderRadius: '8px', backgroundColor: '#F9FAFB' }}>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="albaran">Albarán</SelectItem>
                <SelectItem value="cmr">CMR</SelectItem>
                <SelectItem value="factura">Factura</SelectItem>
                <SelectItem value="pod">POD</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={() => setFilters({ search: '', status: 'all', type: 'all', dateFrom: '', dateTo: '' })}
              variant="outline"
              style={{
                height: 40,
                borderRadius: '12px',
                borderColor: '#4472C4',
                color: '#4472C4'
              }}
            >
              Limpiar filtros
            </Button>
          </div>

          {/* Acciones masivas */}
          {selectedDocs.length > 0 && (
            <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">
                {selectedDocs.length} documentos seleccionados
              </span>
              <div className="flex gap-2 ml-auto">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('download')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Descargar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('resend')}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Reenviar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('archive')}
                >
                  Archivar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de documentos */}
      <Card style={{ 
        borderRadius: '12px', 
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        border: '1px solid #E5E7EB'
      }}>
        <CardContent className="p-0">
          <Table>
            <TableHeader style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: '#FFFFFF' }}>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="data-[state=checked]:bg-[#4472C4] data-[state=checked]:border-[#4472C4]"
                  />
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('reference')}
                    className="flex items-center gap-1 font-semibold"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    Referencia
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('client')}
                    className="flex items-center gap-1 font-semibold"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    Cliente
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('deliveryDate')}
                    className="flex items-center gap-1 font-semibold"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    Fecha Entrega
                  </button>
                </TableHead>
                <TableHead style={{ fontSize: '14px', fontWeight: 600 }}>Estado</TableHead>
                <TableHead style={{ fontSize: '14px', fontWeight: 600 }}>Conductor</TableHead>
                <TableHead style={{ fontSize: '14px', fontWeight: 600 }}>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody style={{ minHeight: '128px' }}>
              {sortedDocuments.map((doc, index) => {
                const config = statusConfig[doc.status];
                const StatusIcon = config.icon;
                
                return (
                  <TableRow key={doc.id} className={index % 2 === 1 ? 'bg-gray-50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedDocs.includes(doc.id)}
                        onCheckedChange={(checked) => handleSelectDoc(doc.id, checked)}
                        className="data-[state=checked]:bg-[#4472C4] data-[state=checked]:border-[#4472C4]"
                      />
                    </TableCell>
                    <TableCell className="font-medium" style={{ fontSize: '14px' }}>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        {doc.reference}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {documentTypes[doc.type].label}
                      </div>
                    </TableCell>
                    <TableCell style={{ fontSize: '14px' }}>
                      <div>{doc.client}</div>
                      <div className="text-xs text-gray-500">{doc.route}</div>
                    </TableCell>
                    <TableCell style={{ fontSize: '14px' }}>
                      <div>{doc.deliveryDate}</div>
                      <div className="text-xs text-gray-500">{doc.deliveryTime}</div>
                    </TableCell>
                    <TableCell>
                      <Badge style={{
                        backgroundColor: config.bg,
                        color: config.color,
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 500
                      }}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ fontSize: '14px' }}>
                      <div>{doc.driver}</div>
                      <div className="text-xs text-gray-500">{doc.vehicle}</div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.success(`Ver detalles ${doc.reference}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success(`Descargando ${doc.reference}`)}>
                            <Download className="w-4 h-4 mr-2" />
                            Descargar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success(`Reenviando ${doc.reference}`)}>
                            <Send className="w-4 h-4 mr-2" />
                            Reenviar cliente
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {sortedDocuments.length === 0 && (
            <div className="text-center py-12" style={{ minHeight: '128px' }}>
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos</h3>
              <p className="text-sm text-gray-500">
                {filters.search || filters.status !== 'all' || filters.type !== 'all'
                  ? "No se encontraron documentos que coincidan con los filtros"
                  : "No hay documentos POD registrados"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}