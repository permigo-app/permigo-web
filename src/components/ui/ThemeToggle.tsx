'use client';

import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isNight = theme === 'night';

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-wrap relative w-14 h-7 rounded-full flex items-center transition-all"
      style={isNight
        ? { background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)' }
        : { background: 'rgba(255,201,40,0.15)', border: '1px solid rgba(255,201,40,0.40)' }
      }
      aria-label={isNight ? 'Passer en mode jour' : 'Passer en mode nuit'}
      title={isNight ? 'Mode jour' : 'Mode nuit'}
    >
      <div
        className={`
          absolute
          w-6 h-6
          rounded-full
          shadow-md
          transition-transform duration-300
          flex items-center justify-center
          text-xs
          ${isNight ? 'translate-x-0.5' : 'translate-x-7'}
        `}
        style={isNight
          ? { background: '#FFFFFF' }
          : { background: '#FFF3C4', boxShadow: '0 0 8px rgba(255,201,40,0.6)' }
        }
      >
        {isNight ? '🌙' : '☀️'}
      </div>
    </button>
  );
}
