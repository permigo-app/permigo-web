export const COLORS = {
  background: '#0a0e2a',
  card: '#141937',
  cardLight: '#1c2345',
  primary: '#00B894',
  success: '#00B894',
  error: '#FF6B6B',
  warning: '#FDCB6E',
  xp: '#FFD700',
  text: '#FFFFFF',
  textSecondary: '#8B9DC3',
  textMuted: '#5A6B8A',
  border: '#2a3158',
};

export const THEME_COLORS: Record<string, string> = {
  A: '#74B9FF',
  B: '#00CEC9',
  C: '#A29BFE',
  D: '#FDCB6E',
  E: '#FF6348',
  F: '#E17055',
  G: '#00B894',
  H: '#6C5CE7',
  I: '#FD79A8',
};

export const THEME_EMOJIS: Record<string, string> = {
  A: '🛣️',
  B: '🚶',
  C: '🚗',
  D: '⚡',
  E: '🔄',
  F: '🔺',
  G: '🧭',
  H: '🅿️',
  I: '📋',
};

export const THEME_CITIES: Record<string, string> = {
  A: 'Bruxelles',
  B: 'Liège',
  C: 'Anvers',
  D: 'Spa',
  E: 'Gand',
  F: 'Namur',
  G: 'Bruges',
  H: 'Mons',
  I: 'Belgique',
};

export const CITY_NAMES_UPPER: Record<string, string> = {
  A: 'BRUXELLES',
  B: 'LIÈGE',
  C: 'ANVERS',
  D: 'SPA',
  E: 'GAND',
  F: 'NAMUR',
  G: 'BRUGES',
  H: 'MONS',
  I: 'BELGIQUE',
};

export const GASTON_GREETINGS = [
  'Salut champion ! Prêt à conquérir la route ? 🚗',
  'Hey ! Gaston est là pour t\'accompagner ! 🎓',
  'Bienvenue ! On va devenir un as du volant ensemble ! 💪',
  'Coucou ! Encore une journée pour progresser ! 🌟',
  'Allez, c\'est parti ! La route t\'attend ! 🛣️',
];

export const GASTON_CORRECT = [
  'Bravo ! Tu gères ! 🎉',
  'Excellent ! Continue comme ça ! 💪',
  'Parfait ! Tu es sur la bonne voie ! 🌟',
  'Super réponse ! Tu m\'impressionnes ! 🏆',
  'Bien joué ! Un vrai champion ! 🚀',
  'Génial ! Tu vas réussir haut la main ! ✨',
];

export const GASTON_WRONG = [
  'Oups ! Pas grave, on apprend de ses erreurs ! 💪',
  'Raté ! Mais je crois en toi ! 🤗',
  'Pas cette fois ! Mais tu vas y arriver ! 🌟',
  'Aïe ! Retiens bien l\'explication ! 📝',
  'Oh non ! Allez, la prochaine sera la bonne ! 💪',
  'Presque ! Concentre-toi bien ! 🧐',
];

export const PANNEAU_CATEGORIES = [
  { id: 'A', name: 'Danger', emoji: '⚠️', color: '#FF6B6B' },
  { id: 'B', name: 'Priorité', emoji: '🔺', color: '#FF9F43' },
  { id: 'C', name: 'Interdiction', emoji: '⛔', color: '#EE5A24' },
  { id: 'D', name: 'Obligation', emoji: '🔵', color: '#74B9FF' },
  { id: 'E', name: 'Stationnement', emoji: '🅿️', color: '#6C5CE7' },
  { id: 'F', name: 'Information', emoji: 'ℹ️', color: '#00CEC9' },
  { id: 'M', name: 'Additionnels', emoji: '➕', color: '#FDCB6E' },
  { id: 'FEU', name: 'Feux', emoji: '🚦', color: '#FF6348' },
  { id: 'LIGNE', name: 'Marquage au sol', emoji: '〰️', color: '#8B9DC3' },
  { id: 'LT', name: 'Témoins (phares)', emoji: '💡', color: '#F8C291' },
];

export const BADGES = [
  // Progression
  { id: 'first_step', emoji: '🌟', name: 'Premier pas', desc: '1 leçon complétée', category: 'Progression' },
  { id: 'on_fire', emoji: '🔥', name: 'En feu', desc: '5 leçons complétées', category: 'Progression' },
  { id: 'bookworm', emoji: '📖', name: 'Rat de bibliothèque', desc: '15 leçons complétées', category: 'Progression' },
  { id: 'champion', emoji: '🚀', name: 'Champion', desc: '40 leçons complétées', category: 'Progression' },
  // Régularité
  { id: 'habit', emoji: '📅', name: 'Habitude', desc: 'Série de 3 jours', category: 'Régularité' },
  { id: 'devoted', emoji: '🏅', name: 'Dévoué', desc: 'Série de 7 jours', category: 'Régularité' },
  { id: 'legend', emoji: '💎', name: 'Légende', desc: 'Série de 30 jours', category: 'Régularité' },
  // Précision
  { id: 'perfectionist', emoji: '💯', name: 'Perfectionniste', desc: '100% sur une leçon', category: 'Précision' },
  { id: 'sharpshooter', emoji: '🎯', name: 'Tireur d\'élite', desc: '80%+ global (10+ réponses)', category: 'Précision' },
  { id: 'road_king', emoji: '👑', name: 'Roi de la route', desc: '90%+ global (20+ réponses)', category: 'Précision' },
  // Examens
  { id: 'graduate', emoji: '🎓', name: 'Diplômé', desc: 'Réussir l\'examen thème A', category: 'Examens' },
  { id: 'honors', emoji: '🏆', name: 'Mention honorable', desc: '3 examens réussis', category: 'Examens' },
  { id: 'major', emoji: '🥇', name: 'Major', desc: 'Tous les examens réussis', category: 'Examens' },
  // Survie
  { id: 'survivor', emoji: '💀', name: 'Survivant', desc: '10+ en mode survie', category: 'Survie' },
  { id: 'pilot', emoji: '🏎️', name: 'Pilote', desc: '20+ en mode survie', category: 'Survie' },
  { id: 'invincible', emoji: '🛡️', name: 'Invincible', desc: '30+ en mode survie', category: 'Survie' },
  // Exploration
  { id: 'explorer', emoji: '🗺️', name: 'Explorateur', desc: '3 thèmes débloqués', category: 'Exploration' },
  { id: 'unlocker', emoji: '🔓', name: 'Débloqueur', desc: '5 thèmes débloqués', category: 'Exploration' },
  { id: 'traveler', emoji: '🌍', name: 'Voyageur', desc: 'Tous les thèmes débloqués', category: 'Exploration' },
  // XP
  { id: 'level5', emoji: '⚡', name: 'Niveau 5', desc: 'Atteindre le niveau 5', category: 'Niveaux' },
  { id: 'level10', emoji: '💫', name: 'Niveau 10', desc: 'Atteindre le niveau 10', category: 'Niveaux' },
  { id: 'level20', emoji: '🌠', name: 'Niveau 20', desc: 'Atteindre le niveau 20', category: 'Niveaux' },
  // Révision
  { id: 'reviseur', emoji: '🔁', name: 'Réviseur', desc: '50 révisions effectuées', category: 'Révision' },
  { id: 'elephant', emoji: '🧠', name: "Mémoire d'éléphant", desc: '100 questions maîtrisées', category: 'Révision' },
];

export function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}
