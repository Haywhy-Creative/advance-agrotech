/**
 * Shared domain models for FasalRakshak.
 * These describe the Firestore documents and the values exposed by app contexts.
 */

export type Trend = 'up' | 'down' | 'stable'

/** users/{uid} */
export interface UserProfile {
  uid: string
  id?: string
  email?: string | null
  displayName?: string | null
  firstName?: string
  lastName?: string
  photoURL?: string | null
  imageUrl?: string
  fullName?: string
  phone?: string
  location?: string
  state?: string
  district?: string
  farmSize?: string
  crops?: string[]
  totalScans?: number
  createdAt?: any
  updatedAt?: any
  [key: string]: any
}

/** scans/{scanId} — every document carries `uid` for owner-filtered queries */
export interface ScanRecord {
  id?: string
  uid?: string
  status?: string
  diseaseName?: string
  cropType?: string
  crop?: string
  confidence?: number
  description?: string
  imageUrl?: string
  thumbnailUrl?: string
  imageThumbnail?: string
  timestamp?: string
  createdAt?: any
  [key: string]: any
}

/** watchlist/{uid} — one document per user holding starred market + crop keys */
export interface WatchlistItem {
  id: string
  uid: string
  itemKey: string
  crop: string
  marketName: string
  state: string
  priceNGN?: number
  addedAt?: any
  [key: string]: any
}

export interface WatchlistDocument {
  items: WatchlistItem[]
  updatedAt?: any
}

/** markets/{marketId} — unified card schema used by the Market Prices page */
export interface MarketPrice {
  id: string
  marketName: string
  state: string
  address: string
  lat: number
  lng: number
  crop: string
  slug?: string
  priceNGN: number
  unit: string
  trend: Trend
  previousPriceNGN?: number
  dayChangePercent?: number | null
  weekChangePercent?: number | null
  source?: string
  confidence?: number | null
  lastUpdated?: any
  asOf?: string
  [key: string]: any
}

/** Shape returned by GET /prices on the Opaindex API */
export interface PricePoint {
  slug: string
  name: string
  category: string
  market: string
  unit: string
  price: number
  currency: string
  dayChangePercent?: number | null
  weekChangePercent?: number | null
  source?: string
  asOf?: string
  confidence?: number | null
  [key: string]: any
}

export interface PriceFeed<T = PricePoint> {
  prices: T[]
  count: number
  source: 'db' | 'seed' | string
  asOf?: string
}

/** One point in the Opaindex `/prices/:slug/history` series */
export interface PriceHistoryPoint {
  asOf: string
  price: number
}

export interface AuthContextValue {
  user: UserProfile | null
  isLoading: boolean
  isLoggedIn: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, profile?: Partial<UserProfile>) => Promise<void>
  signInWithGoogle: () => Promise<void>
  login: (userData: UserProfile) => void
  logout: () => Promise<void>
  updateUser: (newData: Partial<UserProfile>) => void
  incrementTotalScans: () => void
}

export interface LanguageContextValue {
  lang: string
  t: (key: string, ...args: any[]) => any
}
