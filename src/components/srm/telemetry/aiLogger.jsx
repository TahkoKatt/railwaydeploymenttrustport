// components/srm/telemetry/aiLogger.js
const KEY = 'srm_ai_logs';
const CAP = 100;

export function logAi(evt) {
  try {
    const now = Date.now();
    const rec = { ...evt, ts: now };
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]');
    arr.push(rec);
    while (arr.length > CAP) arr.shift();
    localStorage.setItem(KEY, JSON.stringify(arr));
    console.info('[SRM.AI]', rec);
  } catch (e) { /* no-op */ }
}

export function readAiLogs() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function clearAiLogs() { try { localStorage.removeItem(KEY); } catch {} }