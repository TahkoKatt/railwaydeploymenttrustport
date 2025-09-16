import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Filter, Zap } from 'lucide-react';
import finTokens from '../config/tokens.json';

const DashboardShell = ({ 
  title, 
  subtitle, 
  kpis = [], 
  widgets = [], 
  aiInsights = [],
  children,
  filters = [],
  onFilterChange = () => {},
  debug = false
}) => {
  const getTrustportCardStyle = () => ({
    backgroundColor: finTokens.colors.surface,
    borderRadius: `${finTokens.radius}px`,
    boxShadow: finTokens.shadow,
    fontFamily: finTokens.font_family,
    border: `1px solid ${finTokens.colors.border}`,
  });

  const renderKPIs = () => {
    if (!kpis.length) return null;
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.id || index} className="hover:shadow-lg transition-shadow" style={getTrustportCardStyle()}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 truncate">{kpi.label}</p>
                    <p className="text-2xl font-semibold text-gray-900 truncate">
                      {kpi.formattedValue || kpi.value}
                    </p>
                    {kpi.delta && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-gray-500">{kpi.delta}</span>
                      </div>
                    )}
                  </div>
                  {Icon && (
                    <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${kpi.color || finTokens.colors.primary}20` }}>
                      <Icon className="w-5 h-5" style={{ color: kpi.color || finTokens.colors.primary }} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderAIPanel = () => {
    if (!aiInsights.length) return null;

    return (
      <Card style={{ ...getTrustportCardStyle(), backgroundColor: '#F0F5FF', borderColor: '#D6E4FF' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: finTokens.colors.primary }} />
            <CardTitle className="text-md font-semibold" style={{ color: finTokens.colors.primary }}>
              AI Insights & Recomendaciones
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiInsights.map(insight => (
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
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                  onClick={() => insight.cta?.action && console.log(`AI Action: ${insight.cta.action}`)}
                >
                  {insight.cta?.label || 'Ver detalles'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto" style={{ backgroundColor: finTokens.colors.bg_page }}>
      <div className="flex-1 min-h-0 p-6">
        <div className="max-w-7xl mx-auto space-y-6 h-full">
          {/* Header Block */}
          <div>
            <h1 className="text-[28px] font-semibold" style={{ fontFamily: finTokens.font_family, color: finTokens.colors.text_strong }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-[14px] mt-1" style={{ color: finTokens.colors.text_muted }}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Debug Info */}
          {debug && (
            <Card style={getTrustportCardStyle()}>
              <CardContent className="p-4">
                <div className="text-xs font-mono">
                  <p><strong>Module:</strong> fin</p>
                  <p><strong>Resolved Route:</strong> {window.location.pathname}</p>
                  <p><strong>Namespace:</strong> fin.{window.location.pathname.split('/').pop()}.v2</p>
                  <p><strong>Schema Shape:</strong> {kpis.length > 0 ? 'dashboard' : 'workview'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters Row */}
          {filters.length > 0 && (
            <Card style={getTrustportCardStyle()}>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Filtros:</span>
                  </div>
                  {filters.map((filter, index) => (
                    <Select key={index} onValueChange={(value) => onFilterChange(filter.key, value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={filter.label} />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ))}
                  <Button style={{ backgroundColor: finTokens.colors.primary, color: 'white' }}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualizar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* KPI Row */}
          {renderKPIs()}

          {/* AI Panel */}
          {renderAIPanel()}

          {/* Custom Content */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardShell;