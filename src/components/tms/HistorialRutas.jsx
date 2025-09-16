import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Copy, Download } from "lucide-react";
import { toast } from "sonner";

const mockHistoryRoutes = [
  {
    id: 1,
    date: "15/08/2025",
    name: "Ruta Sevilla",
    vehicle: "V-001 (1234ABC)",
    driver: "María Ortega",
    distance: "320 km",
    duration: "4h 30m",
    cost: "€425",
    status: "completada"
  },
  {
    id: 2,
    date: "14/08/2025",
    name: "Ruta Madrid Norte",
    vehicle: "V-002 (5678DEF)",
    driver: "Luis Pérez",
    distance: "85 km",
    duration: "2h 15m",
    cost: "€180",
    status: "completada"
  },
  {
    id: 3,
    date: "13/08/2025",
    name: "Ruta Valencia Express",
    vehicle: "V-003 (9876GHI)",
    driver: "Ana García",
    distance: "450 km",
    duration: "5h 45m",
    cost: "€620",
    status: "completada"
  },
  {
    id: 4,
    date: "12/08/2025",
    name: "Ruta Barcelona Centro",
    vehicle: "V-001 (1234ABC)",
    driver: "María Ortega",
    distance: "680 km",
    duration: "7h 20m",
    cost: "€890",
    status: "incidencia"
  }
];

export default function HistorialRutas() {
  const [routes] = useState(mockHistoryRoutes);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredRoutes = routes.filter(route => {
    if (!startDate && !endDate) return true;
    
    const routeDate = new Date(route.date.split('/').reverse().join('-'));
    const start = startDate ? new Date(startDate) : new Date('1900-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-12-31');
    
    return routeDate >= start && routeDate <= end;
  });

  const getStatusColor = (status) => {
    return status === 'completada' ? 'text-green-600' : 'text-red-600';
  };

  const handleViewDetails = (routeId) => {
    toast.success(`Abriendo detalles de ruta ${routeId}`);
  };

  const handleDuplicate = (routeId) => {
    toast.success(`Ruta ${routeId} duplicada como plantilla`);
  };

  const handleExport = (routeId) => {
    toast.success(`Exportando ruta ${routeId} a PDF`);
  };

  return (
    <div className="space-y-4">
      {/* Selector de rango de fechas */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Label htmlFor="startDate">Fecha inicio</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-[#F2F2F2] border-[#E5E7EB] rounded-lg"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="endDate">Fecha fin</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-[#F2F2F2] border-[#E5E7EB] rounded-lg"
          />
        </div>
        <Button
          onClick={() => {
            setStartDate("");
            setEndDate("");
          }}
          variant="outline"
          style={{ backgroundColor: '#F1F0EC', color: '#000000', borderColor: '#E5E7EB' }}
        >
          Limpiar filtros
        </Button>
      </div>

      {/* Tabla */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Conductor</TableHead>
              <TableHead>Distancia</TableHead>
              <TableHead>Tiempo</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoutes.map((route) => (
              <TableRow key={route.id}>
                <TableCell>{route.date}</TableCell>
                <TableCell className="font-medium">{route.name}</TableCell>
                <TableCell>{route.vehicle}</TableCell>
                <TableCell>{route.driver}</TableCell>
                <TableCell>{route.distance}</TableCell>
                <TableCell>{route.duration}</TableCell>
                <TableCell className="font-medium">{route.cost}</TableCell>
                <TableCell>
                  <span className={`font-medium ${getStatusColor(route.status)}`}>
                    {route.status === 'completada' ? 'Completada' : 'Con incidencia'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(route.id)}
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(route.id)}
                      title="Duplicar"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExport(route.id)}
                      title="Exportar"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredRoutes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron rutas en el rango de fechas seleccionado
        </div>
      )}
    </div>
  );
}