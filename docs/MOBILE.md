# Application mobile HealthAI Coach

L'app mobile **Android** et **iOS** reprend le même frontend React (couleurs, pages, UX) et se connecte au **même backend** FastAPI via [Capacitor](https://capacitorjs.com/).

## Prérequis

| Plateforme | Outils |
|------------|--------|
| **Android** | [Android Studio](https://developer.android.com/studio), JDK 17+ |
| **iOS** | Mac avec [Xcode](https://developer.apple.com/xcode/) |
| **Commun** | Node.js 18+, backend lancé (`docker compose up` ou uvicorn) |

## Configuration API

Copie `.env.example` vers `.env` dans `frontend/` :

```bash
cd frontend
cp .env.example .env
```

| Contexte | `VITE_API_URL` |
|----------|----------------|
| Web local | `http://localhost:8000` |
| Émulateur Android | `http://10.0.2.2:8000` |
| Appareil physique | `http://<IP-de-ton-PC>:8000` |

Le backend accepte déjà les origines Capacitor (`https://localhost`, `capacitor://localhost`, etc.). Pour une IP locale, ajoute dans `.env` à la racine :

```
CORS_ORIGINS=http://192.168.1.XX:8000
```

## Build & lancement

```bash
cd frontend
npm install

# Synchroniser le build web vers les projets natifs
npm run cap:sync

# Ouvrir Android Studio
npm run cap:android

# Ouvrir Xcode (Mac uniquement)
npm run cap:ios
```

Lancer directement sur un appareil/émulateur :

```bash
npm run cap:run:android
npm run cap:run:ios
```

## Après modification du code React

```bash
npm run cap:sync
```

Puis relance l'app depuis Android Studio / Xcode.

## Spécificités mobile

- **Navigation** : barre du bas (6 onglets) + en-tête avec logo sur app native
- **Web** : sidebar classique inchangée
- **Scanner** : caméra native via `@capacitor/camera` sur Android/iOS
- **Charte graphique** : identique (beige `#F8F5F0`, bleu `#5BA5DF`, etc.)
- **Splash screen** : fond beige `#F8F5F0`

## Structure

```
frontend/
├── capacitor.config.json
├── android/          # Projet Android Studio
├── ios/              # Projet Xcode
└── src/              # Code React partagé web + mobile
```

## Publication

- **Android** : générer un AAB signé depuis Android Studio (Build → Generate Signed Bundle)
- **iOS** : archiver depuis Xcode (Product → Archive) puis soumettre sur App Store Connect
