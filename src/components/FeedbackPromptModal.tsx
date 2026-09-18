'use client';

import { useState, useEffect } from 'react';
import { supabase, hasSupabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LanguageContext';

interface Props {
  userId: string | undefined;
}

const FEEDBACK_EMAIL = 'ycroitor8096@gmail.com';

export default function FeedbackPromptModal({ userId }: Props) {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!userId || !hasSupabase || !supabase) return;
    supabase
      .from('profiles')
      .select('feedback_prompt_seen')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data && data.feedback_prompt_seen === false) {
          setVisible(true);
        }
      });
  }, [userId]);

  async function markSeen() {
    if (!supabase || !userId) return;
    await supabase
      .from('profiles')
      .update({ feedback_prompt_seen: true })
      .eq('id', userId);
  }

  function handleClose() {
    markSeen();
    setVisible(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(FEEDBACK_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard indisponible — l'adresse reste affichée à l'écran
    }
    markSeen();
  }

  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">💌</div>
        <h2 className="modal-title">{t('avis_titre')}</h2>
        <p className="modal-text">{t('avis_texte')}</p>
        <p className="modal-sub">{t('avis_merci')}</p>
        <a
          className="modal-btn"
          href={`mailto:${FEEDBACK_EMAIL}?subject=Avis%20sur%20MyPermiGo`}
          onClick={handleClose}
          style={{ display: 'block', boxSizing: 'border-box', textDecoration: 'none', textAlign: 'center' }}
        >
          {t('avis_envoyer')}
        </a>
        <p className="modal-sub" style={{ marginTop: 12, marginBottom: 6 }}>
          {t('avis_pas_messagerie')}
        </p>
        <button
          className="modal-btn"
          style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-sub)' }}
          onClick={handleCopy}
        >
          {copied ? t('avis_copie').replace('{m}', FEEDBACK_EMAIL) : t('avis_copier').replace('{m}', FEEDBACK_EMAIL)}
        </button>
        <button
          className="modal-btn"
          style={{ background: 'transparent', color: 'var(--text-sub)', marginTop: 8 }}
          onClick={handleClose}
        >
          {t('avis_plus_tard')}
        </button>
      </div>
    </div>
  );
}
