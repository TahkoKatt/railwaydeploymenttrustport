import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Save, X } from "lucide-react";
import { toast } from "sonner";

export default function CostosFilters({ onFiltersChange }) {
  const [filters, setFilters] = useState({
    search: '',
    dateRange: { from: '', to: '' },
    fleet: 'all',
    costType: 'all'
  });
  
  const [activeFiltersChips, setActiveFiltersChips] = useState([]);

  const handleFilterChange = (key, value) => {
    if (key === 'dateRange') {
      setFilters(prev => ({ ...prev, dateRange: value }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const applyFilters = () => {
    const chips = [];
    if (filters.search) chips.push({ type: 'Búsqueda', value: filters.search });
    if (filters.fleet !== 'all') chips.push({ type: 'Flota', value: filters.fleet });
    if (filters.costType !== 'all') chips.push({ type: 'Tipo de costo', value: filters.costType });
    if (filters.dateRange.from || filters.dateRange.to) {
      chips.push({ 
        type: 'Período', 
        value: `${filters.dateRange.from || '...'} - ${filters.dateRange.to || '...'}` 
      });
    }
    
    setActiveFiltersChips(chips);
    onFiltersChange?.(filters);
    toast.success("Filtros aplicados");
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      dateRange: { from: '', to: '' },
      fleet: 'all',
      costType: 'all'
    };
    setFilters(clearedFilters);
    setActiveFiltersChips([]);
    onFiltersChange?.(clearedFilters);
    toast.success("Filtros limpiados");
  };

  const removeFilterChip = (chipToRemove) => {
    let updatedFilters = { ...filters };
    
    switch (chipToRemove.type) {
      case 'Búsqueda':
        updatedFilters.search = '';
        break;
      case 'Flota':
        updatedFilters.fleet = 'all';
        break;
      case 'Tipo de costo':
        updatedFilters.costType = 'all';
        break;
      case 'Período':
        updatedFilters.dateRange = { from: '', to: '' };
        break;
    }
    
    setFilters(updatedFilters);
    setActiveFiltersChips(prev => prev.filter(chip => chip !== chipToRemove));
    onFiltersChange?.(updatedFilters);
  };

  return (
    <Card 
      className="bg-white border border-gray-200 mb-6"
      style={{ 
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
      }}
    >
      <CardContent style={{ padding: '16px' }}>
        <div className="space-y-4">
          {/* Fila principal de filtros - Ajustado para contener el botón Limpiar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-end">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por ruta, cliente o vehículo..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    height: '40px',
                    fontSize: '14px',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                />
              </div>
            </div>

            <div>
              <Input
                type="date"
                placeholder="Desde"
                value={filters.dateRange.from}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, from: e.target.value })}
                style={{
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  height: '40px',
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif'
                }}
              />
            </div>

            <div>
              <Input
                type="date"
                placeholder="Hasta"
                value={filters.dateRange.to}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, to: e.target.value })}
                style={{
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  height: '40px',
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif'
                }}
              />
            </div>

            <div>
              <Select value={filters.fleet} onValueChange={(value) => handleFilterChange('fleet', value)}>
                <SelectTrigger style={{ height: '40px', fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                  <SelectValue placeholder="Toda la flota" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toda la flota</SelectItem>
                  <SelectItem value="madrid">Madrid</SelectItem>
                  <SelectItem value="barcelona">Barcelona</SelectItem>
                  <SelectItem value="valencia">Valencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={applyFilters}
                style={{
                  background: '#4472C4',
                  color: '#FFFFFF',
                  height: '40px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  fontFamily: 'Montserrat, sans-serif',
                  paddingLeft: '16px',
                  paddingRight: '16px'
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Aplicar
              </Button>
            </div>

            <div>
              <Button 
                variant="outline"
                onClick={clearFilters}
                style={{
                  height: '40px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif',
                  width: '100%'
                }}
              >
                Limpiar
              </Button>
            </div>
          </div>

          {/* Chips de filtros activos */}
          {activeFiltersChips.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {activeFiltersChips.map((chip, index) => (
                <div 
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm"
                  style={{
                    backgroundColor: 'rgba(68,114,196,0.08)',
                    color: '#4472C4',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  <span>{chip.type}: {chip.value}</span>
                  <button
                    onClick={() => removeFilterChip(chip)}
                    className="hover:opacity-70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}