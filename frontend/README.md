# HealthAI Coach — Frontend

Interface React (Vite) conforme aux maquettes HealthAI Coach.

## Lancer le projet

```bash
cd frontend
npm install
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173).

## Parcours

1. **Connexion** (`/login`) — authentification locale (mock, sans backend).
2. **Inscription** (`/inscription`) — onboarding en 4 étapes : données, objectif, nutrition, sport.
3. **Dashboard** — Accueil, Scanner, Journal, Plans repas, Sport, Profil.

Les données sont persistées dans `localStorage` (clé `healthai_coach`).

## Charte graphique

| Usage | Couleur |
|-------|---------|
| Fond | `#F8F5F0` |
| Primaire | `#5BA5DF` |
| Hover / secondaire | `#3B82F6` |
| Texte | `#000` |
| Texte secondaire | `#6B7280` |
| Cartes / bordures | `#E5E7EB` |

**Polices :** Dosis (titres), Ubuntu (menu & corps).

## Stack

- React 19 + React Router
- Lucide React (icônes)
- Recharts (graphique journal)
- Données mockées côté client uniquement
