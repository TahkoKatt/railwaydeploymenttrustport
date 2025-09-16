import React from "react";

export default function KpiGrid({ children }) {
  // Auto-fit sin romper contenedores en “encogida”
  return <div className="grid grid-cols-12 gap-4 [&>*]:col-span-12 md:[&>*]:col-span-6 lg:[&>*]:col-span-4 xl:[&>*]:col-span-2">{children}</div>;
}