

import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Users, Package, ShoppingCart, Warehouse, Truck,
  Plane, DollarSign, Bell, Search,
  ChevronLeft, ChevronRight, X, CalendarDays,
  BarChart3, Building2, Ship, TrendingUp, HeartHandshake, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const SRM_ROUTE = '/SRM';

const getPersonaForSRMDashboard = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const personaFromUrl = urlParams.get('persona');
  const personaFromStorage = localStorage.getItem('persona');
  return personaFromUrl || personaFromStorage || 'comerciante';
};

const gotoSRMDashboard = () => {
  const currentPersona = getPersonaForSRMDashboard();
  window.location.assign(`${SRM_ROUTE}?tab=dashboard&persona=${currentPersona}`);
};


const subnavRegistryV1 = {
  WMS: [
    { name: "Dashboard", path: "/WMS?tab=dashboard" },
    { name: "Recepciones", path: "/WMS?tab=recepciones" },
    { name: "Inventario", path: "/WMS?tab=inventario" },
    { name: "Ubicaciones", path: "/WMS?tab=ubicaciones" },
    { name: "Picking", path: "/WMS?tab=picking" },
    { name: "Packing", path: "/WMS?tab=packing" },
    { name: "Cross-dock", path: "/WMS?tab=cross-dock" },
    { name: "Discrepancias", path: "/WMS?tab=discrepancias" }
  ],
  CRM: [
    { name: "Dashboard", path: "/CRM?tab=dashboard" },
    { name: "Clientes", path: "/CRM?tab=clientes" },
    { name: "Leads", path: "/CRM?tab=leads" },
    { name: "Actividades", path: "/CRM?tab=actividades" },
    { name: "Marketing", path: "/CRM?tab=marketing" },
    { name: "Postventa", path: "/CRM?tab=postventa" },
    { name: "Analytics", path: "/CRM?tab=analytics" }
  ],
  CLIENTES: [
    { name: "Dashboard", path: "/Clientes?tab=dashboard" },
    { name: "Clientes", path: "/Clientes?tab=clientes" },
    { name: "Leads", path: "/Clientes?tab=leads" },
    { name: "Actividades", path: "/Clientes?tab=actividades" },
    { name: "Marketing", path: "/Clientes?tab=marketing" },
    { name: "Postventa", path: "/Clientes?tab=postventa" },
    { name: "Analytics", path: "/Clientes?tab=analytics" }
  ],
  COMPRAS: [
    { name: "Dashboard", path: "/Compras?tab=dashboard" },
    { name: "Pendientes", path: "/Compras?tab=pendientes" },
    { name: "Pedidos multicanal", path: "/Compras?tab=pedidos-multicanal" },
    { name: "Requisiciones", path: "/Compras?tab=requisiciones" },
    { name: "Cotizaciones", path: "/Compras?tab=cotizaciones" },
    { name: "Ordenes de compra", path: "/Compras?tab=ordenes-de-compra" },
    { name: "Inventario y precios", path: "/Compras?tab=inventario-precios" },
    { name: "Proveedores", path: "/Compras?tab=proveedores" },
    { name: "Devoluciones y sac", path: "/Compras?tab=devoluciones-sac" },
    { name: "Analytics", path: "/Compras?tab=analytics" }
  ],
  TMS: [
    { name: "Dashboard", path: "/TMS?tab=dashboard" },
    { name: "Planificacion", path: "/TMS?tab=planificacion" },
    { name: "Rutas", path: "/TMS?tab=rutas" },
    { name: "Seguimiento", path: "/TMS?tab=seguimiento" },
    { name: "POD", path: "/TMS?tab=pod" },
    { name: "Costos", path: "/TMS?tab=costos" },
    { name: "Reportes", path: "/TMS?tab=reportes" },
    { name: "Mantenimiento", path: "/TMS?tab=mantenimiento" }
  ],
  COMEX: [
    { name: "Dashboard", path: "/COMEX?tab=dashboard" },
    { name: "Routing Order", path: "/COMEX?tab=routing-order" }, // New tab added
    { name: "Booking", path: "/COMEX?tab=booking" },
    { name: "BL-AWB", path: "/COMEX?tab=bl-awb" },
    { name: "Docs", path: "/COMEX?tab=docs" },
    { name: "Compliance", path: "/COMEX?tab=compliance" },
    { name: "Tracking", path: "/COMEX?tab=tracking" },
    { name: "Aduanas", path: "/COMEX?tab=aduanas" },
    { name: "Liquidacion", path: "/COMEX?tab=liquidacion" },
    { name: "Archivo", path: "/COMEX?tab=archivo" }
  ],
  FIN: [
    { name: "Dashboard", path: "/Finanzas?tab=dashboard" },
    { name: "Facturas", path: "/Finanzas?tab=facturas" },
    { name: "Pagos", path: "/Finanzas?tab=pagos" },
    { name: "Cobros", path: "/Finanzas?tab=cobros" },
    { name: "Conciliacion", path: "/Finanzas?tab=conciliacion" },
    { name: "Presupuestos", path: "/Finanzas?tab=presupuestos" },
    { name: "Analytics", path: "/Finanzas?tab=analytics" }
  ],
  SRM: [
    { name: "Dashboard", path: `${SRM_ROUTE}?tab=dashboard` },
    { name: "Proveedores", path: `${SRM_ROUTE}?tab=proveedores` },
    { name: "Documentos", path: `${SRM_ROUTE}?tab=documentos` },
    { name: "RFQ", path: `${SRM_ROUTE}?tab=rfq` },
    { name: "Evaluacion", path: `${SRM_ROUTE}?tab=evaluacion` },
    { name: "Riesgo", path: `${SRM_ROUTE}?tab=riesgo` },
    { name: "Tarifario", path: `${SRM_ROUTE}?tab=tarifario` }
  ],
  // SHELL-LOCK: Subnav RM con exactamente 5 tabs - actualizado para incluir analytics
  RM: [
    { name: "Dashboard", path: "/rm?tab=dashboard" },
    { name: "Oportunidades", path: "/rm?tab=oportunidades" },
    { name: "Cotizaciones", path: "/rm?tab=cotizaciones" }, // H2: Este hace redirect
    { name: "Forecasting", path: "/rm?tab=forecasting" },
    { name: "Analytics", path: "/rm?tab=analytics" } // Nuevo tab analytics
  ]
};

