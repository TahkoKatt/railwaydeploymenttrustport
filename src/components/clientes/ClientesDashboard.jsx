import React from "react";
import { DollarSign, TrendingUp, Clock, Target, Heart, Users } from "lucide-react";
import KpiGrid from "@/components/_shared/KpiGrid";
import KpiCard from "@/components/_shared/KpiCard";
import AIPanel from "@/components/_shared/AIPanel";

const insightsClientes = [
  { id:"sla_critico", icon:"warning", title:"SLA Crítico", description:"Actividades vencidas >48h. Riesgo de escalamiento.", cta:{label:"Revisar ahora", href:"/Clientes?tab=actividades&filter=sla_breach"} },
  { id:"op_leads", icon:"chart", title:"Oportunidad Leads", description:"Leads sin contactar en 24h. Potencial conversión perdida.", cta:{label:"Contactar leads", href:"/Clientes?tab=leads&filter=idle_24h"} },
  { id:"nps_feedback", icon:"chart", title:"NPS Feedback", description:"Nuevas respuestas requieren análisis de temas.", cta:{label:"Ver insights", href:"/Clientes?tab=postventa"} },
];

export default function ClientesDashboard() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-gray-900 mb-2">
          Clientes — Dashboard
        </h1>
        <p className="text-[14px] text-gray-600">
          Visión 360 del ciclo de vida del cliente: leads, cuentas y postventa.
        </p>
      </div>

      <KpiGrid>
        <KpiCard label="Ingresos YTD" value="€12.5M"   delta="+2.1pp" icon={DollarSign}/>
        <KpiCard label="Tasa Conversión" value="18.5%" delta="+1.3pp" icon={TrendingUp}/>
        <KpiCard label="SLA Resp. (h)"  value="22h"    delta="-0.4h"  icon={Clock}/>
        <KpiCard label="Leads Activos"  value="89"     delta="+5"     icon={Target}/>
        <KpiCard label="NPS"            value="45"     delta="+2"     icon={Heart}/>
        <KpiCard label="Clientes Activos" value="1,247" delta="+31"   icon={Users}/>
      </KpiGrid>

      <AIPanel insights={insightsClientes}/>

      {/* Aquí irían los charts y tablas del dashboard de clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_6px_18px_rgba(0,0,0,.06)] p-4 h-64 flex items-center justify-center text-gray-400">
          Chart: Evolución de Leads
        </div>
        <div className="rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_6px_18px_rgba(0,0,0,.06)] p-4 h-64 flex items-center justify-center text-gray-400">
          Chart: NPS por Segmento
        </div>
      </div>
    </div>
  );
}