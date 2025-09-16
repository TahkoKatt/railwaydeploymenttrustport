json
{
  "module": "fin",
  "test_cases": [
    {
      "id": "fin_dashboard_comerciante",
      "route": "/fin/dashboard",
      "persona": "comerciante",
      "expected": {
        "breadcrumb": "Finanzas › Dashboard",
        "title": "Finanzas — Dashboard",
        "min_widgets": 1,
        "no_dashboard_elements_outside_dashboard": true,
        "debug_shows_namespace": "fin.dashboard.v2"
      }
    },
    {
      "id": "fin_ar_comerciante",
      "route": "/fin/ar",
      "persona": "comerciante",
      "expected": {
        "breadcrumb": "Finanzas › Cuentas por Cobrar",
        "title": "Cuentas por Cobrar",
        "min_widgets": 1,
        "no_dashboard_elements_outside_dashboard": true,
        "debug_shows_namespace": "fin.ar.v2"
      }
    },
    {
      "id": "fin_ap_operador",
      "route": "/fin/ap",
      "persona": "operador",
      "expected": {
        "breadcrumb": "Finanzas › Cuentas por Pagar",
        "title": "Cuentas por Pagar",
        "min_widgets": 1,
        "no_dashboard_elements_outside_dashboard": true,
        "debug_shows_namespace": "fin.ap.v2"
      }
    }
  ],
  "automated_checks": [
    "render_without_topbar",
    "persona_overlay_applied", 
    "namespace_isolation",
    "debug_mode_functional",
    "404_on_invalid_slug"
  ]
}
