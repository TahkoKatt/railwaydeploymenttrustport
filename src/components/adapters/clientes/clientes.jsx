export async function clientesList(params={}) {
  const p = new URLSearchParams(params);
  const res = await fetch(`/functions/clientesList?${p.toString()}`);
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error||'clientes_list_failed');
  return data;
}

export async function clientesGet(id) {
  const p = new URLSearchParams({ id });
  const res = await fetch(`/functions/clientesGet?${p.toString()}`);
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error||'clientes_get_failed');
  return data.item;
}

export async function clientesCreate(payload) {
  const res = await fetch('/functions/clientesCreate', {
    method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(payload)
  });
  const data = await res.json();
  if(!res.ok || !data.ok) throw new Error(data.error||'clientes_create_failed');
  return data.item;
}

export async function clientesUpdate(id, patch) {
  const res = await fetch('/functions/clientesUpdate', {
    method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ id, ...patch })
  });
  const data = await res.json();
  if(!res.ok || !data.ok) throw new Error(data.error||'clientes_update_failed');
  return data.item;
}

export async function clientesDelete(id) {
  const res = await fetch('/functions/clientesDelete', {
    method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ id })
  });
  const data = await res.json();
  if(!res.ok || !data.ok) throw new Error(data.error||'clientes_delete_failed');
  return true;
}