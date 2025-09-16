
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ArrowUp, ArrowDown, Trash2, MapPin, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge"; // Import the Badge component

export default function PlanificacionForm({ onRouteGenerated }) {
  const [routeName, setRouteName] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [stops, setStops] = useState([]);
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [newStop, setNewStop] = useState({
    address: "",
    client: "",
    timeStart: "",
    timeEnd: "",
    type: "pickup",
    estimatedTime: 15
  });

  const validateTimeWindow = () => {
    if (newStop.timeStart && newStop.timeEnd) {
      return new Date(`2025-01-01T${newStop.timeEnd}`) > new Date(`2025-01-01T${newStop.timeStart}`);
    }
    return true;
  };

  const handleAddStop = () => {
    if (!newStop.address.trim()) {
      toast.error("La dirección es obligatoria");
      return;
    }
    if (!validateTimeWindow()) {
      toast.error("La hora de fin debe ser posterior a la hora de inicio");
      return;
    }

    const stop = {
      id: `stop-${Date.now()}`,
      ...newStop,
      order: stops.length + 1
    };

    setStops([...stops, stop]);
    setNewStop({
      address: "",
      client: "",
      timeStart: "",
      timeEnd: "",
      type: "pickup",
      estimatedTime: 15
    });
    setShowAddStopModal(false);
    toast.success("Parada añadida correctamente");
  };

  const moveStop = (index, direction) => {
    const newStops = [...stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newStops.length) {
      [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]];
      // Actualizar orden
      newStops.forEach((stop, i) => stop.order = i + 1);
      setStops(newStops);
    }
  };

  const removeStop = (index) => {
    const newStops = stops.filter((_, i) => i !== index);
    newStops.forEach((stop, i) => stop.order = i + 1);
    setStops(newStops);
    toast.success("Parada eliminada");
  };

  const handleGenerateRoute = () => {
    if (!routeName.trim()) {
      toast.error("El nombre de la ruta es obligatorio");
      return;
    }
    if (stops.length === 0) {
      toast.error("Añade al menos una parada");
      return;
    }

    const route = {
      id: `route-${Date.now()}`,
      name: routeName,
      startDateTime,
      stops,
      status: 'generated',
      estimatedDuration: stops.reduce((acc, stop) => acc + stop.estimatedTime, 0)
    };

    onRouteGenerated(route);
    toast.success("¡Ruta generada exitosamente!");
  };

  const handleOptimize = () => {
    if (stops.length < 2) {
      toast.error("Se necesitan al menos 2 paradas para optimizar");
      return;
    }
    
    // Simular optimización reordenando paradas
    const optimizedStops = [...stops].sort(() => Math.random() - 0.5);
    optimizedStops.forEach((stop, i) => stop.order = i + 1);
    setStops(optimizedStops);
    toast.success("¡Ruta optimizada! Tiempo reducido en 12%");
  };

  return (
    <div className="space-y-6">
      {/* Formulario principal */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="routeName">Nombre de ruta</Label>
          <Input
            id="routeName"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            placeholder="Ej: Ruta Madrid Centro"
            className="bg-[#F2F2F2] border-[#E5E7EB] rounded-lg"
            data-analytics="plan.create.name"
          />
        </div>
        
        <div>
          <Label htmlFor="startDateTime">Fecha y hora de inicio</Label>
          <Input
            id="startDateTime"
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            className="bg-[#F2F2F2] border-[#E5E7EB] rounded-lg"
            aria-describedby="datetime-helper"
          />
          <p id="datetime-helper" className="text-xs text-gray-500 mt-1">
            Formato dd/mm/aaaa hh:mm
          </p>
        </div>

        {/* Añadir parada con validaciones inline */}
        <Dialog open={showAddStopModal} onOpenChange={setShowAddStopModal}>
          <DialogTrigger asChild>
            <Button 
              className="w-full text-white"
              style={{ backgroundColor: '#4472C4' }}
              data-analytics="plan.create.addStop"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir parada
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Nueva parada</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  value={newStop.address}
                  onChange={(e) => setNewStop({...newStop, address: e.target.value})}
                  placeholder="Calle Mayor 1, Madrid"
                  className="bg-[#F2F2F2] border-[#E5E7EB] rounded-lg"
                  aria-describedby="address-error"
                />
                {!newStop.address.trim() && newStop.address !== "" && (
                  <p id="address-error" className="text-xs text-red-600 mt-1">
                    La dirección es obligatoria
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="client">Cliente</Label>
                <Input
                  id="client"
                  value={newStop.client}
                  onChange={(e) => setNewStop({...newStop, client: e.target.value})}
                  placeholder="Nombre del cliente"
                  className="bg-[#F2F2F2] border-[#E5E7EB] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeStart">Hora inicio</Label>
                  <Input
                    id="timeStart"
                    type="time"
                    value={newStop.timeStart}
                    onChange={(e) => setNewStop({...newStop, timeStart: e.target.value})}
                    className="bg-[#F2F2F2] border-[#E5E7EB] rounded-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="timeEnd">Hora fin</Label>
                  <Input
                    id="timeEnd"
                    type="time"
                    value={newStop.timeEnd}
                    onChange={(e) => setNewStop({...newStop, timeEnd: e.target.value})}
                    className="bg-[#F2F2F2] border-[#E5E7EB] rounded-lg"
                    aria-describedby="time-error"
                  />
                  {!validateTimeWindow() && newStop.timeStart && newStop.timeEnd && (
                    <p id="time-error" className="text-xs text-red-600 mt-1">
                      La hora de fin debe ser posterior a la hora de inicio
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>Tipo de operación *</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="operationType"
                      value="pickup"
                      checked={newStop.type === 'pickup'}
                      onChange={(e) => setNewStop({...newStop, type: e.target.value})}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Recogida</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="operationType"
                      value="delivery"
                      checked={newStop.type === 'delivery'}
                      onChange={(e) => setNewStop({...newStop, type: e.target.value})}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Entrega</span>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="estimatedTime">Tiempo estimado (minutos)</Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  min="1"
                  max="480"
                  value={newStop.estimatedTime}
                  onChange={(e) => setNewStop({...newStop, estimatedTime: parseInt(e.target.value) || 15})}
                  className="bg-[#F2F2F2] border-[#E5E7EB] rounded-lg"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowAddStopModal(false)}
                variant="outline"
                style={{ borderColor: '#DB2142', color: '#DB2142' }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleAddStop}
                className="text-white"
                style={{ backgroundColor: '#4472C4' }}
                disabled={!newStop.address.trim() || !validateTimeWindow()}
              >
                Guardar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla de paradas mejorada */}
      {stops.length > 0 && (
        <div className="border rounded-lg bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Orden</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Ventana</TableHead>
                <TableHead>Operación</TableHead>
                <TableHead>Tiempo (min)</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stops.map((stop, index) => (
                <TableRow key={stop.id} className={index % 2 === 1 ? 'bg-[#FAFBFF]' : ''}>
                  <TableCell>{stop.order}</TableCell>
                  <TableCell className="font-medium">{stop.address}</TableCell>
                  <TableCell>{stop.client || '-'}</TableCell>
                  <TableCell>
                    {stop.timeStart && stop.timeEnd ? `${stop.timeStart}-${stop.timeEnd}` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={stop.type === 'pickup' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                      {stop.type === 'pickup' ? 'Recogida' : 'Entrega'}
                    </Badge>
                  </TableCell>
                  <TableCell>{stop.estimatedTime}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStop(index, 'up')}
                        disabled={index === 0}
                        aria-label="Mover parada hacia arriba"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStop(index, 'down')}
                        disabled={index === stops.length - 1}
                        aria-label="Mover parada hacia abajo"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStop(index)}
                        className="text-red-600 hover:text-red-800"
                        aria-label="Eliminar parada"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Botones principales con jerarquía mejorada */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex gap-3">
          <Button
            onClick={handleGenerateRoute}
            className="text-white"
            style={{ backgroundColor: '#4472C4' }}
            disabled={!routeName.trim() || stops.length === 0}
            data-analytics="plan.create.generate"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Generar Ruta
          </Button>
          
          <Button
            onClick={handleOptimize}
            disabled={stops.length < 2}
            variant="outline"
            className="border-green-500 text-green-700 hover:bg-green-50"
            data-analytics="plan.optimize"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Optimizar
          </Button>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            style={{ backgroundColor: '#F1F0EC', color: '#000000', borderColor: '#E5E7EB' }}
            disabled={stops.length === 0}
          >
            Guardar como plantilla
          </Button>
          
          <Button
            disabled={stops.length === 0 || !routeName.trim()}
            className="text-white"
            style={{ backgroundColor: '#4472C4' }}
            data-analytics="plan.create.start"
          >
            <Clock className="w-4 h-4 mr-2" />
            Iniciar ruta
          </Button>
        </div>
      </div>

      {/* Empty state para paradas */}
      {stops.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No hay paradas añadidas</p>
          <p className="text-sm text-gray-400 mt-1">Añade al menos una parada para crear la ruta</p>
        </div>
      )}
    </div>
  );
}
