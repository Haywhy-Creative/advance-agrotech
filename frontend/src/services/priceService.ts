import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type {
  MarketPrice,
  PriceFeed,
  PriceHistoryPoint,
  PricePoint,
  WatchlistDocument,
  WatchlistItem,
} from '../types';

export const OPAINDEX_BASE_URL = import.meta.env.VITE_OPAINDEX_API_URL || 'https://api.opaindex.com';

const MARKETS_COLLECTION = 'markets';
const WATCHLIST_COLLECTION = 'watchlist';
const REFRESH_INTERVAL_MS = 60_000;

export type PriceSource = 'opaindex' | 'firestore';

export interface PriceSnapshot {
  prices: MarketPrice[]
  count: number
  source: string
  asOf?: string
}

export interface MarketFeed extends PriceSnapshot {
  provider: PriceSource
}

/**
 * Adapter contract: every price backend (Opaindex HTTP, Firestore cache)
 * exposes the same normalised snapshot and history shape.
 */
export interface PriceProvider {
  readonly id: PriceSource
  getSnapshot(signal?: AbortSignal): Promise<PriceSnapshot>
  getHistory(slug: string, limit?: number, signal?: AbortSignal): Promise<PriceHistoryPoint[]>
  subscribe(onData: (snapshot: PriceSnapshot) => void, onError?: (error: unknown) => void): () => void
}

const CONFIDENCE_SCORES: Record<string, number> = { high: 1, medium: 0.65, low: 0.35 };

const asNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const confidenceScore = (value: unknown): number | null => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return CONFIDENCE_SCORES[value.toLowerCase()] ?? null;
  return null;
};

/** Convert an Opaindex PricePoint into the app's unified MarketPrice card model. */
export const toMarketPrice = (point: PricePoint): MarketPrice => {
  const price = asNumber(point.price);
  const dayChange = asNumber(point.dayChangePercent);
  const previousPriceNGN = Math.abs(dayChange) > 0 && dayChange > -100
    ? price / (1 + dayChange / 100)
    : undefined;

  return {
    id: point.slug,
    slug: point.slug,
    crop: point.name,
    marketName: point.market || 'Nigeria',
    state: point.market && point.market !== 'Nigeria' ? point.market : 'National',
    address: point.source || 'Nigeria',
    lat: 0,
    lng: 0,
    priceNGN: price,
    previousPriceNGN,
    currency: point.currency || 'NGN',
    category: point.category || 'other',
    unit: point.unit || 'per unit',
    trend: dayChange > 0 ? 'up' : dayChange < 0 ? 'down' : 'stable',
    dayChangePercent: point.dayChangePercent ?? 0,
    weekChangePercent: point.weekChangePercent ?? 0,
    source: point.source,
    confidence: confidenceScore(point.confidence),
    confidenceLabel: point.confidence,
    lastUpdated: point.asOf,
    asOf: point.asOf,
  };
};

/** Opaindex adapter: GET /prices, /prices/:slug and /prices/:slug/history. */
export class OpaindexAdapter implements PriceProvider {
  readonly id: PriceSource = 'opaindex';

