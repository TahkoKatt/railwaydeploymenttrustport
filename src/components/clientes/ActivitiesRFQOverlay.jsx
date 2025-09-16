import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ActivitiesRFQOverlay({ open, onOpenChange, onCreated }) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);

  const parse = async () => {
    setLoading(true);
    try {
      const r = await fetch("/functions/rfqIntakeParse", { 
        method:"POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }) 
      });
      const j = await r.json();
      if (j.error) {
        toast.error(`Error: ${j.error}`);
      } else {
        setParsed(j?.parsed || null);
      }
    } catch (e) {
      toast.error(`Error al parsear: ${e.message}`);
    }
    setLoading(false);
  };

  const create = async () => {
    if (!parsed?.contact_email) return;
    try {
      // 1) crear lead mínimo
      await fetch("/functions/leadsCreate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: parsed.contact_email.split("@")[1]?.split(".")[0] || "Unknown Company",
          contact_name: parsed.contact_email.split("@")[0],
          email: parsed.contact_email,
          status: "new",
          source: "rfq_intake",
          owner_id: "system" // Will be updated by the backend with actual user
        })
      }).catch(()=>{});
      
      // 2) registrar actividad con SLA
      await fetch("/functions/activitiesCreate", {
        method:"POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "task",
          related_to: "lead",
          related_id: "", // si ya sabes account, ponlo aquí
          notes: `RFQ: ${parsed.origin} → ${parsed.destination} | ${parsed.incoterm} | ${parsed.weight_kg}kg ${parsed.volume_cbm}cbm | ${parsed.ready_date}`
        })
      });
      
      toast.success("Lead y tarea creados exitosamente");
      onOpenChange(false);
      setText("");
      setParsed(null);
      onCreated?.();
    } catch (e) {
      toast.error(`Error al crear: ${e.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold">RFQ Intake</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Textarea 
            value={text} 
            onChange={e=>setText(e.target.value)} 
            placeholder="Pega aquí el email/WhatsApp del cliente…&#10;&#10;Ejemplo:&#10;Origen: Barcelona&#10;Destino: Madrid&#10;Incoterm: FOB&#10;Peso: 1500kg&#10;Volumen: 5.2cbm&#10;Fecha: 2025-02-15&#10;Contacto: cliente@empresa.com"
            className="min-h-[120px]"
          />
          <div className="flex gap-2">
            <Button className="bg-[#4472C4] hover:bg-[#3A61A6]" onClick={parse} disabled={loading || !text.trim()}>
              {loading ? "Parseando…" : "Extraer con IA"}
            </Button>
            <Button variant="outline" onClick={()=>{ setText(""); setParsed(null); }}>Limpiar</Button>
          </div>
          {parsed && (
            <div className="rounded-xl border p-3 text-sm">
              <div><b>Origen:</b> {parsed.origin || "-"}</div>
              <div><b>Destino:</b> {parsed.destination || "-"}</div>
              <div><b>Incoterm:</b> {parsed.incoterm || "-"}</div>
              <div><b>Peso (kg):</b> {parsed.weight_kg || "-"}</div>
              <div><b>Volumen (cbm):</b> {parsed.volume_cbm || "-"}</div>
              <div><b>Ready date:</b> {parsed.ready_date || "-"}</div>
              <div><b>Email:</b> {parsed.contact_email || "-"}</div>
              <div className="mt-3 flex gap-2">
                <Button className="bg-[#4472C4] hover:bg-[#3A61A6]" onClick={create}>Crear Lead + Tarea</Button>
                <Button variant="outline" onClick={()=>setParsed(null)}>Editar extracción</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}