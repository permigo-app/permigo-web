'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LanguageContext';

/**
 * Dépôt d'un avis, depuis le profil — donc réservé aux comptes connectés.
 * C'est volontaire : un avis anonyme n'a aucune valeur de preuve, et le
 * formulaire serait noyé sous le spam en une semaine.
 *
 * Rien ne s'affiche sur le site tant que l'avis n'a pas été validé à la main
 * dans Supabase. Le composant le dit clairement à l'utilisateur.
 */
export default function TestimonialForm() {
  const { lang } = useLang();
  const isNL = lang === 'nl';

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'sent' | 'error'>('idle');
  const [published, setPublished] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const T = isNL
    ? {
        title: 'Laat een beoordeling achter',
        sub: 'Je mening helpt anderen om te kiezen.',
        name: 'Je voornaam',
        placeholder: 'Wat vond je van het platform?',
        send: 'Versturen',
        saving: 'Bezig…',
        sent: 'Bedankt! Je beoordeling is goed ontvangen.',
        pending: 'Ze verschijnt op de site zodra we ze hebben nagelezen.',
        live: 'Je beoordeling staat online. Bedankt!',
        already: 'Je kan je beoordeling hieronder aanpassen.',
        errShort: 'Schrijf minstens 10 tekens.',
        errRating: 'Kies een aantal sterren.',
        errName: 'Vul je voornaam in.',
        errGeneric: 'Er ging iets mis. Probeer het later opnieuw.',
      }
    : {
        title: 'Laisse un avis',
        sub: 'Ton retour aide les autres à se décider.',
        name: 'Ton prénom',
        placeholder: 'Qu\'as-tu pensé de la plateforme ?',
        send: 'Envoyer',
        saving: 'Envoi…',
        sent: 'Merci ! Ton avis est bien enregistré.',
        pending: 'Il apparaîtra sur le site une fois relu.',
        live: 'Ton avis est en ligne. Merci !',
        already: 'Tu peux modifier ton avis ci-dessous.',
        errShort: 'Écris au moins 10 caractères.',
        errRating: 'Choisis un nombre d\'étoiles.',
        errName: 'Indique ton prénom.',
        errGeneric: 'Une erreur est survenue. Réessaie plus tard.',
      };

  const token = useCallback(async () => {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }, []);

  // Pré-remplit si l'utilisateur a déjà laissé un avis
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const t = await token();
      if (!t) return;
      try {
        const res = await fetch('/api/testimonials', { method: 'PATCH', headers: { Authorization: `Bearer ${t}` } });
        if (!res.ok) return;
        const { mine } = await res.json();
        if (cancelled || !mine) return;
        setRating(mine.rating ?? 0);
        setComment(mine.comment ?? '');
        setName(mine.display_name ?? '');
        setPublished(!!mine.publie);
        setState('sent');
      } catch { /* silencieux : le formulaire reste vierge */ }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const submit = async () => {
    setErrorMsg('');
    if (rating < 1) { setErrorMsg(T.errRating); return; }
    if (!name.trim()) { setErrorMsg(T.errName); return; }
    if (comment.trim().length < 10) { setErrorMsg(T.errShort); return; }

    setState('saving');
    const t = await token();
    if (!t) { setState('error'); setErrorMsg(T.errGeneric); return; }

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ rating, comment: comment.trim(), displayName: name.trim() }),
      });
      if (!res.ok) throw new Error();
      setState('sent');
    } catch {
      setState('error');
      setErrorMsg(T.errGeneric);
    }
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
      <h3 className="text-sm font-black mb-1" style={{ color: 'var(--text-title)' }}>{T.title}</h3>
      <p className="text-xs mb-4" style={{ color: 'var(--text-sub)' }}>{T.sub}</p>

      {/* Étoiles */}
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n}/5`}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 2,
              fontSize: 26, lineHeight: 1,
              color: n <= (hover || rating) ? '#FFC928' : 'var(--border-card)',
              transition: 'color 120ms',
            }}
          >
            ★
          </button>
        ))}
      </div>

      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder={T.name}
        maxLength={40}
        className="w-full rounded-xl px-3 py-2.5 mb-3 text-sm"
        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-card)', color: 'var(--text-title)' }}
      />

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder={T.placeholder}
        rows={3}
        maxLength={500}
        className="w-full rounded-xl px-3 py-2.5 text-sm resize-none"
        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-card)', color: 'var(--text-title)' }}
      />
      <p className="text-[11px] mt-1 mb-3 text-right" style={{ color: 'var(--text-hint)' }}>{comment.length}/500</p>

      {errorMsg && (
        <p className="text-xs mb-3" style={{ color: '#e74c3c' }}>{errorMsg}</p>
      )}

      {state === 'sent' ? (
        <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(46,204,113,0.10)', border: '1px solid rgba(46,204,113,0.35)' }}>
          <p className="text-xs font-bold" style={{ color: '#2ecc71' }}>
            {published ? T.live : T.sent}
          </p>
          {!published && (
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-sub)' }}>{T.pending}</p>
          )}
          <button
            onClick={() => setState('idle')}
            className="text-[11px] font-bold mt-2 press-scale"
            style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', padding: 0 }}
          >
            {T.already}
          </button>
        </div>
      ) : (
        <button
          onClick={submit}
          disabled={state === 'saving'}
          className="w-full py-3 rounded-xl font-black text-sm press-scale"
          style={{ background: 'var(--brand)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer' }}
        >
          {state === 'saving' ? T.saving : T.send}
        </button>
      )}
    </div>
  );
}
