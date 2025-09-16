import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from 'lucide-react';

const KpiGrid = ({ kpis = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const IconComponent = kpi.icon;
        const isPositiveDelta = kpi.delta && kpi.delta.startsWith('+');
        
        return (
          <Card 
            key={kpi.id || index} 
            className="bg-white shadow-sm hover:shadow-lg transition-shadow" 
            style={{ 
              borderRadius: '16px',
              fontFamily: 'Montserrat, sans-serif',
              boxShadow: '0 6px 18px rgba(0,0,0,.06)'
            }}
            data-kpi={kpi.id || `kpi-${index}`}
          >
            <CardHeader className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-gray-600 mb-1">
                    {kpi.label}
                  </p>
                  <p className="text-[22px] font-semibold" style={{ color: '#000000' }}>
                    {kpi.value}
                  </p>
                  {kpi.delta && (
                    <div className={`flex items-center mt-2 text-[12px] font-medium ${isPositiveDelta ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositiveDelta ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {kpi.delta}
                    </div>
                  )}
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${kpi.color}20` }}>
                  <IconComponent className="w-5 h-5" style={{ color: kpi.color }} />
                </div>
              </div>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
};

export default React.memo(KpiGrid);