
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Scan, MapPin, Package, Clock, CheckCircle, AlertTriangle,
  Navigation, Users, BarChart3, Route, Play, Pause
} from "lucide-react";
import { toast } from "sonner";

// Initial data for picking tasks, now to be managed by state
const initialPickingTasksData = [
  {
    id: 'task_001',
    waveId: 'wave_001',
    orderId: 'order_123',
    productName: 'Monitor Samsung 24"',
    productId: 'PROD-001',
    locationId: 'LOC-A-01',
    requiredQty: 5,
    pickedQty: 0,
    uom: 'Unidad',
    status: 'released',
    priority: 'high'
  },
  {
    id: 'task_002',
    waveId: 'wave_001',
    orderId: 'order_124',
    productName: 'Teclado Logitech MX',
    productId: 'PROD-002',
    locationId: 'LOC-B-05',
    requiredQty: 3,
    pickedQty: 0,
    uom: 'Caja',
    status: 'released',
    priority: 'medium'
  },
  {
    id: 'task_003',
    waveId: 'wave_001',
    orderId: 'order_125',
    productName: 'Mouse Inalámbrico',
    productId: 'PROD-003',
    locationId: 'LOC-C-12',
    requiredQty: 2,
    pickedQty: 2,
    uom: 'Unidad',
    status: 'completed',
    priority: 'low'
  }
];

