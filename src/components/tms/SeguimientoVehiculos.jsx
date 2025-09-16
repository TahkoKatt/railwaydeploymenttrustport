
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import {
  Search, Filter, Truck, Eye, Locate, Clock, Gauge,
  Bell, MapPin, Phone, MessageCircle, Thermometer, Droplets,
  Fuel, AlertTriangle, CheckCircle, X
} from "lucide-react";
import { toast } from "sonner";

const mockVehicles = [
  {
    id: "V-001",
    plate: "1234ABC",
    driver: "María Ortega",
    routeName: "Ruta Madrid Centro",
    speed: 62,
    eta: "10:45",
    status: "moving",
    statusLabel: "En ruta",
    position: { lat: 40.4168, lng: -3.7038 },
    phone: "600123456",
    temperature: 5.2,
    humidity: 45,
    fuelLevel: 78
  },
  {
    id: "V-002",
    plate: "5678DEF",
    driver: "Luis Pérez",
    routeName: "Ruta BCN Norte",
    speed: 0,
    eta: "13:45",
    status: "stopped",
    statusLabel: "En parada",
    position: { lat: 41.3874, lng: 2.1686 },
    phone: "600234567",
    temperature: 6.1,
    humidity: 52,
    fuelLevel: 45
  },
  {
    id: "V-003",
    plate: "9876GHI",
    driver: "Ana García",
    routeName: "Ruta Valencia Sur",
    speed: 48,
    eta: "12:10",
    status: "incident",
    statusLabel: "Incidencia",
    position: { lat: 39.4699, lng: -0.3763 },
    phone: "600345678",
    temperature: 8.5,
    humidity: 38,
    fuelLevel: 25
  }
];

const mockAlerts = [
  { id: "AL-101", severity: "crítica", text: "Temperatura > 8°C", ts: "10:32", vehicleId: "V-003" },
  { id: "AL-102", severity: "media", text: "Desvío 5km", ts: "10:28", vehicleId: "V-002" },
  { id: "AL-103", severity: "baja", text: "Combustible bajo", ts: "10:15", vehicleId: "V-002" }
];

const mockDeliveries = [
  { order: "PED-001", address: "Calle Alcalá 100", window: "10:30–11:00", status: "En ruta", vehicleId: "V-001" },
  { order: "PED-002", address: "Av. Diagonal 450", window: "13:30–14:00", status: "En parada", vehicleId: "V-002" },
  { order: "PED-003", address: "C/ Valencia 123", window: "12:00–12:30", status: "Retrasado", vehicleId: "V-003" }
];

