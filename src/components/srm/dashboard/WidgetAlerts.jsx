// components/srm/dashboard/WidgetAlerts.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { TRUSTPORT_TOKENS } from './constants';

const getCardStyle = () => ({
  backgroundColor: TRUSTPORT_TOKENS.colors.surface,
  borderRadius: TRUSTPORT_TOKENS.radius,
  boxShadow: TRUSTPORT_TOKENS.shadow,
  border: `1px solid ${TRUSTPORT_TOKENS.colors.border}`,
});

const mockAlerts = [
  { 
    type: 'warning', 
    message: 'Proveedor Materiales ABC: Score evaluacion bajo (< 80)', 
    priority: 'media',
    timestamp: '2h ago'
  },
  { 
    type: 'info', 
    message: 'Nueva version tarifario Transportes SA disponible', 
    priority: 'baja',
    timestamp: '4h ago'
  },
  { 
    type: 'error', 
    message: 'Bloqueo compliance: Critical Parts Co', 
    priority: 'alta',
    timestamp: '6h ago'
  },
  {
    type: 'warning',
    message: 'Contrato Global Freight vence en 15 dias',
    priority: 'media',
    timestamp: '1d ago'
  },
  {
    type: 'info',
    message: 'RFQ-2024-051 recibio 3 ofertas nuevas',
    priority: 'baja',
    timestamp: '2d ago'
  }
];

const getAlertIcon = (type) => {
  switch (type) {
    case 'error': return AlertCircle;
    case 'warning': return AlertTriangle;
    case 'info': return Info;
    default: return Bell;
  }
};

const getAlertColor = (type) => {
  switch (type) {
    case 'error': return 'text-red-600 bg-red-50';
    case 'warning': return 'text-yellow-600 bg-yellow-50';
    case 'info': return 'text-blue-600 bg-blue-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'alta': return 'bg-red-100 text-red-800';
    case 'media': return 'bg-yellow-100 text-yellow-800';
    case 'baja': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const AlertItem = ({ alert }) => {
  const Icon = getAlertIcon(alert.type);
  const colorClass = getAlertColor(alert.type);

  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-b-0">
      <div className={`p-1 rounded-full ${colorClass}`}>
        <Icon className="w-3 h-3" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{alert.message}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge className={getPriorityColor(alert.priority)} style={{ fontSize: '10px' }}>
            {alert.priority}
          </Badge>
          <span className="text-xs text-gray-500">{alert.timestamp}</span>
        </div>
      </div>
    </div>
  );
};

export const WidgetAlerts = () => {
  const highPriorityCount = mockAlerts.filter(a => a.priority === 'alta').length;

  return (
    <Card style={getCardStyle()}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alertas Recientes
          </CardTitle>
          {highPriorityCount > 0 && (
            <Badge className="bg-red-100 text-red-800">
              {highPriorityCount} alta prioridad
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {mockAlerts.map((alert, idx) => (
            <AlertItem key={idx} alert={alert} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};