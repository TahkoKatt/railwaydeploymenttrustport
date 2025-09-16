// components/srm/dashboard/adapters/useKPIs.js
import { useState, useEffect } from 'react';

export const useKPIs = (persona = 'comerciante') => {
  const [kpis, setKpis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadKPIs = async () => {
      setIsLoading(true);
      
      // Simular carga de datos - en producción sería una llamada real
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Datos base
      const baseKpis = {
        proveedores_activos: { value: 87, trend: '+5 este mes', status: 'success' },
        ahorro_ytd_pct: { value: 12.8, trend: '+€47k vs target', status: 'success' },
        otif_90d_pct: { value: 94.2, trend: '+1.8pp', status: 'success' },
        contratos_por_vencer_30d: { value: 14, trend: '-3 vs anterior', status: 'warning' },
        rfqs_abiertas: { value: 8, trend: '+2 esta semana', status: 'info' },
        bloqueados_por_riesgo: { value: 3, trend: '-1 este mes', status: 'danger' }
      };

      // Overlay por persona
      if (persona === 'operador_logistico') {
        baseKpis.ahorro_ytd_pct.trend = '+€47k vs benchmark';
        baseKpis.otif_90d_pct.value = 96.1;
        baseKpis.rfqs_abiertas.value = 12;
      }

      setKpis(baseKpis);
      setIsLoading(false);
    };

    loadKPIs();
  }, [persona]);

  return { kpis, isLoading };
};