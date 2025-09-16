
import React, { useState, useEffect } from "react";
import {
  DollarSign, TrendingUp, AlertTriangle, CheckCircle, Clock, Calculator,
  FileText, Users, ShoppingCart, Percent, ArrowRightLeft, CreditCard,
  Target, Activity, Zap, Play, Settings, RefreshCw, BarChart3, PieChart,
  LineChart, AlertCircle, TrendingDown, Bell, ArrowUpRight, ArrowDownRight,
  Calendar, Plus, Eye, MessageSquare, Link as LinkIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart as RechartsLineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const KPICard = ({ title, value, icon: Icon, color, trend, format, unit }) => {
  const formatValue = (val) => {
    if (format === 'currency') return `${unit}${val.toLocaleString('es-ES')}`;
    if (format === 'percent') return `${(val * 100).toFixed(1)}%`;
    if (format === 'number') return `${val} ${unit || ''}`;
    return val.toString();
  };

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '16px' }}>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[12px] font-medium" style={{ color: '#6B7280', fontFamily: 'Montserrat, sans-serif' }}>
              {title}
            </p>
            <p className="text-[22px] font-semibold mt-1" style={{ fontFamily: 'Montserrat, sans-serif', color: '#1F2937' }}>
              {formatValue(value)}
            </p>
          </div>
          <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
            <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center mt-2 text-[12px] font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {trend >= 0 ? '+' : ''}{trend}% vs anterior
          </div>
        )}
      </CardHeader>
    </Card>
  );
};

