import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function MarkdownModal({ open, onOpenChange, markdown, title = "Documento" }) {
  const download = () => {
    const blob = new Blob([markdown || ""], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || 'documento').toLowerCase().replace(/\s+/g,'_')}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown || "");
      toast.success("Contenido copiado al portapapeles");
    } catch (_e) {
      toast.error("No se pudo copiar el contenido");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button className="bg-[#4472C4] hover:bg-[#3A61A6]" onClick={download}>Descargar .md</Button>
            <Button variant="outline" onClick={copy}>Copiar</Button>
          </div>
          <pre className="bg-gray-50 p-3 rounded-md max-h-[60vh] overflow-auto text-sm whitespace-pre-wrap">{markdown || "(vacío)"}</pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}