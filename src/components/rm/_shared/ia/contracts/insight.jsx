// Contratos de IA (JSON Schemas para validación con AJV)
// Estos esquemas son la "verdad absoluta" para las request y response de IA.

export const requestSchema = {
  type: "object",
  properties: {
    tab: { type: "string", enum: ["dashboard", "opportunities", "forecasting"] },
    persona: { type: "string", enum: ["comerciante", "operador_logistico"] },
    context: {
      type: "object",
      properties: {
        kpis: {
          type: "object",
          properties: {
            gross_margin_pct: { type: "number" },
            win_rate: { type: "number" },
            time_to_quote_ms: { type: "number" },
            sla_quote_pct: { type: "number" },
            pipeline_weighted: { type: "number" }
          },
          required: ["gross_margin_pct", "win_rate", "time_to_quote_ms", "sla_quote_pct", "pipeline_weighted"]
        },
        filters: {
          type: "object",
          properties: {
            customer_id: { type: ["string", "null"] },
            stage: { type: ["string", "null"] }
          },
          required: ["customer_id", "stage"]
        },
        snapshot_ts: { type: "string", format: "date-time" }
      },
      required: ["kpis", "filters", "snapshot_ts"]
    },
    limits: {
      type: "object",
      properties: {
        timeout_ms: { type: "number" }
      },
      required: ["timeout_ms"]
    }
  },
  required: ["tab", "persona", "context", "limits"]
};

export const responseSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      chip: { type: "string", enum: ["margin_guard", "forecast_assistant", "win_likelihood", "risk_check"] },
      title: { type: "string" },
      subtitle: { type: "string" },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      severity: { type: "string", enum: ["info", "warn", "critical"] },
      actions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            action_id: { type: "string" }
          },
          required: ["label", "action_id"]
        }
      },
      audit: {
        type: "object",
        properties: {
          model: { type: "string" },
          latency_ms: { type: "number" },
          ts: { type: "string", format: "date-time" }
        },
        required: ["model", "latency_ms", "ts"]
      }
    },
    required: ["chip", "title", "subtitle", "confidence", "severity", "actions", "audit"]
  }
};