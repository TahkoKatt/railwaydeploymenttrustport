
import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from 'lucide-react';

// H4: Import estático (no lazy) para eliminar spinners
import RmDashboard from '@/components/rm/dashboard/RmDashboard';
import RmOpportunities from '@/components/rm/opportunities/RmOpportunities';
import RmForecasting from '@/components/rm/forecasting/RmForecasting';
import RmAnalytics from '@/components/rm/analytics/RmAnalytics';

// SHELL-LOCK: Solo 5 tabs permitidos - actualizado para incluir analytics
const RM_SHELL_WHITELIST_TABS = ['dashboard', 'oportunidades', 'cotizaciones', 'forecasting', 'analytics'];

// Feature flags - Solo los permitidos
const featureFlagsStatic = {
  'ff.rm_dashboard': true,
  'ff.rm_opportunities': true, 
  'ff.rm_forecasting': true,
  'ff.ingresos_analytics': true, // Nuevo flag para analytics
};

export default function RMPage() {
    const location = useLocation();
    const navigate = useNavigate();
    
    const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const currentTab = params.get('tab') || 'dashboard';

    const dashboardEnabled = useMemo(() => window?.__ff?.rm_dashboard ?? featureFlagsStatic['ff.rm_dashboard'], []);
    const opportunitiesEnabled = useMemo(() => window?.__ff?.rm_opportunities ?? featureFlagsStatic['ff.rm_opportunities'], []);
    const forecastingEnabled = useMemo(() => window?.__ff?.rm_forecasting ?? featureFlagsStatic['ff.rm_forecasting'], []);
    const analyticsEnabled = useMemo(() => window?.__ff?.ingresos_analytics ?? featureFlagsStatic['ff.ingresos_analytics'], []);

    const isTabAllowed = RM_SHELL_WHITELIST_TABS.includes(currentTab);
    
    // H5: Telemetría unificada con prefijo "rm:" 
    useEffect(() => {
        window?.console?.log(`rm:tab_view.${currentTab}`, JSON.stringify({
            timestamp: new Date().toISOString(),
            user_id: 'current_user',
            ts: Date.now(),
            module: 'ingresos',
            tab: currentTab,
            source_url: location.pathname
        }));
    }, [currentTab, location.pathname]);

    // H2: Redirect Cotizaciones a legacy con telemetría `from=rm`
    useEffect(() => {
        if (currentTab === 'cotizaciones') {
            const legacyParams = new URLSearchParams(params.toString());
            legacyParams.delete('tab');
            const legacyUrl = `/RevenueManagement?tab=cotizaciones&from=rm&${legacyParams.toString()}`;
            window?.console?.log(`rm:redirect.cotizaciones`, { to: legacyUrl, ts: Date.now() });
            window.location.replace(legacyUrl);
            return;
        }
    }, [currentTab, params]);

    // Guardarraíl: Forzar tabs no válidos a dashboard
    useEffect(() => {
        if (!isTabAllowed && currentTab !== 'cotizaciones') {
            window?.console?.log(`rm:shell.invalid_tab`, { tab: currentTab, redirecting_to: 'dashboard' });
            navigate('/rm?tab=dashboard', { replace: true });
        }
    }, [currentTab, isTabAllowed, navigate]);

    // H2: Fallback visual mientras se ejecuta el redirect a Cotizaciones
    if (currentTab === 'cotizaciones') {
        return (
            <div className="flex items-center justify-center h-64" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <p className="ml-4 text-gray-600">Abriendo Cotizaciones (legacy)...</p>
            </div>
        );
    }
    
    return (
        <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <Tabs value={currentTab} className="w-full">
                <div className="w-full">
                    <TabsContent value="dashboard" className="mt-0">
                        {dashboardEnabled ? (
                            <RmDashboard />
                        ) : (
                            <div className="text-center p-8 text-gray-500">Dashboard no disponible</div>
                        )}
                    </TabsContent>

                    <TabsContent value="oportunidades" className="mt-0">
                        {opportunitiesEnabled ? (
                            <RmOpportunities />
                        ) : (
                            <div className="text-center p-8 text-gray-500">Oportunidades no disponible</div>
                        )}
                    </TabsContent>

                    <TabsContent value="forecasting" className="mt-0">
                        {forecastingEnabled ? (
                            <RmForecasting />
                        ) : (
                            <div className="text-center p-8 text-gray-500">Forecasting no disponible</div>
                        )}
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-0">
                        {analyticsEnabled ? (
                            <RmAnalytics />
                        ) : (
                            <div className="text-center p-8 text-gray-500">Analytics no disponible</div>
                        )}
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