  private async getJson<T>(path: string, signal?: AbortSignal): Promise<T | null> {
    const response = await fetch(`${OPAINDEX_BASE_URL}${path}`, {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Opaindex request failed (${response.status})`);
    return (await response.json()) as T;
  }

  async getSnapshot(signal?: AbortSignal): Promise<PriceSnapshot> {
    const feed = await this.getJson<PriceFeed<PricePoint>>('/prices', signal);
    if (!feed?.prices) throw new Error('Opaindex returned an empty price feed');
    return {
      prices: feed.prices.map(toMarketPrice),
      count: feed.count ?? feed.prices.length,
      source: feed.source || 'opaindex',
      asOf: feed.asOf,
    };
  }

  async getPrice(slug: string, signal?: AbortSignal): Promise<PricePoint | null> {
    const result = await this.getJson<{ price?: PricePoint }>(
      `/prices/${encodeURIComponent(slug)}`,
      signal
    );
    return result?.price ?? null;
  }

  async getHistory(slug: string, limit = 90, signal?: AbortSignal): Promise<PriceHistoryPoint[]> {
    const result = await this.getJson<{ history?: PriceHistoryPoint[] }>(
      `/prices/${encodeURIComponent(slug)}/history?limit=${Math.min(Math.max(limit, 1), 365)}`,
      signal
    );
    return result?.history ?? [];
  }

  subscribe(onData: (snapshot: PriceSnapshot) => void, onError?: (error: unknown) => void): () => void {
    let active = true;
    let controller: AbortController | null = null;

    const poll = async () => {
      controller = new AbortController();
      try {
        const snapshot = await this.getSnapshot(controller.signal);
        if (active) onData(snapshot);
      } catch (error) {
        if (active && !controller.signal.aborted) onError?.(error);
      }
    };

    void poll();
    const timer = setInterval(() => void poll(), REFRESH_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(timer);
      controller?.abort();
    };
  }
}

/** Firestore adapter: markets/{marketId} is the offline/cache fallback. */
export class FirestoreMarketsAdapter implements PriceProvider {
  readonly id: PriceSource = 'firestore';

  private toPrices(snapshot: { docs: Array<{ id: string; data: () => Record<string, unknown> }> }): MarketPrice[] {
    return snapshot.docs.map((document) => ({
      id: document.id,
      ...(document.data() as MarketPrice),
    }));
  }

  async getSnapshot(): Promise<PriceSnapshot> {
    const snapshot = await getDocs(collection(db, MARKETS_COLLECTION));
    const prices = this.toPrices(snapshot);
    return {
      prices,
      count: prices.length,
      source: 'firestore',
      asOf: prices.find((price) => price.asOf)?.asOf,
    };
  }

  async getHistory(): Promise<PriceHistoryPoint[]> {
    return [];
  }

  subscribe(onData: (snapshot: PriceSnapshot) => void, onError?: (error: unknown) => void): () => void {
    return onSnapshot(
      collection(db, MARKETS_COLLECTION),
      (snapshot) => {
        const prices = this.toPrices(snapshot);
        onData({
          prices,
          count: prices.length,
          source: 'firestore',
          asOf: prices.find((price) => price.asOf)?.asOf,
        });
      },
      onError
    );
  }
}

const opaindex = new OpaindexAdapter();
const firestore = new FirestoreMarketsAdapter();

export const priceProviders: Record<PriceSource, PriceProvider> = { opaindex, firestore };

/** One-shot load: Opaindex first, Firestore `markets` collection as fallback. */
export async function fetchMarketPrices(signal?: AbortSignal): Promise<MarketFeed> {
  try {
    const snapshot = await opaindex.getSnapshot(signal);
    return { ...snapshot, provider: 'opaindex' };
  } catch (opaindexError) {
    const snapshot = await firestore.getSnapshot();
    return { ...snapshot, provider: 'firestore' };
  }
}

/** Live feed with automatic fallback when Opaindex is unavailable. */
export function subscribeMarketPrices(
  onData: (prices: MarketPrice[], source: PriceSource, asOf?: string) => void,
  onError?: (error: unknown) => void
): () => void {
  let active = true;
  let stopFirestore: (() => void) | null = null;

  const stopOpaindex = opaindex.subscribe(
    (snapshot) => {
      if (active) onData(snapshot.prices, 'opaindex', snapshot.asOf);
    },
    (error) => {
      if (!active || stopFirestore) return;
      stopFirestore = firestore.subscribe(
        (snapshot) => {
          if (active) onData(snapshot.prices, 'firestore', snapshot.asOf);
        },
        (fallbackError) => {
          if (active) onError?.(fallbackError);
        }
      );
    }
  );

  return () => {
    active = false;
    stopOpaindex();
    stopFirestore?.();
  };
}

export function fetchPriceHistory(
  slug: string,
  source: PriceSource = 'opaindex',
  limit = 90,
  signal?: AbortSignal
): Promise<PriceHistoryPoint[]> {
  return priceProviders[source].getHistory(slug, limit, signal);
}

export const watchlistItemKey = (price: MarketPrice): string =>
  `${price.slug || price.id}::${price.marketName}`.toLowerCase();

export const toWatchlistItem = (
  price: MarketPrice,
  uid: string,
  itemKey = watchlistItemKey(price)
): WatchlistItem => ({
  id: itemKey,
  uid,
  itemKey,
  crop: price.crop,
  marketName: price.marketName,
  state: price.state,
  priceNGN: price.priceNGN,
  addedAt: new Date().toISOString(),
});

/** watchlist/{uid} holds the signed-in user's starred price cards. */
export function subscribeWatchlist(
  uid: string,
  onData: (items: WatchlistItem[]) => void,
  onError?: (error: unknown) => void
): () => void {
  if (!uid) {
    onData([]);
    return () => {};
  }

  return onSnapshot(
    doc(db, WATCHLIST_COLLECTION, uid),
    (snapshot) => {
      const data = snapshot.data() as WatchlistDocument | undefined;
      onData(data?.items ?? []);
    },
    onError
  );
}

export async function setWatchlistItem(
  uid: string,
  item: WatchlistItem,
  shouldAdd: boolean
): Promise<WatchlistItem[]> {
  const reference = doc(db, WATCHLIST_COLLECTION, uid);
  const snapshot = await getDoc(reference);
  const current = (snapshot.data() as WatchlistDocument | undefined)?.items ?? [];
  const next = shouldAdd
    ? current.some((existing) => existing.itemKey === item.itemKey)
      ? current
      : [...current, item]
    : current.filter((existing) => existing.itemKey !== item.itemKey);

  await setDoc(reference, { items: next, updatedAt: serverTimestamp() }, { merge: true });
  return next;
}
