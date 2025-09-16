import { Bolt, AlertTriangle, TrendingDown, BarChart3 } from "lucide-react";

const ICON_COLOR = "#4472C4"; // Monocromo azul Trustport

const tone = {
  wrap: "rounded-2xl border border-[#D9E6FF] bg-[#EFF4FF] p-5 md:p-6 shadow-[0_6px_18px_rgba(0,0,0,.06)]",
  head: "flex items-center gap-2 mb-3",
  // Corregido: Título principal en azul Trustport
  h3: "text-[clamp(16px,1.5vw,18px)] font-semibold text-[#4472C4]",
  sub: "text-sm text-[#6B7280]",
  grid: "mt-3 grid grid-cols-12 gap-4",
  card: "col-span-12 md:col-span-6 xl:col-span-4 bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col",
  // Corregido: Título de la tarjeta en azul Trustport
  title: "text-[15px] font-semibold text-[#4472C4] flex items-center gap-2",
  desc: "mt-1 text-[13px] text-[#6B7280] flex-grow",
  // Corregido: Botón outline, no full-width, y con tamaño de texto correcto
  ctaGhost:
    "mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold " +
    "border border-[#4472C4] text-[#4472C4] bg-white hover:bg-[#EDF2FF] active:bg-[#E5ECFF] transition-colors"
};

const MonoIcon = ({ kind="bolt" }) => {
  const common = { size: 18, color: ICON_COLOR, 'aria-hidden': true };
  if (kind==="warning") return <AlertTriangle {...common} />;
  if (kind==="risk")     return <TrendingDown {...common} />;
  if (kind==="chart")    return <BarChart3 {...common} />;
  return <Bolt {...common} />;
};

export default function AIPanel({ insights = [] }) {
  return (
    <section className={tone.wrap} aria-label="AI Insights & Recomendaciones">
      <header className={tone.head}>
        <Bolt size={18} style={{ color: ICON_COLOR }} aria-hidden="true" />
        <h3 className={tone.h3}>AI Insights & Recomendaciones</h3>
      </header>

      {(!insights || insights.length===0) ? (
        <p className={tone.sub}>No hay recomendaciones de IA por ahora.</p>
      ) : (
        <div className={tone.grid}>
          {insights.map((it) => (
            <article key={it.id} className={tone.card}>
              <div className={tone.title}>
                <MonoIcon kind={it.icon}/>
                <span>{it.title}</span>
              </div>
              <p className={tone.desc}>{it.description}</p>
              {it.cta && (
                <a href={it.cta.href} className={tone.ctaGhost}>
                  {it.cta.label}
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}