{
  "dashboard": {
    "comerciante": {
      "kpi_add": [
        { "label": "Fill rate", "key": "fill_rate", "format": "percentage" },
        { "label": "Riesgo rotura", "key": "stockout_risk", "format": "count" }
      ],
      "simulator_add": [
        { "name": "dso_target", "type": "input", "unit": "d", "min": 15, "max": 90 },
        { "name": "sugerir_po", "type": "toggle" }
      ],
      "quick_actions": [
        { "label": "Links de pago top deudores", "action": "emit:fin.ar.paylink.batch" },
        { "label": "Evaluar pronto pago", "action": "emit:fin.ap.early_discount.evaluate" }
      ],
      "ia_on": ["dunning","three_way_match"]
    },
    "operador": {
      "kpi_add": [
        { "label": "Margen expediente", "key": "margin_per_job", "format": "currency" },
        { "label": "OTD", "key": "otd_rate", "format": "percentage" }
      ],
      "simulator_add": [
        { "name": "util_flota", "type": "slider", "min": -20, "max": 20, "unit": "%" }
      ],
      "quick_actions": [
        { "label": "SEPA optimizado DPO", "action": "emit:fin.ap.batch.create.optimize" },
        { "label": "Facturar al POD", "action": "emit:fin.facturacion.from_pod" }
      ],
      "ia_on": ["allocator","three_way_match"]
    }
  },
  "ar": {
    "base": {
      "views": {
        "list": {
          "filters": [
            { "id": "status", "type": "multiselect", "values": ["current","overdue","promise"] },
            { "id": "date_range", "type": "daterange" },
            { "id": "customer", "type": "search", "source": "accounts" }
          ],
          "columns": [
            { "key": "invoice_number", "label": "Factura" },
            { "key": "customer", "label": "Cliente" },
            { "key": "due_date", "label": "Vence", "type": "date" },
            { "key": "amount_due", "label": "Pendiente", "type": "currency" },
            { "key": "days_overdue", "label": "Dias venc", "type": "number" },
            { "key": "risk_score", "label": "Riesgo", "type": "badge" },
            { "key": "status", "label": "Estado", "type": "badge" }
          ],
          "row_actions": ["send_paylink","promise","call","log_note"],
          "bulk_actions": ["send_batch","escalate","export"]
        }
      },
      "ia_chips": [
        { "id": "dunning", "default_on": true }
      ],
      "events_emit": [
        "fin:invoice.reminder.v1",
        "fin:invoice.promise_set.v1",
        "fin:receipt.created.v1"
      ]
    },
    "comerciante": {
      "default_filters": { "status": ["overdue"] },
      "priority_sort": ["amount_due desc","days_overdue desc"],
      "quick_actions": [
        { "label": "Paylink inmediato", "action": "emit:fin.ar.paylink.send" }
      ]
    },
    "operador": {
      "default_filters": { "status": ["overdue","current"] },
      "columns_add": [{ "key": "shipment_ref", "label": "Envio" }],
      "quick_actions": [
        { "label": "Escalar a AM", "action": "emit:fin.ar.escalate.am" }
      ]
    }
  },
  "ap": {
    "base": {
      "views": {
        "queue": {
          "filters": [
            { "id": "approval_status", "type": "select", "values": ["pending","approved","rejected"] },
            { "id": "due_date", "type": "daterange" },
            { "id": "supplier", "type": "search", "source": "suppliers" }
          ],
          "columns": [
            { "key": "bill_number", "label": "Bill" },
            { "key": "supplier", "label": "Proveedor" },
            { "key": "due_date", "label": "Vence", "type": "date" },
            { "key": "amount", "label": "Importe", "type": "currency" },
            { "key": "three_way_status", "label": "3WM", "type": "badge" }
          ],
          "row_actions": ["approve","reject","schedule","open_3wm","view"],
          "bulk_actions": ["batch_approve","batch_schedule","export"]
        }
      },
      "ia_chips": [
        { "id": "three_way_match", "default_on": true }
      ],
      "events_emit": [
        "fin:bill.matched.v1",
        "fin:payment.scheduled.v1",
        "fin:payment.posted.v1"
      ]
    },
    "comerciante": {
      "default_filters": { "three_way_status": ["ok","tolerance"] },
      "quick_actions": [
        { "label": "Evaluar pronto pago", "action": "emit:fin.ap.early_discount.evaluate" }
      ]
    },
    "operador": {
      "columns_add": [{ "key": "job_ref", "label": "Expediente" }],
      "priority_sort": ["three_way_status asc","due_date asc"],
      "quick_actions": [
        { "label": "Lote SEPA optimizado", "action": "emit:fin.ap.batch.create.optimize" }
      ]
    }
  },
  "facturacion": {
    "base": {
      "views": {
        "list": {
          "filters": [
            { "id": "status", "type": "multiselect", "values": ["draft","sent","partial","paid","overdue"] },
            { "id": "account", "type": "search", "source": "accounts" },
            { "id": "date_range", "type": "daterange" }
          ],
          "columns": [
            { "key": "invoice_number", "label": "Numero" },
            { "key": "account", "label": "Cliente" },
            { "key": "issue_date", "label": "Fecha" },
            { "key": "due_date", "label": "Vence" },
            { "key": "total_amount", "label": "Total", "type": "currency" },
            { "key": "status", "label": "Estado", "type": "badge" }
          ],
          "row_actions": ["send","credit_note","cancel"],
          "bulk_actions": ["send_batch","export"]
        }
      },
      "ia_chips": [
        { "id": "gl_auto_coder", "default_on": true }
      ],
      "events_emit": ["fin:invoice.created.v1","fin:invoice.sent.v1"]
    },
    "comerciante": {
      "quick_actions": [{ "label": "Emitir desde SalesOrder", "action": "emit:fin.facturacion.from_so" }]
    },
    "operador": {
      "quick_actions": [{ "label": "Emitir desde POD", "action": "emit:fin.facturacion.from_pod" }]
    }
  },
  "cash": {
    "base": {
      "views": {
        "calendar": { "view_types": ["week","month"], "components": ["scheduled_payments","projected_receipts","net_position"] }
      },
      "ia_chips": [{ "id": "cash_forecast", "default_on": true }],
      "events_emit": ["fin:cash.forecast.created.v1"]
    },
    "comerciante": {
      "quick_actions": [{ "label": "Plan cobros 14d", "action": "emit:fin.ar.plan.create.short" }]
    },
    "operador": {
      "quick_actions": [{ "label": "Resecuenciar pagos", "action": "emit:fin.ap.batch.optimize.sequence" }]
    }
  },
  "conciliacion": {
    "base": {
      "views": {
        "workspace": {
          "layout": "three_panel",
          "panels": ["bank_lines","book_entries","suggestions"],
          "row_actions": ["match","split","create_adjustment"]
        }
      },
      "ia_chips": [{ "id": "recon_matcher", "default_on": true }],
      "events_emit": ["fin:recon.completed.v1","fin:recon.exceptions.v1"]
    },
    "comerciante": {},
    "operador": {
      "columns_add": [{ "key": "job_ref", "label": "Expediente" }]
    }
  },
  "impuestos": {
    "base": {
      "views": {
        "list": {
          "filters": [{ "id": "period", "type": "select", "values": ["m","q","y"] }],
          "columns": [
            { "key": "jurisdiction", "label": "Zona" },
            { "key": "period", "label": "Periodo" },
            { "key": "tax_due", "label": "Impuesto", "type": "currency" },
            { "key": "status", "label": "Estado", "type": "badge" }
          ],
          "row_actions": ["generate_book","post_journal"]
        }
      },
      "ia_chips": [{ "id": "gl_auto_coder", "default_on": true }],
      "events_emit": ["fin:journal.posted.v1"]
    },
    "comerciante": {},
    "operador": {}
  },
  "analytics": {
    "base": {
      "views": {
        "list": {
          "filters": [{ "id": "slice", "type": "select", "values": ["cliente","shipment","producto","ruta"] }],
          "columns": [
            { "key": "entity", "label": "Entidad" },
            { "key": "revenue", "label": "Ingreso", "type": "currency" },
            { "key": "cost", "label": "Costo", "type": "currency" },
            { "key": "margin", "label": "Margen", "type": "currency" }
          ]
        }
      },
      "ia_chips": [
        { "id": "margin_guard_fin", "default_on": true },
        { "id": "anomaly_detector_pnl", "default_on": true }
      ]
    },
    "comerciante": { "default_filters": { "slice": "cliente" } },
    "operador": { "default_filters": { "slice": "shipment" } }
  }
}