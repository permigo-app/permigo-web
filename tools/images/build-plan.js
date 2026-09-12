// Construit plan.json à partir des SCÈNES CONÇUES À LA MAIN (tools/images/scenes/).
//
// Principe : plus aucun prompt générique. Chaque image du plan a une scène
// rédigée question par question (en analysant l'énoncé, les 4 propositions et
// la bonne réponse). Une question absente des fichiers de scènes — ou marquée
// null (= image inutile/trompeuse) — n'entre PAS dans le plan.
//
// Fichiers de scènes : scenes/theme_X.json (permis B), scenes/am_theme_X.json (permis AM)
//   { "A1Q17": "description précise de la scène …", "A1_Q1": null, … }
//
// Relançable à volonté : ce qui a déjà une image dans les données est exclu.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SCENES_DIR = path.join(__dirname, 'scenes');

const SECTIONS = [
  { lic: 'B', codes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'], dataFile: c => `src/data/theme_${c}.json`, sceneFile: c => `theme_${c}.json` },
  { lic: 'AM', codes: ['A', 'B', 'C', 'D', 'E', 'F'], dataFile: c => `src/data/am/theme_${c}.json`, sceneFile: c => `am_theme_${c}.json` },
];

// Trois modèles de rendu, choisis scène par scène :
//   1 = photo réaliste simple (par défaut — questions et cartes "1 concept")
//   2 = schéma pédagogique vu du dessus, AUCUN MOT, AUCUN CHIFFRE, et aucune
//       flèche colorée qui désignerait la bonne réponse (site bilingue FR/NL —
//       un mot gravé dans l'image ne se traduit pas) — pour les règles à
//       plusieurs acteurs / priorité / ordre de passage
//   3 = hybride : photo réaliste + UN SEUL repère graphique (chiffre en badge
//       ou flèche unique, jamais de mot) — pour un repère chiffré isolé

// Règle transversale née de l'audit visuel des 1065 premières images.
// Les deux causes de rejet, de loin les plus fréquentes, sont :
//   (a) un élément nommé par l'énoncé qui n'apparaît pas dans l'image,
//   (b) une image qui donne — ou pire, qui contredit — la bonne réponse.
const CONTROLE_FINAL =
  `\n\nCONTRÔLE AVANT DE GÉNÉRER (les deux règles qui priment sur tout le reste) :\n` +
  `1. TOUT CE QUE LA SCÈNE NOMME DOIT ÊTRE VISIBLE. Si la scène cite un panneau, un chiffre, un cycliste, ` +
  `un piéton, un clignotant, un casque, un refuge, un carrefour, un marquage ou une barrière, il doit apparaître ` +
  `dans le cadre et être identifiable. Une scène dont l'élément central manque est une image ratée, même si le ` +
  `décor est beau. Si un seul véhicule est cité, n'en ajoute pas d'autres ; si deux sont cités, les deux doivent être là.\n` +
  `2. L'IMAGE NE DIT JAMAIS LA RÉPONSE, ET NE LA CONTREDIT JAMAIS. N'ajoute aucun symbole, aucune croix, aucune coche, ` +
  `aucune flèche de trajectoire, aucun chiffre d'ordre, aucun pictogramme d'interdiction qui désignerait la solution. ` +
  `À l'inverse, le comportement montré doit être celui que la règle impose : si la bonne réponse est « il faut un casque », ` +
  `le personnage porte un casque ; si c'est « pas de ceinture en marche arrière », la ceinture est détachée ; ` +
  `si c'est « on se place à gauche », le véhicule est à gauche.\n` +
  `3. QUAND LA QUESTION COMPARE DEUX CHOSES (deux panneaux, deux situations, agglomération / hors agglomération, ` +
  `avant / après, avec / sans), les DEUX doivent être dans l'image, côte à côte ou en diptyque, avec le même cadrage ` +
  `et une seule variable qui change.\n` +
  `4. UN CHIFFRE ÉCRIT DANS L'IMAGE (panneau de vitesse, de hauteur, de largeur, de tonnage, compteur, horloge) doit être ` +
  `EXACTEMENT celui de la scène. Un chiffre différent de l'énoncé rend la question impossible. Si la scène ne donne pas de ` +
  `chiffre, laisse le cadran illisible plutôt que d'en inventer un.\n` +
  `5. REPÈRES RÉGIONAUX BELGES quand la scène en cite un : Wallonie = relief, bois, pierre bleue, ardoise, clochers ; ` +
  `Flandre = plaine, peupliers alignés, briques claires ; Bruxelles = tram urbain à livrée sobre, immeubles de rapport, ` +
  `tours du quartier Nord. Ne place jamais un décor urbain dense sur une scène « hors agglomération », ni l'inverse.`;

const PRECISION_PHOTO =
  `NETTETÉ ET PRÉCISION OBLIGATOIRES : image nette et bien focalisée, haute clarté, aucun flou artistique, aucun grain. ` +
  `Place chaque véhicule et chaque personnage EXACTEMENT à la position et dans la direction décrites dans la scène — ` +
  `sans ambiguïté possible sur qui est où et qui va où. Respecte EXACTEMENT le point de vue indiqué dans la scène ` +
  `(vue conducteur derrière le pare-brise, vue piétonne, vue aérienne…) — ne le change pas. ` +
  `Avant de générer, vérifie que la scène entière est cohérente et ` +
  `logique (distances réalistes, directions compatibles entre elles, aucun élément contradictoire ou physiquement impossible). ` +
  `Inclus TOUS les éléments explicitement mentionnés dans la scène, sans en omettre aucun. ` +
  `CONTEXTE EUROPÉEN STRICT : véhicules européens courants, plaques d'immatriculation illisibles, architecture belge ` +
  `(briques, maisons mitoyennes, pavés), AUCUN élément nord-américain (pas de school bus jaune, pas de panneau jaune en ` +
  `losange, pas de feu suspendu au câble, pas de ligne jaune au sol). ` +
  `Si la scène mentionne un badge « ? » : petit badge circulaire BLANC à fin liseré GRIS avec un « ? » NOIR, placé dans un ` +
  `COIN de l'image, discret, sans masquer la scène — c'est le SEUL élément graphique ajouté. Jamais jaune, jamais bleu, ` +
  `jamais rouge, jamais au centre du cadre, jamais posé sur le volant, sur la chaussée ou sur un véhicule, et jamais ` +
  `accompagné d'un chiffre (un badge chiffré se lirait comme un panneau de limitation).\n\n` +
  `FIDÉLITÉ DES PANNEAUX (CRITIQUE) : un panneau de signalisation doit être dessiné EXACTEMENT comme la scène le décrit — ` +
  `forme, couleur de fond, et pictogramme intérieur au mot près. N'invente JAMAIS un pictogramme, n'ajoute JAMAIS une barre, ` +
  `un trait, un chiffre ou un symbole qui n'est pas décrit, et n'en retire aucun. Un panneau au centre laissé vide est lui-même ` +
  `un panneau réglementaire distinct : ne laisse un centre vide que si la scène le demande explicitement. ` +
  `Si la scène dit qu'un panneau est vu DE DOS, ne montre que sa plaque arrière grise et ses fixations — sa face avant ne doit ` +
  `apparaître nulle part. Un panneau doit être NET et lisible : jamais flou, jamais vide, jamais vu de trop loin, et ne porte ` +
  `JAMAIS son code réglementaire écrit dessus (« F17 », « C43 »… n'existent pas sur un vrai panneau). ` +
  `Un grand panneau directionnel bleu ou vert doit porter un nom de localité belge plausible plutôt que rester vide.\n\n` +
  `COHÉRENCE DES USAGERS ET DES GESTES : un motard, même à l'arrêt ou poussant sa machine, porte un CASQUE ; ` +
  `une personne qui pousse un cyclomoteur est piétonne et n'en porte pas. Une personne sortie de son véhicule sur une ` +
  `autoroute ou une bande d'arrêt d'urgence porte le GILET fluo et se tient DERRIÈRE la glissière, côté talus. ` +
  `Une intention de tourner ou de changer de bande se lit au CLIGNOTANT allumé du bon côté. ` +
  `Les véhicules de service sont de type européen et portent des livrées génériques, sans logo ni marque : ` +
  `véhicule de secours jaune à damier, autobus et tram urbains aux couleurs sobres, véhicule de transport scolaire ` +
  `de type minibus ordinaire — jamais d'autobus scolaire jaune de type nord-américain.` +
  CONTROLE_FINAL;

const STYLE_BLOCKS = {
  1: `STYLE : photographie réaliste, type photo d'examen du permis de conduire belge (GOCA). ` +
     `Belgique, circulation à droite, lumière naturelle. ` +
     `Composition SIMPLE, lisible en 2 secondes, avec UN sujet principal clair. ` +
     `Aucun texte lisible et aucune enseigne (sauf si la scène l'exige explicitement), aucune flèche ajoutée, aucun filigrane. ` +
     `MARQUAGES ROUTIERS BELGES UNIQUEMENT : lignes BLANCHES (orange seulement pour les chantiers) — JAMAIS de ligne jaune au sol. ` +
     `N'ajoute AUCUN panneau de signalisation — uniquement ceux décrits dans la scène. Format paysage.\n\n${PRECISION_PHOTO}`,
  2: `STYLE : SCHÉMA PÉDAGOGIQUE vu du dessus (vue aérienne stylisée et épurée, PAS une photographie), ` +
     `façon diagramme de code de la route. Le schéma pose la situation ; c'est à l'élève de la résoudre.\n\n` +
     `INTERDIT ABSOLU — ces éléments donnent la réponse ou ne se traduisent pas :\n` +
     `· aucun MOT, aucune LETTRE (pas de « A », « B » sur les voitures), aucun panneau texté — le site est bilingue FR/NL ` +
     `et un mot gravé dans l'image ne peut pas être traduit ;\n` +
     `· aucun CHIFFRE d'ordre de passage (1, 2, 3…) : l'ordre est précisément ce que la question demande de trouver ;\n` +
     `· aucune FLÈCHE VERTE ni ROUGE, aucune CROIX, aucune COCHE, aucun symbole d'interdiction : « vert = passe, ` +
     `rouge = doit céder » est la réponse dessinée sur l'image.\n\n` +
     `AUTORISÉ : au maximum UNE flèche fine et NEUTRE (gris foncé) par véhicule, uniquement pour lever une ambiguïté de ` +
     `direction que la position seule ne suffit pas à montrer (par exemple « celui-ci va tourner à gauche »), et seulement ` +
     `si la scène le demande. Deux véhicules qui vont tout droit n'ont besoin d'aucune flèche : leur orientation suffit. ` +
     `Quand la situation se lit sans repère, n'ajoute rien et pose le badge « ? » blanc à liseré gris dans un coin.\n\n` +
     `N'ajoute AUCUN panneau de signalisation, AUCUN triangle, AUCUNE ligne au sol qui ne soit pas explicitement décrit ` +
     `dans la scène — n'invente aucun élément. Un panneau n'est jamais représenté couché à plat au sol : dans une vue du ` +
     `dessus, soit la scène s'en passe, soit il est vu légèrement de biais, debout sur son mât.\n\n` +
     `Fond clair et minimaliste, marquages routiers belges simplifiés (lignes blanches uniquement), silhouettes de véhicules ` +
     `stylisées mais aux proportions justes, herbe et trottoirs sobres — pas d'aplats criards. Garde le MÊME style graphique ` +
     `d'un schéma à l'autre : ils se suivent dans la même leçon. Format paysage.\n\n` +
     `NETTETÉ ET PRÉCISION OBLIGATOIRES : lignes et contours nets et propres, aucun flou. Place chaque véhicule ` +
     `EXACTEMENT selon les positions et directions décrites dans la scène — sans ambiguïté sur qui est où et qui va où. ` +
     `Vérifie la cohérence géométrique et logique de l'ensemble avant de générer. ` +
     `Inclus TOUS les éléments explicitement mentionnés dans la scène, sans en omettre aucun.` + CONTROLE_FINAL,
  4: `STYLE : SCHÉMA PÉDAGOGIQUE DE CARTE DE THÉORIE, vu du dessus (vue aérienne stylisée et épurée, PAS une ` +
     `photographie), façon diagramme de manuel de code de la route. Contrairement au schéma d'une question, ` +
     `celui-ci EXPLIQUE la règle : utilise une FLÈCHE VERTE pour la trajectoire autorisée ou prioritaire, ` +
     `une FLÈCHE ROUGE (pointillée) pour celle qui doit céder, de simples CHIFFRES isolés dans des pastilles ` +
     `pour un ordre de passage, et une CROIX ROUGE pour ce qui est interdit. N'emploie que ce dont la règle a ` +
     `besoin : deux ou trois repères au maximum, jamais davantage, et jamais deux flèches qui se contredisent.\n\n` +
     `INTERDIT : aucun MOT, aucune LETTRE (pas de « A » ni « B » sur les véhicules), aucune légende — le site ` +
     `est bilingue FR/NL. Aucun élément d'interface (bouton, icône de partage). Aucun panneau couché à plat au ` +
     `sol : dans une vue du dessus, soit la scène s'en passe, soit il est vu de biais, debout sur son mât.\n\n` +
     `Fond clair et minimaliste, marquages routiers belges simplifiés (lignes BLANCHES uniquement), silhouettes ` +
     `de véhicules stylisées aux proportions justes, herbe et trottoirs sobres — pas d'aplats criards, pas de ` +
     `bandes de couleur arbitraires. Garde le MÊME style graphique d'un schéma à l'autre : ils se suivent dans ` +
     `la même leçon. Format paysage.\n\n` +
     `NETTETÉ ET PRÉCISION OBLIGATOIRES : lignes et contours nets, aucun flou. La géométrie doit être JUSTE — ` +
     `une trajectoire dessinée doit être celle que la règle impose, une numérotation doit suivre l'ordre réel, ` +
     `un segment de distance doit partir du bon point. Vérifie la cohérence de l'ensemble avant de générer : ` +
     `un schéma faux enseigne le contraire de la carte.`,
  3: `STYLE : photographie réaliste (même exigence qu'une photo d'examen GOCA belge, lumière naturelle, ` +
     `circulation à droite), à laquelle est ajouté UN SEUL repère graphique simple et discret : soit un ` +
     `chiffre isolé dans un petit badge circulaire, soit une flèche unique — jamais les deux ensemble, ` +
     `et JAMAIS de mot écrit (site bilingue FR/NL). Le repère ne doit pas transformer la photo en schéma : ` +
     `la scène doit rester lisible comme une vraie photo. Format paysage.\n\n${PRECISION_PHOTO}`,
};

// Une CARTE DE THÉORIE n'est pas une question : elle explique au lieu de faire deviner.
// Les repères qui seraient interdits sur une question y sont donc souhaitables.
// (Distinction issue de l'audit visuel des 530 images de théorie — docs/audit-images-theorie.md.)
const CONTROLE_CARTE =
  `\n\nCECI EST UNE CARTE DE THÉORIE, PAS UNE QUESTION — ce qui change deux règles :\n` +
  `· L'image doit AIDER À COMPRENDRE, pas faire deviner. Les repères pédagogiques sont donc ENCOURAGÉS : ` +
  `flèche verte pour ce qui est autorisé et flèche rouge pour ce qui doit céder, pastilles numérotées pour un ` +
  `ordre de passage, badge chiffré pour une valeur, pictogramme d'interdiction, cote à double flèche pour une ` +
  `distance. Emploie-les chaque fois qu'ils rendent la règle plus claire.\n` +
  `· QUAND LA CARTE ENSEIGNE UN CHIFFRE, CE CHIFFRE DOIT ÊTRE VISIBLE. Vitesse, distance, masse, durée, ` +
  `montant : affiche-le, soit sur un vrai panneau planté dans la scène, soit dans un petit badge circulaire ` +
  `blanc à liseré gris posé dans un coin, soit en cote à double flèche pour une distance. Un chiffre se lit ` +
  `en français comme en néerlandais : c'est le meilleur repère disponible. Une carte qui enseigne une valeur ` +
  `sans la montrer est une carte ratée.\n` +
  `· N'UTILISE JAMAIS LE BADGE « ? » SUR UNE CARTE : il n'y a rien à deviner. Là où une question porterait ` +
  `un « ? », une carte porte le chiffre ou le repère correspondant.\n` +
  `· LE SEUL INTERDIT QUI RESTE ENTIER EST LE MOT ÉCRIT : aucune lettre, aucun mot, aucune légende ajoutée ` +
  `à l'image — le site est bilingue FR/NL et un mot gravé ne se traduit pas. Seuls les textes qui figurent ` +
  `réellement sur un panneau ou un véhicule belge (« BUS », « STOP », « 3,5t », « 150m », une girouette de ligne) ` +
  `sont admis, et jamais une mention inventée. N'incruste jamais d'élément d'interface (bouton, icône).\n` +
  `· QUAND LA CARTE COMPARE DEUX CHOSES, montre les DEUX côte à côte, au même cadrage et sur fond neutre, ` +
  `avec une seule variable qui change.\n` +
  `· TOUT CE QUE LA SCÈNE NOMME DOIT ÊTRE VISIBLE, sans exception. Si la scène cite un cycliste, un piéton, un ` +
  `cavalier, un cyclomoteur, un panneau, une barrière, un marquage ou un chiffre, il doit apparaître dans le cadre ` +
  `et être identifiable. Une carte dont l'usager central manque enseigne autre chose que ce qu'elle devait enseigner : ` +
  `c'est une image ratée, même si le décor est réussi.\n` +
  `· UNE CROIX ROUGE NE SE POSE QUE SUR CE QUI EST INTERDIT, ET SUR RIEN D'AUTRE. Ne barre jamais un véhicule qui a le ` +
  `droit de passer, fût-il en dernier ; ne barre jamais un véhicule qui fait exactement la même chose qu'un véhicule ` +
  `voisin laissé libre — deux comportements identiques reçoivent le même repère, sinon le schéma se contredit ` +
  `lui-même. Quand la carte enseigne un ORDRE de passage, tous les véhicules passent : l'ordre se dit par des ` +
  `pastilles numérotées et par rien d'autre, jamais par une croix ni par une flèche rouge.\n` +
  `· UNE FLÈCHE MÈNE LÀ OÙ LE VÉHICULE DOIT ALLER : elle part de son avant et se termine sur sa destination réelle — ` +
  `la voie qu'il rejoint, l'espace où il s'insère. Jamais sur un symbole, jamais dans le vide, jamais vers un obstacle.`;

function buildPrompt(lic, themeTitle, sceneEntry, kind) {
  // Rétrocompatibilité : une scène simple (string) = modèle 1, comme avant.
  const model = typeof sceneEntry === 'object' && sceneEntry.model ? sceneEntry.model : 1;
  const scene = typeof sceneEntry === 'object' ? sceneEntry.scene : sceneEntry;
  const contexte = kind === 'card'
    ? `carte de théorie du permis ${lic === 'AM' ? 'AM (cyclomoteur)' : 'B (voiture)'} belge, thème « ${themeTitle} »`
    : `question d'examen du permis ${lic === 'AM' ? 'AM (cyclomoteur)' : 'B (voiture)'} belge, thème « ${themeTitle} »`;
  return `Génère une image.\n\n${STYLE_BLOCKS[model]}` +
    (kind === 'card' ? CONTROLE_CARTE : '') + `\n\n` +
    `SCÈNE PRÉCISE À REPRÉSENTER :\n${scene}\n\n` +
    `Contexte : ${contexte}.`;
}

const jobs = [];
let scenesNull = 0, noScene = 0;

for (const { lic, codes, dataFile, sceneFile } of SECTIONS) {
  for (const code of codes) {
    const dataAbs = path.join(ROOT, dataFile(code));
    const scenesAbs = path.join(SCENES_DIR, sceneFile(code));
    if (!fs.existsSync(dataAbs) || !fs.existsSync(scenesAbs)) continue;
    const theme = JSON.parse(fs.readFileSync(dataAbs, 'utf8'));
    const scenes = JSON.parse(fs.readFileSync(scenesAbs, 'utf8'));

    // ORDRE DE PRODUCTION : dans chaque thème, LES CARTES DE THÉORIE D'ABORD,
    // puis les questions. On termine le thème A entièrement avant de passer au B.
    for (const lesson of theme.lessons) {
      // Cartes de théorie : mêmes fichiers de scènes, clés "CARD_<lessonId>_p<i>_c<j>"
      (lesson.theory || []).forEach((partie, pi) => {
        partie.cards.forEach((card, ci) => {
          if (card.image) return;
          const key = `CARD_${lesson.id}_p${pi}_c${ci}`;
          if (!(key in scenes) || scenes[key] === null) return;
          jobs.push({
            kind: 'card',
            lic, theme: code, file: dataFile(code),
            lessonId: lesson.id, partieIdx: pi, cardIdx: ci,
            id: `${lic === 'AM' ? 'AM_' : ''}${key}`,
            label: card.title,
            out: `/images/theorie/${lic === 'AM' ? 'AM_' : ''}${lesson.id}_p${pi}_c${ci}.webp`,
            prompt: buildPrompt(lic, theme.title, scenes[key], 'card'),
          });
        });
      });
    }

    for (const lesson of theme.lessons) {
      for (const q of lesson.questions) {
        if (q.sign || q.image) continue; // panneau = déjà un visuel ; image = déjà fait
        if (!(q.id in scenes)) { noScene++; continue; } // scène pas encore rédigée
        const scene = scenes[q.id];
        if (scene === null) { scenesNull++; continue; } // décision : pas d'image pour celle-ci
        jobs.push({
          kind: 'question',
          lic, theme: code, file: dataFile(code),
          lessonId: lesson.id,
          id: q.id,
          label: q.question,
          out: `/images/questions/${q.id}.webp`,
          prompt: buildPrompt(lic, theme.title, scene, 'question'),
        });
      }
    }
  }
}

fs.writeFileSync(path.join(__dirname, 'plan.json'), JSON.stringify(jobs, null, 1));
console.log(`plan.json : ${jobs.length} images à produire (scènes rédigées à la main)`);
console.log(`ignorées : ${scenesNull} questions marquées "sans image" · ${noScene} en attente de scènes`);
