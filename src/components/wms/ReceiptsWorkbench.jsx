
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, Search, Filter, Package, Clock, CheckCircle, AlertTriangle,
  Eye, MoreHorizontal, FileText, Truck, Scan, Zap // Added Zap icon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Design tokens Trustport
const TRUSTPORT_TOKENS = {
  colors: {
    main_bg: '#F1F0EC',
    surface: '#FFFFFF',
    text_strong: '#1F2937',
    text_muted: '#6B7280',
    primary: '#4472C4',
    success: '#00A878',
    warning: '#FFC857',
    danger: '#DA2242'
  },
  fonts: { primary: 'Montserrat, sans-serif' },
  shadow: '0 6px 18px rgba(0,0,0,0.06)',
  radius: 16
};

// Mock data para recepciones
const receiptsData = [
  {
    id: 'REC-001',
    asn_ref: 'ASN-00045',
    supplier: 'Proveedor A',
    status: 'programado',
    dock: 'Dock 1',
    eta: '14:30',
    lines: 12,
    priority: 'alta'
  },
  {
    id: 'REC-002', 
    asn_ref: 'ASN-00046',
    supplier: 'Proveedor B',
    status: 'en_anden',
    dock: 'Dock 2',
    eta: '15:00',
    lines: 8,
    priority: 'media'
  },
  {
    id: 'REC-003',
    asn_ref: 'ASN-00047',
    supplier: 'Proveedor C',
    status: 'verificando',
    dock: 'Dock 3',
    eta: '13:45',
    lines: 15,
    priority: 'baja'
  }
];

