import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Calendar, X } from "lucide-react";

export default function OrderFilters({ filters, onFiltersChange, onClearFilters }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value && value !== 'all' && value !== ''
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por ID, cliente o referencia..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          <Select 
            value={filters.channel || 'all'} 
            onValueChange={(value) => handleFilterChange('channel', value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los canales</SelectItem>
              <SelectItem value="Shopify">🛍️ Shopify</SelectItem>
              <SelectItem value="Amazon">📦 Amazon</SelectItem>
              <SelectItem value="Meli">🛒 MercadoLibre</SelectItem>
              <SelectItem value="Web">🌐 Tienda Web</SelectItem>
              <SelectItem value="POS">🏪 POS</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.status || 'all'} 
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="Confirmado">Confirmado</SelectItem>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="En picking">En picking</SelectItem>
              <SelectItem value="Enviado">Enviado</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
              <SelectItem value="Revisión fraude">Revisión fraude</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-[140px]"
            />
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-[140px]"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-4 h-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Active filters badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
          <span className="text-sm text-gray-600 mr-2">Filtros activos:</span>
          {filters.channel && filters.channel !== 'all' && (
            <Badge variant="outline" className="text-xs">
              Canal: {filters.channel}
            </Badge>
          )}
          {filters.status && filters.status !== 'all' && (
            <Badge variant="outline" className="text-xs">
              Estado: {filters.status}
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="outline" className="text-xs">
              Desde: {filters.dateFrom}
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="outline" className="text-xs">
              Hasta: {filters.dateTo}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}