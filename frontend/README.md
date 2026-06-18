# HealthAI Coach — Frontend

Interface React (Vite) pour **web** et **mobile** (Capacitor Android/iOS) — même code, même charte graphique.

## Lancer le projet (web)

```bash
cd frontend
npm install
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173).

## Authentification

L'authentification est gérée côté client (web + mobile) avec :

- **Mots de passe hashés** (bcrypt, jamais stockés en clair)
- **Session persistante** 30 jours (localStorage web / Capacitor Preferences sur mobile)
- **Données par utilisateur** (profil, repas, plans…) liées au compte

### Inscription

1. `/inscription` — email, mot de passe (8 car. min., lettre + chiffre), onboarding 4 étapes
2. Compte créé à la fin du parcours

### Connexion

- `/login` — vérifie email + mot de passe hashé
- Session restaurée automatiquement au rechargement

### Profil (`/profil`)

- Modification des informations personnelles
- **Avatar** (upload / photo, redimensionné automatiquement)
- **Mode sombre** : Clair / Sombre / Système
- Changement de mot de passe

## Parcours

| Route | Page |
|-------|------|
| `/login` | Connexion |
| `/inscription` | Onboarding |
| `/` | Accueil |
| `/scanner` | Scanner repas |
| `/journal` | Journal nutritionnel |
| `/plans-repas` | Plans de repas |
| `/sport` | Programme sport |
| `/profil` | Profil & paramètres |

## Charte graphique

| Usage | Clair | Sombre |
|-------|-------|--------|
| Fond | `#F8F5F0` | `#1A1816` |
| Primaire | `#5BA5DF` | `#5BA5DF` |
| Texte | `#000` | `#F3F4F6` |
| Secondaire | `#6B7280` | `#9CA3AF` |
| Cartes | `#FFFFFF` | `#262320` |

**Polices :** Dosis (titres), Ubuntu (corps).

## Application mobile

Voir [docs/MOBILE.md](../docs/MOBILE.md).

```bash
npm run cap:sync
npm run cap:android   # Android Studio
npm run cap:ios       # Xcode (Mac)
```

Les fonctionnalités auth, profil, avatar et thème sombre sont **identiques** sur web et mobile.

## Configuration API (optionnel)

Copier `.env.example` vers `.env` pour pointer vers le backend FastAPI :

```
VITE_API_URL=http://localhost:8000
VITE_API_KEY=healthai
```

## Stack

- React 19 + React Router
- Capacitor 8 (Android & iOS)
- bcryptjs (hash mots de passe)
- Lucide React, Recharts
