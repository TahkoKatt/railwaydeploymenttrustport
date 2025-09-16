export async function leadsList(params={}) {
  const p=new URLSearchParams(params);
  const res=await fetch(`/functions/leadsList?${p.toString()}`);
  const data=await res.json();
  if(!res.ok || !data.ok) throw new Error(data.error||'leads_list_failed');
  return data;
}

export async function leadsCreate(payload) {
  const res=await fetch('/functions/leadsCreate',{
    method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(payload)
  });
  const data=await res.json();
  if(!res.ok || !data.ok) throw new Error(data.error||'leads_create_failed');
  return data.item;
}

export async function leadsUpdate(id, patch) {
  const res=await fetch('/functions/leadsUpdate',{
    method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ id, ...patch })
  });
  const data=await res.json();
  if(!res.ok || !data.ok) throw new Error(data.error||'leads_update_failed');
  return data.item;
}

export async function leadsDelete(id) {
  const res=await fetch('/functions/leadsDelete',{
    method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ id })
  });
  const data=await res.json();
  if(!res.ok || !data.ok) throw new Error(data.error||'leads_delete_failed');
  return true;
}

export async function leadsConvert(id, { create_account=true } = {}) {
  const res=await fetch('/functions/leadsConvert',{
    method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ id, create_account })
  });
  const data=await res.json();
  if(!res.ok || !data.ok) throw new Error(data.error||'leads_convert_failed');
  return data;
}