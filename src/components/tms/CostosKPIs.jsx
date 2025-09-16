import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Fuel, Truck, CheckCircle, Leaf, TrendingUp, TrendingDown } from "lucide-react";

const kpisData = [
  { 
    id: "costPerKm", 
    label: "Coste/km", 
    value: 0.68, 
    suffix: "€", 
    delta: -0.05, 
    deltaLabel: "€0.05",
    icon: Fuel, 
    deltaPositiveIsGood: true 
  },
  { 
    id: "fleetUtil", 
    label: "Utilización Flota", 
    value: 74, 
    suffix: "%", 
    delta: 2.1, 
    deltaLabel: "2.1%",
    icon: Truck, 
    deltaPositiveIsGood: true 
  },
  { 
    id: "otd", 
    label: "OTD", 
    value: 94.2, 
    suffix: "%", 
    delta: 1.8, 
    deltaLabel: "1.8%",
    icon: CheckCircle, 
    deltaPositiveIsGood: true 
  },
  { 
    id: "co2", 
    label: "CO₂ por Ruta", 
    value: 18.6, 
    suffix: "kg", 
    delta: -2.3, 
    deltaLabel: "2.3kg",
    icon: Leaf, 
    deltaPositiveIsGood: false 
  }
];

export default function CostosKPIs() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpisData.map((kpi) => {
        const Icon = kpi.icon;
        const isDeltaPositive = kpi.delta > 0;
        const isDeltaGood = kpi.deltaPositiveIsGood ? isDeltaPositive : !isDeltaPositive;
        const TrendIcon = isDeltaPositive ? TrendingUp : TrendingDown;
        
        return (
          <Card 
            key={kpi.id}
            className="bg-white shadow-sm" 
            style={{ 
              boxShadow: '0 8px 24px rgba(0,0,0,.08)', 
              borderRadius: '16px' 
            }}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[12px] font-medium text-gray-600">{kpi.label}</p>
                  <p 
                    className="text-[22px] font-semibold mt-1" 
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {kpi.suffix === "€" ? `${kpi.suffix}${kpi.value.toFixed(2)}` : `${kpi.value}${kpi.suffix}`}
                  </p>
                </div>
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(68, 114, 196, 0.2)' }}
                >
                  <Icon className="w-5 h-5 text-[#4472C4]" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-[12px] font-medium text-green-600">
                <TrendIcon className="w-3 h-3 mr-1" />
                {isDeltaPositive ? '+' : '-'}{kpi.deltaLabel}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}