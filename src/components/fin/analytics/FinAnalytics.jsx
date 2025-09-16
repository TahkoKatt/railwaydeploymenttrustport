import React, { useState } from 'react';
import { BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import WorkviewShell from '../shared/WorkviewShell';
import overlaysConfig from '../config/overlays.json';

// Mock data for Analytics
const mockAnalyticsData = [
  {
    id: 'ana_001',
    entity: 'Textiles Barcelona SA',
    revenue: 125600,
    cost: 89200,
    margin: 36400
  },
  {
    id: 'ana_002',
    entity: 'Logistics Madrid SL', 
    revenue: 98900,
    cost: 72300,
    margin: 26600
  },
  {
    id: 'ana_003',
    entity: 'Export Sevilla SA',
    revenue: 234500,
    cost: 167800,
    margin: 66700
  }
];

// Mock AI insights for Analytics
const mockAnalyticsInsights = [
  {
    id: 'margin_guard_fin',
    icon: AlertTriangle,
    title: 'Margin Guard',
    desc: '3 clientes con margen < 15% requieren atención',
    cta: { label: 'Revisar pricing', action: 'review_margin_guard' }
  },
  {
    id: 'anomaly_detector_pnl',
    icon: TrendingUp,
    title: 'Anomaly Detector P&L',
    desc: 'Detectada anomalía en costos ruta SHA→VLC',
    cta: { label: 'Investigar', action: 'investigate_anomaly' }
  }
];

const FinAnalytics = ({ persona = 'comerciante', debug = false }) => {
  const [data, setData] = useState(mockAnalyticsData);
  const [filters, setFilters] = useState({});

  const handleRowAction = (action, row) => {
    console.log('[FIN-ANALYTICS] Row action:', action, row?.id);
    
    switch (action) {
      case 'drill_down':
        console.log('[FIN-ANALYTICS] Drilling down into', row?.entity);
        break;
      case 'review_margin_guard':
        console.log('[FIN-EVENT] fin:margin.review emitted');
        break;
      case 'investigate_anomaly':
        console.log('[FIN-EVENT] fin:anomaly.investigate emitted');
        break;
      default:
        console.log('[FIN-ANALYTICS] Unknown action:', action);
    }
  };

  const handleBulkAction = (action, selectedIds) => {
    console.log('[FIN-ANALYTICS] Bulk action:', action, selectedIds);
    
    switch (action) {
      case 'export':
        console.log('[FIN-ANALYTICS] Exporting', selectedIds.length, 'analytics entries');
        break;
    }
  };

  const handleFilterChange = (newFilters) => {
    console.log('[FIN-ANALYTICS] Filters changed:', newFilters);
    setFilters(newFilters);
    
    // Apply filters to mock data - slice filter affects what's shown
    let filteredData = [...mockAnalyticsData];
    
    if (newFilters.slice && newFilters.slice !== 'all') {
      // In real implementation, would change data source based on slice
      console.log('[FIN-ANALYTICS] Slice changed to:', newFilters.slice);
    }
    
    setData(filteredData);
  };

  // Get Analytics config from overlays
  const analyticsConfig = overlaysConfig.analytics || {};

  if (debug) {
    console.log('[FIN-DEBUG] FinAnalytics render:', {
      persona,
      dataLength: data.length,
      filtersActive: Object.keys(filters).length,
      config: analyticsConfig
    });
  }

  return (
    <WorkviewShell
      title="Analytics Finanzas"
      subtitle="P&L por entidad, análisis de márgenes y detección de anomalías"
      config={analyticsConfig}
      data={data}
      onRowAction={handleRowAction}
      onBulkAction={handleBulkAction}
      onFilterChange={handleFilterChange}
      aiInsights={mockAnalyticsInsights}
      persona={persona}
      debug={debug}
    />
  );
};

export default FinAnalytics;