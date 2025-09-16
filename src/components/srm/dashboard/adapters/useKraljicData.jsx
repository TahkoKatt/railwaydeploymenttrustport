// components/srm/dashboard/adapters/useKraljicData.js
import { useState, useEffect } from 'react';

function classifyQuadrant(impact, risk) {
  if (impact >= 50 && risk >= 50) return 'strategic';
  if (impact >= 50 && risk < 50) return 'leverage';
  if (impact < 50 && risk >= 50) return 'bottleneck';
  return 'routine';
}

export const useKraljicData = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const suppliers = [
        { name: "Transportes SA", impact: 82, risk: 25, spend: 280000 },
        { name: "Materiales ABC", impact: 74, risk: 68, spend: 180000 },
        { name: "Tech Solutions", impact: 45, risk: 38, spend: 95000 },
        { name: "Critical Parts Co", impact: 91, risk: 85, spend: 320000 },
        { name: "Global Freight", impact: 65, risk: 20, spend: 150000 },
        { name: "Service Corp", impact: 35, risk: 72, spend: 110000 }
      ];

      const processedData = suppliers.map(supplier => ({
        ...supplier,
        quadrant: classifyQuadrant(supplier.impact, supplier.risk)
      }));

      setData(processedData);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const isEmpty = !data || data.length === 0;

  return { data, isLoading, isEmpty };
};