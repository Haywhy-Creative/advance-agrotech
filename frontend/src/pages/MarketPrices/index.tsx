import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  Building2,
  Clock,
  Database,
  ExternalLink,
  MapPin,
  Minus,
  RefreshCw,
  Search,
  ShoppingBasket,
  Star,
  TrendingDown,
  TrendingUp,
  Wheat,
  Wifi,
  Zap,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  fetchMarketPrices,
  setWatchlistItem,
  subscribeMarketPrices,
  subscribeWatchlist,
  toWatchlistItem,
  watchlistItemKey,
  type PriceSource,
} from '../../services/priceService';
import type { MarketPrice, WatchlistItem } from '../../types';
import PriceHistoryModal from './PriceHistoryModal';

const ngn = (value: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value || 0);

const numberOrZero = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDateTime = (value: unknown): string => {
  if (!value) return '—';
  const date = new Date(value as string);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const CATEGORY_LABELS: Record<string, string> = {
  agriculture: 'Agriculture',
  'food-staples': 'Food staples',
  energy: 'Energy',
  'building-materials': 'Building materials',
};

const categoryIcon = (category: unknown) => {
  switch (String(category)) {
    case 'agriculture': return <Wheat className="w-5 h-5 text-emerald-700" />;
    case 'food-staples': return <ShoppingBasket className="w-5 h-5 text-amber-700" />;
    case 'energy': return <Zap className="w-5 h-5 text-blue-700" />;
    default: return <Building2 className="w-5 h-5 text-slate-600" />;
  }
};

const MarketPrices = () => {
  const { t } = useLanguage();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [source, setSource] = useState<PriceSource>('opaindex');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [market, setMarket] = useState('all');
  const [sort, setSort] = useState('name');
  const [watchOnly, setWatchOnly] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [selected, setSelected] = useState<MarketPrice | null>(null);

  const handleData = useCallback((next: MarketPrice[], nextSource: PriceSource, asOf?: string) => {
    setPrices(next);
    setSource(nextSource);
    setLastUpdated(asOf || new Date().toISOString());
    setLoading(false);
    setError('');
  }, []);

  useEffect(() => {
    const stop = subscribeMarketPrices(handleData, () => {
      setLoading(false);
      setError('Price feeds are unavailable right now. Please try again.');
    });
    return stop;
  }, [handleData]);

  useEffect(() => {
    if (!user?.uid) {
      setWatchlist([]);
      return;
    }
    return subscribeWatchlist(user.uid, setWatchlist, () => setWatchlist([]));
  }, [user?.uid]);

  const watchedKeys = useMemo(
    () => new Set(watchlist.map((item) => item.itemKey)),
    [watchlist]
  );

  const categories = useMemo(() => {
    const values = prices.map((price) => String(price.category || '')).filter(Boolean);
    return ['all', ...Array.from(new Set(values)).sort()];
  }, [prices]);

  const markets = useMemo(() => {
    const values = prices.map((price) => price.marketName).filter(Boolean);
    return ['all', ...Array.from(new Set(values)).sort()];
  }, [prices]);

  const filteredPrices = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = prices.filter((price) => {
      if (query) {
        const haystack = [
          price.crop,
          price.marketName,
          price.state,
          price.category,
          price.slug,
          price.source,
        ].join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (category !== 'all' && String(price.category) !== category) return false;
      if (market !== 'all' && price.marketName !== market) return false;
      if (watchOnly && !watchedKeys.has(watchlistItemKey(price))) return false;
      return true;
    });

    switch (sort) {
      case 'price_desc': return result.sort((a, b) => b.priceNGN - a.priceNGN);
      case 'price_asc': return result.sort((a, b) => a.priceNGN - b.priceNGN);
      case 'day_desc': return result.sort((a, b) => numberOrZero(b.dayChangePercent) - numberOrZero(a.dayChangePercent));
      case 'week_desc': return result.sort((a, b) => numberOrZero(b.weekChangePercent) - numberOrZero(a.weekChangePercent));
      default: return result.sort((a, b) => a.crop.localeCompare(b.crop));
    }
  }, [prices, search, category, market, sort, watchOnly, watchedKeys]);

  const resetFilters = () => {
    setSearch('');
    setCategory('all');
    setMarket('all');
    setSort('name');
    setWatchOnly(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const feed = await fetchMarketPrices();
      handleData(feed.prices, feed.provider, feed.asOf);
    } catch {
      setError('Could not refresh prices. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleWatch = async (price: MarketPrice) => {
    if (!user?.uid) {
      navigate('/login');
      return;
    }

    const itemKey = watchlistItemKey(price);
    const shouldAdd = !watchedKeys.has(itemKey);
    try {
      const next = await setWatchlistItem(
        user.uid,
        toWatchlistItem(price, user.uid, itemKey),
        shouldAdd
      );
      setWatchlist(next);
    } catch {
      setError('Could not update your watchlist. Please try again.');
    }
  };

  const gainers = prices.filter((price) => numberOrZero(price.dayChangePercent) > 0).length;
  const losers = prices.filter((price) => numberOrZero(price.dayChangePercent) < 0).length;
  const SourceIcon = source === 'opaindex' ? Wifi : Database;

  return (
    <div className="min-h-screen bg-[#F5F9F4] pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#063621] via-[#0B5A34] to-[#128C7E] text-white">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-24 w-96 h-96 bg-lime-300/10 rounded-full blur-3xl" />
        <div className="container mx-auto max-w-7xl px-4 md:px-8 py-14 relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-100"
          >
            <Activity className="w-3.5 h-3.5" /> {t('markets.badge')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-playfair text-4xl md:text-6xl font-black mt-4 leading-tight"
          >
            {t('markets.title1')} <span className="text-emerald-300">{t('markets.title2')}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-3xl text-white/75 text-base md:text-lg leading-relaxed font-nunito"
          >
            {t('markets.desc')}
          </motion.p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold border ${source === 'opaindex' ? 'bg-emerald-400/15 border-emerald-300/30 text-emerald-100' : 'bg-amber-400/15 border-amber-300/30 text-amber-100'}`}>
              <SourceIcon className="w-4 h-4" />
              {source === 'opaindex' ? t('markets.live') : t('markets.fallback')}
            </span>
            <span className="inline-flex items-center gap-2 text-xs text-white/60">
              <Clock className="w-4 h-4" /> Updated {formatDateTime(lastUpdated)}
            </span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> {t('markets.refresh')}
            </button>
            <a
              href="https://opaindex.com/data/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-200 hover:text-white"
            >
              {t('markets.attribution')} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 -mt-8 relative z-20">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {[
            { label: 'Tracked prices', value: String(prices.length), icon: <Activity className="w-5 h-5" />, tint: 'text-emerald-700 bg-emerald-50' },
            { label: 'Rising today', value: String(gainers), icon: <TrendingUp className="w-5 h-5" />, tint: 'text-green-700 bg-green-50' },
            { label: 'Falling today', value: String(losers), icon: <TrendingDown className="w-5 h-5" />, tint: 'text-red-700 bg-red-50' },
            { label: 'On your watchlist', value: String(watchlist.length), icon: <Star className="w-5 h-5" />, tint: 'text-amber-700 bg-amber-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.tint}`}>{stat.icon}</div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
                <p className="font-playfair text-2xl font-black text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
          </div>
        )}

        {/* Filters */}
        <div className="mt-8 bg-white rounded-3xl border border-emerald-100 shadow-sm p-4 md:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <label className="lg:col-span-2 relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('markets.searchPlaceholder')}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 py-3 text-sm font-semibold outline-none focus:border-emerald-400 focus:bg-white"
              />
            </label>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold outline-none focus:border-emerald-400"
            >
              <option value="all">{t('markets.allCategories')}</option>
              {categories.filter((value) => value !== 'all').map((value) => (
                <option key={value} value={value}>{CATEGORY_LABELS[value] || value}</option>
              ))}
            </select>

            <select
              value={market}
              onChange={(event) => setMarket(event.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold outline-none focus:border-emerald-400"
            >
              <option value="all">{t('markets.allMarkets')}</option>
              {markets.filter((value) => value !== 'all').map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold outline-none focus:border-emerald-400"
            >
              <option value="name">Name: A-Z</option>
              <option value="price_desc">Highest price</option>
              <option value="price_asc">Lowest price</option>
              <option value="day_desc">Biggest daily rise</option>
              <option value="week_desc">Biggest weekly rise</option>
            </select>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setWatchOnly((value) => !value)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold border transition-colors ${watchOnly ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
            >
              <Star className={`w-4 h-4 ${watchOnly ? 'fill-amber-400 text-amber-500' : ''}`} />
              {t('markets.watchOnly')}
            </button>
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
            >
              {t('markets.clearFilters')}
            </button>
          </div>
        </div>

        <p className="mt-5 mb-4 text-xs font-bold text-gray-500">
          {t('markets.showing')} {filteredPrices.length} {filteredPrices.length === 1 ? 'price' : 'prices'}
        </p>

        {/* Price cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-64 rounded-3xl bg-white border border-emerald-100 animate-pulse" />
            ))}
          </div>
        ) : filteredPrices.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredPrices.map((price, index) => {
              const dayChange = numberOrZero(price.dayChangePercent);
              const weekChange = numberOrZero(price.weekChangePercent);
              const ChangeIcon = dayChange > 0 ? TrendingUp : dayChange < 0 ? TrendingDown : Minus;
              const isWatched = watchedKeys.has(watchlistItemKey(price));
              const confidence = price.confidenceLabel || (price.confidence !== null && price.confidence !== undefined ? `${Math.round(Number(price.confidence) * 100)}%` : '—');

              return (
                <motion.article
                  key={`${price.id}-${index}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.025, 0.3) }}
                  className="bg-white rounded-3xl border border-emerald-100 shadow-sm hover:shadow-xl transition-shadow p-5 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        {categoryIcon(price.category)}
                      </div>
                      <div>
                        <h3 className="font-playfair text-lg font-black text-gray-900 leading-tight">{price.crop}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          {CATEGORY_LABELS[String(price.category)] || String(price.category || 'Other')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleWatch(price)}
                      aria-label={isWatched ? `Remove ${price.crop} from watchlist` : `Add ${price.crop} to watchlist`}
                      className={`p-2 rounded-xl border transition-colors ${isWatched ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-amber-500'}`}
                    >
                      <Star className={`w-4 h-4 ${isWatched ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  <div className="mt-5">
                    <p className="font-playfair text-3xl font-black text-gray-900">{ngn(price.priceNGN)}</p>
                    <p className="text-xs text-gray-500">per {price.unit}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black ${dayChange > 0 ? 'bg-green-50 text-green-700' : dayChange < 0 ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      <ChangeIcon className="w-3.5 h-3.5" />
                      {dayChange > 0 ? '+' : ''}{dayChange.toFixed(1)}% today
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                      {weekChange > 0 ? '+' : ''}{weekChange.toFixed(1)}% week
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-gray-500">
                    <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 shrink-0" /> {price.marketName} · {price.state}</p>
                    <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 shrink-0" /> {formatDateTime(price.asOf || price.lastUpdated)}</p>
                    <p className="truncate" title={price.source}>Source: {price.source || 'Firestore markets'} · Confidence: {String(confidence)}</p>
                  </div>

                  <button
                    onClick={() => setSelected(price)}
                    className="mt-auto pt-5 inline-flex items-center gap-2 text-sm font-black text-emerald-700 hover:text-emerald-900"
                  >
                    View trend <TrendingUp className="w-4 h-4" />
                  </button>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-emerald-200 bg-white py-20 text-center">
            <AlertCircle className="w-10 h-10 mx-auto text-amber-500" />
            <p className="font-playfair text-xl font-black text-gray-800 mt-4">{t('markets.noResults')}</p>
            <button onClick={resetFilters} className="mt-4 text-sm font-black text-emerald-700 hover:underline">
              {t('markets.clearFilters')}
            </button>
          </div>
        )}

        <p className="mt-10 text-center text-[11px] text-gray-400">
          Nigerian price data courtesy of Opaindex. Figures are sourced references, not seller quotes.
        </p>
      </div>

      {selected && (
        <PriceHistoryModal price={selected} source={source} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default MarketPrices;
