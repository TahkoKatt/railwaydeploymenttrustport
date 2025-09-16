import React from 'react';
// Reutilizar el componente de Accounts existente de CRM pero con título en español
import ClientesAccounts from './ClientesAccounts';

const AccountsWrapper = ({ titleOverride = "Clientes" }) => {
  console.log('[CLIENTES-OWNER] Rendering AccountsWrapper');
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{titleOverride}</h2>
        <p className="text-gray-600">Gestión completa de la cartera de clientes</p>
      </div>
      <ClientesAccounts />
    </div>
  );
};

export default AccountsWrapper;