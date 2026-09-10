'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LanguageContext';

/**
 * Page d'arrivée du lien « mot de passe oublié ».
 *
 * Elle manquait : l'e-mail de réinitialisation partait bien, mais le lien
 * renvoyait sur une page qui n'en faisait rien — l'utilisateur ne pouvait
 * donc jamais choisir un nouveau mot de passe.
 *
 * Supabase place le jeton de récupération dans le fragment de l'URL et le
 * client l'échange tout seul (detectSessionInUrl). On attend l'événement
 * PASSWORD_RECOVERY, ou une session déjà ouverte si l'échange a eu lieu
 * avant le montage du composant.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const { lang } = useLang();
  const isNL = lang === 'nl';

  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const T = isNL
    ? {
        title: 'Nieuw wachtwoord',
        sub: 'Kies een nieuw wachtwoord voor je account.',
        pwd: 'Nieuw wachtwoord (min. 6 tekens)',
        pwd2: 'Bevestig het wachtwoord',
        save: 'Wachtwoord opslaan',
        saving: 'Bezig…',
        okTitle: 'Wachtwoord gewijzigd',
        okSub: 'Je kan je nu aanmelden met je nieuwe wachtwoord.',
        toLogin: 'Naar het inloggen',
        expiredTitle: 'Link verlopen of ongeldig',
        expiredSub: 'Vraag een nieuwe resetlink aan vanaf de inlogpagina. De link is één uur geldig en werkt maar één keer.',
        errShort: 'Minstens 6 tekens.',
        errMatch: 'De wachtwoorden komen niet overeen.',
        errGeneric: 'Er ging iets mis. Vraag een nieuwe link aan.',
        checking: 'Even geduld…',
      }
    : {
        title: 'Nouveau mot de passe',
        sub: 'Choisis un nouveau mot de passe pour ton compte.',
        pwd: 'Nouveau mot de passe (min. 6 caractères)',
        pwd2: 'Confirme le mot de passe',
        save: 'Enregistrer le mot de passe',
        saving: 'Enregistrement…',
        okTitle: 'Mot de passe modifié',
        okSub: 'Tu peux maintenant te connecter avec ton nouveau mot de passe.',
        toLogin: 'Aller à la connexion',
        expiredTitle: 'Lien expiré ou invalide',
        expiredSub: 'Demande un nouveau lien depuis la page de connexion. Le lien est valable une heure et ne fonctionne qu\'une seule fois.',
        errShort: 'Au moins 6 caractères.',
        errMatch: 'Les mots de passe ne correspondent pas.',
        errGeneric: 'Une erreur est survenue. Demande un nouveau lien.',
        checking: 'Un instant…',
      };

  useEffect(() => {
    if (!supabase) { setChecking(false); return; }

    // Le jeton peut déjà avoir été échangé avant le montage
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setReady(true); setChecking(false); }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setReady(true);
        setChecking(false);
      }
    });

    // Au-delà de 3 secondes sans session, le lien est mort
    const t = setTimeout(() => setChecking(false), 3000);
    return () => { sub.subscription.unsubscribe(); clearTimeout(t); };
  }, []);

  const submit = async () => {
    setError('');
    if (pwd.length < 6) { setError(T.errShort); return; }
    if (pwd !== pwd2) { setError(T.errMatch); return; }
    if (!supabase) { setError(T.errGeneric); return; }

    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password: pwd });
    setBusy(false);
    if (err) { setError(T.errGeneric); return; }
    setDone(true);
  };

  const card: React.CSSProperties = {
    maxWidth: 400, width: '100%', background: 'var(--bg-card)',
    border: '1px solid var(--border-card)', borderRadius: 22, padding: '30px 26px',
  };
  const input: React.CSSProperties = {
    width: '100%', padding: '13px 14px', borderRadius: 12, fontSize: 15,
    background: 'var(--bg-input)', border: '1px solid var(--border-card)',
    color: 'var(--text-title)', marginBottom: 12,
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', background: 'linear-gradient(160deg, #0E1525 0%, #07080F 100%)',
      fontFamily: 'Sora, sans-serif',
    }}>
      <div style={card}>
        {checking ? (
          <p style={{ margin: 0, textAlign: 'center', color: 'var(--text-sub)', fontSize: 14 }}>{T.checking}</p>
        ) : done ? (
          <>
            <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>✅</div>
            <h1 style={{ margin: '0 0 8px', fontSize: 21, fontWeight: 900, textAlign: 'center', color: 'var(--text-title)' }}>{T.okTitle}</h1>
            <p style={{ margin: '0 0 22px', fontSize: 14, textAlign: 'center', color: 'var(--text-sub)', lineHeight: 1.6 }}>{T.okSub}</p>
            <button
              onClick={() => router.push('/login')}
              style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#22D6C7,#1AB8AB)', color: '#07080F', fontWeight: 800, fontSize: 15 }}
            >
              {T.toLogin}
            </button>
          </>
        ) : !ready ? (
          <>
            <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>⏳</div>
            <h1 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 900, textAlign: 'center', color: 'var(--text-title)' }}>{T.expiredTitle}</h1>
            <p style={{ margin: '0 0 22px', fontSize: 14, textAlign: 'center', color: 'var(--text-sub)', lineHeight: 1.6 }}>{T.expiredSub}</p>
            <Link href="/login" style={{ display: 'block', textAlign: 'center', padding: 14, borderRadius: 12,
              background: 'var(--bg-input)', color: 'var(--text-title)', fontWeight: 700, fontSize: 14.5, textDecoration: 'none' }}>
              {T.toLogin}
            </Link>
          </>
        ) : (
          <>
            <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: 'var(--text-title)' }}>{T.title}</h1>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.6 }}>{T.sub}</p>

            <input
              type={show ? 'text' : 'password'}
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              placeholder={T.pwd}
              style={input}
            />
            <input
              type={show ? 'text' : 'password'}
              value={pwd2}
              onChange={e => setPwd2(e.target.value)}
              placeholder={T.pwd2}
              onKeyDown={e => { if (e.key === 'Enter') submit(); }}
              style={input}
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-sub)', marginBottom: 16, cursor: 'pointer' }}>
              <input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} />
              {isNL ? 'Wachtwoord tonen' : 'Afficher le mot de passe'}
            </label>

            {error && <p style={{ margin: '0 0 12px', fontSize: 13, color: '#e74c3c' }}>{error}</p>}

            <button
              onClick={submit}
              disabled={busy}
              style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#22D6C7,#1AB8AB)', color: '#07080F', fontWeight: 800, fontSize: 15 }}
            >
              {busy ? T.saving : T.save}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
