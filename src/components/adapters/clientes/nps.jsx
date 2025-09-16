export async function npsSurveys() {
  const r = await fetch('/functions/npsSurveysList'); return (await r.json())?.items || [];
}
export async function npsSurveyUpsert(payload) {
  const r = await fetch('/functions/npsSurveyUpsert', { method:'POST', body: JSON.stringify(payload) }); return await r.json();
}
export async function npsResponses(survey_id) {
  const r = await fetch(`/functions/npsResponsesList${survey_id?`?survey_id=${survey_id}`:''}`); return (await r.json())?.items || [];
}
export async function npsResponseUpsert(payload) {
  const r = await fetch('/functions/npsResponseUpsert', { method:'POST', body: JSON.stringify(payload) }); return await r.json();
}
export async function npsThemeSuggest(comment) {
  const r = await fetch('/functions/npsThemeSuggest', { method:'POST', body: JSON.stringify({ comment }) }); return await r.json();
}