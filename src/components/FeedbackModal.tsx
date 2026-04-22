'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';

type Category = 'bug' | 'suggestion' | 'other';

const CATEGORIES_DATA: Record<'fr' | 'nl', { id: Category; label: string; emoji: string; placeholder: string }[]> = {
  fr: [
    { id: 'bug',        label: 'Bug',        emoji: '🐛', placeholder: 'Décris le bug rencontré : où, quand, sur quelle page...' },
    { id: 'suggestion', label: 'Suggestion', emoji: '💡', placeholder: "Quelle serait ton idée pour améliorer l'app ?" },
    { id: 'other',      label: 'Autre',      emoji: '💬', placeholder: 'Dis-nous ce que tu en penses !' },
  ],
  nl: [
    { id: 'bug',        label: 'Bug',        emoji: '🐛', placeholder: 'Beschrijf de bug: waar, wanneer, op welke pagina...' },
    { id: 'suggestion', label: 'Suggestie',  emoji: '💡', placeholder: 'Wat is jouw idee om de app te verbeteren?' },
    { id: 'other',      label: 'Andere',     emoji: '💬', placeholder: 'Vertel ons wat je ervan vindt!' },
  ],
};

const UI: Record<'fr' | 'nl', {
  header: string; sub: string;
  rateLimitErr: string; tooShortErr: string; repetitiveErr: string; techErr: string;
  successTitle: string; successBody: string;
  emailLabel: string; emailPlaceholder: string;
  cancel: string; send: string; sending: string;
}> = {
  fr: {
    header: 'Un retour à partager ? 💬',
    sub: 'On lit tout, promis !',
    rateLimitErr: 'Tu as déjà envoyé un message récemment, patiente quelques secondes 🙂',
    tooShortErr: 'Ton message doit faire au moins 10 caractères',
    repetitiveErr: 'Ton message semble invalide. Essaie un vrai texte 😊',
    techErr: 'Oups, problème technique. Réessaie dans un instant.',
    successTitle: 'Merci !',
    successBody: 'Ton retour nous aide à améliorer MyPermiGo 🙏',
    emailLabel: "Ton email (optionnel, pour qu'on puisse te répondre)",
    emailPlaceholder: 'email@exemple.be',
    cancel: 'Annuler',
    send: 'Envoyer →',
    sending: 'Envoi...',
  },
  nl: {
    header: 'Een reactie om te delen? 💬',
    sub: 'We lezen alles, beloofd!',
    rateLimitErr: 'Je hebt recentelijk al een bericht gestuurd, wacht even 🙂',
    tooShortErr: 'Je bericht moet minstens 10 tekens bevatten',
    repetitiveErr: 'Je bericht lijkt ongeldig. Probeer een echte tekst 😊',
    techErr: 'Oeps, technisch probleem. Probeer het zo opnieuw.',
    successTitle: 'Bedankt!',
    successBody: 'Je reactie helpt ons MyPermiGo te verbeteren 🙏',
    emailLabel: 'Je e-mail (optioneel, zodat we kunnen antwoorden)',
    emailPlaceholder: 'email@voorbeeld.be',
    cancel: 'Annuleren',
    send: 'Versturen →',
    sending: 'Verzenden...',
  },
};

function charColor(count: number): string {
  if (count > 1900) return '#FF6B6B';
  if (count > 1500) return '#FDCB6E';
  return '#00B894';
}

export default function FeedbackModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { lang } = useLang();
  const ui = UI[lang];
  const CATEGORIES = CATEGORIES_DATA[lang];

  const [category, setCategory] = useState<Category>('suggestion');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fermer au clic sur Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Focus textarea à l'ouverture
  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  const placeholder = CATEGORIES.find(c => c.id === category)?.placeholder ?? '';
  const charCount = message.length;
  const canSubmit = message.trim().length >= 10 && !loading && !success;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message: message.trim(),
          email: email.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError(ui.rateLimitErr);
        } else if (data.error === 'message_too_short') {
          setError(ui.tooShortErr);
        } else if (data.error === 'message_repetitive') {
          setError(ui.repetitiveErr);
        } else {
          setError(ui.techErr);
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => onClose(), 2200);
    } catch {
      setError(ui.techErr);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[500px] rounded-2xl slide-up"
        style={{
          background: '#0F1923',
          border: '1px solid rgba(255,255,255,0.08)',
          maxHeight: '90dvh',
          overflowY: 'auto',
          padding: '24px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {success ? (
          <SuccessView ui={ui} />
        ) : (
          <FormView
            category={category}
            setCategory={setCategory}
            message={message}
            setMessage={setMessage}
            email={email}
            setEmail={setEmail}
            placeholder={placeholder}
            charCount={charCount}
            canSubmit={canSubmit}
            loading={loading}
            error={error}
            textareaRef={textareaRef}
            onSubmit={handleSubmit}
            onClose={onClose}
            categories={CATEGORIES}
            ui={ui}
          />
        )}
      </div>
    </div>
  );
}

