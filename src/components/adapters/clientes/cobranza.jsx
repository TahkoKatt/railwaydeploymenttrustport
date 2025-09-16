export async function cobranzaList(params={}) {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`/functions/cobranzaList${qs ? `?${qs}` : ''}`);
  return (await r.json())?.items || [];
}