const AlertItem = ({ severidad, mensaje, origen, fecha }) => {
  const severityConfig = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: AlertTriangle, color: 'text-red-600' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: AlertCircle, color: 'text-yellow-600' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: Bell, color: 'text-blue-600' }
  };

  const config = severityConfig[severidad] || severityConfig.info;
  const IconComponent = config.icon;

  return (
    <div className={`flex items-start gap-3 p-3 border rounded-lg ${config.bg} ${config.border}`}>
      <IconComponent className={`w-4 h-4 mt-1 flex-shrink-0 ${config.color}`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${config.text}`}>{mensaje}</p>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">{origen}</p>
          <p className="text-xs text-gray-500">{new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
    </div>
  );
};

export default function Finanzas() {
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get('tab') || 'dashboard';

  // Estados para simulador
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorParams, setSimulatorParams] = useState({
    salesShockPct: 0,
    dsoDeltaDays: 0,
    dpoDeltaDays: 0,
    comexDelayDays: 0
  });
  const [simulatingCash, setSimulatingCash] = useState(false);

  // Estados para acciones IA
  const [executingAction, setExecutingAction] = useState(null);

  // Estados para Facturas
  const [activeChip, setActiveChip] = useState('all');
  const [showIntakeAP, setShowIntakeAP] = useState(false);
  const [showEmitirAR, setShowEmitirAR] = useState(false);
  const [show3WMSimulator, setShow3WMSimulator] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showVerModal, setShowVerModal] = useState(false);
  const [executingBulk3WM, setExecutingBulk3WM] = useState(false);

  // Estados para Pagos
  const [activeView, setActiveView] = useState('queue');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCreateBatchModal, setShowCreateBatchModal] = useState(false);
  const [showOptimizeDPOSimulator, setShowOptimizeDPOSimulator] = useState(false);
  const [showDiscountSimulator, setShowDiscountSimulator] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [executingPaymentAction, setExecutingPaymentAction] = useState(null); // Dedicated for payment-related actions

  // Estados para Cobros - NUEVOS
  const [cobrosView, setCobrosView] = useState('bandeja');
  const [showRegistrarCobro, setShowRegistrarCobro] = useState(false);
  const [showEnviarRecordatorio, setShowEnviarRecordatorio] = useState(false);
  const [showCrearPromesa, setShowCrearPromesa] = useState(false);
  const [showReprogramarPromesa, setShowReprogramarPromesa] = useState(false);
  const [showGenerarEnlace, setShowGenerarEnlace] = useState(false);
  const [showEscalar, setShowEscalar] = useState(false);
  const [showWriteoff, setShowWriteoff] = useState(false);
  const [showPriorizarDunning, setShowPriorizarDunning] = useState(false);
  const [showPlanDePago, setShowPlanDePago] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);

  // Estados para Conciliación - NUEVOS
  const [conciliacionView, setConciliacionView] = useState('MISMATCH');
  const [showExplicarIA, setShowExplicarIA] = useState(false);
  const [showAjustar, setShowAjustar] = useState(false);
  const [showAprobarExcepcion, setShowAprobarExcepcion] = useState(false);
  const [showDisputar, setShowDisputar] = useState(false);
  const [showBloquear, setShowBloquear] = useState(false);
  const [showDesbloquear, setShowDesbloquear] = useState(false);
  const [showToleranciasSim, setShowToleranciasSim] = useState(false);
  const [showPrecioSim, setShowPrecioSim] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Estados para Presupuestos - NUEVOS
  const [presupuestosView, setPresupuestosView] = useState('list');
  const [showNewBudget, setShowNewBudget] = useState(false);
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [showEditarLineas, setShowEditarLineas] = useState(false);
  const [showComentar, setShowComentar] = useState(false);
  const [showNotificarOwner, setShowNotificarOwner] = useState(false);
  const [showAprobar, setShowAprobar] = useState(false);
  const [showCongelar, setShowCongelar] = useState(false);
  const [showReforecast, setShowReforecast] = useState(false);
  const [showTransferir, setShowTransferir] = useState(false);
  const [showArchivar, setShowArchivar] = useState(false);
  const [showWhatIfSim, setShowWhatIfSim] = useState(false);
  const [showHeadcountSim, setShowHeadcountSim] = useState(false);
  const [showFuelShockSim, setShowFuelShockSim] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  // Estados para Analytics - NUEVOS
  const [analyticsView, setAnalyticsView] = useState('acc_pnl');
  const [analyticsFilters, setAnalyticsFilters] = useState({
    period_from: '2025-07-01',
    period_to: '2025-09-30',
    currency: 'EUR',
    customerId: '',
    fileId: '',
    routeId: ''
  });
  const [showPrecioMargenSim, setShowPrecioMargenSim] = useState(false);
  const [showDSODPOSim, setShowDSODPOSim] = useState(false);
  const [showBCGThresholdsSim, setShowBCGThresholdsSim] = useState(false);

  // Seeds data según JSON spec
  const kpisData = {
    cash_now: 125000.0,
    cash_30: 118500.0,
    dso: 34.5,
    dpo: 48.2,
    match_ok: 0.857,
    overdue_ar: 21450.0,
    overdue_ap: 16780.0
  };

  const alertsData = [
    { severidad: "critical", mensaje: "Riesgo de caja menor a 30 días", origen: "IA-Forecast", fecha: "2025-09-01T08:00:00Z" },
    { severidad: "warning", mensaje: "3WM Mismatch 2.5% en SKU-002", origen: "IA-3WM", fecha: "2025-09-01T07:20:00Z" },
    { severidad: "info", mensaje: "Credit Gate aplicado a 3 cuentas", origen: "IA-CreditGate", fecha: "2025-09-01T06:45:00Z" }
  ];

  const cashflowData = [
    { fecha: '01/09', real: 125000, optimista: 130000, conservador: 120000 },
    { fecha: '05/09', real: 119200, optimista: 125000, conservador: 115000 },
    { fecha: '10/09', real: 118500, optimista: 123000, conservador: 112000 },
    { fecha: '15/09', real: 121000, optimista: 128000, conservador: 115000 },
    { fecha: '20/09', real: 124500, optimista: 132000, conservador: 118000 },
    { fecha: '25/09', real: 127000, optimista: 135000, conservador: 121000 },
    { fecha: '30/09', real: 130000, optimista: 138000, conservador: 124000 }
  ];

  const dsoDpoData = [
    { segmento: 'Alimentación', dso: 28.5, dpo: 45.2 },
    { segmento: 'Textil', dso: 42.1, dpo: 52.8 },
    { segmento: 'Automoción', dso: 38.9, dpo: 48.1 },
    { segmento: 'Electrónicos', dso: 31.2, dpo: 44.5 }
  ];

  const agingData = [
    { name: '0-15 días', value: 45.2, fill: '#00A878' },
    { name: '16-30 días', value: 28.8, fill: '#6C7DF7' },
    { name: '31-60 días', value: 15.3, fill: '#FFC857' },
    { name: '61-90 días', value: 7.1, fill: '#FF8A33' },
    { name: '90+ días', value: 3.6, fill: '#DB2142' }
  ];

  // Acciones IA con ejecutores
  const executeIAAction = async (actionId) => {
    setExecutingAction(actionId);

    // Simular tiempo de ejecución
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1500));

    switch(actionId) {
      case 'run_3wm_now':
        toast.success("3WM ejecutado - 47 facturas conciliadas automáticamente");
        break;
      case 'start_dunning_top10':
        toast.success("Dunning iniciado - Recordatorios enviados a 10 cuentas principales");
        break;
      case 'optimize_dpo':
        toast.success("DPO optimizado - 3 pagos reprogramados para mejorar cashflow");
        break;
      case 'apply_credit_gate':
        toast.success("Credit Gate aplicado - 2 cuentas bloqueadas por riesgo");
        break;
      default:
        toast.info(`Acción ${actionId} ejecutada.`);
    }

    setExecutingAction(null);
  };

  const runSimulation = async () => {
    setSimulatingCash(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSimulatingCash(false);
    setShowSimulator(false);
    toast.success("Simulación completada - Gráfico actualizado con nuevo escenario");
  };

  const renderDashboard = () => (
    <div className="space-y-6" style={{ backgroundColor: '#F1F0EC', fontFamily: 'Montserrat, sans-serif' }}>
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <KPICard
          title="Cash disponible"
          value={kpisData.cash_now}
          format="currency"
          unit="€"
          icon={DollarSign}
          color="bg-green-500"
        />
        <KPICard
          title="Cash 30 días"
          value={kpisData.cash_30}
          format="currency"
          unit="€"
          icon={Target}
          color="bg-blue-500"
        />
        <KPICard
          title="DSO (días)"
          value={kpisData.dso}
          format="number"
          unit="días"
          icon={Clock}
          color="bg-yellow-500"
          trend={-1.2}
        />
        <KPICard
          title="DPO (días)"
          value={kpisData.dpo}
          format="number"
          unit="días"
          icon={Clock}
          color="bg-yellow-500"
          trend={2.5}
        />
        <KPICard
          title="Hit Rate 3WM"
          value={kpisData.match_ok}
          format="percent"
          icon={CheckCircle}
          color="bg-green-500"
          trend={3.1}
        />
        <KPICard
          title="AR vencido"
          value={kpisData.overdue_ar}
          format="currency"
          unit="€"
          icon={AlertTriangle}
          color="bg-red-500"
        />
        <KPICard
          title="AP vencido"
          value={kpisData.overdue_ap}
          format="currency"
          unit="€"
          icon={AlertTriangle}
          color="bg-red-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cashflow Projection */}
        <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '16px' }}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-[18px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Proyección de Caja (90 días)
              </CardTitle>
              <Dialog open={showSimulator} onOpenChange={setShowSimulator}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Calculator className="w-3 h-3 mr-2"/>
                    Simular
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Simulador de Caja (What-If)</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <p className="text-sm text-gray-600">Ajusta ventas, plazos y retrasos logísticos para ver impacto en cash.</p>

                    <div className="space-y-4">
                      <div>
                        <Label>Shock ventas (%): {simulatorParams.salesShockPct}%</Label>
                        <Slider
                          value={[simulatorParams.salesShockPct]}
                          onValueChange={(value) => setSimulatorParams({...simulatorParams, salesShockPct: value[0]})}
                          max={30}
                          min={-30}
                          step={5}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Variación DSO (días): {simulatorParams.dsoDeltaDays}</Label>
                        <Slider
                          value={[simulatorParams.dsoDeltaDays]}
                          onValueChange={(value) => setSimulatorParams({...simulatorParams, dsoDeltaDays: value[0]})}
                          max={20}
                          min={-10}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Variación DPO (días): {simulatorParams.dpoDeltaDays}</Label>
                        <Slider
                          value={[simulatorParams.dpoDeltaDays]}
                          onValueChange={(value) => setSimulatorParams({...simulatorParams, dpoDeltaDays: value[0]})}
                          max={20}
                          min={-10}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Retraso COMEX (días): {simulatorParams.comexDelayDays}</Label>
                        <Slider
                          value={[simulatorParams.comexDelayDays]}
                          onValueChange={(value) => setSimulatorParams({...simulatorParams, comexDelayDays: value[0]})}
                          max={20}
                          min={0}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setShowSimulator(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={runSimulation}
                        disabled={simulatingCash}
                        style={{ backgroundColor: '#4472C4', color: '#FFFFFF' }}
                        className="hover:bg-[#3461B3]"
                      >
                        {simulatingCash ? 'Simulando...' : 'Simular'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={cashflowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="fecha" />
                  <YAxis tickFormatter={(value) => `€${(value/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => [`€${value.toLocaleString('es-ES')}`, '']} />
                  <Line type="monotone" dataKey="real" stroke="#4472C4" strokeWidth={3} name="Real" />
                  <Line type="monotone" dataKey="optimista" stroke="#00A878" strokeWidth={2} strokeDasharray="5 5" name="Optimista" />
                  <Line type="monotone" dataKey="conservador" stroke="#DB2142" strokeWidth={2} strokeDasharray="5 5" name="Conservador" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* DSO/DPO por segmento */}
        <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle className="text-[18px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              DSO/DPO por segmento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dsoDpoData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="segmento" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="dso" fill="#4472C4" name="DSO" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="dpo" fill="#00A878" name="DPO" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lower section with panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aging Donut */}
        <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle className="text-[18px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Aging AR/AP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Tooltip />
                  <RechartsPieChart data={agingData}>
                    {agingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </RechartsPieChart>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Alertas Panel */}
        <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle className="text-[18px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertsData.map((alert, index) => (
              <AlertItem key={index} {...alert} />
            ))}
          </CardContent>
        </Card>

        {/* Acciones IA Panel */}
        <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle className="text-[18px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Acciones IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => executeIAAction('run_3wm_now')}
              disabled={executingAction === 'run_3wm_now'}
              className="w-full justify-start"
              style={{ backgroundColor: '#4472C4', color: '#FFFFFF' }}
            >
              <Zap className="w-4 h-4 mr-3" />
              {executingAction === 'run_3wm_now' ? 'Ejecutando...' : 'Ejecutar 3WM ahora'}
            </Button>

            <Button
              onClick={() => executeIAAction('start_dunning_top10')}
              disabled={executingAction === 'start_dunning_top10'}
              className="w-full justify-start"
              style={{ backgroundColor: '#4472C4', color: '#FFFFFF' }}
            >
              <Bell className="w-4 h-4 mr-3" />
              {executingAction === 'start_dunning_top10' ? 'Iniciando...' : 'Dunning Top-10'}
            </Button>

            <Button
              onClick={() => executeIAAction('optimize_dpo')}
              disabled={executingAction === 'optimize_dpo'}
              className="w-full justify-start"
              style={{ backgroundColor: '#4472C4', color: '#FFFFFF' }}
            >
              <TrendingUp className="w-4 h-4 mr-3" />
              {executingAction === 'optimize_dpo' ? 'Optimizando...' : 'Optimizar DPO'}
            </Button>

            <Button
              onClick={() => executeIAAction('apply_credit_gate')}
              disabled={executingAction === 'apply_credit_gate'}
              className="w-full justify-start"
              style={{ backgroundColor: '#4472C4', color: '#FFFFFF' }}
            >
              <CreditCard className="w-4 h-4 mr-3" />
              {executingAction === 'apply_credit_gate' ? 'Aplicando...' : 'Aplicar Credit Gate'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle className="text-[18px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Acceso Rápido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Link to={createPageUrl("Finanzas") + "?tab=facturas&tipo=AR&estado=overdue"}>
              <Button variant="outline" className="w-full justify-start text-sm h-12">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Ver facturas vencidas (AR)
              </Button>
            </Link>
            <Link to={createPageUrl("Finanzas") + "?tab=pagos&fecha_programada=week"}>
              <Button variant="outline" className="w-full justify-start text-sm h-12">
                <Calendar className="w-4 h-4 mr-2" />
                Pagos de esta semana (AP)
              </Button>
            </Link>
            <Link to={createPageUrl("Finanzas") + "?tab=conciliación&resultado=MISMATCH"}>
              <Button variant="outline" className="w-full justify-start text-sm h-12">
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Conciliación pendiente
              </Button>
            </Link>
            <Link to={createPageUrl("Finanzas") + "?tab=presupuestos&variacion=10"}>
              <Button variant="outline" className="w-full justify-start text-sm h-12">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Presupuestos en rojo
              </Button>
            </Link>
            <Link to={createPageUrl("Finanzas") + "?tab=analytics&view=acc_pnl"}>
              <Button variant="outline" className="w-full justify-start text-sm h-12">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics margen por cliente
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // FUNCIÓN RENDERIZAR FACTURAS SEGÚN JSON SPEC
  const renderFacturas = ({
    activeChip, setActiveChip, showIntakeAP, setShowIntakeAP, showEmitirAR, setShowEmitirAR,
    show3WMSimulator, setShow3WMSimulator, selectedInvoice, setSelectedInvoice,
    showVerModal, setShowVerModal, executingBulk3WM, setExecutingBulk3WM
  }) => {
    // Mock data según seeds de JSON spec
    const invoicesData = [
      {
        id: "INV-AP-001",
        tipo: "AP",
        número: "F-2025-0001",
        contraparte: "Proveedor ABC SA",
        estado: "validated",
        fecha: "2025-08-15",
        vencimiento: "2025-09-14",
        aging_bucket: "0-15",
        moneda: "EUR",
        subtotal: 2000.0,
        impuestos: 420.0,
        total: 2420.0,
        referencia: "PO-000123",
        threeWayResult: "MATCHED",
        método: "Transferencia",
        términos: "30 días",
        centro_costo: "Compras",
        creada_por: "Ana García",
        adjuntos: 2
      },
      {
        id: "INV-AP-002",
        tipo: "AP",
        número: "F-2025-0002",
        contraparte: "Proveedor ABC SA",
        estado: "blocked",
        fecha: "2025-08-16",
        vencimiento: "2025-09-15",
        aging_bucket: "16-30",
        moneda: "EUR",
        subtotal: 1025.0,
        impuestos: 215.25,
        total: 1240.25,
        referencia: "PO-000123",
        threeWayResult: "MISMATCH",
        método: "Transferencia",
        términos: "30 días",
        centro_costo: "Compras",
        creada_por: "Ana García",
        adjuntos: 1
      },
      {
        id: "INV-AR-001",
        tipo: "AR",
        número: "S-2025-0001",
        contraparte: "Cliente XYZ SL",
        estado: "overdue",
        fecha: "2025-08-18",
        vencimiento: "2025-09-02",
        aging_bucket: "31-60",
        moneda: "EUR",
        subtotal: 650.0,
        impuestos: 136.5,
        total: 786.5,
        referencia: "SHIP-001",
        threeWayResult: null,
        método: "Transferencia",
        términos: "15 días",
        centro_costo: "Ventas",
        creada_por: "Ana García",
        adjuntos: 1
      }
    ];

    // Filtrar según chip activo
    const filteredInvoices = invoicesData.filter(invoice => {
      if (activeChip === 'all') return true;
      return invoice.tipo === activeChip;
    });

    const executeFacturasAction = async (actionId, invoice) => {
      switch(actionId) {
        case 'run_3wm_bulk':
          setExecutingBulk3WM(true);
          await new Promise(resolve => setTimeout(resolve, 2000));
          setExecutingBulk3WM(false);
          toast.success("3WM ejecutado - 2 facturas procesadas, 1 mismatch detectado");
          break;
        case 'ver':
          setSelectedInvoice(invoice);
          setShowVerModal(true);
          break;
        case 'enviar':
          toast.success(`Factura ${invoice.número} enviada por email`);
          break;
        case 'run_3wm':
          toast.success(`3WM ejecutado para ${invoice.número}`);
          break;
        case 'disputa':
          toast.info(`Abriendo disputa para ${invoice.número}`);
          break;
        default:
          toast.info(`Acción ${actionId} para ${invoice.número}`);
      }
    };

    return (
      <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {/* Toolbar según JSON spec */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex gap-2">
            {/* Chips de filtro */}
            <Button
              variant={activeChip === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChip('all')}
              style={activeChip === 'all' ? { backgroundColor: '#4472C4', color: 'white' } : {}}
            >
              Todas
            </Button>
            <Button
              variant={activeChip === 'AP' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChip('AP')}
              style={activeChip === 'AP' ? { backgroundColor: '#4472C4', color: 'white' } : {}}
            >
              AP
            </Button>
            <Button
              variant={activeChip === 'AR' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChip('AR')}
              style={activeChip === 'AR' ? { backgroundColor: '#4472C4', color: 'white' } : {}}
            >
              AR
            </Button>
          </div>

          <div className="flex gap-3">
            {/* Primary Actions */}
            <Button
              onClick={() => setShowIntakeAP(true)}
              style={{ backgroundColor: '#4472C4', color: 'white' }}
              className="hover:bg-[#3461B3]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ingresar AP
            </Button>
            <Button
              onClick={() => setShowEmitirAR(true)}
              style={{ backgroundColor: '#4472C4', color: 'white' }}
              className="hover:bg-[#3461B3]"
            >
              <FileText className="w-4 h-4 mr-2" />
              Emitir AR
            </Button>

            {/* Secondary Actions */}
            <Button
              variant="outline"
              onClick={() => executeFacturasAction('run_3wm_bulk')}
              disabled={executingBulk3WM}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {executingBulk3WM ? 'Ejecutando...' : 'Ejecutar 3WM'}
            </Button>
          </div>
        </div>

        {/* Tabla de facturas según JSON columns spec */}
        <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-[18px] font-semibold">Gestión de Facturas</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShow3WMSimulator(true)}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Simulador 3WM
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Contraparte</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Aging</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>3WM</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Badge
                        className={invoice.tipo === 'AP' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                      >
                        {invoice.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{invoice.número}</TableCell>
                    <TableCell>{invoice.contraparte}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          invoice.estado === 'blocked' ? 'bg-red-100 text-red-800' :
                          invoice.estado === 'overdue' ? 'bg-red-100 text-red-800' :
                          invoice.estado === 'validated' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {invoice.estado === 'blocked' ? 'Bloqueada' :
                         invoice.estado === 'overdue' ? 'Vencida' :
                         invoice.estado === 'validated' ? 'Validada' :
                         invoice.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={new Date(invoice.vencimiento) < new Date() ? 'text-red-600 font-medium' : ''}>
                        {new Date(invoice.vencimiento).toLocaleDateString('es-ES')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          invoice.aging_bucket === '90+' ? 'border-red-200 text-red-600' :
                          invoice.aging_bucket.includes('61-90') || invoice.aging_bucket.includes('31-60') ? 'border-yellow-200 text-yellow-600' :
                          'border-green-200 text-green-600'
                        }
                      >
                        {invoice.aging_bucket} días
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">€{invoice.total.toLocaleString('es-ES')}</TableCell>
                    <TableCell>
                      {invoice.threeWayResult && (
                        <Badge
                          className={
                            invoice.threeWayResult === 'MATCHED' ? 'bg-green-100 text-green-800' :
                            invoice.threeWayResult === 'MISMATCH' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {invoice.threeWayResult}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => executeFacturasAction('ver', invoice)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {invoice.tipo === 'AP' && invoice.estado !== 'blocked' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => executeFacturasAction('run_3wm', invoice)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {invoice.estado === 'overdue' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => executeFacturasAction('disputa', invoice)}
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal Ingresar AP */}
        <Dialog open={showIntakeAP} onOpenChange={setShowIntakeAP}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ingresar factura AP</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Número *</Label>
                  <Input placeholder="F-2025-XXXX" />
                </div>
                <div>
                  <Label>Proveedor *</Label>
                  <Input placeholder="Seleccionar proveedor" />
                </div>
                <div>
                  <Label>Fecha</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Vencimiento</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Moneda</Label>
                  <Input value="EUR" readOnly />
                </div>
                <div>
                  <Label>Centro de Costo</Label>
                  <Input placeholder="Centro de costo" />
                </div>
              </div>

              <div>
                <Label>Referencia PO/GR</Label>
                <Input placeholder="PO-000XXX, GR-000XXX" />
              </div>

              <div>
                <Label>Líneas de factura *</Label>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-600 mb-2">
                    <span>SKU</span>
                    <span>Cantidad</span>
                    <span>Precio Unit.</span>
                    <span>% IVA</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <Input placeholder="SKU-001" />
                    <Input type="number" placeholder="100" />
                    <Input type="number" placeholder="10.00" />
                    <Input type="number" placeholder="21" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowIntakeAP(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowIntakeAP(false);
                    toast.success("Factura AP ingresada correctamente - 3WM se ejecutará automáticamente");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Emitir AR */}
        <Dialog open={showEmitirAR} onOpenChange={setShowEmitirAR}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Emitir factura AR</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Número</Label>
                  <Input placeholder="S-2025-XXXX" />
                </div>
                <div>
                  <Label>Cliente *</Label>
                  <Input placeholder="Seleccionar cliente" />
                </div>
                <div>
                  <Label>Fecha</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Vencimiento</Label>
                  <Input type="date" />
                </div>
              </div>

              <div>
                <Label>Líneas de factura *</Label>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-600 mb-2">
                    <span>Código</span>
                    <span>Cantidad</span>
                    <span>Precio Unit.</span>
                    <span>% IVA</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <Input placeholder="FLETE_TMS" />
                    <Input type="number" placeholder="1" />
                    <Input type="number" placeholder="650.00" />
                    <Input type="number" placeholder="21" />
                  </div>
                </div>
              </div>

              <div>
                <Label>Canal de envío</Label>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    <Bell className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEmitirAR(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowEmitirAR(false);
                    toast.success("Factura AR emitida y enviada correctamente");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Emitir y Enviar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Ver Factura */}
        <Dialog open={showVerModal} onOpenChange={setShowVerModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Factura {selectedInvoice?.número}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Detalles principales */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <Label>Contraparte</Label>
                  <p className="text-sm font-medium">{selectedInvoice?.contraparte}</p>
                </div>
                <div>
                  <Label>Total</Label>
                  <p className="text-lg font-semibold">€{selectedInvoice?.total.toLocaleString('es-ES')}</p>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Badge
                    className={
                      selectedInvoice?.estado === 'blocked' || selectedInvoice?.estado === 'overdue' ? 'bg-red-100 text-red-800' :
                      selectedInvoice?.estado === 'validated' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {selectedInvoice?.estado === 'blocked' ? 'Bloqueada' :
                     selectedInvoice?.estado === 'overdue' ? 'Vencida' :
                     selectedInvoice?.estado === 'validated' ? 'Validada' :
                     selectedInvoice?.estado}
                  </Badge>
                </div>
              </div>

              {/* 3WM Result si aplica */}
              {selectedInvoice?.threeWayResult === 'MISMATCH' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold text-red-800">Diferencias 3WM Detectadas</h4>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Qty PO</TableHead>
                        <TableHead>Qty Factura</TableHead>
                        <TableHead>Diferencia</TableHead>
                        <TableHead>Razón</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>SKU-002</TableCell>
                        <TableCell>50</TableCell>
                        <TableCell>50</TableCell>
                        <TableCell className="text-red-600">Precio: €20.00 vs €20.50</TableCell>
                        <TableCell>precio</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <div className="flex gap-3 mt-4">
                    <Button size="sm" style={{ backgroundColor: '#4472C4', color: 'white' }}>
                      Crear Tarea
                    </Button>
                    <Button variant="outline" size="sm">
                      Abrir Disputa
                    </Button>
                    <Button variant="outline" size="sm">
                      Aprobar Excepción
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowVerModal(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Simulador 3WM */}
        <Dialog open={show3WMSimulator} onOpenChange={setShow3WMSimulator}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Simulador 3WM - Tolerancias</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-sm text-gray-600">Ajusta tolerancias para 3-Way Matching y simula resultados.</p>

              <div className="space-y-4">
                <div>
                  <Label>Tolerancia Cantidad (%): 2.0%</Label>
                  <Slider
                    defaultValue={[2.0]}
                    max={10}
                    min={0}
                    step={0.5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Tolerancia Precio (%): 1.0%</Label>
                  <Slider
                    defaultValue={[1.0]}
                    max={5}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Tolerancia Impuestos (%): 0.5%</Label>
                  <Slider
                    defaultValue={[0.5]}
                    max={2}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Simulación de Resultados</h4>
                <p className="text-sm text-blue-700">
                  Con estas tolerancias: INV-AP-002 seguiría como MISMATCH (diferencia precio 2.5% mayor a 1.0%)
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShow3WMSimulator(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShow3WMSimulator(false);
                    toast.success("Tolerancias 3WM actualizadas - Reprocesando facturas afectadas");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Aplicar Tolerancias
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // NUEVA FUNCIÓN RENDERIZAR PAGOS SEGÚN JSON SPEC COMPLETA
  const renderPagos = ({
    activeView, setActiveView, showScheduleModal, setShowScheduleModal, showCreateBatchModal,
    setShowCreateBatchModal, showOptimizeDPOSimulator, setShowOptimizeDPOSimulator,
    showDiscountSimulator, setShowDiscountSimulator, selectedPayments, setSelectedPayments,
    executingPaymentAction, setExecutingPaymentAction
  }) => {

    // Seeds data según JSON spec
    const paymentsData = [
      {
        id: "PAY-00077",
        invoiceId: "INV-AP-001",
        supplierId: "sup-001",
        proveedor: "Proveedor ABC SA",
        factura: "F-2025-0001",
        amount: 2420.0,
        currency: "EUR",
        scheduledAt: "2025-09-09",
        method: "transfer",
        state: "scheduled",
        priority: "media",
        batchId: null,
        bankAccount: "ES12 3456 7890 1122 3344",
        bankRef: null,
        costCenter: "ALM01",
        note: "Pago estándar Net30",
        createdAt: "2025-08-31T10:00:00Z",
        createdBy: "u-mario"
      },
      {
        id: "PAY-00078",
        invoiceId: "INV-AP-002",
        supplierId: "sup-001",
        proveedor: "Proveedor ABC SA",
        factura: "F-2025-0002",
        amount: 1240.25,
        currency: "EUR",
        scheduledAt: "2025-09-10",
        method: "transfer",
        state: "scheduled",
        priority: "alta",
        batchId: "PB-0001",
        bankAccount: "ES12 3456 7890 1122 3344",
        bankRef: null,
        costCenter: "ALM01",
        note: "Atención: MISMATCH 3WM",
        createdAt: "2025-08-31T10:05:00Z",
        createdBy: "u-mario"
      },
      {
        id: "PAY-00079",
        invoiceId: "INV-AP-003",
        supplierId: "sup-002",
        proveedor: "Servicios Logísticos SL",
        factura: "F-2025-0003",
        amount: 980.0,
        currency: "EUR",
        scheduledAt: "2025-09-03",
        method: "wire",
        state: "posted",
        priority: "baja",
        batchId: "PB-0000",
        bankAccount: "ES98 7654 3210 9988 7766",
        bankRef: "SEPA-778899",
        costCenter: "ADM01",
        note: "",
        createdAt: "2025-08-30T09:00:00Z",
        createdBy: "u-ana"
      }
    ];

    const executePaymentAction = async (actionId, payment = null) => {
      setExecutingPaymentAction(actionId);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 800));

      switch(actionId) {
        case 'send_batch':
          toast.success("Lote enviado al banco - Referencia: SEPA-990077");
          break;
        case 'approve_batch':
          toast.success("Lote aprobado - Listo para envío");
          break;
        case 'post_payment':
          toast.success(`Pago ${payment.id} registrado correctamente`);
          break;
        case 'reschedule':
          toast.success(`Pago ${payment.id} reprogramado`);
          break;
        case 'cancel':
          toast.success(`Pago ${payment.id} cancelado`);
          break;
        default:
          toast.success(`Acción ${actionId} ejecutada para ${payment?.id || 'lote'}`);
      }
      setExecutingPaymentAction(null);
    };

    const getStateConfig = (state) => {
      const configs = {
        scheduled: { label: "Programado", bg: "bg-yellow-100", text: "text-yellow-800" },
        sent: { label: "Enviado", bg: "bg-blue-100", text: "text-blue-800" },
        posted: { label: "Registrado", bg: "bg-green-100", text: "text-green-800" },
        failed: { label: "Fallido", bg: "bg-red-100", text: "text-red-800" },
        cancelled: { label: "Cancelado", bg: "bg-gray-100", text: "text-gray-800" }
      };
      return configs[state] || configs.scheduled;
    };

    const getPriorityConfig = (priority) => {
      const configs = {
        alta: { label: "Alta", bg: "bg-red-100", text: "text-red-800" },
        media: { label: "Media", bg: "bg-yellow-100", text: "text-yellow-800" },
        baja: { label: "Baja", bg: "bg-blue-100", text: "text-blue-800" }
      };
      return configs[priority] || configs.media;
    };

    return (
      <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {/* View Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <Button
              size="sm"
              onClick={() => setActiveView('queue')}
              style={{
                backgroundColor: activeView === 'queue' ? '#4472C4' : 'transparent',
                color: activeView === 'queue' ? 'white' : '#6B7280',
                borderRadius: '8px'
              }}
            >
              Cola de Pagos
            </Button>
            <Button
              size="sm"
              onClick={() => setActiveView('calendar')}
              style={{
                backgroundColor: activeView === 'calendar' ? '#4472C4' : 'transparent',
                color: activeView === 'calendar' ? 'white' : '#6B7280',
                borderRadius: '8px'
              }}
            >
              Calendario
            </Button>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowScheduleModal(true)}
              style={{ backgroundColor: '#4472C4', color: 'white' }}
              className="hover:bg-[#3461B3]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Programar Pago
            </Button>
            <Button
              onClick={() => setShowCreateBatchModal(true)}
              variant="outline"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Crear Lote
            </Button>
          </div>
        </div>

        {/* Simuladores Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Optimizar DPO y Caja 30 días</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Reprograma pagos para maximizar cash 30 días manteniendo relaciones.</p>
              <Button
                onClick={() => setShowOptimizeDPOSimulator(true)}
                variant="outline"
                className="w-full"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Simular
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Capturar Descuento por Pronto Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Evalúa si conviene aprovechar descuentos 2/10 Net 30 vs costo de capital.</p>
              <Button
                onClick={() => setShowDiscountSimulator(true)}
                variant="outline"
                className="w-full"
              >
                <Percent className="w-4 h-4 mr-2" />
                Evaluar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Vista Cola de Pagos */}
        {activeView === 'queue' && (
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[18px] font-semibold">Cola de Pagos Programados</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => executePaymentAction('approve_batch')}
                    disabled={executingPaymentAction === 'approve_batch'}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {executingPaymentAction === 'approve_batch' ? 'Aprobando...' : 'Aprobar Lote'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => executePaymentAction('send_batch')}
                    disabled={executingPaymentAction === 'send_batch'}
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    {executingPaymentAction === 'send_batch' ? 'Enviando...' : 'Enviar a Banco'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Pago</TableHead>
                    <TableHead>Factura</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha Program.</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentsData.map((payment) => {
                    const stateConfig = getStateConfig(payment.state);
                    const priorityConfig = getPriorityConfig(payment.priority);

                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>
                          <Link
                            to={createPageUrl("Finanzas") + "?tab=facturas&número=" + payment.factura}
                            className="text-blue-600 hover:underline"
                          >
                            {payment.factura}
                          </Link>
                        </TableCell>
                        <TableCell>{payment.proveedor}</TableCell>
                        <TableCell className="font-medium">
                          €{payment.amount.toLocaleString('es-ES')} {payment.currency}
                        </TableCell>
                        <TableCell>
                          <span className={new Date(payment.scheduledAt) < new Date() ? 'text-red-600 font-medium' : ''}>
                            {new Date(payment.scheduledAt).toLocaleDateString('es-ES')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${priorityConfig.bg} ${priorityConfig.text}`}>
                            {priorityConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${stateConfig.bg} ${stateConfig.text}`}>
                            {stateConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.batchId ? (
                            <Badge variant="outline" className="text-xs">
                              {payment.batchId}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">Sin lote</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Ver detalle"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {payment.state === 'scheduled' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => executePaymentAction('post_payment', payment)}
                                title="Registrar pago"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            {payment.state === 'scheduled' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => executePaymentAction('reschedule', payment)}
                                title="Reprogramar"
                              >
                                <Clock className="w-4 h-4" />
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

        {/* Vista Calendario */}
        {activeView === 'calendar' && (
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[18px] font-semibold">Calendario de Pagos</CardTitle>
              <p className="text-sm text-gray-600">Run Days: Martes y Jueves | Cutoff: 15:00</p>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: '#4472C4' }}/>
                  <h3 className="text-lg font-semibold">Vista de Calendario</h3>
                  <p className="text-sm mt-2">Próximos run days:</p>
                  <div className="flex gap-2 justify-center mt-3">
                    <Badge className="bg-blue-100 text-blue-800">Mar 03/09</Badge>
                    <Badge className="bg-blue-100 text-blue-800">Jue 05/09</Badge>
                    <Badge className="bg-blue-100 text-blue-800">Mar 10/09</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal Programar Pago */}
        <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Programar Pago</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Factura *</Label>
                  <Input placeholder="Buscar factura por número" />
                </div>
                <div>
                  <Label>Proveedor</Label>
                  <Input placeholder="Auto-completado" readOnly />
                </div>
                <div>
                  <Label>Monto *</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div>
                  <Label>Moneda</Label>
                  <Input value="EUR" readOnly />
                </div>
                <div>
                  <Label>Fecha Programada *</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Prioridad</Label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
                <div>
                  <Label>Método</Label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="transfer">Transferencia</option>
                    <option value="wire">Wire</option>
                    <option value="card">Tarjeta</option>
                    <option value="cash">Efectivo</option>
                  </select>
                </div>
                <div>
                  <Label>Cuenta Bancaria</Label>
                  <Input placeholder="ES12 3456 7890..." />
                </div>
              </div>

              <div>
                <Label>Centro de Costo</Label>
                <Input placeholder="Centro de costo" />
              </div>

              <div>
                <Label>Nota (opcional)</Label>
                <Input placeholder="Comentarios adicionales" />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowScheduleModal(false);
                    toast.success("Pago programado correctamente");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Programar Pago
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Crear Lote */}
        <Dialog open={showCreateBatchModal} onOpenChange={setShowCreateBatchModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Lote de Pagos</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Fecha de Envío</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Aprobador</Label>
                <select className="w-full p-2 border rounded-lg">
                  <option value="u-cfo">CFO - Ana García</option>
                  <option value="u-controller">Controller - Mario López</option>
                </select>
              </div>
              <div>
                <Label>Pagos Seleccionados</Label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">2 pagos seleccionados - Total: €3,660.25</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreateBatchModal(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateBatchModal(false);
                    toast.success("Lote PB-0002 creado - Pendiente de aprobación");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Crear Lote
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Simulador Optimizar DPO */}
        <Dialog open={showOptimizeDPOSimulator} onOpenChange={setShowOptimizeDPOSimulator}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Optimizar DPO y Caja 30 días</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-sm text-gray-600">Ajusta objetivos para optimizar programación de pagos.</p>

              <div className="space-y-4">
                <div>
                  <Label>Mínimo cash 30d (€): 100,000</Label>
                  <Slider
                    defaultValue={[100000]}
                    max={200000}
                    min={50000}
                    step={5000}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Prioridad proveedores</Label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="neutro">Neutro</option>
                    <option value="favorecer_descuento">Favorecer descuento</option>
                    <option value="favorecer_riesgo_bajo">Favorecer riesgo bajo</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Recomendación IA-Forecast</h4>
                <p className="text-sm text-blue-700">
                  Mover PAY-00077 de 09/09 a 17/09 mantendrá cash positivo y mejorará DPO en 2.3 días.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowOptimizeDPOSimulator(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowOptimizeDPOSimulator(false);
                    toast.success("Optimización aplicada - 3 pagos reprogramados");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Aplicar Optimización
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Simulador Descuento Pronto Pago */}
        <Dialog open={showDiscountSimulator} onOpenChange={setShowDiscountSimulator}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Evaluador de Descuento por Pronto Pago</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-sm text-gray-600">Compara beneficio del descuento vs costo de capital.</p>

              <div className="space-y-4">
                <div>
                  <Label>Tasa descuento (%): 2.0%</Label>
                  <Slider
                    defaultValue={[2.0]}
                    max={5}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Días descuento: 10</Label>
                  <Slider
                    defaultValue={[10]}
                    max={20}
                    min={5}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Costo capital anual (%): 12%</Label>
                  <Slider
                    defaultValue={[12]}
                    max={40}
                    min={0}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Recomendación</h4>
                <p className="text-sm text-green-700">
                  ✅ APLICA descuento 2/10 Net 30. Ahorro neto: €18.40 por cada €1,000
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowDiscountSimulator(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowDiscountSimulator(false);
                    toast.success("Descuentos evaluados - 5 pagos elegibles para descuento");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Aplicar a Elegibles
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // NUEVA FUNCIÓN RENDERIZAR COBROS SEGÚN JSON SPEC COMPLETA
  const renderCobros = () => {
    // Seeds data según JSON spec
    const collectionsData = [
      {
        id: "COL-00012",
        invoiceId: "INV-AR-001",
        customerId: "cus-001",
        factura: "S-2025-0001",
        cliente: "Cliente XYZ SL",
        amount: 786.5,
        currency: "EUR",
        promisedAt: "2025-09-05",
        channel: "whatsapp",
        state: "promise",
        overdueDays: 14,
        aging_bucket: "16-30",
        owner: "Ana García",
        lastReminderAt: "2025-08-30T10:00:00Z",
        paylink: "https://pay.trustport/INV-AR-001",
        sla: "2025-09-02T12:00:00Z"
      },
      {
        id: "COL-00013",
        invoiceId: "INV-AR-002",
        customerId: "cus-002",
        factura: "S-2025-0002",
        cliente: "Comercial Beta SL",
        amount: 1540.0,
        currency: "EUR",
        promisedAt: null,
        channel: "email",
        state: "partial",
        overdueDays: 7,
        aging_bucket: "0-15",
        owner: "Carlos Ruiz",
        lastReminderAt: "2025-08-31T09:00:00Z",
        paylink: null,
        sla: "2025-09-03T12:00:00Z"
      },
      {
        id: "COL-00014",
        invoiceId: "INV-AR-003",
        customerId: "cus-003",
        factura: "S-2025-0003",
        cliente: "Distribuidora Gamma",
        amount: 320.0,
        currency: "EUR",
        promisedAt: null,
        channel: "portal",
        state: "paid",
        overdueDays: 0,
        aging_bucket: "0-15",
        owner: "Ana García",
        lastReminderAt: "2025-08-25T11:00:00Z",
        paylink: "https://pay.trustport/INV-AR-003",
        sla: "2025-09-01T12:00:00Z"
      }
    ];

    const executeCollectionAction = async (actionId, collection) => {
      setExecutingAction(actionId);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 800));

      switch(actionId) {
        case 'registrar_cobro':
          setSelectedCollection(collection);
          setShowRegistrarCobro(true);
          break;
        case 'enviar_recordatorio':
          setSelectedCollection(collection);
          setShowEnviarRecordatorio(true);
          break;
        case 'crear_promesa':
          setSelectedCollection(collection);
          setShowCrearPromesa(true);
          break;
        case 'reprogramar_promesa':
          setSelectedCollection(collection);
          setShowReprogramarPromesa(true);
          break;
        case 'generar_enlace':
          setSelectedCollection(collection);
          setShowGenerarEnlace(true);
          break;
        case 'escalar':
          setSelectedCollection(collection);
          setShowEscalar(true);
          break;
        case 'writeoff':
          setSelectedCollection(collection);
          setShowWriteoff(true);
          break;
        case 'enviar_recordatorio_bulk':
          toast.success("Recordatorios masivos enviados a 5 clientes");
          break;
        case 'actualizar_promesas':
          toast.success("Promesas de pago actualizadas");
          break;
        default:
          toast.success(`Acción ${actionId} ejecutada para ${collection?.factura || 'colección'}`);
      }
      setExecutingAction(null);
    };

    const getStateConfig = (state) => {
      const configs = {
        promise: { label: "Promesa", bg: "bg-blue-100", text: "text-blue-800" },
        partial: { label: "Parcial", bg: "bg-yellow-100", text: "text-yellow-800" },
        paid: { label: "Pagado", bg: "bg-green-100", text: "text-green-800" },
        failed: { label: "Fallido", bg: "bg-red-100", text: "text-red-800" }
      };
      return configs[state] || configs.promise;
    };

    const getChannelConfig = (channel) => {
      const configs = {
        email: { label: "Email", bg: "bg-blue-100", text: "text-blue-800" },
        whatsapp: { label: "WhatsApp", bg: "bg-green-100", text: "text-green-800" },
        phone: { label: "Teléfono", bg: "bg-yellow-100", text: "text-yellow-800" },
        portal: { label: "Portal", bg: "bg-purple-100", text: "text-purple-800" }
      };
      return configs[channel] || configs.email;
    };

    return (
      <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {/* View Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <Button
              size="sm"
              onClick={() => setCobrosView('bandeja')}
              style={{
                backgroundColor: cobrosView === 'bandeja' ? '#4472C4' : 'transparent',
                color: cobrosView === 'bandeja' ? 'white' : '#6B7280',
                borderRadius: '8px'
              }}
            >
              Bandeja de Cobros
            </Button>
            <Button
              size="sm"
              onClick={() => setCobrosView('kanban')}
              style={{
                backgroundColor: cobrosView === 'kanban' ? '#4472C4' : 'transparent',
                color: cobrosView === 'kanban' ? 'white' : '#6B7280',
                borderRadius: '8px'
              }}
            >
              Kanban
            </Button>
            <Button
              size="sm"
              onClick={() => setCobrosView('promesas')}
              style={{
                backgroundColor: cobrosView === 'promesas' ? '#4472C4' : 'transparent',
                color: cobrosView === 'promesas' ? 'white' : '#6B7280',
                borderRadius: '8px'
              }}
            >
              Calendario Promesas
            </Button>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowRegistrarCobro(true)}
              style={{ backgroundColor: '#4472C4', color: 'white' }}
              className="hover:bg-[#3461B3]"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Registrar Cobro
            </Button>
            <Button
              onClick={() => setShowEnviarRecordatorio(true)}
              variant="outline"
            >
              <Bell className="w-4 h-4 mr-2" />
              Enviar Recordatorio
            </Button>
          </div>
        </div>

        {/* Simuladores Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Priorizar Dunning (Top-N por ROI)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Calcula prioridad de recordatorios basado en ROI: importe × probabilidad × urgencia.</p>
              <Button
                onClick={() => setShowPriorizarDunning(true)}
                variant="outline"
                className="w-full"
              >
                <Target className="w-4 h-4 mr-2" />
                Calcular Prioridad
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Simulador de Plan de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Genera planes de pago fraccionados con intereses de mora para facilitar cobro.</p>
              <Button
                onClick={() => setShowPlanDePago(true)}
                variant="outline"
                className="w-full"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Simular Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Vista Bandeja */}
        {cobrosView === 'bandeja' && (
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[18px] font-semibold">Bandeja de Cobros</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => executeCollectionAction('enviar_recordatorio_bulk')}
                    disabled={executingAction === 'enviar_recordatorio_bulk'}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    {executingAction === 'enviar_recordatorio_bulk' ? 'Enviando...' : 'Dunning Bulk'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => executeCollectionAction('actualizar_promesas')}
                    disabled={executingAction === 'actualizar_promesas'}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {executingAction === 'actualizar_promesas' ? 'Actualizando...' : 'Actualizar Promesas'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Cobro</TableHead>
                    <TableHead>Factura</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Días Vencido</TableHead>
                    <TableHead>Aging</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Prometida</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collectionsData.map((collection) => {
                    const stateConfig = getStateConfig(collection.state);
                    const channelConfig = getChannelConfig(collection.channel);

                    return (
                      <TableRow key={collection.id}>
                        <TableCell className="font-medium">{collection.id}</TableCell>
                        <TableCell>
                          <Link
                            to={createPageUrl("Finanzas") + "?tab=facturas&número=" + collection.factura}
                            className="text-blue-600 hover:underline"
                          >
                            {collection.factura}
                          </Link>
                        </TableCell>
                        <TableCell>{collection.cliente}</TableCell>
                        <TableCell className="font-medium">
                          €{collection.amount.toLocaleString('es-ES')} {collection.currency}
                        </TableCell>
                        <TableCell>
                          <span className={collection.overdueDays > 0 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            {collection.overdueDays > 0 ? `${collection.overdueDays} días` : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              collection.aging_bucket === '90+' ? 'border-red-200 text-red-600' :
                              collection.aging_bucket.includes('61-90') || collection.aging_bucket.includes('31-60') ? 'border-yellow-200 text-yellow-600' :
                              'border-green-200 text-green-600'
                            }
                          >
                            {collection.aging_bucket} días
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${channelConfig.bg} ${channelConfig.text}`}>
                            {channelConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${stateConfig.bg} ${stateConfig.text}`}>
                            {stateConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {collection.promisedAt ? (
                            <span className={new Date(collection.promisedAt) < new Date() ? 'text-red-600 font-medium' : ''}>
                              {new Date(collection.promisedAt).toLocaleDateString('es-ES')}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>{collection.owner}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => executeCollectionAction('registrar_cobro', collection)}
                              title="Registrar cobro"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => executeCollectionAction('enviar_recordatorio', collection)}
                              title="Enviar recordatorio"
                            >
                              <Bell className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => executeCollectionAction('crear_promesa', collection)}
                              title="Crear promesa"
                            >
                              <Calendar className="w-4 h-4" />
                            </Button>
                             <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => executeCollectionAction('reprogramar_promesa', collection)}
                              title="Reprogramar Promesa"
                            >
                              <Clock className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => executeCollectionAction('generar_enlace', collection)}
                              title="Generar Enlace de Pago"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => executeCollectionAction('escalar', collection)}
                              title="Escalar"
                            >
                              <Users className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => executeCollectionAction('writeoff', collection)}
                              title="Castigo (Write-off)"
                            >
                              <DollarSign className="w-4 h-4" />
                            </Button>
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

        {/* Vista Kanban */}
        {cobrosView === 'kanban' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {['promise', 'partial', 'paid', 'failed'].map((lane) => (
              <Card key={lane} className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-[16px] font-semibold capitalize">
                    {lane === 'promise' ? 'Promesas' :
                     lane === 'partial' ? 'Parciales' :
                     lane === 'paid' ? 'Pagados' : 'Fallidos'}
                  </CardTitle>
                  <Badge variant="outline" className="w-fit">
                    {collectionsData.filter(c => c.state === lane).length}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {collectionsData
                    .filter(collection => collection.state === lane)
                    .map((collection) => (
                      <Card key={collection.id} className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-sm">{collection.factura}</p>
                            <p className="text-xs text-gray-500">{collection.overdueDays}d</p>
                          </div>
                          <p className="text-sm text-gray-600">{collection.cliente}</p>
                          <div className="flex justify-between items-center">
                            <p className="font-semibold">€{collection.amount.toLocaleString('es-ES')}</p>
                            {collection.promisedAt && (
                              <p className="text-xs text-gray-500">
                                {new Date(collection.promisedAt).toLocaleDateString('es-ES')}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Vista Calendario Promesas */}
        {cobrosView === 'promesas' && (
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[18px] font-semibold">Calendario de Promesas de Pago</CardTitle>
              <p className="text-sm text-gray-600">Promesas programadas y seguimiento de cumplimiento</p>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: '#4472C4' }}/>
                  <h3 className="text-lg font-semibold">Vista de Calendario</h3>
                  <p className="text-sm mt-2">Promesas próximas:</p>
                  <div className="flex gap-2 justify-center mt-3">
                    <Badge className="bg-green-100 text-green-800">5 Sep - €786.50</Badge>
                    <Badge className="bg-yellow-100 text-yellow-800">8 Sep - €1,240.00</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals para Cobros */}
        <Dialog open={showRegistrarCobro} onOpenChange={setShowRegistrarCobro}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Cobro - {selectedCollection?.factura}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha *</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <Label>Importe *</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    defaultValue={selectedCollection?.amount}
                  />
                </div>
                <div>
                  <Label>Moneda</Label>
                  <Input value={selectedCollection?.currency || "EUR"} readOnly />
                </div>
                <div>
                  <Label>Método</Label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="transfer">Transferencia</option>
                    <option value="card">Tarjeta</option>
                    <option value="cash">Efectivo</option>
                    <option value="wire">Wire</option>
                    <option value="portal">Portal</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Referencia bancaria</Label>
                <Input placeholder="Referencia del pago" />
              </div>

              <div>
                <Label>Nota (opcional)</Label>
                <Input placeholder="Comentarios adicionales" />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowRegistrarCobro(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowRegistrarCobro(false);
                    toast.success(`Cobro registrado correctamente para ${selectedCollection?.factura}`);
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Registrar Cobro
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showEnviarRecordatorio} onOpenChange={setShowEnviarRecordatorio}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Recordatorio - {selectedCollection?.factura}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Canal</Label>
                <select className="w-full p-2 border rounded-lg">
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Teléfono</option>
                </select>
              </div>

              <div>
                <Label>Plantilla</Label>
                <select className="w-full p-2 border rounded-lg">
                  <option value="recordatorio_1">Recordatorio amigable</option>
                  <option value="recordatorio_2">Recordatorio firme</option>
                  <option value="ultimo_aviso">Último aviso</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="adjuntar_pdf" className="w-4 h-4" />
                <Label htmlFor="adjuntar_pdf">Adjuntar PDF de factura</Label>
              </div>

              <div>
                <Label>Nota adicional (opcional)</Label>
                <Input placeholder="Mensaje personalizado" />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEnviarRecordatorio(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowEnviarRecordatorio(false);
                    toast.success(`Recordatorio enviado por ${selectedCollection?.channel} a ${selectedCollection?.cliente}`);
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Enviar Recordatorio
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showCrearPromesa} onOpenChange={setShowCrearPromesa}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Promesa de Pago - {selectedCollection?.factura}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha prometida *</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Importe prometido *</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    defaultValue={selectedCollection?.amount}
                  />
                </div>
              </div>

              <div>
                <Label>Canal de confirmación</Label>
                <select className="w-full p-2 border rounded-lg">
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Teléfono</option>
                  <option value="portal">Portal</option>
                </select>
              </div>

              <div>
                <Label>Nota (opcional)</Label>
                <Input placeholder="Detalles de la promesa" />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCrearPromesa(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowCrearPromesa(false);
                    toast.success(`Promesa de pago creada para ${selectedCollection?.cliente}`);
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Guardar Promesa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showReprogramarPromesa} onOpenChange={setShowReprogramarPromesa}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reprogramar Promesa de Pago - {selectedCollection?.factura}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nueva fecha prometida *</Label>
                  <Input type="date" defaultValue={selectedCollection?.promisedAt ? new Date(selectedCollection.promisedAt).toISOString().split('T')[0] : ''} />
                </div>
                <div>
                  <Label>Importe prometido *</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    defaultValue={selectedCollection?.amount}
                  />
                </div>
              </div>

              <div>
                <Label>Razón para reprogramar</Label>
                <Input placeholder="Ej. Cliente solicitó más tiempo" />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowReprogramarPromesa(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowReprogramarPromesa(false);
                    toast.success(`Promesa de pago para ${selectedCollection?.cliente} reprogramada.`);
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Reprogramar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showGenerarEnlace} onOpenChange={setShowGenerarEnlace}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generar Enlace de Pago - {selectedCollection?.factura}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Método de pago</Label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="transfer">Transferencia</option>
                    <option value="card">Tarjeta</option>
                    <option value="portal">Portal</option>
                  </select>
                </div>
                <div>
                  <Label>Vencimiento del enlace</Label>
                  <Input type="date" />
                </div>
              </div>

              <div>
                <Label>Importe (opcional - por defecto total factura)</Label>
                <Input
                  type="number"
                  placeholder="Dejar vacío para monto completo"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowGenerarEnlace(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowGenerarEnlace(false);
                    toast.success(`Enlace de pago generado y enviado a ${selectedCollection?.cliente}`);
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Generar y Enviar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showEscalar} onOpenChange={setShowEscalar}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Escalar a Legal/Dirección - {selectedCollection?.factura}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Destinatario</Label>
                <select className="w-full p-2 border rounded-lg">
                  <option value="legal">Legal</option>
                  <option value="direccion">Dirección</option>
                  <option value="ownerCRM">Owner CRM</option>
                </select>
              </div>

              <div>
                <Label>Motivo *</Label>
                <Input placeholder="Motivo de la escalación" />
              </div>

              <div>
                <Label>Adjunto (opcional)</Label>
                <Input type="file" />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEscalar(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowEscalar(false);
                    toast.success(`Caso escalado - Se notificará al destinatario`);
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Escalar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showWriteoff} onOpenChange={setShowWriteoff}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Castigo (Write-off) - {selectedCollection?.factura}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h4 className="font-semibold text-red-800">⚠️ Atención</h4>
                </div>
                <p className="text-sm text-red-700 mt-2">
                  Esta acción impacta P&L. Una vez confirmada no se puede deshacer.
                </p>
              </div>

              <div>
                <Label>Importe a castigar *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  defaultValue={selectedCollection?.amount}
                />
              </div>

              <div>
                <Label>Motivo *</Label>
                <select className="w-full p-2 border rounded-lg">
                  <option value="">Seleccionar motivo</option>
                  <option value="incobrabilidad">Incobrabilidad confirmada</option>
                  <option value="insolvencia">Cliente en insolvencia</option>
                  <option value="disputa">Disputa no resuelta</option>
                  <option value="error_sistema">Error de sistema</option>
                </select>
              </div>

              <div>
                <Label>Adjunto (opcional)</Label>
                <Input type="file" />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowWriteoff(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowWriteoff(false);
                    toast.success(`Write-off registrado para ${selectedCollection?.factura} - Impacto P&L: -€${selectedCollection?.amount.toLocaleString('es-ES')}`);
                  }}
                  style={{ backgroundColor: '#DB2142', color: 'white' }}
                  className="hover:bg-red-700"
                >
                  Confirmar Castigo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Simulador Priorizar Dunning */}
        <Dialog open={showPriorizarDunning} onOpenChange={setShowPriorizarDunning}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Priorizar Dunning (Top-N por ROI)</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-sm text-gray-600">Ajusta pesos para calcular prioridad de recordatorios.</p>

              <div className="space-y-4">
                <div>
                  <Label>Top N cuentas: 10</Label>
                  <Slider
                    defaultValue={[10]}
                    max={50}
                    min={5}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Peso Importe: 50%</Label>
                  <Slider
                    defaultValue={[0.5]}
                    max={1}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Peso Riesgo: 30%</Label>
                  <Slider
                    defaultValue={[0.3]}
                    max={1}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Peso Antigüedad: 20%</Label>
                  <Slider
                    defaultValue={[0.2]}
                    max={1}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Ranking Calculado</h4>
                <div className="space-y-1">
                  <p className="text-sm text-blue-700">1. Cliente XYZ SL - Score: 87.3</p>
                  <p className="text-sm text-blue-700">2. Comercial Beta SL - Score: 72.1</p>
                  <p className="text-sm text-blue-700">3. Distribuidora Gamma - Score: 65.8</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowPriorizarDunning(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowPriorizarDunning(false);
                    toast.success("Priorización calculada - Top 10 cuentas seleccionadas para dunning");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Aplicar Priorización
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showPlanDePago} onOpenChange={setShowPlanDePago}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Simulador de Plan de Pago - {selectedCollection?.factura}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-sm text-gray-600">Genera plan de pago fraccionado con intereses de mora.</p>

              <div className="space-y-4">
                <div>
                  <Label>Número de cuotas: 2</Label>
                  <Slider
                    defaultValue={[2]}
                    max={6}
                    min={2}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Primer pago en días: 7</Label>
                  <Slider
                    defaultValue={[7]}
                    max={30}
                    min={0}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Tasa mora mensual (%): 2.0%</Label>
                  <Slider
                    defaultValue={[2.0]}
                    max={10}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Plan Simulado</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cuota</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Importe</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>1</TableCell>
                      <TableCell>08/09/2025</TableCell>
                      <TableCell>€393.25</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2</TableCell>
                      <TableCell>08/10/2025</TableCell>
                      <TableCell>€406.95</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowPlanDePago(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowPlanDePago(false);
                    setShowCrearPromesa(true);
                    toast.success("Plan simulado - Creando promesa con primera cuota");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Crear Plan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // NUEVA FUNCIÓN RENDERIZAR CONCILIACIÓN SEGÚN JSON SPEC COMPLETA
  const renderConciliacion = () => {
    // Seeds data según JSON spec
    const matchingData = [
      {
        invoiceId: "INV-AP-001",
        poId: "PO-000123",
        grId: "GR-000456",
        sku: "SKU-001",
        qtyPO: 100,
        qtyGR: 100,
        qtyINV: 100,
        pctDiffQty: 0.0,
        precioPO: 10.0,
        precioINV: 10.0,
        pctDiffPrecio: 0.0,
        motivo: "otros",
        estadoFactura: "validated",
        resultado: "MATCHED",
        owner: "Ana García"
      },
      {
        invoiceId: "INV-AP-002",
        poId: "PO-000124",
        grId: "GR-000457",
        sku: "SKU-002",
        qtyPO: 50,
        qtyGR: 48,
        qtyINV: 50,
        pctDiffQty: -4.0,
        precioPO: 20.0,
        precioINV: 20.5,
        pctDiffPrecio: 2.5,
        motivo: "precio",
        estadoFactura: "blocked",
        resultado: "MISMATCH",
        owner: "Ana García"
      },
      {
        invoiceId: "INV-AP-004",
        poId: "PO-000125",
        grId: "GR-000458",
        sku: "SKU-003",
        qtyPO: 200,
        qtyGR: 198,
        qtyINV: 200,
        pctDiffQty: -1.0,
        precioPO: 5.0,
        precioINV: 5.0,
        pctDiffPrecio: 0.0,
        motivo: "cantidad",
        estadoFactura: "blocked",
        resultado: "PARTIAL",
        owner: "María López"
      }
    ];

    // Filtrar según vista activa
    const filteredMatches = matchingData.filter(match => {
      if (conciliacionView === 'ALL') return true;
      return match.resultado === conciliacionView;
    });

    const executeConciliacionAction = async (actionId, match) => {
      setExecutingAction(actionId);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 800));

      switch(actionId) {
        case 'reintentar_3wm':
          toast.success(`3WM reintentado para ${match.invoiceId}`);
          break;
        case 'explicar_con_ia':
          setSelectedMatch(match);
          setShowExplicarIA(true);
          break;
        case 'ajustar':
          setSelectedMatch(match);
          setShowAjustar(true);
          break;
        case 'aprobar_excepcion':
          setSelectedMatch(match);
          setShowAprobarExcepcion(true);
          break;
        case 'disputar':
          setSelectedMatch(match);
          setShowDisputar(true);
          break;
        case 'bloquear_contabilizacion':
          setSelectedMatch(match);
          setShowBloquear(true);
          break;
        case 'desbloquear':
          setSelectedMatch(match);
          setShowDesbloquear(true);
          break;
        case 'run_3wm_bulk':
          toast.success("3WM masivo ejecutado - 5 facturas procesadas");
          break;
        case 'explicar_bulk':
          toast.success("Explicaciones IA generadas para 3 mismatches");
          break;
        default:
          toast.success(`Acción ${actionId} ejecutada para ${match.invoiceId}`);
      }
      setExecutingAction(null);
    };

    const getResultadoConfig = (resultado) => {
      const configs = {
        MATCHED: { label: "MATCHED", bg: "bg-green-100", text: "text-green-800" },
        PARTIAL: { label: "PARTIAL", bg: "bg-yellow-100", text: "text-yellow-800" },
        MISMATCH: { label: "MISMATCH", bg: "bg-red-100", text: "text-red-800" }
      };
      return configs[resultado] || configs.MISMATCH;
    };

    const getMotivoConfig = (motivo) => {
      const configs = {
        precio: { label: "Precio", bg: "bg-yellow-100", text: "text-yellow-800" },
        cantidad: { label: "Cantidad", bg: "bg-yellow-100", text: "text-yellow-800" },
        impuestos: { label: "Impuestos", bg: "bg-blue-100", text: "text-blue-800" },
        fx: { label: "FX", bg: "bg-blue-100", text: "text-blue-800" },
        otros: { label: "Otros", bg: "bg-gray-100", text: "text-gray-800" }
      };
      return configs[motivo] || configs.otros;
    };

    const getEstadoFacturaConfig = (estado) => {
      const configs = {
        blocked: { label: "Bloqueada", bg: "bg-red-100", text: "text-red-800" },
        validated: { label: "Validada", bg: "bg-blue-100", text: "text-blue-800" },
        paid: { label: "Pagada", bg: "bg-green-100", text: "text-green-800" }
      };
      return configs[estado] || configs.validated;
    };

    return (
      <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {/* View Toggle por Resultado */}
        <div className="flex justify-between items-center">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <Button
              size="sm"
              onClick={() => setConciliacionView('MISMATCH')}
              style={{
                backgroundColor: conciliacionView === 'MISMATCH' ? '#DB2142' : 'transparent',
                color: conciliacionView === 'MISMATCH' ? 'white' : '#6B7280',
                borderRadius: '8px'
              }}
            >
              MISMATCH
            </Button>
            <Button
              size="sm"
              onClick={() => setConciliacionView('PARTIAL')}
              style={{
                backgroundColor: conciliacionView === 'PARTIAL' ? '#FFC857' : 'transparent',
                color: conciliacionView === 'PARTIAL' ? 'white' : '#6B7280',
                borderRadius: '8px'
              }}
            >
              PARTIAL
            </Button>
            <Button
              size="sm"
              onClick={() => setConciliacionView('MATCHED')}
              style={{
                backgroundColor: conciliacionView === 'MATCHED' ? '#00A878' : 'transparent',
                color: conciliacionView === 'MATCHED' ? 'white' : '#6B7280',
                borderRadius: '8px'
              }}
            >
              MATCHED
            </Button>
            <Button
              size="sm"
              onClick={() => setConciliacionView('ALL')}
              style={{
                backgroundColor: conciliacionView === 'ALL' ? '#4472C4' : 'transparent',
                color: conciliacionView === 'ALL' ? 'white' : '#6B7280',
                borderRadius: '8px'
              }}
            >
              TODAS
            </Button>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => executeConciliacionAction('run_3wm_bulk')}
              disabled={executingAction === 'run_3wm_bulk'}
              style={{ backgroundColor: '#4472C4', color: 'white' }}
              className="hover:bg-[#3461B3]"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {executingAction === 'run_3wm_bulk' ? 'Ejecutando...' : 'Ejecutar 3WM'}
            </Button>
            <Button
              onClick={() => executeConciliacionAction('explicar_bulk')}
              disabled={executingAction === 'explicar_bulk'}
              variant="outline"
            >
              <Zap className="w-4 h-4 mr-2" />
              {executingAction === 'explicar_bulk' ? 'Explicando...' : 'Explicar con IA'}
            </Button>
          </div>
        </div>

        {/* Simuladores Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Simulador de Tolerancias 3WM</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Ajusta tolerancias para cantidad, precio e impuestos y simula resultados.</p>
              <Button
                onClick={() => setShowToleranciasSim(true)}
                variant="outline"
                className="w-full"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Probar Tolerancias
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">¿Qué pasa si ajusto el precio?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Simula el impacto de ajustar precios en las diferencias detectadas.</p>
              <Button
                onClick={() => setShowPrecioSim(true)}
                variant="outline"
                className="w-full"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Simular Ajuste
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabla Principal de 3WM */}
        <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-[18px] font-semibold">
                Conciliación 3-Way Match - {conciliacionView === 'ALL' ? 'Todas' : conciliacionView}
              </CardTitle>
              <div className="flex gap-2">
                <Badge className="bg-red-100 text-red-800">{matchingData.filter(m => m.resultado === 'MISMATCH').length} MISMATCH</Badge>
                <Badge className="bg-yellow-100 text-yellow-800">{matchingData.filter(m => m.resultado === 'PARTIAL').length} PARTIAL</Badge>
                <Badge className="bg-green-100 text-green-800">{matchingData.filter(m => m.resultado === 'MATCHED').length} MATCHED</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Factura</TableHead>
                  <TableHead>PO</TableHead>
                  <TableHead>GR</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Qty PO</TableHead>
                  <TableHead>Qty GR</TableHead>
                  <TableHead>Qty INV</TableHead>
                  <TableHead>% Diff Qty</TableHead>
                  <TableHead>Precio PO</TableHead>
                  <TableHead>Precio INV</TableHead>
                  <TableHead>% Diff Precio</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Estado Factura</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMatches.map((match, index) => {
                  const resultadoConfig = getResultadoConfig(match.resultado);
                  const motivoConfig = getMotivoConfig(match.motivo);
                  const estadoConfig = getEstadoFacturaConfig(match.estadoFactura);

                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <Link
                          to={createPageUrl("Finanzas") + "?tab=facturas&número=" + match.invoiceId}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {match.invoiceId}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link className="text-blue-600 hover:underline">{match.poId}</Link>
                      </TableCell>
                      <TableCell>
                        <Link className="text-blue-600 hover:underline">{match.grId}</Link>
                      </TableCell>
                      <TableCell className="font-medium">{match.sku}</TableCell>
                      <TableCell>{match.qtyPO}</TableCell>
                      <TableCell>{match.qtyGR}</TableCell>
                      <TableCell>{match.qtyINV}</TableCell>
                      <TableCell>
                        <span className={Math.abs(match.pctDiffQty) > 0 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                          {match.pctDiffQty > 0 ? '+' : ''}{match.pctDiffQty.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>€{match.precioPO.toFixed(2)}</TableCell>
                      <TableCell>€{match.precioINV.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={Math.abs(match.pctDiffPrecio) > 0 ? 'text-red-600 font-bold' : 'text-gray-600'}>
                          {match.pctDiffPrecio > 0 ? '+' : ''}{match.pctDiffPrecio.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${motivoConfig.bg} ${motivoConfig.text}`}>
                          {motivoConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${estadoConfig.bg} ${estadoConfig.text}`}>
                          {estadoConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${resultadoConfig.bg} ${resultadoConfig.text}`}>
                          {resultadoConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{match.owner}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => executeConciliacionAction('explicar_con_ia', match)}
                            title="Explicar con IA"
                          >
                            <Zap className="w-4 h-4" />
                          </Button>
                          {match.resultado !== 'MATCHED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => executeConciliacionAction('ajustar', match)}
                              title="Ajustar valores"
                            >
                              <Calculator className="w-4 h-4" />
                            </Button>
                          )}
                          {match.estadoFactura === 'blocked' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => executeConciliacionAction('aprobar_excepcion', match)}
                              title="Aprobar excepción"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => executeConciliacionAction('disputar', match)}
                            title="Abrir disputa"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal Explicar con IA */}
        <Dialog open={showExplicarIA} onOpenChange={setShowExplicarIA}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Explicación IA - {selectedMatch?.invoiceId}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Análisis IA de Diferencias</h4>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-blue-700">
                    <strong>Diferencia detectada:</strong> Precio unitario en factura (€{selectedMatch?.precioINV}) supera PO (€{selectedMatch?.precioPO}) en {selectedMatch?.pctDiffPrecio}%.
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>Causa probable:</strong> Ajuste de precio acordado verbalmente pero no reflejado en PO. El proveedor {selectedMatch?.invoiceId?.includes('002') ? 'ABC SA' : 'Genérico'} aplicó incremento estacional del 2.5%.
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>Recomendación:</strong> Validar con comprador original. Si correcto, aprobar excepción. Si incorrecto, disputar con proveedor.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowExplicarIA(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Ajustar Valores */}
        <Dialog open={showAjustar} onOpenChange={setShowAjustar}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajustar Valores - {selectedMatch?.invoiceId}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nivel</Label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="PO">PO</option>
                    <option value="Factura">Factura</option>
                  </select>
                </div>
                <div>
                  <Label>Campo</Label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="precio">Precio</option>
                    <option value="cantidad">Cantidad</option>
                    <option value="impuestos">Impuestos</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Valor nuevo *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  defaultValue={selectedMatch?.precioINV}
                />
              </div>

              <div>
                <Label>Motivo del ajuste *</Label>
                <Input placeholder="Explicar razón del cambio" />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAjustar(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowAjustar(false);
                    toast.success(`Valores ajustados para ${selectedMatch?.invoiceId} - Reintentando 3WM`);
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Aplicar Ajuste
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Aprobar Excepción */}
        <Dialog open={showAprobarExcepcion} onOpenChange={setShowAprobarExcepcion}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aprobar Excepción - {selectedMatch?.invoiceId}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Resumen de Excepción</h4>
                <div className="space-y-1">
                  <p className="text-sm text-yellow-700">Monto total en disputa: €{((selectedMatch?.precioINV || 0) - (selectedMatch?.precioPO || 0)) * (selectedMatch?.qtyINV || 0)}</p>
                  <p className="text-sm text-yellow-700">% sobre tolerancia: {Math.abs(selectedMatch?.pctDiffPrecio || 0) - 1.0}% (límite: 1.0%)</p>
                </div>
              </div>

              <div>
                <Label>Justificación *</Label>
                <textarea
                  className="w-full p-3 border rounded-lg min-h-[100px]"
                  placeholder="Explicar por qué se aprueba esta excepción..."
                />
              </div>

              <div>
                <Label>Aprobador *</Label>
                <select className="w-full p-2 border rounded-lg">
                  <option value="">Seleccionar aprobador</option>
                  <option value="u-cfo">CFO - Ana García</option>
                  <option value="u-controller">Controller - Mario López</option>
                  <option value="u-compras">Dir. Compras - Carlos Ruiz</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAprobarExcepcion(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowAprobarExcepcion(false);
                    toast.success(`Excepción aprobada para ${selectedMatch?.invoiceId} - Factura desbloqueada`);
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Aprobar Excepción
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Disputar */}
        <Dialog open={showDisputar} onOpenChange={setShowDisputar}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Abrir Disputa con Proveedor - {selectedMatch?.invoiceId}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Proveedor</Label>
                <Input
                  value={selectedMatch?.invoiceId?.includes('002') ? 'Proveedor ABC SA' : 'Proveedor Genérico'}
                  readOnly
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Label>Mensaje *</Label>
                <textarea
                  className="w-full p-3 border rounded-lg min-h-[120px]"
                  placeholder="Estimado proveedor, hemos detectado diferencias en su factura vs nuestra orden de compra..."
                  defaultValue={`Estimado proveedor, hemos detectado diferencias en su factura ${selectedMatch?.invoiceId} vs PO ${selectedMatch?.poId}:\n\n- Precio unitario facturado: €${selectedMatch?.precioINV}\n- Precio unitario PO: €${selectedMatch?.precioPO}\n- Diferencia: ${selectedMatch?.pctDiffPrecio}%\n\nFavor revisar y confirmar.`}
                />
              </div>

              <div>
                <Label>Adjunto (opcional)</Label>
                <Input type="file" />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDisputar(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowDisputar(false);
                    toast.success(`Disputa abierta con proveedor - Caso creado y notificado`);
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Abrir Disputa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Bloquear Contabilización */}
        <Dialog open={showBloquear} onOpenChange={setShowBloquear}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bloquear Contabilización - {selectedMatch?.invoiceId}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h4 className="font-semibold text-red-800">⚠️ Bloqueo Manual</h4>
                </div>
                <p className="text-sm text-red-700 mt-2">
                  Esta acción impedirá que la factura se contabilice hasta resolver.
                </p>
              </div>

              <div>
                <Label>Motivo *</Label>
                <Input placeholder="Razón del bloqueo manual" />
              </div>

              <div>
                <Label>Responsable de resolver</Label>
                <select className="w-full p-2 border rounded-lg">
                  <option value="u-compras">Dir. Compras</option>
                  <option value="u-controller">Controller</option>
                  <option value="u-proveedor">Proveedor</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowBloquear(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowBloquear(false);
                    toast.success(`Contabilización bloqueada para ${selectedMatch?.invoiceId}`);
                  }}
                  style={{ backgroundColor: '#DB2142', color: 'white' }}
                  className="hover:bg-red-700"
                >
                  Bloquear
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Desbloquear */}
        <Dialog open={showDesbloquear} onOpenChange={setShowDesbloquear}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Desbloquear Contabilización - {selectedMatch?.invoiceId}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Resolución Confirmada</h4>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  La factura será desbloqueada y podrá contabilizarse normalmente.
                </p>
              </div>

              <div>
                <Label>Motivo de resolución *</Label>
                <textarea
                  className="w-full p-3 border rounded-lg min-h-[80px]"
                  placeholder="Explicar cómo se resolvió la diferencia..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDesbloquear(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowDesbloquear(false);
                    toast.success(`Factura ${selectedMatch?.invoiceId} desbloqueada - Lista para contabilización`);
                  }}
                  style={{ backgroundColor: '#00A878', color: 'white' }}
                  className="hover:bg-green-700"
                >
                  Desbloquear
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Simulador Tolerancias */}
        <Dialog open={showToleranciasSim} onOpenChange={setShowToleranciasSim}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Simulador de Tolerancias 3WM</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-sm text-gray-600">Ajusta tolerancias para 3-Way Matching y simula resultados.</p>

              <div className="space-y-4">
                <div>
                  <Label>Tolerancia Cantidad (%): 2.0%</Label>
                  <Slider
                    defaultValue={[2.0]}
                    max={10}
                    min={0}
                    step={0.5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Tolerancia Precio (%): 1.0%</Label>
                  <Slider
                    defaultValue={[1.0]}
                    max={5}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Tolerancia Impuestos (%): 0.5%</Label>
                  <Slider
                    defaultValue={[0.5]}
                    max={2}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Simulación de Resultados</h4>
                <p className="text-sm text-blue-700">
                  Con estas tolerancias: INV-AP-002 seguiría como MISMATCH (diferencia precio 2.5% mayor a 1.0%)
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowToleranciasSim(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowToleranciasSim(false);
                    toast.success("Tolerancias 3WM actualizadas - Reprocesando facturas afectadas");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Aplicar Tolerancias
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Simulador ¿Qué pasa si ajusto precio? */}
        <Dialog open={showPrecioSim} onOpenChange={setShowPrecioSim}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Qué pasa si ajusto el precio? - {selectedMatch?.sku}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-sm text-gray-600">Simula el impacto de ajustar el precio unitario.</p>

              <div className="space-y-4">
                <div>
                  <Label>Nuevo precio (€): 20.00</Label>
                  <Slider
                    defaultValue={[20.0]}
                    max={50}
                    min={1}
                    step={0.01}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Simulación de Impacto</h4>
                <div className="space-y-1">
                  <p className="text-sm text-green-700">% Diff precio simulado: 0.0%</p>
                  <p className="text-sm text-green-700">Dentro/Fuera tolerancia: <strong>DENTRO</strong></p>
                  <p className="text-sm text-green-700">Resultado esperado: MATCHED</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowPrecioSim(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowPrecioSim(false);
                    setShowAjustar(true);
                    toast.success("Simulación completada - Abriendo formulario de ajuste");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Aplicar Ajuste
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // NUEVA FUNCIÓN RENDERIZAR PRESUPUESTOS SEGÚN JSON SPEC COMPLETA
  const renderPresupuestos = () => {
    // Seeds data según JSON spec
    const budgetsData = [
      {
        id: "BUD-2025-ALM01-OPEX",
        tipo: "OPEX",
        centro_costo: "ALM01",
        año_fiscal: 2025,
        moneda: "EUR",
        presupuesto_total: 144000,
        comprometido_total: 10500,
        gastado_total: 7750,
        variación_pct: -5.4,
        estado: "proposed",
        owner: "Ana García"
      },
      {
        id: "BUD-2025-TMS-COGS",
        tipo: "COGS",
        centro_costo: "TMS",
        año_fiscal: 2025,
        moneda: "EUR",
        presupuesto_total: 577000,
        comprometido_total: 91500,
        gastado_total: 60500,
        variación_pct: 12.3,
        estado: "approved",
        owner: "CFO"
      },
      {
        id: "BUD-2025-ADM01-OPEX",
        tipo: "OPEX",
        centro_costo: "ADM01",
        año_fiscal: 2025,
        moneda: "EUR",
        presupuesto_total: 96000,
        comprometido_total: 24000,
        gastado_total: 25200,
        variación_pct: 4.8,
        estado: "approved",
        owner: "Mario López"
      }
    ];

    const executePresupuestosAction = async (actionId, budget) => {
      setExecutingAction(actionId);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 800));

      switch(actionId) {
        case 'ver_detalle':
          setSelectedBudget(budget);
          setPresupuestosView('cockpit');
          break;
        case 'editar_lineas':
          setSelectedBudget(budget);
          setShowEditarLineas(true);
          break;
        case 'comentar':
          setSelectedBudget(budget);
          setShowComentar(true);
          break;
        case 'notificar_owner':
          setSelectedBudget(budget);
          setShowNotificarOwner(true);
          break;
        case 'aprobar':
          setSelectedBudget(budget);
          setShowAprobar(true);
          break;
        case 'congelar':
          setSelectedBudget(budget);
          setShowCongelar(true);
          break;
        case 'reforecast':
          setSelectedBudget(budget);
          setShowReforecast(true);
          break;
        case 'transferir':
          setSelectedBudget(budget);
          setShowTransferir(true);
          break;
        case 'archivar':
          setSelectedBudget(budget);
          setShowArchivar(true);
          break;
        case 'approve_bulk':
          toast.success("3 presupuestos aprobados en lote");
          break;
        case 'export_csv':
          toast.success("Presupuestos exportados a CSV");
          break;
        default:
          toast.success(`Acción ${actionId} ejecutada para ${budget.id}`);
      }
      setExecutingAction(null);
    };

    const getTipoConfig = (tipo) => {
      const configs = {
        OPEX: { label: "OPEX", bg: "bg-blue-100", text: "text-blue-800" },
        CAPEX: { label: "CAPEX", bg: "bg-purple-100", text: "text-purple-800" },
        COGS: { label: "COGS", bg: "bg-orange-100", text: "text-orange-800" },
        REVENUE: { label: "REVENUE", bg: "bg-green-100", text: "text-green-800" }
      };
      return configs[tipo] || configs.OPEX;
    };

    const getEstadoConfig = (estado) => {
      const configs = {
        draft: { label: "Borrador", bg: "bg-gray-100", text: "text-gray-800" },
        proposed: { label: "Propuesto", bg: "bg-blue-100", text: "text-blue-800" },
        approved: { label: "Aprobado", bg: "bg-green-100", text: "text-green-800" },
        frozen: { label: "Congelado", bg: "bg-yellow-100", text: "text-yellow-800" },
        archived: { label: "Archivado", bg: "bg-gray-100", text: "text-gray-800" }
      };
      return configs[estado] || configs.draft;
    };

    const getVariacionColor = (pct) => {
      if (Math.abs(pct) <= 5) return 'text-green-600';
      if (Math.abs(pct) <= 10) return 'text-yellow-600';
      return 'text-red-600';
    };

    return (
      <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {/* View Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <Button
              size="sm"
              onClick={() => setPresupuestosView('list')}
              style={{
                backgroundColor: presupuestosView === 'list' ? '#4472C4' : 'transparent',
                color: presupuestosView === 'list' ? 'white' : '#6B7280',
                borderRadius: '8px'
              }}
            >
              Lista
            </Button>
            <Button
              size="sm"
              onClick={() => setPresupuestosView('cockpit')}
              style={{
                backgroundColor: presupuestosView === 'cockpit' ? '#4472C4' : 'transparent',
                color: presupuestosView === 'cockpit' ? 'white' : '#6B7280',
                borderRadius: '8px'
              }}
            >
              Cockpit
            </Button>
            <Button
              size="sm"
              onClick={() => setPresupuestosView('gridMensual')}
              style={{
                backgroundColor: presupuestosView === 'gridMensual' ? '#4472C4' : 'transparent',
                color: presupuestosView === 'gridMensual' ? 'white' : '#6B7280',
                borderRadius: '8px'
              }}
            >
              Grid Mensual
            </Button>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowNewBudget(true)}
              style={{ backgroundColor: '#4472C4', color: 'white' }}
              className="hover:bg-[#3461B3]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Presupuesto
            </Button>
            <Button
              onClick={() => setShowImportCSV(true)}
              variant="outline"
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Importar CSV
            </Button>
          </div>
        </div>

        {/* Simuladores Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">What-if de Presupuesto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Ajusta % globalmente y por centro para simular nuevos escenarios.</p>
              <Button
                onClick={() => setShowWhatIfSim(true)}
                variant="outline"
                className="w-full"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Simular
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Impacto de Headcount (OPEX)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Calcula impacto de nuevas contrataciones en presupuesto OPEX.</p>
              <Button
                onClick={() => setShowHeadcountSim(true)}
                variant="outline"
                className="w-full"
              >
                <Users className="w-4 h-4 mr-2" />
                Calcular
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Shock de Combustible (TMS → COGS)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Simula impacto de variación del combustible en costes TMS.</p>
              <Button
                onClick={() => setShowFuelShockSim(true)}
                variant="outline"
                className="w-full"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Aplicar Shock
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Vista Lista */}
        {presupuestosView === 'list' && (
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[18px] font-semibold">Lista de Presupuestos FY2025</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => executePresupuestosAction('approve_bulk')}
                    disabled={executingAction === 'approve_bulk'}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {executingAction === 'approve_bulk' ? 'Aprobando...' : 'Aprobar Lote'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => executePresupuestosAction('export_csv')}
                    disabled={executingAction === 'export_csv'}
                  >
                    <ArrowDownRight className="w-4 h-4 mr-2" />
                    {executingAction === 'export_csv' ? 'Exportando...' : 'Exportar CSV'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Presupuesto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Centro Costo</TableHead>
                    <TableHead>Año Fiscal</TableHead>
                    <TableHead>Moneda</TableHead>
                    <TableHead>Presupuesto Total</TableHead>
                    <TableHead>Comprometido</TableHead>
                    <TableHead>Gastado</TableHead>
                    <TableHead>Variación %</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetsData.map((budget) => {
                    const tipoConfig = getTipoConfig(budget.tipo);
                    const estadoConfig = getEstadoConfig(budget.estado);

                    return (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">{budget.id}</TableCell>
                        <TableCell>
                          <Badge className={`${tipoConfig.bg} ${tipoConfig.text}`}>
                            {tipoConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{budget.centro_costo}</TableCell>
                        <TableCell>{budget.año_fiscal}</TableCell>
                        <TableCell>{budget.moneda}</TableCell>
                        <TableCell className="font-medium">€{budget.presupuesto_total.toLocaleString('es-ES')}</TableCell>
                        <TableCell>€{budget.comprometido_total.toLocaleString('es-ES')}</TableCell>
                        <TableCell>€{budget.gastado_total.toLocaleString('es-ES')}</TableCell>
                        <TableCell>
                          <span className={`font-bold ${getVariacionColor(budget.variación_pct)}`}>
                            {budget.variación_pct > 0 ? '+' : ''}{budget.variación_pct.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${estadoConfig.bg} ${estadoConfig.text}`}>
                            {estadoConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{budget.owner}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => executePresupuestosAction('ver_detalle', budget)}
                              title="Ver detalle"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => executePresupuestosAction('editar_lineas', budget)}
                              title="Editar líneas"
                            >
                              <Calculator className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => executePresupuestosAction('comentar', budget)}
                              title="Comentar"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => executePresupuestosAction('aprobar', budget)}
                              title="Aprobar"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
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

        {/* Vista Cockpit */}
        {presupuestosView === 'cockpit' && selectedBudget && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedBudget.id}</h2>
                <p className="text-sm text-gray-600">{selectedBudget.centro_costo} - {selectedBudget.tipo}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setPresupuestosView('list')}
              >
                Volver a Lista
              </Button>
            </div>

            {/* KPIs del Presupuesto */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <KPICard
                title="Presupuesto Total"
                value={selectedBudget.presupuesto_total}
                format="currency"
                unit="€"
                icon={Target}
                color="bg-blue-500"
              />
              <KPICard
                title="Comprometido"
                value={selectedBudget.comprometido_total}
                format="currency"
                unit="€"
                icon={Clock}
                color="bg-yellow-500"
              />
              <KPICard
                title="Gastado"
                value={selectedBudget.gastado_total}
                format="currency"
                unit="€"
                icon={DollarSign}
                color="bg-green-500"
              />
              <KPICard
                title="Variación %"
                value={selectedBudget.variación_pct}
                format="percent"
                icon={TrendingUp}
                color="bg-red-500"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
                <CardHeader>
                  <CardTitle className="text-[18px] font-semibold">Variación Mensual (%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">Gráfico de variación por mes</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
                <CardHeader>
                  <CardTitle className="text-[18px] font-semibold">Burn Rate vs Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">Gráfico de burn rate</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Vista Grid Mensual */}
        {presupuestosView === 'gridMensual' && (
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[18px] font-semibold">Grid Mensual FY2025</CardTitle>
              <p className="text-sm text-gray-600">Vista consolidada por períodos mensuales</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Centro/Tipo</TableHead>
                      <TableHead>Ene 25</TableHead>
                      <TableHead>Feb 25</TableHead>
                      <TableHead>Mar 25</TableHead>
                      <TableHead>Abr 25</TableHead>
                      <TableHead>May 25</TableHead>
                      <TableHead>Jun 25</TableHead>
                      <TableHead>Jul 25</TableHead>
                      <TableHead>Ago 25</TableHead>
                      <TableHead>Sep 25</TableHead>
                      <TableHead>Oct 25</TableHead>
                      <TableHead>Nov 25</TableHead>
                      <TableHead>Dic 25</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgetsData.map((budget) => (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">
                          {budget.centro_costo}/{budget.tipo}
                        </TableCell>
                        <TableCell>€12,000</TableCell>
                        <TableCell>€12,000</TableCell>
                        <TableCell>€12,000</TableCell>
                        <TableCell>€12,000</TableCell>
                        <TableCell>€12,000</TableCell>
                        <TableCell>€12,000</TableCell>
                        <TableCell>€12,000</TableCell>
                        <TableCell>€12,000</TableCell>
                        <TableCell>€12,000</TableCell>
                        <TableCell>€12,000</TableCell>
                        <TableCell>€12,000</TableCell>
                        <TableCell className="font-bold">€{budget.presupuesto_total.toLocaleString('es-ES')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal Nuevo Presupuesto */}
        <Dialog open={showNewBudget} onOpenChange={setShowNewBudget}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nuevo Presupuesto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo *</Label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="OPEX">OPEX</option>
                    <option value="CAPEX">CAPEX</option>
                    <option value="COGS">COGS</option>
                    <option value="REVENUE">REVENUE</option>
                  </select>
                </div>
                <div>
                  <Label>Centro de Costo *</Label>
                  <Input placeholder="ALM01, TMS, ADM01..." />
                </div>
                <div>
                  <Label>Año Fiscal *</Label>
                  <Input type="number" defaultValue={2025} />
                </div>
                <div>
                  <Label>Moneda *</Label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="BRL">BRL</option>
                    <option value="ARS">ARS</option>
                  </select>
                </div>
                <div>
                  <Label>Owner *</Label>
                  <Input placeholder="Responsable del presupuesto" />
                </div>
                <div>
                  <Label>Método Distribución</Label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="igual">Distribución igual</option>
                    <option value="prorrata">Prorrata histórica</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Importe Anual *</Label>
                <Input type="number" placeholder="0.00" />
              </div>

              <div>
                <Label>Nota (opcional)</Label>
                <Input placeholder="Comentarios adicionales" />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowNewBudget(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowNewBudget(false);
                    toast.success("Presupuesto creado - Abriendo editor de líneas mensuales");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Crear
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Importar CSV */}
        <Dialog open={showImportCSV} onOpenChange={setShowImportCSV}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Importar CSV de Presupuesto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Archivo CSV *</Label>
                <Input type="file" accept=".csv" />
              </div>

              <div>
                <Label>Mapeo de Columnas</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label className="text-xs">Período</Label>
                    <Input placeholder="Ej: periodo" />
                  </div>
                  <div>
                    <Label className="text-xs">Presupuesto</Label>
                    <Input placeholder="Ej: presupuesto" />
                  </div>
                  <div>
                    <Label className="text-xs">Centro Costo</Label>
                    <Input placeholder="Ej: centro_costo" />
                  </div>
                  <div>
                    <Label className="text-xs">Tipo</Label>
                    <Input placeholder="Ej: tipo" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowImportCSV(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowImportCSV(false);
                    toast.success("CSV importado - 24 líneas de presupuesto procesadas");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Importar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Editar Líneas */}
        <Dialog open={showEditarLineas} onOpenChange={setShowEditarLineas}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Editar Líneas Mensuales - {selectedBudget?.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Presupuesto</TableHead>
                    <TableHead>Comprometido</TableHead>
                    <TableHead>Gastado</TableHead>
                    <TableHead>Comentario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'].map((period) => (
                    <TableRow key={period}>
                      <TableCell className="font-medium">{period}</TableCell>
                      <TableCell>
                        <Input type="number" defaultValue="12000" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" defaultValue="3000" readOnly className="bg-gray-50" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" defaultValue="2800" readOnly className="bg-gray-50" />
                      </TableCell>
                      <TableCell>
                        <Input placeholder="Comentario opcional" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEditarLineas(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowEditarLineas(false);
                    toast.success(`Líneas actualizadas para ${selectedBudget?.id}`);
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Comentar */}
        <Dialog open={showComentar} onOpenChange={setShowComentar}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Comentar Presupuesto - {selectedBudget?.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Comentario *</Label>
                <textarea
                  className="w-full p-3 border rounded-lg min-h-[100px]"
                  placeholder="Escribe tu comentario aquí..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowComentar(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowComentar(false);
                    toast.success(`Comentario añadido a ${selectedBudget?.id}`);
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Añadir Comentario
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Notificar Owner */}
        <Dialog open={showNotificarOwner} onOpenChange={setShowNotificarOwner}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notificar a Owner - {selectedBudget?.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Enviar notificación a {selectedBudget?.owner || 'el propietario'} sobre el estado del presupuesto.</p>
              <div>
                <Label>Mensaje adicional (opcional)</Label>
                <textarea
                  className="w-full p-3 border rounded-lg min-h-[80px]"
                  placeholder="Escribe un mensaje..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowNotificarOwner(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowNotificarOwner(false);
                    toast.success(`Notificación enviada a ${selectedBudget?.owner}`);
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Enviar Notificación
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Aprobar */}
        <Dialog open={showAprobar} onOpenChange={setShowAprobar}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aprobar Presupuesto - {selectedBudget?.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Aprobador *</Label>
                <select className="w-full p-2 border rounded-lg">
                  <option value="">Seleccionar aprobador</option>
                  <option value="u-cfo">CFO - Ana García</option>
                  <option value="u-controller">Controller - Mario López</option>
                  <option value="u-director">Director - Carlos Ruiz</option>
                </select>
              </div>

              <div>
                <Label>Comentario (opcional)</Label>
                <Input placeholder="Comentarios sobre la aprobación" />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAprobar(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowAprobar(false);
                    toast.success(`Presupuesto ${selectedBudget?.id} aprobado correctamente`);
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Aprobar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Congelar */}
        <Dialog open={showCongelar} onOpenChange={setShowCongelar}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Congelar Presupuesto - {selectedBudget?.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">¿Estás seguro que deseas congelar este presupuesto? No se podrán realizar más modificaciones directas.</p>
              <div>
                <Label>Razón para congelar *</Label>
                <Input placeholder="Ej. Presupuesto finalizado, no más cambios" />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCongelar(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowCongelar(false);
                    toast.success(`Presupuesto ${selectedBudget?.id} congelado`);
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Congelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Reforecast */}
        <Dialog open={showReforecast} onOpenChange={setShowReforecast}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Reforecast - {selectedBudget?.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Motivo *</Label>
                <Input placeholder="Explicar por qué se necesita reforecast" />
              </div>

              <div>
                <Label>Metodología</Label>
                <select className="w-full p-2 border rounded-lg">
                  <option value="copiar_presupuesto">Copiar presupuesto actual</option>
                  <option value="desde_real">Partir de datos reales</option>
                  <option value="desde_cero">Desde cero</option>
                </select>
              </div>

              <div>
                <Label>Escenario</Label>
                <select className="w-full p-2 border rounded-lg">
                  <option value="ventas±10">Ventas ±10%</option>
                  <option value="DSO+5">DSO +5 días</option>
                  <option value="costo_transporte+8">Costo transporte +8%</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <Label>Ajuste % Global</Label>
                <Input type="number" placeholder="0" />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowReforecast(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowReforecast(false);
                    toast.success(`Reforecast creado para ${selectedBudget?.id}`);
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Crear Reforecast
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Transferir */}
        <Dialog open={showTransferir} onOpenChange={setShowTransferir}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transferir entre Centros de Costo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Desde CC *</Label>
                  <Input placeholder="ALM01" />
                </div>
                <div>
                  <Label>A CC *</Label>
                  <Input placeholder="TMS" />
                </div>
                <div>
                  <Label>Período *</Label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="2025-09">Sep 2025</option>
                    <option value="2025-10">Oct 2025</option>
                    <option value="2025-11">Nov 2025</option>
                    <option value="2025-12">Dic 2025</option>
                  </select>
                </div>
                <div>
                  <Label>Importe *</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
              </div>

              <div>
                <Label>Motivo *</Label>
                <Input placeholder="Explicar razón de la transferencia" />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowTransferir(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowTransferir(false);
                    toast.success("Transferencia registrada entre centros de costo");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Transferir
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Archivar */}
        <Dialog open={showArchivar} onOpenChange={setShowArchivar}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Archivar Presupuesto - {selectedBudget?.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Al archivar, este presupuesto ya no aparecerá en las listas activas.</p>
              <div>
                <Label>Razón para archivar (opcional)</Label>
                <Input placeholder="Ej. Año fiscal cerrado" />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowArchivar(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowArchivar(false);
                    toast.success(`Presupuesto ${selectedBudget?.id} archivado`);
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Archivar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Simulador What-if */}
        <Dialog open={showWhatIfSim} onOpenChange={setShowWhatIfSim}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>What-if de Presupuesto</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-sm text-gray-600">Ajusta % globalmente y por centro para simular nuevos escenarios.</p>

              <div className="space-y-4">
                <div>
                  <Label>Ajuste % Global: 0%</Label>
                  <Slider
                    defaultValue={[0]}
                    max={30}
                    min={-20}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Ajuste % Transporte: 0%</Label>
                  <Slider
                    defaultValue={[0]}
                    max={30}
                    min={-20}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Ajuste % Almacén: 0%</Label>
                  <Slider
                    defaultValue={[0]}
                    max={30}
                    min={-20}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Vista Previa del Impacto</h4>
                <p className="text-sm text-blue-700">
                  Presupuesto total ajustado: €721,000 → €721,000 (0% cambio)
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowWhatIfSim(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowWhatIfSim(false);
                    toast.success("Simulación aplicada - Abriendo reforecast");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Simular
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Simulador Headcount */}
        <Dialog open={showHeadcountSim} onOpenChange={setShowHeadcountSim}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Impacto de Headcount (OPEX)</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-sm text-gray-600">Calcula impacto de nuevas contrataciones en presupuesto OPEX.</p>

              <div className="space-y-4">
                <div>
                  <Label>Nuevas Posiciones: 2</Label>
                  <Slider
                    defaultValue={[2]}
                    max={50}
                    min={0}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Costo Mensual por Posición (€): 2,200</Label>
                  <Slider
                    defaultValue={[2200]}
                    max={20000}
                    min={0}
                    step={50}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Mes de Inicio</Label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="2025-04">Abril 2025</option>
                    <option value="2025-05">Mayo 2025</option>
                    <option value="2025-06">Junio 2025</option>
                  </select>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Cálculo de Impacto</h4>
                <div className="space-y-1">
                  <p className="text-sm text-green-700">Incremento OPEX anual: €19,800</p>
                  <p className="text-sm text-green-700">Desde abril: €4,400/mes × 9 meses</p>
                  <p className="text-sm text-green-700">Impacto en variación total: +13.7%</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowHeadcountSim(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowHeadcountSim(false);
                    toast.success("Impacto de headcount calculado - Aplicando a vista previa");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Calcular
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Simulador Shock Combustible */}
        <Dialog open={showFuelShockSim} onOpenChange={setShowFuelShockSim}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Shock de Combustible (TMS → COGS)</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-sm text-gray-600">Simula impacto de variación del combustible en costes TMS.</p>

              <div className="space-y-4">
                <div>
                  <Label>Shock %: 8%</Label>
                  <Slider
                    defaultValue={[8]}
                    max={50}
                    min={-10}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Mes Inicio</Label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="2025-06">Junio 2025</option>
                    <option value="2025-07">Julio 2025</option>
                    <option value="2025-08">Agosto 2025</option>
                  </select>
                </div>

                <div>
                  <Label>Meses Duración: 4</Label>
                  <Slider
                    defaultValue={[4]}
                    max={12}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">Impacto Simulado</h4>
                <div className="space-y-1">
                  <p className="text-sm text-red-700">Incremento COGS: €15,360 (4 meses)</p>
                  <p className="text-sm text-red-700">Impacto en margen: -2.7%</p>
                  <p className="text-sm text-red-700">Centros afectados: TMS, ALM01</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowFuelShockSim(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowFuelShockSim(false);
                    toast.success("Shock de combustible aplicado - Burn rate actualizado");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Aplicar Shock
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // NUEVA FUNCIÓN RENDERIZAR ANALYTICS SEGÚN JSON SPEC COMPLETA
  const renderAnalytics = () => {
    // Seeds data según JSON spec
    const accPnlData = [
      { customerId: "cus-001", customerName: "Cliente Madrid SA", period: "2025-08", currency: "EUR", revenue: 14850, wms_cost: 1220, tms_cost: 2850, comex_buy: 1980, discounts: 250, gross_margin: 10550 },
      { customerId: "cus-002", customerName: "Valencia Logistics SL", period: "2025-08", currency: "EUR", revenue: 9800, wms_cost: 760, tms_cost: 2100, comex_buy: 0, discounts: 120, gross_margin: 6820 }
    ];

    const dealPnlData = [
      { fileId: "COMEX-ES-0007", fileName: "Importación 40HC", period: "2025-08", currency: "EUR", sell_total: 2980, buy_total: 2100, gross_margin: 880 },
      { fileId: "SHIP-001", fileName: "Ruta Madrid–BCN", period: "2025-08", currency: "EUR", sell_total: 650, buy_total: 420, gross_margin: 230 }
    ];

    const routeMarginData = [
      { routeId: "R-MAD-BCN", routeName: "MAD–BCN", period: "2025-08", currency: "EUR", revenue: 12600, distance_km: 12400, cost_total: 8900, cost_per_km: 0.72, gross_margin: 3700 },
      { routeId: "R-MAD-VAL", routeName: "MAD–VAL", period: "2025-08", currency: "EUR", revenue: 8400, distance_km: 7400, cost_total: 5900, cost_per_km: 0.80, gross_margin: 2500 }
    ];

    const bcgData = [
      { customerId: "cus-001", customerName: "Cliente Madrid SA", margin_share: 0.28, revenue_growth_12m: 6.5, ar_open: 21450, segment: "Estrellas" },
      { customerId: "cus-002", customerName: "Valencia Logistics SL", margin_share: 0.12, revenue_growth_12m: -2.0, ar_open: 6400, segment: "Perros" }
    ];

    const wcData = [
      { period: "2025-07", dso: 36.2, dpo: 47.0, dio: 21.5, ccc: 10.7 },
      { period: "2025-08", dso: 34.5, dpo: 48.2, dio: 22.1, ccc: 8.4 }
    ];

    const pnlTrendData = [
      { period: "2025-07", currency: "EUR", revenue: 41500, cogs: 25600, opex: 9800, gmPct: 26.5 },
      { period: "2025-08", currency: "EUR", revenue: 43200, cogs: 26200, opex: 9950, gmPct: 26.9 }
    ];

    const cashflowData = [
      { date: "2025-09-01", net: 120000, pess: 112000, base: 120000, optim: 128000 },
      { date: "2025-09-02", net: 119200, pess: 111500, base: 119200, optim: 127000 },
      { date: "2025-09-03", net: 118500, pess: 111000, base: 118500, optim: 126500 }
    ];

    const executeAnalyticsCTA = async (ctaId, rowData = null) => {
      setExecutingAction(ctaId);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

      switch(ctaId) {
        case 'subir_tarifa':
          toast.success(`Navegando a Facturas AR para ${rowData?.customerName || 'cliente seleccionado'}`);
          break;
        case 'iniciar_dunning':
          toast.success(`Iniciando dunning para ${rowData?.customerName || 'cliente seleccionado'}`);
          break;
        case 'bloquear_credito':
          toast.warning(`Bloqueando crédito para ${rowData?.customerName || 'cliente seleccionado'}`);
          break;
        case 'auditar_cargos':
          toast.info(`Auditando cargos para expediente ${rowData?.fileId || 'seleccionado'}`);
          break;
        case 'emitir_factura':
          toast.success(`Emitiendo factura para expediente ${rowData?.fileId || 'seleccionado'}`);
          break;
        case 'reoptimizar_rutas':
          toast.success("Reoptimizando rutas basado en análisis de margen");
          break;
        case 'start_dunning_from_wc':
          toast.success("Iniciando dunning para top-10 clientes con mayor AR");
          break;
        case 'optimize_dpo_from_wc':
          toast.success("Optimizando programación de pagos para mejorar DPO");
          break;
        case 'plan_de_cuenta':
          toast.info(`Abriendo plan de cuenta para ${rowData?.customerName || 'cliente'}`);
          break;
        case 'ajustar_credito':
          toast.info(`Ajustando límite de crédito para ${rowData?.customerName || 'cliente'}`);
          break;
        default:
          toast.success(`Ejecutando acción: ${ctaId}`);
      }
      setExecutingAction(null);
    };

    const getSegmentColor = (segment) => {
      const colors = {
        'Estrellas': 'bg-green-100 text-green-800',
        'Vacas': 'bg-blue-100 text-blue-800',
        'Interrogantes': 'bg-yellow-100 text-yellow-800',
        'Perros': 'bg-red-100 text-red-800'
      };
      return colors[segment] || 'bg-gray-100 text-gray-800';
    };

    return (
      <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {/* Filtros Globales */}
        <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle className="text-[16px] font-semibold">Filtros Globales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <Label>Desde</Label>
                <Input
                  type="date"
                  value={analyticsFilters.period_from}
                  onChange={(e) => setAnalyticsFilters({...analyticsFilters, period_from: e.target.value})}
                />
              </div>
              <div>
                <Label>Hasta</Label>
                <Input
                  type="date"
                  value={analyticsFilters.period_to}
                  onChange={(e) => setAnalyticsFilters({...analyticsFilters, period_to: e.target.value})}
                />
              </div>
              <div>
                <Label>Moneda</Label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={analyticsFilters.currency}
                  onChange={(e) => setAnalyticsFilters({...analyticsFilters, currency: e.target.value})}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="BRL">BRL</option>
                  <option value="ARS">ARS</option>
                </select>
              </div>
              <div>
                <Label>Cliente (opcional)</Label>
                <Input
                  placeholder="Cliente específico"
                  value={analyticsFilters.customerId}
                  onChange={(e) => setAnalyticsFilters({...analyticsFilters, customerId: e.target.value})}
                />
              </div>
              <div>
                <Label>Expediente/BL (opcional)</Label>
                <Input
                  placeholder="Expediente/BL"
                  value={analyticsFilters.fileId}
                  onChange={(e) => setAnalyticsFilters({...analyticsFilters, fileId: e.target.value})}
                />
              </div>
              <div>
                <Label>Ruta (opcional)</Label>
                <Input
                  placeholder="Ruta específica"
                  value={analyticsFilters.routeId}
                  onChange={(e) => setAnalyticsFilters({...analyticsFilters, routeId: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Simuladores Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">¿Qué pasa si subo precios?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Simula impacto de incrementos de precios en margen y volumen.</p>
              <Button
                onClick={() => setShowPrecioMargenSim(true)}
                variant="outline"
                className="w-full"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Simular
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Impacto de DSO/DPO en Caja</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Ajusta días de cobro y pago para ver efecto en cashflow.</p>
              <Button
                onClick={() => setShowDSODPOSim(true)}
                variant="outline"
                className="w-full"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Aplicar
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Ajustar Umbrales BCG</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Modifica criterios de segmentación de la matriz BCG.</p>
              <Button
                onClick={() => setShowBCGThresholdsSim(true)}
                variant="outline"
                className="w-full"
              >
                <Target className="w-4 h-4 mr-2" />
                Reclasificar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-full overflow-x-auto">
          {[
            { id: 'acc_pnl', label: 'P&L por cuenta' },
            { id: 'deal_pnl', label: 'P&L por negocio' },
            { id: 'route_margin', label: 'Margen por ruta' },
            { id: 'bcg', label: 'BCG de clientes' },
            { id: 'wc', label: 'Working Capital' },
            { id: 'pnl_trend', label: 'P&L mensual' },
            { id: 'cashflow', label: 'Cashflow' }
          ].map((tabItem) => (
            <Button
              key={tabItem.id}
              size="sm"
              onClick={() => setAnalyticsView(tabItem.id)}
              style={{
                backgroundColor: analyticsView === tabItem.id ? '#4472C4' : 'transparent',
                color: analyticsView === tabItem.id ? 'white' : '#6B7280',
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                minWidth: 'fit-content'
              }}
              className="hover:bg-gray-200 transition-colors"
            >
              {tabItem.label}
            </Button>
          ))}
        </div>

        {/* P&L por cuenta */}
        {analyticsView === 'acc_pnl' && (
          <div className="space-y-6">
            <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
              <CardHeader>
                <CardTitle className="text-[18px] font-semibold">Waterfall P&L por Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Gráfico Waterfall - Revenue → GM por componentes</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={() => executeAnalyticsCTA('subir_tarifa', accPnlData[0])}
                    style={{ backgroundColor: '#4472C4', color: 'white' }}
                    disabled={executingAction === 'subir_tarifa'}
                  >
                    {executingAction === 'subir_tarifa' ? 'Procesando...' : 'Subir Tarifa'}
                  </Button>
                  <Button
                    onClick={() => executeAnalyticsCTA('iniciar_dunning', accPnlData[0])}
                    style={{ backgroundColor: '#00A878', color: 'white' }}
                    disabled={executingAction === 'iniciar_dunning'}
                  >
                    {executingAction === 'iniciar_dunning' ? 'Procesando...' : 'Iniciar Dunning'}
                  </Button>
                  <Button
                    onClick={() => executeAnalyticsCTA('bloquear_credito', accPnlData[0])}
                    style={{ backgroundColor: '#DB2142', color: 'white' }}
                    disabled={executingAction === 'bloquear_credito'}
                  >
                    {executingAction === 'bloquear_credito' ? 'Procesando...' : 'Bloquear Crédito'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
              <CardHeader>
                <CardTitle className="text-[18px] font-semibold">Detalle P&L por Cliente y Período</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>WMS Cost</TableHead>
                      <TableHead>TMS Cost</TableHead>
                      <TableHead>COMEX Buy</TableHead>
                      <TableHead>Descuentos</TableHead>
                      <TableHead>Margen Bruto</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accPnlData.map((row) => (
                      <TableRow key={`${row.customerId}-${row.period}`}>
                        <TableCell className="font-medium">{row.customerName}</TableCell>
                        <TableCell>{row.period}</TableCell>
                        <TableCell>€{row.revenue.toLocaleString('es-ES')}</TableCell>
                        <TableCell>€{row.wms_cost.toLocaleString('es-ES')}</TableCell>
                        <TableCell>€{row.tms_cost.toLocaleString('es-ES')}</TableCell>
                        <TableCell>€{row.comex_buy.toLocaleString('es-ES')}</TableCell>
                        <TableCell>€{row.discounts.toLocaleString('es-ES')}</TableCell>
                        <TableCell className="font-bold">€{row.gross_margin.toLocaleString('es-ES')}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => executeAnalyticsCTA('subir_tarifa', row)}
                              title="Subir tarifa"
                            >
                              <TrendingUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => executeAnalyticsCTA('iniciar_dunning', row)}
                              title="Iniciar dunning"
                            >
                              <Bell className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* P&L por negocio */}
        {analyticsView === 'deal_pnl' && (
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[18px] font-semibold">Negocios (expedientes) – P&L</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => executeAnalyticsCTA('auditar_cargos')}
                    style={{ backgroundColor: '#4472C4', color: 'white' }}
                    disabled={executingAction === 'auditar_cargos'}
                  >
                    {executingAction === 'auditar_cargos' ? 'Procesando...' : 'Auditar Cargos'}
                  </Button>
                  <Button
                    onClick={() => executeAnalyticsCTA('emitir_factura')}
                    style={{ backgroundColor: '#00A878', color: 'white' }}
                    disabled={executingAction === 'emitir_factura'}
                  >
                    {executingAction === 'emitir_factura' ? 'Procesando...' : 'Emitir Factura'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expediente ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Venta Total</TableHead>
                    <TableHead>Compra Total</TableHead>
                    <TableHead>Margen Bruto</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dealPnlData.map((row) => (
                    <TableRow key={`${row.fileId}-${row.period}`}>
                      <TableCell className="font-medium">{row.fileId}</TableCell>
                      <TableCell>{row.fileName}</TableCell>
                      <TableCell>{row.period}</TableCell>
                      <TableCell>€{row.sell_total.toLocaleString('es-ES')}</TableCell>
                      <TableCell>€{row.buy_total.toLocaleString('es-ES')}</TableCell>
                      <TableCell className="font-bold">€{row.gross_margin.toLocaleString('es-ES')}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => executeAnalyticsCTA('auditar_cargos', row)}
                            title="Auditar"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => executeAnalyticsCTA('emitir_factura', row)}
                            title="Facturar"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Margen por ruta */}
        {analyticsView === 'route_margin' && (
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[18px] font-semibold">Rentabilidad por Ruta</CardTitle>
                <Button
                  onClick={() => executeAnalyticsCTA('reoptimizar_rutas')}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                  disabled={executingAction === 'reoptimizar_rutas'}
                >
                  {executingAction === 'reoptimizar_rutas' ? 'Procesando...' : 'Reoptimizar Rutas'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-4 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Heatmap - Rentabilidad por ruta x período</p>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ruta ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Distancia (km)</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Costo Total</TableHead>
                    <TableHead>Costo/km</TableHead>
                    <TableHead>Margen Bruto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routeMarginData.map((row) => (
                    <TableRow key={`${row.routeId}-${row.period}`}>
                      <TableCell className="font-medium">{row.routeId}</TableCell>
                      <TableCell>{row.routeName}</TableCell>
                      <TableCell>{row.distance_km.toLocaleString('es-ES')}</TableCell>
                      <TableCell>€{row.revenue.toLocaleString('es-ES')}</TableCell>
                      <TableCell>€{row.cost_total.toLocaleString('es-ES')}</TableCell>
                      <TableCell>€{row.cost_per_km.toFixed(2)}</TableCell>
                      <TableCell className="font-bold">€{row.gross_margin.toLocaleString('es-ES')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* BCG de clientes */}
        {analyticsView === 'bcg' && (
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[18px] font-semibold">Matriz BCG de Clientes</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => executeAnalyticsCTA('plan_de_cuenta')}
                    style={{ backgroundColor: '#4472C4', color: 'white' }}
                    disabled={executingAction === 'plan_de_cuenta'}
                  >
                    {executingAction === 'plan_de_cuenta' ? 'Procesando...' : 'Plan de Cuenta'}
                  </Button>
                  <Button
                    onClick={() => executeAnalyticsCTA('ajustar_credito')}
                    style={{ backgroundColor: '#00A878', color: 'white' }}
                    disabled={executingAction === 'ajustar_credito'}
                  >
                    {executingAction === 'ajustar_credito' ? 'Procesando...' : 'Ajustar Crédito'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-4 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Gráfico Bubble - Crecimiento vs Share de Margen</p>
                  <p className="text-xs">Cuadrantes: Perros | Vacas | Interrogantes | Estrellas</p>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Share Margen</TableHead>
                    <TableHead>Crecimiento 12M</TableHead>
                    <TableHead>AR Abierto</TableHead>
                    <TableHead>Segmento</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bcgData.map((row) => (
                    <TableRow key={row.customerId}>
                      <TableCell className="font-medium">
                        {row.customerName}
                      </TableCell>
                      <TableCell>{(row.margin_share * 100).toFixed(1)}%</TableCell>
                      <TableCell className={row.revenue_growth_12m >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {row.revenue_growth_12m >= 0 ? '+' : ''}{row.revenue_growth_12m.toFixed(1)}%
                      </TableCell>
                      <TableCell>€{row.ar_open.toLocaleString('es-ES')}</TableCell>
                      <TableCell>
                        <Badge className={getSegmentColor(row.segment)}>
                          {row.segment}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => executeAnalyticsCTA('plan_de_cuenta', row)}
                            title="Plan de cuenta"
                          >
                            <Target className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => executeAnalyticsCTA('ajustar_credito', row)}
                            title="Ajustar crédito"
                          >
                            <CreditCard className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Working Capital */}
        {analyticsView === 'wc' && (
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[18px] font-semibold">Ciclo de Conversión de Caja</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => executeAnalyticsCTA('start_dunning_from_wc')}
                    style={{ backgroundColor: '#4472C4', color: 'white' }}
                    disabled={executingAction === 'start_dunning_from_wc'}
                  >
                    {executingAction === 'start_dunning_from_wc' ? 'Procesando...' : 'Cobrar Top-10'}
                  </Button>
                  <Button
                    onClick={() => executeAnalyticsCTA('optimize_dpo_from_wc')}
                    style={{ backgroundColor: '#00A878', color: 'white' }}
                    disabled={executingAction === 'optimize_dpo_from_wc'}
                  >
                    {executingAction === 'optimize_dpo_from_wc' ? 'Procesando...' : 'Optimizar Pagos'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-blue-50 border border-blue-200">
                  <CardHeader className="p-4">
                    <CardTitle className="text-[14px] font-semibold text-blue-800">DSO (días)</CardTitle>
                    <p className="text-[24px] font-bold text-blue-900">34.5</p>
                    <p className="text-xs text-blue-600">-1.7 días vs anterior</p>
                  </CardHeader>
                </Card>
                <Card className="bg-purple-50 border border-purple-200">
                  <CardHeader className="p-4">
                    <CardTitle className="text-[14px] font-semibold text-purple-800">DPO (días)</CardTitle>
                    <p className="text-[24px] font-bold text-purple-900">48.2</p>
                    <p className="text-xs text-purple-600">+1.2 días vs anterior</p>
                  </CardHeader>
                </Card>
                <Card className="bg-orange-50 border border-orange-200">
                  <CardHeader className="p-4">
                    <CardTitle className="text-[14px] font-semibold text-orange-800">DIO (días)</CardTitle>
                    <p className="text-[24px] font-bold text-orange-900">22.1</p>
                    <p className="text-xs text-orange-600">+0.6 días vs anterior</p>
                  </CardHeader>
                </Card>
                <Card className="bg-green-50 border border-green-200">
                  <CardHeader className="p-4">
                    <CardTitle className="text-[14px] font-semibold text-green-800">CCC (días)</CardTitle>
                    <p className="text-[24px] font-bold text-green-900">8.4</p>
                    <p className="text-xs text-green-600">-2.3 días vs anterior</p>
                  </CardHeader>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>DSO</TableHead>
                    <TableHead>DPO</TableHead>
                    <TableHead>DIO</TableHead>
                    <TableHead>CCC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wcData.map((row) => (
                    <TableRow key={row.period}>
                      <TableCell className="font-medium">{row.period}</TableCell>
                      <TableCell>{row.dso.toFixed(1)} días</TableCell>
                      <TableCell>{row.dpo.toFixed(1)} días</TableCell>
                      <TableCell>{row.dio.toFixed(1)} días</TableCell>
                      <TableCell className="font-bold">{row.ccc.toFixed(1)} días</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* P&L mensual */}
        {analyticsView === 'pnl_trend' && (
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[18px] font-semibold">Evolución P&L</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={pnlTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`€${value.toLocaleString('es-ES')}`, '']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#4472C4" strokeWidth={3} name="Revenue" />
                    <Line type="monotone" dataKey="cogs" stroke="#DB2142" strokeWidth={2} name="COGS" />
                    <Line type="monotone" dataKey="opex" stroke="#FFC857" strokeWidth={2} name="OPEX" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>COGS</TableHead>
                    <TableHead>OPEX</TableHead>
                    <TableHead>GM %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pnlTrendData.map((row) => (
                    <TableRow key={row.period}>
                      <TableCell className="font-medium">{row.period}</TableCell>
                      <TableCell>€{row.revenue.toLocaleString('es-ES')}</TableCell>
                      <TableCell>€{row.cogs.toLocaleString('es-ES')}</TableCell>
                      <TableCell>€{row.opex.toLocaleString('es-ES')}</TableCell>
                      <TableCell className="font-bold">{row.gmPct.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Cashflow */}
        {analyticsView === 'cashflow' && (
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[18px] font-semibold">Proyección de Caja (90 días)</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => executeAnalyticsCTA('reprogramar_pagos')}
                    style={{ backgroundColor: '#4472C4', color: 'white' }}
                    disabled={executingAction === 'reprogramar_pagos'}
                  >
                    {executingAction === 'reprogramar_pagos' ? 'Procesando...' : 'Reprogramar Pagos'}
                  </Button>
                  <Button
                    onClick={() => executeAnalyticsCTA('dunning_cash')}
                    style={{ backgroundColor: '#00A878', color: 'white' }}
                    disabled={executingAction === 'dunning_cash'}
                  >
                    {executingAction === 'dunning_cash' ? 'Procesando...' : 'Acelerar Cobros'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={cashflowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`€${value.toLocaleString('es-ES')}`, '']} />
                    <Legend />
                    <Line type="monotone" dataKey="pess" stroke="#DB2142" strokeWidth={2} strokeDasharray="5 5" name="Pesimista" />
                    <Line type="monotone" dataKey="base" stroke="#4472C4" strokeWidth={3} name="Base" />
                    <Line type="monotone" dataKey="optim" stroke="#00A878" strokeWidth={2} strokeDasharray="5 5" name="Optimista" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Simulador Precio-Margen */}
        <Dialog open={showPrecioMargenSim} onOpenChange={setShowPrecioMargenSim}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Qué pasa si subo precios?</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-sm text-gray-600">Simula impacto de incrementos de precios en margen y volumen.</p>

              <div className="space-y-4">
                <div>
                  <Label>Cliente (opcional)</Label>
                  <Input placeholder="Específico o dejar vacío para todos" />
                </div>

                <div>
                  <Label>Incremento %: 5%</Label>
                  <Slider
                    defaultValue={[5]}
                    max={20}
                    min={-10}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Impacto Simulado</h4>
                <div className="space-y-1">
                  <p className="text-sm text-blue-700">Delta GM: +€2,175 (+12.4%)</p>
                  <p className="text-sm text-blue-700">Riesgo volumen: Medio (-3% estimado)</p>
                  <p className="text-sm text-blue-700">Clientes impactados: Todos los AR activos</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowPrecioMargenSim(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowPrecioMargenSim(false);
                    toast.success("Simulación aplicada - Vista previa en waterfall P&L");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Simular
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Simulador DSO/DPO */}
        <Dialog open={showDSODPOSim} onOpenChange={setShowDSODPOSim}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Impacto de DSO/DPO en Caja</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-sm text-gray-600">Ajusta días de cobro y pago para ver efecto en cashflow.</p>

              <div className="space-y-4">
                <div>
                  <Label>DSO Delta Días: -5</Label>
                  <Slider
                    defaultValue={[-5]}
                    max={15}
                    min={-15}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>DPO Delta Días: +5</Label>
                  <Slider
                    defaultValue={[5]}
                    max={15}
                    min={-15}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Impacto en Caja</h4>
                <div className="space-y-1">
                  <p className="text-sm text-green-700">Mejora DSO (-5 días): +€21,600 cash</p>
                  <p className="text-sm text-green-700">Mejora DPO (+5 días): +€34,100 cash</p>
                  <p className="text-sm text-green-700">Impacto neto: +€55,700 en 30 días</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowDSODPOSim(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowDSODPOSim(false);
                    toast.success("Proyección actualizada - Cashflow y Working Capital actualizados");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Simulador BCG Thresholds */}
        <Dialog open={showBCGThresholdsSim} onOpenChange={setShowBCGThresholdsSim}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajustar Umbrales BCG</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-sm text-gray-600">Modifica criterios de segmentación de la matriz BCG.</p>

              <div className="space-y-4">
                <div>
                  <Label>Umbral Crecimiento: 0%</Label>
                  <Slider
                    defaultValue={[0]}
                    max={50}
                    min={-50}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Umbral Share Margen: 0.2</Label>
                  <Slider
                    defaultValue={[0.2]}
                    max={0.5}
                    min={0.05}
                    step={0.05}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Reclasificación</h4>
                <div className="space-y-1">
                  <p className="text-sm text-yellow-700">Cliente Madrid SA: Estrellas → Estrellas</p>
                  <p className="text-sm text-yellow-700">Valencia Logistics: Perros → Interrogantes</p>
                  <p className="text-sm text-yellow-700">Total cambios: 1 cliente reclasificado</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowBCGThresholdsSim(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setShowBCGThresholdsSim(false);
                    toast.success("Umbrales BCG actualizados - Matriz reclasificada");
                  }}
                  style={{ backgroundColor: '#4472C4', color: 'white' }}
                >
                  Reclasificar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const renderContent = () => {
    switch(tab) {
      case 'facturas':
        return renderFacturas({
          activeChip, setActiveChip, showIntakeAP, setShowIntakeAP, showEmitirAR, setShowEmitirAR,
          show3WMSimulator, setShow3WMSimulator, selectedInvoice, setSelectedInvoice,
          showVerModal, setShowVerModal, executingBulk3WM, setExecutingBulk3WM
        });
      case 'pagos':
        return renderPagos({
          activeView, setActiveView, showScheduleModal, setShowScheduleModal, showCreateBatchModal,
          setShowCreateBatchModal, showOptimizeDPOSimulator, setShowOptimizeDPOSimulator,
          showDiscountSimulator, setShowDiscountSimulator, selectedPayments, setSelectedPayments,
          executingPaymentAction, setExecutingPaymentAction
        });
      case 'cobros':
        return renderCobros();
      case 'conciliación':
        return renderConciliacion();
      case 'presupuestos':
        return renderPresupuestos();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderDashboard();
    }
  };

  return (
    <div style={{ backgroundColor: '#F1F0EC', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-bold" style={{ color: '#1F2937', fontFamily: 'Montserrat, sans-serif' }}>
            Finanzas
          </h1>
          <p className="mt-1 text-[14px] font-medium" style={{ color: '#6B7280', fontFamily: 'Montserrat, sans-serif' }}>
            Bloquea fugas, factura en 2 clics y cobra antes.
          </p>
        </div>
      </div>
      {renderContent()}
    </div>
  );
}