// ── Vue succès ────────────────────────────────────────────────────────────────
function SuccessView({ ui }: { ui: typeof UI['fr'] }) {
  return (
    <div className="text-center py-6 fade-in-up">
      <div className="text-6xl mb-4" style={{ animation: 'starPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards' }}>
        ✅
      </div>
      <h2 className="text-xl font-black mb-2" style={{ color: '#00B894' }}>
        {ui.successTitle}
      </h2>
      <p className="text-sm" style={{ color: '#8B9DC3', lineHeight: 1.6 }}>
        {ui.successBody}
      </p>
    </div>
  );
}

// ── Formulaire ────────────────────────────────────────────────────────────────
interface FormViewProps {
  category: Category;
  setCategory: (c: Category) => void;
  message: string;
  setMessage: (m: string) => void;
  email: string;
  setEmail: (e: string) => void;
  placeholder: string;
  charCount: number;
  canSubmit: boolean;
  loading: boolean;
  error: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onSubmit: () => void;
  onClose: () => void;
  categories: typeof CATEGORIES_DATA['fr'];
  ui: typeof UI['fr'];
}

function FormView({
  category, setCategory, message, setMessage,
  email, setEmail, placeholder, charCount,
  canSubmit, loading, error, textareaRef,
  onSubmit, onClose, categories, ui,
}: FormViewProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-lg font-black" style={{ color: '#FFFFFF' }}>
            {ui.header}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: '#5A6B8A' }}>
            {ui.sub}
          </p>
        </div>
        <button
          onClick={onClose}
          className="press-scale"
          style={{ color: '#5A6B8A', fontSize: 20, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
          aria-label="Fermer"
        >
          ×
        </button>
      </div>

      {/* Sélecteur de catégorie */}
      <div className="flex gap-2 mb-4">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className="flex-1 py-2 rounded-xl text-xs font-bold press-scale transition-all"
            style={{
              background: category === cat.id ? 'rgba(0,184,148,0.18)' : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${category === cat.id ? '#00B894' : 'rgba(255,255,255,0.08)'}`,
              color: category === cat.id ? '#00B894' : '#8B9DC3',
            }}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="mb-3 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={e => setMessage(e.target.value.slice(0, 2000))}
          placeholder={placeholder}
          rows={5}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.04)',
            border: '1.5px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '12px 14px',
            color: '#FFFFFF',
            fontSize: 14,
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'Nunito, system-ui, sans-serif',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#00B894'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        />
        {/* Compteur de caractères */}
        <span
          className="absolute bottom-3 right-3 text-[11px] font-bold"
          style={{ color: charColor(charCount) }}
        >
          {charCount}/2000
        </span>
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-xs mb-1.5" style={{ color: '#5A6B8A' }}>
          {ui.emailLabel}
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={ui.emailPlaceholder}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.04)',
            border: '1.5px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '10px 14px',
            color: '#FFFFFF',
            fontSize: 13,
            outline: 'none',
            fontFamily: 'Nunito, system-ui, sans-serif',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#00B894'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        />
      </div>

      {/* Erreur */}
      {error && (
        <p className="text-xs mb-3 px-3 py-2 rounded-lg" style={{ color: '#FF6B6B', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)' }}>
          {error}
        </p>
      )}

      {/* Boutons */}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-2xl text-sm font-bold press-scale"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#8B9DC3' }}
        >
          {ui.cancel}
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex-[2] py-3 rounded-2xl text-sm font-black press-scale btn-glow-green"
          style={{
            background: canSubmit
              ? 'linear-gradient(135deg, #00B894, #00a884)'
              : 'rgba(255,255,255,0.08)',
            color: canSubmit ? '#FFFFFF' : '#5A6B8A',
            border: 'none',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s ease',
          }}
        >
          {loading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ animation: 'carBounce 0.6s ease-in-out infinite', display: 'inline-block' }}>⏳</span>
              {ui.sending}
            </span>
          ) : ui.send}
        </button>
      </div>
    </>
  );
}
