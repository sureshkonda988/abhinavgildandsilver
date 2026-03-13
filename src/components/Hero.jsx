import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useRates } from '../context/RateContext';
import SpotRatesCard from './SpotRatesCard';
import SpotBar from './SpotBar';

import Ticker from './Ticker';

const Hero = () => {
    const { rates, rawRates, loading, error, getPriceClass } = useRates();

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
            <section className="max-w-2xl mx-auto px-4 md:px-6 w-full mt-6 md:mt-2 relative z-10 mb-10 md:mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="flex flex-col gap-8 md:gap-14"
                >
                    {/* Spot Bar remains in App.jsx header overlay */}

                    {/* Inventory Headings - Adjusted ratios for more price space */}
                    <div className="w-full border border-transparent px-2.5 md:px-0 mb-[-10px] md:mb-[-40px]">
                        <div className="grid grid-cols-[1.5fr_1fr_1fr_60px] md:grid-cols-[2fr_1fr_1fr_80px] gap-2 md:gap-4 items-center w-full">
                            <div className="text-left">
                                <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-transparent border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[10px] md:text-sm tracking-[0.1em] shadow-sm backdrop-blur-sm">PRODUCTS</span>
                            </div>
                             <div className="text-center">
                                <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-transparent border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[10px] md:text-sm tracking-[0.1em] shadow-sm backdrop-blur-sm">BUY</span>
                            </div>
                            <div className="text-center">
                                <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-transparent border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[10px] md:text-sm tracking-[0.1em] shadow-sm backdrop-blur-sm">SELL</span>
                            </div>
                            <div className="text-center">
                                <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-transparent border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[10px] md:text-sm tracking-[0.1em] shadow-sm backdrop-blur-sm">STATUS</span>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Rows */}
                    <div className="flex flex-col gap-3 md:gap-6 mt-4 md:mt-0">
                        {rates.rtgs.map((item, idx) => {
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
                                    whileHover={{ y: -3, boxShadow: "0 14px 30px -10px rgba(0,0,0,0.12)" }}
                                    className="bg-white/10 backdrop-blur-sm rounded-[16px] md:rounded-[20px] p-2.5 md:p-6 shadow-premium transition-all duration-500 border border-white/20 relative group"
                                >
                                    <div className="grid grid-cols-[1.5fr_1fr_1fr_60px] md:grid-cols-[2fr_1fr_1fr_80px] gap-2 md:gap-4 items-center w-full relative">
                                        {/* Item Label */}
                                        <div className="flex flex-col justify-center min-w-0 pr-1">
                                            <span className="text-[12px] md:text-xl font-black text-slate-900 font-poppins uppercase tracking-tight leading-tight group-hover:text-magenta-700 transition-colors duration-300">
                                                {item.name.split('(')[0]}
                                            </span>
                                            {item.name.includes('(') && (
                                                <span className="text-[9px] md:text-sm font-extrabold text-[#0f172a] font-poppins mt-0.5 whitespace-nowrap italic">
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
                                                        style={{ borderColor: bColor, borderWidth: isGold ? '3px' : '2px' }}
                                                        className="w-full transition-all duration-300 max-w-[120px] md:max-w-[160px] mx-auto py-2.5 md:py-3.5 px-1 bg-transparent rounded-[18px] flex items-center justify-center shadow-md overflow-hidden"
                                                    >
                                                        <motion.span
                                                            key={`buy-${item.buy}-${pClass}`}
                                                            animate={{ scale: [1, 1.08, 1] }}
                                                            className={`font-black font-poppins text-center tracking-tighter md:tracking-wider text-slate-900 text-[18px] md:text-[24px] leading-none`}
                                                        >
                                                            {item.buy !== '-' ? <><span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span>{fmt(item.buy)}</> : '—'}
                                                        </motion.span>
                                                    </motion.div>
                                                );
                                            })()}
                                        </div>

                                        {/* SELL Box Container */}
                                        <div className="flex justify-center w-full md:translate-x-2">
                                            {(() => {
                                                const pClass = getPriceClass('rtgs', item.id, 'sell');
                                                const bColor = pClass === 'price-up' ? '#00c853' : pClass === 'price-down' ? '#ff1744' : pClass === 'gold-default' ? '#FFD700' : pClass === 'silver-default' ? '#CFE9E1' : '#0f172a';

                                                return (
                                                    <motion.div
                                                        animate={{
                                                            scale: pClass === 'price-up' || pClass === 'price-down' ? 1.04 : 1
                                                        }}
                                                        style={{ borderColor: bColor, borderWidth: isGold ? '3px' : '2px' }}
                                                        className="w-full transition-all duration-300 max-w-[120px] md:max-w-[160px] mx-auto py-2.5 md:py-3.5 px-1 bg-transparent rounded-[18px] flex items-center justify-center shadow-md overflow-hidden"
                                                    >
                                                        <motion.span
                                                            key={`sell-${item.sell}-${pClass}`}
                                                            animate={{ scale: [1, 1.08, 1] }}
                                                            className={`font-black font-poppins text-center tracking-tighter md:tracking-wider text-slate-900 text-[18px] md:text-[24px] leading-none`}
                                                        >
                                                            {item.sell !== '-' ? <><span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span>{fmt(item.sell)}</> : '—'}
                                                        </motion.span>
                                                    </motion.div>
                                                );
                                            })()}
                                        </div>

                                        <div className="flex justify-center w-full md:translate-x-4">
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

        </motion.div>
    );
};

export default Hero;
