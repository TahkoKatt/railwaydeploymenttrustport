// components/srm/dashboard/FiltersBar.jsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, RefreshCw } from 'lucide-react';
import { TRUSTPORT_TOKENS } from './constants';

const getCardStyle = () => ({
  backgroundColor: TRUSTPORT_TOKENS.colors.surface,
  borderRadius: TRUSTPORT_TOKENS.radius,
  boxShadow: TRUSTPORT_TOKENS.shadow,
  border: `1px solid ${TRUSTPORT_TOKENS.colors.border}`,
});

export const FiltersBar = ({ filters, onFilterChange, onRefresh }) => {
  const periods = ['Hoy', '24h', '7d', '30d'];

  return (
    <Card style={getCardStyle()}>
      <CardContent className="p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: TRUSTPORT_TOKENS.colors.text_muted }} />
          <span className="text-sm font-medium" style={{ color: TRUSTPORT_TOKENS.colors.text_strong }}>
            Filtros:
          </span>
        </div>
        
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          {periods.map(period => (
            <button
              key={period}
              onClick={() => onFilterChange('date_range', period)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filters.date_range === period
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
        
        <Button
          onClick={onRefresh}
          style={{ backgroundColor: TRUSTPORT_TOKENS.colors.primary, color: TRUSTPORT_TOKENS.colors.surface }}
          className="hover:opacity-90"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </CardContent>
    </Card>
  );
};