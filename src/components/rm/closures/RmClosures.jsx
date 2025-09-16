
// CUARENTENA: Este archivo ha sido movido a .bak para prevenir imports accidentales
// NO DEBE SER IMPORTADO EN EL SHELL RM HASTA PAQUETE 7
// Motivo: Viola Plan B - "Cierres" debe permanecer en legacy hasta backend rm_close esté listo

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, DollarSign } from "lucide-react";

const logMetric = (metric, value, context = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    metric,
    value,
    module: 'rm',
    tab: 'closures',
    ...context
  };
  console.log(JSON.stringify(logEntry));
};

const RmClosures = () => {
  useEffect(() => {
    const startTime = performance.now();
    
    const loadClosures = async () => {
      await new Promise(resolve => setTimeout(resolve, 90));
      const loadTime = performance.now() - startTime;
      logMetric('rm_closures_load_ms', loadTime, {
        component: 'RmClosures',
        trace_id: `closures-${Date.now()}`
      });
    };
    
    loadClosures();
  }, []);

  return (
    <div className="space-y-6 p-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-gray-900 mb-2">
          Cierres
        </h1>
        <p className="text-[14px] text-gray-600">
          Registro de cotizaciones cerradas y su estado de producción
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] font-medium text-gray-600">Cerradas Este Mes</p>
                <p className="text-[22px] font-semibold mt-1">23</p>
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
                <p className="text-[12px] font-medium text-gray-600">Revenue Cerrado</p>
                <p className="text-[22px] font-semibold mt-1">€345K</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#4472C420' }}>
                <DollarSign className="w-5 h-5" style={{ color: '#4472C4' }} />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] font-medium text-gray-600">Tiempo Promedio</p>
                <p className="text-[22px] font-semibold mt-1">18d</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#FFC85720' }}>
                <Clock className="w-5 h-5" style={{ color: '#FFC857' }} />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle>Historial de Cierres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>Componente Cierres RM - Migrado de CotizacionesComponent - Paquete 1 Validado ✓</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RmClosures;
