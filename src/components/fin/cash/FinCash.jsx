import React, { useState } from 'react';
import { Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import finTokens from '../config/tokens.json';
import overlaysConfig from '../config/overlays.json';

// Mock AI insights for Cash
const mockCashInsights = [
  {
    id: 'cash_forecast',
    icon: TrendingUp,
    title: 'Cash Forecast 13W',
    desc: 'Deficit esperado de €25K en semana 3',
    cta: { label: 'Ver forecast', action: 'open_forecast_detail' }
  },
  {
    id: 'collection_plan',
    icon: Calendar,
    title: 'Plan Cobros 14D',
    desc: 'Optimizar secuencia para maximizar cash',
    cta: { label: 'Crear plan', action: 'create_collection_plan' }
  }
];

const FinCash = ({ persona = 'comerciante', debug = false }) => {
  const [currentView, setCurrentView] = useState('week');

  const getTrustportCardStyle = () => ({
    backgroundColor: finTokens.colors.surface,
    borderRadius: `${finTokens.radius}px`,
    boxShadow: finTokens.shadow,
    fontFamily: finTokens.font_family,
    border: `1px solid ${finTokens.colors.border}`,
  });

  const handleAIAction = (action) => {
    console.log('[FIN-CASH] AI Action:', action);
    
    switch (action) {
      case 'open_forecast_detail':
        console.log('[FIN-CASH] Opening forecast detail view');
        break;
      case 'create_collection_plan':
        console.log('[FIN-EVENT] fin:ar.plan.create emitted');
        break;
      case 'emit:fin.ar.plan.create.short':
        console.log('[FIN-EVENT] fin:ar.plan.create.short emitted');
        break;
      case 'emit:fin.ap.batch.optimize.sequence':
        console.log('[FIN-EVENT] fin:ap.batch.optimize.sequence emitted');
        break;
    }
  };

  // Get Cash config from overlays
  const cashConfig = overlaysConfig.cash || {};
  const personaConfig = cashConfig[persona] || {};

  if (debug) {
    console.log('[FIN-DEBUG] FinCash render:', {
      persona,
      currentView,
      personaConfig
    });
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: finTokens.colors.bg_page }}>
      <div className="flex-1 min-h-0 p-6">
        <div className="space-y-6 h-full flex flex-col">
          {/* Header */}
          <div>
            <h1 className="text-[28px] font-semibold" style={{ fontFamily: finTokens.font_family, color: finTokens.colors.text_strong }}>
              Tesorería (Cash)
            </h1>
            <p className="text-[14px] mt-1" style={{ color: finTokens.colors.text_muted }}>
              Forecast de tesorería, calendario de pagos y cobros
            </p>
          </div>

          {/* AI Insights */}
          <Card style={{ ...getTrustportCardStyle(), backgroundColor: '#F0F5FF', borderColor: '#D6E4FF' }}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: finTokens.colors.primary }} />
                <CardTitle className="text-md font-semibold" style={{ color: finTokens.colors.primary }}>
                  AI Insights - Cash
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockCashInsights.map(insight => (
                  <div key={insight.id} className="bg-white/50 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <insight.icon className="w-4 h-4" style={{ color: finTokens.colors.primary }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-blue-900 text-sm">{insight.title}</h4>
                        <p className="text-xs text-blue-700 mt-1">{insight.desc}</p>
                      </div>
                    </div>
                    <button
                      className="w-full mt-2 px-3 py-2 text-sm border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      onClick={() => handleAIAction(insight.cta.action)}
                    >
                      {insight.cta.label}
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions per Persona */}
          {personaConfig.quick_actions && (
            <Card style={getTrustportCardStyle()}>
              <CardHeader>
                <CardTitle className="text-md font-semibold">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {personaConfig.quick_actions.map(action => (
                    <button
                      key={action.label}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => handleAIAction(action.action)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Calendar View Placeholder */}
          <Card style={getTrustportCardStyle()} className="flex-1 min-h-0">
            <CardHeader>
              <CardTitle className="text-md font-semibold">Cash Flow Calendar - {currentView}</CardTitle>
              <div className="flex gap-2 mt-2">
                {['week', 'month'].map(view => (
                  <button
                    key={view}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      currentView === view 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentView(view)}
                  >
                    {view === 'week' ? 'Semanal' : 'Mensual'}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Vista de Calendario Cash Flow</h3>
                <p className="text-sm">
                  Componentes: Pagos programados, Cobros proyectados, Posición neta
                </p>
                <p className="text-xs mt-2 text-blue-600">
                  Vista {currentView} - Namespace: fin.cash.v2
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinCash;