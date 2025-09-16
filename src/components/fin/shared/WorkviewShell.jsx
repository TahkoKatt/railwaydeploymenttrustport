import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, Eye, MoreHorizontal, RefreshCw, Download, Settings, Zap } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import finTokens from '../config/tokens.json';

const WorkviewShell = ({ 
  title,
  subtitle, 
  config,
  data = [],
  onRowAction = () => {},
  onBulkAction = () => {},
  onFilterChange = () => {},
  aiInsights = [],
  persona = 'comerciante',
  debug = false
}) => {
  const [filters, setFilters] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentView, setCurrentView] = useState('list');
  
  const getTrustportCardStyle = () => ({
    backgroundColor: finTokens.colors.surface,
    borderRadius: `${finTokens.radius}px`,
    boxShadow: finTokens.shadow,
    fontFamily: finTokens.font_family,
    border: `1px solid ${finTokens.colors.border}`,
  });

  // Merge base config with persona overlay
  const getEffectiveConfig = useCallback(() => {
    if (!config) return { views: { list: { filters: [], columns: [], row_actions: [], bulk_actions: [] } } };
    
    const baseConfig = config.base || {};
    const personaConfig = config[persona] || {};
    
    return {
      ...baseConfig,
      views: {
        ...baseConfig.views,
        list: {
          ...baseConfig.views?.list,
          columns: [
            ...(baseConfig.views?.list?.columns || []),
            ...(personaConfig.columns_add || [])
          ]
        }
      },
      quick_actions: personaConfig.quick_actions || [],
      default_filters: personaConfig.default_filters || {}
    };
  }, [config, persona]);

  const effectiveConfig = getEffectiveConfig();
  const viewConfig = effectiveConfig.views?.[currentView] || effectiveConfig.views?.list || {};

  // Memoize the onFilterChange callback
  const memoizedOnFilterChange = useCallback((newFilters) => {
    onFilterChange(newFilters);
  }, [onFilterChange]);

  useEffect(() => {
    // Apply default filters from persona config
    const defaultFilters = effectiveConfig.default_filters || {};
    const newFilters = { ...filters, ...defaultFilters };
    setFilters(newFilters);
    memoizedOnFilterChange(newFilters);
  }, [effectiveConfig.default_filters, memoizedOnFilterChange]);

  const handleFilterChange = (filterId, value) => {
    const newFilters = { ...filters, [filterId]: value };
    setFilters(newFilters);
    memoizedOnFilterChange(newFilters);
  };

  const handleRowSelection = (rowId, checked) => {
    if (checked) {
      setSelectedRows([...selectedRows, rowId]);
    } else {
      setSelectedRows(selectedRows.filter(id => id !== rowId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(data.map(row => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const formatCellValue = (value, type) => {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
      case 'date':
        return new Date(value).toLocaleDateString('es-ES');
      case 'badge':
        return (
          <Badge variant={value === 'overdue' ? 'destructive' : value === 'paid' ? 'default' : 'secondary'}>
            {value}
          </Badge>
        );
      case 'number':
        return Number(value).toLocaleString();
      default:
        return value;
    }
  };

  const renderFilters = () => {
    if (!viewConfig.filters?.length) return null;

    return (
      <div className="flex flex-wrap gap-4 items-center p-4 border-b" style={{ borderColor: finTokens.colors.border }}>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtros:</span>
        </div>
        
        {viewConfig.filters.map(filter => (
          <div key={filter.id} className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{filter.id}:</span>
            {filter.type === 'multiselect' && (
              <Select 
                value={filters[filter.id]} 
                onValueChange={(value) => handleFilterChange(filter.id, value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {filter.values?.map(value => (
                    <SelectItem key={value} value={value}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {filter.type === 'search' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={`Buscar ${filter.source}...`}
                  value={filters[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className="pl-9 w-48"
                />
              </div>
            )}
          </div>
        ))}
        
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>
    );
  };

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: finTokens.colors.border }}>
      <div className="flex items-center gap-3">
        {selectedRows.length > 0 && (
          <>
            <span className="text-sm text-gray-600">{selectedRows.length} seleccionados</span>
            <div className="flex gap-2">
              {viewConfig.bulk_actions?.map(action => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkAction(action, selectedRows)}
                >
                  {action.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {effectiveConfig.quick_actions?.map(quickAction => (
          <Button
            key={quickAction.label}
            variant="outline"
            size="sm"
            onClick={() => onRowAction(quickAction.action, null)}
          >
            {quickAction.label}
          </Button>
        ))}
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderTable = () => (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedRows.length === data.length && data.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            {viewConfig.columns?.map(column => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
            <TableHead className="w-24">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={row.id || index}>
              <TableCell>
                <Checkbox
                  checked={selectedRows.includes(row.id)}
                  onCheckedChange={(checked) => handleRowSelection(row.id, checked)}
                />
              </TableCell>
              {viewConfig.columns?.map(column => (
                <TableCell key={column.key}>
                  {formatCellValue(row[column.key], column.type)}
                </TableCell>
              ))}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {viewConfig.row_actions?.map(action => (
                      <DropdownMenuItem
                        key={action}
                        onClick={() => onRowAction(action, row)}
                      >
                        {action.replace('_', ' ')}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderAIPanel = () => {
    if (!aiInsights.length) return null;
    
    return (
      <Card style={{ ...getTrustportCardStyle(), backgroundColor: '#F0F5FF', borderColor: '#D6E4FF' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: finTokens.colors.primary }} />
            <CardTitle className="text-md font-semibold" style={{ color: finTokens.colors.primary }}>
              AI Insights
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiInsights.map(insight => (
              <div key={insight.id} className="bg-white/50 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <insight.icon className="w-4 h-4" style={{ color: finTokens.colors.primary }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-blue-900 text-sm">{insight.title}</h4>
                    <p className="text-xs text-blue-700 mt-1">{insight.desc}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                  onClick={() => onRowAction(insight.cta.action, null)}
                >
                  {insight.cta.label}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (debug) {
    console.log('[FIN-DEBUG] WorkviewShell:', {
      title,
      currentView,
      effectiveConfig,
      persona,
      dataLength: data.length
    });
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: finTokens.colors.bg_page }}>
      <div className="flex-1 min-h-0 p-6">
        <div className="space-y-6 h-full flex flex-col">
          {/* Header */}
          <div>
            <h1 className="text-[28px] font-semibold" style={{ fontFamily: finTokens.font_family, color: finTokens.colors.text_strong }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-[14px] mt-1" style={{ color: finTokens.colors.text_muted }}>
                {subtitle}
              </p>
            )}
          </div>

          {/* AI Insights */}
          {aiInsights.length > 0 && renderAIPanel()}

          {/* Main Content Card */}
          <Card style={getTrustportCardStyle()} className="flex-1 min-h-0 flex flex-col">
            {renderFilters()}
            {renderToolbar()}
            <CardContent className="flex-1 min-h-0 p-0">
              {renderTable()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkviewShell;