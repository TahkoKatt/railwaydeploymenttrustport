// components/srm/dashboard/KpiRow.jsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, CheckCircle, Clock, FileText, AlertTriangle } from 'lucide-react';
import { TRUSTPORT_TOKENS, KPI_CONFIG } from './constants';
import { SkeletonKpiRow } from './Skeletons';

const getCardStyle = () => ({
  backgroundColor: TRUSTPORT_TOKENS.colors.surface,
  borderRadius: TRUSTPORT_TOKENS.radius,
  boxShadow: TRUSTPORT_TOKENS.shadow,
  border: `1px solid ${TRUSTPORT_TOKENS.colors.border}`,
});

const iconMap = {
  Users, TrendingUp, CheckCircle, Clock, FileText, AlertTriangle
};

const KpiCard = ({ kpiKey, config, data }) => {
  const Icon = iconMap[config.icon] || TrendingUp;
  const value = data.value;
  const formattedValue = config.format === 'percent' ? `${value}%` : 
                       config.format === 'currency' ? `€${value}k` :
                       value?.toLocaleString?.() || value;

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return TRUSTPORT_TOKENS.colors.success;
      case 'warning': return TRUSTPORT_TOKENS.colors.warning;
      case 'danger': return TRUSTPORT_TOKENS.colors.danger;
      default: return TRUSTPORT_TOKENS.colors.primary;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow" style={getCardStyle()}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <p className="text-xs font-medium" style={{ color: TRUSTPORT_TOKENS.colors.text_muted }}>
              {config.label}
            </p>
            <p className="text-2xl font-semibold mt-1" style={{ color: TRUSTPORT_TOKENS.colors.text_strong }}>
              {formattedValue}
            </p>
          </div>
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${getStatusColor(data.status)}20` }}
          >
            <Icon className="w-5 h-5" style={{ color: getStatusColor(data.status) }} />
          </div>
        </div>
        {data.trend && (
          <p className={`text-xs font-medium ${data.status === 'danger' ? 'text-red-600' : 'text-green-600'}`}>
            <TrendingUp className="inline w-3 h-3 mr-1" />
            {data.trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export const KpiRow = ({ kpis, isLoading }) => {
  if (isLoading) return <SkeletonKpiRow />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {Object.entries(KPI_CONFIG).map(([key, config]) => {
        const data = kpis?.[key];
        if (!data) return null;
        
        return (
          <KpiCard 
            key={key}
            kpiKey={key}
            config={config}
            data={data}
          />
        );
      })}
    </div>
  );
};