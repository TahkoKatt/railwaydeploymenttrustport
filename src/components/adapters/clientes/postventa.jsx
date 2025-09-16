export async function casesList(params={}) {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`/functions/postventaCasesList${qs ? `?${qs}` : ''}`);
  return (await r.json())?.items || [];
}
export async function caseCreate(payload) {
  const r = await fetch('/functions/postventaCaseCreate', { method: 'POST', body: JSON.stringify(payload) });
  return await r.json();
}
export async function shareLinkCreate(activity_id) {
  const r = await fetch('/functions/postventaShareLinkCreate', { method: 'POST', body: JSON.stringify({ activity_id }) });
  return await r.json();
}