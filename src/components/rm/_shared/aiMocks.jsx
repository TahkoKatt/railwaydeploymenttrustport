// Visible para ambas personas: comerciante y operador_logistico
export const aiInsightsRM_Dashboard = [
  {
    id: "pipeline_risk",
    icon: "warning",
    title: "Riesgo en Pipeline",
    description: "3 oportunidades en 'Negociación' sin actividad >14 días.",
    cta: { label: "Revisar (3)", href: "/rm?tab=oportunidades&filter=stale_gt_14d" }
  },
  {
    id: "win_likelihood_drop",
    icon: "chart",
    title: "Probabilidad de Cierre",
    description: "El win-likelihood general bajó 5pp esta semana.",
    cta: { label: "Ver detalles", href: "/rm?tab=forecasting&view=drivers" }
  },
  {
    id: "margin_guard",
    icon: "risk",
    title: "Riesgo de Margen",
    description: "Una oportunidad al 12% (objetivo 18%). Revisa pricing/recargos.",
    cta: { label: "Revisar Pricing", href: "/rm?tab=oportunidades&filter=margin_lt_target" }
  }
];

export const aiInsightsRM_Forecasting = [
  {
    id: "forecast_assistant",
    icon: "chart",
    title: "Forecast Assistant",
    description: "Proyección ajustada: €895K. 5 oportunidades podrían deslizarse al próximo Q.",
    cta: { label: "Analizar 'what-if'", href: "/rm?tab=forecasting&action=whatif" }
  }
];