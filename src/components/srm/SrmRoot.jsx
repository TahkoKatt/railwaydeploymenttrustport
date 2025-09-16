// components/srm/SrmRoot.jsx
export default function SrmRoot({ children }) {
  return (
    <div className="srm-root">
      {children}
      <style>{`
        .srm-root { background:#F1F0EC; font-family: Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
        .srm-root .card { border-radius:16px; box-shadow:0 6px 18px rgba(0,0,0,.06); background:#FFFFFF; }
        .srm-root .btn-primary { background:#4472C4; border-color:#4472C4; color:#FFFFFF; }
        /* Si hubiera topbar local dentro del markup de SRM, se oculta solo aquí.
           Si el topbar es GLOBAL (fuera de SRM), NO se oculta para no afectar otros módulos. */
        .srm-root [data-topbar], .srm-root .topbar, .srm-root header.topbar { display:none !important; }
      `}</style>
    </div>
  );
}