const subnavRegistryV2 = {
  ...subnavRegistryV1,
  COMPRAS: [
    { name: "Dashboard", path: "/Compras?tab=dashboard-compras" },
    { name: "Action Center", path: "/Compras?tab=action-center" },
    { name: "PO Bienes", path: "/Compras?tab=po-bienes" },
    { name: "PO Servicios", path: "/Compras?tab=po-servicios" },
    { name: "Landed Cost", path: "/Compras?tab=landed-cost" },
    { name: "Facturas", path: "/Compras?tab=facturas" },
    { name: "Devoluciones", path: "/Compras?tab=devoluciones-notas" },
    { name: "Analytics", path: "/Compras?tab=analytics" },
  ],
};


const useFeatureFlag = (flagName) => {
  const flags = {
    'ff.compras.nav_v2_whitelist': true,
    'FF_CLIENTES_OWNER_UI': true,
    'FF_HIDE_CRM_NAV': true,
    'FEATURE_DUAL_EVENT_EMIT': true,
    'FEATURE_RM_REDIRECTS': false
  };
  return flags[flagName] || false;
};

// H1: Sidebar unico - un solo item "Ingresos"
// Navegacion principal - corregir nombre sidebar
const navigationItems = [
  {
    name: "Dashboard",
    icon: BarChart3,
    path: createPageUrl('Dashboard'),
    color: "text-blue-600 bg-blue-100",
    key: "DASHBOARD"
  },
  {
    name: "Clientes",
    icon: HeartHandshake,
    path: createPageUrl('Clientes'),
    color: "text-rose-600 bg-rose-100",
    key: "CLIENTES"
  },
  {
    name: "CRM",
    icon: Users,
    path: createPageUrl('CRM'),
    color: "text-green-600 bg-green-100",
    key: "CRM"
  },
  {
    name: "Compras",
    icon: ShoppingCart,
    path: createPageUrl('Compras'),
    color: "text-purple-600 bg-purple-100",
    key: "COMPRAS"
  },
  // H1: Un solo item unificado para Revenue Management
  {
    name: "Ingresos",
    icon: TrendingUp,
    path: "/rm",
    color: "text-indigo-600 bg-indigo-100",
    key: "RM",
    tooltip: "Revenue Management"
  },
  {
    name: "WMS", // Corrected from "Almacen" to "WMS"
    icon: Warehouse,
    path: createPageUrl('WMS'),
    color: "text-orange-600 bg-orange-100",
    key: "WMS"
  },
  {
    name: "TMS",
    icon: Truck,
    path: createPageUrl('TMS'),
    color: "text-red-600 bg-red-100",
    key: "TMS"
  },
  {
    name: "COMEX",
    icon: Ship,
    path: createPageUrl('COMEX'),
    color: "text-teal-600 bg-teal-100",
    key: "COMEX"
  },
  {
    name: "SRM",
    icon: Building2,
    path: `${SRM_ROUTE}?tab=dashboard`,
    color: "text-yellow-600 bg-yellow-100",
    key: "SRM"
  },
  {
    name: "Finanzas",
    icon: DollarSign,
    path: createPageUrl('Finanzas'),
    color: "text-emerald-600 bg-emerald-100",
    key: "FIN"
  }
];

