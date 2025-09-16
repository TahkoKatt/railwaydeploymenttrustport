import { validateTabRoute, getModuleRegistry } from './FeatureFlagsConfig.jsx';

/*
ROUTER ASCII-ONLY + ALIAS + FALLBACK CONTROLLED
Gate G0 requirement: ?tab=invalid → error UI controlled, never clone dashboard
*/

// Route aliases for backward compatibility
const ROUTE_ALIASES = {
  // Compras aliases
  'po-bienes': 'ordenes-de-compra',
  'po-servicios': 'po-servicios', 
  'po-goods': 'ordenes-de-compra',
  'po-services': 'po-servicios',
  'rma': 'devoluciones-notas',
  'rtv': 'devoluciones-notas',
  'nota-debito': 'devoluciones-notas',
  'landed-cost': 'inventario-precios',
  'facturas': 'inventario-precios', // temporarily mapped
  
  // Legacy fallbacks
  'pendientes': 'pendientes',
  'analytics': 'analytics'
};

// Valid tabs per module (ASCII-only whitelist)
const VALID_TABS = {
  'compras': [
    'dashboard',
    'pendientes', 
    'pedidos-multicanal',
    'requisiciones',
    'cotizaciones',
    'ordenes-de-compra',
    'po-servicios',
    'inventario-precios', 
    'proveedores',
    'devoluciones-notas',
    'analytics'
  ],
  'crm': ['dashboard', 'clientes', 'leads', 'actividades', 'marketing', 'postventa', 'analytics'],
  'wms': ['dashboard', 'recepciones', 'inventario', 'ubicaciones', 'picking', 'packing', 'cross-dock', 'discrepancias'],
  'tms': ['dashboard', 'planificacion', 'rutas', 'seguimiento', 'pod', 'costos', 'reportes', 'mantenimiento']
};

class RouteValidationError extends Error {
  constructor(message, code = 'INVALID_ROUTE') {
    super(message);
    this.name = 'RouteValidationError';
    this.code = code;
    this.userFriendly = true;
  }
}

export const processTabRoute = (module, rawTab) => {
  try {
    // Step 1: ASCII-only validation
    if (rawTab && !validateTabRoute(rawTab)) {
      throw new RouteValidationError(
        `Ruta inválida: "${rawTab}". Solo se permiten caracteres ASCII alfanuméricos, guión y guión bajo.`,
        'ASCII_VALIDATION_FAILED'
      );
    }

    // Step 2: Resolve aliases
    const tab = rawTab ? (ROUTE_ALIASES[rawTab] || rawTab) : 'dashboard';

    // Step 3: Check against whitelist
    const validTabs = VALID_TABS[module.toLowerCase()] || [];
    if (!validTabs.includes(tab)) {
      throw new RouteValidationError(
        `Pestaña "${tab}" no encontrada en módulo "${module}". Pestañas válidas: ${validTabs.join(', ')}.`,
        'TAB_NOT_FOUND'
      );
    }

    // Step 4: Get registry info
    const registry = getModuleRegistry(module.toLowerCase(), tab);

    return {
      valid: true,
      originalTab: rawTab,
      resolvedTab: tab,
      module: module.toLowerCase(),
      registry,
      redirectTo: rawTab !== tab ? `/${module}?tab=${tab}` : null
    };

  } catch (error) {
    if (error instanceof RouteValidationError) {
      return {
        valid: false,
        error: {
          message: error.message,
          code: error.code,
          userFriendly: error.userFriendly
        },
        fallbackTo: `/${module}?tab=dashboard`
      };
    }
    
    // Unexpected errors - fallback safely
    return {
      valid: false,
      error: {
        message: 'Error interno de enrutamiento. Redirigiendo a dashboard.',
        code: 'INTERNAL_ROUTER_ERROR',
        userFriendly: true
      },
      fallbackTo: `/${module}?tab=dashboard`
    };
  }
};

export const createControlledError = (error) => {
  return {
    type: 'ROUTE_ERROR',
    title: 'Ruta No Encontrada',
    message: error.message,
    code: error.code,
    showFallback: true,
    fallbackLabel: 'Ir a Dashboard',
    timestamp: new Date().toISOString()
  };
};