// components/srm/dashboard/adapters/useContractsDue.js
import { useState, useEffect } from 'react';

function getContractStatus(daysToExpire) {
  if (daysToExpire < 0) return 'vencido';
  if (daysToExpire <= 30) return 'por_renovar';
  if (daysToExpire <= 60) return 'renovacion_en_curso';
  return 'activo';
}

function daysBetween(date1, date2) {
  const diffTime = new Date(date2) - new Date(date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export const useContractsDue = () => {
  const [contracts, setContracts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContracts = async () => {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const today = new Date();
      const mockContracts = [
        { supplier: "Transportes SA", contract: "CNT-2024-001", ends: "2025-01-15", status: "Renovacion en curso" },
        { supplier: "Materiales ABC", contract: "CNT-2024-007", ends: "2025-01-28", status: "Por renovar" },
        { supplier: "Tech Solutions", contract: "CNT-2024-012", ends: "2025-02-10", status: "Negociacion abierta" },
        { supplier: "Critical Parts Co", contract: "CNT-2024-008", ends: "2025-02-28", status: "Por renovar" },
        { supplier: "Global Freight", contract: "CNT-2024-015", ends: "2025-03-15", status: "Activo" },
        { supplier: "Service Corp", contract: "CNT-2024-019", ends: "2025-03-30", status: "Activo" },
        { supplier: "Logistics Plus", contract: "CNT-2024-022", ends: "2025-04-10", status: "Activo" },
        { supplier: "Supply Chain Co", contract: "CNT-2024-025", ends: "2025-04-25", status: "Activo" }
      ];

      const processedContracts = mockContracts
        .map(contract => {
          const daysToExpire = daysBetween(today, contract.ends);
          return {
            ...contract,
            days: daysToExpire,
            badge_status: getContractStatus(daysToExpire)
          };
        })
        .sort((a, b) => a.days - b.days)
        .slice(0, 8);

      setContracts(processedContracts);
      setIsLoading(false);
    };

    loadContracts();
  }, []);

  const isEmpty = !contracts || contracts.length === 0;

  return { contracts, isLoading, isEmpty };
};