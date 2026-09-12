# Audit des images de questions — permis B

1065 images, une par question. Passe automatique sur la totalité, plus une revue visuelle par échantillon.

## 1. Ce qui est sain

- 1065 questions avec image, 1065 fichiers : **aucune image manquante, aucune orpheline**
- aucune image partagée entre deux questions, sauf les 4 doublons ci-dessous
- le poids du fichier n'est pas un indice de qualité : les plus légères (brouillard, nuit) comptent parmi les meilleures

## 2. Badge « ? » incrusté — 150 images (14 %)

Un petit disque portant un point d'interrogation est cuit dans le fichier image. Il vient de l'outil de génération,
pas du site. Trois habillages repérés : disque blanc, disque sombre, petit disque à liseré jaune.

Répartition : thème B = 3  |  thème C = 23  |  thème D = 20  |  thème E = 40  |  thème F = 41  |  thème G = 23

Détection stricte, aucun faux positif sur les témoins vérifiés à l'œil. Quelques variantes échappent encore
au détecteur (F3_Q59 et F6_Q41 repérés visuellement) : le nombre réel est donc un peu au-dessus de 150.

### Liste complète

    B1_Q4  B1_Q42  B1_Q51  C1_PROV_1  C1_Q16  C1_Q17
    C1_Q20  C1_Q21  C1_Q3  C1_Q49  C1_Q8  C2_Q19
    C2_Q26  C2_Q39  C3_Q2  C3_Q32  C3_Q39  C3_Q4
    C3_Q40  C3_Q46  C3_Q58  C3_Q67  C3_Q68  C3_Q7
    C3_Q74  C3_Q8  D1_DEG_2  D1_Q59  D1_Q66  D2_Q1
    D2_Q19  D2_Q2  D2_Q21  D2_Q22  D2_Q24  D2_Q26
    D2_Q36  D2_Q38  D2_Q40  D2_Q42  D2_Q44  D2_Q51
    D2_Q56  D2_Q66  D2_Q7  D2_Q8  E1_Q11  E1_Q13
    E1_Q18  E1_Q20  E1_Q22  E1_Q29  E1_Q43  E1_Q48
    E1_Q68  E2_Q11  E2_Q13  E2_Q15  E2_Q16  E2_Q17
    E2_Q24  E2_Q25  E2_Q29  E2_Q30  E2_Q31  E2_Q32
    E2_Q33  E2_Q35  E2_Q42  E2_Q48  E2_Q50  E2_Q53
    E2_Q54  E2_Q56  E2_Q61  E2_Q62  E2_Q64  E2_Q65
    E2_Q67  E2_Q68  E2_Q7  E2_Q9  E3_Q18  E3_Q25
    E3_Q28  E3_Q31  F1_Q10  F1_Q11  F1_Q12  F1_Q13
    F1_Q14  F1_Q20  F1_Q23  F1_Q29  F1_Q30  F1_Q32
    F1_Q46  F1_Q48  F1_Q53  F1_Q54  F1_Q63  F1_Q7
    F2_Q17  F2_Q26  F2_Q5  F2_Q50  F2_Q6  F2_Q65
    F3_Q24  F3_Q51  F4_Q33  F4_Q34  F4_Q35  F4_Q56
    F5_Q1  F5_Q10  F5_Q11  F5_Q12  F5_Q20  F5_Q21
    F5_Q26  F5_Q28  F5_Q3  F5_Q33  F5_Q35  F5_Q38
    F5_Q49  G1_Q11  G1_Q12  G1_Q17  G1_Q18  G1_Q20
    G1_Q21  G1_Q26  G1_Q27  G1_Q29  G1_Q30  G1_Q42
    G1_Q43  G1_Q44  G1_Q46  G1_Q49  G1_Q55  G2_Q2
    G2_Q37  G2_Q39  G2_Q4  G2_Q40  G2_Q41  G2_Q44

## 3. Images identiques sur deux questions différentes — 4 cas

