// Cliente local con timeout, reintentos y logging básico.
// Sustituiremos el "simulate" por fetch a n8n cuando toque.

import { logAi } from '@/components/srm/telemetry/aiLogger';

// === Feature Flags (runtime) ===
// Puedes togglear esto en la consola del navegador sin desplegar:
// window.__FF_AI_LIVE = true;
// window.__AI_BASE = 'https://n8n.tu-dominio.dev';
const AI_LIVE = (window.__FF_AI_LIVE === true);
const AI_BASE = (typeof window.__AI_BASE === 'string' && /^https:\/\//.test(window.__AI_BASE))
  ? window.__AI_BASE
  : 'https://n8n.example.dev'; // placeholder seguro

// Whitelist de acciones permitidas en vivo
const LIVE_ACTIONS = new Set(['normalize_rates']); // añade más cuando estén listos

// === Circuit Breaker local (por acción) ===
const CB = (window.__SRM_AI_CB = window.__SRM_AI_CB || {});
// estado: { fails, openUntil }
// umbral y cooldown
const CB_FAILS = 3;
const CB_COOLDOWN_MS = 60_000;

function cbIsOpen(action){
  const st = CB[action];
  return st && st.openUntil && st.openUntil > Date.now();
}
function cbRegister(action, ok){
  const st = (CB[action] = CB[action] || { fails:0, openUntil:0 });
  if (ok) { st.fails = 0; st.openUntil = 0; return; }
  st.fails += 1;
  if (st.fails >= CB_FAILS) {
    st.openUntil = Date.now() + CB_COOLDOWN_MS;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- SIMULACION (fallback) ---
const simulate = async () => {
  // Latencia simulada 400–900ms
  const latency = 400 + Math.floor(Math.random() * 500);
  await sleep(latency);
  // 1 de cada ~12 intenta "fallar" para probar retry
  if (Math.random() < 0.08) throw new Error("AI_SIMULATED_TRANSIENT_ERROR");
  return { ok: true, result: { message: "ok (stub)", latency, ts: Date.now() } };
};

// --- LLAMADA REAL (n8n) ---
async function callReal({ action, context, payload, timeoutMs }) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${AI_BASE}/webhook/ai/${action}`, { // Adjusted path for typical n8n webhook
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context, payload }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    const json = await res.json();
    // Normaliza respuesta esperada: { ok: boolean, result?, error? }
    if (json && typeof json.ok === 'boolean') return json;
    return { ok: true, result: json || {} };
  } catch (e) {
    clearTimeout(t);
    throw e;
  }
}

export async function invokeAi({ action, context = {}, payload = {}, timeoutMs = 10000, retries = 2 }) {
  const startedAt = Date.now();
  let response = null;

  // Short-circuit si el breaker está abierto
  if (AI_LIVE && cbIsOpen(action)) {
    const latency = Date.now() - startedAt;
    response = { ok: false, action, error: 'CB_OPEN', latency };
    logAi({ 
      action, 
      persona: context.persona, 
      tab: context.submodule || context.tab || 'dashboard', 
      latency_ms: latency, 
      ok: false, 
      error: response.error 
    });
    console.info(`[AI][${action}] done in ${latency}ms (live=false, reason=CB_OPEN)`);
    return response;
  }

  // Elige runner: live si está permitido, si no → simulate
  const runner = (AI_LIVE && LIVE_ACTIONS.has(action))
    ? (args) => callReal(args)
    : (args) => simulate(args);

  let timeoutId;
  const timeoutPromise = new Promise((_, rej) => {
    timeoutId = setTimeout(() => rej(new Error("AI_TIMEOUT")), timeoutMs);
  });

  try {
    response = await Promise.race([ runner({ action, context, payload, timeoutMs }), timeoutPromise ]);
    cbRegister(action, true); // éxito: cierra breaker
  } catch (err) {
    cbRegister(action, false); // fallo: registra y evalúa abrir breaker
    if (retries > 0 && (err.message === "AI_TIMEOUT" || /HTTP_|TRANSIENT|abort/i.test(err.message))) {
      const backoff = Math.round(timeoutMs * 0.5);
      await sleep(backoff);
      return invokeAi({ action, context, payload, timeoutMs: timeoutMs + backoff, retries: retries - 1 });
    }
    response = { ok: false, action, error: err.message || String(err) };
  } finally {
    clearTimeout(timeoutId);
    const dur = Date.now() - startedAt;
    logAi({ 
      action, 
      persona: context.persona, 
      tab: context.submodule || context.tab || 'dashboard', 
      latency_ms: dur, 
      ok: (response?.ok === true), 
      error: response?.error 
    });
    console.info(`[AI][${action}] done in ${dur}ms (live=${AI_LIVE && LIVE_ACTIONS.has(action)})`);
  }
  
  return response;
}