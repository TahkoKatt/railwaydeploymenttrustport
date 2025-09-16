import React from 'react';
import ClientesMarketing from './ClientesMarketing';

const MarketingWrapper = () => {
  console.log('[CLIENTES-OWNER] Rendering MarketingWrapper');
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Marketing</h2>
        <p className="text-gray-600">Campañas, segmentos, plantillas y sequences con IA</p>
      </div>
      <ClientesMarketing />
    </div>
  );
};

export default MarketingWrapper;