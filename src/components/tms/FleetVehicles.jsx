import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Filter, MoreHorizontal, Eye, Route, History,
  CheckCircle, Wrench, Truck, AlertTriangle, X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const mockVehicles = [
  {
    id: 'v-001',
    plate: '1234ABC',
    model: 'Mercedes Actros',
    type: 'truck',
    capacity: 20000,
    status: 'available',
    mileage: 240000,
    nextMaintenance: '2025-09-15',
    fuelLevel: 85,
    location: 'Madrid Centro'
  },
  {
    id: 'v-002',
    plate: '5678DEF',
    model: 'Iveco Daily',
    type: 'van',
    capacity: 3500,
    status: 'maintenance',
    mileage: 92000,
    nextMaintenance: '2025-08-30',
    fuelLevel: 45,
    location: 'Taller Norte'
  },
  {
    id: 'v-003',
    plate: '9876GHI',
    model: 'Ford Transit',
    type: 'van',
    capacity: 2000,
    status: 'in_route',
    mileage: 156000,
    nextMaintenance: '2025-10-05',
    fuelLevel: 62,
    location: 'En ruta a Barcelona'
  },
  {
    id: 'v-004',
    plate: '4567JKL',
    model: 'Renault Master',
    type: 'van',
    capacity: 4500,
    status: 'out_of_service',
    mileage: 280000,
    nextMaintenance: '2025-08-28',
    fuelLevel: 20,
    location: 'Fuera de servicio'
  }
];

export default function FleetVehicles() {
  const [vehicles] = useState(mockVehicles);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    q: ""
  });
  const [activeFiltersChips, setActiveFiltersChips] = useState([]);

  const getStatusConfig = (status) => {
    const configs = {
      available: { 
        icon: CheckCircle, 
        label: "Disponible", 
        class: "bg-green-100 text-green-800 border-green-300",
        color: "#10B981"
      },
      in_route: { 
        icon: Truck, 
        label: "En ruta", 
        class: "bg-blue-100 text-blue-800 border-blue-300",
        color: "#4472C4"
      },
      maintenance: { 
        icon: Wrench, 
        label: "Mantenimiento", 
        class: "bg-orange-100 text-orange-800 border-orange-300",
        color: "#F59E0B"
      },
      out_of_service: { 
        icon: AlertTriangle, 
        label: "Fuera de servicio", 
        class: "bg-red-100 text-red-800 border-red-300",
        color: "#DB2142"
      }
    };
    return configs[status] || configs.available;
  };

  const handleVehicleAction = (vehicleId, action) => {
    const actions = {
      view: () => toast.success(`Ver detalles del vehículo ${vehicleId}`),
      assign: () => toast.success(`Asignar ruta al vehículo ${vehicleId}`),
      history: () => toast.success(`Ver historial del vehículo ${vehicleId}`),
      maintenance: () => toast.success(`Programar mantenimiento para ${vehicleId}`)
    };
    actions[action]?.();
  };

  const applyFilters = () => {
    const chips = [];
    if (filters.type !== "all") chips.push({ type: "type", value: filters.type });
    if (filters.status !== "all") chips.push({ type: "status", value: filters.status });
    if (filters.q) chips.push({ type: "search", value: filters.q });
    setActiveFiltersChips(chips);
  };

  const removeFilterChip = (chipToRemove) => {
    const newFilters = { ...filters };
    if (chipToRemove.type === "type") newFilters.type = "all";
    if (chipToRemove.type === "status") newFilters.status = "all";
    if (chipToRemove.type === "search") newFilters.q = "";
    setFilters(newFilters);
    setActiveFiltersChips(prev => prev.filter(chip => chip !== chipToRemove));
  };

  const clearAllFilters = () => {
    setFilters({ type: "all", status: "all", q: "" });
    setActiveFiltersChips([]);
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const typeMatch = filters.type === "all" || vehicle.type === filters.type;
    const statusMatch = filters.status === "all" || vehicle.status === filters.status;
    const searchMatch = !filters.q || 
      vehicle.model.toLowerCase().includes(filters.q.toLowerCase()) ||
      vehicle.plate.toLowerCase().includes(filters.q.toLowerCase());
    
    return typeMatch && statusMatch && searchMatch;
  });

  return (
    <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Barra de filtros */}
      <div className="space-y-4">
        <div className="flex gap-4 flex-wrap items-center" style={{ minHeight: '40px' }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por modelo o matrícula..."
              value={filters.q}
              onChange={(e) => setFilters({...filters, q: e.target.value})}
              className="pl-10 bg-[#F2F2F2] border-[#E5E7EB] h-10"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>
          
          <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
            <SelectTrigger className="w-48 bg-[#F2F2F2] border-[#E5E7EB] h-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="truck">Camión</SelectItem>
              <SelectItem value="van">Furgoneta</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
            <SelectTrigger className="w-48 bg-[#F2F2F2] border-[#E5E7EB] h-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="available">Disponible</SelectItem>
              <SelectItem value="in_route">En ruta</SelectItem>
              <SelectItem value="maintenance">Mantenimiento</SelectItem>
              <SelectItem value="out_of_service">Fuera de servicio</SelectItem>
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

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {filteredVehicles.length} vehículos encontrados
          </p>
        </div>
      </div>

      {/* Grid de vehículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          const statusConfig = getStatusConfig(vehicle.status);
          const StatusIcon = statusConfig.icon;
          
          return (
            <Card key={vehicle.id} className="bg-white shadow-sm hover:shadow-md transition-shadow" style={{ borderRadius: '16px' }}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Truck className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {vehicle.model}
                      </CardTitle>
                      <p className="text-sm text-gray-500" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {vehicle.plate}
                      </p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleVehicleAction(vehicle.id, 'view')}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver detalle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleVehicleAction(vehicle.id, 'assign')}>
                        <Route className="w-4 h-4 mr-2" />
                        Asignar ruta
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleVehicleAction(vehicle.id, 'history')}>
                        <History className="w-4 h-4 mr-2" />
                        Ver historial
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleVehicleAction(vehicle.id, 'maintenance')}>
                        <Wrench className="w-4 h-4 mr-2" />
                        Programar mantenimiento
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={`${statusConfig.class} border font-medium flex items-center gap-1`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </Badge>
                  <span className="text-sm text-gray-500" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {vehicle.capacity.toLocaleString()} kg
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <span className="text-gray-600">Kilometraje:</span>
                    <span className="font-medium">{vehicle.mileage.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <span className="text-gray-600">Combustible:</span>
                    <span className="font-medium">{vehicle.fuelLevel}%</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <span className="text-gray-600">Ubicación:</span>
                    <span className="font-medium">{vehicle.location}</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <span className="text-gray-600">Próximo mant.:</span>
                    <span className="font-medium">{vehicle.nextMaintenance}</span>
                  </div>
                </div>

                {/* Barra de combustible */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      vehicle.fuelLevel > 60 ? 'bg-green-500' : 
                      vehicle.fuelLevel > 30 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${vehicle.fuelLevel}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredVehicles.length === 0 && (
        <div className="text-center py-12 text-gray-500" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          <Truck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No se encontraron vehículos</h3>
          <p className="text-sm text-gray-400 mb-4">
            Intenta ajustar los filtros para encontrar lo que buscas
          </p>
          <Button onClick={clearAllFilters} variant="outline" className="bg-white">
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}