Toutes dans la leçon A4, un copier-coller pendant cette série. Dans chaque paire, l'image ne convient qu'à une seule.

- **A4_Q41** = **A4_Q63**
  - A4_Q41 : Pouvez-vous vous réfugier sur la bande d'arrêt d'urgence face à un conducteur fantôme ?
  - A4_Q63 : Quelle est la différence entre la bande d'accès et une bande qui se réduit sur autoroute ?
- **A4_Q50** = **A4_Q64**
  - A4_Q50 : Vous restez inutilement sur la voie du milieu sur autoroute. Est-ce une infraction ?
  - A4_Q64 : Quand devez-vous commencer à freiner pour quitter l'autoroute ?
- **A4_Q66** = **A4_Q67**
  - A4_Q66 : Vous avez raté votre sortie sur l'autoroute. Pouvez-vous faire marche arrière ?
  - A4_Q67 : Pouvez-vous vous garer sur la chaussée de l'autoroute ?
- **A4_Q69** = **A4_Q74**
  - A4_Q69 : Pouvez-vous circuler sur la berme centrale de l'autoroute ?
  - A4_Q74 : Pouvez-vous emprunter les raccordements transversaux entre les deux chaussées de l'autoroute ?

## 4. Défauts de contenu repérés à l'œil

- **G1_Q3** (grave) — L'image montre un panneau de sens unique ET une voiture arrivant de face sur la même rue : elle dépeint une infraction, alors que la réponse parle d'une autre rue à sens unique.
- **G1_Q16** (grave) — Le panneau additionnel porte du faux texte brouillé, alors que toute la question repose sur la mention « excepté circulation locale ».
- **G1_Q17** (grave) — Même texte illisible, plus le badge.
- **G1_Q20** (grave) — Même texte illisible, plus le badge.
- **G1_Q21** (moyen) — Le panneau additionnel est vide : la mention n'est pas lisible. Bonne mise en scène d'examen par ailleurs.
- **D2_Q39** (grave) — Schéma à deux barres rouge et orange sans légende : impossible de savoir laquelle est la réaction et laquelle le freinage.
- **A4_Q77** (grave) — La réponse attendue est « en vert » mais le panneau montré est majoritairement BLEU, avec un simple encart vert. Le panneau est en plus vide de toute destination.
- **E1_Q54** (grave) — La question porte sur des cyclistes en contresens : il n'y a aucun cycliste sur l'image, ni panneau de sens unique.
- **B1_Q21** (moyen) — La question vous met dans la peau d'un PIÉTON, l'image est prise depuis une VOITURE.
- **C1_Q8** (léger) — Voiture neuve en showroom : n'illustre pas qui fixe la MMA. Purement décorative.
- **A6_Q5** (léger) — Boulevard bruxellois sans aucun panneau de vitesse : n'aide pas à répondre 30 km/h.

## 6. Taux mesuré sur un échantillon aléatoire de 20 images

Tirage réparti sur les sept thèmes, sans choisir les cas suspects. Les 20 ont été regardées une par une.

| Constat | Nombre | Taux |
|---|---|---|
| Image juste et exploitable | 15 | 75 % |
| Défaut de contenu réel | 4 | 20 % |
| Image seulement décorative | 1 | 5 % |
| Badge « ? » présent | 6 | 30 % |

Les deux colonnes se recoupent : une image peut être juste et porter le badge.

**Ce que cela veut dire, ramené aux 1065 images :** de l'ordre de **200 à 250 images à régénérer** pour le
contenu, et **200 à 300** portant le badge — beaucoup étant les mêmes. Le détecteur automatique n'en trouve
que 150 : il rate les variantes sombres et les petits formats, l'échantillon le confirme (30 % vus à l'œil
contre 14 % détectés).

### Les quatre défauts de contenu de l'échantillon

- **E1_Q54** — la question porte sur des cyclistes en contresens : aucun cycliste sur l'image.
- **F4_Q35** — la question dit « une voiture vient de votre droite » : le carrefour est totalement vide.
- **A4_Q77** — la réponse est « en vert », le panneau montré est bleu avec un simple encart vert.
- **B1_Q21** — question posée du point de vue du piéton, image prise depuis le pare-brise.

