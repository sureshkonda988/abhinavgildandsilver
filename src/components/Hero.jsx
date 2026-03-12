import React from 'react';
import { motion } from 'framer-motion';
import { useRates } from '../context/RateContext';
import SpotRatesCard from './SpotRatesCard';
import SpotBar from './SpotBar';

import Ticker from './Ticker';

const Hero = () => {
    const { rates, rawRates, loading, error, getPriceClass } = useRates();

    const fmt = (val) => {
        if (typeof val !== 'number') return '-';
        return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="w-full inventory-section bg-gradient-gold-luxury min-h-[60vh] relative overflow-hidden pt-6 md:pt-0"
        >
            {/* Ambient Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 10% 20%, #fff, transparent 80%)' }} />

            {/* Rates Section */}
            <section className="max-w-6xl mx-auto px-4 md:px-6 w-full mt-6 md:mt-2 relative z-10 mb-10 md:mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="flex flex-col gap-8 md:gap-14"
                >
                    {/* Spot Bar remains in App.jsx header overlay */}

                    {/* Inventory Headings - Adjusted ratios for more price space */}
                    <div className="w-full border border-transparent px-2.5 md:px-6 mb-[-10px] md:mb-[-40px]">
                        <div className="grid grid-cols-[1.1fr_1.2fr_1.2fr_0.6fr] gap-2 md:gap-6 items-center w-full">
                            <div className="text-left font-black text-slate-900 text-[11px] md:text-2xl uppercase tracking-widest md:tracking-[0.3em] font-poppins md:-ml-8">
                                PRODUCTS
                            </div>
                            <div className="text-center font-black text-slate-900 text-[11px] md:text-2xl uppercase tracking-widest md:tracking-[0.3em] font-poppins md:-ml-44">
                                BUY
                            </div>
                            <div className="text-center font-black text-slate-900 text-[11px] md:text-2xl uppercase tracking-widest md:tracking-[0.3em] font-poppins md:-ml-52">
                                SELL
                            </div>
                            <div className="text-center font-black text-slate-900 text-[11px] md:text-2xl uppercase tracking-widest md:tracking-[0.3em] font-poppins">
                                STATUS
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
                                    <div className="grid grid-cols-[1.1fr_1.2fr_1.2fr_0.6fr] gap-2 md:gap-6 items-center w-full relative">
                                        {/* Item Label */}
                                        <div className="flex flex-col justify-center min-w-0 pr-1">
                                            <span className="text-[12px] md:text-2xl font-black text-slate-900 font-poppins uppercase tracking-tight leading-tight group-hover:text-magenta-700 transition-colors duration-300 truncate">
                                                {item.name.split('(')[0]}
                                            </span>
                                            {item.name.includes('(') && (
                                                <span className="text-[8px] md:text-sm font-bold text-slate-400 font-poppins mt-0.5 whitespace-nowrap italic opacity-80 truncate">
                                                    ({item.name.split('(')[1]}
                                                </span>
                                            )}
                                        </div>
 
                                        {/* BUY Box Container */}
                                        <div className="flex justify-center w-full">
                                            {(() => {
                                                const pClass = getPriceClass('rtgs', item.id, 'buy');
                                                const bColor = pClass === 'price-up' ? '#00c853' : pClass === 'price-down' ? '#ff1744' : pClass === 'gold-default' ? '#FFD700' : pClass === 'silver-default' ? '#E5E5E5' : '#0f172a';

                                                return (
                                                    <motion.div
                                                        animate={{
                                                            scale: pClass === 'price-up' || pClass === 'price-down' ? 1.04 : 1
                                                        }}
                                                        style={{ borderColor: bColor }}
                                                        className="w-full transition-all duration-300 md:rate-box-premium max-md:max-w-[120px] max-md:h-[55px] max-md:bg-transparent max-md:border-2 max-md:rounded-[10px] max-md:flex max-md:items-center max-md:justify-center max-md:shadow-md max-md:overflow-hidden max-md:px-1"
                                                    >
                                                        <motion.span
                                                            key={`buy-${item.buy}-${pClass}`}
                                                            animate={{ scale: [1, 1.08, 1] }}
                                                            className={`font-black font-poppins tracking-tighter md:tracking-wider ${pClass} max-md:text-[13px]`}
                                                        >
                                                            {item.buy !== '-' ? `₹${fmt(item.buy)}` : '—'}
                                                        </motion.span>
                                                    </motion.div>
                                                );
                                            })()}
                                        </div>

                                        {/* SELL Box Container */}
                                        <div className="flex justify-center w-full">
                                            {(() => {
                                                const pClass = getPriceClass('rtgs', item.id, 'sell');
                                                const bColor = pClass === 'price-up' ? '#00c853' : pClass === 'price-down' ? '#ff1744' : pClass === 'gold-default' ? '#FFD700' : pClass === 'silver-default' ? '#E5E5E5' : '#0f172a';

                                                return (
                                                    <motion.div
                                                        animate={{
                                                            scale: pClass === 'price-up' || pClass === 'price-down' ? 1.04 : 1
                                                        }}
                                                        style={{ borderColor: bColor }}
                                                        className="w-full transition-all duration-300 md:rate-box-premium max-md:max-w-[120px] max-md:h-[55px] max-md:bg-transparent max-md:border-2 max-md:rounded-[10px] max-md:flex max-md:items-center max-md:justify-center max-md:shadow-md max-md:overflow-hidden max-md:px-1"
                                                    >
                                                        <motion.span
                                                            key={`sell-${item.sell}-${pClass}`}
                                                            animate={{ scale: [1, 1.08, 1] }}
                                                            className={`font-black font-poppins tracking-tighter md:tracking-wider ${pClass} max-md:text-[13px]`}
                                                        >
                                                            {item.sell !== '-' ? `₹${fmt(item.sell)}` : '—'}
                                                        </motion.span>
                                                    </motion.div>
                                                );
                                            })()}
                                        </div>

                                        {/* Stock Status Pill */}
                                        <div className="flex justify-center w-full">
                                            <span className={`px-1 md:px-5 py-1 md:py-2 rounded-full text-[8px] md:text-[11px] font-black uppercase tracking-tighter md:tracking-widest transition-all duration-300 shadow-sm w-full text-center ${item.stock ? 'bg-gradient-to-r from-[#e6f9ec] to-[#f0fff4] text-[#1c7c3c]' : 'bg-red-50 text-red-600'}`}>
                                                {item.stock ? 'IN STOCK' : 'OUT'}
                                            </span>
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
