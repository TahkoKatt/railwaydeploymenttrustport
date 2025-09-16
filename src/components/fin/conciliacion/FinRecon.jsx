import React, { useState } from 'react';
import { GitMerge, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import finTokens from '../config/tokens.json';
import overlaysConfig from '../config/overlays.json';

// Mock AI insights for Reconciliation
const mockReconInsights = [
  {
    id: 'recon_matcher',
    icon: CheckCircle,
    title: 'Recon Matcher',
    desc: 'Auto-match de 18 líneas con confianza > 95%',
    cta: { label: 'Aplicar matches', action: 'apply_auto_matches' }
  },
  {
    id: 'exceptions_handler',
    icon: AlertTriangle,
    title: 'Exceptions Handler', 
    desc: '3 excepciones requieren revisión manual',
    cta: { label: 'Revisar queue', action: 'open_exceptions_queue' }
  }
];

const FinRecon = ({ persona = 'comerciante', debug = false }) => {
  const [currentPanel, setCurrentPanel] = useState('bank_lines');

  const getTrustportCardStyle = () => ({
    backgroundColor: finTokens.colors.surface,
    borderRadius: `${finTokens.radius}px`,
    boxShadow: finTokens.shadow,
    fontFamily: finTokens.font_family,
    border: `1px solid ${finTokens.colors.border}`,
  });

  const handleAIAction = (action) => {
    console.log('[FIN-RECON] AI Action:', action);
    
    switch (action) {
      case 'apply_auto_matches':
        console.log('[FIN-EVENT] fin:recon.auto_matches.applied emitted');
        break;
      case 'open_exceptions_queue':
        console.log('[FIN-RECON] Opening exceptions queue');
        break;
    }
  };

  const handleRowAction = (action, row) => {
    console.log('[FIN-RECON] Row action:', action, row);
    
    switch (action) {
      case 'match':
        console.log('[FIN-EVENT] fin:recon.manual_match emitted');
        break;
      case 'split':
        console.log('[FIN-RECON] Opening split dialog');
        break;
      case 'create_adjustment':
        console.log('[FIN-EVENT] fin:journal.adjustment.created emitted');
        break;
    }
  };

  // Get Recon config from overlays
  const reconConfig = overlaysConfig.conciliacion || {};
  const personaConfig = reconConfig[persona] || {};

  const panels = ['bank_lines', 'book_entries', 'suggestions'];

  if (debug) {
    console.log('[FIN-DEBUG] FinRecon render:', {
      persona,
      currentPanel,
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
              Conciliación Bancaria
            </h1>
            <p className="text-[14px] mt-1" style={{ color: finTokens.colors.text_muted }}>
              Conciliación automática y manual de extractos bancarios
            </p>
          </div>

          {/* AI Insights */}
          <Card style={{ ...getTrustportCardStyle(), backgroundColor: '#F0F5FF', borderColor: '#D6E4FF' }}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <GitMerge className="w-5 h-5" style={{ color: finTokens.colors.primary }} />
                <CardTitle className="text-md font-semibold" style={{ color: finTokens.colors.primary }}>
                  AI Insights - Conciliación
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockReconInsights.map(insight => (
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

          {/* Three Panel Workspace */}
          <Card style={getTrustportCardStyle()} className="flex-1 min-h-0">
            <CardHeader>
              <CardTitle className="text-md font-semibold">Workspace - Layout 3 Paneles</CardTitle>
              <div className="flex gap-2 mt-2">
                {panels.map(panel => (
                  <button
                    key={panel}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      currentPanel === panel 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentPanel(panel)}
                  >
                    {panel === 'bank_lines' ? 'Líneas Banco' : 
                     panel === 'book_entries' ? 'Asientos Libro' : 'Sugerencias'}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              <div className="h-full flex">
                {/* Mock three-panel layout */}
                <div className="flex-1 border-r border-gray-200 p-4">
                  <h4 className="font-semibold mb-3">Panel: {currentPanel}</h4>
                  <div className="text-center text-gray-500">
                    <GitMerge className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">
                      {currentPanel === 'bank_lines' && 'Líneas del extracto bancario'}
                      {currentPanel === 'book_entries' && 'Asientos del libro mayor'}
                      {currentPanel === 'suggestions' && 'Sugerencias de matching IA'}
                    </p>
                    <div className="mt-4 space-y-2">
                      <button 
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        onClick={() => handleRowAction('match', { type: currentPanel })}
                      >
                        Match Manual
                      </button>
                      <button 
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        onClick={() => handleRowAction('split', { type: currentPanel })}
                      >
                        Split
                      </button>
                      <button 
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        onClick={() => handleRowAction('create_adjustment', { type: currentPanel })}
                      >
                        Crear Ajuste
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="w-80 p-4 bg-gray-50">
                  <h4 className="font-semibold mb-3">Reglas & Thresholds</h4>
                  <div className="space-y-2 text-sm">
                    <div>• Exact amount+ref → conf 0.95</div>
                    <div>• Amount±5%+date±2 → conf 0.85</div> 
                    <div>• Fuzzy → conf 0.6</div>
                    <div className="mt-3 text-xs text-gray-600">
                      Auto-approve ≥0.95 | Manual ≥0.6
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinRecon;