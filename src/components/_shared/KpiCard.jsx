import React from "react";

export default function KpiCard({ label, value, delta, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_6px_18px_rgba(0,0,0,.06)] p-4 flex items-start justify-between">
      <div className="min-w-0">
        <div className="text-[13px] text-[#6B7280] truncate">{label}</div>
        <div className="mt-1 text-[28px] leading-none font-semibold text-[#111827]">{value}</div>
        {delta && (
          <div className={`mt-1 text-[12px] ${delta.startsWith("-") ? "text-[#DA2242]" : "text-[#16A34A]"}`}>
            {delta}
          </div>
        )}
      </div>
      <div className="w-10 h-10 rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
        {Icon ? <Icon size={18} className="text-[#4472C4]" /> : null}
      </div>
    </div>
  );
}