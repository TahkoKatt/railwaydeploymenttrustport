import React from 'react';
import ClientesActivities from './ClientesActivities';

const ActivitiesWrapper = ({ titleOverride = "Actividades" }) => {
  console.log('[CLIENTES-OWNER] Rendering ActivitiesWrapper');
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{titleOverride}</h2>
        <p className="text-gray-600">Conversaciones, tareas, emails y llamadas con SLA</p>
      </div>
      <ClientesActivities />
    </div>
  );
};

export default ActivitiesWrapper;