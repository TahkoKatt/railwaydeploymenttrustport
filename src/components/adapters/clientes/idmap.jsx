import { idMapUpsert as invokeUpsert, idMapGet as invokeGet } from '@/api/functions';

export async function idMapUpsert(payload) {
  const { data } = await invokeUpsert(payload);
  if (!data || !data.ok) throw new Error(data.error || 'idmap_upsert_failed');
  return data.record;
}

export async function idMapResolveByLegacy(legacy_type, legacy_id) {
  const { data } = await invokeGet({ legacy_type, legacy_id });
  if (!data || !data.ok) throw new Error(data.error || 'idmap_not_found');
  return data.record;
}

export async function idMapResolveByNew(new_type, new_id) {
  const { data } = await invokeGet({ new_type, new_id });
  if (!data || !data.ok) throw new Error(data.error || 'idmap_not_found');
  return data.record;
}