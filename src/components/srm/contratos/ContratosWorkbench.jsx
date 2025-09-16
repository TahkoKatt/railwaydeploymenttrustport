
// components/srm/contratos/ContratosWorkbench.jsx
import { useState, useMemo } from 'react';
import {
  Plus, Search, Filter, Download, FileText, Clock, AlertTriangle, CheckCircle, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockContratos = [
    { id: 'CNT-001', supplier: 'Transporte Atlas', type: 'Marco', status: 'activo', start_date: '2024-01-01', end_date: '2025-12-31', value: 250000 },
    { id: 'CNT-002', supplier: 'Maritimos XXI', type: 'Servicios', status: 'por_vencer', start_date: '2023-08-01', end_date: '2024-08-30', value: 150000 },
    { id: 'CNT-003', supplier: 'Industrias Norte', type: 'Suministro', status: 'vencido', start_date: '2023-01-01', end_date: '2023-12-31', value: 500000 },
];

const KPICard = ({ title, value, icon: Icon, color }) => (
  <Card className="bg-white shadow-sm" style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
    <CardContent className="p-5">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-current" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function ContratosWorkbench() {
  const [activeTab, setActiveTab] = useState('activos');
  const [filters, setFilters] = useState({ search: '', status: 'todos', type: 'todos' });
  const [contratos] = useState(mockContratos);

  const filteredContratos = useMemo(() => {
    let filtered = contratos;
    // Apply filters logic here if needed
    return filtered;
  }, [contratos]); // Corrected: Removed 'filters' as it's not used inside this memo's current logic

  const kpis = useMemo(() => ({
    activos: contratos.filter(c => c.status === 'activo').length,
    por_vencer: contratos.filter(c => c.status === 'por_vencer').length,
    vencidos: contratos.filter(c => c.status === 'vencido').length,
    valor_total: (contratos.reduce((sum, c) => sum + c.value, 0) / 1000000).toFixed(1) + 'M€',
  }), [contratos]);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'por_vencer': return 'bg-yellow-100 text-yellow-800';
      case 'vencido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contratos Workbench</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión centralizada de contratos con proveedores.</p>
        </div>
        <Button style={{ backgroundColor: '#4472C4' }} className="text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Contrato
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Contratos Activos" value={kpis.activos} icon={CheckCircle} color="bg-green-100 text-green-600" />
        <KPICard title="Por Vencer (30d)" value={kpis.por_vencer} icon={Clock} color="bg-yellow-100 text-yellow-600" />
        <KPICard title="Vencidos" value={kpis.vencidos} icon={AlertTriangle} color="bg-red-100 text-red-600" />
        <KPICard title="Valor Total Activo" value={kpis.valor_total} icon={TrendingUp} color="bg-blue-100 text-blue-600" />
      </div>
      
      {/* Toolbar & Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Contratos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Contrato</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Fecha Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContratos.map((contrato) => (
                <TableRow key={contrato.id}>
                  <TableCell className="font-medium">{contrato.id}</TableCell>
                  <TableCell>{contrato.supplier}</TableCell>
                  <TableCell>{contrato.type}</TableCell>
                  <TableCell>€{contrato.value.toLocaleString()}</TableCell>
                  <TableCell>{contrato.end_date}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(contrato.status)}>{contrato.status.replace('_', ' ')}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
