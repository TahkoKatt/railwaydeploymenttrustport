import React from "react";
import { useLocation } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { ClientesDataBridgeProvider } from "@/components/ClientesDataBridge";

// Importar todos los submódulos de Clientes
import ClientesDashboard from "@/components/clientes/ClientesDashboard";
import ClientesAccounts from "@/components/clientes/ClientesAccounts";
import ClientesLeads from "@/components/clientes/ClientesLeads";
import ClientesActivities from "@/components/clientes/ClientesActivities";
import ClientesMarketing from "@/components/clientes/ClientesMarketing";
import ClientesPostventa from "@/components/clientes/ClientesPostventa";
import ClientesAnalytics from "@/components/clientes/ClientesAnalytics";

const UI_CLIENTES_HEADER_V2 = true; // Feature flag

const renderContent = (tab) => {
  switch (tab) {
    case 'dashboard':
      return <ClientesDashboard />;
    case 'clientes':
      return <ClientesAccounts />;
    case 'leads':
      return <ClientesLeads />;
    case 'actividades':
      return <ClientesActivities />;
    case 'marketing':
      return <ClientesMarketing />;
    case 'postventa':
      return <ClientesPostventa />;
    case 'analytics':
      return <ClientesAnalytics />;
    default:
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Pestaña no encontrada</AlertTitle>
          <AlertDescription>
            La pestaña seleccionada no es válida. Por favor, selecciona una del menú.
          </AlertDescription>
        </Alert>
      );
  }
};

export default function ClientesPage() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const tab = urlParams.get('tab') || 'dashboard';

  console.log('[CLIENTES-OWNER] Rendering Clientes page, tab:', tab);

  return (
    <ClientesDataBridgeProvider>
      <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {!UI_CLIENTES_HEADER_V2 && (
          <div className="space-y-2 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600">Customer master & relationship hub</p>
          </div>
        )}
        {renderContent(tab)}
      </div>
    </ClientesDataBridgeProvider>
  );
}