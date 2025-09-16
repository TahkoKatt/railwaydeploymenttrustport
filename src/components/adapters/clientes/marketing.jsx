export async function seqList(q='') {
  const r = await fetch(`/functions/marketingSequencesList${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  const j = await r.json(); return j?.items || [];
}
export async function seqUpsert(payload) {
  const r = await fetch('/functions/marketingSequencesUpsert', { method: 'POST', body: JSON.stringify(payload) });
  return await r.json();
}
export async function seqStart(sequence_id, targets) {
  const r = await fetch('/functions/marketingSequencesStart', { method: 'POST', body: JSON.stringify({ sequence_id, targets }) });
  return await r.json();
}
export async function suggestMicrocopy(args) {
  const r = await fetch('/functions/marketingMicrocopySuggest', { method: 'POST', body: JSON.stringify(args) });
  return await r.json();
}