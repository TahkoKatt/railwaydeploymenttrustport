
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Layers, Users, MapPin, Scan, Play, CheckCircle, Clock, 
  Package2, Route, BarChart3, Zap, AlertTriangle, ArrowRight
} from "lucide-react";
import { toast } from "sonner";

// Tokens Trustport
const TRUSTPORT_TOKENS = {
  colors: {
    primary: '#4472C4',
    secondary: '#DB2142', 
    green: '#00A878',
    yellow: '#FFC857'
  },
  fonts: { primary: 'Montserrat, sans-serif' },
  shadow: '0 8px 24px rgba(0,0,0,.08)',
  radius: '16px'
};

// Mock data para picking
const mockWaves = [
  {
    id: 'WAVE-001',
    status: 'planned',
    orders: 15,
    lines: 87,
    estimated_time: 120,
    picker_count: 3,
    efficiency_score: 0.85,
    created_at: '2025-08-26T08:00:00Z'
  },
  {
    id: 'WAVE-002', 
    status: 'in_progress',
    orders: 12,
    lines: 64,
    estimated_time: 95,
    picker_count: 2,
    efficiency_score: 0.92,
    created_at: '2025-08-26T09:30:00Z'
  }
];

const mockTasks = [
  {
    id: 'TASK-001',
    wave_id: 'WAVE-001',
    order_id: 'ORD-123',
    sku: 'PROD-001',
    qty: 5,
    location_id: 'LOC-A-01',
    status: 'pending',
    picker_id: null,
    sequence: 1
  },
  {
    id: 'TASK-002',
    wave_id: 'WAVE-002', 
    order_id: 'ORD-124',
    sku: 'PROD-002',
    qty: 3,
    location_id: 'LOC-B-05',
    status: 'in_progress',
    picker_id: 'picker_001',
    sequence: 1
  },
  {
    id: 'TASK-003',
    wave_id: null, // waveless
    order_id: 'ORD-125',
    sku: 'PROD-003',
    qty: 2,
    location_id: 'LOC-C-12',
    status: 'completed',
    picker_id: 'picker_002',
    sequence: 1
  }
];

const mockPickers = [
  { id: 'picker_001', name: 'María García', status: 'busy', tasks_assigned: 5, efficiency: 0.92 },
  { id: 'picker_002', name: 'Luis Pérez', status: 'available', tasks_assigned: 0, efficiency: 0.88 },
  { id: 'picker_003', name: 'Ana López', status: 'busy', tasks_assigned: 8, efficiency: 0.95 }
];

