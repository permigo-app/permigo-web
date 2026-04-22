'use client';

/**
 * RewardOverlay — monté dans AppShell, persistant entre les navigations.
 *
 * Écoute les CustomEvents :
 *   - 'permigo_levelup'  { detail: { prevLevel, newLevel, delay? } }
 *   - 'permigo_badges'   { detail: { badgeIds: string[], delay? } }
 *
 * Affiche les animations dans l'ordre : Level Up → Badges (un par un).
 *
 * Mode debug (DEV only) — fonctions console :
 *   window.testLevelUp(n)       — simule arrivée au niveau n
 *   window.testBadgeUnlock(id)  — simule déblocage d'un badge
 *   window.testFirstBadge()     — simule le tout premier badge (first_step)
 *   window.resetSeenBadges()    — efface tous les badge_seen_* du localStorage
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import LevelUpCelebration from './LevelUpCelebration';
import BadgeUnlockModal from './BadgeUnlockModal';

interface LevelUpItem  { prevLevel: number; newLevel: number; }
interface BadgeItem    { badgeId: string; isFirst: boolean; }
type QueueItem =
  | { type: 'levelup'; data: LevelUpItem }
  | { type: 'badge';   data: BadgeItem };

export default function RewardOverlay() {
  const [queue,   setQueue]   = useState<QueueItem[]>([]);
  const [current, setCurrent] = useState<QueueItem | null>(null);
  const processingRef         = useRef(false);

  // ── Avance dans la file ───────────────────────────────────────
  const advance = useCallback(() => {
    processingRef.current = false;
    setCurrent(null);
    setQueue(q => {
      if (q.length === 0) return q;
      const [next, ...rest] = q;
      // Petit délai entre deux modals
      setTimeout(() => {
        setCurrent(next);
        processingRef.current = true;
      }, 500);
      return rest;
    });
  }, []);

  // Déclenche le premier élément de la file quand elle passe de 0 à >0
  useEffect(() => {
    if (queue.length > 0 && !current && !processingRef.current) {
      const [next, ...rest] = queue;
      setQueue(rest);
      setCurrent(next);
      processingRef.current = true;
    }
  }, [queue, current]);

  // ── Utilitaire : ajouter dans la file après un délai ─────────
  const enqueue = useCallback((item: QueueItem, delay: number) => {
    setTimeout(() => {
      setQueue(q => [...q, item]);
    }, delay);
  }, []);

  // ── Comptage des badges "vus" pour détection premier badge ────
  const countSeenBadges = () =>
    typeof window !== 'undefined'
      ? Object.keys(localStorage).filter(k => k.startsWith('badge_seen_')).length
      : 0;

  const markBadgeSeen = (id: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`badge_seen_${id}`, '1');
    }
  };

  const isBadgeSeen = (id: string) =>
    typeof window !== 'undefined' && localStorage.getItem(`badge_seen_${id}`) === '1';

  // ── Listeners CustomEvent ────────────────────────────────────
  useEffect(() => {
    const onLevelUp = (e: Event) => {
      const { prevLevel, newLevel, delay = 1200 } = (e as CustomEvent).detail;
      enqueue({ type: 'levelup', data: { prevLevel, newLevel } }, delay);
    };

    const onBadges = (e: Event) => {
      const { badgeIds, delay = 1400 } = (e as CustomEvent).detail as { badgeIds: string[]; delay?: number };
      let extraDelay = delay;
      for (const id of badgeIds) {
        if (isBadgeSeen(id)) continue;
        const seenBefore = countSeenBadges();
        const isFirst    = seenBefore === 0;
        markBadgeSeen(id);
        enqueue({ type: 'badge', data: { badgeId: id, isFirst } }, extraDelay);
        extraDelay += 200; // badges multiples légèrement décalés dans la file
      }
    };

    window.addEventListener('permigo_levelup', onLevelUp);
    window.addEventListener('permigo_badges',  onBadges);
    return () => {
      window.removeEventListener('permigo_levelup', onLevelUp);
      window.removeEventListener('permigo_badges',  onBadges);
    };
  }, [enqueue]);

  // ── Fonctions de debug (dev uniquement) ──────────────────────
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;

    w.testLevelUp = (level: number) => {
      window.dispatchEvent(new CustomEvent('permigo_levelup', {
        detail: { prevLevel: Math.max(1, level - 1), newLevel: level, delay: 100 },
      }));
      console.info(`[debug] testLevelUp(${level})`);
    };

    w.testBadgeUnlock = (id: string) => {
      window.dispatchEvent(new CustomEvent('permigo_badges', {
        detail: { badgeIds: [id], delay: 100 },
      }));
      console.info(`[debug] testBadgeUnlock('${id}')`);
    };

    w.testFirstBadge = () => {
      localStorage.removeItem('badge_seen_first_step');
      // Effacer TOUS les badge_seen pour simuler le premier badge
      Object.keys(localStorage).filter(k => k.startsWith('badge_seen_')).forEach(k => localStorage.removeItem(k));
      window.dispatchEvent(new CustomEvent('permigo_badges', {
        detail: { badgeIds: ['first_step'], delay: 100 },
      }));
      console.info('[debug] testFirstBadge()');
    };

    w.resetSeenBadges = () => {
      Object.keys(localStorage).filter(k => k.startsWith('badge_seen_')).forEach(k => localStorage.removeItem(k));
      console.info('[debug] resetSeenBadges() — tous les badge_seen_* effacés');
    };

    console.info(
      '%c[RewardOverlay] Debug activé\n' +
      'window.testLevelUp(n)\n' +
      'window.testBadgeUnlock(id)\n' +
      'window.testFirstBadge()\n' +
      'window.resetSeenBadges()',
      'color: #4ecdc4; font-weight: bold;'
    );

    return () => {
      delete w.testLevelUp;
      delete w.testBadgeUnlock;
      delete w.testFirstBadge;
      delete w.resetSeenBadges;
    };
  }, []);

  // ── Rendu ─────────────────────────────────────────────────────
  if (!current) return null;

  if (current.type === 'levelup') {
    return (
      <LevelUpCelebration
        prevLevel={current.data.prevLevel}
        newLevel={current.data.newLevel}
        onClose={advance}
      />
    );
  }

  return (
    <BadgeUnlockModal
      badgeId={current.data.badgeId}
      isFirst={current.data.isFirst}
      onClose={advance}
    />
  );
}
