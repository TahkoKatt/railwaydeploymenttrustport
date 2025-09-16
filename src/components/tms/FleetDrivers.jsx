
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, Filter, MoreHorizontal, Eye, Route, History,
  User, CheckCircle, Clock, X, Phone, Mail, Award
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const mockDrivers = [
  {
    id: 'd-001',
    name: 'María Ortega',
    license: 'C+E',
    status: 'available',
    experience: '8 años',
    lastAssignment: '15/08/2025',
    contact: { phone: '600123456', email: 'maria.ortega@example.com' },
    rating: 4.8
  },
  {
    id: 'd-002',
    name: 'Luis Pérez',
    license: 'C',
    status: 'in_route',
    experience: '5 años',
    lastAssignment: '26/08/2025',
    contact: { phone: '600234567', email: 'luis.perez@example.com' },
    rating: 4.5
  },
  {
    id: 'd-003',
    name: 'Ana García',
    license: 'C',
    status: 'resting',
    experience: '12 años',
    lastAssignment: '24/08/2025',
    contact: { phone: '600345678', email: 'ana.garcia@example.com' },
    rating: 4.9
  },
  {
    id: 'd-004',
    name: 'Carlos Ruiz',
    license: 'C+E',
    status: 'inactive',
    experience: '3 años',
    lastAssignment: '10/06/2025',
    contact: { phone: '600456789', email: 'carlos.ruiz@example.com' },
    rating: 4.2
  }
];

export default function FleetDrivers() {
  const [drivers] = useState(mockDrivers);
  const [filters, setFilters] = useState({
    status: "all",
    license: "all",
    q: ""
  });
  const [activeFiltersChips, setActiveFiltersChips] = useState([]);

  const getStatusConfig = (status) => {
    const configs = {
      available: { icon: CheckCircle, label: "Disponible", class: "bg-green-100 text-green-800 border-green-300" },
      in_route: { icon: Route, label: "En ruta", class: "bg-blue-100 text-blue-800 border-blue-300" },
      resting: { icon: Clock, label: "Descansando", class: "bg-yellow-100 text-yellow-800 border-yellow-300" },
      inactive: { icon: X, label: "Inactivo", class: "bg-gray-100 text-gray-800 border-gray-300" }
    };
    return configs[status] || configs.available;
  };

  const handleDriverAction = (driverId, action) => {
    const actions = {
      view: () => toast.success(`Ver detalles del conductor ${driverId}`),
      assign: () => toast.success(`Asignar ruta al conductor ${driverId}`),
      history: () => toast.success(`Ver historial del conductor ${driverId}`),
    };
    actions[action]?.();
  };

  const applyFilters = () => {
    const chips = [];
    if (filters.status !== "all") chips.push({ type: "Estado", value: filters.status });
    if (filters.license !== "all") chips.push({ type: "Licencia", value: filters.license });
    if (filters.q) chips.push({ type: "Búsqueda", value: filters.q });
    setActiveFiltersChips(chips);
  };

  const removeFilterChip = (chipToRemove) => {
    const newFilters = { ...filters };
    if (chipToRemove.type === "Estado") newFilters.status = "all";
    if (chipToRemove.type === "Licencia") newFilters.license = "all";
    if (chipToRemove.type === "Búsqueda") newFilters.q = "";
    setFilters(newFilters);
    setActiveFiltersChips(prev => prev.filter(chip => chip !== chipToRemove));
  };

  const filteredDrivers = drivers.filter(driver => {
    const statusMatch = filters.status === "all" || driver.status.toLowerCase() === filters.status.toLowerCase();
    const licenseMatch = filters.license === "all" || driver.license.toLowerCase() === filters.license.toLowerCase();
    const searchMatch = !filters.q ||
      driver.name.toLowerCase().includes(filters.q.toLowerCase()) ||
      driver.id.toLowerCase().includes(filters.q.toLowerCase());
    
    return statusMatch && licenseMatch && searchMatch;
  });

  return (
    <div className="space-y-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Barra de filtros */}
      <div className="space-y-4 p-4 bg-white rounded-lg border">
        <div className="flex gap-4 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o ID..."
              value={filters.q}
              onChange={(e) => setFilters({...filters, q: e.target.value})}
              className="pl-10 bg-[#F2F2F2] border-[#E5E7EB] h-10"
            />
          </div>
          
          <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
            <SelectTrigger className="w-48 bg-[#F2F2F2] border-[#E5E7EB] h-10">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="available">Disponible</SelectItem>
              <SelectItem value="in_route">En ruta</SelectItem>
              <SelectItem value="resting">Descansando</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.license} onValueChange={(value) => setFilters({...filters, license: value})}>
            <SelectTrigger className="w-48 bg-[#F2F2F2] border-[#E5E7EB] h-10">
              <SelectValue placeholder="Licencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las licencias</SelectItem>
              <SelectItem value="c">C</SelectItem>
              <SelectItem value="c+e">C+E</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={applyFilters} 
            className="text-white h-10" 
            style={{ backgroundColor: '#4472C4' }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Aplicar
          </Button>
        </div>

        {activeFiltersChips.length > 0 && (
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-sm font-medium">Filtros:</span>
            {activeFiltersChips.map((chip, index) => (
              <Badge key={index} variant="secondary" className="pl-2 pr-1">
                {chip.type}: {chip.value}
                <button
                  onClick={() => removeFilterChip(chip)}
                  className="ml-1 rounded-full hover:bg-gray-300 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Grid de conductores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.length > 0 ? filteredDrivers.map((driver) => {
          const statusConfig = getStatusConfig(driver.status);
          return (
            <Card key={driver.id} className="bg-white shadow-sm flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full`} style={{ backgroundColor: statusConfig.class.split(' ')[0] }}>
                    <User className={`w-6 h-6`} style={{ color: statusConfig.class.split(' ')[1] }}/>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{driver.name}</CardTitle>
                    <p className="text-sm text-gray-500">ID: {driver.id}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDriverAction(driver.id, 'view')}>
                      <Eye className="w-4 h-4 mr-2" />
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDriverAction(driver.id, 'assign')}>
                      <Route className="w-4 h-4 mr-2" />
                      Asignar ruta
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDriverAction(driver.id, 'history')}>
                      <History className="w-4 h-4 mr-2" />
                      Ver historial
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusConfig.class}>
                      <statusConfig.icon className="w-3 h-3 mr-1.5" />
                      {statusConfig.label}
                    </Badge>
                    <Badge variant="secondary">Licencia: {driver.license}</Badge>
                  </div>
                  <p><strong>Experiencia:</strong> {driver.experience}</p>
                  <p><strong>Última Asig.:</strong> {driver.lastAssignment}</p>
                  <p className="flex items-center gap-2">
                    <strong>Rating:</strong> 
                    <span className="flex items-center gap-1 text-yellow-500">
                      <Award className="w-4 h-4"/> {driver.rating}
                    </span>
                  </p>
                </div>
              </CardContent>
              <div className="border-t p-3 flex justify-end gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info(`Llamando a ${driver.name}`)}>
                  <Phone className="w-4 h-4 text-gray-500"/>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info(`Enviando email a ${driver.name}`)}>
                  <Mail className="w-4 h-4 text-gray-500"/>
                </Button>
              </div>
            </Card>
          );
        }) : (
          <p className="text-center text-gray-500 col-span-full py-12">
            No se encontraron conductores que coincidan con la búsqueda o filtros.
          </p>
        )}
      </div>
    </div>
  );
}
