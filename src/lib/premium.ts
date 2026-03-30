'use client';

const KEY_PREMIUM = 'isPremium';

export function isPremium(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEY_PREMIUM) === 'true';
}

export function setPremium(value: boolean): void {
  if (typeof window === 'undefined') return;
  if (value) {
    localStorage.setItem(KEY_PREMIUM, 'true');
  } else {
    localStorage.removeItem(KEY_PREMIUM);
  }
}

/** Theme A is always free. Themes B-I require premium. */
export function isThemeFree(themeCode: string): boolean {
  return themeCode === 'A';
}
