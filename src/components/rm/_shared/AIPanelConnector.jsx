import React from 'react';
import AIPanel from './AIPanel';
import { useRmOverlay } from '@/components/rm/overlays';
import { iaClient } from './ia/iaClient';

const AIPanelConnector = ({ tab, context }) => {
  const { currentPersona } = useRmOverlay();

  // H4: Insights y chips específicos para el dashboard de RM
  const insightCards = [
    {
      id: "stale_opps",
      icon: "Clock",
      title: "Oportunidades Atascadas",
      desc: "5 oportunidades sin actividad >7 días. Riesgo de pérdida.",
      cta: { label: "Ver Oportunidades", action: "view_stale_opps" }
    },
    {
      id: "low_margin_quotes",
      icon: "TrendingDown",
      title: "Cotizaciones de Bajo Margen",
      desc: "3 cotizaciones enviadas con margen <15%. Revisar pricing.",
      cta: { label: "Revisar Cotizaciones", action: "review_low_margin_quotes" }
    },
    {
      id: "forecast_risk",
      icon: "AlertTriangle",
      title: "Riesgo en Forecast",
      desc: "Forecast Q3 podría no alcanzar el objetivo por €120K.",
      cta: { label: "Analizar Forecast", action: "analyze_forecast_risk" }
    }
  ];

  const chatActions = [
    { id: "resumir", label: "Resumir KPIs", type: "quick" },
    { id: "explicar_pipeline", label: "Explicar pipeline", type: "quick" },
    { id: "exportar", label: "Exportar", type: "dropdown", options: ["csv", "xlsx", "pdf"] }
  ];

  return (
    <div 
      className="bg-blue-50/50 p-4 rounded-2xl" 
      style={{
        border: '1px solid #e0eaff'
      }}
    >
        <AIPanel
            title="AI Insights & Recomendaciones"
            persona={currentPersona}
            insightCards={insightCards}
            chatActions={chatActions}
            context={{ module: "rm", tab, ...context }}
            iaClient={iaClient}
        />
    </div>
  );
};

export default AIPanelConnector;