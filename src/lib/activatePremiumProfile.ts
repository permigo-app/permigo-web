import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Passe un profil en premium de façon robuste :
 * - retente sans stripe_customer_id si la colonne n'existe pas dans le schéma
 * - crée la ligne profiles si elle n'existe pas (update à 0 lignes = succès silencieux)
 */
export async function activatePremiumProfile(
  supabase: SupabaseClient,
  userId: string,
  customerId?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const base: Record<string, unknown> = {
    is_premium: true,
    updated_at: new Date().toISOString(),
  };
  const full = customerId ? { ...base, stripe_customer_id: customerId } : base;

  let { data, error } = await supabase
    .from('profiles')
    .update(full)
    .eq('id', userId)
    .select('id');

  if (error && customerId) {
    console.warn('[Premium] Update avec stripe_customer_id échoué, retente sans:', error.message);
    ({ data, error } = await supabase
      .from('profiles')
      .update(base)
      .eq('id', userId)
      .select('id'));
  }

  if (error) return { ok: false, error: error.message };
  if (data && data.length > 0) return { ok: true };

  // Aucune ligne touchée → le profil n'existe pas, on le crée
  console.warn('[Premium] Aucun profil pour', userId, '— création');
  let { error: insertError } = await supabase.from('profiles').insert(
    customerId
      ? { id: userId, is_premium: true, stripe_customer_id: customerId }
      : { id: userId, is_premium: true }
  );

  if (insertError && customerId) {
    console.warn('[Premium] Insert avec stripe_customer_id échoué, retente sans:', insertError.message);
    ({ error: insertError } = await supabase
      .from('profiles')
      .insert({ id: userId, is_premium: true }));
  }

  if (insertError) return { ok: false, error: insertError.message };
  return { ok: true };
}
