import React from 'react';
import ClientesLeads from './ClientesLeads';

const LeadsWrapper = () => {
  console.log('[CLIENTES-OWNER] Rendering LeadsWrapper');
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Leads</h2>
        <p className="text-gray-600">Pipeline de oportunidades y gestión de prospectos</p>
      </div>
      <ClientesLeads />
    </div>
  );
};

export default LeadsWrapper;