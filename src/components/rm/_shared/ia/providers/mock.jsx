// Provider mock: respuestas determinísticas, sin red, latencia controlada para SLOs.
const mockInsights = {
  dashboard: [
    {
      chip: "risk_check",
      title: "Riesgo en Pipeline",
      subtitle: "3 oportunidades en 'Negociación' sin actividad en >14 días.",
      confidence: 0.95,
      severity: "warn",
      actions: [{ label: "Revisar (3)", action_id: "review_stale_opps" }],
    },
    {
      chip: "win_likelihood",
      title: "Probabilidad de Cierre",
      subtitle: "La probabilidad general del Q ha bajado 5pp esta semana.",
      confidence: 0.88,
      severity: "info",
      actions: [{ label: "Ver detalles", action_id: "view_win_rate_details" }],
    },
  ],
  opportunities: [
    {
      chip: "win_likelihood",
      title: "Win-Likelihood: 82%",
      subtitle: "Factores positivos: sector en auge, cliente recurrente.",
      confidence: 0.82,
      severity: "info",
      actions: [{ label: "Ajustar Prob.", action_id: "adjust_probability" }],
    },
     {
      chip: "risk_check",
      title: "Riesgo de Margen",
      subtitle: "El margen de esta oportunidad (12%) está por debajo del objetivo (18%).",
      confidence: 0.98,
      severity: "critical",
      actions: [{ label: "Revisar Pricing", action_id: "review_pricing" }],
    },
  ],
  forecasting: [
    {
      chip: "forecast_assistant",
      title: "Forecast Assistant",
      subtitle: "Proyección ajustada: €895K. 5 oportunidades clave podrían deslizarse al próximo Q.",
      confidence: 0.91,
      severity: "info",
      actions: [{ label: "Analizar 'what-if'", action_id: "run_what_if" }],
    }
  ]
};

export const evaluate = async (request) => {
  return new Promise(resolve => {
    const latency = 50 + Math.random() * 100; // Latencia variable para test P95
    setTimeout(() => {
      const insights = (mockInsights[request.tab] || []).map(insight => ({
        ...insight,
        audit: {
          model: "mock:v1.0.0",
          latency_ms: latency,
          ts: new Date().toISOString(),
        }
      }));
      resolve({ insights, error: null });
    }, latency);
  });
};