import React, { useState } from 'react';
import { AlertTriangle, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import WorkviewShell from '../shared/WorkviewShell';
import overlaysConfig from '../config/overlays.json';

// Mock data for AR
const mockARData = [
  {
    id: 'inv_001',
    invoice_number: 'INV-2025-001',
    customer: 'Textiles Barcelona SA',
    due_date: '2025-01-15',
    amount_due: 15600,
    days_overdue: 12,
    risk_score: 'medium',
    status: 'overdue',
    shipment_ref: 'SH-BCN-001'
  },
  {
    id: 'inv_002',
    invoice_number: 'INV-2025-002',
    customer: 'Logistics Madrid SL',
    due_date: '2025-01-20',
    amount_due: 8900,
    days_overdue: 0,
    risk_score: 'low',
    status: 'current',
    shipment_ref: 'SH-MAD-002'
  },
  {
    id: 'inv_003',
    invoice_number: 'INV-2025-003',
    customer: 'Export Sevilla SA',
    due_date: '2025-01-10',
    amount_due: 23400,
    days_overdue: 18,
    risk_score: 'high',
    status: 'overdue',
    shipment_ref: 'SH-SEV-003'
  }
];

// Mock AI insights for AR
const mockARInsights = [
  {
    id: 'dunning',
    icon: AlertTriangle,
    title: 'Dunning Queue',
    desc: '5 clientes requieren escalamiento inmediato',
    cta: { label: 'Procesar cola', action: 'open_dunning_queue' }
  },
  {
    id: 'paylink_batch',
    icon: DollarSign,
    title: 'Paylinks Batch',
    desc: 'Generar 12 links de pago para top deudores',
    cta: { label: 'Generar links', action: 'create_paylink_batch' }
  },
  {
    id: 'collection_plan',
    icon: Calendar,
    title: 'Plan de Cobros',
    desc: 'Optimizar secuencia para maximizar cash',
    cta: { label: 'Ver plan', action: 'open_collection_plan' }
  }
];

const FinAR = ({ persona = 'comerciante', debug = false }) => {
  const [data, setData] = useState(mockARData);
  const [filters, setFilters] = useState({});

  const handleRowAction = (action, row) => {
    console.log('[FIN-AR] Row action:', action, row?.id);
    
    switch (action) {
      case 'send_paylink':
        console.log('[FIN-EVENT] fin:invoice.paylink.sent emitted for', row?.invoice_number);
        break;
      case 'promise':
        console.log('[FIN-EVENT] fin:invoice.promise_set emitted for', row?.invoice_number);
        break;
      case 'call':
        console.log('[FIN-AR] Opening call log for', row?.customer);
        break;
      case 'log_note':
        console.log('[FIN-AR] Opening note editor for', row?.invoice_number);
        break;
      case 'emit:fin.ar.paylink.send':
        console.log('[FIN-EVENT] fin:ar.paylink.send emitted');
        break;
      case 'emit:fin.ar.escalate.am':
        console.log('[FIN-EVENT] fin:ar.escalate.am emitted');
        break;
      default:
        console.log('[FIN-AR] Unknown action:', action);
    }
  };

  const handleBulkAction = (action, selectedIds) => {
    console.log('[FIN-AR] Bulk action:', action, selectedIds);
    
    switch (action) {
      case 'send_batch':
        console.log('[FIN-EVENT] fin:invoice.batch.sent emitted for', selectedIds.length, 'invoices');
        break;
      case 'escalate':
        console.log('[FIN-EVENT] fin:invoice.batch.escalated emitted for', selectedIds.length, 'invoices');
        break;
      case 'export':
        console.log('[FIN-AR] Exporting', selectedIds.length, 'invoices');
        break;
    }
  };

  const handleFilterChange = (newFilters) => {
    console.log('[FIN-AR] Filters changed:', newFilters);
    setFilters(newFilters);
    
    // Apply filters to mock data
    let filteredData = [...mockARData];
    
    if (newFilters.status && newFilters.status !== 'all') {
      if (Array.isArray(newFilters.status)) {
        filteredData = filteredData.filter(item => newFilters.status.includes(item.status));
      } else {
        filteredData = filteredData.filter(item => item.status === newFilters.status);
      }
    }
    
    if (newFilters.customer) {
      filteredData = filteredData.filter(item => 
        item.customer.toLowerCase().includes(newFilters.customer.toLowerCase())
      );
    }
    
    setData(filteredData);
  };

  // Get AR config from overlays
  const arConfig = overlaysConfig.ar || {};

  if (debug) {
    console.log('[FIN-DEBUG] FinAR render:', {
      persona,
      dataLength: data.length,
      filtersActive: Object.keys(filters).length,
      config: arConfig
    });
  }

  return (
    <WorkviewShell
      title="Cuentas por Cobrar (AR)"
      subtitle="Gestión de facturas, dunning y cobros"
      config={arConfig}
      data={data}
      onRowAction={handleRowAction}
      onBulkAction={handleBulkAction}
      onFilterChange={handleFilterChange}
      aiInsights={mockARInsights}
      persona={persona}
      debug={debug}
    />
  );
};

export default FinAR;