// Overlays por perfil - CRÍTICO: useLocation para reactividad correcta
import React from 'react';
import { useLocation } from 'react-router-dom';
import { DollarSign, Target, TrendingUp, Clock, BarChart3, Zap } from "lucide-react";

// Simulación para test: window.__setPersona = (p) => localStorage.setItem('persona', p)
if (typeof window !== 'undefined') {
  window.__setPersona = (persona) => {
    localStorage.setItem('persona', persona);
    // Forzar re-render (simplificado para test)
    window.location.href = window.location.href;
  };
}

export const rmOverlays = {
  comerciante: {
    kpiOrder: [
      {
        id: 'margen',
        label: 'Margen Promedio',
        value: '28.5%',
        delta: '+2.1pp',
        icon: TrendingUp,
        color: '#00A878'
      },
      {
        id: 'winrate',
        label: 'Win Rate',
        value: '34.2%',
        delta: '+5.1pp',
        icon: Target,
        color: '#4472C4'
      },
      {
        id: 'revenue_ytd',
        label: 'Ingresos YTD',
        value: '€2.4M',
        delta: '+12%',
        icon: DollarSign,
        color: '#FFC857'
      },
      {
        id: 'monto_medio',
        label: 'Monto Medio',
        value: '€8,750',
        delta: '+15%',
        icon: BarChart3,
        color: '#DB2142'
      }
    ],
    defaultFilters: {
      estados: ['Propuesta', 'Negociacion'],
      owner: 'mine',
      periodo: '30d'
    },
    aiChips: [
      {
        id: 'forecast_assistant',
        type: 'forecast_assistant',
        title: 'Forecast Assistant',
        description: 'Análisis predictivo del pipeline comercial',
        cta: 'Analizar Pipeline',
        action: 'forecast_analysis',
        mockOutput: { forecast: '€890K', confidence: 0.85 }
      },
      {
        id: 'risk_check',
        type: 'risk_check',
        title: 'Risk Check',
        description: 'Evaluación de riesgo de cliente y oportunidades',
        cta: 'Evaluar Riesgo',
        action: 'risk_evaluation',
        mockOutput: { risk_level: 'medium', alerts: 2 }
      }
    ]
  },
  
  operador_logistico: {
    kpiOrder: [
      {
        id: 'sla_1a_resp',
        label: 'SLA 1ª Respuesta',
        value: '2.4h',
        delta: '-0.3h',
        icon: Clock,
        color: '#4472C4'
      },
      {
        id: 't2_propuesta',
        label: 'T2 Propuesta',
        value: '18h',
        delta: '-2h',
        icon: Zap,
        color: '#00A878'
      },
      {
        id: 'volumen_cotizado',
        label: 'Volumen Cotizado',
        value: '1,247 TEU',
        delta: '+8%',
        icon: BarChart3,
        color: '#FFC857'
      },
      {
        id: 'otd',
        label: 'OTD',
        value: '94.2%',
        delta: '+1.8pp',
        icon: Target,
        color: '#DB2142'
      }
    ],
    defaultFilters: {
      estados: ['Nuevo', 'Calificado'],
      sla_status: 'at_risk',
      periodo: '7d'
    },
    aiChips: [
      {
        id: 'risk_check',
        type: 'risk_check',
        title: 'Bottleneck Alert',
        description: 'Cuellos de botella operativos y SLA en riesgo',
        cta: 'Revisar Alertas',
        action: 'bottleneck_check',
        mockOutput: { bottlenecks: 3, sla_at_risk: 5 }
      },
      {
        id: 'forecast_assistant',
        type: 'forecast_assistant',
        title: 'Capacity Planning',
        description: 'Proyección de capacidad y picos de demanda',
        cta: 'Planificar Capacidad',
        action: 'capacity_planning',
        mockOutput: { capacity_needed: '120%', peak_weeks: 2 }
      }
    ]
  }
};

// Hook correctamente reactivo usando useLocation (NO window.location)
export const useRmOverlay = () => {
  const location = useLocation();

  const currentPersona = React.useMemo(() => {
    const urlParams = new URLSearchParams(location.search);
    const fromUrl = urlParams.get('persona');
    const fromStorage = localStorage?.getItem('persona');
    const resolved = fromUrl || fromStorage || 'comerciante';
    
    console.log(`[useRmOverlay] Persona: ${resolved} (url=${fromUrl}, storage=${fromStorage})`);
    return resolved;
  }, [location.search]);

  const overlay = React.useMemo(() => {
    console.log(`[useRmOverlay] Recalculando overlay para: ${currentPersona}`);
    return rmOverlays[currentPersona] || rmOverlays.comerciante;
  }, [currentPersona]);

  return {
    currentPersona,
    kpiOrder: overlay.kpiOrder,
    defaultFilters: overlay.defaultFilters,
    aiChips: overlay.aiChips
  };
};