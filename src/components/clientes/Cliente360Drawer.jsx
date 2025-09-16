import React, { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NextBestActions from "./NextBestActions";
import MarkdownModal from "./MarkdownModal";
import { toast } from "sonner";

export default function Cliente360Drawer({ open, onOpenChange, account }) {
  const [data, setData] = useState(null);
  const [briefOpen, setBriefOpen] = useState(false);
  const [briefMd, setBriefMd] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!open || !account?.id) return;
    setLoading(true);
    try {
      const r = await fetch(`/functions/clientes360Get?id=${account.id}`);
      const j = await r.json();
      if(j.ok) {
        setData(j);
      } else {
        throw new Error(j.error || 'Failed to fetch 360 data');
      }
    } catch(e) {
      toast.error(`Error al cargar vista 360: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [open, account?.id]);

  useEffect(() => { load(); }, [load]);

  const genBrief = async () => {
    try {
      const r = await fetch(`/functions/clientesMeetingBrief`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: account.id })
      });
      const j = await r.json();
      if (j?.markdown) {
        setBriefMd(j.markdown);
        setBriefOpen(true);
      } else {
        throw new Error(j.error || 'Failed to generate brief');
      }
    } catch(e) {
      toast.error(`Error al generar brief: ${e.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] lg:max-w-[1100px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold">
            {account?.name || "Cuenta"} — Vista 360°
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-2">
          {/* KPIs básicos */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Kpi title="Act. pendientes" value={data?.aggregates?.activities_pending ?? "-"} />
            <Kpi title="SLA vencidos" value={data?.aggregates?.activities_sla_breach ?? "-"} badgeClass={data?.aggregates?.activities_sla_breach > 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-800"} />
            <Kpi title="Facturas" value={data?.aggregates?.invoices_total ?? "-"} />
            <Kpi title="Vencidas" value={data?.aggregates?.invoices_overdue ?? "-"} badgeClass={data?.aggregates?.invoices_overdue > 0 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-800"} />
            <Kpi title="Opps abiertas" value={data?.aggregates?.opps_open ?? "-"} />
          </div>

          {/* Next Best Actions */}
          <Card className="bg-white">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Siguientes mejores acciones</div>
                <div className="flex gap-2">
                  <Button className="bg-[#4472C4] hover:bg-[#3A61A6]" onClick={genBrief}>Exportar Brief</Button>
                  <Button variant="outline" onClick={load} disabled={loading}>{loading ? 'Cargando...' : 'Refrescar'}</Button>
                </div>
              </div>
              <NextBestActions accountId={account?.id} />
            </CardContent>
          </Card>

          {/* Listados recientes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MiniList title="Actividades recientes" items={(data?.recent?.activities || []).map(a => ({
              k: a.id, l: `${new Date(a.when).toLocaleString()} — ${a.type} — ${a.status || '-'}`, s: a.notes
            }))} />
            <MiniList title="Facturas" items={(data?.recent?.invoices || []).map(i => ({
              k: i.id, l: `${i.amount} ${i.currency || ''} — vence ${i.due_date || '-'}`, s: i.status
            }))} />
            <MiniList title="Oportunidades" items={(data?.recent?.opps || []).map(o => ({
              k: o.id, l: `${o.amount || ''} ${o.currency || ''} — ${o.stage || '-'}`, s: `Prob: ${o.probability ?? '-'}%`
            }))} />
          </div>
        </div>

        {/* Modal Brief Markdown */}
        <MarkdownModal open={briefOpen} onOpenChange={setBriefOpen} markdown={briefMd} title="Brief de reunión" />
      </DialogContent>
    </Dialog>
  );
}

function Kpi({ title, value, badgeClass }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white shadow-sm border">
      <div className="text-sm text-gray-500">{title}</div>
      <Badge className={badgeClass || "bg-gray-100 text-gray-800"}>{value}</Badge>
    </div>
  );
}

function MiniList({ title, items }) {
  return (
    <Card className="bg-white">
      <CardContent className="p-4 space-y-2">
        <div className="font-semibold">{title}</div>
        <div className="space-y-1 max-h-[240px] overflow-auto">
          {(items || []).length > 0 ? items.map(it => (
            <div key={it.k} className="text-sm">
              <div className="font-medium">{it.l}</div>
              {it.s ? <div className="text-gray-500 truncate">{it.s}</div> : null}
            </div>
          )) : <div className="text-sm text-gray-500">Sin datos</div>}
        </div>
      </CardContent>
    </Card>
  );
}