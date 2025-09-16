import React, { useState } from 'react';
import { Receipt, FileText, Calculator } from 'lucide-react';
import WorkviewShell from '../shared/WorkviewShell';
import overlaysConfig from '../config/overlays.json';

// Mock data for Tax
const mockTaxData = [
  {
    id: 'tax_001',
    jurisdiction: 'España',
    period: 'Q4-2024',
    tax_due: 15600,
    status: 'calculated'
  },
  {
    id: 'tax_002',
    jurisdiction: 'Francia',
    period: 'Q4-2024', 
    tax_due: 8900,
    status: 'pending'
  },
  {
    id: 'tax_003',
    jurisdiction: 'Alemania',
    period: 'Q4-2024',
    tax_due: 23400,
    status: 'filed'
  }
];

// Mock AI insights for Tax
const mockTaxInsights = [
  {
    id: 'gl_auto_coder',
    icon: Calculator,
    title: 'GL Auto Coder',
    desc: 'Codificación automática de 15 transacciones fiscales',
    cta: { label: 'Aplicar códigos', action: 'auto_code_tax_gl' }
  },
  {
    id: 'book_generator',
    icon: FileText,
    title: 'Book Generator',
    desc: 'Generar libro IVA Q4 con 145 transacciones',
    cta: { label: 'Generar libro', action: 'generate_tax_book' }
  }
];

const FinTax = ({ persona = 'comerciante', debug = false }) => {
  const [data, setData] = useState(mockTaxData);
  const [filters, setFilters] = useState({});

  const handleRowAction = (action, row) => {
    console.log('[FIN-TAX] Row action:', action, row?.id);
    
    switch (action) {
      case 'generate_book':
        console.log('[FIN-EVENT] fin:tax.book.generated emitted for', row?.jurisdiction);
        break;
      case 'post_journal':
        console.log('[FIN-EVENT] fin:journal.posted emitted for tax', row?.jurisdiction);
        break;
      default:
        console.log('[FIN-TAX] Unknown action:', action);
    }
  };

  const handleBulkAction = (action, selectedIds) => {
    console.log('[FIN-TAX] Bulk action:', action, selectedIds);
    
    switch (action) {
      case 'export':
        console.log('[FIN-TAX] Exporting', selectedIds.length, 'tax entries');
        break;
    }
  };

  const handleFilterChange = (newFilters) => {
    console.log('[FIN-TAX] Filters changed:', newFilters);
    setFilters(newFilters);
    
    // Apply filters to mock data
    let filteredData = [...mockTaxData];
    
    if (newFilters.period && newFilters.period !== 'all') {
      filteredData = filteredData.filter(item => {
        if (newFilters.period === 'm') return item.period.includes('M');
        if (newFilters.period === 'q') return item.period.includes('Q');
        if (newFilters.period === 'y') return item.period.includes('Y');
        return true;
      });
    }
    
    setData(filteredData);
  };

  // Get Tax config from overlays
  const taxConfig = overlaysConfig.impuestos || {};

  if (debug) {
    console.log('[FIN-DEBUG] FinTax render:', {
      persona,
      dataLength: data.length,
      filtersActive: Object.keys(filters).length,
      config: taxConfig
    });
  }

  return (
    <WorkviewShell
      title="Impuestos"
      subtitle="Gestión de IVA, retenciones y libros fiscales"
      config={taxConfig}
      data={data}
      onRowAction={handleRowAction}
      onBulkAction={handleBulkAction}
      onFilterChange={handleFilterChange}
      aiInsights={mockTaxInsights}
      persona={persona}
      debug={debug}
    />
  );
};

export default FinTax;