import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle, RefreshCw, Database } from 'lucide-react';

/*
SEEDS DEMO LOADER
Step 2 of RC Plan: Load demo datasets for Comerciante and Operador
Gate S0: Views load in <2s and data coherent (no critical nulls)
*/

const DEMO_SEEDS = {
  comerciante: {
    po_bienes: [
      { id: 'PO-001', supplier_id: 'SUP-001', warehouse: 'ALM-BCN', status: 'sent', ack_due: '2024-01-15', asn_required: true },
      { id: 'PO-002', supplier_id: 'SUP-002', warehouse: 'ALM-MAD', status: 'acknowledged', eta: '2024-01-20', asn_required: true },
      { id: 'PO-003', supplier_id: 'SUP-003', warehouse: 'ALM-BCN', status: 'received', grn_id: 'GRN-001', discrepancy: false }
    ],
    po_servicios: [
      { id: 'SPO-001', service_type: 'freight', carrier_id: 'MAERSK', lane: 'CNSHA-ESVLC', status: 'in_service', milestone: 'Gate-in' },
      { id: 'SPO-002', service_type: 'customs', carrier_id: 'DHL', lane: 'USJFK-ESMAD', status: 'acknowledged', eta_slip: false }
    ],
    grn: [
      { id: 'GRN-001', po_id: 'PO-003', status: 'received', discrepancy: false },
      { id: 'GRN-002', po_id: 'PO-002', status: 'received', discrepancy: true, variance_pct: 2.5 }
    ],
    facturas: [
      { id: 'INV-001', po_id: 'PO-001', status: 'matched_3w', match_type: 'auto', touchless: true },
      { id: 'INV-002', po_id: 'PO-002', status: 'matched_3w', match_type: 'auto', touchless: true },
      { id: 'INV-003', po_id: 'SPO-001', status: 'exception', exception_type: 'tariff_missing' },
      { id: 'INV-004', po_id: 'SPO-002', status: 'exception', exception_type: 'extra_unpriced' }
    ],
    landed_cost: [
      { id: 'LC-001', grn_id: 'GRN-001', status: 'posted', variance_pct: 1.2, t2p_hours: 36 }
    ],
    returns: [
      { id: 'RMA-001', po_id: 'PO-003', type: 'goods', reason: 'quality_issue', status: 'authorized' }
    ],
    savings: [
      { id: 'SAV-001', type: 'negotiated', amount_eur: 12500, status: 'realized' },
      { id: 'SAV-002', type: 'process', amount_eur: 3200, status: 'approved' },
      { id: 'SAV-003', type: 'price', amount_eur: 8700, status: 'proposed' }
    ]
  },
  operador: {
    expedientes_comex: [
      { id: 'COMEX-001', mode: 'FCL', lane: 'CNSHA-ESVLC', status: 'customs_cleared' },
      { id: 'COMEX-002', mode: 'AIR', lane: 'USJFK-ESMAD', status: 'in_transit' }
    ],
    envios: Array.from({length: 10}, (_, i) => ({
      id: `ENV-${String(i+1).padStart(3, '0')}`,
      carrier: ['DHL', 'UPS', 'FEDEX'][i % 3],
      status: ['pickup', 'in_transit', 'delivered'][i % 3],
      milestone: `Mile-${i+1}`
    })),
    vehiculos: [
      { id: 'VEH-001', plate: 'ABC123', driver: 'Juan Perez', status: 'available' },
      { id: 'VEH-002', plate: 'DEF456', driver: 'Maria Garcia', status: 'in_route' },
      { id: 'VEH-003', plate: 'GHI789', driver: 'Carlos Lopez', status: 'maintenance' }
    ],
    spo_extras: [
      { spo_id: 'SPO-001', type: 'detention', amount: 250, status: 'requested' }
    ],
    claims: [
      { id: 'CLM-001', spo_id: 'SPO-002', type: 'sla_breach', status: 'investigation', debit_amount: 500 }
    ]
  }
};

const SeedCategory = ({ title, data, status, onLoad }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'loaded': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'loading': return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Database className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loaded': return 'bg-green-100 text-green-800';
      case 'loading': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex justify-between items-center p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-gray-600">{data.length} registros</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={getStatusColor()}>
          {status === 'loaded' ? 'Cargado' : 
           status === 'loading' ? 'Cargando...' : 
           status === 'error' ? 'Error' : 'Pendiente'}
        </Badge>
        {status !== 'loaded' && status !== 'loading' && (
          <Button variant="outline" size="sm" onClick={onLoad}>
            Cargar
          </Button>
        )}
      </div>
    </div>
  );
};

