import * as mockProvider from './providers/mock.js';
import * as remoteProvider from './providers/remote.js';

// Cliente de IA: orquestador con timeouts, circuit-breaker (futuro), y flags.
// Jamás rechaza una promesa.

export const evaluate = async (request) => {
  const startTs = performance.now();
  const providerName = window.__ff?.ia_remote ? 'remote' : 'mock';

  // Telemetría: ia:request.start
  console.log(`ia:request.start`, JSON.stringify({
    tab: request.tab,
    persona: request.persona,
    provider: providerName,
    ts: new Date().toISOString()
  }));

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), request.limits.timeout_ms)
    );

    const provider = providerName === 'remote' ? remoteProvider : mockProvider;
    
    // Promise.race para implementar el timeout
    const result = await Promise.race([
      provider.evaluate(request),
      timeoutPromise,
    ]);
    
    const latency = performance.now() - startTs;
    
    // Telemetría: ia:request.end (éxito)
    console.log(`ia:request.end`, JSON.stringify({
      tab: request.tab,
      persona: request.persona,
      provider: providerName,
      latency_ms: latency,
      ok: true,
      ts: new Date().toISOString()
    }));
    
    return result;

  } catch (error) {
    const latency = performance.now() - startTs;
    const isTimeout = error.message === 'timeout';

    // Telemetría: ia:request.end (error)
    console.error(`ia:request.end`, JSON.stringify({
      tab: request.tab,
      persona: request.persona,
      provider: providerName,
      latency_ms: latency,
      ok: false,
      error: isTimeout ? 'timeout' : 'provider_error',
      ts: new Date().toISOString()
    }));

    return { insights: [], error: error.message };
  }
};

// Export as iaClient for backward compatibility
export const iaClient = { evaluate };