import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

const tableData = {
  costLines: [
    { route: "Ruta Madrid Centro", km: 85, cost: 425, costPerKm: 0.69, budget: 440, variance: -15 },
    { route: "Ruta BCN Norte", km: 130, cost: 890, costPerKm: 0.68, budget: 900, variance: -10 },
    { route: "Ruta Valencia Sur", km: 60, cost: 315, costPerKm: 0.70, budget: 300, variance: 15 }
  ],
  customerProfit: [
    { route: "Cliente X", km: 540, cost: 3610, costPerKm: 0.67, budget: 3700, variance: -90 },
    { route: "Cliente Y", km: 410, cost: 2870, costPerKm: 0.70, budget: 2800, variance: 70 }
  ]
};

export default function CostosTable({ activeTab = 'Costos' }) {
  const [pageSize, setPageSize] = useState(20);

  const handleExport = (format) => {
    const fileName = `costos_${new Date().toISOString().split('T')[0]}.${format}`;
    toast.success(`Exportando ${fileName}`);
  };

  const formatCurrency = (value) => `€${value.toFixed(2)}`;
  const formatCurrencyLarge = (value) => `€${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;

  const renderVarianceChip = (variance) => {
    const isPositive = variance > 0;
    return (
      <Badge 
        className={`${isPositive ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} border-0`}
        style={{
          fontSize: '12px',
          fontFamily: 'Montserrat, sans-serif'
        }}
      >
        {isPositive ? '+' : ''}{formatCurrency(variance)}
      </Badge>
    );
  };

  if (activeTab === 'Rentabilidad') {
    return (
      <Card 
        className="bg-white border border-gray-200"
        style={{ 
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
        }}
      >
        <CardHeader 
          className="flex flex-row items-center justify-between"
          style={{ padding: '16px' }}
        >
          <CardTitle 
            style={{ 
              fontSize: '16px', 
              fontWeight: 600,
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            Rentabilidad por Cliente
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExport('csv')}
              style={{
                height: '32px',
                borderRadius: '12px',
                fontSize: '12px',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              <Download className="w-3 h-3 mr-1" />
              CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExport('xlsx')}
              style={{
                height: '32px',
                borderRadius: '12px',
                fontSize: '12px',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              <FileSpreadsheet className="w-3 h-3 mr-1" />
              XLSX
            </Button>
          </div>
        </CardHeader>
        <CardContent style={{ padding: '16px', paddingTop: 0 }}>
          <div style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white">
                <TableRow style={{ height: '44px' }}>
                  <TableHead style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>Ruta</TableHead>
                  <TableHead style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>Km</TableHead>
                  <TableHead style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>Costo</TableHead>
                  <TableHead style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>Coste/km</TableHead>
                  <TableHead style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>Presupuesto</TableHead>
                  <TableHead style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>Variación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.customerProfit.map((row, index) => (
                  <TableRow key={row.route} style={{ height: '44px' }} className={index % 2 === 1 ? 'bg-gray-50' : ''}>
                    <TableCell className="font-medium" style={{ fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>
                      {row.route}
                    </TableCell>
                    <TableCell style={{ fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>
                      {row.km}
                    </TableCell>
                    <TableCell style={{ fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>
                      {formatCurrencyLarge(row.cost)}
                    </TableCell>
                    <TableCell style={{ fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>
                      {formatCurrency(row.costPerKm)}
                    </TableCell>
                    <TableCell style={{ fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>
                      {formatCurrencyLarge(row.budget)}
                    </TableCell>
                    <TableCell>
                      {renderVarianceChip(row.variance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="bg-white border border-gray-200"
      style={{ 
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
      }}
    >
      <CardHeader 
        className="flex flex-row items-center justify-between"
        style={{ padding: '16px' }}
      >
        <CardTitle 
          style={{ 
            fontSize: '16px', 
            fontWeight: 600,
            fontFamily: 'Montserrat, sans-serif'
          }}
        >
          Detalle de Costos
        </CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExport('csv')}
            style={{
              height: '32px',
              borderRadius: '12px',
              fontSize: '12px',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            <Download className="w-3 h-3 mr-1" />
            CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExport('xlsx')}
            style={{
              height: '32px',
              borderRadius: '12px',
              fontSize: '12px',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            <FileSpreadsheet className="w-3 h-3 mr-1" />
            XLSX
          </Button>
        </div>
      </CardHeader>
      <CardContent style={{ padding: '16px', paddingTop: 0 }}>
        <div style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white">
              <TableRow style={{ height: '44px' }}>
                <TableHead style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>Ruta</TableHead>
                <TableHead style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>Km</TableHead>
                <TableHead style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>Costo</TableHead>
                <TableHead style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>Coste/km</TableHead>
                <TableHead style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>Presupuesto</TableHead>
                <TableHead style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>Variación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.costLines.map((row, index) => (
                <TableRow key={row.route} style={{ height: '44px' }} className={index % 2 === 1 ? 'bg-gray-50' : ''}>
                  <TableCell className="font-medium" style={{ fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>
                    {row.route}
                  </TableCell>
                  <TableCell style={{ fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>
                    {row.km}
                  </TableCell>
                  <TableCell style={{ fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>
                    {formatCurrencyLarge(row.cost)}
                  </TableCell>
                  <TableCell style={{ fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>
                    {formatCurrency(row.costPerKm)}
                  </TableCell>
                  <TableCell style={{ fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>
                    {formatCurrencyLarge(row.budget)}
                  </TableCell>
                  <TableCell>
                    {renderVarianceChip(row.variance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}