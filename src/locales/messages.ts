/**
 * Language-dependent message arrays (Gaston tips, feedback, etc.)
 * Used by pages that need arrays of messages rather than single strings.
 */
type Lang = 'fr' | 'nl';

export const GASTON_GREETINGS: Record<Lang, string[]> = {
  fr: [
    'Salut champion ! Prêt à conquérir la route ? 🚗',
    'Hey ! Gaston est là pour t\'accompagner ! 🎓',
    'Bienvenue ! On va devenir un as du volant ensemble ! 💪',
    'Coucou ! Encore une journée pour progresser ! 🌟',
    'Allez, c\'est parti ! La route t\'attend ! 🛣️',
  ],
  nl: [
    'Hallo kampioen! Klaar om de weg te veroveren? 🚗',
    'Hey! Gaston is er om je te begeleiden! 🎓',
    'Welkom! Samen worden we een topbestuurder! 💪',
    'Hallo! Weer een dag om vooruit te gaan! 🌟',
    'Kom, laten we gaan! De weg wacht op je! 🛣️',
  ],
};

export const GASTON_CORRECT: Record<Lang, string[]> = {
  fr: [
    'Bravo ! Tu gères ! 🎉',
    'Excellent ! Continue comme ça ! 💪',
    'Parfait ! Tu es sur la bonne voie ! 🌟',
    'Super réponse ! Tu m\'impressionnes ! 🏆',
    'Bien joué ! Un vrai champion ! 🚀',
    'Génial ! Tu vas réussir haut la main ! ✨',
  ],
  nl: [
    'Bravo! Je doet het geweldig! 🎉',
    'Uitstekend! Ga zo door! 💪',
    'Perfect! Je bent op de goede weg! 🌟',
    'Super antwoord! Je maakt indruk! 🏆',
    'Goed gedaan! Een echte kampioen! 🚀',
    'Geweldig! Je gaat het halen met vlag en wimpel! ✨',
  ],
};

export const GASTON_WRONG: Record<Lang, string[]> = {
  fr: [
    'Oups ! Pas grave, on apprend de ses erreurs ! 💪',
    'Raté ! Mais je crois en toi ! 🤗',
    'Pas cette fois ! Mais tu vas y arriver ! 🌟',
    'Aïe ! Retiens bien l\'explication ! 📝',
    'Oh non ! Allez, la prochaine sera la bonne ! 💪',
    'Presque ! Concentre-toi bien ! 🧐',
  ],
  nl: [
    'Oeps! Niet erg, we leren van onze fouten! 💪',
    'Mis! Maar ik geloof in je! 🤗',
    'Niet deze keer! Maar je gaat het halen! 🌟',
    'Au! Onthoud de uitleg goed! 📝',
    'Oh nee! Kom, de volgende wordt goed! 💪',
    'Bijna! Concentreer je goed! 🧐',
  ],
};

export const GASTON_THEORY_TIPS: Record<Lang, string[]> = {
  fr: [
    'Lis bien cette carte, c\'est important !',
    'Retiens bien les points clés !',
    'Prends ton temps pour comprendre.',
    'Cette notion tombe souvent à l\'examen !',
    'Concentre-toi bien sur les détails.',
  ],
  nl: [
    'Lees deze kaart goed, het is belangrijk!',
    'Onthoud de kernpunten goed!',
    'Neem je tijd om het te begrijpen.',
    'Dit onderwerp komt vaak op het examen!',
    'Let goed op de details.',
  ],
};

export const GASTON_FLASH: Record<Lang, string[]> = {
  fr: [
    'Concentre-toi bien sur chaque fiche ! 🧐',
    'Tu retiens de mieux en mieux ! 📚',
    'Encore quelques cartes, tu gères ! 💪',
    'La répétition, c\'est la clé ! 🔑',
    'Bientôt un expert du code ! 🏆',
    'Continue, tu es sur la bonne voie ! 🌟',
  ],
  nl: [
    'Concentreer je goed op elke kaart! 🧐',
    'Je onthoudt steeds beter! 📚',
    'Nog een paar kaarten, je doet het goed! 💪',
    'Herhaling is de sleutel! 🔑',
    'Binnenkort een expert! 🏆',
    'Ga door, je bent op de goede weg! 🌟',
  ],
};

