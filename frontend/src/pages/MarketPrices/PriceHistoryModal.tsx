import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertCircle, Clock, X } from 'lucide-react';
import { fetchPriceHistory, type PriceSource } from '../../services/priceService';
import type { MarketPrice, PriceHistoryPoint } from '../../types';

interface Props {
  price: MarketPrice
  source: PriceSource
  onClose: () => void
}

const ngn = (value: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value || 0);

const shortDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
};

const PriceHistoryModal = ({ price, source, onClose }: Props) => {
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!price.slug) {
      setHistory([]);
      setLoading(false);
      setError('Price history is only available for live Opaindex items.');
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError('');

    fetchPriceHistory(price.slug, source, 90, controller.signal)
      .then((points) => setHistory(points))
      .catch((err: any) => {
        if (err?.name !== 'AbortError') setError('Could not load the price history. Please try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [price.slug, source]);

  const chartData = useMemo(
    () => history.map((point) => ({ date: shortDate(point.asOf), value: point.price })),
    [history]
  );

  return (
    <motion.div
      className="fixed inset-0 z-[900] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-emerald-900 to-green-700 p-6 text-white flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-200">Price trend</p>
            <h3 className="font-playfair text-3xl font-black mt-1">{price.crop}</h3>
            <p className="text-sm text-emerald-100/80 mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Last 90 days · {price.marketName}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close price history"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Current price</p>
              <p className="font-playfair text-3xl font-black text-gray-900">{ngn(price.priceNGN)}</p>
              <p className="text-sm text-gray-500">{price.unit}</p>
            </div>
            <p className="text-xs text-gray-400 max-w-sm text-right">
              Source: {price.source || (source === 'opaindex' ? 'Opaindex' : 'Firestore markets')}
            </p>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center text-sm font-semibold text-gray-500">
              Loading price history...
            </div>
          ) : error ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-center text-gray-500">
              <AlertCircle className="w-8 h-8 text-amber-500" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          ) : chartData.length ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} width={64} />
                  <Tooltip formatter={(value: any) => [ngn(Number(value)), 'Price']} />
                  <Line type="monotone" dataKey="value" stroke="#15803D" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-sm font-semibold text-gray-500">
              No history is available for this item.
            </div>
          )}

          <p className="mt-5 text-[11px] text-gray-400">
            Data from Opaindex. Each figure keeps its own source and as-of date.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PriceHistoryModal;
