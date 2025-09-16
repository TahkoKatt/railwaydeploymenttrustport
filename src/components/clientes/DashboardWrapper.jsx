import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, AlertTriangle } from 'lucide-react';

// Reutilización del Dashboard de CRM existente con tokens Trustport
const DashboardWrapper = () => {
  console.log('[CLIENTES-OWNER] Rendering DashboardWrapper');

  // Datos de ejemplo (en implementación real vendría de clientesKpis)
  const kpis = {
    totalClientes: 1247,
    leadsMes: 89,
    conversionRate: 18.5,
    pipelineValue: 890000,
    activeTasks: 23,
    overdueInvoices: 12
  };

  const trendData = [
    { mes: 'Ene', clientes: 45, leads: 78, conversiones: 12 },
    { mes: 'Feb', clientes: 52, leads: 85, conversiones: 18 },
    { mes: 'Mar', clientes: 48, leads: 92, conversiones: 15 },
    { mes: 'Abr', clientes: 61, leads: 89, conversiones: 22 },
    { mes: 'May', clientes: 55, leads: 94, conversiones: 19 }
  ];

  return (
    <div className="space-y-6">
      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Clientes</CardTitle>
            <Users className="h-4 w-4" style={{ color: '#4472C4' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalClientes.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Leads Este Mes</CardTitle>
            <Activity className="h-4 w-4" style={{ color: '#4472C4' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.leadsMes}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tasa Conversión</CardTitle>
            <TrendingUp className="h-4 w-4" style={{ color: '#4472C4' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.conversionRate}%</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2.1pp mejor
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4" style={{ color: '#4472C4' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{(kpis.pipelineValue / 1000).toFixed(0)}K</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +15% vs trimestre anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle>Tendencia de Adquisición</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="clientes" 
                  stroke="#4472C4" 
                  strokeWidth={3} 
                  name="Nuevos Clientes"
                />
                <Line 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#DB2142" 
                  strokeWidth={2}
                  name="Leads" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle>Conversiones Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="conversiones" 
                  fill="#4472C4" 
                  radius={[4, 4, 0, 0]}
                  name="Conversiones"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Tasks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Tareas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Actividades vencidas</span>
                <span className="font-semibold text-red-600">{kpis.activeTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Facturas vencidas</span>
                <span className="font-semibold text-red-600">{kpis.overdueInvoices}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Leads sin contactar (48h)</span>
                <span className="font-semibold text-amber-600">7</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button 
                className="p-3 text-left rounded-lg border hover:border-[#4472C4] hover:bg-[#4472C4]/5 transition-colors"
                style={{ borderRadius: '12px' }}
              >
                <div className="font-medium">Nuevo Cliente</div>
                <div className="text-xs text-gray-500">Crear cuenta</div>
              </button>
              <button 
                className="p-3 text-left rounded-lg border hover:border-[#4472C4] hover:bg-[#4472C4]/5 transition-colors"
                style={{ borderRadius: '12px' }}
              >
                <div className="font-medium">Enviar NPS</div>
                <div className="text-xs text-gray-500">Campaña mensual</div>
              </button>
              <button 
                className="p-3 text-left rounded-lg border hover:border-[#4472C4] hover:bg-[#4472C4]/5 transition-colors"
                style={{ borderRadius: '12px' }}
              >
                <div className="font-medium">Reporte</div>
                <div className="text-xs text-gray-500">Exportar datos</div>
              </button>
              <button 
                className="p-3 text-left rounded-lg border hover:border-[#4472C4] hover:bg-[#4472C4]/5 transition-colors"
                style={{ borderRadius: '12px' }}
              >
                <div className="font-medium">Importar</div>
                <div className="text-xs text-gray-500">CSV/Excel</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardWrapper;