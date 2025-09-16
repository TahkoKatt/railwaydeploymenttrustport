json
{
  "module": "fin",
  "canonical_slugs": ["dashboard","ar","ap","facturacion","cash","conciliacion","impuestos","analytics"],
  "routes": {
    "/fin": { "redirect_308": "/fin/dashboard" },
    "/fin/dashboard": { "component": "FinDashboard" },
    "/fin/ar": { "component": "FinAR" },
    "/fin/ap": { "component": "FinAP" },
    "/fin/facturacion": { "component": "FinBilling" },
    "/fin/cash": { "component": "FinCash" },
    "/fin/conciliacion": { "component": "FinRecon" },
    "/fin/impuestos": { "component": "FinTax" },
    "/fin/analytics": { "component": "FinAnalytics" }
  },
  "legacy_redirects": {
    "/Finanzas": { "redirect_308": "/fin" },
    "/Finanzas?tab=:slug": { "redirect_308": "/fin/:slug" }
  },
  "router_config": {
    "no_fallback": true,
    "allowlist": ["dashboard","ar","ap","facturacion","cash","conciliacion","impuestos","analytics"],
    "on_unknown_slug": "404_controlled",
    "debug_enabled": true
  }
}
