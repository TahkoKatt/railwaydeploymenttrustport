// components/srm/dashboard/adapters/useRFQData.js
import { useState, useEffect } from 'react';

function daysBetween(date1, date2) {
  const diffTime = new Date(date2) - new Date(date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export const useRFQData = () => {
  const [rfqs, setRfqs] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRFQs = async () => {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const today = new Date();
      const mockRfqs = [
        {
          rfq: "RFQ-2024-045",
          requester: "Ana Garcia",
          lane: "EU-US Air Express",
          age: "3 dias",
          sla: "OK",
          status: "En evaluacion",
          valid_to: "2025-01-25",
          respuestas: 3
        },
        {
          rfq: "RFQ-2024-048", 
          requester: "Luis Perez",
          lane: "Transporte Road ES-FR",
          age: "7 dias",
          sla: "Warning",
          status: "Esperando ofertas",
          valid_to: "2025-01-20",
          respuestas: 1
        },
        {
          rfq: "RFQ-2024-051",
          requester: "Maria Lopez", 
          lane: "FCL Asia-Europe",
          age: "2 dias",
          sla: "OK",
          status: "Evaluando ofertas",
          valid_to: "2025-01-30",
          respuestas: 4
        },
        {
          rfq: "RFQ-2024-052",
          requester: "Carlos Ruiz",
          lane: "LCL US-Spain", 
          age: "5 dias",
          sla: "OK",
          status: "Esperando documentacion",
          valid_to: "2025-01-28",
          respuestas: 2
        },
        {
          rfq: "RFQ-2024-049",
          requester: "Ana Garcia",
          lane: "Air Latam-EU",
          age: "9 dias", 
          sla: "Overdue",
          status: "Escalado",
          valid_to: "2025-01-15",
          respuestas: 0
        }
      ];

      const processedRfqs = mockRfqs.map(rfq => ({
        ...rfq,
        sla_restante: daysBetween(today, rfq.valid_to)
      }));

      setRfqs(processedRfqs);
      setIsLoading(false);
    };

    loadRFQs();
  }, []);

  const isEmpty = !rfqs || rfqs.length === 0;

  return { rfqs, isLoading, isEmpty };
};