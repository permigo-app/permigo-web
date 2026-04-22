/**
 * Helpers to dispatch reward events (level-up, badge unlock).
 * RewardOverlay in AppShell listens for these globally.
 */

export function dispatchLevelUp(prevLevel: number, newLevel: number, delay = 1200) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('permigo_levelup', { detail: { prevLevel, newLevel, delay } })
  );
}

export function dispatchBadges(badgeIds: string[], delay = 1400) {
  if (typeof window === 'undefined') return;
  if (badgeIds.length === 0) return;
  window.dispatchEvent(
    new CustomEvent('permigo_badges', { detail: { badgeIds, delay } })
  );
}
