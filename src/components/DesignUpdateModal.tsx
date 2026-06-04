'use client';

import { useState, useEffect } from 'react';
import { supabase, hasSupabase } from '@/lib/supabase';

interface Props {
  userId: string | undefined;
}

export default function DesignUpdateModal({ userId }: Props) {
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
        <h2 className="modal-title">Nouveau design MyPermiGo</h2>
        <p className="modal-text">
          Nous avons mis à jour l&apos;interface pour la rendre plus claire et plus professionnelle.
        </p>
        <div className="modal-checks">
          <p>✅ Votre progression est intacte</p>
          <p>✅ Vos scores sont sauvegardés</p>
          <p>✅ Vos badges sont conservés</p>
          <p>✅ Vos révisions sont préservées</p>
        </div>
        <p className="modal-sub">Bonne continuation sur MyPermiGo !</p>
        <button className="modal-btn" onClick={handleClose}>
          Continuer →
        </button>
      </div>
    </div>
  );
}
