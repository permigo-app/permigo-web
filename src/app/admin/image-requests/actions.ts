'use server';

import { createClient } from '@supabase/supabase-js';

export async function resolveVotesAction(ids: string[]): Promise<{ resolved: number }> {
  if (ids.length === 0) return { resolved: 0 };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey || serviceKey === 'REMPLACE_PAR_TA_CLE_SERVICE_ROLE') {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY non configurée dans .env.local');
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { error, count } = await supabase
    .from('image_requests')
    .update({ status: 'resolved', resolved_at: new Date().toISOString() })
    .in('id', ids)
    .eq('status', 'pending');

  if (error) throw new Error(error.message);

  return { resolved: count ?? 0 };
}
