import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, RefreshCw, Star, TrendingUp } from 'lucide-react';

/** Community entry point linking to the personal price watchlist. */
const WatchlistPromo = () => {
  const stats = [
    { value: '41+', label: 'Prices tracked', icon: <TrendingUp className="w-5 h-5" /> },
    { value: '60s', label: 'Live refresh', icon: <RefreshCw className="w-5 h-5" /> },
    { value: '24/7', label: 'Price alerts', icon: <Bell className="w-5 h-5" /> },
    { value: 'Free', label: 'Always', icon: <Star className="w-5 h-5" /> },
  ];

  return (
    <section className="py-20 relative overflow-hidden bg-[#0a2e1a]">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-[#10b981]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-400/10 blur-[100px] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-4 md:px-8 max-w-5xl relative z-10">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block bg-emerald-400/15 text-emerald-300 font-nunito font-bold px-5 py-2 rounded-full text-sm uppercase tracking-widest mb-5 border border-emerald-300/25"
          >
            🌱 Price Watchlist
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-playfair text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight"
          >
            Know the price{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-lime-300">
              before you sell
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-5 font-nunito text-white/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Follow Nigerian crop and food prices from Opaindex, star the commodities you grow,
            and check your watchlist in one place.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + index * 0.08 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              <div className="text-emerald-300 flex justify-center mb-2">{stat.icon}</div>
              <div className="font-playfair font-black text-white text-2xl">{stat.value}</div>
              <div className="font-nunito text-white/60 text-[13px] font-semibold mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, type: 'spring', bounce: 0.3 }}
          className="bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 border border-emerald-300/25 rounded-[28px] p-8 md:p-12 text-center backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 rounded-full bg-emerald-300/5 blur-3xl" />
          </div>

          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="w-20 h-20 mx-auto mb-6 rounded-[22px] bg-emerald-400 flex items-center justify-center shadow-[0_0_40px_rgba(52,211,153,0.35)]"
          >
            <Star className="w-10 h-10 text-emerald-950 fill-emerald-950/20" />
          </motion.div>

          <h3 className="font-playfair text-2xl md:text-3xl font-black text-white">
            Build your personal price watchlist
          </h3>
          <p className="font-nunito text-white/60 text-sm md:text-base mt-3 max-w-xl mx-auto">
            Free to use • Sign in to save favourites • Works even when the live feed is down
          </p>

          <div className="relative inline-block mt-8">
            <span className="absolute inset-0 rounded-2xl bg-emerald-300/25 animate-ping opacity-30" />
            <motion.div
              whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(52, 211, 153, 0.4)' }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to="/markets"
                className="relative inline-flex items-center gap-3 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-nunito font-black text-lg md:text-xl px-8 py-4 rounded-2xl transition-all duration-300 z-10"
              >
                Open Market Prices <ArrowRight className="w-6 h-6" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WatchlistPromo;
