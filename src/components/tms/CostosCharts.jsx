import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const chartData = {
  costEvolution: [
    { period: 'Ene', cost_per_km: 0.75 },
    { period: 'Feb', cost_per_km: 0.72 },
    { period: 'Mar', cost_per_km: 0.70 },
    { period: 'Abr', cost_per_km: 0.69 },
    { period: 'May', cost_per_km: 0.71 },
    { period: 'Jun', cost_per_km: 0.69 }
  ],
  realVsBudget: [
    { category: 'Combustible', real: 12500, budget: 12000 },
    { category: 'Peajes', real: 2100, budget: 2000 },
    { category: 'Mano de obra', real: 8500, budget: 8300 },
    { category: 'Mantenimiento', real: 3200, budget: 3000 }
  ],
  costBreakdown: [
    { category: 'Combustible', value: 58, color: '#4472C4' },
    { category: 'Mano de obra', value: 26, color: '#10B981' },
    { category: 'Peajes', value: 10, color: '#F59E0B' },
    { category: 'Mantenimiento', value: 6, color: '#DB2142' }
  ]
};

const chartDefaults = {
  fontFamily: 'Montserrat, sans-serif',
  titleFontSize: '16px',
  axisLabelFontSize: '13px',
  tickFontSize: '12px',
  legendFontSize: '12px',
  gridColor: '#E5E7EB'
};

export default function CostosCharts({ activeTab = 'Costos' }) {
  const renderCostEvolution = () => (
    <Card 
      className="bg-white border border-gray-200"
      style={{ 
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        minHeight: '360px'
      }}
    >
      <CardHeader style={{ padding: '16px' }}>
        <CardTitle 
          style={{ 
            fontSize: chartDefaults.titleFontSize,
            fontWeight: 600,
            fontFamily: chartDefaults.fontFamily
          }}
        >
          Evolución del Coste
        </CardTitle>
      </CardHeader>
      <CardContent style={{ padding: '12px' }}>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.costEvolution} maxBarSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartDefaults.gridColor} />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: chartDefaults.tickFontSize, fontFamily: chartDefaults.fontFamily }}
                axisLine={{ stroke: chartDefaults.gridColor }}
              />
              <YAxis 
                tickFormatter={(value) => `€${value.toFixed(2)}`}
                tick={{ fontSize: chartDefaults.tickFontSize, fontFamily: chartDefaults.fontFamily }}
                axisLine={{ stroke: chartDefaults.gridColor }}
              />
              <Tooltip 
                formatter={(value) => [`€${value.toFixed(2)}/km`, 'Coste/km']}
                contentStyle={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  fontSize: chartDefaults.legendFontSize,
                  fontFamily: chartDefaults.fontFamily
                }}
              />
              <Bar dataKey="cost_per_km" fill="#4472C4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  const renderRealVsBudget = () => (
    <Card 
      className="bg-white border border-gray-200"
      style={{ 
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        minHeight: '360px'
      }}
    >
      <CardHeader style={{ padding: '16px' }}>
        <CardTitle 
          style={{ 
            fontSize: chartDefaults.titleFontSize,
            fontWeight: 600,
            fontFamily: chartDefaults.fontFamily
          }}
        >
          Real vs Presupuesto
        </CardTitle>
      </CardHeader>
      <CardContent style={{ padding: '12px' }}>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.realVsBudget} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke={chartDefaults.gridColor} />
              <XAxis 
                type="number" 
                tickFormatter={(value) => `€${(value/1000).toFixed(0)}k`}
                tick={{ fontSize: chartDefaults.tickFontSize, fontFamily: chartDefaults.fontFamily }}
              />
              <YAxis 
                dataKey="category" 
                type="category" 
                width={120}
                tick={{ fontSize: chartDefaults.tickFontSize, fontFamily: chartDefaults.fontFamily }}
              />
              <Tooltip 
                formatter={(value) => [`€${value.toLocaleString()}`, '']}
                contentStyle={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  fontSize: chartDefaults.legendFontSize,
                  fontFamily: chartDefaults.fontFamily
                }}
              />
              <Bar dataKey="real" fill="#4472C4" name="Real" />
              <Bar dataKey="budget" fill="#10B981" name="Presupuesto" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  const renderCostBreakdown = () => (
    <Card 
      className="bg-white border border-gray-200"
      style={{ 
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        minHeight: '320px'
      }}
    >
      <CardHeader style={{ padding: '16px' }}>
        <CardTitle 
          style={{ 
            fontSize: chartDefaults.titleFontSize,
            fontWeight: 600,
            fontFamily: chartDefaults.fontFamily
          }}
        >
          Distribución de Costos
        </CardTitle>
      </CardHeader>
      <CardContent style={{ padding: '12px' }}>
        <div style={{ height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.costBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ value }) => `${value}%`}
              >
                {chartData.costBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, '']}
                contentStyle={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  fontSize: chartDefaults.legendFontSize,
                  fontFamily: chartDefaults.fontFamily
                }}
              />
              <Legend 
                verticalAlign="bottom"
                wrapperStyle={{
                  fontSize: chartDefaults.legendFontSize,
                  fontFamily: chartDefaults.fontFamily
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  if (activeTab === 'Costos') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderCostBreakdown()}
          {renderCostEvolution()}
        </div>
        <div className="grid grid-cols-1 gap-6">
          {renderRealVsBudget()}
        </div>
      </div>
    );
  }

  if (activeTab === 'Desempeño') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderCostEvolution()}
        {renderRealVsBudget()}
      </div>
    );
  }

  if (activeTab === 'Rentabilidad') {
    return (
      <div className="grid grid-cols-1 gap-6">
        {renderCostBreakdown()}
      </div>
    );
  }

  return null;
}