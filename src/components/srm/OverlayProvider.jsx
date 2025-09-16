// components/srm/OverlayProvider.jsx
import { createContext, useContext, useMemo } from 'react';

const OverlayCtx = createContext({ persona: 'comerciante' });

export function OverlayProvider({ children }) {
  const params = new URLSearchParams(window.location.search);
  let p = params.get('persona');
  try {
    if (!p) p = localStorage.getItem('persona');
  } catch {}
  const persona = p === 'operador_logistico' ? 'operador_logistico' : 'comerciante';
  const value = useMemo(() => ({ persona }), [persona]);
  return <OverlayCtx.Provider value={value}>{children}</OverlayCtx.Provider>;
}

export const useOverlay = () => useContext(OverlayCtx);