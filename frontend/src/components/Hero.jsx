import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, TrendingUp, TrendingDown, Minus, Volume2, VolumeX, Music } from 'lucide-react';
import { useRates } from '../context/RateContext';
import SpotBar from './SpotBar';

import Ticker from './Ticker';

const Hero = () => {
    const { rates, rawRates, loading, error, getRateChangeType, getRateColor, previousRates, currentRates, isMusicEnabled, toggleMusic, adj } = useRates();

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
            className="w-full inventory-section min-h-[50vh] relative overflow-hidden pt-0 md:pt-1"
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
                        className="hidden lg:block w-32 shrink-0 h-auto"
                    >
                        <img src="/Untitled-design-(38).webp" alt="" className="w-full h-auto object-contain opacity-100 hover:scale-105 transition-all duration-700 drop-shadow-lg" title="Gold Decoration" />
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
                                 {/* Header Row Table 1 */}
                                <div className="px-1 md:px-0 py-1 mb-1 md:mb-3">
                                    <div className="grid grid-cols-[0.8fr_1.5fr_60px] md:grid-cols-[1.2fr_1.5fr_100px] gap-2 md:gap-6 items-center w-full">
                                        <div className="flex justify-start pl-1 md:pl-3">
                                            <span className="inline-flex items-center justify-center px-1.5 py-0.5 md:px-6 md:py-1.5 rounded-xl bg-transparent border-[1.5px] md:border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[9px] md:text-lg tracking-widest shadow-sm backdrop-blur-sm">PRODUCTS</span>
                                        </div>
                                        <div className="flex justify-center w-full">
                                            <span className="inline-flex items-center justify-center px-6 py-0.5 md:px-12 md:py-1.5 rounded-xl bg-transparent border-[1.5px] md:border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[9px] md:text-lg tracking-widest shadow-sm backdrop-blur-sm">LIVE</span>
                                        </div>
                                        <div className="flex justify-center w-full">
                                            <span className="inline-flex items-center justify-center px-1 py-0.5 md:px-5 md:py-1.5 rounded-xl bg-transparent border-[1.5px] md:border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[8px] md:text-lg tracking-widest shadow-sm backdrop-blur-sm">STATUS</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {rawRates.rtgs.filter(item => !(item.name.toLowerCase().includes('silver') && (item.name.toLowerCase().includes('10 kg') || item.name.toLowerCase().includes('5 kg')))).map((item, idx) => {
                                        const prevItem = previousRates?.rtgs?.find(r => r.id === item.id);
                                        const changeType = item.trend || 'stable';
                                        
                                        const isSilver = item.name.toLowerCase().includes('silver');
                                        const defaultColor = isSilver ? '#CFE9E1' : '#facc15';
                                        
                                        const bColor = getRateColor(changeType, defaultColor);
                                        const effectiveStock = adj.stockOverrides?.[item.id] !== undefined ? adj.stockOverrides[item.id] : item.stock;

                                        return (
                                            <motion.div
                                                key={`live-${idx}`}
                                                initial={{ opacity: 0, x: -30 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: idx * 0.12 }}
                                                className="bg-white/10 backdrop-blur-sm rounded-[16px] py-4 md:py-2 md:bg-transparent md:backdrop-blur-none md:rounded-none md:px-0 md:shadow-none md:border-none relative group"
                                            >
                                                <div className="grid grid-cols-[0.8fr_1.5fr_60px] md:grid-cols-[1.2fr_1.5fr_100px] gap-2 md:gap-6 items-center w-full relative">
                                                    {/* Product Section */}
                                                    <div className="flex flex-col justify-center min-w-0 pl-1 md:pl-3">
                                                        <span className="text-[14px] md:text-[24px] font-black text-slate-900 font-poppins uppercase tracking-tight leading-[1.1] md:leading-tight group-hover:text-magenta-700 transition-colors duration-300">
                                                            {item.name.split('(')[0].trim().split(' ').map((word, i) => (
                                                                <span key={i} className="block md:inline">{word} </span>
                                                            ))}
                                                        </span>
                                                        <span className="text-[9px] md:text-[14px] font-bold text-slate-800 font-poppins uppercase tracking-wider mt-0.5 md:mt-1">
                                                            {item.name.match(/\((.*?)\)/)?.[1] || (item.name.toLowerCase().includes('gold') ? '10 Grams' : '30 KGS')}
                                                        </span>
                                                    </div>

                                                    {/* Price Section */}
                                                    <div className="flex justify-center w-full">
                                                        <motion.div
                                                            style={{ backgroundColor: bColor, borderColor: '#000000', borderWidth: '1.5px' }}
                                                            className="w-full transition-all duration-300 max-w-[200px] md:max-w-[300px] py-4 md:py-5 px-3 md:px-6 rounded-[14px] md:rounded-[24px] flex items-center justify-center shadow-lg hover:scale-105"
                                                        >
                                                            <span className="font-black font-poppins text-center text-[28px] md:text-[38px] leading-none text-slate-900 tracking-tighter md:tracking-normal">
                                                                {item.sell !== '-' ? <><span style={{ fontFamily: 'Inter, system-ui, sans-serif', marginRight: '6px' }}>₹</span>{fmt(item.sell * (item.factor || 1))}</> : '—'}
                                                            </span>
                                                        </motion.div>
                                                    </div>

                                                    {/* Status Section */}
                                                    <div className="flex justify-center w-full">
                                                        <div className={`flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full transition-all duration-300 shadow-md ${effectiveStock ? 'bg-[#e6f9ec] text-[#1c7c3c] border border-[#1c7c3c]/30' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                                            {effectiveStock ? <Check className="w-5 h-5 md:w-8 md:h-8" strokeWidth={3} /> : <Minus className="w-5 h-5 md:w-8 md:h-8" strokeWidth={3} />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
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
                        className="hidden lg:block w-32 shrink-0 h-auto"
                    >
                        <img src="/ChatGPT-Image-Mar-17,-2026,-10_58_54-AM.webp" alt="" className="w-full h-auto object-contain opacity-100 hover:scale-105 transition-all duration-700 drop-shadow-lg" title="Silver Decoration" />
                    </motion.div>

                </div>
            </section>

            {/* Ticker */}
            <div className="w-full relative z-20 py-0 -mt-2 md:mt-6">
                <Ticker />
            </div>

            {/* Market Status Box */}
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
                            <span className="font-poppins font-black text-[9px] md:text-sm uppercase tracking-[0.3em] mt-1 text-black">{market.timings} (IST)</span>
                        </motion.div>
                    );
                })()}
            </div>

            {/* Table 2: Retail Rates */}
            <section className="max-w-5xl mx-auto px-1 md:px-8 w-full mt-6 md:mt-20 mb-8 md:mb-12 relative z-10">
                <Heading text="LOCAL GOLD AND SILVER RETAIL RATES" />
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                >
                    <div className="rates-scroll-wrapper mt-2 md:mt-4">
                        <div className="rates-table flex flex-col gap-0 md:gap-0.5">
                            {/* Header Row Table 2 */}
                            <div className="px-1 md:px-0 py-1 mb-1 md:mb-3">
                                <div className="rate-row grid grid-cols-[1fr_1.2fr_1.2fr_1.2fr] md:grid-cols-[1.1fr_1.2fr_1.2fr_1.2fr] gap-1 md:gap-6 items-center w-full">
                                    <div className="product-column flex justify-start pl-1 md:pl-3">
                                        <span className="inline-flex items-center justify-center px-1 py-0.5 md:px-4 md:py-1.5 rounded-xl bg-transparent border-[1.5px] md:border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[8px] md:text-base tracking-widest shadow-sm backdrop-blur-sm">PRODUCTS</span>
                                    </div>
                                    <div className="buy-column flex justify-center w-full">
                                        <span className="inline-flex items-center justify-center px-1 py-0.5 md:px-6 md:py-1.5 rounded-xl bg-transparent border-[1.5px] md:border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[8px] md:text-base tracking-widest shadow-sm backdrop-blur-sm">BUY</span>
                                    </div>
                                    <div className="sell-column flex justify-center w-full">
                                        <span className="inline-flex items-center justify-center px-1 py-0.5 md:px-6 md:py-1.5 rounded-xl bg-transparent border-[1.5px] md:border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[8px] md:text-base tracking-widest shadow-sm backdrop-blur-sm">SELL</span>
                                    </div>
                                    <div className="hilo-column flex justify-center w-full">
                                        <span className="inline-flex items-center justify-center px-1 py-0.5 md:px-4 md:py-1.5 rounded-xl bg-transparent border-[1.5px] md:border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[8px] md:text-base tracking-widest shadow-sm backdrop-blur-sm uppercase">HI / LO</span>
                                    </div>
                                </div>
                            </div>

                            {(() => {
                                const rtgsItems = [
                                    rates.rtgs.find(r => r.id === '945') || { name: 'Gold 999 (10 Grams)', buy: '-', sell: '-', high: '-', low: '-', id: 'gold_default' },
                                    rates.rtgs.find(r => r.id === '2987' || r.name.toLowerCase().includes('silver')) || { name: 'Silver 999 (1 KG)', buy: '-', sell: '-', high: '-', low: '-', id: 'silver_1_default' }
                                ];

                                return rtgsItems.map((item, idx) => {
                                    const lookupId = item.id;
                                    const prevItem = previousRates?.rtgs?.find(r => r.id === lookupId);
                                    const currRawItem = currentRates?.rtgs?.find(r => r.id === lookupId);
                                    
                                    const buyChange = item.trend || 'stable';
                                    const sellChange = item.trend || 'stable';
                                    
                                    const isSilver = item.name.toLowerCase().includes('silver');
                                    const defaultColor = isSilver ? '#CFE9E1' : '#facc15';
                                    
                                    const buyColor = getRateColor(buyChange, defaultColor);
                                    const sellColor = getRateColor(sellChange, defaultColor);

                                    return (
                                        <motion.div
                                            key={`retail-${item.id}-${idx}`}
                                            initial={{ opacity: 0, x: -30 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.12 }}
                                            className="bg-white/10 backdrop-blur-sm rounded-[16px] py-4 md:py-2 md:bg-transparent md:backdrop-blur-none md:rounded-none md:px-0 md:shadow-none md:border-none relative group"
                                        >
                                            <div className="rate-row grid grid-cols-[1fr_1.2fr_1.2fr_1.2fr] md:grid-cols-[1.1fr_1.2fr_1.2fr_1.2fr] gap-1 md:gap-6 items-stretch w-full">
                                                {/* Product Name */}
                                                <div className="product-column flex flex-col justify-center min-w-0 pl-1 md:pl-3">
                                                    <span className="text-[13px] md:text-[20px] font-black text-slate-900 font-poppins uppercase tracking-tight leading-[1.1] md:leading-tight group-hover:text-magenta-700 transition-colors duration-300">
                                                        {item.name.split('(')[0].trim().split(' ').map((word, i) => (
                                                            <span key={i} className="block md:inline">{word} </span>
                                                        ))}
                                                    </span>
                                                    <span className="text-[8px] md:text-[12px] font-bold text-slate-800 font-poppins uppercase tracking-wider mt-0.5 md:mt-1">
                                                        {item.name.toLowerCase().includes('gold') ? <><span className="block md:inline">10</span> <span className="block md:inline">GRAMS</span></> : <><span className="block md:inline">1</span> <span className="block md:inline">KG</span></>}
                                                    </span>
                                                </div>
                                                
                                                {/* BUY Box */}
                                                <div className="buy-column flex justify-center items-stretch w-full">
                                                    <motion.div
                                                        style={{ backgroundColor: buyColor, borderColor: '#000000', borderWidth: '1.5px' }}
                                                        className="w-full transition-all duration-300 max-w-[110px] md:max-w-[240px] py-4 md:py-5 px-1 md:px-3 rounded-[12px] md:rounded-[24px] flex items-center justify-center shadow-lg hover:scale-105 overflow-hidden"
                                                    >
                                                        <span className="font-black font-poppins text-center text-[22px] md:text-[26px] lg:text-[30px] leading-none text-slate-900 tracking-tighter md:tracking-normal">
                                                            {item.buy !== '-' ? <><span style={{ fontFamily: 'Inter, system-ui, sans-serif', marginRight: '5px' }}>₹</span>{fmt(item.buy)}</> : '—'}
                                                        </span>
                                                    </motion.div>
                                                </div>

                                                {/* SELL Box */}
                                                <div className="sell-column flex justify-center items-stretch w-full">
                                                    <motion.div
                                                        style={{ backgroundColor: sellColor, borderColor: '#000000', borderWidth: '1.5px' }}
                                                        className="w-full transition-all duration-300 max-w-[110px] md:max-w-[240px] py-4 md:py-5 px-1 md:px-3 rounded-[12px] md:rounded-[24px] flex items-center justify-center shadow-lg hover:scale-105 overflow-hidden"
                                                    >
                                                        <span className="font-black font-poppins text-center text-[22px] md:text-[26px] lg:text-[30px] leading-none text-slate-900 tracking-tighter md:tracking-normal">
                                                            {item.sell !== '-' ? <><span style={{ fontFamily: 'Inter, system-ui, sans-serif', marginRight: '5px' }}>₹</span>{fmt(item.sell)}</> : '—'}
                                                        </span>
                                                    </motion.div>
                                                </div>

                                                {/* HI/LO Box */}
                                                <div className="hilo-column flex justify-center items-stretch w-full">
                                                    <div className="flex-1 max-w-[100px] md:max-w-[180px] border-[1.5px] md:border-[2px] border-sky-400 shadow-lg overflow-hidden rounded-[12px] md:rounded-[24px] flex flex-col items-center justify-center min-h-[70px] md:min-h-[90px] w-full" style={{ backgroundColor: '#bae6fd' }}>
                                                        <div className="flex-1 w-full flex items-center justify-between px-1 md:px-3 border-b border-black/10">
                                                            <span className="text-[7px] md:text-[11px] font-black text-[#16a34a] uppercase">HI</span>
                                                            <span className="text-[15px] md:text-[18px] lg:text-[22px] font-black text-[#16a34a] leading-none">
                                                                {item.high !== '-' ? <><span style={{ fontFamily: 'Inter, system-ui, sans-serif', marginRight: '4px' }}>₹</span>{fmt(item.high)}</> : '—'}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 w-full flex items-center justify-between px-1 md:px-3">
                                                            <span className="text-[7px] md:text-[11px] font-black text-[#dc2626] uppercase">LO</span>
                                                            <span className="text-[15px] md:text-[18px] lg:text-[22px] font-black text-[#dc2626] leading-none">
                                                                {item.low !== '-' ? <><span style={{ fontFamily: 'Inter, system-ui, sans-serif', marginRight: '4px' }}>₹</span>{fmt(item.low)}</> : '—'}
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
                    </div>
                </motion.div>
            </section>

            {/* Music Toggle */}
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
