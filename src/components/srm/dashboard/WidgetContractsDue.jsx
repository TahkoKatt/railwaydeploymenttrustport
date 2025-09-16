// components/srm/dashboard/WidgetContractsDue.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle } from 'lucide-react';
import { TRUSTPORT_TOKENS, CONTRACT_STATUS_COLORS } from './constants';
import { SkeletonList } from './Skeletons';

const getCardStyle = () => ({
  backgroundColor: TRUSTPORT_TOKENS.colors.surface,
  borderRadius: TRUSTPORT_TOKENS.radius,
  boxShadow: TRUSTPORT_TOKENS.shadow,
  border: `1px solid ${TRUSTPORT_TOKENS.colors.border}`,
});

const ContractItem = ({ contract }) => {
  const getStatusLabel = (status) => {
    const labels = {
      por_renovar: 'Por Renovar',
      renovacion_en_curso: 'Renovación en Curso',
      vencido: 'Vencido',
      activo: 'Activo'
    };
    return labels[status] || status;
  };

  const isUrgent = contract.days <= 15;

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {isUrgent && <AlertTriangle className="w-4 h-4 text-red-500" />}
          <span className="font-medium text-sm">{contract.supplier}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">{contract.contract}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">
            {contract.days > 0 ? `${contract.days} días` : 'Vencido'}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Badge className={CONTRACT_STATUS_COLORS[contract.badge_status]}>
          {getStatusLabel(contract.badge_status)}
        </Badge>
        <span className="text-xs text-gray-500">{contract.ends}</span>
      </div>
    </div>
  );
};

export const WidgetContractsDue = ({ contracts, isLoading, isEmpty }) => {
  if (isLoading) {
    return (
      <Card style={getCardStyle()}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Contratos por Vencer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SkeletonList rows={8} />
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card style={getCardStyle()}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Contratos por Vencer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm" style={{ color: TRUSTPORT_TOKENS.colors.text_muted }}>
                Sin contratos por vencer en 60d
              </p>
              <p className="text-xs mt-1" style={{ color: TRUSTPORT_TOKENS.colors.text_muted }}>
                Todos los contratos están vigentes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const urgentContracts = contracts?.filter(c => c.days <= 15)?.length || 0;

  return (
    <Card style={getCardStyle()}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Contratos por Vencer
          </CardTitle>
          {urgentContracts > 0 && (
            <Badge className="bg-red-100 text-red-800">
              {urgentContracts} urgentes
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {contracts?.map((contract, idx) => (
            <ContractItem key={idx} contract={contract} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};