Trois de ces quatre relèvent du même défaut : **l'élément dont parle la question est absent de l'image.**
C'est le point le plus rentable à corriger dans les prompts.

## 8. Thème G — revue complète des 47 images

Premier thème passé intégralement, une image après l'autre.

| Constat | Nombre | Taux |
|---|---|---|
| Badge « ? » incrusté | 22 | 47 % |
| Texte de panneau additionnel illisible ou vide | 5 | 11 % |
| Défaut de contenu | 5 | 11 % |
| **À régénérer (défauts cumulés déduits)** | **28** | **60 %** |
| Bonnes, à garder telles quelles | 19 | 40 % |

Le thème G est le plus atteint par le badge : il concentre à lui seul un cinquième des cas détectés
sur tout le corpus, alors qu'il ne pèse que 4 % des images. C'est probablement une série générée
d'affilée le même jour.

### Les 5 défauts de contenu

- **G1_Q3** — panneau de sens unique + voiture arrivant de face sur la même rue : l'image dépeint une infraction
- **G1_Q31** — la question compare le panneau « motos avec side-car » au panneau fusionné ; l'image montre un panneau voiture seule
- **G1_Q38** — la question parle d'un panneau interdisant les motos avec side-car ; le panneau montré ne représente qu'une voiture
- **G2_Q6** — comparaison incomplète : seule la flèche sur obstacle est montrée, pas le panneau de carrefour
- **G2_Q10** — la question porte sur la variété des orientations ; une seule orientation est montrée

### Les 5 panneaux additionnels illisibles

- **G1_Q16** — panneau additionnel en faux texte brouillé, alors que la question porte sur la mention
- **G1_Q17** — panneau additionnel illisible
- **G1_Q18** — panneau additionnel illisible
- **G1_Q20** — panneau additionnel illisible
- **G1_Q21** — panneau additionnel vide

Ces cinq forment une série continue (G1_Q16 à G1_Q21) : toutes les questions « excepté circulation
locale ». L'outil ne sait pas écrire cette mention. **Il faut la remplacer par un pictogramme** ou
accepter que la mention soit décrite dans l'énoncé plutôt que lue sur l'image.

### Les 22 images au badge

    G1_Q11  G1_Q12  G1_Q17  G1_Q18  G1_Q20  G1_Q21
    G1_Q26  G1_Q27  G1_Q29  G1_Q30  G1_Q42  G1_Q43
    G1_Q44  G1_Q46  G1_Q55  G2_Q2  G2_Q4  G2_Q37
    G2_Q39  G2_Q40  G2_Q41  G2_Q44

### Contrôle du détecteur automatique

Sur ce thème, le détecteur annonce 23 images au badge, j'en ai compté 22 à l'œil.
L'écart est d'une unité : **le détecteur est fiable**, la liste des 150 peut être utilisée telle quelle.

## 9. Règles pour les prochaines images

1. Contrôler la sortie de l'outil : le badge « ? » se colle dans un coin sans prévenir. Recadrer ou régénérer.
2. Ne jamais faire reposer une question sur du TEXTE dans l'image. Un chiffre court (3,5t, 200 m, 60) sort bien ; une phrase comme « excepté circulation locale » sort en lettres brouillées. Préférer un pictogramme.
3. L'élément central de la question doit être PRÉSENT sur l'image. Une question sur des cyclistes en contresens exige des cyclistes visibles.
4. Le point de vue doit correspondre à l'énoncé : question de piéton = image au niveau du piéton, pas depuis le pare-brise.
5. Pas de schéma sans légende. Si deux zones ont un sens différent, elles doivent être nommées sur l'image.
6. L'image doit permettre de répondre, pas seulement décorer. Question de vitesse : montrer le panneau. Question de définition : montrer la situation réelle.
7. Une image par question, jamais le même fichier pour deux énoncés.
