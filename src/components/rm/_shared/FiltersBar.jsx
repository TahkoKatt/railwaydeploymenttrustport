import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, RefreshCw } from "lucide-react";

const FiltersBar = ({ facets = [], onChange, defaultQuery = {} }) => {
  const [filters, setFilters] = React.useState(defaultQuery);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onChange) {
      onChange(newFilters);
    }
  };

  const handleReset = () => {
    setFilters(defaultQuery);
    if (onChange) {
      onChange(defaultQuery);
    }
  };

  return (
    <Card 
      className="bg-white shadow-sm" 
      style={{ 
        borderRadius: '16px',
        fontFamily: 'Montserrat, sans-serif',
        boxShadow: '0 6px 18px rgba(0,0,0,.06)'
      }}
    >
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {facets.map(facet => {
            if (facet.type === 'search') {
              return (
                <div key={facet.key} className="relative min-w-[300px]">
                  <Search className="w-4 h-4 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder={facet.placeholder}
                    value={filters[facet.key] || ''}
                    onChange={(e) => handleFilterChange(facet.key, e.target.value)}
                    className="pl-8"
                  />
                </div>
              );
            }

            if (facet.type === 'select') {
              return (
                <Select 
                  key={facet.key} 
                  value={filters[facet.key] || facet.defaultValue} 
                  onValueChange={(value) => handleFilterChange(facet.key, value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={facet.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {facet.options.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }

            return null;
          })}

          <Button
            variant="outline"
            onClick={handleReset}
            className="ml-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Limpiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(FiltersBar);