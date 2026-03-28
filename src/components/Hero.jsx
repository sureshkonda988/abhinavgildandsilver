import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, TrendingUp, TrendingDown, Minus, Volume2, VolumeX, Music } from 'lucide-react';
import { useRates } from '../context/RateContext';
import SpotBar from './SpotBar';

import Ticker from './Ticker';

const Hero = () => {
    const { rates, rawRates, loading, error, getPriceClass, isMusicEnabled, toggleMusic, adj } = useRates();

    const fmt = (val) => {
        if (typeof val !== 'number') return '-';
        return val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const Heading = ({ text }) => (
        <div className="flex justify-center mb-2 mt-4 md:mt-0 md:mb-0">
            <h2 className="text-base sm:text-lg md:text-[26px] font-playfair font-black text-magenta-700 uppercase tracking-tighter sm:tracking-[0.1em] md:tracking-[0.2em] border-b-2 border-magenta-100 pb-0.5 text-center whitespace-nowrap overflow-visible max-w-full px-1">
                {text}
            </h2>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="w-full inventory-section min-h-[50vh] relative overflow-hidden pt-2 md:pt-12"
        >

            {/* Ambient Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 10% 20%, #fff, transparent 80%)' }} />


            {/* Table 1: Live Rates */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 w-full mt-1 relative z-10 mb-2">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-12">
                    
                    {/* Left Decorative Image */}
                    <motion.div 
                        initial={{ opacity: 0, x: -150 }} 
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="hidden lg:block w-72 shrink-0 h-auto"
                    >
                        <img src="/Untitled design (38).webp" alt="" className="w-full h-auto object-contain opacity-100 hover:scale-105 transition-all duration-700 drop-shadow-lg" title="Gold Decoration" />
                    </motion.div>

                    <div className="max-w-3xl w-full">
                        <Heading text="LIVE SPOT RATES" />
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, ease: "easeOut" }}
                            className="flex flex-col gap-1 md:gap-2 mt-2 md:mt-4"
                        >
                            <div className="flex flex-col gap-0 md:gap-0.5">
                                 {/* Header Row Table 1 - Hidden on Mobile */}
                                <div className="hidden md:block px-3 md:px-0 py-1 mb-1 md:mb-3">
                                    <div className="grid grid-cols-[1.2fr_1.4fr_60px] md:grid-cols-[1.2fr_1.5fr_100px] gap-2 md:gap-6 items-center w-full">
                                        <div className="flex justify-start pl-2 md:pl-3">
                                            <span className="inline-flex items-center justify-center px-3 py-0.5 md:px-6 md:py-1.5 rounded-xl bg-transparent border-[1.5px] md:border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[9px] md:text-lg tracking-widest shadow-sm backdrop-blur-sm">PRODUCTS</span>
                                        </div>
                                        <div className="flex justify-center w-full">
                                            <span className="inline-flex items-center justify-center px-6 py-0.5 md:px-12 md:py-1.5 rounded-xl bg-transparent border-[1.5px] md:border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[9px] md:text-lg tracking-widest shadow-sm backdrop-blur-sm">LIVE</span>
                                        </div>
                                        <div className="flex justify-center w-full">
                                            <span className="inline-flex items-center justify-center px-2 py-0.5 md:px-5 md:py-1.5 rounded-xl bg-transparent border-[1.5px] md:border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[9px] md:text-lg tracking-widest shadow-sm backdrop-blur-sm">STATUS</span>
                                        </div>
                                    </div>
                                </div>

                                 {/* Transposed Table for Mobile, Original for Desktop */}
                                <div className="flex flex-col md:block">
                                    {/* Mobile Headers (Labels on left) */}
                                    <div className="md:hidden flex flex-col gap-4">
                                        {/* Products Row */}
                                        <div className="grid grid-cols-[100px_1fr_1fr] gap-2 items-center">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">PRODUCTS</span>
                                            {rawRates.rtgs.filter(item => !(item.name.toLowerCase().includes('silver') && (item.name.toLowerCase().includes('10 kg') || item.name.toLowerCase().includes('5 kg')))).map((item, idx) => (
                                                <div key={idx} className="flex flex-col items-center">
                                                    <span className="text-[12px] font-black text-slate-900 uppercase leading-tight text-center">{item.name.split('(')[0]}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase">{item.name.match(/\((.*?)\)/)?.[1] || (item.name.toLowerCase().includes('gold') ? '10 Grams' : '30 KGS')}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Live Row */}
                                        <div className="grid grid-cols-[100px_1fr_1fr] gap-2 items-center">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">LIVE</span>
                                            {rawRates.rtgs.filter(item => !(item.name.toLowerCase().includes('silver') && (item.name.toLowerCase().includes('10 kg') || item.name.toLowerCase().includes('5 kg')))).map((item, idx) => {
                                                const pClass = getPriceClass('rtgs', item.id, 'sell');
                                                const bColor = pClass === 'price-up' ? '#4ade80' : pClass === 'price-down' ? '#f87171' : pClass === 'gold-default' ? '#facc15' : pClass === 'silver-default' ? '#CFE9E1' : '#0f172a';
                                                return (
                                                    <div key={idx} className="flex justify-center">
                                                        <div style={{ backgroundColor: bColor }} className="w-full max-w-[100px] py-3 rounded-xl flex items-center justify-center shadow-md border border-black/10">
                                                            <span className="font-black text-[16px] text-slate-900 tracking-tighter leading-none whitespace-nowrap">
                                                                <span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span>{fmt(item.sell * (item.factor || 1))}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/* Status Row */}
                                        <div className="grid grid-cols-[100px_1fr_1fr] gap-2 items-center">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">STATUS</span>
                                            {rawRates.rtgs.filter(item => !(item.name.toLowerCase().includes('silver') && (item.name.toLowerCase().includes('10 kg') || item.name.toLowerCase().includes('5 kg')))).map((item, idx) => {
                                                const effectiveStock = adj.stockOverrides?.[item.id] !== undefined ? adj.stockOverrides[item.id] : item.stock;
                                                return (
                                                    <div key={idx} className="flex justify-center">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${effectiveStock ? 'bg-[#e6f9ec] text-[#1c7c3c] border border-[#1c7c3c]/20' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                            {effectiveStock ? <Check size={20} strokeWidth={3} /> : <Minus size={20} strokeWidth={3} />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Desktop Layout (Original Grid) */}
                                    <div className="hidden md:flex md:flex-col gap-2">
                                        {rawRates.rtgs.filter(item => !(item.name.toLowerCase().includes('silver') && (item.name.toLowerCase().includes('10 kg') || item.name.toLowerCase().includes('5 kg')))).map((item, idx) => {
                                            const pClass = getPriceClass('rtgs', item.id, 'sell');
                                            const bColor = pClass === 'price-up' ? '#4ade80' : pClass === 'price-down' ? '#f87171' : pClass === 'gold-default' ? '#facc15' : pClass === 'silver-default' ? '#CFE9E1' : '#0f172a';
                                            const effectiveStock = adj.stockOverrides?.[item.id] !== undefined ? adj.stockOverrides[item.id] : item.stock;

                                            return (
                                                <motion.div
                                                    key={`live-${idx}`}
                                                    initial={{ opacity: 0, x: -30 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: idx * 0.12 }}
                                                    className="md:bg-transparent md:backdrop-blur-none md:rounded-none md:py-2 md:px-0 md:shadow-none md:border-none relative group"
                                                >
                                                    <div className="grid grid-cols-[1.2fr_1.5fr_100px] gap-6 items-center w-full relative">
                                                        <div className="flex flex-col justify-center min-w-0 pl-3">
                                                            <span className="text-[24px] font-black text-slate-900 font-poppins uppercase tracking-tight leading-tight group-hover:text-magenta-700 transition-colors duration-300">
                                                                {item.name.split('(')[0]}
                                                            </span>
                                                            <span className="text-[14px] font-bold text-slate-500 font-poppins uppercase tracking-wider mt-1">
                                                                {item.name.match(/\((.*?)\)/)?.[1] || (item.name.toLowerCase().includes('gold') ? '10 Grams' : '30 KGS')}
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-center w-full">
                                                            <motion.div
                                                                style={{ backgroundColor: bColor, borderColor: '#000000', borderWidth: '2px' }}
                                                                className="w-full transition-all duration-300 max-w-[300px] py-5 px-6 rounded-[24px] flex items-center justify-center shadow-lg hover:scale-105"
                                                            >
                                                                <span className="font-black font-poppins text-center text-[34px] leading-none text-slate-900">
                                                                    {item.sell !== '-' ? <><span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span>{fmt(item.sell * (item.factor || 1))}</> : '—'}
                                                                </span>
                                                            </motion.div>
                                                        </div>

                                                        <div className="flex justify-center w-full">
                                                            <div className={`flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-md ${effectiveStock ? 'bg-[#e6f9ec] text-[#1c7c3c] border border-[#1c7c3c]/30' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                                                {effectiveStock ? <Check className="w-8 h-8" strokeWidth={3} /> : <Minus className="w-8 h-8" strokeWidth={3} />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Decorative Image */}
                    <motion.div 
                        initial={{ opacity: 0, x: 150 }} 
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="hidden lg:block w-72 shrink-0 h-auto"
                    >
                        <img src="/ChatGPT Image Mar 17, 2026, 10_58_54 AM.webp" alt="" className="w-full h-auto object-contain opacity-100 hover:scale-105 transition-all duration-700 drop-shadow-lg" title="Silver Decoration" />
                    </motion.div>

                </div>
            </section>

            {/* Ticker between Table 1 and Table 2 */}
            <div className="w-full relative z-20 py-0 mt-4 md:mt-16">
                <Ticker />
            </div>

            {/* Market Status Box - Moved here as requested */}
            <div className="flex justify-center mt-6 md:mt-8 px-4">
                {(() => {
                    const market = useRates().getMarketStatus();
                    return (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`px-6 py-2 md:px-10 md:py-4 rounded-[24px] border-[1.5px] md:border-[2px] flex flex-col items-center shadow-lg transition-all duration-500 max-w-lg w-full ${market.isOpen ? 'bg-[#22c55e] border-black text-black' : 'bg-[#ef4444] border-black text-black'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full ${market.isOpen ? 'bg-white animate-pulse' : 'bg-white'}`} />
                                <span className="font-poppins font-black text-sm md:text-2xl uppercase tracking-[0.2em]">{market.message}</span>
                            </div>
                            <span className="font-poppins font-black text-[9px] md:text-sm uppercase tracking-[0.3em] mt-1">{market.timings} (IST)</span>
                        </motion.div>
                    );
                })()}
            </div>

            {/* Table 2: Market Rates (Bullion Style) */}
            <section className="max-w-3xl mx-auto px-4 md:px-8 w-full mt-6 md:mt-20 mb-8 md:mb-12 relative z-10">
                <Heading text="LOCAL GOLD AND SILVER RETAIL RATES" />
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="flex flex-col gap-1 md:gap-2 mt-2 md:mt-4"
                >
                    <div className="flex flex-col gap-0 md:gap-0.5">
                        {/* Header Row Table 2 - Hidden on Mobile */}
                        <div className="hidden md:block px-3 md:px-0 py-1 mb-1 md:mb-3">
                            <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] md:grid-cols-[1.2fr_1fr_1fr_1fr] gap-2 md:gap-4 items-center w-full">
                                <div className="flex justify-start pl-2 md:pl-3">
                                    <span className="inline-flex items-center justify-center px-3 py-0.5 md:px-4 md:py-1.5 rounded-xl bg-transparent border-[1.5px] md:border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[9px] md:text-base tracking-widest shadow-sm backdrop-blur-sm">PRODUCTS</span>
                                </div>
                                <div className="flex justify-center w-full">
                                    <span className="inline-flex items-center justify-center px-3 py-0.5 md:px-6 md:py-1.5 rounded-xl bg-transparent border-[1.5px] md:border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[9px] md:text-base tracking-widest shadow-sm backdrop-blur-sm">BUY</span>
                                </div>
                                <div className="flex justify-center w-full">
                                    <span className="inline-flex items-center justify-center px-3 py-0.5 md:px-6 md:py-1.5 rounded-xl bg-transparent border-[1.5px] md:border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[9px] md:text-base tracking-widest shadow-sm backdrop-blur-sm">SELL</span>
                                </div>
                                <div className="flex justify-center w-full">
                                    <span className="inline-flex items-center justify-center px-2 py-1 md:px-4 md:py-1.5 rounded-xl bg-transparent border-[1.5px] md:border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[10px] md:text-base tracking-widest shadow-sm backdrop-blur-sm">HI / LO</span>
                                </div>
                            </div>
                        </div>

                        {(() => {
                            const rtgsItems = [
                                rates.rtgs.find(r => r.id === '945') || { name: 'Gold 999 (10 Grams)', buy: '-', sell: '-', high: '-', low: '-', id: 'gold_default' },
                                rates.rtgs.find(r => r.id === '2987' || r.name.toLowerCase().includes('silver')) || { name: 'Silver 999 (1 KG)', buy: '-', sell: '-', high: '-', low: '-', id: 'silver_1_default' }
                            ];

                            return rtgsItems.map((item, idx) => {
                                const lookupId = item.refId || item.id;
                                const buyClass = getPriceClass('rtgs', lookupId, 'buy');
                                const sellClass = getPriceClass('rtgs', lookupId, 'sell');
                                
                                const isSilver = item.name.toLowerCase().includes('silver');
                                const defaultColor = isSilver ? '#CFE9E1' : '#facc15';

                                const buyColor = buyClass === 'price-up' ? '#4ade80' : buyClass === 'price-down' ? '#f87171' : buyClass === 'silver-default' ? '#CFE9E1' : buyClass === 'gold-default' ? '#facc15' : defaultColor;
                                const sellColor = sellClass === 'price-up' ? '#4ade80' : sellClass === 'price-down' ? '#f87171' : sellClass === 'silver-default' ? '#CFE9E1' : sellClass === 'gold-default' ? '#facc15' : defaultColor;

                                return (
                                    <motion.div
                                        key={`retail-${item.id}-${idx}`}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.12 }}
                                        className="bg-white/10 backdrop-blur-sm rounded-[16px] py-2 px-3 md:bg-transparent md:backdrop-blur-none md:rounded-none md:py-2 md:px-0 md:shadow-none md:border-none relative group"
                                    >
                                        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] md:grid-cols-[1.2fr_1fr_1fr_1fr] gap-2 md:gap-4 items-center w-full">
                                            {/* Product Name */}
                                            <div className="flex flex-col justify-center min-w-0 pl-2 md:pl-3">
                                                <span className="text-[12px] md:text-[20px] font-black text-slate-900 font-poppins uppercase tracking-tight leading-tight group-hover:text-magenta-700 transition-colors duration-300">
                                                    {item.name.split('(')[0].trim()}
                                                </span>
                                                <span className="text-[9px] md:text-[12px] font-bold text-slate-500 font-poppins uppercase tracking-wider mt-0.5 md:mt-1">
                                                    {item.name.toLowerCase().includes('gold') ? '10 Grams' : '1 KG'}
                                                </span>
                                            </div>

                                            {/* BUY Box */}
                                            <div className="flex justify-center w-full">
                                                <motion.div
                                                    style={{ backgroundColor: buyColor, borderColor: '#000000', borderWidth: window.innerWidth >= 768 ? '2px' : '1.5px', minHeight: window.innerWidth < 768 ? '54px' : 'auto' }}
                                                    className="w-full transition-all duration-300 max-w-[110px] md:max-w-[240px] py-1 md:py-5 px-1 md:px-3 rounded-[14px] md:rounded-[24px] flex items-center justify-center shadow-lg hover:scale-105"
                                                >
                                                    <span className="font-black font-poppins text-center tracking-tighter md:tracking-normal text-[18px] md:text-[22px] leading-none text-slate-900">
                                                        {item.buy !== '-' ? <><span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span>{fmt(item.buy)}</> : '—'}
                                                    </span>
                                                </motion.div>
                                            </div>

                                            {/* SELL Box */}
                                            <div className="flex justify-center w-full">
                                                <motion.div
                                                    style={{ backgroundColor: sellColor, borderColor: '#000000', borderWidth: window.innerWidth >= 768 ? '2px' : '1.5px', minHeight: window.innerWidth < 768 ? '54px' : 'auto' }}
                                                    className="w-full transition-all duration-300 max-w-[110px] md:max-w-[240px] py-1 md:py-5 px-1 md:px-3 rounded-[14px] md:rounded-[24px] flex items-center justify-center shadow-lg hover:scale-105"
                                                >
                                                    <span className="font-black font-poppins text-center tracking-tighter md:tracking-normal text-[18px] md:text-[22px] leading-none text-slate-900">
                                                        {item.sell !== '-' ? <><span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span>{fmt(item.sell)}</> : '—'}
                                                    </span>
                                                </motion.div>
                                            </div>

                                            {/* HIGH/LOW Box */}
                                            <div className="flex justify-center w-full">
                                                 <div className="flex-1 max-w-[100px] md:max-w-none border-[1.5px] md:border-[2px] border-sky-400 shadow-lg overflow-hidden rounded-[14px] md:rounded-[24px] flex flex-col items-center justify-center" style={{ backgroundColor: '#bae6fd', minHeight: window.innerWidth >= 768 ? '74px' : '54px' }}>
                                                    <div className="flex-1 w-full flex items-center justify-between px-2 md:px-3 border-b border-black/10">
                                                        <span className="text-[9px] md:text-[11px] font-black text-[#16a34a] uppercase">HI</span>
                                                        <span className="text-[14px] md:text-[14px] font-black text-[#16a34a]">
                                                            {item.high !== '-' ? <><span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span>{fmt(item.high)}</> : '—'}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 w-full flex items-center justify-between px-2 md:px-3">
                                                        <span className="text-[9px] md:text-[11px] font-black text-[#dc2626] uppercase">LO</span>
                                                        <span className="text-[14px] md:text-[14px] font-black text-[#dc2626]">
                                                            {item.low !== '-' ? <><span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span>{fmt(item.low)}</> : '—'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            });
                        })()}
                    </div>
                </motion.div>
            </section>

            {/* Music Toggle - Mobile Only (at bottom of content) */}
            <div className="flex md:hidden justify-center pt-8 pb-12">
                <button
                    onClick={toggleMusic}
                    className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-xl transition-all border-2 font-poppins font-bold text-xs uppercase tracking-widest ${isMusicEnabled ? 'bg-magenta-600 border-magenta-400 text-white' : 'bg-white border-slate-200 text-slate-700'} hover:scale-105 active:scale-95`}
                >
                    <Music size={18} strokeWidth={2.5} />
                    {isMusicEnabled ? 'Music On' : 'Music Off'}
                </button>
            </div>
        </motion.div>
    );
};

export default Hero;
