import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, TrendingUp, TrendingDown, Minus, Volume2, VolumeX, Music } from 'lucide-react';
import { useRates } from '../context/RateContext';
import SpotRatesCard from './SpotRatesCard';
import SpotBar from './SpotBar';

import Ticker from './Ticker';

const Hero = () => {
    const { rates, rawRates, loading, error, getPriceClass, isMusicEnabled, toggleMusic } = useRates();

    const fmt = (val) => {
        if (typeof val !== 'number') return '-';
        return val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const Heading = ({ text }) => (
        <div className="flex justify-center mb-1 md:mb-2">
            <h2 className="text-xl md:text-3xl font-playfair font-black text-magenta-700 uppercase tracking-[0.2em] border-b-2 border-magenta-100 pb-2 text-center">
                {text}
            </h2>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="w-full inventory-section min-h-[60vh] relative overflow-hidden pt-6 md:pt-0"
        >

            {/* Ambient Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 10% 20%, #fff, transparent 80%)' }} />

            {/* Table 1: Live Rates */}
            <section className="max-w-xl mx-auto px-4 md:px-6 w-full mt-8 md:mt-1 relative z-10 mb-6">
                <Heading text="LIVE SPOT RATES" />
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="flex flex-col gap-2 md:gap-4"
                >
                    <div className="flex flex-col gap-0 md:gap-1">
                        {/* Header Row Table 1 */}
                        <div className="px-3 md:px-5 py-1">
                            <div className="grid grid-cols-[1fr_1.5fr_60px] md:grid-cols-[1fr_1.5fr_80px] gap-2 md:gap-4 items-center w-full">
                                <div className="flex justify-start pl-1">
                                    <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-transparent border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[10px] md:text-sm tracking-[0.1em] shadow-sm backdrop-blur-sm">PRODUCTS</span>
                                </div>
                                <div className="flex justify-start pl-9 md:pl-14">
                                    <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-transparent border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[10px] md:text-sm tracking-[0.1em] shadow-sm backdrop-blur-sm">LIVE</span>
                                </div>
                                <div className="flex justify-center">
                                    <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-transparent border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[10px] md:text-sm tracking-[0.1em] shadow-sm backdrop-blur-sm">STATUS</span>
                                </div>
                            </div>
                        </div>

                        {rawRates.rtgs.filter(item => !(item.name.toLowerCase().includes('silver') && item.name.toLowerCase().includes('10 kgs'))).map((item, idx) => {
                            const pClass = getPriceClass('rtgs', item.id, 'sell');
                            const bColor = pClass === 'price-up' ? '#00c853' : pClass === 'price-down' ? '#ff1744' : pClass === 'gold-default' ? '#FFD700' : pClass === 'silver-default' ? '#CFE9E1' : '#0f172a';

                            return (
                                <motion.div
                                    key={`live-${idx}`}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.12 }}
                                    className="bg-white/10 backdrop-blur-sm rounded-[16px] py-2 px-3 md:bg-transparent md:backdrop-blur-none md:rounded-none md:py-2 md:px-0 md:shadow-none md:border-none relative group"
                                >
                                    <div className="grid grid-cols-[1fr_1.5fr_60px] md:grid-cols-[1fr_1.5fr_80px] gap-2 md:gap-4 items-center w-full relative">
                                        <div className="flex flex-col justify-center min-w-0 pr-1 pl-4 md:pl-10">
                                            <span className="text-[12px] md:text-lg font-black text-slate-900 font-poppins uppercase tracking-tight leading-tight group-hover:text-magenta-700 transition-colors duration-300">
                                                {item.name.split('(')[0]}
                                            </span>
                                        </div>

                                        <div className="flex justify-start w-full md:pl-0">
                                            <motion.div
                                                animate={{ scale: pClass === 'price-up' || pClass === 'price-down' ? 1.04 : 1 }}
                                                style={{ backgroundColor: bColor, borderColor: '#000000', borderWidth: window.innerWidth >= 768 ? '4px' : '3px' }}
                                                className="w-full transition-all duration-300 max-w-[140px] md:max-w-[200px] py-2 md:py-1.5 px-2 md:px-4 rounded-[14px] md:rounded-[18px] flex items-center justify-center shadow-md"
                                            >
                                                <motion.span
                                                    key={`live-price-${item.sell}-${pClass}`}
                                                    animate={{ scale: [1, 1.08, 1] }}
                                                    className={`font-black font-poppins text-center tracking-tighter md:tracking-normal text-[14px] md:text-[22px] leading-none ${bColor === '#FFD700' || bColor === '#CFE9E1' || bColor === '#E5E5E5' ? 'text-slate-900' : 'text-white'}`}
                                                >
                                                    {item.sell !== '-' ? <><span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span>{fmt(item.sell)}</> : '—'}
                                                </motion.span>
                                            </motion.div>
                                        </div>

                                        <div className="flex justify-center w-full">
                                            <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full transition-all duration-300 shadow-sm ${item.stock ? 'bg-[#e6f9ec] text-[#1c7c3c] border border-[#1c7c3c]/20' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                                {item.stock ? <Check size={18} strokeWidth={3} /> : <X size={18} strokeWidth={3} />}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </section>

            {/* Ticker in Between */}
            <div className="w-full relative z-20 py-4 my-2">
                <Ticker />
            </div>

            {/* Table 2: Market Rates (BUY/SELL/HIGH/LOW) */}
            <section className="max-w-4xl mx-auto px-2 md:px-6 w-full relative z-10 mb-10 md:mb-16">
                <Heading text="GOLD AND SILVER RETAIL RATES" />
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
                    className="flex flex-col gap-2"
                >
                    <div className="flex flex-col gap-0 md:gap-1">
                        {/* Header Row Table 2 */}
                        <div className="px-2 md:px-5 py-1">
                            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-1 md:gap-4 items-center w-full">
                                <div className="flex justify-start pl-1">
                                    <span className="inline-flex items-center justify-center px-1 md:px-4 py-1.5 rounded-xl bg-transparent border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[8px] md:text-sm tracking-[0.05em] md:tracking-[0.1em] shadow-sm backdrop-blur-sm">PRODUCTS</span>
                                </div>
                                <div className="flex justify-center">
                                    <span className="inline-flex items-center justify-center px-1 md:px-4 py-1.5 rounded-xl bg-transparent border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[8px] md:text-sm tracking-[0.05em] md:tracking-[0.1em] shadow-sm backdrop-blur-sm">BUY</span>
                                </div>
                                <div className="flex justify-center">
                                    <span className="inline-flex items-center justify-center px-1 md:px-4 py-1.5 rounded-xl bg-transparent border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[8px] md:text-sm tracking-[0.05em] md:tracking-[0.1em] shadow-sm backdrop-blur-sm">SELL</span>
                                </div>
                                <div className="flex justify-center">
                                    <span className="inline-flex items-center justify-center px-1 md:px-4 py-1.5 rounded-xl bg-transparent border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[8px] md:text-sm tracking-[0.05em] md:tracking-[0.1em] shadow-sm backdrop-blur-sm">HIGH</span>
                                </div>
                                <div className="flex justify-center">
                                    <span className="inline-flex items-center justify-center px-1 md:px-4 py-1.5 rounded-xl bg-transparent border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[8px] md:text-sm tracking-[0.05em] md:tracking-[0.1em] shadow-sm backdrop-blur-sm">LOW</span>
                                </div>
                            </div>
                        </div>

                        {rates.rtgs.filter(item => !(item.name.toLowerCase().includes('silver') && item.name.toLowerCase().includes('10 kgs'))).map((item, idx) => {
                            const isGold = item.name.toLowerCase().includes('gold') || item.id === '945';
                            const isSilver = item.name.toLowerCase().includes('silver') || item.id === '2966' || item.id === '2987';
                            const defaultColor = isGold ? '#FFD700' : isSilver ? '#CFE9E1' : '#0f172a';

                            const renderPriceBox = (val, field, colorOverride) => {
                                const pClass = getPriceClass('rtgs', item.id, field);
                                const bColor = pClass === 'price-up' ? '#00c853' : pClass === 'price-down' ? '#ff1744' : colorOverride || defaultColor;

                                return (
                                    <div className="flex justify-center w-full">
                                        <motion.div
                                            animate={{ scale: pClass === 'price-up' || pClass === 'price-down' ? 1.04 : 1 }}
                                            style={{ backgroundColor: bColor, borderColor: '#000000', borderWidth: window.innerWidth >= 768 ? '3px' : '2px' }}
                                            className="w-full transition-all duration-300 py-1.5 md:py-2 px-1 md:px-2 rounded-[8px] md:rounded-[12px] flex items-center justify-center shadow-sm"
                                        >
                                            <span className={`font-black font-poppins text-center tracking-tighter text-[10px] md:text-[18px] leading-none ${bColor === '#FFD700' || bColor === '#CFE9E1' || bColor === '#E5E5E5' ? 'text-slate-900' : 'text-white'}`}>
                                                {val !== '-' ? <><span className="hidden md:inline" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span>{fmt(val)}</> : '—'}
                                            </span>
                                        </motion.div>
                                    </div>
                                );
                            };

                            return (
                                <motion.div
                                    key={`market-${idx}`}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.12 }}
                                    className="bg-white/10 backdrop-blur-sm rounded-[16px] py-3 px-2 md:bg-transparent md:backdrop-blur-none md:rounded-none md:py-2 md:px-0 relative group"
                                >
                                    <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-1 md:gap-4 items-center w-full relative">
                                        <div className="flex flex-col justify-center min-w-0 pr-1 pl-4 md:pl-10">
                                            <span className="text-[10px] md:text-lg font-black text-slate-900 font-poppins uppercase tracking-tight leading-tight group-hover:text-magenta-700 transition-colors duration-300">
                                                {item.name.split('(')[0]}
                                            </span>
                                        </div>
                                        {renderPriceBox(item.buy, 'buy')}
                                        {renderPriceBox(item.sell, 'sell')}
                                        {renderPriceBox(item.high, 'high', '#00c853')}
                                        {renderPriceBox(item.low, 'low', '#ff1744')}
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div className="hidden md:block w-full h-1 bg-gradient-to-r from-transparent via-magenta-500/60 to-transparent mt-4 rounded-full" />
                    </div>
                </motion.div>
            </section>

            {/* Music Toggle - Mobile Only (below tables) */}
            <div className="flex md:hidden justify-center pb-4 -mt-4">
                <button
                    onClick={toggleMusic}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg transition-all border-2 font-poppins font-bold text-xs uppercase tracking-widest ${isMusicEnabled ? 'bg-magenta-600 border-magenta-400 text-white animate-pulse' : 'bg-white/80 border-slate-200 text-slate-700'} hover:scale-105`}
                    title={isMusicEnabled ? 'Turn Off Music' : 'Turn On Music'}
                >
                    <Music size={16} />
                    {isMusicEnabled ? 'Music On' : 'Music Off'}
                </button>
            </div>

            {/* Decorative Side Image - Desktop Only - Right side */}
            <motion.img
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                src="/ChatGPT Image Mar 17, 2026, 10_58_54 AM.png"
                alt="Decorative Right"
                className="hidden md:block absolute right-[2%] top-[15%] -translate-y-1/2 w-[22%] max-w-[350px] object-contain opacity-90 pointer-events-none z-0"
            />

            {/* Decorative Side Image - Desktop Only - Left side (Mirror) */}
            <motion.img
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                src="/Untitled design (38).png"
                alt="Decorative Left"
                className="hidden md:block absolute left-[2%] top-[18%] -translate-y-1/2 w-[22%] max-w-[350px] object-contain opacity-90 pointer-events-none z-0"
            />

        </motion.div>
    );
};

export default Hero;
