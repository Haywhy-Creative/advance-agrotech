# FasalRakshak

English-only crop-health app with TensorFlow.js disease detection, Gemini assistance,
Open-Meteo weather, Cloudinary uploads, Firebase Auth/Firestore data, and Nigerian market
prices from [Opaindex](https://opaindex.com/data/) with a Firestore fallback.

Auth is Email/Password + Google. Profiles, scans, and price watchlists live in Firestore.
The Python FastAPI AI sidecar in `backend/ai_service/` is preserved and still handles the
on-device model predictions.

## Quick start

### 1. Frontend

```bash
cd fasalrakshak
npm run install-all              # installs frontend dependencies
cp frontend/.env.example frontend/.env.local
```

Fill in `frontend/.env.local`:

- **Required:** the six `VITE_FIREBASE_*` values from your Firebase web app.
- **Optional:** `VITE_GEMINI_API_KEY`, `VITE_CLOUDINARY_*`, `VITE_OPAINDEX_API_URL`,
  `VITE_AI_SERVICE_URL` (defaults to `http://localhost:8080`).

Never commit `.env.local`. `.env.example` contains placeholders only.

Enable **Email/Password** and **Google** sign-in providers in Firebase Authentication,
then publish [firestore.rules](firestore.rules):

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

Start the app:

```bash
npm run dev                      # Vite, http://localhost:5173
npm run build                    # production bundle in frontend/dist
npm run lint                     # ESLint
```

### 2. Python AI sidecar (for live crop/soil predictions)

```bash
cd backend/ai_service
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8080
```

On Windows you can also run `start_ai.bat`. The UI works without the sidecar for browsing;
detection calls fall back to Gemini/TensorFlow.js when the sidecar is offline.

### 3. Market price cache (optional fallback)

Opaindex is queried live at `GET /prices`, `GET /prices/:slug`, and
`GET /prices/:slug/history?limit=90`. When it is unreachable the app reads the public
`markets` collection in Firestore. See [docs/market-seed.md](docs/market-seed.md) for the
document schema and seed instructions.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page with the price-watchlist promo |
| `/detect` | Upload a crop photo and get a diagnosis |
| `/library` | Disease library |
| `/diseases/:slug` | Disease detail and native share actions |
| `/markets` | Nigerian market prices, filters, watchlist, and history |
| `/weather`, `/soil-report`, `/ecosystem`, `/organic` | Farming tools |

Sharing uses the Web Share API with a clipboard fallback. There is no WhatsApp ordering
or community flow.

## Firebase data model

| Collection | Rules |
| --- | --- |
| `users/{uid}` | Owner read/write |
| `scans/{scanId}` | Owner by `uid` field |
| `watchlist/{uid}` | Owner read/write |
| `markets/{marketId}` | Public read, Admin SDK / console writes only |
| `organic_plans/{planId}` | Owner by `userId` field |

All other paths are denied by default.
