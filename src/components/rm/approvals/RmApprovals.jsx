
// CUARENTENA: Este archivo ha sido movido a .bak para prevenir imports accidentales  
// NO DEBE SER IMPORTADO EN EL SHELL RM
// Motivo: Viola Plan B - "Aprobaciones" siguen en legacy (dentro de Cotizaciones)

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";

const logMetric = (metric, value, context = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    metric,
    value,
    module: 'rm',
    tab: 'approvals',
    ...context
  };
  console.log(JSON.stringify(logEntry));
};

const RmApprovals = () => {
  useEffect(() => {
    const startTime = performance.now();
    
    const loadApprovals = async () => {
      await new Promise(resolve => setTimeout(resolve, 60));
      const loadTime = performance.now() - startTime;
      logMetric('rm_approvals_load_ms', loadTime, {
        component: 'RmApprovals',
        trace_id: `approvals-${Date.now()}`
      });
    };
    
    loadApprovals();
  }, []);

  return (
    <div className="space-y-6 p-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-gray-900 mb-2">
          Aprobaciones de Margen
        </h1>
        <p className="text-[14px] text-gray-600">
          Revisión y aprobación de cotizaciones bajo umbral de margen
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] font-medium text-gray-600">Pendientes</p>
                <p className="text-[22px] font-semibold mt-1">8</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#FFC85720' }}>
                <Clock className="w-5 h-5" style={{ color: '#FFC857' }} />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] font-medium text-gray-600">Aprobadas</p>
                <p className="text-[22px] font-semibold mt-1">142</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#00A87820' }}>
                <CheckCircle className="w-5 h-5" style={{ color: '#00A878' }} />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] font-medium text-gray-600">Rechazadas</p>
                <p className="text-[22px] font-semibold mt-1">12</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#DB214220' }}>
                <AlertTriangle className="w-5 h-5" style={{ color: '#DB2142' }} />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle>Cotizaciones por Aprobar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>Componente Aprobaciones RM - Paquete 1 Validado ✓</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RmApprovals;
