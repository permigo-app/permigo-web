'use client';

import { supabase } from './supabase';

export type LicenseCode = 'B' | 'AM' | 'A';

const KEY_LICENSE = 'license_type';

/**
 * Trace un clic sur l'écran de choix du permis (table `license_events`,
 * INSERT-only pour l'anon). Best-effort : un échec ne bloque jamais l'UX.
 * `selected` = permis choisi, `notify_me` = veut être prévenu (moto/camion).
 */
export async function recordLicenseEvent(
  license: LicenseCode,
  action: 'selected' | 'notify_me',
  email?: string,
): Promise<void> {
  if (!supabase) return;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('license_events').insert({
      license,
      action,
      email: email ?? null,
      user_id: user?.id ?? null,
    });
  } catch {
    // tracking uniquement — jamais bloquant
  }
}

export function getChosenLicense(): LicenseCode {
  if (typeof window === 'undefined') return 'B';
  const raw = localStorage.getItem(KEY_LICENSE);
  return raw === 'A' || raw === 'AM' ? raw : 'B';
}

export function hasChosenLicense(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEY_LICENSE) !== null;
}

/**
 * Enregistre le choix : localStorage (source immédiate) + colonne
 * `license_type` du profil si connecté. Update isolé volontairement —
 * ne pas mélanger avec syncProgressToSupabase pour qu'un échec ici
 * ne casse jamais la synchro de progression.
 */
export async function setChosenLicense(license: LicenseCode): Promise<void> {
  if (typeof window !== 'undefined') localStorage.setItem(KEY_LICENSE, license);
  if (!supabase) return;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles')
        .update({ license_type: license, updated_at: new Date().toISOString() })
        .eq('id', user.id);
    }
  } catch {
    // localStorage reste la source de vérité
  }
}
