const PATTERNS: { key: string; patterns: RegExp[] }[] = [
  { key: 'B3', patterns: [/\bstop\b/i] },
  { key: 'B1', patterns: [/céd(ez|er) le passage/i, /ceder le passage/i] },
  { key: 'B9', patterns: [/route prioritaire/i, /losange jaune/i] },
  { key: 'B11', patterns: [/fin de priorité/i] },
  { key: 'C1', patterns: [/sens interdit/i] },
  { key: 'C3', patterns: [/acc[eè]s interdit/i] },
  { key: 'C33', patterns: [/interdiction de d[eé]passer/i, /interdit.*d[eé]passer/i] },
  { key: 'C35', patterns: [/fin.*interdiction.*d[eé]passer/i] },
  { key: 'C37', patterns: [/stationnement interdit/i] },
  { key: 'C39', patterns: [/interdit(ion)? d.arrêt/i] },
  { key: 'C43-30', patterns: [/\b30\s*km/i] },
  { key: 'C43-50', patterns: [/\b50\s*km/i] },
  { key: 'C43-70', patterns: [/\b70\s*km/i] },
  { key: 'C43-90', patterns: [/\b90\s*km/i] },
  { key: 'C43-120', patterns: [/\b120\s*km/i] },
  { key: 'F19', patterns: [/sens unique/i] },
  { key: 'D5', patterns: [/giratoire/i, /rond-?point/i] },
  { key: 'D7', patterns: [/piste cyclable/i] },
  { key: 'E9a', patterns: [/\bparking\b/i] },
  { key: 'F9', patterns: [/début.*autoroute/i] },
  { key: 'F11', patterns: [/fin.*autoroute/i] },
  { key: 'F1a', patterns: [/passage.*piétons/i, /passage clouté/i] },
  { key: 'F33b', patterns: [/passage.*cyclistes/i] },
  { key: 'F41', patterns: [/zone 30/i] },
  { key: 'F21', patterns: [/zone résidentielle/i] },
  { key: 'FEU_ROUGE', patterns: [/feu rouge(?!.*clignotant)/i] },
  { key: 'FEU_ORANGE', patterns: [/feu (orange|jaune)(?!.*clignotant)/i] },
  { key: 'FEU_VERT', patterns: [/feu vert/i] },
  { key: 'FEU_CLIGNOTANT', patterns: [/feu.*clignotant/i] },
  { key: 'FEU_TRICOLORE', patterns: [/feu tricolore/i, /feux de circulation/i] },
  { key: 'LT_CROIS', patterns: [/feux de croisement/i] },
  { key: 'LT_ROUTE', patterns: [/feux de route/i, /pleins phares/i] },
  { key: 'LT_VEILL', patterns: [/feux de position/i, /veilleuses/i] },
  { key: 'LT_BRAV', patterns: [/brouillard.*avant/i] },
  { key: 'LT_BRAR', patterns: [/brouillard.*arrière/i] },
  { key: 'LT_DETR', patterns: [/feux de détresse/i, /warning/i] },
  { key: 'A25', patterns: [/signal.*travaux/i, /panneau.*travaux/i] },
  { key: 'A1', patterns: [/virage dangereux.*droite/i] },
  { key: 'A1a', patterns: [/virage dangereux/i] },
  { key: 'A14a', patterns: [/dos.d.âne/i, /cassis/i] },
  { key: 'A15', patterns: [/chauss[eé]e glissante/i] },
  { key: 'A19', patterns: [/abords.*[eé]cole/i] },
  { key: 'A29', patterns: [/passage à niveau/i] },
];

export function detectSign(text: string): string | null {
  if (!text) return null;
  for (const { key, patterns } of PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(text)) return key;
    }
  }
  return null;
}
