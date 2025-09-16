import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const mockRoutesForSimulation = [
  { id: 1, name: "Ruta Madrid Centro", originalEta: 95 },
  { id: 2, name: "Ruta BCN Norte", originalEta: 130 },
  { id: 3, name: "Ruta Valencia Sur", originalEta: 180 }
];

export default function SimuladorRutas() {
  const [selectedRoute, setSelectedRoute] = useState("");
  const [trafficVariation, setTrafficVariation] = useState([0]);
  const [stopTimeVariation, setStopTimeVariation] = useState([0]);
  const [speedVariation, setSpeedVariation] = useState([0]);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const selectedRouteData = mockRoutesForSimulation.find(r => r.id.toString() === selectedRoute);

  const executeSimulation = async () => {
    if (!selectedRoute) {
      toast.error("Selecciona una ruta para simular");
      return;
    }

    setIsSimulating(true);
    
    // Simular carga
    await new Promise(resolve => setTimeout(resolve, 2000));

    const originalEta = selectedRouteData.originalEta;
    const trafficImpact = (trafficVariation[0] / 100) * originalEta;
    const stopTimeImpact = stopTimeVariation[0];
    const speedImpact = -(speedVariation[0] / 100) * originalEta;
    
    const simulatedEta = Math.max(30, originalEta + trafficImpact + stopTimeImpact + speedImpact);
    const timeDifference = simulatedEta - originalEta;
    const percentageChange = ((timeDifference / originalEta) * 100);

    setSimulationResult({
      original: originalEta,
      simulated: Math.round(simulatedEta),
      difference: Math.round(timeDifference),
      percentage: Math.round(percentageChange * 10) / 10
    });

    setIsSimulating(false);
    toast.success("Simulación completada");
  };

  const applySimulation = () => {
    if (!simulationResult) return;
    
    toast.success(`Simulación aplicada. Nuevo ETA: ${simulationResult.simulated} min`);
    setSimulationResult(null);
  };

  const resetSimulation = () => {
    setTrafficVariation([0]);
    setStopTimeVariation([0]);
    setSpeedVariation([0]);
    setSimulationResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Selector de ruta */}
      <div>
        <Label>Seleccionar ruta</Label>
        <Select value={selectedRoute} onValueChange={setSelectedRoute}>
          <SelectTrigger className="bg-[#F2F2F2] border-[#E5E7EB] rounded-lg">
            <SelectValue placeholder="Elige una ruta para simular" />
          </SelectTrigger>
          <SelectContent>
            {mockRoutesForSimulation.map((route) => (
              <SelectItem key={route.id} value={route.id.toString()}>
                {route.name} (ETA original: {route.originalEta} min)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Controles de simulación */}
      <div className="space-y-6">
        <div>
          <Label>Variación de tráfico: {trafficVariation[0]}%</Label>
          <div className="mt-2">
            <Slider
              value={trafficVariation}
              onValueChange={setTrafficVariation}
              max={20}
              min={-20}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>-20% (Fluido)</span>
            <span>+20% (Congestionado)</span>
          </div>
        </div>

        <div>
          <Label>Tiempo de parada: {stopTimeVariation[0] > 0 ? '+' : ''}{stopTimeVariation[0]} min</Label>
          <div className="mt-2">
            <Slider
              value={stopTimeVariation}
              onValueChange={setStopTimeVariation}
              max={30}
              min={-15}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>-15 min (Rápido)</span>
            <span>+30 min (Lento)</span>
          </div>
        </div>

        <div>
          <Label>Velocidad promedio: {speedVariation[0] > 0 ? '+' : ''}{speedVariation[0]}%</Label>
          <div className="mt-2">
            <Slider
              value={speedVariation}
              onValueChange={setSpeedVariation}
              max={20}
              min={-20}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>-20% (Más lento)</span>
            <span>+20% (Más rápido)</span>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3">
        <Button
          onClick={executeSimulation}
          disabled={!selectedRoute || isSimulating}
          className="text-white"
          style={{ backgroundColor: '#4472C4' }}
        >
          {isSimulating ? 'Simulando...' : 'Ejecutar simulación'}
        </Button>
        
        <Button
          onClick={resetSimulation}
          variant="outline"
          style={{ backgroundColor: '#F1F0EC', color: '#000000', borderColor: '#E5E7EB' }}
        >
          Resetear
        </Button>
      </div>

      {/* Resultados de simulación */}
      {simulationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resultados de simulación</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Escenario</TableHead>
                  <TableHead>ETA (min)</TableHead>
                  <TableHead>Diferencia</TableHead>
                  <TableHead>% Cambio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Original</TableCell>
                  <TableCell>{simulationResult.original}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Simulado</TableCell>
                  <TableCell>{simulationResult.simulated}</TableCell>
                  <TableCell>
                    <span className={simulationResult.difference > 0 ? 'text-red-600' : 'text-green-600'}>
                      {simulationResult.difference > 0 ? '+' : ''}{simulationResult.difference} min
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={simulationResult.percentage > 0 ? 'text-red-600' : 'text-green-600'}>
                      {simulationResult.percentage > 0 ? '+' : ''}{simulationResult.percentage}%
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <div className="mt-4 flex gap-3">
              <Button
                onClick={applySimulation}
                className="text-white"
                style={{ backgroundColor: '#10B981' }}
              >
                Aplicar simulación
              </Button>
              <Button
                onClick={() => setSimulationResult(null)}
                variant="outline"
                style={{ borderColor: '#DB2142', color: '#DB2142' }}
              >
                Descartar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}