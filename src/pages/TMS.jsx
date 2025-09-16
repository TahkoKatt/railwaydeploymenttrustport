
import React, { useState, useEffect } from "react";
import {
  Truck, MapPin, Clock, CheckCircle, AlertTriangle, Route,
  TrendingUp, Navigation, Package, Fuel, Users, SlidersHorizontal,
  Plus, Edit, Calendar, Settings, Wrench, FileText, MessageSquare,
  ArrowRight, Search, Box, CircleDot, CircleOff, RefreshCw, Download, Target, Filter, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import ExceptionsPanel from "@/components/tms/ExceptionsPanel";
import PlanificacionForm from "@/components/tms/PlanificacionForm";
import RutasActivas from "@/components/tms/RutasActivas";
import HistorialRutas from "@/components/tms/HistorialRutas";
import SimuladorRutas from "@/components/tms/SimuladorRutas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Importar Recharts components
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Importar Fleet Sub-components
import FleetVehicles from "../components/tms/FleetVehicles";
import FleetDrivers from "../components/tms/FleetDrivers";
import FleetSupplies from "../components/tms/FleetSupplies";

// Import new component
import SeguimientoVehiculos from "../components/tms/SeguimientoVehiculos";

// Import new POD and Costos components
import PODDocumentsList from "../components/tms/PODDocumentsList";
import PODDetailsPanel from "../components/tms/PODDetailsPanel";

// Importar componentes Costos (new components)
import CostosKPIs from "../components/tms/CostosKPIs";
import CostosFilters from "../components/tms/CostosFilters";
import CostosCharts from "../components/tms/CostosCharts";
import CostosTable from "../components/tms/CostosTable";


// Importar todos los mocks
import {
  routes, simulatorDefaults, vehicles, drivers, maintenances,
  supplies, pendingLoads, liveVehicles, alerts, deliveries,
  coldChain, chats, documents, signatures, returnsAndIncidents,
  kpis, costEvolution, realVsBudget, profitabilityByClient
} from "@/components/tms/mocks";

// Removed old StatCard as it's replaced by EnhancedStatCard

const FleetAssignment = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'assigned'

    const filteredLoads = pendingLoads.filter(load => {
        const matchesSearch = load.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              load.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              load.destination.toLowerCase().includes(searchTerm.toLowerCase());
        // For simplicity, we'll assume pendingLoads are all 'pending'.
        // If they had a 'status' field, we would use it here.
        const matchesStatus = filterStatus === 'all' || (filterStatus === 'pending');
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Buscar carga por ID, origen o destino..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Simplified filters for assignment */}
                <div className="flex gap-2">
                    <Button
                        variant={filterStatus === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('all')}
                        style={filterStatus === 'all' ? { backgroundColor: '#4472C4', color: 'white' } : {}}
                    >
                        Todas
                    </Button>
                    <Button
                        variant={filterStatus === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('pending')}
                        style={filterStatus === 'pending' ? { backgroundColor: '#4472C4', color: 'white' } : {}}
                    >
                        Pendientes
                    </Button>
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID Carga</TableHead>
                        <TableHead>Origen</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Peso (kg)</TableHead>
                        <TableHead>Volumen (m³)</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredLoads.length > 0 ? filteredLoads.map((load) => (
                        <TableRow key={load.id}>
                            <TableCell className="font-medium">{load.id}</TableCell>
                            <TableCell>{load.origin}</TableCell>
                            <TableCell>{load.destination}</TableCell>
                            <TableCell>{load.weight}</TableCell>
                            <TableCell>{load.volume}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={() => toast.info(`Asignando carga ${load.id}`)}>
                                    <ArrowRight className="w-4 h-4 mr-1" /> Asignar
                                </Button>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-gray-500">No hay cargas pendientes de asignación.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

const FleetMaintenance = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'completed'

    const filteredMaintenances = maintenances.filter(maintenance => {
        const matchesSearch = maintenance.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              maintenance.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || maintenance.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por matrícula o tipo de mantenimiento..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filterStatus === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('all')}
                        style={filterStatus === 'all' ? { backgroundColor: '#4472C4', color: 'white' } : {}}
                    >
                        Todos
                    </Button>
                    <Button
                        variant={filterStatus === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('pending')}
                        style={filterStatus === 'pending' ? { backgroundColor: '#4472C4', color: 'white' } : {}}
                    >
                        Pendientes
                    </Button>
                    <Button
                        variant={filterStatus === 'completed' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('completed')}
                        style={filterStatus === 'completed' ? { backgroundColor: '#4472C4', color: 'white' } : {}}
                    >
                        Completados
                    </Button>
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Fecha Programada</TableHead>
                        <TableHead>Coste Estimado</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredMaintenances.length > 0 ? filteredMaintenances.map((maintenance) => (
                        <TableRow key={maintenance.id}>
                            <TableCell className="font-medium">{maintenance.vehiclePlate}</TableCell>
                            <TableCell>{maintenance.type}</TableCell>
                            <TableCell>{maintenance.scheduledDate}</TableCell>
                            <TableCell>€{maintenance.estimatedCost.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={maintenance.status === 'completed' ? 'default' : 'secondary'}
                                    className={`${maintenance.status === 'completed' ? 'bg-green-500 hover:bg-green-500' : maintenance.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-500' : 'bg-gray-500 hover:bg-gray-500'} text-white`}
                                >
                                    {maintenance.status === 'completed' ? 'Completado' : maintenance.status === 'pending' ? 'Pendiente' : 'En Curso'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm">
                                    <Wrench className="w-4 h-4 mr-1" /> Detalles
                                </Button>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-gray-500">No se encontraron registros de mantenimiento.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default function TMS() {
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get('tab') || 'dashboard';

  // Estados mejorados según especificación JSON 1.1
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const [dashboardFilters, setDashboardFilters] = useState({
    date_range: 'last_30',
    region: [],
    fleet: []
  });
  const [selectedKPIs, setSelectedKPIs] = useState([]);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const [isPlanEnabled, setIsPlanEnabled] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [planningTab, setPlanningTab] = useState('nueva');
  const [fleetTab, setFleetTab] = useState('vehiculos');
  const [trackingTab, setTrackingTab] = useState('seguimiento');
  const [podTab, setPodTab] = useState('documentos');
  
  // Move costos state to component level to fix hook error
  const [costosActiveTab, setCostosActiveTab] = useState('Costos');
  const [costosFilters, setCostosFilters] = useState({});

  // Data bindings según especificación JSON 1.1
  const dashboardData = {
    kpi: {
      deliveries_today: { value: 47, delta: "+8 vs ayer", severity: "success" },
      otd_percentage: { value: 94.2, delta: "+2.1% vs anterior", severity: "success" },
      cost_per_km: { value: 0.68, delta: "-€0.05 vs anterior", severity: "success" },
      active_routes: { value: 23, delta: "+3 vs anterior", severity: "info" },
      fleet_utilization: { value: 78.5, delta: "+5.2% vs anterior", severity: "warning" },
      avg_delay: { value: 12, delta: "-8 min vs anterior", severity: "success" }
    },
    charts: {
      delivery_status: { completed: 189, in_transit: 23, delayed: 8, failed: 3 },
      route_efficiency: { percentage: 87.3 },
      vehicle_status: { active: 45, maintenance: 5, out_of_service: 2 },
      cost_evolution: {
        months: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],
        actual: [0.75,0.73,0.71,0.70,0.72,0.69,0.68,0.67,0.69,0.68,0.66,0.68],
        target: [0.70,0.70,0.70,0.70,0.70,0.70,0.70,0.70,0.70,0.70,0.70,0.70]
      },
      top_routes: {
        routes: ["Madrid-Barcelona","Valencia-Sevilla","Bilbao-Madrid","Barcelona-Valencia","Sevilla-Córdoba"],
        deliveries: [156,134,98,87,65]
      },
      otd_trend: {
        weeks: ["Sem 1","Sem 2","Sem 3","Sem 4","Sem 5","Sem 6","Sem 7","Sem 8"],
        percentage: [91.2,92.8,89.5,94.1,93.6,95.2,94.8,94.2],
        total_deliveries: [167,189,145,203,178,195,187,223]
      }
    },
    meta: {
      regions: [
        { value: "madrid", label: "Madrid" },
        { value: "barcelona", label: "Barcelona" },
        { value: "valencia", label: "Valencia" },
        { value: "sevilla", label: "Sevilla" }
      ],
      fleets: [
        { value: "fleet_a", label: "Flota A - Urbano" },
        { value: "fleet_b", label: "Flota B - Interurbano" },
        { value: "fleet_c", label: "Flota C - Internacional" }
      ]
    }
  };

  // Formatters según especificación
  const formatters = {
    euro: (value) => new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR', 
      maximumFractionDigits: 2 
    }).format(value),
    percent1: (value) => new Intl.NumberFormat('es-ES', { 
      style: 'percent', 
      maximumFractionDigits: 1 
    }).format(value / 100),
    float2: (value) => new Intl.NumberFormat('es-ES', { 
      maximumFractionDigits: 2 
    }).format(value)
  };

  // Simulación de carga inicial
  useEffect(() => {
    const loadDashboard = async () => {
      setDashboardLoading(true);
      setDashboardError(null); // Clear previous errors
      try {
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1500));
        setDashboardLoading(false);
      } catch (error) {
        setDashboardError("No pudimos cargar el dashboard");
        setDashboardLoading(false);
      }
    };

    if (tab === 'dashboard') {
      loadDashboard();
    }
  }, [tab]);

  // Simulación de WebSocket real-time
  useEffect(() => {
    if (tab === 'dashboard' && !dashboardLoading && !dashboardError) {
      const interval = setInterval(() => {
        setRealtimeConnected(true);
        // Simular actualización de datos en tiempo real (not implemented in this mock)
      }, 30000); // Connect after 30 seconds to simulate a delay

      return () => clearInterval(interval);
    } else {
        setRealtimeConnected(false); // Disconnect if not on dashboard or if loading/error
    }
  }, [tab, dashboardLoading, dashboardError]);

  // KPI Card mejorada según especificación
  const EnhancedStatCard = ({ id, title, value, icon: Icon, trend, prefix = '', suffix = '', severity = 'info', thresholds = [] }) => {
    const getSeverityColor = (severity) => {
      const colors = {
        success: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-600', trend: 'text-green-600' },
        warning: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-600', trend: 'text-yellow-600' },
        danger: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-600', trend: 'text-red-600' },
        info: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-600', trend: 'text-blue-600' }
      };
      return colors[severity] || colors.info;
    };

    const severityColors = getSeverityColor(severity);

    return (
      <Card 
        className="bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group relative"
        style={{ 
          boxShadow: '0 8px 24px rgba(0,0,0,.08)', 
          borderRadius: '16px',
          height: '92px'
        }}
        onClick={() => {
          setSelectedKPIs(prev => 
            prev.includes(id) ? prev.filter(kpi => kpi !== id) : [...prev, id]
          );
        }}
      >
        <CardContent className="p-4 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {title}
              </p>
              <p className="text-xl font-semibold" style={{ 
                fontFamily: 'Montserrat, sans-serif', 
                color: '#0F172A'
              }}>
                {prefix}{typeof value === 'number' ? value.toLocaleString('es-ES') : value}{suffix}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${severityColors.bg} group-hover:scale-110 transition-transform`}>
              <Icon className={`w-4 h-4 ${severityColors.icon}`} />
            </div>
          </div>
          {trend && (
            <div className={`flex items-center text-xs font-medium ${severityColors.trend}`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend}
            </div>
          )}
          {realtimeConnected && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Widget de gráfico mejorado
  const EnhancedChartWidget = ({ id, title, type, data, height = 340, onDrilldown }) => (
    <Card 
      className="bg-white shadow-sm hover:shadow-md transition-all duration-200"
      style={{ 
        boxShadow: '0 8px 24px rgba(0,0,0,.08)', 
        borderRadius: '16px',
        height: `${height}px`
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md font-semibold" style={{ 
            fontFamily: 'Montserrat, sans-serif',
            color: '#0F172A'
          }}>
            {title}
          </CardTitle>
          {onDrilldown && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-6 h-6"
              onClick={onDrilldown}
            >
              <Eye className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="h-full">
        <div style={{ height: `${height - 80}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            {type === 'donut' && (
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completadas', value: data.completed, fill: '#10B981' },
                    { name: 'En Ruta', value: data.in_transit, fill: '#4472C4' },
                    { name: 'Retrasadas', value: data.delayed, fill: '#F59E0B' },
                    { name: 'Fallidas', value: data.failed, fill: '#DB2142' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {/* Cells for PieChart slices */}
                  {data && Object.entries(data).map((entry, index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                    border: 'none'
                  }}
                />
                <Legend />
              </PieChart>
            )}
            {type === 'line' && (
              <LineChart data={data.months?.map((month, i) => ({
                month,
                actual: data.actual?.[i],
                target: data.target?.[i]
              }))}>
                <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={{ stroke: '#6B7280' }}
                />
                <YAxis 
                  domain={[0.6, 0.8]}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={{ stroke: '#6B7280' }}
                  tickFormatter={(value) => `€${value.toFixed(2)}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                    border: 'none'
                  }}
                  formatter={(value) => [`€${value.toFixed(2)}`, '']}
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#4472C4" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Coste Real €/km"
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={{ r: 3 }}
                  name="Objetivo"
                />
                <Legend />
              </LineChart>
            )}
            {type === 'bar' && (
              <BarChart 
                layout="vertical" // Changed to vertical for horizontal bars
                data={data.routes?.map((route, i) => ({
                  route,
                  deliveries: data.deliveries?.[i]
                }))}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis 
                  type="category" 
                  dataKey="route" 
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  width={120} // Adjusted width for labels
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                    border: 'none'
                  }}
                />
                <Bar dataKey="deliveries" fill="#4472C4" radius={[0, 6, 6, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  // Dashboard mejorado según especificación
  const renderDashboard = () => {
    // Loading state
    if (dashboardLoading) {
      return (
        <div className="space-y-6">
          {/* Skeleton KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-[92px] animate-pulse bg-gray-100" style={{ borderRadius: '16px' }}>
                <CardContent className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Skeleton Widgets */}
          <div className="grid grid-cols-12 gap-6">
            <Card className="col-span-12 md:col-span-4 h-[340px] animate-pulse bg-gray-100" style={{ borderRadius: '16px' }}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-48 bg-gray-200 rounded"></div>
                </CardContent>
            </Card>
            <Card className="col-span-12 md:col-span-4 h-[340px] animate-pulse bg-gray-100" style={{ borderRadius: '16px' }}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-48 bg-gray-200 rounded"></div>
                </CardContent>
            </Card>
            <Card className="col-span-12 md:col-span-4 h-[340px] animate-pulse bg-gray-100" style={{ borderRadius: '16px' }}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-48 bg-gray-200 rounded"></div>
                </CardContent>
            </Card>
            <Card className="col-span-12 md:col-span-8 h-[360px] animate-pulse bg-gray-100" style={{ borderRadius: '16px' }}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </CardContent>
            </Card>
            <Card className="col-span-12 md:col-span-4 h-[360px] animate-pulse bg-gray-100" style={{ borderRadius: '16px' }}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </CardContent>
            </Card>
            <Card className="col-span-12 h-[360px] animate-pulse bg-gray-100" style={{ borderRadius: '16px' }}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Error state
    if (dashboardError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No pudimos cargar el dashboard
          </h3>
          <p className="text-gray-600 mb-4">
            Ocurrió un error al cargar los datos del dashboard
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="text-white"
            style={{ backgroundColor: '#4472C4' }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Filtros mejorados */}
        <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filtros:</span>
              </div>
              
              <Select defaultValue="last_30" onValueChange={(value) => setDashboardFilters(prev => ({...prev, date_range: value}))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Rango de fechas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_30">Últimos 30 días</SelectItem>
                  <SelectItem value="last_90">Últimos 90 días</SelectItem>
                  <SelectItem value="ytd">Este año</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setDashboardFilters(prev => ({...prev, region: value === 'all' ? [] : [value]}))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Región" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {dashboardData.meta.regions.map(region => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setDashboardFilters(prev => ({...prev, fleet: value === 'all' ? [] : [value]}))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Flota" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {dashboardData.meta.fleets.map(fleet => (
                    <SelectItem key={fleet.value} value={fleet.value}>
                      {fleet.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {realtimeConnected && (
                <div className="flex items-center gap-2 ml-auto">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">En tiempo real</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* KPIs Row mejorado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <EnhancedStatCard
            id="deliveries_today"
            title="Entregas Hoy"
            value={dashboardData.kpi.deliveries_today.value}
            icon={CheckCircle}
            trend={dashboardData.kpi.deliveries_today.delta}
            severity={dashboardData.kpi.deliveries_today.severity}
          />
          <EnhancedStatCard
            id="otd_percentage"
            title="OTD %"
            value={dashboardData.kpi.otd_percentage.value}
            suffix="%"
            icon={Target}
            trend={dashboardData.kpi.otd_percentage.delta}
            severity={dashboardData.kpi.otd_percentage.severity}
          />
          <EnhancedStatCard
            id="cost_per_km"
            title="Coste/km"
            value={dashboardData.kpi.cost_per_km.value}
            prefix="€"
            icon={Fuel}
            trend={dashboardData.kpi.cost_per_km.delta}
            severity={dashboardData.kpi.cost_per_km.severity}
          />
          <EnhancedStatCard
            id="active_routes"
            title="Rutas Activas"
            value={dashboardData.kpi.active_routes.value}
            icon={Route}
            trend={dashboardData.kpi.active_routes.delta}
            severity={dashboardData.kpi.active_routes.severity}
          />
          <EnhancedStatCard
            id="fleet_utilization"
            title="Utilización Flota"
            value={dashboardData.kpi.fleet_utilization.value}
            suffix="%"
            icon={Truck}
            trend={dashboardData.kpi.fleet_utilization.delta}
            severity={dashboardData.kpi.fleet_utilization.severity}
          />
          <EnhancedStatCard
            id="avg_delay"
            title="Retraso Promedio"
            value={dashboardData.kpi.avg_delay.value}
            suffix=" min"
            icon={Clock}
            trend={dashboardData.kpi.avg_delay.delta}
            severity={dashboardData.kpi.avg_delay.severity}
          />
        </div>

        {/* Widgets Grid mejorado */}
        <div className="grid grid-cols-12 gap-6">
          {/* Primera fila */}
          <div className="col-span-12 md:col-span-4">
            <EnhancedChartWidget
              id="wdg_delivery_status"
              title="Estado de Entregas"
              type="donut"
              data={dashboardData.charts.delivery_status}
              onDrilldown={() => toast.success("Navegando a Planificación")}
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <Card 
              className="bg-white shadow-sm"
              style={{ 
                boxShadow: '0 8px 24px rgba(0,0,0,.08)', 
                borderRadius: '16px',
                height: '340px'
              }}
            >
              <CardHeader>
                <CardTitle className="text-md font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Eficiencia de Rutas
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-full">
                <div className="relative w-32 h-32 mb-4">
                  <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-transparent"
                    style={{
                      backgroundImage: `conic-gradient(#4472C4 ${dashboardData.charts.route_efficiency.percentage * 3.6}deg, #E5E7EB 0deg)`
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {dashboardData.charts.route_efficiency.percentage}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Objetivo: 85%</p>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-12 md:col-span-4">
            <EnhancedChartWidget
              id="wdg_vehicle_status"
              title="Estado de Vehículos"
              type="donut"
              data={dashboardData.charts.vehicle_status}
            />
          </div>

          {/* Segunda fila */}
          <div className="col-span-12 md:col-span-8">
            <EnhancedChartWidget
              id="wdg_cost_evolution"
              title="Evolución Costos por km (12 meses)"
              type="line"
              data={dashboardData.charts.cost_evolution}
              height={360}
              onDrilldown={() => toast.success("Navegando a Costos")}
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <EnhancedChartWidget
              id="wdg_top_routes"
              title="Top 5 Rutas por Volumen"
              type="bar"
              data={dashboardData.charts.top_routes}
              height={360}
              onDrilldown={() => toast.success("Navegando a Seguimiento")}
            />
          </div>

          {/* Tercera fila - OTD Trend */}
          <div className="col-span-12">
            <Card 
              className="bg-white shadow-sm"
              style={{ 
                boxShadow: '0 8px 24px rgba(0,0,0,.08)', 
                borderRadius: '16px',
                height: '360px'
              }}
            >
              <CardHeader>
                <CardTitle className="text-md font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Tendencia OTD (últimas 8 semanas)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.charts.otd_trend.weeks.map((week, i) => ({
                      week,
                      percentage: dashboardData.charts.otd_trend.percentage[i],
                      total_deliveries: dashboardData.charts.otd_trend.total_deliveries[i]
                    }))}>
                      <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" />
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6B7280' }} />
                      <YAxis 
                        yAxisId="left"
                        domain={[80, 100]}
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                          border: 'none'
                        }}
                      />
                      <Bar yAxisId="right" dataKey="total_deliveries" fill="#94A3B8" name="Entregas Totales" />
                      <Line yAxisId="left" type="monotone" dataKey="percentage" stroke="#4472C4" strokeWidth={2} name="OTD %" />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderPlanificacion = () => (
    <div className="grid grid-cols-12 gap-6">
      {/* Mapa 50% - Ajustado z-index */}
      <div className="col-span-12 lg:col-span-6">
        <Card className="bg-white shadow-sm relative z-10" style={{ boxShadow: 'var(--shadow)', borderRadius: '16px', height: '640px' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[18px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Mapa de Rutas</CardTitle>
              <Button variant="outline" size="sm" className="text-xs bg-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <SlidersHorizontal className="w-3 h-3 mr-2"/>Capas
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[560px] relative z-10">
            <div className="h-full w-full bg-gray-100 rounded-lg relative z-10">
              <MapContainer center={[40.416775, -3.703790]} zoom={6} scrollWheelZoom={false} className="h-full w-full rounded-lg relative z-10">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {selectedRoute && selectedRoute.stops && selectedRoute.stops.map((stop, index) => (
                  <Marker key={stop.id} position={index === 0 ? [40.4168, -3.7038] : [40.4205, -3.6935]}>
                    <Popup>{stop.address} - {stop.type === 'pickup' ? 'Recogida' : 'Entrega'}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel 50% */}
      <div className="col-span-12 lg:col-span-6">
        <Card className="bg-white shadow-sm" style={{ boxShadow: 'var(--shadow)', borderRadius: '16px', height: '640px' }}>
          <CardHeader className="pb-2">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {['nueva', 'activas', 'historial', 'simulador'].map((tabName) => (
                <Button
                  key={tabName}
                  variant={planningTab === tabName ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPlanningTab(tabName)}
                  className={`flex-1 text-xs capitalize ${
                    planningTab === tabName
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  style={{
                    backgroundColor: planningTab === tabName ? '#4472C4' : 'transparent',
                    fontFamily: 'Montserrat, sans-serif',
                    paddingTop: '8px',
                    paddingBottom: '8px'
                  }}
                  role="tab"
                  aria-selected={planningTab === tabName}
                >
                  {tabName}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="h-[560px] overflow-y-auto" role="tabpanel">
            {planningTab === 'nueva' && (
              <PlanificacionForm onRouteGenerated={(route) => {
                setSelectedRoute(route);
                toast.success("Ruta generada y visualizada en el mapa");
              }} />
            )}
            {planningTab === 'activas' && <RutasActivas />}
            {planningTab === 'historial' && <HistorialRutas />}
            {planningTab === 'simulador' && <SimuladorRutas />}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderFlota = () => (
    <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="flex gap-2">
        {['vehiculos', 'conductores', 'asignacion', 'mantenimiento', 'consumibles'].map((tabName) => (
          <Button
            key={tabName}
            variant={fleetTab === tabName ? "default" : "outline"}
            size="sm"
            onClick={() => setFleetTab(tabName)}
            className="capitalize"
            style={fleetTab === tabName ? { backgroundColor: '#4472C4', color: 'white', fontFamily: 'Montserrat, sans-serif' } : { fontFamily: 'Montserrat, sans-serif' }}
          >
            {tabName}
          </Button>
        ))}
      </div>

      {fleetTab === 'vehiculos' && <FleetVehicles />}
      {fleetTab === 'conductores' && <FleetDrivers />}
      {fleetTab === 'asignacion' && <FleetAssignment />}
      {fleetTab === 'mantenimiento' && <FleetMaintenance />}
      {fleetTab === 'consumibles' && <FleetSupplies />}
    </div>
  );

  const renderSeguimiento = () => <SeguimientoVehiculos />;

  const renderPOD = () => (
    <div className="grid grid-cols-12 gap-6 min-h-[720px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Columna izquierda - Documentos */}
      <div className="col-span-12 lg:col-span-7 space-y-4">
        <PODDocumentsList />
      </div>

      {/* Columna derecha - Panel de detalles */}
      <div className="col-span-12 lg:col-span-5">
        <PODDetailsPanel />
      </div>
    </div>
  );

  const renderCostos = () => {
    const tabs = ['Costos', 'Desempeño', 'Rentabilidad'];

    return (
      <div className="space-y-6">
        {/* KPIs Row */}
        <CostosKPIs />

        {/* Filters */}
        <CostosFilters onFiltersChange={setCostosFilters} />

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map((tabName) => (
            <Button
              key={tabName}
              variant={costosActiveTab === tabName ? "default" : "ghost"}
              size="sm"
              onClick={() => setCostosActiveTab(tabName)}
              className={`px-4 py-2 text-sm ${
                costosActiveTab === tabName
                  ? 'text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{
                backgroundColor: costosActiveTab === tabName ? '#4472C4' : 'transparent',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              {tabName}
            </Button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="space-y-6">
          {/* Charts Row */}
          <CostosCharts activeTab={costosActiveTab} />
          
          {/* Table Row */}
          <CostosTable activeTab={costosActiveTab} />
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch(tab) {
      case 'planificación':
        return renderPlanificacion();
      case 'flota':
        return renderFlota();
      case 'seguimiento':
        return renderSeguimiento();
      case 'pod':
        return renderPOD();
      case 'costos':
        return renderCostos();
      default:
        return renderDashboard();
    }
  };

  return (
    <div>
      {/* HEADER DINÁMICO MEJORADO */}
      {tab === 'dashboard' && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Gestión de Transporte (TMS)
            </h1>
            <p className="text-gray-500 mt-1 text-[14px] font-medium">
              KPIs de entregas, rutas y flota — solo lectura
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-11 px-4 bg-white border-gray-300 hover:bg-gray-50 text-black"
              style={{ borderRadius: '12px', fontWeight: '600', fontSize: '14px' }}
              onClick={() => toast.success("Exportando dashboard a PDF")}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button
              variant="outline"
              className="h-11 px-4 bg-white border-gray-300 hover:bg-gray-50 text-black"
              style={{ borderRadius: '12px', fontWeight: '600', fontSize: '14px' }}
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>
      )}

      {tab === 'planificación' && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900">
              Planificación
            </h1>
            <p className="text-gray-500 mt-1 text-[14px] font-medium">Optimización de rutas y asignación inteligente</p>
          </div>
        </div>
      )}

      {tab === 'flota' && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900">
              Flota
            </h1>
            <p className="text-gray-500 mt-1 text-[14px] font-medium">Gestión integral de vehículos y conductores</p>
          </div>
        </div>
      )}

      {tab === 'seguimiento' && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900">
              Seguimiento
            </h1>
            <p className="text-gray-500 mt-1 text-[14px] font-medium">Tracking en tiempo real y alertas</p>
          </div>
        </div>
      )}

      {tab === 'pod' && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900">
              POD
            </h1>
            <p className="text-gray-500 mt-1 text-[14px] font-medium">Proof of Delivery y gestión documental</p>
          </div>
        </div>
      )}

      {tab === 'costos' && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900">
              Costos
            </h1>
            <p className="text-gray-500 mt-1 text-[14px] font-medium">Análisis de costos y rentabilidad</p>
          </div>
        </div>
      )}

      {renderContent()}
    </div>
  );
}
