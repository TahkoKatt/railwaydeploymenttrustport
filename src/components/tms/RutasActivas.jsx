import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MoreHorizontal, Search, Filter, X, Save, Trash2, 
  ArrowUpDown, Eye, RefreshCw, Truck, MessageSquare, Copy,
  Play, Pause, FileDown 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const mockActiveRoutes = [
  {
    id: "r-001",
    name: "Ruta Madrid Centro",
    vehicle: { id: "v-001", plate: "1234ABC" },
    driver: { id: "d-001", name: "María Ortega" },
    status: "en_route",
    nextStop: "Calle Alcalá 100",
    eta: "11:30",
    progress: { done: 2, total: 3 }
  },
  {
    id: "r-002",
    name: "Ruta BCN Norte",
    vehicle: { id: "v-002", plate: "5678DEF" },
    driver: { id: "d-002", name: "Luis Pérez" },
    status: "at_stop",
    nextStop: "Av. Diagonal 450",
    eta: "13:45",
    progress: { done: 1, total: 2 }
  },
  {
    id: "r-003",
    name: "Ruta Valencia Sur",
    vehicle: { id: "v-003", plate: "9876GHI" },
    driver: { id: "d-003", name: "Ana García" },
    status: "completed",
    nextStop: "-",
    eta: "-",
    progress: { done: 3, total: 3 }
  },
  {
    id: "r-004",
    name: "Ruta Sevilla Express",
    vehicle: { id: "v-004", plate: "4567JKL" },
    driver: { id: "d-004", name: "Carlos Ruiz" },
    status: "incident",
    nextStop: "Av. Constitución",
    eta: "Retrasado",
    progress: { done: 1, total: 4 }
  }
];