export default function SeguimientoVehiculos() {
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [alerts] = useState(mockAlerts);
  const [deliveries] = useState(mockDeliveries);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [activeTab, setActiveTab] = useState('tracking');
  const [filters, setFilters] = useState({
    search: '',
    vehicle: 'all',
    status: 'all'
  });
  const [showLayerToggles, setShowLayerToggles] = useState(false);
  const [layers, setLayers] = useState({
    traffic: true,
    weather: false,
    geofences: true
  });

  // Simular actualizaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(vehicle => ({
        ...vehicle,
        speed: vehicle.status === 'moving' ? Math.max(0, vehicle.speed + (Math.random() - 0.5) * 10) : 0,
        temperature: vehicle.temperature + (Math.random() - 0.5) * 0.5,
        humidity: Math.max(0, Math.min(100, vehicle.humidity + (Math.random() - 0.5) * 5))
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = (status) => {
    const configs = {
      moving: { bg: '#D1FAE5', text: '#00A878', label: 'En ruta' },
      stopped: { bg: '#FEF3C7', text: '#F59E0B', label: 'En parada' },
      idle: { bg: '#DBEAFE', text: '#4472C4', label: 'Detenido' },
      incident: { bg: '#FEE2E2', text: '#EF4444', label: 'Incidencia' }
    };
    return configs[status] || configs.moving;
  };

  const getSeverityConfig = (severity) => {
    const configs = {
      crítica: { bg: '#FEE2E2', text: '#EF4444', icon: AlertTriangle },
      media: { bg: '#FEF3C7', text: '#F59E0B', icon: Clock },
      baja: { bg: '#DBEAFE', text: '#4472C4', icon: CheckCircle }
    };
    return configs[severity] || configs.baja;
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const searchMatch = !filters.search ||
      vehicle.plate.toLowerCase().includes(filters.search.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(filters.search.toLowerCase()) ||
      vehicle.routeName.toLowerCase().includes(filters.search.toLowerCase());

    const vehicleMatch = filters.vehicle === 'all' || vehicle.id === filters.vehicle;
    const statusMatch = filters.status === 'all' || vehicle.status === filters.status;

    return searchMatch && vehicleMatch && statusMatch;
  });

  const handleVehicleFocus = (vehicle) => {
    setSelectedVehicle(vehicle);
    toast.success(`Enfocando vehículo ${vehicle.plate}`);
  };

  const handleVehicleDetails = (vehicle) => {
    toast.success(`Abriendo detalles de ${vehicle.plate}`);
  };

  const handleLayerToggle = (layerId) => {
    setLayers(prev => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  const alertsCount = alerts.length;
  const criticalAlerts = alerts.filter(alert => alert.severity === 'crítica').length;

  const renderTrackingContent = () => (
    <div className="space-y-3">
      {filteredVehicles.map((vehicle) => {
        const statusConfig = getStatusConfig(vehicle.status);
        return (
          <div key={vehicle.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">{vehicle.plate}</h4>
                <p className="text-sm text-gray-600">{vehicle.driver} · {vehicle.routeName}</p>
              </div>
              <Badge style={{ backgroundColor: statusConfig.bg, color: statusConfig.text }}>
                {statusConfig.label}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Gauge className="w-4 h-4" />
                <span>{Math.round(vehicle.speed)} km/h</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>ETA {vehicle.eta}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleVehicleFocus(vehicle)}
                className="flex items-center gap-1"
              >
                <Locate className="w-3 h-3" />
                Enfocar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleVehicleDetails(vehicle)}
                className="flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                Detalle
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderAlertsContent = () => (
    <div className="space-y-3">
      <div className="flex gap-2 mb-4">
        <Button size="sm" variant="outline">Todas</Button>
        <Button size="sm" variant="outline">Críticas</Button>
        <Button size="sm" variant="outline">Medias</Button>
      </div>

      {alerts.map((alert) => {
        const severityConfig = getSeverityConfig(alert.severity);
        const SeverityIcon = severityConfig.icon;

        return (
          <div key={alert.id} className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full" style={{ backgroundColor: severityConfig.bg }}>
                <SeverityIcon className="w-4 h-4" style={{ color: severityConfig.text }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <Badge style={{ backgroundColor: severityConfig.bg, color: severityConfig.text }}>
                    {alert.severity}
                  </Badge>
                  <span className="text-xs text-gray-500">{alert.ts}</span>
                </div>
                <p className="text-sm text-gray-900">{alert.text}</p>
                <p className="text-xs text-gray-500">Vehículo: {alert.vehicleId}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderDeliveriesContent = () => (
    <div className="space-y-2">
      {deliveries.map((delivery, index) => (
        <div key={index} className="p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h5 className="font-medium text-sm">{delivery.order}</h5>
              <p className="text-xs text-gray-600">{delivery.address}</p>
            </div>
            <Badge variant={delivery.status === 'Retrasado' ? 'destructive' : 'secondary'}>
              {delivery.status}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mb-2">Ventana: {delivery.window}</p>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="text-xs h-6">
              <Bell className="w-3 h-3 mr-1" />
              Notificar
            </Button>
            <Button size="sm" variant="outline" className="text-xs h-6">
              Añadir nota
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderConditionsContent = () => {
    const selectedVeh = selectedVehicle || vehicles[0];

    return (
      <div className="space-y-4">
        {selectedVeh && (
          <>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Temperatura</span>
                </div>
                <span className="text-lg font-semibold">{selectedVeh.temperature.toFixed(1)}°C</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${selectedVeh.temperature > 8 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(100, (selectedVeh.temperature / 10) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Rango: 2°C - 8°C</p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Humedad</span>
                </div>
                <span className="text-lg font-semibold">{Math.round(selectedVeh.humidity)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${selectedVeh.humidity}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Rango: 40% - 60%</p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">Combustible</span>
                </div>
                <span className="text-lg font-semibold">{selectedVeh.fuelLevel}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${selectedVeh.fuelLevel < 20 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${selectedVeh.fuelLevel}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Mínimo: 10%</p>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderCommsContent = () => (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <h5 className="font-medium text-sm mb-3">Respuestas rápidas</h5>
        <div className="space-y-2">
          {['¿ETA actualizada?', 'Incidencia registrada', 'Confirmar entrega'].map((msg, index) => (
            <Button key={index} size="sm" variant="outline" className="w-full text-xs justify-start">
              {msg}
            </Button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <h5 className="font-medium text-sm mb-3">Conversaciones activas</h5>
        <div className="space-y-2">
          <div className="text-xs p-2 bg-gray-50 rounded">
            <span className="font-medium">María Ortega:</span> Todo correcto, llegando en 15 min
          </div>
          <div className="text-xs p-2 bg-blue-50 rounded">
            <span className="font-medium">Operador:</span> Perfecto, cliente notificado
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Input placeholder="Escribir mensaje..." className="text-xs" />
          <Button size="sm" style={{ backgroundColor: '#4472C4' }} className="text-white">
            <MessageCircle className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tracking': return renderTrackingContent();
      case 'alerts': return renderAlertsContent();
      case 'deliveries': return renderDeliveriesContent();
      case 'conditions': return renderConditionsContent();
      case 'comms': return renderCommsContent();
      default: return renderTrackingContent();
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Mapa - Ahora ocupa 7/12 en lugar de 8/12 */}
      <div className="col-span-12 lg:col-span-7">
        <Card className="bg-white shadow-sm h-full" style={{ boxShadow: 'var(--shadow)', borderRadius: 'var(--radius)' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-[18px] font-semibold">
              Mapa de Seguimiento en Tiempo Real
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-white"
                onClick={() => setShowLayerToggles(!showLayerToggles)}
              >
                <Filter className="w-3 h-3 mr-2" />
                Capas
              </Button>
            </div>
          </CardHeader>
          <CardContent style={{ height: '640px' }}>
            <div className="h-full w-full bg-gray-100 rounded-lg relative">
              <MapContainer center={[40.416775, -3.703790]} zoom={6} scrollWheelZoom={false} className="h-full w-full rounded-lg">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredVehicles.map(vehicle => (
                  <Marker key={vehicle.id} position={[vehicle.position.lat, vehicle.position.lng]}>
                    <Popup>
                      <div className="p-2">
                        <p className="font-semibold">{vehicle.plate}</p>
                        <p className="text-sm text-gray-600">{vehicle.driver}</p>
                        <p className="text-sm">{vehicle.routeName}</p>
                        <Badge
                          className="mt-1"
                          style={{
                            backgroundColor: getStatusConfig(vehicle.status).bg,
                            color: getStatusConfig(vehicle.status).text
                          }}
                        >
                          {vehicle.statusLabel}
                        </Badge>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {showLayerToggles && (
                <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md z-[1000] space-y-2">
                  <p className="font-semibold text-sm mb-2">Capas del mapa</p>
                  {Object.entries(layers).map(([layerId, enabled]) => (
                    <div key={layerId} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={layerId}
                        checked={enabled}
                        onChange={() => handleLayerToggle(layerId)}
                        className="rounded"
                      />
                      <label htmlFor={layerId} className="text-sm capitalize">
                        {layerId === 'traffic' ? 'Tráfico' :
                         layerId === 'weather' ? 'Clima' :
                         'Geocercas'}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel Lateral - Ahora ocupa 5/12 en lugar de 4/12 */}
      <div className="col-span-12 lg:col-span-5">
        <Card className="bg-white shadow-sm h-full" style={{ boxShadow: 'var(--shadow)', borderRadius: 'var(--radius)' }}>
          <CardHeader className="pb-2">
            {/* Filtros mejorados con más espacio */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar ruta, vehículo o conductor..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>

              <div className="flex gap-3">
                <Select value={filters.vehicle} onValueChange={(value) => setFilters({...filters, vehicle: value})}>
                  <SelectTrigger className="flex-1 bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Todos los vehículos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los vehículos</SelectItem>
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.plate}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                  <SelectTrigger className="flex-1 bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="moving">En ruta</SelectItem>
                    <SelectItem value="stopped">En parada</SelectItem>
                    <SelectItem value="idle">Detenido</SelectItem>
                    <SelectItem value="incident">Incidencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pestañas con más espacio */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {[
                { id: 'tracking', label: 'Seguimiento' },
                { id: 'alerts', label: 'Alertas', count: alertsCount },
                { id: 'deliveries', label: 'Entregas' },
                { id: 'conditions', label: 'Condiciones' },
                { id: 'comms', label: 'Chat' }
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 text-xs relative ${
                    activeTab === tab.id
                      ? ''
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.id ? '#4472C4' : 'transparent',
                    color: activeTab === tab.id ? 'white' : '', // Explicitly set color for active tab
                    paddingTop: '8px',
                    paddingBottom: '8px'
                  }}
                >
                  {tab.label}
                  {tab.count && tab.count > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 p-0 flex items-center justify-center rounded-full"
                    >
                      {tab.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="h-[580px] overflow-y-auto">
            {renderTabContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
