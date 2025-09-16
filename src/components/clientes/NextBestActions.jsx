
import React, { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { User as base44 } from "@/api/entities"; // Importar el SDK de User que contiene las entidades

export default function NextBestActions({ accountId }) {
  const [items, setItems] = useState([]);
  const [signals, setSignals] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadNba = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      // Inverso del mapeo: necesito el ID de CrmAccount, no de Cliente
      const maps = await base44.entities.LegacyIdMap.filter({ new_type: 'Cliente', new_id: accountId }).catch(() => []);
      const crmAccountId = maps?.find(m => m.legacy_type === 'CrmAccount')?.legacy_id;
      
      if (!crmAccountId) {
        setItems([]);
        setSignals(null);
        return;
      }

      const r = await fetch('/functions/clientesNextBestAction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: crmAccountId })
      });
      const j = await r.json();
      setItems(j?.actions || []);
      setSignals(j?.signals || null);
    } catch(e) {
      console.error("NBA fetch failed:", e);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    loadNba();
  }, [loadNba]);

  if (!accountId) return null;
  if (loading) return <div className="flex items-center text-sm text-gray-500"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cargando sugerencias...</div>;

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {items.map(a => (
          <div key={a.key} className="rounded-xl border p-3 bg-white w-[320px] shadow-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium">{a.title}</div>
              <Badge className={a.priority === 'P0' ? 'bg-red-100 text-red-700' : a.priority === 'P1' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-800'}>
                {a.priority}
              </Badge>
            </div>
            <div className="text-sm text-gray-600 mt-1">{a.reason}</div>
            <div className="text-sm mt-2 italic">{a.cta}</div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-gray-500">Sin recomendaciones</div>}
      </div>
      {signals && (
        <div className="text-xs text-gray-500">
          Señales: pending={signals.pending_count} | breach={signals.sla_breach} | warning={signals.sla_warning} | overdue={signals.invoices_overdue} | opps={signals.open_opps}
        </div>
      )}
    </div>
  );
}
