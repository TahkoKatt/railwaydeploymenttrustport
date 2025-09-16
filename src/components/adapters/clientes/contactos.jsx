export async function contactosList(params={}) {
  const p = new URLSearchParams(params);
  const res = await fetch(`/functions/contactosList?${p.toString()}`);
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error||'contactos_list_failed');
  return data;
}

export async function contactosGet(id) {
  const p=new URLSearchParams({id});
  const res=await fetch(`/functions/contactosGet?${p.toString()}`);
  const data=await res.json();
  if(!res.ok || !data.ok) throw new Error(data.error||'contactos_get_failed');
  return data.item;
}

export async function contactosCreate(payload) {
  const res=await fetch('/functions/contactosCreate',{
    method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(payload)
  });
  const data=await res.json();
  if(!res.ok || !data.ok) throw new Error(data.error||'contactos_create_failed');
  return data.item;
}

export async function contactosUpdate(id, patch) {
  const res=await fetch('/functions/contactosUpdate',{
    method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ id, ...patch })
  });
  const data=await res.json();
  if(!res.ok || !data.ok) throw new Error(data.error||'contactos_update_failed');
  return data.item;
}

export async function contactosDelete(id) {
  const res=await fetch('/functions/contactosDelete',{
    method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ id })
  });
  const data=await res.json();
  if(!res.ok || !data.ok) throw new Error(data.error||'contactos_delete_failed');
  return true;
}