// H1: Activo consistente unificado
const deriveModuleKeyFromPath = (pathname, search) => {
  const urlParams = new URLSearchParams(search);
  const tab = urlParams.get('tab');

  // H1: Regla unica para RM - activo tanto en /rm como en legacy cotizaciones
  if (pathname.startsWith('/rm') || pathname.startsWith('/RM') ||
      (pathname.startsWith('/RevenueManagement') && tab === 'cotizaciones')) {
    return 'RM';
  }

  if (pathname.startsWith('/WMS')) return 'WMS';
  if (pathname.startsWith('/CRM')) return 'CRM';
  if (pathname.startsWith('/Clientes')) return 'CLIENTES';
  if (pathname.startsWith('/Compras')) return 'COMPRAS';
  if (pathname.startsWith('/TMS')) return 'TMS';
  if (pathname.startsWith('/COMEX')) return 'COMEX';
  if (pathname.startsWith('/SRM')) return 'SRM';
  if (pathname.startsWith('/Finanzas')) return 'FIN';
  return null;
};


// Helper para comprobar si es modulo activo
const isActiveModule = (item, moduleKey) => {
  return item.key === moduleKey;
};


const TrustportIcon = ({ size = 24, color = 'white', secondaryColor = '#DB2142' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C12.5523 2 13 2.44772 13 3V4C13 4.55228 12.5523 5 12 5C11.4477 5 11 4.55228 11 4V3C11 2.44772 11.4477 2 12 2Z" fill={color}/>
      <path d="M19 12C19 11.4477 19.4477 11 20 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H20C19.4477 13 19 12.5523 19 12Z" fill={color}/>
      <path d="M3 12C3 11.4477 3.44772 11 4 11H5C5.55228 11 6 11.4477 6 12C6 12.5523 5.55228 13 5 13H4C3.44772 13 3 12.5523 3 12Z" fill={color}/>
      <rect x="5" y="7" width="14" height="12" rx="2" fill={color}/>
      <circle cx="8.5" cy="13" r="1.5" fill={secondaryColor}/>
      <circle cx="15.5" cy="13" r="1.5" fill={secondaryColor}/>
    </svg>
);

const TrustportLogo = ({ size = 24, collapsed = false }) => (
  <div
    className={`flex items-center justify-center rounded-lg ${collapsed ? 'w-9 h-9' : 'w-8 h-8'}`}
    style={{ backgroundColor: "#DB2142" }}
  >
    <TrustportIcon size={size} color="white" secondaryColor="#DB2142" />
  </div>
);

const AIAssistant = ({ show, onClose, currentPageName }) => {
    if (!show) return null;

    const globalChips = ["Generar PO", "Ver stock", "Optimizar ruta", "Validar docs", "Reporte finanzas"];
    const tmsChips = ["Optimizar rutas", "Reasignar vehiculo", "Notificar cliente", "Ver mantenimientos"];

    const chips = currentPageName === 'TMS' ? tmsChips : globalChips;

    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-20 z-[9998]"
                onClick={onClose}
            />
            <div
                className="fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-2xl z-[9999] flex flex-col"
                style={{
                    height: '70%',
                    maxHeight: '600px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
            >
                <div className="p-4 text-white rounded-t-lg flex items-center justify-between" style={{ backgroundColor: "#DB2142" }}>
                    <div className="flex items-center gap-3">
                        <TrustportIcon size={20} color="white" secondaryColor="#DB2142" />
                        <h3 className="font-semibold text-sm">Agente IA Trustport</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-white hover:bg-white/20 h-8 w-8"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                   <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <TrustportLogo size={48} />
                        <p className="mt-4 font-semibold">En que puedo ayudarte?</p>
                        <p className="text-sm text-gray-400 mt-2">Escribe tu consulta o selecciona una accion rapida</p>
                   </div>
                </div>
                <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {chips.map(chip => (
                            <Button key={chip} size="sm" variant="outline" className="text-xs px-3 py-2 h-auto whitespace-nowrap bg-white hover:bg-gray-100">
                                {chip}
                            </Button>
                        ))}
                    </div>
                    <div className="relative">
                        <Input placeholder="Escribe tu instruccion o pregunta..." className="bg-white pr-12 border-gray-300" />
                         <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full" style={{ backgroundColor: "#000000" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};


export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const urlParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const moduleKey = useMemo(() => deriveModuleKeyFromPath(location.pathname, location.search), [location.pathname, location.search]);
  const isRmLegacyQuotes = moduleKey === 'RM' && location.pathname.startsWith('/RevenueManagement');

  // H1: Redirect 308 automatico /RevenueManagement* -> /rm (preserva query)
  useEffect(() => {
    if (location.pathname.startsWith('/RevenueManagement') && !urlParams.get('from')) {
      const newUrl = `/rm${location.search}`;
      window?.console?.log('rm:redirect.308', { from: location.pathname, to: newUrl, ts: Date.now() });
      window.location.replace(newUrl);
      return;
    }
  }, [location.pathname, location.search, urlParams]);

  // H3: CSS bridge para legacy cuando from=rm
  useEffect(() => {
    const fromRm = urlParams.get('from') === 'rm';
    if (isRmLegacyQuotes && fromRm) {
      document.body.classList.add('rm-bridge-active');

      // H3: Inyectar CSS para ocultar topbar duplicada
      const styleId = 'rm-bridge-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .rm-bridge-active .legacy-topbar-duplicate {
            display: none !important;
          }
          .rm-bridge-active .legacy-header-redundant {
            display: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    } else {
      document.body.classList.remove('rm-bridge-active');
    }

    return () => {
      document.body.classList.remove('rm-bridge-active');
      const style = document.getElementById('rm-bridge-styles');
      if (style) style.remove();
    };
  }, [isRmLegacyQuotes, urlParams]);

  // H2: State para throttle de cotizaciones
  const [clickingCotizaciones, setClickingCotizaciones] = useState(false);

  // H2: Helper para detectar si ya estamos en legacy quotes
  const isLegacyQuotes = (loc) => {
    return loc.pathname.startsWith('/RevenueManagement') &&
           new URLSearchParams(loc.search).get('tab') === 'cotizaciones';
  };

  // H2: Handler con guard de idempotencia y throttle
  const handleCotizacionesClick = (e) => {
    // H2: Guard de idempotencia
    if (isLegacyQuotes(location)) {
      e.preventDefault();
      return;
    }

    // H2: Throttle de 2s por sesion
    if (clickingCotizaciones) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    setClickingCotizaciones(true);

    // H5: Telemetria minima y silenciosa
    window?.console?.log('rm:redirect.cotizaciones', { ts: Date.now() });

    // H2: Redirect unico sin cadenas
    const legacyUrl = '/RevenueManagement?tab=cotizaciones&from=rm';
    window.location.replace(legacyUrl);

    // H2: Reset throttle despues de 2s
    setTimeout(() => setClickingCotizaciones(false), 2000);
  };

  const isNavV2Enabled = useFeatureFlag('ff.compras.nav_v2_whitelist');
  const hideCrmNav = useFeatureFlag('FF_HIDE_CRM_NAV');
  const isClientesOwner = useFeatureFlag('FF_CLIENTES_OWNER_UI');

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [selectedPersona, setSelectedPersona] = useState(() => {
    const fromUrl = urlParams.get('persona');
    const fromStorage = localStorage.getItem('persona');
    return fromUrl || fromStorage || 'comerciante';
  });

  const [showAIAssistant, setShowAIAssistant] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const onPersonaChange = (newPersona) => {
    setSelectedPersona(newPersona);
    try { localStorage.setItem('persona', newPersona); } catch {}

    const u = new URL(window.location.href);
    u.searchParams.set('persona', newPersona);

    if (u.pathname.toLowerCase() === '/srm') {
      window.location.assign(u.toString());
    } else {
      window.history.replaceState(null, '', u.toString());
    }
  };

  const currentPersonaForNav = urlParams.get('persona') || (typeof localStorage !== 'undefined' && localStorage.getItem('persona')) || 'comerciante';

  const subnavRegistry = isNavV2Enabled ? subnavRegistryV2 : subnavRegistryV1;
  const subModules = subnavRegistry[moduleKey] || [];

  const getUserProfile = () => {
    const profiles = {
      comerciante: { role: "Comerciante", dept: "Comercio & Comex" },
      operador: { role: "Operador Logistico", dept: "Transitario/Logistica" }
    };
    return profiles[selectedPersona] || profiles.comerciante;
  };

  const userProfile = getUserProfile();

  const getActiveSubModule = () => {
    if (!subModules.length) return null;

    // H1: Regla unica de activo para sidebar/subnav
    const isActiveSidebar = location.pathname.startsWith('/rm') ||
                           (location.pathname.startsWith('/RevenueManagement') && urlParams.get('tab') === 'cotizaciones');

    if (isActiveSidebar && location.pathname.startsWith('/RevenueManagement')) {
      return "Cotizaciones";
    }

    const tab = urlParams.get('tab');
    const aliases = {
        "dashboard": "dashboard-compras", "pendientes": "action-center",
        "ordenes-de-compra": "po-bienes", "devoluciones-y-sac": "devoluciones-notas"
    };
    const resolvedTab = aliases[tab] || tab;

    if (resolvedTab) {
        const found = subModules.find(sub => sub.path.includes(`tab=${resolvedTab}`));
        return found ? found.name : (subModules[0]?.name || null);
    }
    return subModules[0]?.name || null;
  };

  const activeSubModule = getActiveSubModule();

  return (
    <div className="h-screen w-full flex overflow-hidden" style={{ backgroundColor: "#F1F0EC" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <style>{`
        html, body, * { font-family: 'Montserrat', sans-serif !important; }
        :root {
          --bg-page: #F1F0EC; --surface: #FFFFFF; --primary: #4472C4;
          --secondary: #DB2142; --border: #D9D9D9; --shadow: 0 8px 24px rgba(0,0,0,.08);
          --radius: 16px;
        }
        /* HOTFIX: Estilos no invasivos para encapsular Cotizaciones legacy */
        .rm-bridge-active .legacy-top-bar-to-hide {
            display: none !important;
        }
        /* Overlay de carga anti-doble click */
        .cotizaciones-loading {
          position: relative;
          pointer-events: none;
          opacity: 0.6;
        }
        .cotizaciones-loading::after {
          content: "Abriendo Cotizaciones (legacy)...";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 1000;
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`flex-shrink-0 bg-white border-r transition-all duration-250 ease-in-out z-30 ${
        sidebarCollapsed ? 'w-[72px]' : 'w-[256px]'
      }`} style={{ borderColor: "var(--border)" }}>
        <div className="h-full flex flex-col">
            <div className="h-16 flex-shrink-0 flex items-center border-b px-4" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                 <TrustportLogo collapsed={sidebarCollapsed}/>
                {!sidebarCollapsed && (
                  <div>
                    <h1 className="text-[20px] font-bold tracking-tight font-menseal">
                      Trustport
                    </h1>
                  </div>
                )}
              </div>
            </div>

            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {navigationItems
                  .filter(item => {
                    if (item.key === 'CRM' && hideCrmNav) return false;
                    if (item.key === 'CLIENTES' && !isClientesOwner) return false;
                    return true;
                  })
                  .map((item) => {
                  // H1: Logica de activacion unificada usando la clave RM
                  const isActive = isActiveModule(item, moduleKey);
                  const IconComponent = item.icon;

                  const path = item.key === 'SRM'
                    ? `${SRM_ROUTE}?tab=dashboard&persona=${currentPersonaForNav}`
                    : item.path;

                  return (
                    <Link
                      key={item.name}
                      to={path}
                      className={`flex items-center gap-3 px-3 rounded-lg transition-colors duration-200 group relative ${sidebarCollapsed ? 'h-[40px]' : 'h-[44px]'} ${
                        isActive
                          ? 'text-white bg-black'
                          : 'text-black hover:bg-[var(--bg-page)]'
                      }`}
                      style={{ fontWeight: isActive ? 600 : 500, fontSize: '14px' }}
                      title={item.tooltip}
                    >
                      <IconComponent
                        className="w-5 h-5 flex-shrink-0"
                        style={{ color: isActive ? 'white' : '#000000' }}
                      />
                      {!sidebarCollapsed && <span>{item.name}</span>}
                      {sidebarCollapsed && (
                        <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  );
                })}
            </nav>

            <div className="flex-shrink-0 border-t p-3" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-sm">{userProfile.role.charAt(0)}</span>
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{userProfile.role}</p>
                    <p className="text-xs text-gray-500 truncate">{userProfile.dept}</p>

                    <Select value={selectedPersona} onValueChange={onPersonaChange}>
                      <SelectTrigger className="w-full mt-2 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comerciante">Comerciante</SelectItem>
                        <SelectItem value="operador">Operador Logistico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen">
        <div className="flex-1 flex flex-col overflow-auto">
            {/* Header */}
            <header className="h-16 bg-white border-b flex-shrink-0 flex items-center justify-between px-6 gap-4 sticky top-0 z-20" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
                  {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5"/>}
              </button>
              <div className="relative w-full max-w-xl">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Buscar..." className="pl-10 w-full rounded-xl" style={{ backgroundColor: "#F1F5F9", border: "1px solid #E2E8F0" }} />
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative h-10 w-10">
                  <Bell className="w-5 h-5" />
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500"/>
                </Button>
                <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="font-bold text-sm">C</span>
                </div>
              </div>
            </header>

            {/* Sub-Nav persistente y unificado */}
            {subModules.length > 0 && (
              <div className="h-[56px] flex-shrink-0 bg-white border-b px-6 flex items-center justify-between overflow-x-auto sticky top-16 z-10 scrollbar-hide" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-6">
                  {/* H3: Breadcrumb mejorado para Cotizaciones Legacy */}
                  {isRmLegacyQuotes && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Link to="/rm?tab=dashboard" className="flex items-center gap-1 hover:text-gray-800">
                              <ArrowLeft className="w-4 h-4" />
                              Ingresos
                          </Link>
                          <span>/</span>
                          <span className="font-semibold text-gray-700">Cotizaciones (legacy)</span>
                      </div>
                  )}

                  {/* SubNav se muestra solo si NO estamos en la vista legacy de cotizaciones */}
                  {!isRmLegacyQuotes && subModules.map((subModuleItem) => {
                    const isActive = activeSubModule === subModuleItem.name;

                    // H2: Handler especial para Cotizaciones sin prefetch
                    if (subModuleItem.name === 'Cotizaciones') {
                      return (
                        <button
                          key={subModuleItem.name}
                          onClick={handleCotizacionesClick}
                          className={`flex items-center gap-2 px-1 py-4 text-[14px] whitespace-nowrap border-b-2 transition-colors duration-200 ${
                            isActive
                              ? 'text-black border-black font-semibold'
                              : 'text-gray-600 border-transparent hover:border-gray-300 font-medium'
                          } ${clickingCotizaciones ? 'cotizaciones-loading' : ''}`}
                          disabled={clickingCotizaciones}
                        >
                          {subModuleItem.name}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={subModuleItem.name}
                        to={subModuleItem.path}
                        className={`flex items-center gap-2 px-1 py-4 text-[14px] whitespace-nowrap border-b-2 transition-colors duration-200 ${
                          isActive
                            ? 'text-black border-black font-semibold'
                            : 'text-gray-600 border-transparent hover:border-gray-300 font-medium'
                        }`}
                      >
                        {subModuleItem.name}
                      </Link>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 text-[12px] text-gray-500 whitespace-nowrap ml-6">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>Ultima actualizacion: 14:32</span>
                  </div>
                </div>
              </div>
            )}

            <main className="flex-1" style={{ backgroundColor: "var(--bg-page)" }}>
              <div className="p-6">
                {children}
              </div>
            </main>
        </div>

        <button onClick={() => setShowAIAssistant(!showAIAssistant)} className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 z-[9997] flex items-center justify-center" style={{ backgroundColor: "#DB2142" }} aria-label="Abrir Asistente IA" >
          <TrustportIcon size={32} />
        </button>
        <AIAssistant show={showAIAssistant} onClose={() => setShowAIAssistant(false)} currentPageName={currentPageName} />
      </div>
    </div>
  );
}

