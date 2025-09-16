
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, UserCheck, Construction } from "lucide-react"; // Removed Terminal as it was unused
import ControlledError from "@/components/ui/ControlledError";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Importar todos los componentes de los sub-módulos
import DashboardCompras from "@/components/compras/DashboardCompras";
import PendientesList from "@/components/compras/PendientesList";
import EnhancedPurchaseOrdersList from "@/components/compras/EnhancedPurchaseOrdersList";
import POServiciosList from "@/components/compras/POServiciosList";
import FacturasMatchCenter from "@/components/compras/FacturasMatchCenter";
import LandedCostEngine from "@/components/compras/LandedCostEngine";
import DevolucionesNotasDebito from "@/components/compras/DevolucionesNotasDebito";
import AnalyticsCompras from "@/components/compras/AnalyticsCompras";

// --- Canary & Preview Logic ---
const CANARY_CONFIG = {
  tenant_id: "tnt-demo-trustport-001",
  comerciante_user_ids: ["usr_comerciante_01", "usr_comerciante_02", "usr_comerciante_03"],
  operador_user_ids: ["usr_operador_01", "usr_operador_02"],
};

// Simula la obtención del usuario actual
const useCurrentUser = () => {
    // Para la demo, ciclamos entre los usuarios para ver los diferentes estados.
    const [currentUser, setCurrentUser] = useState(CANARY_CONFIG.comerciante_user_ids[0]);
    
    useEffect(() => {
        const interval = setInterval(() => {
            const allUsers = [...CANARY_CONFIG.comerciante_user_ids, ...CANARY_CONFIG.operador_user_ids];
            const currentIndex = allUsers.indexOf(currentUser);
            const nextIndex = (currentIndex + 1) % allUsers.length;
            setCurrentUser(allUsers[nextIndex]);
        }, 30000); 
        return () => clearInterval(interval);
    }, [currentUser]);

    return {
        id: currentUser,
        profile: CANARY_CONFIG.comerciante_user_ids.includes(currentUser) ? 'comerciante' : 'operador'
    };
};

const useFeatureFlag = (flagName) => {
    const currentUser = useCurrentUser();
    
    // Reglas de Flags consolidadas
    const rules = {
      // For "FULL activation", these flags now return true unconditionally,
      // as the features are considered fully stable and released.
      "po_services.read_from_v2": () => true, // Fully active
      "po_goods.ui_preview_v2": () => true,   // Fully active, no longer a preview
      "ac.v2.ui": () => true,                 // Fully active
      "nav_v2_whitelist": () => true // For demo, still forced to true
    };

    if (rules[flagName]) {
        return rules[flagName](currentUser);
    }
    
    return false; // Default a 'off'
};

const submodules_v2 = {
  "dashboard-compras": { name: "Dashboard", component: DashboardCompras, version: 2 },
  "action-center": { name: "Action Center", component: PendientesList, version: 2 },
  "po-bienes": { name: "OC Bienes", component: EnhancedPurchaseOrdersList, version: 2 }, // Name changed to "OC Bienes"
  "po-servicios": { name: "OC Servicios", component: POServiciosList, version: 2 },       // Name changed to "OC Servicios"
  "landed-cost": { name: "Landed Cost", component: LandedCostEngine, version: 2 },
  "facturas": { name: "Facturas", component: FacturasMatchCenter, version: 2 },
  "analytics": { name: "Analytics", component: AnalyticsCompras, version: 2 },             // Name changed to "Analytics"
  "devoluciones-notas": { name: "Devoluciones", component: DevolucionesNotasDebito, version: 2 }
};

const aliases_v1_to_v2 = {
    "dashboard": "dashboard-compras",
    "pendientes": "action-center",
    "ordenes-de-compra": "po-bienes",
    "devoluciones-y-sac": "devoluciones-notas",
    "requisiciones": "action-center?preset=pending_approval",
    "pedidos-multicanal": "/ecommerce?tab=orders"
};

const TabMovedCard = ({ newDestination }) => (
  <Card className="m-auto max-w-lg">
    <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Construction className="w-5 h-5 text-yellow-500" />
            Submódulo Actualizado
        </CardTitle>
    </CardHeader>
    <CardContent className="text-center">
      <p>Este submódulo se ha movido a una nueva ubicación para mejorar la navegación.</p>
      <Button asChild className="mt-4">
        <a href={`/Compras?tab=${newDestination}`}>Ir a {newDestination}</a>
      </Button>
    </CardContent>
  </Card>
);

const LEGACY_TABS_WITH_STUBS = ["cotizaciones", "inventario-y-precios", "proveedores"];

export default function Compras() {
  // CORRECCIÓN: Todos los hooks se mueven al principio del componente.
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentUser = useCurrentUser();
  // These flags will now always resolve to 'true' due to the updated useFeatureFlag hook
  const isSPOv2Active = useFeatureFlag('po_services.read_from_v2');
  const isPOGoodsPreviewActive = useFeatureFlag('po_goods.ui_preview_v2');
  const isACv2Active = useFeatureFlag('ac.v2.ui');
  const [error, setError] = useState(null);
  
  // La lógica de negocio permanece después de los hooks.
  let tab = searchParams.get("tab") || "dashboard";
  let resolvedTab = tab;
  let redirectUrl = null;

  if (aliases_v1_to_v2[tab]) {
    const newRoute = aliases_v1_to_v2[tab];
    if (newRoute.startsWith('/')) {
      redirectUrl = newRoute;
    } else {
      resolvedTab = newRoute.split('?')[0];
    }
  }

  useEffect(() => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
      return;
    }
    
    try {
      const asciiOnlyRegex = /^[a-zA-Z0-9_-]+$/;
      if (!resolvedTab || !asciiOnlyRegex.test(resolvedTab)) {
         throw new Error(`El tab "${resolvedTab}" contiene caracteres invalidos.`);
      }
      if (!submodules_v2[resolvedTab] && !LEGACY_TABS_WITH_STUBS.includes(resolvedTab)) {
        throw new Error(`El tab "${resolvedTab}" no existe.`);
      }
      setError(null);
    } catch (e) {
      setError({
        title: "Error de Ruta Invalida",
        message: e.message,
        code: 'ASCII_VALIDATION_FAILED',
        fallbackLabel: 'Ir al Dashboard de Compras'
      });
    }
  }, [resolvedTab, redirectUrl]); // Dependencies added to useEffect

  if (redirectUrl) {
    return null; // Muestra una pantalla en blanco mientras redirige
  }

  if (error) {
    return (
      <ControlledError
        error={error}
        onGoHome={() => window.location.search = '?tab=dashboard-compras'}
        onGoBack={() => window.history.back()}
      />
    );
  }

  if (LEGACY_TABS_WITH_STUBS.includes(resolvedTab)) {
      return <TabMovedCard newDestination="action-center" />;
  }

  const ActiveComponent = submodules_v2[resolvedTab]?.component;
  // With "Activación FULL", the features are no longer in preview or canary mode.
  // The isPreview and isCanary flags are set to false to reflect the stable state.
  const isPreview = false;
  const isCanary = false;

  return (
    <div className="space-y-4">
      {/* Removed previous Alert components as the features are now fully active and out of preview/canary mode. */}
      {ActiveComponent ? <ActiveComponent isPreview={isPreview} isCanary={isCanary} /> : <TabMovedCard newDestination="dashboard-compras" />}
    </div>
  );
}