export default function PickingManager() {
  // Estado según spec base44
  const [selectedPersona] = useState(() => localStorage.getItem('selectedPersona') || 'operador');
  const [activeTab, setActiveTab] = useState('planning');
  
  // Top filters según layout spec
  const [filters, setFilters] = useState({
    mode: 'wave',
    zone: null,
    owner_id: null
  });

  // Estado del picker
  const [waves, setWaves] = useState(mockWaves);
  const [tasks, setTasks] = useState(mockTasks);
  const [pickers, setPickers] = useState(mockPickers);
  const [selectedWave, setSelectedWave] = useState(null);

  // Persona overlays según spec
  const getPersonaConfig = () => {
    const configs = {
      comerciante: {
        default_filters: { mode: 'waveless' },
        quick_actions: ['assign_tasks']
      },
      operador: {
        default_filters: { mode: 'wave' },
        quick_actions: ['create_wave', 'assign_tasks']
      }
    };
    return configs[selectedPersona] || configs.operador;
  };

  const personaConfig = getPersonaConfig();

  // Aplicar filtros de persona al montar
  useEffect(() => {
    const config = getPersonaConfig();
    setFilters(prev => ({ ...prev, ...config.default_filters }));
  }, [selectedPersona]); // Solo selectedPersona como dependencia

  // API handlers según spec
  const handleCreateWave = async () => {
    try {
      // POST /wms/picks/waves con Idempotency-Key
      const newWave = {
        id: `WAVE-${Date.now()}`,
        status: 'planned',
        orders: 0,
        lines: 0,
        estimated_time: 0,
        picker_count: 0,
        efficiency_score: 0,
        created_at: new Date().toISOString()
      };
      
      setWaves([...waves, newWave]);
      toast.success('Oleada creada exitosamente');
      console.log('[WMS-API] Wave created:', newWave.id);
      // Emitir evento: wms.pick.wave.created.v1
    } catch (error) {
      toast.error('Error creando oleada');
    }
  };

  const handleAssignTasks = async (waveId = null) => {
    try {
      // POST /wms/picks/assign
      const targetTasks = tasks.filter(t => waveId ? t.wave_id === waveId : !t.wave_id);
      console.log('[WMS-API] Assigning tasks:', { waveId, taskCount: targetTasks.length });
      toast.success(`${targetTasks.length} tareas asignadas`);
    } catch (error) {
      toast.error('Error asignando tareas');
    }
  };

  const handleStartTask = async (taskId) => {
    try {
      // POST /wms/picks/{id}/start
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'in_progress', started_at: new Date().toISOString() }
          : task
      );
      setTasks(updatedTasks);
      toast.success('Tarea iniciada');
      console.log('[WMS-API] Task started:', taskId);
      // Emitir evento: wms.pick.task.started.v1
    } catch (error) {
      toast.error('Error iniciando tarea');
    }
  };

  const handleScanTask = async (taskId, scanData) => {
    try {
      // POST /wms/picks/{id}/scan con Idempotency-Key
      console.log('[WMS-API] Scanning task:', { taskId, scanData });
      // SLO: scan_p95_ms < 100ms
      toast.success(`Escaneado: ${scanData.qty} unidades`);
    } catch (error) {
      toast.error('Error en escaneo');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      // POST /wms/picks/{id}/complete
      const updatedTasks = tasks.map(task =>
        task.id === taskId
          ? { ...task, status: 'completed', completed_at: new Date().toISOString() }
          : task
      );
      setTasks(updatedTasks);
      toast.success('Tarea completada');
      console.log('[WMS-API] Task completed:', taskId);
      // Emitir evento: wms.pick.task.completed.v1
    } catch (error) {
      toast.error('Error completando tarea');
    }
  };

  // Filtros de datos
  const filteredWaves = waves.filter(wave => {
    if (filters.mode === 'waveless') return false; // Solo mostrar en modo wave
    return true;
  });

  const filteredTasks = tasks.filter(task => {
    if (filters.mode === 'wave' && !task.wave_id) return false;
    if (filters.mode === 'waveless' && task.wave_id) return false;
    return true;
  });

  // Estadísticas
  const stats = {
    total_tasks: filteredTasks.length,
    pending_tasks: filteredTasks.filter(t => t.status === 'pending').length,
    in_progress_tasks: filteredTasks.filter(t => t.status === 'in_progress').length,
    completed_tasks: filteredTasks.filter(t => t.status === 'completed').length,
    active_pickers: pickers.filter(p => p.status === 'busy').length
  };

  const getStatusBadge = (status) => {
    const configs = {
      planned: { bg: 'bg-blue-100', color: 'text-blue-600', label: 'Planificada' },
      in_progress: { bg: 'bg-orange-100', color: 'text-orange-600', label: 'En Progreso' },
      completed: { bg: 'bg-green-100', color: 'text-green-600', label: 'Completada' },
      pending: { bg: 'bg-gray-100', color: 'text-gray-600', label: 'Pendiente' }
    };
    return configs[status] || configs.pending;
  };

  const renderPlanningTab = () => (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package2 className="w-6 h-6 mx-auto mb-2" style={{ color: TRUSTPORT_TOKENS.colors.primary }} />
            <p className="text-2xl font-bold">{stats.total_tasks}</p>
            <p className="text-sm text-gray-600">Total Tareas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: TRUSTPORT_TOKENS.colors.yellow }} />
            <p className="text-2xl font-bold">{stats.pending_tasks}</p>
            <p className="text-sm text-gray-600">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Play className="w-6 h-6 mx-auto mb-2" style={{ color: TRUSTPORT_TOKENS.colors.secondary }} />
            <p className="text-2xl font-bold">{stats.in_progress_tasks}</p>
            <p className="text-sm text-gray-600">En Proceso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-2" style={{ color: TRUSTPORT_TOKENS.colors.green }} />
            <p className="text-2xl font-bold">{stats.completed_tasks}</p>
            <p className="text-sm text-gray-600">Completadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2" style={{ color: TRUSTPORT_TOKENS.colors.violet }} />
            <p className="text-2xl font-bold">{stats.active_pickers}</p>
            <p className="text-sm text-gray-600">Pickers Activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Wave vs Waveless */}
      {filters.mode === 'wave' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Oleadas */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[18px]">Oleadas de Picking</CardTitle>
                {personaConfig.quick_actions.includes('create_wave') && (
                  <Button 
                    onClick={handleCreateWave}
                    size="sm"
                    style={{ backgroundColor: TRUSTPORT_TOKENS.colors.primary }}
                  >
                    <Layers className="w-4 h-4 mr-2" />
                    Crear Oleada
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredWaves.map((wave) => {
                  const statusConfig = getStatusBadge(wave.status);
                  return (
                    <div 
                      key={wave.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedWave === wave.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedWave(wave.id)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{wave.id}</h4>
                        <Badge className={`${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Órdenes:</span> {wave.orders}
                        </div>
                        <div>
                          <span className="text-gray-600">Líneas:</span> {wave.lines}
                        </div>
                        <div>
                          <span className="text-gray-600">ETA:</span> {wave.estimated_time} min
                        </div>
                        <div>
                          <span className="text-gray-600">Pickers:</span> {wave.picker_count}
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Eficiencia</span>
                          <span className="text-sm font-medium">{Math.round(wave.efficiency_score * 100)}%</span>
                        </div>
                        <Progress value={wave.efficiency_score * 100} className="h-2" />
                      </div>
                      {personaConfig.quick_actions.includes('assign_tasks') && (
                        <div className="mt-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignTasks(wave.id);
                            }}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Asignar Tareas
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pickers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[18px]">Pickers Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pickers.map((picker) => (
                  <div key={picker.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{picker.name}</h4>
                      <Badge className={
                        picker.status === 'available' 
                          ? 'bg-green-100 text-green-600'
                          : 'bg-orange-100 text-orange-600'
                      }>
                        {picker.status === 'available' ? 'Disponible' : 'Ocupado'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Tareas:</span> {picker.tasks_assigned}
                      </div>
                      <div>
                        <span className="text-gray-600">Eficiencia:</span> {Math.round(picker.efficiency * 100)}%
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress value={picker.efficiency * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Modo Waveless
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-[18px]">Picking Sin Oleadas</CardTitle>
              {personaConfig.quick_actions.includes('assign_tasks') && (
                <Button 
                  onClick={() => handleAssignTasks()}
                  size="sm"
                  style={{ backgroundColor: TRUSTPORT_TOKENS.colors.green }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Asignar Tareas
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Picker</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const statusConfig = getStatusBadge(task.status);
                  return (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.order_id}</TableCell>
                      <TableCell>{task.sku}</TableCell>
                      <TableCell>{task.qty}</TableCell>
                      <TableCell>{task.location_id}</TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.picker_id ? 
                          pickers.find(p => p.id === task.picker_id)?.name || task.picker_id 
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {task.status === 'pending' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStartTask(task.id)}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          {task.status === 'in_progress' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCompleteTask(task.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderExecutionTab = () => (
    <div className="space-y-6">
      {/* Task execution interface similar to PickingMobile but for web */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-[18px]">Tareas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Cant.</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Picker</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.filter(t => t.status === 'in_progress').map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.id}</TableCell>
                    <TableCell>{task.order_id}</TableCell>
                    <TableCell>{task.sku}</TableCell>
                    <TableCell>{task.qty}</TableCell>
                    <TableCell>{task.location_id}</TableCell>
                    <TableCell>
                      {pickers.find(p => p.id === task.picker_id)?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleScanTask(task.id, { qty: task.qty })}
                        >
                          <Scan className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Real-time metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[16px]">Métricas en Tiempo Real</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Productividad</span>
              </div>
              <p className="text-xl font-bold">24.8 items/h</p>
              <p className="text-xs text-green-600">+1.2 vs ayer</p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Precisión</span>
              </div>
              <p className="text-xl font-bold">98.5%</p>
              <p className="text-xs text-blue-600">+0.1% vs ayer</p>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Route className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Distancia</span>
              </div>
              <p className="text-xl font-bold">1.2 km</p>
              <p className="text-xs text-orange-600">Hoy</p>
            </div>

            <div className="p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">Excepciones</span>
              </div>
              <p className="text-xl font-bold">3</p>
              <p className="text-xs text-red-600">Backorders</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Filters según layout spec */}
      <Card className="bg-white shadow-sm" style={{ boxShadow: TRUSTPORT_TOKENS.shadow, borderRadius: TRUSTPORT_TOKENS.radius }}>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Mode segmented control */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {['wave', 'waveless'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setFilters({...filters, mode})}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filters.mode === mode
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode === 'wave' ? 'Con Oleadas' : 'Sin Oleadas'}
                </button>
              ))}
            </div>

            <Select value={filters.zone || 'all'} onValueChange={(value) => setFilters({...filters, zone: value === 'all' ? null : value})}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Zona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las zonas</SelectItem>
                <SelectItem value="picking">Picking</SelectItem>
                <SelectItem value="storage">Storage</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.owner_id || 'all'} onValueChange={(value) => setFilters({...filters, owner_id: value === 'all' ? null : value})}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ACME">ACME Corp</SelectItem>
                <SelectItem value="BETA">Beta Inc</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs según layout spec */}
      <Card className="bg-white shadow-sm" style={{ boxShadow: TRUSTPORT_TOKENS.shadow, borderRadius: TRUSTPORT_TOKENS.radius }}>
        <CardHeader className="p-0">
          <div className="flex border-b border-gray-200">
            {['planning', 'execution'].map(tabKey => (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tabKey
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tabKey === 'planning' && 'Planificación'}
                {tabKey === 'execution' && 'Ejecución'}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {activeTab === 'planning' && renderPlanningTab()}
          {activeTab === 'execution' && renderExecutionTab()}
        </CardContent>
      </Card>
    </div>
  );
}
