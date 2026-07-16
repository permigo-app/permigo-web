'use client';

/**
 * Permis actif — cœur de l'architecture multi-permis.
 *
 * Principes :
 * - Le permis B est le permis historique : ses clés localStorage restent
 *   SANS préfixe et ses données restent dans src/data/theme_X.json.
 *   → zéro migration, zéro régression pour les utilisateurs existants.
 * - Tout autre permis (AM aujourd'hui, A demain) est préfixé : clés
 *   localStorage "AM::<clé>", contenu dans src/data/am/….
 * - La synchro Supabase des colonnes de profil (stars, exams…) reste
 *   réservée au permis B tant que la migration des colonnes multi-permis
 *   n'a pas été faite (voir AM-5) : elle lit les clés B brutes, jamais
 *   les clés du permis actif.
 *
 * Convention d'identifiants (obligatoire pour les nouveaux permis) :
 * les ids de questions AM commencent par "AM_" (ex. AM_A1_Q1). La banque
 * d'erreurs serveur est indexée par id de question, commune à tous les
 * permis d'un même compte — des ids globalement uniques garantissent
 * qu'une erreur B ne ressort jamais dans les révisions AM et inversement.
 */

export type ActiveLicense = 'B' | 'AM';

const KEY_LICENSE = 'license_type';

export function getActiveLicense(): ActiveLicense {
  if (typeof window === 'undefined') return 'B';
  // 'A' (moto) retombera sur B tant que son contenu n'existe pas
  return localStorage.getItem(KEY_LICENSE) === 'AM' ? 'AM' : 'B';
}

/** Préfixe une clé localStorage selon le permis actif. B = clé historique intacte. */
export function scopedKey(base: string): string {
  const lic = getActiveLicense();
  return lic === 'B' ? base : `${lic}::${base}`;
}
