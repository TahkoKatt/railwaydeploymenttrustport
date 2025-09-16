import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import routingConfig from '@/components/fin/config/routing-map.json';

// Lazy load components
const FinDashboard = React.lazy(() => import('@/components/fin/dashboard/FinDashboard'));
const FinAR = React.lazy(() => import('@/components/fin/ar/FinAR'));
const FinAP = React.lazy(() => import('@/components/fin/ap/FinAP'));
const FinBilling = React.lazy(() => import('@/components/fin/facturacion/FinBilling'));
const FinCash = React.lazy(() => import('@/components/fin/cash/FinCash'));
const FinRecon = React.lazy(() => import('@/components/fin/conciliacion/FinRecon'));
const FinTax = React.lazy(() => import('@/components/fin/impuestos/FinTax'));
const FinAnalytics = React.lazy(() => import('@/components/fin/analytics/FinAnalytics'));

const componentMap = {
  'FinDashboard': FinDashboard,
  'FinAR': FinAR,
  'FinAP': FinAP,
  'FinBilling': FinBilling,
  'FinCash': FinCash,
  'FinRecon': FinRecon,
  'FinTax': FinTax,
  'FinAnalytics': FinAnalytics
};

const validateSlug = (slug) => {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug);
};

const getNamespace = (slug) => {
  return `fin.${slug}.v2`;
};

const Fin404 = ({ slug }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Ruta no válida</h1>
    <p className="text-gray-600 mb-6">/fin/{slug} no es una ruta válida</p>
    <p className="text-sm text-gray-500">
      Rutas válidas: {routingConfig.canonical_slugs.join(', ')}
    </p>
  </div>
);

export default function Fin() {
  const location = useLocation();
  const [debugMode, setDebugMode] = useState(false);
  
  // Extract slug from path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const slug = pathSegments[1] || 'dashboard'; // Default to dashboard

  // React hooks must be called before any early returns
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    setDebugMode(urlParams.get('debug') === '1');
  }, [location.search]);

  // Emit telemetry
  useEffect(() => {
    if (routingConfig.canonical_slugs.includes(slug)) {
      console.log(`[FIN-TELEMETRY] Route accessed: /fin/${slug}, namespace: ${getNamespace(slug)}`);
    }
  }, [slug]);

  // Validate slug
  if (!validateSlug(slug)) {
    return <Fin404 slug={slug} />;
  }

  // Check if slug is in allowlist
  if (!routingConfig.canonical_slugs.includes(slug)) {
    return <Fin404 slug={slug} />;
  }

  // Find component
  const route = routingConfig.routes[`/fin/${slug}`];
  if (!route) {
    return <Fin404 slug={slug} />;
  }

  const Component = componentMap[route.component];
  if (!Component) {
    return <Fin404 slug={`${slug} (component not found)`} />;
  }

  return (
    <React.Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Cargando...</div>}>
      <Component debug={debugMode} namespace={getNamespace(slug)} />
    </React.Suspense>
  );
}