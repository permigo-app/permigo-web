'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Chargement lazy du modal pour ne pas alourdir le bundle initial
const FeedbackModal = dynamic(() => import('./FeedbackModal'), { ssr: false });

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/*
       * Positionnement :
       * - Mobile : bottom-20 (80px) pour rester au-dessus de la home bar iOS
       *   et ne pas chevaucher le footer / Gaston central
       * - Desktop (< xl) : bottom-8 right-6 — pas de sidebar droite
       * - Desktop xl+ : right-[520px] car la sidebar droite fait 500px de large
       *   Le z-index 40 est inférieur à la sidebar (z-50) : pas de chevauchement
       */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Donner un feedback"
        title="Donner un feedback"
        className="feedback-fab press-scale"
        style={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00B894, #00a884)',
          boxShadow: '0 4px 18px rgba(0,184,148,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          border: 'none',
          cursor: 'pointer',
          zIndex: 40,
          // Responsive via CSS custom — on surcharge via className below
        }}
      >
        💬
      </button>

      {/* Overrides responsive via style tag inline — évite d'ajouter une classe Tailwind arbitraire */}
      <style>{`
        @media (min-width: 1024px) {
          .feedback-fab {
            bottom: 32px !important;
            right: 24px !important;
            width: 58px !important;
            height: 58px !important;
          }
        }
        @media (min-width: 1280px) {
          /* xl+ : sidebar droite (500px) présente — décaler le bouton à gauche */
          .feedback-fab {
            right: 520px !important;
            bottom: 32px !important;
          }
        }
      `}</style>

      {open && <FeedbackModal onClose={() => setOpen(false)} />}
    </>
  );
}
