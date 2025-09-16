import React from 'react';
import ClientesPostventa from './ClientesPostventa';

const PostventaWrapper = () => {
  console.log('[CLIENTES-OWNER] Rendering PostventaWrapper');
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Postventa</h2>
        <p className="text-gray-600">Soporte, NPS con theming IA y gestión de cobranza</p>
      </div>
      <ClientesPostventa />
    </div>
  );
};

export default PostventaWrapper;