// components/srm/dashboard/DashboardComponent.jsx - Componente principal del Dashboard
import React, { useState, Suspense } from 'react';
import { useOverlay } from '@/components/srm/OverlayProvider';
import { TRUSTPORT_TOKENS } from './constants';

// Hooks para datos
import { useKPIs } from './adapters/useKPIs';
import { useKraljicData } from './adapters/useKraljicData';
import { useContractsDue } from './adapters/useContractsDue';
import { useRFQData } from './adapters/useRFQData';

// Componentes
import { FiltersBar } from './FiltersBar';
import { KpiRow } from './KpiRow';
import { AiChipsPanel } from './AiChipsPanel';
import { WidgetKraljic } from './WidgetKraljic';
import { WidgetContractsDue } from './WidgetContractsDue';
import { WidgetRFQSLA } from './WidgetRFQSLA';
import { WidgetAlerts } from './WidgetAlerts';
import { WidgetRankingCarriers } from './WidgetRankingCarriers';

// Skeletons
import { SkeletonKpiRow } from './Skeletons';

export default function DashboardComponent({ 
  dashboardFilters, 
  setDashboardFilters,
  selectedPersona 
}) {
  const { persona } = useOverlay();
  const currentPersona = selectedPersona || persona;

  // Estados
  const [refreshing, setRefreshing] = useState(false);

  // Hooks de datos
  const { kpis, isLoading: kpisLoading } = useKPIs(currentPersona);
  const { data: kraljicData, isLoading: kraljicLoading, isEmpty: kraljicEmpty } = useKraljicData();
  const { contracts, isLoading: contractsLoading, isEmpty: contractsEmpty } = useContractsDue();
  const { rfqs, isLoading: rfqsLoading, isEmpty: rfqsEmpty } = useRFQData();

  // Handlers
  const handleFilterChange = (key, value) => {
    setDashboardFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Simular refresh - en producción dispararía recarga de datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRefreshing(false);
  };

  return (
    <div 
      className="min-h-screen p-6"
      style={{ 
        backgroundColor: TRUSTPORT_TOKENS.colors.main_bg,
        fontFamily: TRUSTPORT_TOKENS.fonts.primary
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 
            className="text-[32px] font-semibold"
            style={{ color: TRUSTPORT_TOKENS.colors.text_strong }}
          >
            SRM — Dashboard
          </h1>
          <p 
            className="text-[16px] mt-2"
            style={{ color: TRUSTPORT_TOKENS.colors.text_muted }}
          >
            Vista ejecutiva: proveedores, ahorros, ciclo, excepciones
          </p>
        </div>

        {/* Filtros */}
        <FiltersBar 
          filters={dashboardFilters}
          onFilterChange={handleFilterChange}
          onRefresh={handleRefresh}
        />

        {/* KPIs */}
        <Suspense fallback={<SkeletonKpiRow />}>
          <KpiRow 
            kpis={kpis}
            isLoading={kpisLoading || refreshing}
          />
        </Suspense>

        {/* AI Chips Panel */}
        <AiChipsPanel persona={currentPersona} />

        {/* Widgets Grid - Fila 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WidgetKraljic 
            data={kraljicData}
            isLoading={kraljicLoading || refreshing}
            isEmpty={kraljicEmpty}
          />
          <WidgetContractsDue 
            contracts={contracts}
            isLoading={contractsLoading || refreshing}
            isEmpty={contractsEmpty}
          />
        </div>

        {/* Widgets Grid - Fila 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WidgetRFQSLA 
            rfqs={rfqs}
            isLoading={rfqsLoading || refreshing}
            isEmpty={rfqsEmpty}
          />
          <WidgetAlerts />
        </div>

        {/* Widget especial solo para operador_logistico */}
        {currentPersona === 'operador_logistico' && (
          <WidgetRankingCarriers persona={currentPersona} />
        )}
      </div>
    </div>
  );
}