export default function RutasActivas() {
  const [routes] = useState(mockActiveRoutes);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filters, setFilters] = useState({
    vehicleId: "all",
    driverId: "all", 
    status: "all",
    q: ""
  });
  const [sort, setSort] = useState({ key: 'name', order: 'asc' });
  const [activeFiltersChips, setActiveFiltersChips] = useState([]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      en_route: { 
        label: "En ruta", 
        class: "bg-[#DBEAFE] text-[#4472C4] border-[#4472C4]", 
        ariaLabel: "Estado: En ruta" 
      },
      at_stop: { 
        label: "En parada", 
        class: "bg-[#FEF3C7] text-[#F59E0B] border-[#F59E0B]", 
        ariaLabel: "Estado: En parada" 
      },
      completed: { 
        label: "Completada", 
        class: "bg-[#D1FAE5] text-[#00A878] border-[#00A878]", 
        ariaLabel: "Estado: Completada" 
      },
      incident: { 
        label: "Incidencia", 
        class: "bg-[#FEE2E2] text-[#DB2142] border-[#DB2142]", 
        ariaLabel: "Estado: Con incidencia" 
      }
    };
    
    const config = statusConfig[status] || statusConfig.en_route;
    return (
      <Badge 
        className={`${config.class} border font-medium`}
        style={{ fontFamily: 'Montserrat, sans-serif' }}
        aria-label={config.ariaLabel}
        title={status === 'incident' ? 'Retraso por tráfico' : undefined}
      >
        {config.label}
      </Badge>
    );
  };

  const getETADisplay = (eta, status) => {
    if (status === 'incident' && eta === 'Retrasado') {
      return (
        <Badge 
          className="bg-[#FEE2E2] text-[#DB2142] border-[#DB2142] border font-medium"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Retrasado
        </Badge>
      );
    }
    return <span style={{ fontFamily: 'Montserrat, sans-serif' }}>{eta}</span>;
  };

  const handleSort = (key) => {
    setSort(prev => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRowAction = (id, action) => {
    const actions = {
      view: () => toast.success(`Abriendo detalles de ruta ${id}`),
      optimize: () => toast.success(`Optimizando ruta ${id} en tiempo real`),
      reassign: () => toast.success(`Reasignando vehículo para ruta ${id}`),
      notify: () => toast.success(`Notificando cliente sobre ruta ${id}`),
      duplicate: () => toast.success(`Duplicando ruta ${id}`)
    };
    actions[action]?.();
  };

  const handleBulkAction = (action) => {
    const actions = {
      pause: () => toast.success(`Pausando ${selectedRows.length} rutas`),
      close: () => toast.success(`Cerrando ${selectedRows.length} rutas`),
      reassign: () => toast.success(`Reasignando conductor a ${selectedRows.length} rutas`),
      export: () => toast.success(`Exportando ${selectedRows.length} rutas`)
    };
    actions[action]?.();
    setSelectedRows([]);
  };

  const handleSelectAll = (checked) => {
    setSelectedRows(checked ? filteredRoutes.map(r => r.id) : []);
  };

  const handleSelectRow = (id, checked) => {
    setSelectedRows(prev => 
      checked 
        ? [...prev, id]
        : prev.filter(rowId => rowId !== id)
    );
  };

  const applyFilters = () => {
    const chips = [];
    if (filters.vehicleId !== "all") chips.push({ type: "vehicle", value: filters.vehicleId });
    if (filters.driverId !== "all") chips.push({ type: "driver", value: filters.driverId });
    if (filters.status !== "all") chips.push({ type: "status", value: filters.status });
    if (filters.q) chips.push({ type: "search", value: filters.q });
    setActiveFiltersChips(chips);
  };

  const removeFilterChip = (chipToRemove) => {
    const newFilters = { ...filters };
    if (chipToRemove.type === "vehicle") newFilters.vehicleId = "all";
    if (chipToRemove.type === "driver") newFilters.driverId = "all";
    if (chipToRemove.type === "status") newFilters.status = "all";
    if (chipToRemove.type === "search") newFilters.q = "";
    setFilters(newFilters);
    setActiveFiltersChips(prev => prev.filter(chip => chip !== chipToRemove));
  };

  const clearAllFilters = () => {
    setFilters({ vehicleId: "all", driverId: "all", status: "all", q: "" });
    setActiveFiltersChips([]);
  };

  const filteredRoutes = routes.filter(route => {
    const vehicleMatch = filters.vehicleId === "all" || route.vehicle.id === filters.vehicleId;
    const driverMatch = filters.driverId === "all" || route.driver.id === filters.driverId;
    const statusMatch = filters.status === "all" || route.status === filters.status;
    const searchMatch = !filters.q || 
      route.name.toLowerCase().includes(filters.q.toLowerCase()) ||
      route.vehicle.plate.toLowerCase().includes(filters.q.toLowerCase()) ||
      route.driver.name.toLowerCase().includes(filters.q.toLowerCase());
    
    return vehicleMatch && driverMatch && statusMatch && searchMatch;
  });

  const sortedRoutes = [...filteredRoutes].sort((a, b) => {
    let aValue, bValue;
    
    switch (sort.key) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'vehicle':
        aValue = a.vehicle.plate;
        bValue = b.vehicle.plate;
        break;
      case 'driver':
        aValue = a.driver.name;
        bValue = b.driver.name;
        break;
      case 'eta':
        aValue = a.eta;
        bValue = b.eta;
        break;
      default:
        return 0;
    }
    
    const comparison = aValue.localeCompare(bValue);
    return sort.order === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="space-y-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Barra de filtros */}
      <div className="space-y-4">
        <div className="flex gap-4 flex-wrap items-center" style={{ minHeight: '40px' }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar ruta, vehículo o conductor..."
              value={filters.q}
              onChange={(e) => setFilters({...filters, q: e.target.value})}
              className="pl-10 bg-[#F2F2F2] border-[#E5E7EB] h-10"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>
          
          <Select value={filters.vehicleId} onValueChange={(value) => setFilters({...filters, vehicleId: value})}>
            <SelectTrigger className="w-48 bg-[#F2F2F2] border-[#E5E7EB] h-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <SelectValue placeholder="Vehículo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los vehículos</SelectItem>
              <SelectItem value="v-001">1234ABC</SelectItem>
              <SelectItem value="v-002">5678DEF</SelectItem>
              <SelectItem value="v-003">9876GHI</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.driverId} onValueChange={(value) => setFilters({...filters, driverId: value})}>
            <SelectTrigger className="w-48 bg-[#F2F2F2] border-[#E5E7EB] h-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <SelectValue placeholder="Conductor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los conductores</SelectItem>
              <SelectItem value="d-001">María Ortega</SelectItem>
              <SelectItem value="d-002">Luis Pérez</SelectItem>
              <SelectItem value="d-003">Ana García</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
            <SelectTrigger className="w-48 bg-[#F2F2F2] border-[#E5E7EB] h-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="en_route">En ruta</SelectItem>
              <SelectItem value="at_stop">En parada</SelectItem>
              <SelectItem value="completed">Completada</SelectItem>
              <SelectItem value="incident">Incidencia</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={applyFilters} 
            className="text-white h-10" 
            style={{ backgroundColor: '#4472C4', fontFamily: 'Montserrat, sans-serif' }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Aplicar
          </Button>

          <Button 
            variant="outline" 
            onClick={clearAllFilters} 
            className="h-10"
            style={{ 
              backgroundColor: '#F1F0EC', 
              color: '#374151', 
              borderColor: '#D9D9D9',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            Limpiar
          </Button>

          <Button 
            variant="outline" 
            onClick={() => toast.success("Vista guardada")} 
            className="h-10 hover:bg-[#E5EDF7]"
            style={{ 
              borderColor: '#4472C4', 
              color: '#4472C4',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar vista
          </Button>
        </div>

        {/* Chips de filtros activos */}
        {activeFiltersChips.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {activeFiltersChips.map((chip, index) => (
              <div key={index} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <span>{chip.type}: {chip.value}</span>
                <button
                  onClick={() => removeFilterChip(chip)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Contador y acciones bulk */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>{filteredRoutes.length} rutas activas</p>
          
          {selectedRows.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('reassign')}
                className="bg-white"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <Truck className="w-4 h-4 mr-2" />
                Reasignar conductor
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('pause')}
                className="bg-white"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <Pause className="w-4 h-4 mr-2" />
                Pausar rutas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('close')}
                style={{ borderColor: '#DB2142', color: '#DB2142', fontFamily: 'Montserrat, sans-serif' }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cerrar rutas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('export')}
                className="bg-white"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <FileDown className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.length === filteredRoutes.length && filteredRoutes.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Seleccionar todas las rutas"
                  className="data-[state=checked]:bg-[#4472C4] data-[state=checked]:border-[#4472C4]"
                />
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1F2937' }}
                  aria-label="Ordenar por nombre"
                >
                  Nombre
                  <ArrowUpDown className="w-3 h-3 text-[#9CA3AF]" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('vehicle')}
                  className="flex items-center gap-1 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1F2937' }}
                  aria-label="Ordenar por vehículo"
                >
                  Vehículo
                  <ArrowUpDown className="w-3 h-3 text-[#9CA3AF]" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('driver')}
                  className="flex items-center gap-1 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1F2937' }}
                  aria-label="Ordenar por conductor"
                >
                  Conductor
                  <ArrowUpDown className="w-3 h-3 text-[#9CA3AF]" />
                </button>
              </TableHead>
              <TableHead style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1F2937' }}>
                Estado
              </TableHead>
              <TableHead style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1F2937' }}>
                Próxima parada
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('eta')}
                  className="flex items-center gap-1 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1F2937' }}
                  aria-label="Ordenar por ETA"
                >
                  ETA
                  <ArrowUpDown className="w-3 h-3 text-[#9CA3AF]" />
                </button>
              </TableHead>
              <TableHead style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1F2937' }}>
                Progreso
              </TableHead>
              <TableHead style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1F2937' }}>
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRoutes.map((route, index) => (
              <TableRow 
                key={route.id} 
                className={`${index % 2 === 1 ? 'bg-[#FAFBFF]' : ''} hover:bg-gray-50`}
                style={{ gap: '4px' }}
                aria-selected={selectedRows.includes(route.id)}
              >
                <TableCell className="py-4">
                  <Checkbox
                    checked={selectedRows.includes(route.id)}
                    onCheckedChange={(checked) => handleSelectRow(route.id, checked)}
                    aria-label={`Seleccionar ruta ${route.name}`}
                    className="data-[state=checked]:bg-[#4472C4] data-[state=checked]:border-[#4472C4] bg-white border-[#D1D5DB]"
                  />
                </TableCell>
                <TableCell className="font-medium py-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {route.name}
                </TableCell>
                <TableCell className="py-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {route.vehicle.plate}
                </TableCell>
                <TableCell className="py-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {route.driver.name}
                </TableCell>
                <TableCell className="py-4">{getStatusBadge(route.status)}</TableCell>
                <TableCell className="py-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {route.nextStop}
                </TableCell>
                <TableCell className="py-4">{getETADisplay(route.eta, route.status)}</TableCell>
                <TableCell className="py-4">
                  <span className="text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {route.progress.done}/{route.progress.total} paradas
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="focus:ring-2 focus:ring-blue-500"
                        aria-label={`Acciones para ruta ${route.name}`}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRowAction(route.id, 'view')}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver detalle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRowAction(route.id, 'optimize')}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Optimizar en tiempo real
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRowAction(route.id, 'reassign')}>
                        <Truck className="w-4 h-4 mr-2" />
                        Reasignar vehículo
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRowAction(route.id, 'notify')}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Notificar cliente
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRowAction(route.id, 'duplicate')}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicar ruta
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Empty state */}
        {filteredRoutes.length === 0 && (
          <div className="text-center py-12 text-gray-500" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <Truck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">
              {filters.q || filters.vehicleId !== "all" || filters.driverId !== "all" || filters.status !== "all"
                ? "Sin resultados para estos filtros"
                : "No hay rutas activas"
              }
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {filters.q || filters.vehicleId !== "all" || filters.driverId !== "all" || filters.status !== "all"
                ? "Intenta ajustar los filtros para encontrar lo que buscas"
                : "Crea una nueva ruta para comenzar"
              }
            </p>
            {filters.q || filters.vehicleId !== "all" || filters.driverId !== "all" || filters.status !== "all" ? (
              <Button onClick={clearAllFilters} variant="outline" className="bg-white">
                Limpiar filtros
              </Button>
            ) : (
              <Button onClick={() => toast.success("Redirigiendo a Nueva ruta")} className="text-white" style={{ backgroundColor: '#4472C4' }}>
                Crear nueva ruta
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Paginación (placeholder) */}
      {filteredRoutes.length > 20 && (
        <div className="flex justify-between items-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          <p className="text-sm text-gray-600">
            Mostrando 1-{Math.min(20, filteredRoutes.length)} de {filteredRoutes.length} resultados
          </p>
          <div className="flex gap-2">
            <Select defaultValue="20">
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}