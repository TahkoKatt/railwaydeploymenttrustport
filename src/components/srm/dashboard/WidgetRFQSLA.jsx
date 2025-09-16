// components/srm/dashboard/WidgetRFQSLA.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertCircle } from 'lucide-react';
import { TRUSTPORT_TOKENS } from './constants';
import { SkeletonTable } from './Skeletons';

const getCardStyle = () => ({
  backgroundColor: TRUSTPORT_TOKENS.colors.surface,
  borderRadius: TRUSTPORT_TOKENS.radius,
  boxShadow: TRUSTPORT_TOKENS.shadow,
  border: `1px solid ${TRUSTPORT_TOKENS.colors.border}`,
});

const getSLAColor = (sla) => {
  switch (sla) {
    case 'OK': return 'bg-green-100 text-green-800';
    case 'Warning': return 'bg-yellow-100 text-yellow-800';
    case 'Overdue': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status) => {
  if (status.includes('evaluacion')) return 'bg-blue-100 text-blue-800';
  if (status.includes('Esperando')) return 'bg-yellow-100 text-yellow-800';
  if (status.includes('Escalado')) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
};

const RFQRow = ({ rfq }) => (
  <tr className="border-b border-gray-100">
    <td className="py-2 pr-4">
      <span className="font-medium text-sm">{rfq.rfq}</span>
      <div className="text-xs text-gray-500">{rfq.requester}</div>
    </td>
    <td className="py-2 pr-4">
      <span className="text-sm">{rfq.lane}</span>
    </td>
    <td className="py-2 pr-4 text-center">
      <span className="text-sm font-medium">{rfq.respuestas}</span>
    </td>
    <td className="py-2 pr-4">
      <div className="flex flex-col gap-1">
        <Badge className={getSLAColor(rfq.sla)} style={{ fontSize: '10px' }}>
          {rfq.sla}
        </Badge>
        <span className="text-xs text-gray-500">
          {rfq.sla_restante > 0 ? `${rfq.sla_restante}d restantes` : 'Vencida'}
        </span>
      </div>
    </td>
    <td className="py-2">
      <Badge className={getStatusColor(rfq.status)} style={{ fontSize: '10px' }}>
        {rfq.status}
      </Badge>
    </td>
  </tr>
);

export const WidgetRFQSLA = ({ rfqs, isLoading, isEmpty }) => {
  if (isLoading) {
    return (
      <Card style={getCardStyle()}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            RFQs & SLA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SkeletonTable rows={5} />
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card style={getCardStyle()}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            RFQs & SLA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm" style={{ color: TRUSTPORT_TOKENS.colors.text_muted }}>
                Sin RFQs activas o en evaluación
              </p>
              <p className="text-xs mt-1" style={{ color: TRUSTPORT_TOKENS.colors.text_muted }}>
                Crea nuevas solicitudes de cotización
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overdueCount = rfqs?.filter(rfq => rfq.sla === 'Overdue')?.length || 0;

  return (
    <Card style={getCardStyle()}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            RFQs & SLA
          </CardTitle>
          {overdueCount > 0 && (
            <Badge className="bg-red-100 text-red-800">
              {overdueCount} vencidas
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="pb-2 pr-4">RFQ</th>
                <th className="pb-2 pr-4">Lane</th>
                <th className="pb-2 pr-4 text-center">Resp.</th>
                <th className="pb-2 pr-4">SLA</th>
                <th className="pb-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rfqs?.map((rfq, idx) => (
                <RFQRow key={idx} rfq={rfq} />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};