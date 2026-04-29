# Design System MyPermiGo

## Règles d'utilisation des couleurs

### Mode Nuit (par défaut)
- `bg-night-bg-primary` : fond principal
- `bg-night-bg-secondary` : fond secondaire / sections
- `bg-night-card-primary` : cartes principales
- `bg-night-card-secondary` : cartes secondaires / hover states
- `text-night-text-primary` : texte principal
- `text-night-text-secondary` : texte secondaire / labels
- `text-night-text-disabled` : texte désactivé
- `text-night-brand` / `bg-night-brand` : couleur d'action principale (turquoise)
- `border-night-border-subtle` : bordures par défaut
- `border-night-border-active` : bordures actives / focus

### Mode Jour
- `bg-day-bg-primary` : fond principal
- `bg-day-card-primary` : cartes principales
- `text-day-text-primary` : texte principal
- `text-day-brand` / `bg-day-brand` : couleur d'action principale (teal)

## Règles strictes

| Couleur | Usage EXCLUSIF |
|---|---|
| `night-premium` `#FFC928` | Premium / essai gratuit UNIQUEMENT |
| `night-error` `#FF5B4A` | Erreurs / dangers UNIQUEMENT |
| `night-success` `#32D66B` | Réussite / progression UNIQUEMENT |
| `night-exam-orange` `#FF8A1E` | Examens UNIQUEMENT |
| `night-secondary` `#8B6DFF` | Avec parcimonie |

## Composants disponibles

### Card
```tsx
import { Card } from '@/components/ui/Card';

<Card variant="primary" padding="md">contenu</Card>
<Card variant="secondary" padding="lg">contenu</Card>
```

### Button
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md">Action</Button>
<Button variant="premium" size="lg" fullWidth>Premium</Button>
<Button variant="ghost" icon={<IconComponent />}>Retour</Button>
```
Variantes : `primary` | `premium` | `exam` | `danger` | `success` | `ghost`

### Badge
```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="premium">Premium</Badge>
<Badge variant="success">Réussi</Badge>
```
Variantes : `default` | `premium` | `success` | `error` | `info`

## Radius

| Token | Valeur | Usage |
|---|---|---|
| `sm` | 12px | Petits éléments, pills internes |
| `md` | 16px | Boutons, petites cartes |
| `lg` | 22px | Cartes, modales (`rounded-[22px]`) |
| `xl` | 24px | Grandes modales |
| `pill` | 999px | Boutons arrondis (`rounded-full`) |

## Shadows

- **Mode Nuit** : pas d'ombre douce (interface sombre), ombre medium = `0px 8px 24px rgba(0,0,0,0.3)`
- **Mode Jour** : ombre douce = `0px 4px 12px rgba(15,23,42,0.04)`, medium = `0px 12px 30px rgba(15,23,42,0.08)`

## Où sont définies les couleurs

- **TypeScript** : `src/styles/theme.ts` — référence pour le code JS/TS
- **Tailwind** : `src/app/globals.css` bloc `@theme` — génère les classes Tailwind
