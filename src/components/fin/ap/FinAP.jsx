import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Clock, Package } from 'lucide-react';
import WorkviewShell from '../shared/WorkviewShell';
import overlaysConfig from '../config/overlays.json';

// Mock data for AP
const mockAPData = [
  {
    id: 'bill_001',
    bill_number: 'BILL-2025-001',
    supplier: 'Transport Solutions SL',
    due_date: '2025-01-25',
    amount: 12300,
    three_way_status: 'ok',
    job_ref: 'JOB-BCN-001'
  },
  {
    id: 'bill_002', 
    bill_number: 'BILL-2025-002',
    supplier: 'Warehouse Services SA',
    due_date: '2025-01-30',
    amount: 8750,
    three_way_status: 'tolerance',
    job_ref: 'JOB-MAD-002'
  },
  {
    id: 'bill_003',
    bill_number: 'BILL-2025-003',
    supplier: 'Freight Forwarder EU',
    due_date: '2025-02-05',
    amount: 15600,
    three_way_status: 'blocked',
    job_ref: 'JOB-VLC-003'
  }
];

// Mock AI insights for AP
const mockAPInsights = [
  {
    id: 'three_way_match',
    icon: CheckCircle,
    title: '3-Way Match',
    desc: '8 facturas con discrepancias menores pendientes',
    cta: { label: 'Revisar queue', action: 'open_3wm_queue' }
  },
  {
    id: 'early_discount',
    icon: Package,
    title: 'Early Payment',
    desc: 'Descuento 2% disponible en 3 facturas',
    cta: { label: 'Evaluar ahorro', action: 'evaluate_early_discount' }
  },
  {
    id: 'batch_optimizer',
    icon: Clock,
    title: 'Batch Optimizer',
    desc: 'Optimizar 12 pagos SEPA por DPO',
    cta: { label: 'Crear lote', action: 'create_optimized_batch' }
  }
];

const FinAP = ({ persona = 'comerciante', debug = false }) => {
  const [data, setData] = useState(mockAPData);
  const [filters, setFilters] = useState({});

  const handleRowAction = (action, row) => {
    console.log('[FIN-AP] Row action:', action, row?.id);
    
    switch (action) {
      case 'approve':
        console.log('[FIN-EVENT] fin:bill.approved emitted for', row?.bill_number);
        break;
      case 'reject':
        console.log('[FIN-EVENT] fin:bill.rejected emitted for', row?.bill_number);
        break;
      case 'schedule':
        console.log('[FIN-EVENT] fin:payment.scheduled emitted for', row?.bill_number);
        break;
      case 'open_3wm':
        console.log('[FIN-AP] Opening 3WM view for', row?.bill_number);
        break;
      case 'view':
        console.log('[FIN-AP] Opening bill detail for', row?.bill_number);
        break;
      case 'emit:fin.ap.early_discount.evaluate':
        console.log('[FIN-EVENT] fin:ap.early_discount.evaluate emitted');
        break;
      case 'emit:fin.ap.batch.create.optimize':
        console.log('[FIN-EVENT] fin:ap.batch.create.optimize emitted');
        break;
      default:
        console.log('[FIN-AP] Unknown action:', action);
    }
  };

  const handleBulkAction = (action, selectedIds) => {
    console.log('[FIN-AP] Bulk action:', action, selectedIds);
    
    switch (action) {
      case 'batch_approve':
        console.log('[FIN-EVENT] fin:bill.batch.approved emitted for', selectedIds.length, 'bills');
        break;
      case 'batch_schedule':
        console.log('[FIN-EVENT] fin:payment.batch.scheduled emitted for', selectedIds.length, 'bills');
        break;
      case 'export':
        console.log('[FIN-AP] Exporting', selectedIds.length, 'bills');
        break;
    }
  };

  const handleFilterChange = (newFilters) => {
    console.log('[FIN-AP] Filters changed:', newFilters);
    setFilters(newFilters);
    
    // Apply filters to mock data
    let filteredData = [...mockAPData];
    
    if (newFilters.three_way_status && newFilters.three_way_status !== 'all') {
      if (Array.isArray(newFilters.three_way_status)) {
        filteredData = filteredData.filter(item => newFilters.three_way_status.includes(item.three_way_status));
      } else {
        filteredData = filteredData.filter(item => item.three_way_status === newFilters.three_way_status);
      }
    }
    
    if (newFilters.supplier) {
      filteredData = filteredData.filter(item => 
        item.supplier.toLowerCase().includes(newFilters.supplier.toLowerCase())
      );
    }
    
    setData(filteredData);
  };

  // Get AP config from overlays
  const apConfig = overlaysConfig.ap || {};

  if (debug) {
    console.log('[FIN-DEBUG] FinAP render:', {
      persona,
      dataLength: data.length,
      filtersActive: Object.keys(filters).length,
      config: apConfig
    });
  }

  return (
    <WorkviewShell
      title="Cuentas por Pagar (AP)"
      subtitle="Aprobación de facturas, 3-Way Match y pagos"
      config={apConfig}
      data={data}
      onRowAction={handleRowAction}
      onBulkAction={handleBulkAction}
      onFilterChange={handleFilterChange}
      aiInsights={mockAPInsights}
      persona={persona}
      debug={debug}
    />
  );
};

export default FinAP;