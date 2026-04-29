export const themeColors = {
  night: {
    // Fonds
    bgPrimary: '#050A18',
    bgSecondary: '#071126',
    cardPrimary: '#101B35',
    cardSecondary: '#172541',

    // Bordures
    borderSubtle: '#263A5E',
    borderActive: '#22D6C7',

    // Textes
    textPrimary: '#F8FAFC',
    textSecondary: '#9FB2D8',
    textDisabled: '#5F6F91',

    // Couleurs d'action
    brand: '#22D6C7',
    brandHover: '#55E6DA',
    btnBlue: '#64B5FF',

    // Couleurs sémantiques (usage strict)
    premium: '#FFC928',      // UNIQUEMENT pour Premium
    examOrange: '#FF8A1E',   // UNIQUEMENT pour examens
    error: '#FF5B4A',        // UNIQUEMENT pour erreurs/dangers
    success: '#32D66B',      // UNIQUEMENT pour réussite
    secondary: '#8B6DFF',    // Avec parcimonie

    // Route
    roadAsphalt: '#2E3443',
    roadEdge: '#7B8496',
    roadMarking: '#E5E7EB',
    roadGlow: 'rgba(34, 214, 199, 0.25)',
  },
  day: {
    // Fonds
    bgPrimary: '#F7FAFC',
    bgSecondary: '#EEF6FA',
    cardPrimary: '#FFFFFF',
    cardSecondary: '#F1F7FB',

    // Bordures
    borderSubtle: '#D9E5EF',
    borderActive: '#13BDB4',

    // Textes
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textDisabled: '#94A3B8',

    // Couleurs d'action
    brand: '#00AFA5',
    brandHover: '#008F88',
    btnBlue: '#2F8CFF',

    // Couleurs sémantiques
    premium: '#FFC928',
    examOrange: '#F97316',
    error: '#EF4444',
    success: '#22C55E',
    secondary: '#7C3AED',

    // Route
    roadAsphalt: '#3A3F4B',
    roadEdge: '#CBD5E1',
    roadMarking: '#F8FAFC',
    roadGlow: 'rgba(0, 175, 165, 0.12)',
  },
};

export const radius = {
  sm: '12px',
  md: '16px',
  lg: '22px',
  xl: '24px',
  pill: '999px',
};

export const shadows = {
  night: {
    soft: 'none',
    medium: '0px 8px 24px rgba(0, 0, 0, 0.3)',
  },
  day: {
    soft: '0px 4px 12px rgba(15, 23, 42, 0.04)',
    medium: '0px 12px 30px rgba(15, 23, 42, 0.08)',
  },
};

export const borders = {
  night: '1px solid rgba(159, 178, 216, 0.14)',
  day: '1px solid #D9E5EF',
};
