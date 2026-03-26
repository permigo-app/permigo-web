'use client';

import {
  LigneContinue, LigneDiscontinue, DoubleContinue, LigneMixte,
  MarquageStop, MarquageCedez, Zebras, Chevrons, Damier,
} from './Marquages';
import {
  FeuTricolore, FeuRouge, FeuOrange, FeuVert, FeuClignotant,
  FeuFlecheVerte, FeuPietonRouge, FeuPietonVert,
  FeuVeloRouge, FeuVeloVert, CroixRougeVoie, FlecheVerteVoie, FeuTram,
} from './Feux';
import {
  TemoinVeilleuses, TemoinCroisement, TemoinRoute, TemoinBrouillardAvant,
} from './Temoins';
import {
  E1, E3, E5, E7, E9a, E9b, E9c,
  StationnementInterdit, ArretStationnementInterdit,
} from './Stationnement';

export type SVGSignCode = keyof typeof SVG_SIGNS;

/** Map code → React SVG component */
export const SVG_SIGNS: Record<string, (props: { size?: number }) => React.ReactNode> = {
  // Marquages au sol
  LIGNE_CONTINUE: LigneContinue,
  LIGNE_DISCONTINUE: LigneDiscontinue,
  DOUBLE_CONTINUE: DoubleContinue,
  LIGNE_MIXTE: LigneMixte,
  MARQUAGE_STOP: MarquageStop,
  MARQUAGE_CEDEZ: MarquageCedez,
  ZEBRAS: Zebras,
  CHEVRONS: Chevrons,
  DAMIER: Damier,
  // Feux
  FEU_TRICOLORE: FeuTricolore,
  FEU_ROUGE: FeuRouge,
  FEU_ORANGE: FeuOrange,
  FEU_VERT: FeuVert,
  FEU_CLIGNOTANT: FeuClignotant,
  FEU_FLECHE_VERTE: FeuFlecheVerte,
  FEU_PIETON_ROUGE: FeuPietonRouge,
  FEU_PIETON_VERT: FeuPietonVert,
  FEU_VELO_ROUGE: FeuVeloRouge,
  FEU_VELO_VERT: FeuVeloVert,
  CROIX_ROUGE_VOIE: CroixRougeVoie,
  FLECHE_VERTE_VOIE: FlecheVerteVoie,
  FEU_TRAM: FeuTram,
  // Témoins tableau de bord
  TEMOIN_VEILLEUSES: TemoinVeilleuses,
  TEMOIN_CROISEMENT: TemoinCroisement,
  TEMOIN_ROUTE: TemoinRoute,
  TEMOIN_BROUILLARD_AVANT: TemoinBrouillardAvant,
  // Stationnement
  E1,
  E3,
  E5,
  E7,
  E9a,
  E9b,
  E9c,
  STAT_INTERDIT: StationnementInterdit,
  ARRET_STAT_INTERDIT: ArretStationnementInterdit,
};

/** Render a sign by code — works for both SVG signs and file-based signs */
export function SVGSign({ code, size = 56 }: { code: string; size?: number }) {
  const Component = SVG_SIGNS[code];
  if (!Component) return null;
  return <>{Component({ size })}</>;
}
