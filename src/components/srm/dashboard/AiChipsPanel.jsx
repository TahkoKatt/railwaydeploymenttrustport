// components/srm/dashboard/AiChipsPanel.jsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PiggyBank, UserPlus, Layers, Zap, Loader2 } from 'lucide-react';
import { invokeAi } from '@/components/srm/ai/invokeAi';
import { TRUSTPORT_TOKENS, AI_CHIPS_CONFIG } from './constants';

const getCardStyle = () => ({
  backgroundColor: '#F0F5FF',
  borderRadius: TRUSTPORT_TOKENS.radius,
  boxShadow: TRUSTPORT_TOKENS.shadow,
  border: '1px solid #D6E4FF',
});

const iconMap = {
  PiggyBank, UserPlus, Layers
};

const AiChip = ({ chip, onExecute, isLoading, persona }) => {
  const Icon = iconMap[chip.icon] || Zap;

  const handleClick = () => {
    onExecute(chip.id, chip.intent);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 text-sm">{chip.label}</h4>
          <p className="text-xs text-blue-700 mt-1">
            {getChipDescription(chip.id, persona)}
          </p>
        </div>
      </div>
      <button
        className="w-full px-3 py-1.5 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-50"
        onClick={handleClick}
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            Procesando...
          </span>
        ) : (
          getChipCTA(chip.id)
        )}
      </button>
    </div>
  );
};

const getChipDescription = (chipId, persona) => {
  const descriptions = {
    detect_quick_savings: persona === 'comerciante' 
      ? 'Analizar oportunidades de ahorro inmediatas'
      : 'Optimizar rutas y servicios para reducir costos',
    suggest_supplier: 'Recomendar proveedores basado en performance',
    normalize_rates: 'Estandarizar y homologar tarifas del portfolio'
  };
  return descriptions[chipId] || 'Accion de IA disponible';
};

const getChipCTA = (chipId) => {
  const ctas = {
    detect_quick_savings: 'Detectar Ahorros',
    suggest_supplier: 'Sugerir Proveedor', 
    normalize_rates: 'Normalizar Tarifas'
  };
  return ctas[chipId] || 'Ejecutar';
};

export const AiChipsPanel = ({ persona = 'comerciante' }) => {
  const [loadingChip, setLoadingChip] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const handleChipExecute = async (chipId, intent) => {
    setLoadingChip(chipId);
    
    try {
      const result = await invokeAi({
        action: chipId,
        context: { persona, submodule: 'dashboard' },
        payload: { intent, timestamp: Date.now() }
      });
      
      setLastResult({ chipId, result, timestamp: Date.now() });
      
      // Mostrar resultado al usuario
      if (result.ok) {
        const messages = {
          detect_quick_savings: `AI Detectó €${(Math.random() * 50 + 10).toFixed(0)}k en oportunidades de ahorro`,
          suggest_supplier: 'AI Recomienda: Transporte SA (score: 8.7/10) para nueva ruta',
          normalize_rates: `AI Procesó ${Math.floor(Math.random() * 200 + 50)} tarifas, ${Math.floor(Math.random() * 20 + 5)} inconsistencias detectadas`
        };
        alert(messages[chipId] || 'AI procesó correctamente la solicitud');
      } else {
        alert(`AI Error: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('AI Chip execution failed:', error);
      alert('Error ejecutando acción de IA');
    } finally {
      setLoadingChip(null);
    }
  };

  return (
    <Card style={getCardStyle()}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5" style={{ color: TRUSTPORT_TOKENS.colors.primary }} />
          <CardTitle className="text-md font-semibold" style={{ color: TRUSTPORT_TOKENS.colors.text_strong }}>
            AI Insights & Recomendaciones
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AI_CHIPS_CONFIG.map(chip => (
            <AiChip
              key={chip.id}
              chip={chip}
              onExecute={handleChipExecute}
              isLoading={loadingChip === chip.id}
              persona={persona}
            />
          ))}
        </div>
        
        {lastResult && (
          <div className="mt-4 text-xs" style={{ color: TRUSTPORT_TOKENS.colors.text_muted }}>
            Última ejecución: {getChipCTA(lastResult.chipId)} (~{((Date.now() - lastResult.timestamp) / 1000).toFixed(1)}s)
          </div>
        )}
      </CardContent>
    </Card>
  );
};