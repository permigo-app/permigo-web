# Audit visuel image par image — 1065 images de questions

Méthode : chaque image est ouverte et jugée comme le ferait un élève, en face de
l'énoncé et de la bonne réponse. Trois verdicts :

- ✅ l'image aide à comprendre la question (ou plante le décor sans donner la réponse)
- ⚠️ utilisable mais faible : un élément de l'énoncé manque ou détonne
- ❌ à refaire : l'image ne montre pas ce que la question demande, ou contredit l'énoncé

**Le badge « ? » n'est pas un défaut.** Il est prescrit par `tools/images/build-plan.js`
pour les questions abstraites dont la scène ne doit pas contenir la réponse.

---

## Thème A — 282 images vues — TERMINÉ

**Bilan : 222 ✅ · 43 ⚠️ · 17 ❌**

### ❌ À refaire (17)

| ID | Ce qui ne va pas |
|----|------------------|
| A1_Q2 | Réponse = « un pont enjambant une rivière » ; image = parking d'entreprise avec barrière. Ni pont ni rivière. |
| A1Q38 | Énoncé « Bruxelles hors agglomération » ; image = avenue urbaine dense, immeubles haussmanniens (plutôt Paris). Induit 30/50 au lieu de 70. |
| A1Q43 | Question sur la chaussée à voie centrale ; image = 2 bandes + axe central pavé + bandes de suggestion. Contredit A1Q41. |
| A2_Q16 | Énoncé « double ligne mixte, continue de mon côté » ; image = une seule ligne continue. |
| A2_Q28 | Énoncé : deux bandes interrompues, ordre de passage ; image = file unique dans un couloir de chantier. |
| A2_Q29 | Idem ; image = bretelle d'insertion avec zébras. Hors sujet. |
| A3_Q38 | Distance latérale de 1 m avec un cycliste ; voiture et cycliste pas côte à côte (sens inverses), pas de bande latérale. |
| A4_Q44 | Réponse « ligne blanche **striée** » ; image = ligne discontinue lisse ordinaire. |
| A4_Q63 | **Doublon d'A4_Q41.** Ni bande d'accès ni réduction de bande. |
| A4_Q64 | **Doublon d'A4_Q50.** Ni bande de sortie, ni panneau, ni clignotant. |
| A4_Q67 | **Doublon d'A4_Q66.** Aucun véhicule en stationnement. |
| A4_Q74 | **Doublon d'A4_Q69.** Aucun raccordement transversal, berme continue. |
| A4_Q76 | Question sur la signalisation blanche des échangeurs ; image = panneau F5 « début d'autoroute » n° 22. |
| A5_Q2 | Réponse « des carrefours et des feux possibles » ; l'image n'en montre aucun. |
| A5_Q18 | Énoncé « hors agglomération, sans berme » ; image = village habité **avec** berme. Contredit les deux conditions. |
| A5_Q42 | Question sur le stationnement ; aucun véhicule à l'arrêt. |
| A6_Q9 | Énoncé bâti sur un panneau 70 + un carrefour ; panneau illisible de dos, aucun carrefour. |

### ⚠️ Faibles (43)

