'use client';

import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isNight = theme === 'night';

  return (
    <button
      onClick={toggleTheme}
      className="
        relative
        w-14 h-7
        rounded-full
        bg-white/10
        border border-white/20
        flex items-center
        transition-colors
        hover:bg-white/20
      "
      aria-label={isNight ? 'Passer en mode jour' : 'Passer en mode nuit'}
      title={isNight ? 'Mode jour' : 'Mode nuit'}
    >
      <div
        className={`
          absolute
          w-6 h-6
          rounded-full
          bg-white
          shadow-md
          transition-transform duration-300
          flex items-center justify-center
          text-xs
          ${isNight ? 'translate-x-0.5' : 'translate-x-7'}
        `}
      >
        {isNight ? '🌙' : '☀️'}
      </div>
    </button>
  );
}
