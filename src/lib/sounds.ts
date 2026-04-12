import { Howl } from 'howler';

// Lazy-init: only created client-side (Howler requires window)
let _sounds: {
  correct: Howl;
  wrong: Howl;
  levelup: Howl;
  streak: Howl;
} | null = null;

function getSounds() {
  if (typeof window === 'undefined') return null;
  if (!_sounds) {
    _sounds = {
      correct: new Howl({ src: ['/sounds/correct.wav'], volume: 0.6 }),
      wrong:   new Howl({ src: ['/sounds/wrong.wav'],   volume: 0.5 }),
      levelup: new Howl({ src: ['/sounds/levelup.wav'], volume: 0.7 }),
      streak:  new Howl({ src: ['/sounds/streak.wav'],  volume: 0.6 }),
    };
  }
  return _sounds;
}

export function playSound(name: 'correct' | 'wrong' | 'levelup' | 'streak') {
  if (typeof window === 'undefined') return;
  const muted = localStorage.getItem('sound_muted') === 'true';
  if (muted) return;
  const s = getSounds();
  if (s) s[name].play();
}

export function isSoundMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('sound_muted') === 'true';
}

export function toggleMute(): boolean {
  const next = !isSoundMuted();
  localStorage.setItem('sound_muted', next ? 'true' : 'false');
  return next;
}
