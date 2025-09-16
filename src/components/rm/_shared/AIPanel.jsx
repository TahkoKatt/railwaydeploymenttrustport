import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, AlertTriangle, TrendingUp, Loader2, XCircle } from "lucide-react";

const AIPanel = ({ chips = [], loading, error, onAction, onDismiss }) => {
  const getChipIcon = (type) => {
    const icons = {
      forecast_assistant: TrendingUp,
      risk_check: AlertTriangle,
      win_likelihood: Zap,
      margin_guard: AlertTriangle,
    };
    return icons[type] || Zap;
  };
  
  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'border-red-500 bg-red-50',
      warn: 'border-yellow-500 bg-yellow-50',
      info: 'border-blue-200 bg-blue-50',
    };
    return colors[severity] || 'border-gray-200 bg-gray-50';
  }

  return (
    <Card 
      className={`transition-all ${getSeverityColor(chips[0]?.severity || 'info')}`}
      style={{ 
        borderRadius: '16px', 
        fontFamily: 'Montserrat, sans-serif',
        boxShadow: '0 6px 18px rgba(0,0,0,.06)'
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-md font-semibold text-blue-800">
                AI Insights & Recomendaciones
              </CardTitle>
            </div>
            {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
            <div className="text-red-600 flex items-center gap-2 text-sm">
                <XCircle className="w-4 h-4"/>
                <span>Error al obtener insights: {error}</span>
            </div>
        )}
        {!loading && !error && chips.length === 0 && (
            <div className="text-gray-500 text-sm">No hay recomendaciones de IA por ahora.</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {chips.slice(0, 3).map(chip => {
            const IconComponent = getChipIcon(chip.chip);
            return (
              <div 
                key={chip.chip} 
                data-chip={chip.chip}
                className="bg-white/80 rounded-lg p-4 flex flex-col justify-between shadow-sm border"
              >
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 text-sm">{chip.title}</h4>
                      <p className="text-xs text-blue-700 mt-1">{chip.subtitle}</p>
                    </div>
                  </div>
                </div>
                {chip.actions.map(action => (
                    <Button
                      key={action.action_id}
                      size="sm"
                      variant="outline"
                      className="w-full mt-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                      onClick={() => onAction(action.action_id, chip)}
                    >
                      {action.label}
                    </Button>
                ))}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(AIPanel);