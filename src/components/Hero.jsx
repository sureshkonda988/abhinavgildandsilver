import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, TrendingUp, TrendingDown, Minus, Volume2, VolumeX, Music } from 'lucide-react';
import { useRates } from '../context/RateContext';
import SpotRatesCard from './SpotRatesCard';
import SpotBar from './SpotBar';

import Ticker from './Ticker';

const Hero = () => {
    const { rates, rawRates, loading, error, getPriceClass, isMusicEnabled, toggleMusic, music } = useRates();

    const fmt = (val) => {
        if (typeof val !== 'number') return '-';
        return val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

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

            {/* Rates Section */}
            <section className="max-w-xl mx-auto px-4 md:px-6 w-full mt-6 md:mt-2 relative z-10 mb-10 md:mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="flex flex-col gap-8 md:gap-14"
                >
                    {/* Spot Bar remains in App.jsx header overlay */}

                    {/* Inventory Table: Header + Rows in the same container for perfect column alignment */}
                    <div className="flex flex-col gap-1 md:gap-2">
                        {/* Header Row */}
                        <div className="px-3 md:px-5 py-1">
                            <div className="grid grid-cols-[1.5fr_1fr_1fr_60px] md:grid-cols-[2fr_1fr_1fr_80px] gap-2 md:gap-4 items-center w-full">
                                <div className="flex justify-start">
                                    <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-transparent border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[10px] md:text-sm tracking-[0.1em] shadow-sm backdrop-blur-sm">PRODUCTS</span>
                                </div>
                                <div className="flex justify-center">
                                    <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-transparent border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[10px] md:text-sm tracking-[0.1em] shadow-sm backdrop-blur-sm md:-translate-x-10">BUY</span>
                                </div>
                                <div className="flex justify-center">
                                    <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-transparent border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[10px] md:text-sm tracking-[0.1em] shadow-sm backdrop-blur-sm md:-translate-x-6">SELL</span>
                                </div>
                                <div className="flex justify-center">
                                    <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-transparent border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[10px] md:text-sm tracking-[0.1em] shadow-sm backdrop-blur-sm">STATUS</span>
                                </div>
                            </div>
                        </div>
                        {rates.rtgs.filter(item => !(item.name.toLowerCase().includes('silver') && item.name.toLowerCase().includes('10 kgs'))).map((item, idx) => {
                            const rawItem = rawRates.rtgs.find(r => r.id === item.id || (r.name && r.name === item.name)) || item;
                            const isGold = item.name.toLowerCase().includes('gold') || item.id === '945';
                            const isSilver = item.name.toLowerCase().includes('silver') || item.id === '2966' || item.id === '2987';
                            const defaultBorder = isGold ? '#FFD700' : isSilver ? '#E5E5E5' : '#0f172a';
                            const currentBorderColor = item.trend === 'up' ? '#00c853' : item.trend === 'down' ? '#ff1744' : defaultBorder;

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.12 }}
                                    whileHover={{ 
                                        y: window.innerWidth >= 1024 ? 0 : -3, 
                                        boxShadow: window.innerWidth >= 1024 ? "none" : "0 14px 30px -10px rgba(0,0,0,0.12)" 
                                    }}
                                    className="bg-white/10 backdrop-blur-sm rounded-[16px] py-5 px-3 md:bg-transparent md:backdrop-blur-none md:rounded-none md:py-2 md:px-0 md:shadow-none md:border-none relative group"
                                >
                                    <div className="grid grid-cols-[1.5fr_1fr_1fr_60px] md:grid-cols-[2fr_1fr_1fr_80px] gap-2 md:gap-4 items-center w-full relative">
                                        {/* Item Label */}
                                        <div className="flex flex-col justify-center min-w-0 pr-1">
                                            <span className="text-[12px] md:text-lg font-black text-slate-900 font-poppins uppercase tracking-tight leading-tight group-hover:text-magenta-700 transition-colors duration-300">
                                                {item.name.split('(')[0]}
                                            </span>
                                            {item.name.includes('(') && (
                                                <span className="text-[9px] md:text-[11px] font-extrabold text-[#0f172a] font-poppins mt-0 whitespace-nowrap italic">
                                                    ({item.name.split('(')[1]}
                                                </span>
                                            )}
                                        </div>
 
                                        {/* BUY Box Container */}
                                        <div className="flex justify-center w-full">
                                            {(() => {
                                                const pClass = getPriceClass('rtgs', item.id, 'buy');
                                                const bColor = pClass === 'price-up' ? '#00c853' : pClass === 'price-down' ? '#ff1744' : pClass === 'gold-default' ? '#FFD700' : pClass === 'silver-default' ? '#CFE9E1' : '#0f172a';

                                                return (
                                                    <motion.div
                                                        animate={{
                                                            scale: pClass === 'price-up' || pClass === 'price-down' ? 1.04 : 1
                                                        }}
                                                        style={{ 
                                                            backgroundColor: bColor, 
                                                            borderColor: '#000000', 
                                                            borderWidth: window.innerWidth >= 768 ? '4px' : '3px' 
                                                        }}
                                                        className="w-full transition-all duration-300 max-w-[100px] md:max-w-[150px] py-3 md:py-2 px-2 md:px-4 rounded-[14px] md:rounded-[18px] flex items-center justify-center shadow-md"
                                                    >
                                                        <motion.span
                                                            key={`buy-${item.buy}-${pClass}`}
                                                            animate={{ scale: [1, 1.08, 1] }}
                                                            className={`font-black font-poppins text-center tracking-tighter md:tracking-normal text-[14px] md:text-[22px] leading-none ${bColor === '#FFD700' || bColor === '#CFE9E1' || bColor === '#E5E5E5' ? 'text-slate-900' : 'text-white'}`}
                                                        >
                                                            {item.buy !== '-' ? <><span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span>{fmt(item.buy)}</> : '—'}
                                                        </motion.span>
                                                    </motion.div>
                                                );
                                            })()}
                                        </div>

                                        {/* SELL Box Container */}
                                        <div className="flex justify-center w-full">
                                            {(() => {
                                                const pClass = getPriceClass('rtgs', item.id, 'sell');
                                                const bColor = pClass === 'price-up' ? '#00c853' : pClass === 'price-down' ? '#ff1744' : pClass === 'gold-default' ? '#FFD700' : pClass === 'silver-default' ? '#CFE9E1' : '#0f172a';

                                                return (
                                                    <motion.div
                                                        animate={{
                                                            scale: pClass === 'price-up' || pClass === 'price-down' ? 1.04 : 1
                                                        }}
                                                        style={{ 
                                                            backgroundColor: bColor, 
                                                            borderColor: '#000000', 
                                                            borderWidth: window.innerWidth >= 768 ? '4px' : '3px' 
                                                        }}
                                                        className="w-full transition-all duration-300 max-w-[110px] md:max-w-[170px] py-3 md:py-2 px-2 md:px-4 rounded-[14px] md:rounded-[18px] flex items-center justify-center shadow-md"
                                                    >
                                                        <motion.span
                                                            key={`sell-${item.sell}-${pClass}`}
                                                            animate={{ scale: [1, 1.08, 1] }}
                                                            className={`font-black font-poppins text-center tracking-tighter md:tracking-normal text-[14px] md:text-[22px] leading-none ${bColor === '#FFD700' || bColor === '#CFE9E1' || bColor === '#E5E5E5' ? 'text-slate-900' : 'text-white'}`}
                                                        >
                                                            {item.sell !== '-' ? <><span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span>{fmt(item.sell)}</> : '—'}
                                                        </motion.span>
                                                    </motion.div>
                                                );
                                            })()}
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
                        {/* Decorative Bottom Border from Mockup */}
                        <div className="hidden md:block w-full h-1 bg-gradient-to-r from-transparent via-magenta-500/60 to-transparent mt-4 rounded-full" />
                    </div>
                </motion.div>
            </section>

            {/* Music Toggle - Mobile Only (below tables) */}
            <div className="flex md:hidden justify-center pb-4 -mt-4">
                <button
                    onClick={toggleMusic}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg transition-all border-2 font-poppins font-bold text-xs uppercase tracking-widest ${isMusicEnabled ? 'bg-magenta-600 border-magenta-400 text-white animate-pulse' : 'bg-white/80 border-slate-200 text-slate-700'} ${!(music.homeMusic?.sourceType === 'local' ? music.homeMusic?.fileUrl : music.homeMusic?.videoId) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
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
                src="/Untitled design (37).png"
                alt="Decorative Right"
                className="hidden md:block absolute right-[2%] top-[28%] -translate-y-1/2 w-[22%] max-w-[350px] object-contain opacity-90 pointer-events-none z-0"
            />

            {/* Decorative Side Image - Desktop Only - Left side (Mirror) */}
            <motion.img
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                src="/Untitled design (38).png"
                alt="Decorative Left"
                className="hidden md:block absolute left-[2%] top-[28%] -translate-y-1/2 w-[22%] max-w-[350px] object-contain opacity-90 pointer-events-none z-0"
            />

        </motion.div>
    );
};

export default Hero;
