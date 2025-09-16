// components/srm/perf/Measure.jsx
import { useEffect } from 'react';

function pushSample(tab, dt) {
  try {
    const key = 'srm_tab_times';
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    arr.push({ tab, dt, ts: Date.now() });
    while (arr.length > 100) arr.shift();
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {}
  (window.__srmTabTimes = window.__srmTabTimes || []).push(dt);
}

export default function Measure({ tab, children }) {
  useEffect(() => {
    const t0 = window.__srmNavT0 || performance.now();
    const dt = performance.now() - t0;
    pushSample(tab, dt);
    // Limpia el marcador para el siguiente cambio
    window.__srmNavT0 = undefined;
  }, [tab]);
  return children;
}