export default function ReceiptsWorkbench() {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dock: 'all',
    priority: 'all'
  });
  const [activeTab, setActiveTab] = useState('programado');

  const kpis = [
    {
      id: 'receipts_today',
      label: 'Recepciones Hoy',
      value: '8',
      icon: Package,
      color: TRUSTPORT_TOKENS.colors.primary,
      trend: '+2'
    },
    {
      id: 'in_dock',
      label: 'En Anden',
      value: '3',
      icon: Truck,
      color: TRUSTPORT_TOKENS.colors.warning,
      trend: '+1'
    },
    {
      id: 'completed_today',
      label: 'Completadas',
      value: '12',
      icon: CheckCircle,
      color: TRUSTPORT_TOKENS.colors.success,
      trend: '+5'
    },
    {
      id: 'discrepancies',
      label: 'Discrepancias',
      value: '2',
      icon: AlertTriangle,
      color: TRUSTPORT_TOKENS.colors.danger,
      trend: '-1'
    }
  ];

  const insightCards = [
    {
      id: 'optimize_dock_assignment',
      icon: 'MapPin',
      title: 'Optimizar asignación de muelles',
      desc: 'Muelle 3 libre. Reasignar REC-004 para reducir tiempo de espera.',
      cta: { label: 'Reasignar', action: 'reassign_dock' }
    },
    {
      id: 'quality_check_pending',
      icon: 'CheckCircle',
      title: 'Pendientes QC',
      desc: '4 recepciones esperando control de calidad. Asignar inspector.',
      cta: { label: 'Asignar QC', action: 'assign_qc' }
    },
    {
      id: 'putaway_optimization',
      icon: 'Package2',
      title: 'Optimizar putaway',
      desc: 'Crear tareas de ubicación para 6 recepciones completadas.',
      cta: { label: 'Crear Tareas', action: 'create_putaway' }
    }
  ];

  const tabs = [
    { id: 'programado', label: 'Programadas', count: 5 },
    { id: 'en_anden', label: 'En Andén', count: 3 },
    { id: 'verificando', label: 'Verificando', count: 2 },
    { id: 'completadas', label: 'Completadas', count: 12 }
  ];

  const getStatusBadge = (status) => {
    const configs = {
      programado: { bg: 'bg-blue-100', color: 'text-blue-600', label: 'Programado' },
      en_anden: { bg: 'bg-yellow-100', color: 'text-yellow-600', label: 'En Andén' },
      verificando: { bg: 'bg-orange-100', color: 'text-orange-600', label: 'Verificando' },
      completadas: { bg: 'bg-green-100', color: 'text-green-600', label: 'Completada' }
    };
    return configs[status] || configs.programado;
  };

  const filteredData = receiptsData.filter(item => {
    const searchMatch = !filters.search || 
      item.asn_ref.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.supplier.toLowerCase().includes(filters.search.toLowerCase());
    const statusMatch = filters.status === 'all' || item.status === filters.status;
    return searchMatch && statusMatch;
  });

  return (
    <div className="space-y-6" style={{ 
      backgroundColor: TRUSTPORT_TOKENS.colors.main_bg,
      fontFamily: TRUSTPORT_TOKENS.fonts.primary,
      minHeight: '100vh',
      padding: '24px'
    }}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[28px] font-bold" style={{ color: TRUSTPORT_TOKENS.colors.text_strong }}>
            Recepciones
          </h1>
          <p className="text-[14px]" style={{ color: TRUSTPORT_TOKENS.colors.text_muted }}>
            Recepción y validación de mercancía entrante
          </p>
        </div>
        <Button style={{ backgroundColor: TRUSTPORT_TOKENS.colors.primary }}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Recepción
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card 
            key={kpi.id} 
            className="bg-white shadow-sm"
            style={{ 
              borderRadius: `${TRUSTPORT_TOKENS.radius}px`,
              boxShadow: TRUSTPORT_TOKENS.shadow
            }}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium" style={{ color: TRUSTPORT_TOKENS.colors.text_muted }}>
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: TRUSTPORT_TOKENS.colors.text_strong }}>
                    {kpi.value}
                  </p>
                </div>
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${kpi.color}20` }}
                >
                  <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                </div>
              </div>
              {kpi.trend && (
                <p className="text-xs font-medium mt-2" style={{ color: TRUSTPORT_TOKENS.colors.success }}>
                  {kpi.trend} vs anterior
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights - Corregido con fondo azul claro + borde suave como Compras */}
      <Card 
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
        style={{ 
          borderRadius: `${TRUSTPORT_TOKENS.radius}px`,
          boxShadow: TRUSTPORT_TOKENS.shadow
        }}
      >
        <CardHeader>
          <CardTitle className="text-[18px] font-semibold flex items-center gap-2" style={{ 
            fontFamily: TRUSTPORT_TOKENS.fonts.primary,
            color: TRUSTPORT_TOKENS.colors.primary
          }}>
            <Zap className="w-5 h-5" />
            AI Insights & Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insightCards.map((card) => (
              <div 
                key={card.id}
                className="p-4 bg-white border border-blue-100 rounded-lg shadow-sm"
                style={{ borderRadius: `${TRUSTPORT_TOKENS.radius * 0.75}px` }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <FileText className="w-4 h-4" style={{ color: TRUSTPORT_TOKENS.colors.primary }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{card.title}</h4>
                    <p className="text-xs" style={{ color: TRUSTPORT_TOKENS.colors.text_muted }}>
                      {card.desc}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 text-xs h-7"
                      style={{ borderColor: TRUSTPORT_TOKENS.colors.primary, color: TRUSTPORT_TOKENS.colors.primary }}
                    >
                      {card.cta.label}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <Card 
        className="bg-white shadow-sm"
        style={{ 
          borderRadius: `${TRUSTPORT_TOKENS.radius}px`,
          boxShadow: TRUSTPORT_TOKENS.shadow
        }}
      >
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" style={{ color: TRUSTPORT_TOKENS.colors.text_muted }} />
              <Input
                placeholder="Buscar ASN o proveedor..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-64"
              />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="programado">Programado</SelectItem>
                <SelectItem value="en_anden">En Andén</SelectItem>
                <SelectItem value="verificando">Verificando</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.dock} onValueChange={(value) => setFilters({...filters, dock: value})}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Todos los muelles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="dock_1">Dock 1</SelectItem>
                <SelectItem value="dock_2">Dock 2</SelectItem>
                <SelectItem value="dock_3">Dock 3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" onClick={() => setFilters({ search: '', status: 'all', dock: 'all', priority: 'all' })}>
              <Filter className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table with Tabs */}
      <Card 
        className="bg-white shadow-sm"
        style={{ 
          borderRadius: `${TRUSTPORT_TOKENS.radius}px`,
          boxShadow: TRUSTPORT_TOKENS.shadow
        }}
      >
        <CardContent className="p-0">
          {/* Tabs */}
          <div className="border-b px-6 py-3">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label} {tab.count > 0 && <span className="ml-1 text-xs">({tab.count})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ASN</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Muelle</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Líneas</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((receipt) => {
                const statusConfig = getStatusBadge(receipt.status);
                return (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-mono text-sm">{receipt.asn_ref}</TableCell>
                    <TableCell>{receipt.supplier}</TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{receipt.dock}</TableCell>
                    <TableCell>{receipt.eta}</TableCell>
                    <TableCell>{receipt.lines}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        receipt.priority === 'alta' ? 'border-red-300 text-red-700' :
                        receipt.priority === 'media' ? 'border-yellow-300 text-yellow-700' :
                        'border-green-300 text-green-700'
                      }>
                        {receipt.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Scan className="w-4 h-4 mr-2" />
                            Iniciar Verificación
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
  );
}
