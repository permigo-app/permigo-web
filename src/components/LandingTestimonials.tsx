'use client';

import { useEffect, useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';

interface Testimonial {
  display_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const INK = '#0B1220';
const BRAND_DEEP = '#12A093';
const STAR = '#F5A524';

/**
 * Témoignages réels, validés un par un dans Supabase.
 *
 * Deux règles tenues volontairement :
 *  - la section DISPARAÎT tant qu'il n'y a rien à montrer. Pas de faux avis,
 *    pas de contenu d'exemple qui traînerait jusqu'en production.
 *  - on n'affiche AUCUNE moyenne globale. Ce sont des témoignages choisis,
 *    pas une note agrégée : afficher « 4,9/5 » calculé sur une sélection
 *    d'avis positifs serait une note fausse, et c'est interdit en Belgique.
 */
export default function LandingTestimonials() {
  const { lang } = useLang();
  const isNL = lang === 'nl';
  const [items, setItems] = useState<Testimonial[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/testimonials')
      .then(r => r.json())
      .then(d => { if (!cancelled) setItems(d.testimonials ?? []); })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, []);

  // Rien à montrer → la section n'existe pas.
  if (!items || items.length === 0) return null;

  const T = isNL
    ? { kicker: 'Zij hebben het gebruikt', title: 'Wat de leerlingen zeggen' }
    : { kicker: 'Ils l\'ont utilisé', title: 'Ce que disent les élèves' };

  return (
    <section style={{ padding: 'clamp(56px,8vw,88px) 20px', background: '#FFFFFF' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, letterSpacing: '2.4px', textTransform: 'uppercase', color: BRAND_DEEP }}>
            {T.kicker}
          </p>
          <h2 style={{ margin: 0, fontSize: 'clamp(25px,4.6vw,38px)', fontWeight: 900, letterSpacing: '-1px', color: INK }}>
            {T.title}
          </h2>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
          {items.map((it, i) => (
            <figure
              key={i}
              style={{
                margin: 0, background: '#F9FBFC', borderRadius: 18, padding: '22px 22px 20px',
                border: '1px solid rgba(11,18,32,0.08)', display: 'flex', flexDirection: 'column', gap: 12,
              }}
            >
              <div aria-label={`${it.rating}/5`} style={{ display: 'flex', gap: 2, fontSize: 15, lineHeight: 1 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <span key={n} style={{ color: n <= it.rating ? STAR : 'rgba(11,18,32,0.15)' }}>★</span>
                ))}
              </div>

              <blockquote style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'rgba(11,18,32,0.72)' }}>
                {it.comment}
              </blockquote>

              <figcaption style={{ marginTop: 'auto', fontSize: 12.5, fontWeight: 800, color: INK }}>
                {it.display_name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
