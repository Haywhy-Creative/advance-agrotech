# Seeding the Firestore `markets` fallback

The Market Prices page reads [`markets`](../src/services/priceService.ts) when the public
Opaindex API is unavailable (for example, a transient 503). The collection is public-read
and client-write disabled by [`firestore.rules`](../firestore.rules), so seed it from the
Firebase console or with the Admin SDK — never from the browser.

## What one document looks like

Document ID: any unique string (using the Opaindex slug is convenient, e.g. `maize`).

```json
{
  "id": "maize",
  "slug": "maize",
  "crop": "Maize",
  "category": "agriculture",
  "currency": "NGN",
  "marketName": "National",
  "state": "National",
  "address": "Nigeria",
  "lat": 0,
  "lng": 0,
  "priceNGN": 245000,
  "unit": "tonne",
  "trend": "up",
  "previousPriceNGN": 235000,
  "dayChangePercent": 4.3,
  "weekChangePercent": 6.1,
  "source": "Opaindex seed",
  "confidence": 0.8,
  "confidenceLabel": "high",
  "asOf": "2026-11-27T08:00:00.000Z",
  "lastUpdated": "2026-11-27T08:00:00.000Z"
}
```

`priceNGN`, `crop`, `unit` and `marketName` are the fields the UI relies on. `trend` must be
`up`, `down` or `stable`. Keep `asOf` current so the "Updated" label is meaningful.

## Firebase console

1. Open **Firestore Database → Create collection** and name it `markets`.
2. Add a document with an auto ID or a custom ID such as `maize`.
3. Add the fields above (numbers as Number, `asOf` as Timestamp or ISO string).
4. Repeat for the commodities you want available offline.

## Admin SDK (bulk seed)

From a trusted machine, outside the browser bundle:

```bash
npm install firebase-admin
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

```js
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const prices = [
  // paste the document objects you want to seed
];

async function seed() {
  const batch = db.batch();
  for (const price of prices) {
    batch.set(db.collection('markets').doc(price.slug || price.id), price, { merge: true });
  }
  await batch.commit();
  console.log(`Seeded ${prices.length} market price documents.`);
}

seed().catch(console.error);
```

After seeding, reload `/markets`. The header badge reads **Firestore fallback** when the
live Opaindex feed cannot be reached. Price data is courtesy of
[Opaindex](https://opaindex.com/data/) and must keep its source attribution.