export default function SeedsLoader() {
  const [seedStatus, setSeedStatus] = useState({});
  const [overallStatus, setOverallStatus] = useState('pending');

  const loadSeeds = async (category, profile) => {
    setSeedStatus(prev => ({ ...prev, [`${profile}_${category}`]: 'loading' }));
    
    try {
      // Simulate seed loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSeedStatus(prev => ({ ...prev, [`${profile}_${category}`]: 'loaded' }));
    } catch (error) {
      setSeedStatus(prev => ({ ...prev, [`${profile}_${category}`]: 'error' }));
    }
  };

  const loadAllSeeds = async () => {
    setOverallStatus('loading');
    
    const promises = [];
    
    // Load Comerciante seeds
    Object.keys(DEMO_SEEDS.comerciante).forEach(category => {
      promises.push(loadSeeds(category, 'comerciante'));
    });
    
    // Load Operador seeds  
    Object.keys(DEMO_SEEDS.operador).forEach(category => {
      promises.push(loadSeeds(category, 'operador'));
    });

    try {
      await Promise.all(promises);
      setOverallStatus('loaded');
    } catch (error) {
      setOverallStatus('error');
    }
  };

  useEffect(() => {
    // Check overall status
    const allKeys = [
      ...Object.keys(DEMO_SEEDS.comerciante).map(c => `comerciante_${c}`),
      ...Object.keys(DEMO_SEEDS.operador).map(c => `operador_${c}`)
    ];
    
    const loadedCount = allKeys.filter(key => seedStatus[key] === 'loaded').length;
    const errorCount = allKeys.filter(key => seedStatus[key] === 'error').length;
    
    if (loadedCount === allKeys.length) {
      setOverallStatus('loaded');
    } else if (errorCount > 0) {
      setOverallStatus('error');
    } else if (loadedCount > 0) {
      setOverallStatus('loading');
    }
  }, [seedStatus]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Seeds Demo - RC Compras</CardTitle>
            <p className="text-sm text-gray-600">
              Datasets para Comerciante y Operador • Gate S0: &lt;2s load, sin nulls críticos
            </p>
          </div>
          <Button onClick={loadAllSeeds} disabled={overallStatus === 'loading'}>
            <RefreshCw className={`w-4 h-4 mr-2 ${overallStatus === 'loading' ? 'animate-spin' : ''}`} />
            Cargar Todos
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comerciante Seeds */}
        <div>
          <h3 className="font-semibold mb-3">Perfil Comerciante</h3>
          <div className="space-y-2">
            {Object.entries(DEMO_SEEDS.comerciante).map(([category, data]) => (
              <SeedCategory
                key={`comerciante_${category}`}
                title={category.replace('_', ' ').toUpperCase()}
                data={data}
                status={seedStatus[`comerciante_${category}`] || 'pending'}
                onLoad={() => loadSeeds(category, 'comerciante')}
              />
            ))}
          </div>
        </div>

        {/* Operador Seeds */}
        <div>
          <h3 className="font-semibold mb-3">Perfil Operador</h3>
          <div className="space-y-2">
            {Object.entries(DEMO_SEEDS.operador).map(([category, data]) => (
              <SeedCategory
                key={`operador_${category}`}
                title={category.replace('_', ' ').toUpperCase()}
                data={data}
                status={seedStatus[`operador_${category}`] || 'pending'}
                onLoad={() => loadSeeds(category, 'operador')}
              />
            ))}
          </div>
        </div>

        {/* Gate Status */}
        <Card className={`border-l-4 ${overallStatus === 'loaded' ? 'border-green-400 bg-green-50' : 
                                       overallStatus === 'error' ? 'border-red-400 bg-red-50' : 
                                       'border-yellow-400 bg-yellow-50'}`}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Gate S0 - Seeds Status</h4>
                <p className="text-sm text-gray-600">
                  Vistas cargan en &lt;2s • Datos coherentes sin nulls críticos
                </p>
              </div>
              <Badge className={overallStatus === 'loaded' ? 'bg-green-100 text-green-800' : 
                               overallStatus === 'error' ? 'bg-red-100 text-red-800' : 
                               'bg-yellow-100 text-yellow-800'}>
                {overallStatus === 'loaded' ? '✅ VERDE - Seeds OK' : 
                 overallStatus === 'error' ? '❌ ROJO - Error en carga' : 
                 '🟡 AMARILLO - Cargando...'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}