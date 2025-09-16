// components/srm/dashboard/constants.js - Constantes y configuración
export const TRUSTPORT_TOKENS = {
  fonts: { primary: 'Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' },
  colors: {
    main_bg: '#F1F0EC',
    surface: '#FFFFFF',
    text_strong: '#1F2937',
    text_muted: '#6B7280',
    border: '#E5E7EB',
    primary: '#4472C4',
    primary_hover: '#3A61A6',
    primary_active: '#2F4F8A',
    success: '#00A878',
    warning: '#FFC857',
    danger: '#DA2242',
    focus_ring: '#9CB6E6',
  },
  radius: '16px',
  shadow: '0 6px 18px rgba(0,0,0,0.06)',
};

export const KPI_CONFIG = {
  proveedores_activos: { label: 'Proveedores Activos', format: 'number', icon: 'Users' },
  ahorro_ytd_pct: { label: 'Ahorro YTD', format: 'percent', icon: 'TrendingUp' },
  otif_90d_pct: { label: 'OTIF 90d', format: 'percent', icon: 'CheckCircle' },
  contratos_por_vencer_30d: { label: 'Contratos por Vencer', format: 'number', icon: 'Clock' },
  rfqs_abiertas: { label: 'RFQs Abiertas', format: 'number', icon: 'FileText' },
  bloqueados_por_riesgo: { label: 'Bloqueados por Riesgo', format: 'number', icon: 'AlertTriangle' }
};

export const CONTRACT_STATUS_COLORS = {
  por_renovar: 'bg-yellow-100 text-yellow-800',
  renovacion_en_curso: 'bg-blue-100 text-blue-800', 
  vencido: 'bg-red-100 text-red-800',
  activo: 'bg-green-100 text-green-800'
};

export const RISK_QUADRANTS = {
  routine: { color: '#00A878', label: 'Rutina' },
  leverage: { color: '#4472C4', label: 'Palanca' },
  strategic: { color: '#DA2242', label: 'Estrategico' },
  bottleneck: { color: '#FFC857', label: 'Cuello de Botella' }
};

export const AI_CHIPS_CONFIG = [
  { id: 'detect_quick_savings', label: 'Detectar Ahorros', icon: 'PiggyBank', intent: 'ai.detect_savings' },
  { id: 'suggest_supplier', label: 'Sugerir Proveedor', icon: 'UserPlus', intent: 'ai.suggest_supplier' },
  { id: 'normalize_rates', label: 'Normalizar Tarifas', icon: 'Layers', intent: 'ai.normalize_rates' }
];