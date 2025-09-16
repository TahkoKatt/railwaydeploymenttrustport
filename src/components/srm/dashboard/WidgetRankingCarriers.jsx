// components/srm/dashboard/WidgetRankingCarriers.jsx - Solo para operador_logistico
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, TrendingUp, Star } from 'lucide-react';
import { TRUSTPORT_TOKENS } from './constants';

const getCardStyle = () => ({
  backgroundColor: TRUSTPORT_TOKENS.colors.surface,
  borderRadius: TRUSTPORT_TOKENS.radius,
  boxShadow: TRUSTPORT_TOKENS.shadow,
  border: `1px solid ${TRUSTPORT_TOKENS.colors.border}`,
});

const mockCarriers = [
  { carrier: "Maersk Line", reliability: 96.8, transit_time: "18.2 dias", incidents: 2, score: 9.2 },
  { carrier: "CMA CGM", reliability: 94.1, transit_time: "19.5 dias", incidents: 5, score: 8.7 },
  { carrier: "MSC", reliability: 92.3, transit_time: "17.8 dias", incidents: 8, score: 8.1 },
  { carrier: "Hapag Lloyd", reliability: 95.2, transit_time: "18.9 dias", incidents: 3, score: 8.9 },
  { carrier: "COSCO", reliability: 89.5, transit_time: "20.1 dias", incidents: 12, score: 7.8 }
];

const getReliabilityColor = (reliability) => {
  if (reliability >= 95) return 'bg-green-100 text-green-800';
  if (reliability >= 90) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const getScoreStars = (score) => {
  const fullStars = Math.floor(score / 2);
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < fullStars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    );
  }
  return stars;
};

const CarrierRow = ({ carrier, rank }) => (
  <tr className="border-b border-gray-100">
    <td className="py-2 pr-4">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
          {rank}
        </span>
        <span className="font-medium text-sm">{carrier.carrier}</span>
      </div>
    </td>
    <td className="py-2 pr-4">
      <Badge className={getReliabilityColor(carrier.reliability)}>
        {carrier.reliability}%
      </Badge>
    </td>
    <td className="py-2 pr-4 text-sm">{carrier.transit_time}</td>
    <td className="py-2 pr-4 text-center">
      <span className={`text-sm font-medium ${carrier.incidents <= 3 ? 'text-green-600' : 'text-red-600'}`}>
        {carrier.incidents}
      </span>
    </td>
    <td className="py-2">
      <div className="flex items-center gap-1">
        {getScoreStars(carrier.score)}
        <span className="text-xs text-gray-500 ml-1">{carrier.score}</span>
      </div>
    </td>
  </tr>
);

export const WidgetRankingCarriers = ({ persona }) => {
  // Solo mostrar para operador_logistico
  if (persona !== 'operador_logistico') {
    return null;
  }

  const sortedCarriers = [...mockCarriers].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <Card style={getCardStyle()}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Ranking Carriers (Reliability)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="pb-2 pr-4">Carrier/Agente</th>
                <th className="pb-2 pr-4">Reliability</th>
                <th className="pb-2 pr-4">Transit Time</th>
                <th className="pb-2 pr-4 text-center">Incidencias 90d</th>
                <th className="pb-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {sortedCarriers.map((carrier, idx) => (
                <CarrierRow key={idx} carrier={carrier} rank={idx + 1} />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};