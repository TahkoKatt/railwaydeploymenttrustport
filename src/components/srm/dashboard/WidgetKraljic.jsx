// components/srm/dashboard/WidgetKraljic.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TRUSTPORT_TOKENS, RISK_QUADRANTS } from './constants';
import { SkeletonChart } from './Skeletons';

const getCardStyle = () => ({
  backgroundColor: TRUSTPORT_TOKENS.colors.surface,
  borderRadius: TRUSTPORT_TOKENS.radius,
  boxShadow: TRUSTPORT_TOKENS.shadow,
  border: `1px solid ${TRUSTPORT_TOKENS.colors.border}`,
});

const QuadrantScatter = ({ data }) => {
  const maxImpact = 100;
  const maxRisk = 100;
  
  return (
    <div className="relative w-full h-64 bg-gray-50 rounded-lg border">
      {/* Grid lines */}
      <div className="absolute inset-0">
        <div className="absolute w-px bg-gray-300 left-1/2 top-0 bottom-0"></div>
        <div className="absolute h-px bg-gray-300 top-1/2 left-0 right-0"></div>
      </div>
      
      {/* Quadrant labels */}
      <div className="absolute top-2 left-2 text-xs font-medium" style={{ color: RISK_QUADRANTS.bottleneck.color }}>
        {RISK_QUADRANTS.bottleneck.label}
      </div>
      <div className="absolute top-2 right-2 text-xs font-medium" style={{ color: RISK_QUADRANTS.strategic.color }}>
        {RISK_QUADRANTS.strategic.label}
      </div>
      <div className="absolute bottom-2 left-2 text-xs font-medium" style={{ color: RISK_QUADRANTS.routine.color }}>
        {RISK_QUADRANTS.routine.label}
      </div>
      <div className="absolute bottom-2 right-2 text-xs font-medium" style={{ color: RISK_QUADRANTS.leverage.color }}>
        {RISK_QUADRANTS.leverage.label}
      </div>
      
      {/* Data points */}
      {data?.map((supplier, idx) => {
        const x = (supplier.impact / maxImpact) * 100;
        const y = 100 - (supplier.risk / maxRisk) * 100; // Invert Y axis
        const quadrantColor = RISK_QUADRANTS[supplier.quadrant]?.color || TRUSTPORT_TOKENS.colors.primary;
        
        return (
          <div
            key={idx}
            className="absolute w-3 h-3 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-125 transition-transform"
            style={{ 
              backgroundColor: quadrantColor,
              left: `${x}%`, 
              top: `${y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            title={`${supplier.name}: Impact ${supplier.impact}%, Risk ${supplier.risk}%`}
          />
        );
      })}
      
      {/* Axis labels */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
        Impacto en Suministro →
      </div>
      <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 -rotate-90 text-xs text-gray-500">
        Riesgo →
      </div>
    </div>
  );
};

const Legend = () => (
  <div className="grid grid-cols-2 gap-2 mt-4">
    {Object.entries(RISK_QUADRANTS).map(([key, quadrant]) => (
      <div key={key} className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: quadrant.color }}
        />
        <span className="text-xs" style={{ color: TRUSTPORT_TOKENS.colors.text_muted }}>
          {quadrant.label}
        </span>
      </div>
    ))}
  </div>
);

export const WidgetKraljic = ({ data, isLoading, isEmpty }) => {
  if (isLoading) {
    return (
      <Card style={getCardStyle()}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Matriz Kraljic</CardTitle>
        </CardHeader>
        <CardContent>
          <SkeletonChart />
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card style={getCardStyle()}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Matriz Kraljic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-center">
            <div>
              <p className="text-sm" style={{ color: TRUSTPORT_TOKENS.colors.text_muted }}>
                Sin datos suficientes para clasificar proveedores
              </p>
              <p className="text-xs mt-1" style={{ color: TRUSTPORT_TOKENS.colors.text_muted }}>
                Ingresa datos de impacto y riesgo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={getCardStyle()}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Matriz Kraljic</CardTitle>
      </CardHeader>
      <CardContent>
        <QuadrantScatter data={data} />
        <Legend />
      </CardContent>
    </Card>
  );
};