**Élément de l'énoncé absent**
A2_Q18 (un seul des deux signaux) · A2_Q20 (fin de bande invisible) · A5_Q1 (pas de F9/F11) ·
A5_Q4 (aucun véhicule interdit) · A5_Q10 (2 chaussées au lieu de 3) · A5_Q48 (aucun contresens) ·
A5_Q59 (pas de F1) · A5_Q60 (pas de F1) · A6_Q12 (pas de F3) · A6_Q13 (pas de F3) ·
A6_Q17 (pas de F12a) · A6_Q28 (pas de barrière) · A6_Q42 (aucun panneau de zone) ·
A6_Q43 (aucun panneau de zone) · A6_Q45 (rien n'indique une zone 30) · A6_Q52 (C3 sans mention) ·
A6_Q66 (ni tram ni bus) · A6_Q84 (ni zone 30 ni panneau 50) · A1Q42 (aucun véhicule motorisé) ·
A4_Q43 (aucune bande réservée identifiable)

**Contexte incohérent avec l'énoncé**
A5_Q20 (tours urbaines pour « hors agglomération ») · A6_Q19 (rue ordinaire pour une zone résidentielle) ·
A6_Q23 (idem) · A6_Q32 (idem, rue de jeu) · A6_Q35 / A6_Q37 / A6_Q40 (piste cyclable au lieu de zone cyclable) ·
A1Q54 (bande latérale non délimitée) · A3_Q65 (aucun marquage de zone cyclable) ·
A6_Q24 (voiture garée à droite alors que la question porte sur la gauche)

**Détail faux ou dangereux**
A4_Q21 (voiture à contresens sur la BAU) · A4_Q23 et A4_Q32 (occupants sans gilet, contredit A4_Q28) ·
A5_Q34 (gilet porté assis dans l'habitacle) · A5_Q49 (téléphone debout côté circulation sans gilet) ·
A3_Q54 (signaleur au lieu d'un capitaine de route : ni brassard ni vélo) ·
A6_Q8 (disque vert « jeune conducteur » inexistant en Belgique) ·
A4_Q71 (remorquage en biais entre deux bandes, illisible)

**Rendu**
A6_Q15 et A6_Q16 (chiffres du C43 délavés, gris au lieu de noir) · A4_Q77 (grand panneau bleu entièrement vide) ·
A6_Q34 / A6_Q39 (décor néerlandais : canal, réverbères d'Amsterdam)

### Ce qui marche déjà très bien (à reproduire)

- **Les paires contrastées** : A3_Q19/Q20 (cycliste engagé vs à l'arrêt), A4_Q24/Q25 (100 m vs 30 m),
  A4_Q44/Q46 (panneau éteint vs allumé), A6_Q63/Q64 (chemin qui dessert une ferme vs qui ne dessert rien).
- **Les deux panneaux côte à côte** : A5_Q54, A6_Q86, A6_Q47. C'est le bon traitement pour toute question
  qui oppose deux signaux.
- **Le flou de mouvement** pour dire la vitesse sans écrire de chiffre : A4_Q52, A5_Q40, A6_Q7, A6_Q26, A6_Q50.
- **Les vues plongeantes** pour les questions de position relative : A2_Q30, A4_Q35, A4_Q36, A5_Q13, A5_Q45.
- **Le point de vue inhabituel qui porte le sens** : A5_Q25 (par la lunette arrière → « vous gênez »),
  A4_Q33 (borne kilométrique nette, appel flou derrière), A6_Q54 (l'habitant devant sa barrière fermée).
- **Le texte court se rend bien** : « BUS », « SMOG 90 », « HAMEAU », « E42 », « A12 / Li / 57,8 »,
  « ZONE 30 km », « BRUXELLES / NAMUR / LIÈGE ». Les phrases longues, non (cf. G1_Q16-21).

---

## Thème B — 73 images vues — TERMINÉ

**Bilan : 56 ✅ · 10 ⚠️ · 7 ❌**

### ❌ À refaire (7)

| ID | Ce qui ne va pas |
|----|------------------|
| B1_Q8 | Énoncé « vous marchez sans trottoir » ; réponse = piste cyclable puis chaussée. Image = route vide, ni piéton ni piste cyclable. |
| B1_Q18 | Question = « doit-elle porter un casque ? → **Oui** » ; l'homme pousse sa moto **tête nue**. L'image dit le contraire de la réponse. |
| B1_Q20 | Toute la question tient à la distance jusqu'au passage pour piétons (15 m) ; **aucun passage visible**. |
| B1_Q42 | Un badge rouge « **5** » incrusté en haut à gauche ressemble à une limitation à 5 km/h (inexistante) et contredit « allure du pas ». Ce n'est pas le badge « ? ». |
| B2_Q12 | Réponse = « sur le **trottoir** » ; l'image montre le cyclomoteur poussé **sur la chaussée**. |
| B2_Q14 | Moto poussée = conducteur, casque obligatoire ; l'homme est **tête nue**. Contredit B2_Q15 qui suit. |
| B2_Q15 | Question = « doit-elle porter un casque ? → **Oui** » ; homme en t-shirt, **tête nue**. |

### ⚠️ Faibles (10)

B1_Q2 (cheval sur l'accotement, pas sur la chaussée) · B1_Q17 (pousse la voiture par l'avant) ·
B1_Q25 (piétonne à côté du passage, regarde ailleurs) · B1_Q39 (ni enfant ni personne âgée) ·
B1_Q50 (énoncé « bus », image = tram) · B1_Q51 (voiture sur les rails en sens inverse) ·
B2_Q9 et B2_Q11 (cyclomoteur poussé **avec** casque) · B2_Q17 (moto poussée sans casque, sur l'accotement) ·
B2_Q20 (comparaison sans aucun casque visible)

### Le défaut structurant du thème B : le casque

Six images du groupe « pousser un deux-roues » se trompent de casque. La règle à rendre visible :

- **cyclomoteur poussé = piéton** → pas de casque, circule sur le **trottoir** (modèle correct : B2_Q10)
- **moto poussée = conducteur** → casque **obligatoire**, circule sur la **chaussée** (modèles : B2_Q16, B1_Q19)

Le casque est l'unique élément qui distingue les deux réponses : il doit être flagrant.

### Ce qui marche très bien dans le thème B

- **B2_Q19** : les deux cas de la comparaison **dans une seule image** (vélo poussé sur le trottoir à gauche,
  voiture poussée sur la chaussée à droite). Traitement idéal pour toute question « quelle différence entre X et Y ».
- **B1_Q55** : le panneau de transport scolaire **masqué par une housse** — la réponse « non » devient un geste.
- **B1_Q35** : vue plongeante, trajectoire perpendiculaire géométriquement lisible.
- **B1_Q31/Q32** : couple avant / au-delà du passage. **B2_Q29** : les trois véhicules de la réponse alignés.
- **B2_Q27** : disque « 3,5t » — nouvelle preuve que le **texte court se rend parfaitement**.

---

## Thème C — 164 images vues — TERMINÉ

**Bilan : 126 ✅ · 29 ⚠️ · 9 ❌**

### ❌ À refaire (9)

| ID | Ce qui ne va pas |
|----|------------------|
| C1_Q22 | Énoncé : pont limité à **3,5 t** ; le panneau affiche **3 t**. |
| C1_Q35 | Question = énumérer les **quatre équipements obligatoires** ; image = coffre **fermé** vu de l'extérieur. |
| C2_Q3 | Énoncé : tunnel à **3,2 m** ; le panneau affiche **4,20**. |
| C2_Q34 | Réponse = « **non**, pas de ceinture en marche arrière » ; le conducteur **la porte**, et la sangle est dessinée n'importe comment. |
| C2_Q42 | Énoncé : **15 ans**, 1,30 m ; l'image montre un enfant de 7-8 ans. L'âge est le cœur de la question. |
| C2_Q79 | Énoncé : tunnel à **3,5 m** ; le panneau affiche **3,6**. |
| C3_Q7 | Question sur la **reconnaissance des logos** au tableau de bord ; image entièrement **floue**. |
| C3_Q8 | « À quoi ressemble le logo des feux de route ? » ; image encore plus floue. |
| C3_Q24 | Schéma surchargé : deux flèches, deux pastilles numérotées, une ampoule barrée — **cinq éléments graphiques ajoutés qui donnent la réponse**, contre la spec (« un seul repère, aucun mot »). |

### ⚠️ Faibles (29)

**Chiffre ou détail de l'énoncé non respecté**
C1_Q20 (4 personnes pour un calcul à 2) · C1_PROV_2 (horloge à ~5 h pour un énoncé à 23 h) ·
C3_Q14 (« vous oubliez d'allumer » mais les feux sont allumés)

**Élément du sujet absent du cadre**
C1_Q52 (aucun gilet) · C2_Q39 (aucune femme enceinte parmi « ces personnes ») · C2_Q48 (vignette
d'homologation **vide**) · C3_Q2 et C3_Q4 (aucun témoin de feux) · C3_Q28 (feux **arrière** de brouillard,
véhicule photographié de face) · C3_Q63 (question sur la clé, contact hors champ) · C1_Q6 (certificat
entièrement brouillé) · C1_Q33 (volet droit du diptyque vide)

**Comportement montré contraire à la bonne pratique**
C1_Q37 (côté circulation) · C2_Q29 (appui-tête trop bas alors que la réponse décrit la bonne position)

**Rendu / physique irréaliste — la série « planches »**
C2_Q9 · C2_Q15 · C2_Q83 · C2_CHG_2 · C2_CHG_4 : le bois **traverse la carrosserie** au lieu de sortir du
coffre, et l'angle de face empêche de lire un dépassement de longueur.

**Élément graphique ajouté interdit par la spec**
C3_Q17 et C3_Q18 (ampoule barrée posée sur la scène : donne la réponse) · C3_Q70 (traits de « son »
autour du klaxon) · C2_Q25 (badge posé au centre du volant au lieu d'un coin)

**Livrée / cohérence**
C3_Q53, C3_Q54, C3_Q55 (bus scolaire **jaune américain**, alors que B1_Q54 montre la livrée belge correcte ;
Q54 et Q55 se ressemblent trop pour opposer warnings et clignotant) · C2_Q12 et C2_Q22 (réponse
« pas seulement les camions », mais seul un autocar est montré — cf. C2_Q23, qui fait bien avec une caravane) ·
C2_Q19 (tapis **roulé** comme exemple de charge « ni pliable ni rétractable »)

### Ce qui marche très bien dans le thème C

- **C2_Q55** : le schéma vu du dessus des angles morts, **sans un seul mot**. Modèle du « rendu 2 » de la spec.
- **C1_Q5** : deux voitures identiques, l'une avec le « L », l'autre sans — la comparaison **est** l'image.
- **C1_Q44** : originaux papier **et** certificat d'assurance sur téléphone dans le même cadre.
- **C1_Q39**, **C1_Q40**, **C2_Q35**, **C2_Q36**, **C2_Q37** : police « Police/Politie », taxi, bpost, ambulance —
  les livrées belges sont excellentes quand elles sont demandées.
- **C1_PROV_1** : la voiture au « L » **garée** de nuit — la règle dite par l'immobilité.
- **C2_Q45** : le témoin d'airbag **ON** au tableau de bord, détail décisif d'une situation interdite.
- **C1_Q30** : le manomètre d'extincteur tombé dans le rouge. **C1_Q36** : deux fautes comptables à l'image.
- **C3_Q36/Q37**, **C3_Q39/Q43**, **C3_Q29/Q30** : les paires opposées avant/arrière, ville/campagne,
  brouillard/pluie. C'est le procédé le plus efficace du corpus.
- **C3_Q59 à C3_Q66** : toute la série tunnel (lunettes retirées, œil fermé, évacuation, fumées) est réussie.

---

## Thème D — 109 images vues — TERMINÉ

**Bilan : 79 ✅ · 28 ⚠️ · 2 ❌**

### ❌ À refaire (2)

| ID | Ce qui ne va pas |
|----|------------------|
| D1_Q7 | Énoncé « **à Bruxelles** » ; image = route de montagne boisée en pleine nature. (Ce paysage est celui qui manque à D1_Q6, « en Wallonie ».) |
| D1_Q67 | Énoncé « **en agglomération** » (dépassement de 25 km/h) ; image = autoroute. Contradiction directe. |

### ⚠️ Faibles (28)

**Le défaut dominant du thème : la vue conducteur interchangeable.**
D1_Q40, D1_Q41, D1_Q50, D1_Q53, D1_Q54, D1_Q55, D1_Q59, D1_Q65, D1_Q66 — neuf questions différentes
(retrait immédiat, déchéance, seuils, durées) partagent pratiquement **une seule image** : pare-brise,
autoroute vide, compteur flou et illisible. Aucune ne dit quoi que ce soit de la question posée, alors que
D1_Q60, D1_Q62, D1_Q63, D1_Q64 montrent exactement comment faire (tribunal belge, policier + marteau
du juge côte à côte).

**Repère régional absent ou faux**
D1_Q6 (paysage flamand pour « en Wallonie ») · D1_Q10 (décor bruxellois pour « en Flandre ») ·
D1_Q11 (rien de wallon ; Q10, Q11 et Q12 sont interchangeables alors que les trois réponses diffèrent)

**Élément de l'énoncé absent**
D1_Q14 (pas de F99) · D1_Q17 (pas de panneau « abords d'école ») · D1_Q18 (aucun véhicule alors qu'on est
« autorisé à circuler ») · D1_Q20 (pas de signal A14) · D1_Q26 (ni zone résidentielle ni zone 30 lisibles) ·
D1_Q44 et D2_Q22 (aucune zone 30) · D1_Q53 (pas de F9 ; panneau bleu vide) · D1_Q2 (rien n'évoque la lenteur) ·
D2_Q4 (aucun point fixe pour la règle des 2 secondes — cf. D2_Q5, parfaite) · D2_Q27 (aucun des quatre
facteurs cités) · D2_Q33 (panne moteur au lieu de météo/pneus/voirie/poids/freins)

**Comparaison annoncée mais non montrée**
D2_Q36 et D2_Q43 (une seule chaussée sèche pour une question qui oppose sec et mouillé — cf. D2_Q13,
triptyque parfait)

**Contenu incorrect**
D2_Q39 : le schéma de la distance d'arrêt est **inversé** — le segment de réaction part de l'obstacle
au lieu du véhicule. Un élève qui le lit apprend l'inverse.
D2_Q25 : question sur les **stupéfiants**, image d'un **bâillement** (= fatigue), identique à D2_Q29.
D1_Q47 : image quasi identique à D1_Q46 alors que les deux questions s'opposent (qui décide / qui exécute).
D2_Q15 : surprise très caricaturale, pied encore sur l'accélérateur.

### Ce qui marche très bien dans le thème D

- **D1_Q29** (planche de 4 vignettes pour un classement) et **D2_Q13** (triptyque sec/mouillé/enneigé) :
  le meilleur traitement possible d'une question de comparaison.
- **D1_Q63 / D1_Q64** : policier **et** marteau du juge dans le même cadre — la question oppose deux
  autorités, l'image les met côte à côte.
- **D1_Q82** : les trois panneaux superposés (60, interdiction de dépasser, « 200 m ») tous lisibles.
- **D1_Q13** (F12a zone résidentielle) et **D1_Q19** (« Zone cyclable » en toutes lettres) : les panneaux
  qui manquaient au thème A sont ici parfaitement rendus.
- **D2_Q47 / D2_Q48 / D2_Q49** : témoin ABS net, **traces de freinage discontinues** (signature réelle de
  l'ABS), braquage d'évitement. Précision technique remarquable.
- **D2_Q45** : le flou sur le visage pour dire l'alcool, la main nette sur le volant.
- **D2_Q55/Q56** et **D2_Q57/Q58** : deux paires de macros de pneus, usure et témoins.
- **D2_Q60** : voiture chargée **et** gonflage — les deux termes de l'énoncé en une image.
- **D2_Q68** : les trois gestes de la réponse (sortir, s'étirer, s'hydrater) au même instant.
- **D2_Q66/Q67** : l'horloge de bord et l'horloge de l'aire, pour des questions de durée.

---

## Thème E — 130 images vues — TERMINÉ

**Bilan : 98 ✅ · 29 ⚠️ · 3 ❌**

### ❌ À refaire (3)

| ID | Ce qui ne va pas |
|----|------------------|
| E1_Q29 | Question sur les **trois variantes** du signal de rétrécissement ; l'image montre **un triangle vide et flou**, sans pictogramme. Rien n'est identifiable. |
| E2_Q02 | Réponse « **par la gauche** » ; l'image montre le dépasseur **à droite** du véhicule doublé, sur une route à double sens. Enseigne le contraire. |
| E2_Q45 | La question repose sur l'existence d'un **refuge surélevé** ; image quasi identique à E2_Q44, passager descendant **sur la chaussée**, aucun refuge. La réponse devient incompréhensible. |

### ⚠️ Faibles (29)

**Configuration de route non conforme à l'énoncé**
E1_Q2 (une bande par sens pour « 2×2 ») · E2_Q51 et E2_Q58 (deux chaussées à berme pour « une chaussée
à deux sens ») · E3_Q02 (autoroute à berme pour une ligne axiale) · E3_Q40 (route ordinaire au lieu d'une
chaussée en bandes)

**Croisement / dépassement confondus**
E2_Q32 (même sens alors que l'énoncé dit croiser) · E2_Q41 et E2_Q43 (tram **en face** alors qu'il s'agit
de le dépasser) · E1_Q18 (passage par la droite pour une question sur la gauche)

**La série « tripler » (E3_Q52, E3_Q53, E3_Q55)** : les trois véhicules sont **stationnés le long du
trottoir**, immobiles, alors que la manœuvre suppose trois véhicules en mouvement. À refaire ensemble.

**Élément du sujet absent**
E1_Q7 (pas de marquage de bande suggérée) · E1_Q54 (pas de cycliste à contresens) · E2_Q9 (route d'en face
vide pour « un véhicule arrive-t-il ? ») · E2_Q12 (aucun signal d'interdiction) · E2_Q53 (feux verts ronds
au lieu de croix rouge / flèche verte / flèche orange) · E3_Q4 (pas de propriété à gauche) ·
E3_Q22 (pas de panneau C39 — cf. E3_Q23/Q24, parfaits) · E3_Q45 (un seul cas montré pour une comparaison)

**Détail qui contredit la réponse**
E2_Q20 (clignotant **allumé** alors que la réponse est « vous l'éteignez ») · E2_Q38 (le dépasseur franchit
déjà la ligne de bord, ce que la réponse interdit) · E3_Q9 (véhicule arrivant en face alors que la réponse
est « oui, vous pouvez dépasser »)

**Repère régional / rendu**
E1_Q12 (campagne pour « en agglomération ») · E1_Q1 (« L » peint sur le **toit** de la voiture) ·
E1_Q25 (flèches au sol pointant vers le conducteur) · E2_Q5 (sens de dépassement ambigu dans les deux
volets) · E2_Q65 et E2_Q68 (compteur lisible affichant **23** et **08**, chiffres sans rapport avec la question)

### Ce qui marche très bien dans le thème E

- **Les diptyques** sont la grande réussite du thème : E1_Q68 (ville/campagne, même cycliste, même écart),
  E2_Q16 (sens unique / 3 bandes), E2_Q35, E2_Q48 (les deux cas de dépassement par la droite), E2_Q62
  (dense/fluide). Quand la question compare, l'image compare.
- **Les paires de questions voisines** : E1_Q30/Q31 (obstacle de mon côté / du sien), E3_Q6/Q8 (double ligne
  mixte inversée), E3_Q19/Q20 (moto devant / moto derrière), E3_Q31/Q32 (passage à niveau sans / avec
  barrières), E3_Q36/Q38 (moto / trottinette au même carrefour), E3_Q42/Q43 (virage fermé / ouvert).
- **E3_Q15** : le cycliste tend le bras gauche **et** la voiture le double par la droite — les deux moitiés
  de la question dans un seul cadre.
- **E3_Q28** : sous le panneau, quatre catégories d'usagers visibles, l'élève trie lui-même.
- **E3_Q33** : le feu **blanc lunaire** du passage à niveau, détail rare et juste.
- **E3_Q62** : virage encaissé + brouillard — « on ne voit pas assez loin » est littéralement à l'image.
- **E1_Q4**, **E3_Q1**, **E3_Q9**, **E3_Q10** : les cadrages au ras du sol sur le marquage. Quand la question
  porte sur une ligne, c'est la ligne qu'il faut photographier.
- **E2_Q42** : le chantier qui **bloque physiquement** le passage à droite du tram — la condition de
  l'exception est démontrée, pas énoncée.

---

## Thème F — 260 images vues — TERMINÉ

**Bilan : 183 ✅ · 57 ⚠️ · 20 ❌**

### ❌ À refaire (20)

**Les schémas qui donnent la réponse** (cause unique : le générateur l'autorisait — voir plus bas)
F4_Q9, F4_Q10, F4_Q11 (deux flèches + une **croix rouge** ; sur Q11 la croix dit « non » alors que la
réponse est **oui**) · F5_Q6 (lettres « A » et « B » + les deux trajectoires tracées) ·
F5_Q52 (voitures numérotées 1-2-3-4 + flèches : l'ordre d'insertion **est** la réponse)

**Signal faux**
F1_Q31 et F1_Q33 (la réponse est le **C3**, disque rond blanc à bordure rouge ; l'image montre un
**triangle B1**) · F2_Q68 et F2_Q69 (les signaux de transport en commun sont **intervertis** : le triangle
pointe-en-bas et la barre horizontale sont chacun sur la mauvaise question) · F1_Q11 (le mouvement rotatif
« accélérez » est représenté par la même pose figée que le mouvement vertical « ralentissez » de F1_Q10)

**Fichiers intervertis**
F1_Q20 et F1_Q21 (l'image du piéton arrêté par l'agent est sur la question de la voiture à déplacer, et
inversement) · F1_Q18 (bras vertical au lieu d'horizontal, et pas de piéton)

**Élément central absent**
F1_Q48 (panneau « 70 » flou et illisible) · F2_Q9 (aucun feu dans une question sur le feu orange) ·
F4_Q35 (carrefour vide alors qu'une voiture doit venir de droite) · F4_Q26 (ni bande cyclable suggérée
ni cycliste) · F4_Q14 (question sur un geste de la main / un appel de phares, illustrée par un schéma
vu du ciel où l'on ne voit aucun occupant)

**Rendu raté**
F4_Q15 (schéma grossier, format vertical, proportions fausses, rupture totale de style avec F4_Q4) ·
F4_Q20 (panneaux **couchés à plat sur l'herbe** dans une vue du dessus, et ce n'est pas le bon panneau)

### ⚠️ Faibles (57) — les familles

**Le clignotant manquant** (l'intention de tourner ou de changer de bande ne se lit pas)
F5_Q4, F5_Q8, F5_Q9, F5_Q55

**Situation contredite par l'image**
F2_Q20 (« vous ne pouvez plus freiner » alors que la voiture freine) · F2_Q23 (« aucun signal de priorité »
alors que des dents de requin sont peintes au sol) · F2_Q45 (« vous êtes dans le carrefour » alors que la
voiture est en amont) · F5_Q15 et F5_Q20 (position du véhicule contraire à celle décrite) · F6_Q14
(dépassement par la droite pour un énoncé « par la gauche ») · F6_Q21 (obstacle et site franchissable
inversés) · F2_Q59 (infraction non commise) · F1_Q4 (agent vu de dos pour « face à son ventre »)

**Sujet de la question absent du cadre**
F1_Q13 (pas de sifflet) · F1_Q53 (feu tricolore ordinaire au lieu des feux de bande) · F1_Q54 (panneau B22
brouillé) · F2_Q7 et F2_Q8 (sas cycliste sans feu) · F2_Q67 et F2_Q70 (mauvais signal de transport en commun) ·
F3_Q9 (pas de panneau de fin de voie prioritaire) · F3_Q19 (panonceau sans le losange B9 au-dessus) ·
F3_Q51 et F3_Q54 (aucun cycliste, pas de triangle inversé) · F4_Q23 et F4_Q25 (aucun cycliste) ·
F5_Q7 (flèches au sol fantaisistes, aucun véhicule) · F5_Q10 (aucun piéton) · F5_Q47 (aucune raison de
prudence particulière) · F6_Q19 et F6_Q45 (aucun véhicule arrêté sur le site / la bande bus) ·
F1_Q60 (pas d'accident, et l'homme marche côté circulation sans gilet)

**Comparaison annoncée mais non montrée**
F1_Q12 (un seul des deux mouvements) · F2_Q26 (les deux feux ont le jaune au même endroit : la différence
fixe / clignotant ne se voit pas) · F5_Q54 (diptyque moitié photo / moitié schéma, et pas de rétrécissement
à droite) · F5_Q53 (zébras présents dans une scène « sans bandes tracées »)

**Badge et éléments ajoutés hors spec**
F4_Q16 (badge au milieu du bas de l'image) · F6_Q29 et F6_Q32 (badge **jaune vif** au lieu de blanc à
liseré gris) · F6_Q47 (flèche blanche incrustée sur la chaussée) · F4_Q7, F4_Q12, F4_Q13 (deux flèches
là où la spec en autorise une)

**Détail réglementaire faux**
F6_Q43 (le panneau porte son code « **F17** » écrit dessus — cela n'existe pas) · F2_Q16 (jaune clignotant
au milieu au lieu d'en dessous) · F2_Q28 et F2_Q31 (pictogramme vélo **sans flèche** au lieu du B23/B22) ·
F1_Q15 et F1_Q16 (ordre verbal illustré par un sifflet ; main à mi-hauteur au lieu du bras vertical) ·
F1_Q19 et F1_Q22 (contenu décalé d'une question) · F3_Q23 (voie transversale occupée alors qu'elle est
dite libre) · F4_Q39 (piste cyclable au lieu d'une bande suggérée) · F4_Q49 (sortie d'allée au lieu d'un
déboîtement depuis une place de stationnement)

### Ce qui marche très bien dans le thème F

C'est le thème le plus réussi du corpus dès qu'il s'agit de **photographie**.

- **Les deux acteurs opposés dans le même cadre** : F1_Q30 (policier / personne autorisée), F1_Q63
  (pompier / policier), F1_Q45 (agent + feu + panneau, les trois niveaux de la hiérarchie), F1_Q46,
  F1_Q47, F1_Q49 (l'agent qui arrête une ambulance), F6_Q41 (agent **et** feu rouge), F6_Q63
  (bus De Lijn / autocar touristique côte à côte), F2_Q18 (les deux feux jaunes, position basse et centrale),
  F2_Q39, F3_Q24 (B1 et STOP), F2_Q48.
- **Les paires de questions voisines** : F6_Q59/Q61 (bus de ligne / autocar), F6_Q59/Q64 (agglomération /
  campagne), F6_Q53/Q54 (arrêt / stationnement), F2_Q15/Q17/Q22 (jaune en bas, quatre optiques, jaune central),
  F3_Q13/Q14, F3_Q46/Q47 (sans / avec clignotant), F3_Q31/Q32.
- **Le cadrage au ras du sol sur le marquage** : F3_Q25 (dents de requin), F6_Q24 (damier), F6_Q49, F3_Q34 et
  F3_Q38 (la roue avant exactement à la ligne d'arrêt).
- **Le geste isolé** : F5_Q23 (les yeux du conducteur dans le rétroviseur), F5_Q24 (tête tournée), F5_Q25
  (macro du clignotant), F5_Q28 (il regarde le miroir **mais pas** l'angle mort — l'oubli est visible),
  F5_Q46 (tête par la vitre pour reculer), F1_Q29 et F1_Q62 (mains vides = ne peut pas verbaliser).
- **Les livrées belges** : « Police / Politie », ambulance jaune à damier avec « AMBULANCE » en miroir,
  bus et trams De Lijn avec girouettes crédibles (« 7 Mortsel », « 22 Boechout »), poteau d'arrêt jaune,
  panneau F18, mot « BUS » au sol. F6_Q27 est la meilleure image du corpus sur ce plan.
- **Le moment juste** : F6_Q12 (barrières saisies **à mi-course**), F1_Q8 (une voiture passe en flou pendant
  qu'une autre est arrêtée), F6_Q1 (la longueur du convoi dit la distance de freinage).

---

# CONCLUSION GÉNÉRALE

## Les chiffres

| Thème | Images | ✅ | ⚠️ | ❌ |
|-------|-------:|---:|---:|---:|
| A — La voie publique | 282 | 222 | 43 | 17 |
| B — Usagers | 73 | 56 | 10 | 7 |
| C — Le véhicule | 164 | 126 | 29 | 9 |
| D — Vitesse et distances | 109 | 79 | 28 | 2 |
| E — Croiser et dépasser | 130 | 98 | 29 | 3 |
| F — Priorité et signalisation | 260 | 183 | 57 | 20 |
| G — Panneaux | 47 | 36 | 6 | 5 |
| **Total** | **1065** | **800** | **202** | **63** |

**75 % des images sont bonnes.** 6 % sont à refaire. Les 19 % restants sont utilisables :
ils privent l'élève d'un appui, ils ne le trompent pas.

> Le thème G avait été audité avant les autres, avec une méthode plus sévère et une lecture
> erronée de la série « excepté circulation locale ». Il a été **entièrement revérifié** :
> 36 ✅ · 6 ⚠️ · 5 ❌, et non 27/10/10 comme annoncé dans la première version de ce rapport.
> Les cinq images de la série G1_Q16-Q21 sont en réalité bonnes : la scène y porte le sens
> (le cabinet du dentiste, le livreur, le raccourci, la voiture-école) sans dépendre du texte
> du panonceau. C'est exactement la parade à retenir pour tout panonceau à texte long.
>
> **Les 5 ❌ du thème G** : G1_Q3 (véhicule en face sur la même chaussée alors que la réponse
> dit qu'il vient d'une autre rue à sens unique) · G1_Q31 et G1_Q38 (le panneau montre une
> **voiture** au lieu d'une moto avec side-car, et une **ligne jaune** au sol sur G1_Q31) ·
> G2_Q6 et G2_Q10 (questions de comparaison illustrées par un seul cas).
> **Les 6 ⚠️** : G1_Q16 (rue vide, panonceau illisible) · G1_Q30 (aucun des usagers encore
> autorisés) · G1_Q45 (mention « ZONE » absente) · G2_Q13 (panonceau avec deux vélos dessinés
> au lieu de la mention écrite) · G2_Q40 et G2_Q41 (aucun véhicule arrêté ni garé sur l'îlot).

Les 548 images de théorie n'ont pas encore été auditées.

## Les six causes, par ordre d'importance

**1. L'élément nommé par l'énoncé n'est pas dans l'image** — de loin la première cause, environ la moitié
des défauts. Un sas cycliste sans feu, une question sur un cycliste sans cycliste, « vous voyez le panneau
abords d'école » sans panneau, « une voiture vient de droite » devant un carrefour vide.

**2. L'image contredit la bonne réponse.** La plus grave, parce qu'elle enseigne le faux. Le cas type est le
casque du thème B : six images où la réponse est « il faut un casque » et où l'homme est tête nue. Idem
C2_Q34 (ceinture portée alors que la réponse est « non »), F4_Q11 (croix rouge alors que la réponse est
« oui »), A5_Q18 (berme présente alors que l'énoncé dit « sans berme »).

**3. Le schéma qui donne la réponse.** Cause unique et purement technique : `build-plan.js` **prescrivait**
au modèle « schéma » d'utiliser des flèches vertes et rouges (« vert = passe, rouge = doit céder ») et des
chiffres d'ordre de passage. Or, sur une question de priorité, c'est exactement la réponse. **Corrigé ce
soir dans le générateur.**

**4. Le chiffre qui ne correspond pas.** Un pont à 3 t pour un énoncé à 3,5 t, un tunnel à 4,20 m pour un
énoncé à 3,2 m, une horloge à 5 h pour un énoncé à 23 h. Quatre occurrences, toutes fatales à la question.

**5. Le décor régional interchangeable.** Les trois questions « Flandre / Wallonie / Bruxelles » ont trois
réponses différentes et parfois trois images identiques, voire inversées (une route de montagne pour
« à Bruxelles »).

**6. Le texte long ne se rend pas.** Les chiffres et les mots courts sortent parfaitement (« BUS »,
« 3,5t », « SMOG 90 », « 200 m », « 7 Mortsel », « BRUXELLES / NAMUR / LIÈGE »). Les phrases, jamais :
toute la série « excepté circulation locale » du thème G est illisible. La parade n'est pas d'insister sur
le texte, c'est de faire porter le sens par la **scène** (le livreur, le riverain, le raccourci).

## Ce qui marche, et qu'il faut systématiser

Un procédé revient dans presque toutes les images réussies : **l'image contient la situation, pas la
solution, et elle contient la situation en entier.**

- **Quand la question compare, l'image compare** — les deux panneaux côte à côte, le diptyque
  ville / campagne, la paire de questions voisines où une seule variable change (A5_Q54, D1_Q29, D2_Q13,
  E1_Q68, F1_Q30, F2_Q18, F6_Q63).
- **Quand la question porte sur un marquage, on photographie le marquage** au ras du sol (F3_Q25, F6_Q24,
  E1_Q4, D2_Q57).
- **Quand la question porte sur un geste, on cadre le geste** (F5_Q23, F5_Q25, C3_Q61, D2_Q68).
- **Le point de vue peut porter le sens** : A5_Q25 vue par la lunette arrière = « vous gênez » ;
  F5_Q28 le regard au miroir sans la tête tournée = l'oubli de l'angle mort ; A4_Q52 le flou de mouvement
  d'une file et pas de l'autre.
- **Un détail technique juste vaut mieux qu'un décor** : le manomètre d'extincteur dans le rouge,
  les traces de freinage discontinues de l'ABS, le témoin d'airbag sur ON, la borne kilométrique A12.

## Ce qui a été corrigé cette nuit

**`tools/images/build-plan.js`** — trois modifications de fond, qui s'appliquent à **toutes** les images
encore à produire (208 au plan actuel, plus les 566 de H et I et les 340 de AM) :

1. Le modèle « schéma » n'a plus le droit d'ajouter des lettres, des chiffres d'ordre, des flèches
   vertes ou rouges, des croix ni des coches. Une flèche neutre par véhicule, uniquement pour lever une
   ambiguïté de direction, sinon rien et un badge « ? ».
2. Un bloc **CONTRÔLE AVANT DE GÉNÉRER** ajouté aux trois modèles : tout ce que la scène nomme doit être
   visible ; l'image ne dit ni ne contredit jamais la réponse ; une question qui compare exige les deux
   termes dans le cadre ; un chiffre écrit doit être exactement celui de l'énoncé ; les repères régionaux
   belges sont définis.
3. Des règles de cohérence tirées des défauts constatés : casque du motard, gilet et position derrière la
   glissière, clignotant du bon côté, panneau net et sans son code écrit dessus, livrées belges,
   badge blanc à liseré gris **dans un coin** et jamais chiffré.

**`tools/images/scenes/a-refaire.json`** — les **63 scènes réécrites** des images fausses.

**`tools/images/scenes/a-ameliorer.json`** — les **202 scènes réécrites** des images faibles.

**`tools/images/reprendre.js`** — applique ces scènes et remet les questions dans le plan de
génération, **thème par thème**. Simulation par défaut ; `--write` applique.

> Depuis l'audit de la théorie, ce script traite les deux volets et respecte l'ordre de travail retenu :
> dans chaque thème, **la théorie d'abord, puis les questions**. `build-plan.js` range le plan dans ce
> même ordre, donc `atelier.js` le suit sans rien changer. Voir `audit-images-theorie.md`.

### Vérifications faites sur des sources réelles

Quatre points ont été vérifiés avant d'écrire les scènes, plutôt que supposés :

- **A7a / A7b / A7c** — a : rétrécissement des deux côtés ; b : par la gauche ; c : par la droite.
- **Signaux de transport en commun** — barre horizontale = rouge ; **triangle pointe en bas = vert** ;
  cercle = orange fixe ; barre verticale = tout droit. F2_Q68 et F2_Q69 étaient bien intervertis.
- **Bande réservée aux heures de pointe** — elle n'est **pas** délimitée par une ligne à barreaux
  transversaux mais par des **traits longs et très rapprochés**. La scène A4_Q44 écrite la veille
  décrivait une « ligne striée » inexistante : elle a été corrigée.
- **B22 / B23** — petits panneaux triangulaires à bordure rouge, vélo + flèche (coudée à droite pour le
  B22, verticale pour le B23), placés **sous** le feu. Un vélo seul, sans flèche, ne suffit pas.

## Ce qu'il reste à faire

1. **Thème A d'abord**, puis B, C, D, E, F, G, dans l'ordre, et **dans chaque thème la théorie avant
   les questions** : `node tools/images/reprendre.js A --write` → `node tools/images/build-plan.js` →
   `node tools/images/atelier.js loop`.
   **À lancer juste avant une session de génération** : le script retire l'illustration actuelle des
   questions visées, qui resteront sans image en attendant la nouvelle. D'où l'intérêt d'y aller
   thème par thème plutôt que tout d'un coup.

   | Thème | À refaire | À améliorer | Images à reproduire |
   |-------|----------:|------------:|--------------------:|
   | A | 17 | 43 | 60 |
   | B | 7 | 10 | 17 |
   | C | 9 | 29 | 38 |
   | D | 2 | 28 | 30 |
   | E | 3 | 29 | 32 |
   | F | 20 | 57 | 77 |
   | G | 5 | 6 | 11 |
   | **Total** | **63** | **202** | **265** |

2. Auditer les **548 images de théorie**, jamais examinées.
3. Produire les images manquantes : 208 au plan, puis H et I, puis AM.
