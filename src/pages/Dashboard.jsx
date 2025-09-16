
import React, { useState } from "react";
import {
  Users, Package, ShoppingCart, Warehouse, Truck,
  Plane, DollarSign, TrendingUp, AlertTriangle,
  Activity, Calendar, CheckCircle, Clock, Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DualWriteHealthDashboard from "@/components/observability/DualWriteHealthDashboard";

const DashboardKPI = ({ title, value, icon: Icon, bgColor, trend, onClick }) => {
  // Mapear colores de icono por KPI como en WMS
  const getKpiIconColor = (iconBgColor) => {
    const colorMap = {
      'bg-green-500': '#00A878',   // green
      'bg-blue-500': '#4472C4',    // blue  
      'bg-purple-500': '#6C7DF7',  // violet
      'bg-red-500': '#DB2142',     // red
      'bg-teal-500': '#20B2AA',    // teal
      'bg-orange-500': '#FFA500'   // orange
    };
    return colorMap[iconBgColor] || '#6B7280';
  };

  const iconColor = getKpiIconColor(bgColor);

  return (
    <Card
      className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
      style={{ boxShadow: 'var(--shadow)', borderRadius: 'var(--radius)' }}
    >
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-[12px] font-medium text-gray-600 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {title}
            </p>
            <CardTitle className="text-[22px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif', color: '#1F2937' }}>
              {value}
            </CardTitle>
            {trend && (
              <div className="flex items-center mt-2 text-[12px] font-medium text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                {trend}
              </div>
            )}
          </div>
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${iconColor}20` }}>
            <Icon className="w-5 h-5" style={{ color: iconColor }} />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

const ActivityCard = ({ title, description, module, time, status }) => (
  <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
    <div className={`w-3 h-3 rounded-full ${
      status === 'success' ? 'bg-green-500' :
      status === 'warning' ? 'bg-yellow-500' :
      status === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`} />
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="font-medium text-[14px]">{title}</span>
        <Badge variant="outline" className="text-[12px]">{module}</Badge>
      </div>
      <p className="text-[14px] font-normal text-gray-600 mt-1">{description}</p>
    </div>
    <div className="text-[12px] text-gray-400">{time}</div>
  </div>
);

const AlertCard = ({ type, title, description, module, count }) => {
  const alertStyles = {
    critical: { border: 'border-red-500', bg: 'bg-red-50', icon: 'text-red-500', badge: 'bg-red-500' },
    warning: { border: 'border-yellow-500', bg: 'bg-yellow-50', icon: 'text-yellow-500', badge: 'bg-yellow-500' },
    info: { border: 'border-violet-500', bg: 'bg-violet-50', icon: 'text-violet-500', badge: 'bg-violet-500' },
    success: { border: 'border-green-500', bg: 'bg-green-50', icon: 'text-green-500', badge: 'bg-green-500' }
  };
  const styles = alertStyles[type] || alertStyles.info;

  return (
  <div className={`p-4 rounded-lg border-l-4 ${styles.border} ${styles.bg}`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${styles.icon}`} />
          <span className="font-semibold text-[14px]">{title}</span>
          <Badge variant="outline" className="text-[12px]">{module}</Badge>
        </div>
        <p className="text-[14px] font-normal text-gray-600 mt-1">{description}</p>
      </div>
      {count && (
        <Badge className={`${styles.badge} text-white`}>
          {count}
        </Badge>
      )}
    </div>
    <div className="flex gap-2 mt-3">
        <Button variant="outline" size="sm" className="text-xs">Abrir</Button>
        <Button variant="ghost" size="sm" className="text-xs">Silenciar</Button>
    </div>
  </div>
)};

const SRM_ROUTE = '/SRM';
const currentPersona = new URLSearchParams(window.location.search).get('persona')
  || (typeof localStorage !== 'undefined' && localStorage.getItem('persona'))
  || 'comerciante';
const gotoSRMDashboard = () => window.location.assign(`${SRM_ROUTE}?tab=dashboard&persona=${currentPersona}`);

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const kpiData = [
    {
      title: "Ventas Hoy",
      value: "€45,280",
      icon: DollarSign,
      bgColor: "bg-green-500",
      trend: "12% vs ayer",
      link: createPageUrl("CRM")
    },
    {
      title: "Pedidos Activos",
      value: "127",
      icon: ShoppingCart,
      bgColor: "bg-blue-500",
      trend: "8 nuevos",
      link: createPageUrl("Compras")
    },
    {
      title: "Envíos en Ruta",
      value: "23",
      icon: Truck,
      bgColor: "bg-purple-500",
      trend: "5 entregados",
      link: createPageUrl("TMS")
    },
    {
      title: "Stock Crítico",
      value: "15",
      icon: Warehouse,
      bgColor: "bg-red-500",
      trend: "3 resueltos",
      link: createPageUrl("WMS")
    },
    {
      title: "Proveedores Activos",
      value: "89",
      icon: Package,
      bgColor: "bg-teal-500",
      trend: "2 nuevos",
      link: `${SRM_ROUTE}?tab=dashboard&persona=${currentPersona}`
    },
    {
      title: "Expedientes COMEX",
      value: "12",
      icon: Plane,
      bgColor: "bg-orange-500",
      trend: "4 en aduana",
      link: createPageUrl("COMEX")
    }
  ];

  const recentActivity = [
    {
      title: "Nueva orden de compra creada",
      description: "PO-2024-001 por €12,450 - Proveedor: TechSupply SL",
      module: "Compras",
      time: "hace 5 min",
      status: "success"
    },
    {
      title: "Entrega retrasada detectada",
      description: "Envío SH-789 tiene 2h de retraso - Cliente: Logística Madrid",
      module: "TMS",
      time: "hace 15 min",
      status: "warning"
    },
    {
      title: "Recepción completada",
      description: "GR-456 registrada - 250 unidades en almacén central",
      module: "WMS",
      time: "hace 30 min",
      status: "success"
    },
    {
      title: "Cotización enviada",
      description: "QT-2024-012 enviada a Distribuciones del Sur - €8,900",
      module: "CRM",
      time: "hace 1h",
      status: "info"
    },
    {
      title: "Documento aduanero validado",
      description: "Expediente EX-2024-034 - BL confirmado para embarque FCL",
      module: "COMEX",
      time: "hace 2h",
      status: "success"
    }
  ];

  const alerts = [
    {
      type: "critical",
      title: "Facturas vencidas",
      description: "3 facturas de proveedores han vencido y requieren pago inmediato",
      module: "Finanzas",
      count: 3
    },
    {
      type: "warning",
      title: "Documentos por expirar",
      description: "5 certificados de proveedores expiran en los próximos 7 días",
      module: "SRM",
      count: 5
    },
    {
      type: "info",
      title: "Inventario bajo mínimos",
      description: "15 SKUs están por debajo del stock mínimo configurado",
      module: "WMS",
      count: 15
    },
    {
      type: "warning",
      title: "Retrasos en entregas",
      description: "4 envíos programados presentan retrasos superiores a 2 horas",
      module: "TMS",
      count: 4
    },
    {
      type: "success",
      title: "Conciliación Completada",
      description: "Conciliación bancaria del mes de Enero completada con éxito.",
      module: "Finanzas",
      count: 1
    }
  ];

  const quickLinks = [
    {
      title: "SRM",
      description: "Gestión de Proveedores",
      icon: "🤝",
      color: "#FF6B6B",
      onClick: gotoSRMDashboard
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900">
            Panel de Control
          </h1>
          <p className="text-gray-500 mt-1 text-[14px] font-medium">Visión general de tu operación empresarial</p>
        </div>
        <div className="flex gap-2">
          {['today', 'week', 'month'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              onClick={() => setSelectedPeriod(period)}
              className="capitalize"
              style={selectedPeriod === period ? { backgroundColor: '#4472C4', borderColor: '#4472C4', color: 'white' } : { color: '#4472C4', borderColor: '#4472C4' }}
            >
              {period === 'today' ? 'Hoy' : period === 'week' ? 'Semana' : 'Mes'}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {kpiData.map((kpi, index) => (
          <Link key={index} to={kpi.link}>
            <DashboardKPI {...kpi} />
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Activity Feed & Canary Health */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white shadow-md" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader className="border-b" style={{ borderColor: "#D9D9D9" }}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[18px] font-semibold">
                  <Activity className="w-5 h-5" />
                  Actividad Reciente
                </CardTitle>
                <Button variant="outline" size="sm">Ver todo</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                {recentActivity.map((activity, index) => (
                  <ActivityCard key={index} {...activity} />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <DualWriteHealthDashboard />
        </div>

        {/* Alerts and Quick Actions */}
        <div className="space-y-6">

          {/* Alerts */}
          <Card className="bg-white shadow-md" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader className="border-b" style={{ borderColor: "#D9D9D9" }}>
              <CardTitle className="flex items-center gap-2 text-[18px] font-semibold">
                <AlertTriangle className="w-5 h-5" />
                Centro de Alertas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {alerts.map((alert, index) => (
                  <AlertCard key={index} {...alert} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white shadow-md" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader className="border-b" style={{ borderColor: "#D9D9D9" }}>
              <CardTitle className="text-[18px] font-semibold">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <Link to={createPageUrl("Compras")}>
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span className="text-xs">Nueva Compra</span>
                  </Button>
                </Link>
                <Link to={createPageUrl("TMS")}>
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Truck className="w-5 h-5" />
                    <span className="text-xs">Nuevo Envío</span>
                  </Button>
                </Link>
                <Link to={createPageUrl("CRM")}>
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Users className="w-5 h-5" />
                    <span className="text-xs">Nuevo Lead</span>
                  </Button>
                </Link>
                <Link to={createPageUrl("WMS")}>
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Package className="w-5 h-5" />
                    <span className="text-xs">Recepción</span>
                  </Button>
                </Link>
              </div>
              {/* Quick Links are not rendered yet, add them here if intended */}
              {/* Example of how to integrate if quickLinks were meant for this section: */}
              {/* <div className="grid grid-cols-2 gap-3 mt-3">
                {quickLinks.map((link, index) => (
                  <Button key={index} variant="outline" className="w-full h-20 flex flex-col gap-2" onClick={link.onClick}>
                    <span style={{ fontSize: '24px' }}>{link.icon}</span>
                    <span className="text-xs">{link.title}</span>
                  </Button>
                ))}
              </div> */}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