export default function PickingMobile() {
  const [tasks, setTasks] = useState(initialPickingTasksData); // All picking tasks
  const [currentTask, setCurrentTask] = useState(tasks.find(task => task.status === 'released') || null); // Current active task, find first released
  const [scanMode, setScanMode] = useState('location'); // location, product, quantity
  const [scannedData, setScannedData] = useState({
    location: '',
    barcode: '',
    quantity: ''
  });
  const [waveStatus, setWaveStatus] = useState('in_progress');

  // Helper functions for common calculations
  const completedTasksCount = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;

  // New handler for completing a task, including QA logging and flow advancement
  const handleCompleteTask = (taskId, pickedQty) => {
    try {
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task =>
          task.id === taskId
            ? { ...task, status: 'completed', pickedQty: pickedQty, completed_at: new Date().toISOString() }
            : task
        );

        // Find the next released task from the newly updated list
        const nextReleasedTask = updatedTasks.find(task => task.status === 'released');

        if (nextReleasedTask) {
          setCurrentTask(nextReleasedTask); // Set the next task as current
          setScanMode('location'); // Reset scan mode for the new task
          setScannedData({ location: '', barcode: '', quantity: '' }); // Clear scanned data
        } else {
          setCurrentTask(null); // No more active tasks
          setWaveStatus('completed'); // Mark wave as completed
          setScanMode('location'); // Reset scan mode for completeness
          setScannedData({ location: '', barcode: '', quantity: '' }); // Clear scanned data
          toast.success('Todas las tareas de la oleada han sido completadas.');
        }
        return updatedTasks; // Return the new tasks array to update the state
      });

      // Event for QA - Log pick confirmation
      console.log('[WMS-EVT] wms.pick.confirmed.v1:', {
        task_id: taskId,
        wave_id: currentTask?.waveId || 'WAVE-001', // Use currentTask.waveId, fallback to 'WAVE-001'
        picker_id: 'PICKER-001'
      });

      toast.success('Pick confirmado exitosamente');
    } catch (error) {
      toast.error('Error confirmando pick');
      console.error('Error in handleCompleteTask:', error);
    }
  };

  const handleScan = (value) => {
    if (!currentTask) {
      toast.info("No hay tarea activa para escanear.");
      return;
    }

    setScannedData(prev => ({ ...prev, [scanMode]: value }));

    // Simulate scan validation
    if (scanMode === 'location') {
      if (value === currentTask.locationId) {
        toast.success('Ubicación correcta escaneada');
        setScanMode('product');
      } else {
        toast.error('Ubicación incorrecta');
      }
    } else if (scanMode === 'product') {
      // Use currentTask.productId for more realistic product validation
      if (value === currentTask.productId) {
        toast.success('Producto correcto escaneado');
        setScanMode('quantity');
      } else {
        toast.error('Código de barras inválido para este producto');
      }
    }
  };

  const handleConfirmPick = () => {
    if (!currentTask) {
      toast.info("No hay tarea activa para confirmar.");
      return;
    }

    const newPickedQty = parseInt(scannedData.quantity) || 0;

    if (newPickedQty === currentTask.requiredQty) {
      // Delegate the actual task completion, logging, and advancement to handleCompleteTask
      handleCompleteTask(currentTask.id, newPickedQty);
    } else if (newPickedQty < currentTask.requiredQty) {
      toast.warning('Cantidad insuficiente - creando backorder');
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === currentTask.id
          ? { ...task, status: 'short', pickedQty: newPickedQty }
          : task
      ));
      setCurrentTask(prev => ({ ...prev, status: 'short', pickedQty: newPickedQty })); // Update currentTask for immediate reflection
    } else {
      toast.error('Cantidad excede lo requerido');
    }
  };

  const handleSubstitution = () => {
    toast.info('Solicitando sustitución de producto');
  };

  const getStatusConfig = (status) => {
    const configs = {
      released: { bg: 'bg-blue-100', color: 'text-blue-600', label: 'Liberada' },
      in_progress: { bg: 'bg-orange-100', color: 'text-orange-600', label: 'En progreso' },
      completed: { bg: 'bg-green-100', color: 'text-green-600', label: 'Completada' },
      short: { bg: 'bg-red-100', color: 'text-red-600', label: 'Faltante' }
    };
    return configs[status] || configs.released;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="space-y-6">
      {/* Header móvil con progreso */}
      <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Oleada: WAVE-001
              </h2>
              <p className="text-sm text-gray-500">
                {completedTasksCount} de {totalTasks} tareas completadas
              </p>
            </div>
            <Badge className={waveStatus === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}>
              {waveStatus === 'completed' ? 'Completada' : 'En progreso'}
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de tareas móvil */}
        <div className="lg:col-span-1">
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Lista de Tareas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.map((task) => { // Use 'tasks' state variable
                const statusConfig = getStatusConfig(task.status);
                const isActive = currentTask && currentTask.id === task.id; // Check currentTask before accessing id

                return (
                  <div
                    key={task.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentTask(task)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}
                          />
                          <p className="text-sm font-medium">{task.productName}</p>
                        </div>
                        <p className="text-xs text-gray-500">{task.locationId}</p>
                        <p className="text-xs text-gray-500">{task.requiredQty} {task.uom}</p>
                      </div>
                      <Badge className={`${statusConfig.bg} ${statusConfig.color} text-xs`}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Interfaz de escaneo */}
        <div className="lg:col-span-1">
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Escaneo Activo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tarea actual */}
              {currentTask ? ( // Only render current task details if a task is active
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{currentTask.productName}</span>
                    <Badge className="bg-blue-600 text-white">#{currentTask.orderId}</Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📍 Ubicación: {currentTask.locationId}</p>
                    <p>📦 Cantidad: {currentTask.requiredQty} {currentTask.uom}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <p>Todas las tareas completadas!</p>
                </div>
              )}

              {/* Pasos de escaneo */}
              {currentTask && ( // Only show scan steps if there's a current task
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${scanMode === 'location' ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">1. Escanear Ubicación</span>
                      {scanMode === 'location' && <Scan className="w-4 h-4 text-yellow-600" />}
                      {scannedData.location && scanMode !== 'location' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    </div>
                    {scanMode === 'location' && (
                      <Input
                        placeholder="Escanear código ubicación..."
                        value={scannedData.location}
                        onChange={(e) => handleScan(e.target.value)}
                        className="mt-2"
                        autoFocus
                      />
                    )}
                    {scannedData.location && scanMode !== 'location' && (
                      <p className="text-xs text-gray-600 mt-1">{scannedData.location}</p>
                    )}
                  </div>

                  <div className={`p-3 rounded-lg ${scanMode === 'product' ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">2. Escanear Producto</span>
                      {scanMode === 'product' && <Scan className="w-4 h-4 text-yellow-600" />}
                      {scannedData.barcode && scanMode !== 'product' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    </div>
                    {scanMode === 'product' && (
                      <Input
                        placeholder="Escanear código barras..."
                        value={scannedData.barcode}
                        onChange={(e) => handleScan(e.target.value)}
                        className="mt-2"
                        autoFocus
                      />
                    )}
                  </div>

                  <div className={`p-3 rounded-lg ${scanMode === 'quantity' ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">3. Confirmar Cantidad</span>
                      {scanMode === 'quantity' && <Package className="w-4 h-4 text-yellow-600" />}
                    </div>
                    {scanMode === 'quantity' && (
                      <div className="mt-2 space-y-2">
                        <Input
                          type="number"
                          placeholder={`Cantidad (máx: ${currentTask.requiredQty})`}
                          value={scannedData.quantity}
                          onChange={(e) => setScannedData(prev => ({ ...prev, quantity: e.target.value }))}
                          max={currentTask.requiredQty}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleConfirmPick}
                            className="flex-1 text-white"
                            style={{ backgroundColor: '#10B981' }}
                            disabled={!scannedData.quantity || parseInt(scannedData.quantity) <= 0}
                          >
                            Confirmar Pick
                          </Button>
                          <Button
                            onClick={handleSubstitution}
                            variant="outline"
                            className="flex-1"
                          >
                            Sustitución
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel de operario y métricas */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Panel Operario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">María García</p>
                  <p className="text-xs text-gray-500">Turno: Mañana (08:00-16:00)</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Líneas/Hora</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Precisión</span>
                  <span className="font-medium text-green-600">98.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Distancia recorrida</span>
                  <span className="font-medium">1.2 km</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Ruta Optimizada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Route className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs">Mapa de ruta de picking</p>
                  <p className="text-xs">Distancia restante: 150m</p>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => toast.info('Ruta replanificada')}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Replaniﬁcar Ruta
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Estado Oleada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Picking completado</p>
                  <p className="text-xs text-green-600">{completedTasksCount} tarea{completedTasksCount !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                <Clock className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">En progreso</p>
                  <p className="text-xs text-blue-600">{totalTasks - completedTasksCount} tarea{totalTasks - completedTasksCount !== 1 ? 's' : ''} restante{totalTasks - completedTasksCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
