import React, { createContext, useContext } from 'react';

// APIs canónicas de Clientes
import { clientesList, clientesGet, clientesCreate, clientesUpdate, clientesDelete } from '@/api/functions';
import { contactosList, contactosGet, contactosCreate, contactosUpdate } from '@/api/functions';
import { leadsList, leadsCreate, leadsUpdate, leadsDelete, leadsConvert } from '@/api/functions';
import { activitiesList, activitiesCreate, activitiesUpdate } from '@/api/functions';

const ClientesDataBridgeContext = createContext();

// Mapeo de llamadas CRM legacy a APIs canónicas
const apiMappings = {
  // Accounts -> Clientes
  'crm.accounts.list': (params) => {
    console.log('[CLIENTES-OWNER] bridge-hit: accounts.list');
    return clientesList(params);
  },
  'crm.accounts.get': (id) => {
    console.log('[CLIENTES-OWNER] bridge-hit: accounts.get', id);
    return clientesGet(id);
  },
  'crm.accounts.create': (data) => {
    console.log('[CLIENTES-OWNER] bridge-hit: accounts.create');
    return clientesCreate(data);
  },
  'crm.accounts.update': (id, data) => {
    console.log('[CLIENTES-OWNER] bridge-hit: accounts.update', id);
    return clientesUpdate(id, data);
  },
  
  // Contacts -> Contactos
  'crm.contacts.list': (params) => {
    console.log('[CLIENTES-OWNER] bridge-hit: contacts.list');
    return contactosList(params);
  },
  'crm.contacts.create': (data) => {
    console.log('[CLIENTES-OWNER] bridge-hit: contacts.create');
    return contactosCreate(data);
  },
  
  // Leads -> Leads
  'crm.leads.list': (params) => {
    console.log('[CLIENTES-OWNER] bridge-hit: leads.list');
    return leadsList(params);
  },
  'crm.leads.create': (data) => {
    console.log('[CLIENTES-OWNER] bridge-hit: leads.create');
    return leadsCreate(data);
  },
  'crm.leads.update': (id, data) => {
    console.log('[CLIENTES-OWNER] bridge-hit: leads.update', id);
    return leadsUpdate(id, data);
  },
  'crm.leads.convert': (id) => {
    console.log('[CLIENTES-OWNER] bridge-hit: leads.convert', id);
    return leadsConvert(id);
  },
  
  // Activities -> Activities
  'crm.activities.list': (params) => {
    console.log('[CLIENTES-OWNER] bridge-hit: activities.list');
    return activitiesList(params);
  },
  'crm.activities.create': (data) => {
    console.log('[CLIENTES-OWNER] bridge-hit: activities.create');
    return activitiesCreate(data);
  }
};

export const ClientesDataBridgeProvider = ({ children }) => {
  const bridgeCall = async (endpoint, ...args) => {
    const handler = apiMappings[endpoint];
    if (!handler) {
      console.warn('[CLIENTES-OWNER] No mapping found for:', endpoint);
      throw new Error(`Bridge mapping not found: ${endpoint}`);
    }
    return handler(...args);
  };

  return (
    <ClientesDataBridgeContext.Provider value={{ bridgeCall }}>
      {children}
    </ClientesDataBridgeContext.Provider>
  );
};

export const useClientesDataBridge = () => {
  const context = useContext(ClientesDataBridgeContext);
  if (!context) {
    throw new Error('useClientesDataBridge must be used within ClientesDataBridgeProvider');
  }
  return context;
};