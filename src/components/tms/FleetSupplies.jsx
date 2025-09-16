import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, Filter, Package, AlertTriangle, CheckCircle, TrendingDown,
  Plus, Edit, Trash2, MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const mockSupplies = [
  {
    id: 's-001',
    item: 'Aceite de motor 15W-40',
    category: 'Lubricantes',
    quantity: 45,
    reorderPoint: 20,
    unit: 'Litros',
    lastPurchase: '2025-07-15',
    supplier: 'Shell España',
    cost: 8.50
  },
  {
    id: 's-002',
    item: 'Filtro de aire',
    category: 'Filtros',
    quantity: 12,
    reorderPoint: 15,
    unit: 'Unidades',
    lastPurchase: '2025-08-01',
    supplier: 'Mann Filter',
    cost: 24.90
  },
  {
    id: 's-003',
    item: 'Pastillas de freno',
    category: 'Frenos',
    quantity: 8,
    reorderPoint: 12,
    unit: 'Juegos',
    lastPurchase: '2025-06-20',
    supplier: 'Brembo',
    cost: 89.50
  },
  {
    id: 's-004',
    item: 'Neumáticos 315/80R22.5',
    category: 'Neumáticos',
    quantity: 6,
    reorderPoint: 8,
    unit: 'Unidades',
    lastPurchase: '2025-05-10',
    supplier: 'Michelin',
    cost: 420.00
  },
  {
    id: 's-005',
    item: 'Líquido refrigerante',
    category: 'Líquidos',
    quantity: 25,
    reorderPoint: 10,
    unit: 'Litros',
    lastPurchase: '2025-07-28',
    supplier: 'Castrol',
    cost: 12.75
  }
];

export default function FleetSupplies() {
  const [supplies] = useState(mockSupplies);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const getStockStatus = (quantity, reorderPoint) => {
    if (quantity <= reorderPoint) {
      return {
        status: 'low',
        label: 'Reordenar',
        class: 'bg-red-100 text-red-800 border-red-300',
        icon: AlertTriangle
      };
    } else if (quantity <= reorderPoint * 1.5) {
      return {
        status: 'warning',
        label: 'Bajo',
        class: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: TrendingDown
      };
    } else {
      return {
        status: 'good',
        label: 'Suficiente',
        class: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircle
      };
    }
  };

  const handleSupplyAction = (supplyId, action) => {
    const actions = {
      edit: () => toast.success(`Editando suministro ${supplyId}`),
      reorder: () => toast.success(`Creando orden de compra para ${supplyId}`),
      history: () => toast.success(`Ver historial de movimientos ${supplyId}`),
      delete: () => toast.success(`Eliminando suministro ${supplyId}`)
    };
    actions[action]?.();
  };

  const filteredSupplies = supplies.filter(supply => {
    const matchesSearch = supply.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          supply.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          supply.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || supply.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(supplies.map(s => s.category))];
  const lowStockItems = supplies.filter(s => s.quantity <= s.reorderPoint).length;
  const totalValue = supplies.reduce((acc, s) => acc + (s.quantity * s.cost), 0);

  return (
    <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-semibold text-gray-900">{supplies.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bajo Stock</p>
                <p className="text-2xl font-semibold text-red-600">{lowStockItems}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-semibold text-green-600">€{totalValue.toLocaleString('es-ES')}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de filtros */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por artículo, categoría o proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          <option value="all">Todas las categorías</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <Button 
          className="text-white"
          style={{ backgroundColor: '#4472C4', fontFamily: 'Montserrat, sans-serif' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Añadir Suministro
        </Button>
      </div>

      {/* Tabla de suministros */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>Artículo</TableHead>
                <TableHead style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>Categoría</TableHead>
                <TableHead style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>Stock</TableHead>
                <TableHead style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>Punto Reorden</TableHead>
                <TableHead style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>Estado</TableHead>
                <TableHead style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>Proveedor</TableHead>
                <TableHead style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>Coste</TableHead>
                <TableHead style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSupplies.map((supply, index) => {
                const stockStatus = getStockStatus(supply.quantity, supply.reorderPoint);
                const StatusIcon = stockStatus.icon;
                return (
                  <TableRow key={supply.id} className={index % 2 === 1 ? 'bg-[#FAFBFF]' : ''}>
                    <TableCell className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {supply.item}
                    </TableCell>
                    <TableCell style={{ fontFamily: 'Montserrat, sans-serif' }}>{supply.category}</TableCell>
                    <TableCell style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {supply.quantity} {supply.unit}
                    </TableCell>
                    <TableCell style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {supply.reorderPoint} {supply.unit}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${stockStatus.class} border font-medium`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ fontFamily: 'Montserrat, sans-serif' }}>{supply.supplier}</TableCell>
                    <TableCell style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      €{supply.cost.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleSupplyAction(supply.id, 'edit')}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSupplyAction(supply.id, 'reorder')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Reordenar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSupplyAction(supply.id, 'history')}>
                            <Package className="w-4 h-4 mr-2" />
                            Historial
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleSupplyAction(supply.id, 'delete')}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Empty state */}
      {filteredSupplies.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron suministros</h3>
          <p className="text-sm text-gray-500 mb-4">
            {searchTerm || categoryFilter !== 'all' 
              ? "Intenta ajustar los filtros para encontrar lo que buscas"
              : "Comienza añadiendo tu primer suministro al inventario"
            }
          </p>
          <Button 
            className="text-white"
            style={{ backgroundColor: '#4472C4', fontFamily: 'Montserrat, sans-serif' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir Suministro
          </Button>
        </div>
      )}
    </div>
  );
}