export const GASTON_REVISION: Record<Lang, string[]> = {
  fr: [
    'Prends ton temps, c\'est de la révision !',
    'Chaque question est une chance de progresser.',
    'Tu connais déjà la réponse, cherche bien.',
    'Bonne révision, tu gères !',
  ],
  nl: [
    'Neem je tijd, dit is herziening!',
    'Elke vraag is een kans om vooruit te gaan.',
    'Je kent het antwoord al, zoek goed.',
    'Goede herziening, je doet het goed!',
  ],
};

export const GASTON_TIPS: Record<Lang, string[]> = {
  fr: [
    'Le mode Survie entraîne ta concentration sous pression — parfait avant l\'examen !',
    'Fais un Sprint 3min par jour pour maintenir ton streak !',
    'Tu réponds trop vite ? Le Sprint 5min punit les erreurs précipitées.',
    'Tu peux battre ton record, j\'en suis sûr !',
    'Chaque erreur est une leçon apprise — continue !',
    'La régularité, c\'est la clé du succès !',
  ],
  nl: [
    'De Overlevingsmodus traint je concentratie onder druk — perfect voor het examen!',
    'Doe elke dag een Sprint van 3 min om je reeks te behouden!',
    'Antwoord je te snel? De Sprint 5 min bestraft overhaaste fouten.',
    'Je kunt je record verbreken, dat weet ik zeker!',
    'Elke fout is een geleerde les — ga door!',
    'Regelmaat is de sleutel tot succes!',
  ],
};

export const GASTON_PROFILE: Record<Lang, string[]> = {
  fr: [
    'Continue comme ça, tu es sur la bonne voie ! 💪',
    'Chaque leçon te rapproche du permis ! 🚗',
    'La régularité est la clé du succès ! 🔑',
    'Tu progresses bien, je suis fier de toi ! 🌟',
    'N\'oublie pas de réviser les panneaux ! 🪧',
  ],
  nl: [
    'Ga zo door, je bent op de goede weg! 💪',
    'Elke les brengt je dichter bij je rijbewijs! 🚗',
    'Regelmaat is de sleutel tot succes! 🔑',
    'Je maakt goede vooruitgang, ik ben trots op je! 🌟',
    'Vergeet niet de verkeersborden te oefenen! 🪧',
  ],
};

export const GASTON_STEP_MESSAGES: Record<Lang, Record<number, { msg: string; expr: 'happy' | 'encouraging' | 'impressed' | 'thinking' | 'party' }>> = {
  fr: {
    1: { msg: 'Bienvenue ! Je suis le Prof. Gaston, ton guide vers le permis ! 🎓', expr: 'happy' },
    2: { msg: 'Dis-moi ton prénom, je personnaliserai tout pour toi ! 👋', expr: 'encouraging' },
    3: { msg: 'Un compte te permet de sauvegarder ta progression en ligne ! 💾', expr: 'thinking' },
    4: { msg: 'Choisis bien, cette voiture sera ta compagne de route ! 🚗', expr: 'impressed' },
    5: { msg: 'La couleur idéale, c\'est celle qui te fait sourire ! 🎨', expr: 'happy' },
    6: { msg: 'Je m\'adapterai à ton rythme, promis ! 🤝', expr: 'encouraging' },
    7: { msg: 'Tout est prêt ! En route vers le permis ! 🏆', expr: 'party' },
  },
  nl: {
    1: { msg: 'Welkom! Ik ben Prof. Gaston, je gids naar het rijbewijs! 🎓', expr: 'happy' },
    2: { msg: 'Vertel me je voornaam, ik pas alles voor je aan! 👋', expr: 'encouraging' },
    3: { msg: 'Met een account kun je je voortgang online opslaan! 💾', expr: 'thinking' },
    4: { msg: 'Kies goed, deze auto wordt je metgezel op de weg! 🚗', expr: 'impressed' },
    5: { msg: 'De ideale kleur is degene die je doet glimlachen! 🎨', expr: 'happy' },
    6: { msg: 'Ik pas me aan jouw tempo aan, beloofd! 🤝', expr: 'encouraging' },
    7: { msg: 'Alles is klaar! Op weg naar het rijbewijs! 🏆', expr: 'party' },
  },
};

export function getRandomMsg(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}
