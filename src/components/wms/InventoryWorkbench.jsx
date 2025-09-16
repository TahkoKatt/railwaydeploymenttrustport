
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, Search, Filter, Package, AlertTriangle, TrendingUp, Activity,
  Eye, MoreHorizontal, Edit, Archive, Zap // Added Zap icon
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

// Mock data para inventario (usando datos existentes)
const inventoryData = [
  {
    id: "inv_001",
    sku: "PROD-001",
    description: "Monitor Samsung 24\"",
    location: "LOC-A-01",
    zone: "Picking",
    quantity: 120,
    uom: "Unidad",
    status: "optimal",
    value: 30060.00
  },
  {
    id: "inv_002", 
    sku: "PROD-002",
    description: "Teclado Logitech MX",
    location: "LOC-B-05",
    zone: "Storage",
    quantity: 25,
    uom: "Caja",
    status: "low",
    value: 2125.00
  },
  {
    id: "inv_003",
    sku: "PROD-003",
    description: "Mouse Inalámbrico",
    location: "LOC-C-12",
    zone: "Picking",
    quantity: 8,
    uom: "Unidad", 
    status: "critical",
    value: 260.00
  }
];

export default function InventoryWorkbench() {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    zone: 'all',
    uom: 'all'
  });
  const [activeTab, setActiveTab] = useState('all');

  const kpis = [
    {
      id: 'total_skus',
      label: 'Total SKUs',
      value: '2,847',
      icon: Package,
      color: TRUSTPORT_TOKENS.colors.primary,
      trend: '+45'
    },
    {
      id: 'low_stock',
      label: 'Stock Bajo',
      value: '23',
      icon: AlertTriangle,
      color: TRUSTPORT_TOKENS.colors.warning,
      trend: '-5'
    },
    {
      id: 'critical_stock',
      label: 'Stock Crítico',
      value: '8',
      icon: AlertTriangle,
      color: TRUSTPORT_TOKENS.colors.danger,
      trend: '-2'
    },
    {
      id: 'inventory_value',
      label: 'Valor Total',
      value: '€2.1M',
      icon: TrendingUp,
      color: TRUSTPORT_TOKENS.colors.success,
      trend: '+8.2%'
    }
  ];

  const insightCards = [
    {
      id: 'restock_critical',
      icon: 'Package',
      title: 'Reabastecer Stock Crítico',
      desc: '8 SKUs con stock crítico requieren reposición urgente.',
      cta: { label: 'Crear Órdenes', action: 'create_restock_orders' }
    },
    {
      id: 'optimize_locations',
      icon: 'MapPin',
      title: 'Optimizar Ubicaciones',
      desc: 'Reubicar 15 SKUs de alta rotación a zona de picking.',
      cta: { label: 'Ver Sugerencias', action: 'view_relocation_suggestions' }
    },
    {
      id: 'cycle_count',
      icon: 'Activity',
      title: 'Conteo Cíclico',
      desc: '25 ubicaciones programadas para conteo esta semana.',
      cta: { label: 'Programar', action: 'schedule_cycle_count' }
    }
  ];

  const tabs = [
    { id: 'all', label: 'Todo el Inventario', count: 2847 },
    { id: 'critical', label: 'Stock Crítico', count: 8 },
    { id: 'low', label: 'Stock Bajo', count: 23 },
    { id: 'optimal', label: 'Niveles Óptimos', count: 2816 }
  ];

  const getStatusBadge = (status) => {
    const configs = {
      optimal: { bg: 'bg-green-100', color: 'text-green-600', label: 'Óptimo' },
      low: { bg: 'bg-yellow-100', color: 'text-yellow-600', label: 'Bajo' },
      critical: { bg: 'bg-red-100', color: 'text-red-600', label: 'Crítico' }
    };
    return configs[status] || configs.optimal;
  };

  const filteredData = inventoryData.filter(item => {
    const searchMatch = !filters.search || 
      item.sku.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.description.toLowerCase().includes(filters.search.toLowerCase());
    const statusMatch = filters.status === 'all' || item.status === filters.status;
    const zoneMatch = filters.zone === 'all' || item.zone === filters.zone;
    return searchMatch && statusMatch && zoneMatch;
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
            Inventario
          </h1>
          <p className="text-[14px]" style={{ color: TRUSTPORT_TOKENS.colors.text_muted }}>
            Stock en tiempo real y trazabilidad
          </p>
        </div>
        <Button style={{ backgroundColor: TRUSTPORT_TOKENS.colors.primary }}>
          <Plus className="w-4 h-4 mr-2" />
          Ajustar Stock
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

      {/* AI Insights */}
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
                    <Package className="w-4 h-4" style={{ color: TRUSTPORT_TOKENS.colors.primary }} />
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
                placeholder="Buscar SKU o descripción..."
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
                <SelectItem value="optimal">Óptimo</SelectItem>
                <SelectItem value="low">Bajo</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.zone} onValueChange={(value) => setFilters({...filters, zone: value})}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Todas las zonas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Picking">Picking</SelectItem>
                <SelectItem value="Storage">Storage</SelectItem>
                <SelectItem value="Receiving">Receiving</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.uom} onValueChange={(value) => setFilters({...filters, uom: value})}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Todas las UoM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Unidad">Unidad</SelectItem>
                <SelectItem value="Caja">Caja</SelectItem>
                <SelectItem value="Pallet">Pallet</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" onClick={() => setFilters({ search: '', status: 'all', zone: 'all', uom: 'all' })}>
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
                  {tab.label} <span className="ml-1 text-xs">({tab.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Zona</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>UoM</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => {
                const statusConfig = getStatusBadge(item.status);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="font-mono text-sm">{item.location}</TableCell>
                    <TableCell>{item.zone}</TableCell>
                    <TableCell className="font-medium">{item.quantity}</TableCell>
                    <TableCell>{item.uom}</TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>€{item.value.toFixed(2)}</TableCell>
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
                            <Edit className="w-4 h-4 mr-2" />
                            Ajustar Stock
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Archive className="w-4 h-4 mr-2" />
                            Ver Historial
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
