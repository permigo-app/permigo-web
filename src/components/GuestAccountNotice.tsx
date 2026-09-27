'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import { getAllCompletedParties } from '@/lib/progressStorage';

const KEY_MASQUE = 'invite_avis_compte_masque';

/**
 * Rappel destiné aux élèves entrés en mode invité : leur progression ne vit
 * que dans le navigateur de cet appareil, et rien ne le leur dit.
 *
 * Il n'apparaît PAS à l'arrivée — un bandeau qui s'affiche avant d'avoir
 * travaillé ne fait que gêner. Il attend la première partie terminée :
 * l'élève a alors quelque chose à perdre, et c'est là que le message porte.
 */
export default function GuestAccountNotice() {
  const { user } = useAuth();
  const { t } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (user) return; // connecté : sa progression est déjà dans son compte
    if (localStorage.getItem(KEY_MASQUE) === 'true') return;
    try {
      const faites = getAllCompletedParties();
      if (Object.keys(faites).length > 0) setVisible(true);
    } catch {
      // localStorage indisponible : on n'insiste pas
    }
  }, [user]);

  if (!visible) return null;

  function masquer() {
    try { localStorage.setItem(KEY_MASQUE, 'true'); } catch {}
    setVisible(false);
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-card)',
      borderLeft: '4px solid var(--brand)',
      borderRadius: 14,
      padding: '14px 16px',
      marginBottom: 18,
    }}>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--text-title)' }}>
        {t('invite_titre')}
      </p>
      <p style={{ margin: '6px 0 12px', fontSize: 13, lineHeight: 1.5, color: 'var(--text-sub)' }}>
        {t('invite_texte')}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Link href="/register" style={{
          display: 'inline-flex', alignItems: 'center', padding: '9px 16px',
          borderRadius: 11, background: 'var(--brand)', color: '#0B1220',
          fontWeight: 800, fontSize: 13, textDecoration: 'none',
        }}>
          {t('invite_creer_compte')}
        </Link>
        <button
          onClick={masquer}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: 'var(--text-sub)', padding: '9px 4px',
          }}>
          {t('avis_plus_tard')}
        </button>
      </div>
    </div>
  );
}
