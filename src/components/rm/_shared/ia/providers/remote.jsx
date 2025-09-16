// Provider remoto: STUB. No se usa si ff.ia_remote=false
export const evaluate = async (request) => {
  console.warn("[IA Provider] Llamada a 'remote' bloqueada por flag 'ff.ia_remote=false'.");
  return Promise.resolve({
    insights: [],
    error: "Remote provider disabled by feature flag.",
  });
};