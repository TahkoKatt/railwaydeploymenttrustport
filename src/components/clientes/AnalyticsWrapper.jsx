import React from 'react';
import ClientesAnalytics from './ClientesAnalytics';

const AnalyticsWrapper = () => {
  console.log('[CLIENTES-OWNER] Rendering AnalyticsWrapper');
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Analytics</h2>
        <p className="text-gray-600">Funnel, cohortes, cobranza, churn e insights con IA</p>
      </div>
      <ClientesAnalytics />
    </div>
  );
};

export default AnalyticsWrapper;