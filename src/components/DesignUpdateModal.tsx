'use client';

import { useState, useEffect } from 'react';
import { supabase, hasSupabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LanguageContext';

interface Props {
  userId: string | undefined;
}

export default function DesignUpdateModal({ userId }: Props) {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!userId || !hasSupabase || !supabase) return;
    supabase
      .from('profiles')
      .select('design_update_seen')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data && data.design_update_seen === false) {
          setVisible(true);
        }
      });
  }, [userId]);

  async function handleClose() {
    if (!supabase || !userId) return;
    await supabase
      .from('profiles')
      .update({ design_update_seen: true })
      .eq('id', userId);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">🎨</div>
        <h2 className="modal-title">{t('design_titre')}</h2>
        <p className="modal-text">
          {t('design_intro')}
        </p>
        <div className="modal-checks">
          <p>{t('design_progression_intacte')}</p>
          <p>{t('design_scores_sauvegardes')}</p>
          <p>{t('design_badges_conserves')}</p>
          <p>{t('design_revisions_preservees')}</p>
        </div>
        <p className="modal-sub">{t('design_bonne_continuation')}</p>
        <button className="modal-btn" onClick={handleClose}>
          {t('design_continuer')}
        </button>
      </div>
    </div>
  );
}
