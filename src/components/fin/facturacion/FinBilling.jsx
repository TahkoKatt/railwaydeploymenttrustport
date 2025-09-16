import React, { useState } from 'react';
import { FileText, Send, CreditCard } from 'lucide-react';
import WorkviewShell from '../shared/WorkviewShell';
import overlaysConfig from '../config/overlays.json';

// Mock data for Billing
const mockBillingData = [
  {
    id: 'inv_b001',
    invoice_number: 'INV-B-2025-001',
    account: 'Textiles Barcelona SA',
    issue_date: '2025-01-15',
    due_date: '2025-02-15',
    total_amount: 15600,
    status: 'sent'
  },
  {
    id: 'inv_b002',
    invoice_number: 'INV-B-2025-002',
    account: 'Logistics Madrid SL',
    issue_date: '2025-01-18',
    due_date: '2025-02-18',
    total_amount: 8900,
    status: 'draft'
  },
  {
    id: 'inv_b003',
    invoice_number: 'INV-B-2025-003',
    account: 'Export Sevilla SA',
    issue_date: '2025-01-20',
    due_date: '2025-02-20',
    total_amount: 23400,
    status: 'paid'
  }
];

// Mock AI insights for Billing
const mockBillingInsights = [
  {
    id: 'gl_auto_coder',
    icon: FileText,
    title: 'GL Auto Coder',
    desc: 'Codificación automática de 12 facturas pendientes',
    cta: { label: 'Aplicar códigos', action: 'auto_code_gl' }
  },
  {
    id: 'batch_sender',
    icon: Send,
    title: 'Batch Sender',
    desc: '8 facturas listas para envío masivo',
    cta: { label: 'Enviar lote', action: 'send_batch_invoices' }
  }
];

const FinBilling = ({ persona = 'comerciante', debug = false }) => {
  const [data, setData] = useState(mockBillingData);
  const [filters, setFilters] = useState({});

  const handleRowAction = (action, row) => {
    console.log('[FIN-BILLING] Row action:', action, row?.id);
    
    switch (action) {
      case 'send':
        console.log('[FIN-EVENT] fin:invoice.sent emitted for', row?.invoice_number);
        break;
      case 'credit_note':
        console.log('[FIN-EVENT] fin:credit_note.created emitted for', row?.invoice_number);
        break;
      case 'cancel':
        console.log('[FIN-EVENT] fin:invoice.cancelled emitted for', row?.invoice_number);
        break;
      case 'emit:fin.facturacion.from_so':
        console.log('[FIN-EVENT] fin:facturacion.from_so emitted');
        break;
      case 'emit:fin.facturacion.from_pod':
        console.log('[FIN-EVENT] fin:facturacion.from_pod emitted');
        break;
      default:
        console.log('[FIN-BILLING] Unknown action:', action);
    }
  };

  const handleBulkAction = (action, selectedIds) => {
    console.log('[FIN-BILLING] Bulk action:', action, selectedIds);
    
    switch (action) {
      case 'send_batch':
        console.log('[FIN-EVENT] fin:invoice.batch.sent emitted for', selectedIds.length, 'invoices');
        break;
      case 'export':
        console.log('[FIN-BILLING] Exporting', selectedIds.length, 'invoices');
        break;
    }
  };

  const handleFilterChange = (newFilters) => {
    console.log('[FIN-BILLING] Filters changed:', newFilters);
    setFilters(newFilters);
    
    // Apply filters to mock data
    let filteredData = [...mockBillingData];
    
    if (newFilters.status && newFilters.status !== 'all') {
      if (Array.isArray(newFilters.status)) {
        filteredData = filteredData.filter(item => newFilters.status.includes(item.status));
      } else {
        filteredData = filteredData.filter(item => item.status === newFilters.status);
      }
    }
    
    if (newFilters.account) {
      filteredData = filteredData.filter(item => 
        item.account.toLowerCase().includes(newFilters.account.toLowerCase())
      );
    }
    
    setData(filteredData);
  };

  // Get Billing config from overlays
  const billingConfig = overlaysConfig.facturacion || {};

  if (debug) {
    console.log('[FIN-DEBUG] FinBilling render:', {
      persona,
      dataLength: data.length,
      filtersActive: Object.keys(filters).length,
      config: billingConfig
    });
  }

  return (
    <WorkviewShell
      title="Facturación"
      subtitle="Emisión, envío y gestión de facturas"
      config={billingConfig}
      data={data}
      onRowAction={handleRowAction}
      onBulkAction={handleBulkAction}
      onFilterChange={handleFilterChange}
      aiInsights={mockBillingInsights}
      persona={persona}
      debug={debug}
    />
  );
};

export default FinBilling;