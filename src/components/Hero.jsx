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
        <div className="flex justify-center mb-0 md:mb-0.5">
            <h2 className="text-xl md:text-[26px] font-playfair font-black text-magenta-700 uppercase tracking-[0.2em] border-b-2 border-magenta-100 pb-1 text-center">
                {text}
            </h2>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="w-full inventory-section min-h-[50vh] relative overflow-hidden pt-2 md:pt-0"
        >

            {/* Ambient Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 10% 20%, #fff, transparent 80%)' }} />

            {/* Table 1: Live Rates */}
            <section className="max-w-xl mx-auto px-4 md:px-6 w-full mt-2 md:mt-0 relative z-10 mb-2">
                <Heading text="LIVE SPOT RATES" />
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="flex flex-col gap-1 md:gap-2"
                >
                    <div className="flex flex-col gap-0 md:gap-0.5">
                        {/* Header Row Table 1 */}
                        <div className="px-3 md:px-0 py-1 mb-1">
                            <div className="grid grid-cols-[1.2fr_1.4fr_60px] md:grid-cols-[1.2fr_1.5fr_80px] gap-2 md:gap-4 items-center w-full">
                                <div className="flex justify-start pl-2 md:pl-3">
                                    <span className="inline-flex items-center justify-center px-3 py-1 md:px-4 md:py-1.5 rounded-xl bg-transparent border-[1.5px] md:border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[9px] md:text-sm tracking-widest shadow-sm backdrop-blur-sm">PRODUCTS</span>
                                </div>
                                <div className="flex justify-center w-full">
                                    <span className="inline-flex items-center justify-center px-6 py-1 md:px-8 md:py-1.5 rounded-xl bg-transparent border-[1.5px] md:border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[9px] md:text-sm tracking-widest shadow-sm backdrop-blur-sm">LIVE</span>
                                </div>
                                <div className="flex justify-center w-full">
                                    <span className="inline-flex items-center justify-center px-2 py-1 md:px-3 md:py-1.5 rounded-xl bg-transparent border-[1.5px] md:border-2 border-slate-900/20 text-slate-900 font-playfair font-black text-[9px] md:text-sm tracking-widest shadow-sm backdrop-blur-sm">STATUS</span>
                                </div>
                            </div>
                        </div>

                                        {rawRates.rtgs.filter(item => !(item.name.toLowerCase().includes('silver') && item.name.toLowerCase().includes('10 kg'))).map((item, idx) => {
                            const pClass = getPriceClass('rtgs', item.id, 'sell');
                            const bColor = pClass === 'price-up' ? '#00c853' : pClass === 'price-down' ? '#ff1744' : pClass === 'gold-default' ? '#FFD700' : pClass === 'silver-default' ? '#CFE9E1' : '#0f172a';
                            const effectiveStock = adj.stockOverrides?.[item.id] !== undefined ? adj.stockOverrides[item.id] : item.stock;

                            return (
                                <motion.div
                                    key={`live-${idx}`}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.12 }}
                                    className="bg-white/10 backdrop-blur-sm rounded-[16px] py-2 px-3 md:bg-transparent md:backdrop-blur-none md:rounded-none md:py-2 md:px-0 md:shadow-none md:border-none relative group"
                                >
                                    <div className="grid grid-cols-[1.2fr_1.4fr_60px] md:grid-cols-[1.2fr_1.5fr_80px] gap-2 md:gap-4 items-center w-full relative">
                                        <div className="flex flex-col justify-center min-w-0 pl-2 md:pl-3">
                                            <span className="text-[12px] md:text-lg font-black text-slate-900 font-poppins uppercase tracking-tight leading-tight group-hover:text-magenta-700 transition-colors duration-300">
                                                {item.name.split('(')[0]}
                                            </span>
                                            <span className="text-[9px] md:text-[11px] font-bold text-slate-500 font-poppins uppercase tracking-wider mt-0.5">
                                                {item.name.toLowerCase().includes('gold') ? '10 Grams' : '30 Kg'}
                                            </span>
                                        </div>

                                        <div className="flex justify-center w-full">
                                            <motion.div
                                                style={{ backgroundColor: bColor, borderColor: '#000000', borderWidth: window.innerWidth >= 768 ? '4px' : '3px' }}
                                                className="w-full transition-all duration-300 max-w-[140px] md:max-w-[200px] py-2 md:py-1.5 px-2 md:px-4 rounded-[14px] md:rounded-[18px] flex items-center justify-center shadow-md"
                                            >
                                                <span
                                                    className={`font-black font-poppins text-center tracking-tighter md:tracking-normal text-[14px] md:text-[22px] leading-none ${bColor === '#FFD700' || bColor === '#CFE9E1' || bColor === '#E5E5E5' ? 'text-slate-900' : 'text-white'}`}
                                                >
                                                    {item.sell !== '-' ? <><span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span>{fmt(item.sell)}</> : '—'}
                                                </span>
                                            </motion.div>
                                        </div>

                                        <div className="flex justify-center w-full">
                                            <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full transition-all duration-300 shadow-sm ${effectiveStock ? 'bg-[#e6f9ec] text-[#1c7c3c] border border-[#1c7c3c]/20' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                                {effectiveStock ? <Check size={18} strokeWidth={3} /> : <Minus size={18} strokeWidth={3} />}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </section>

            {/* Table 2: Market Rates (Bullion Style) */}
            <section className="w-full relative z-10 mb-8 md:mb-12">
                <div className="max-w-[1600px] mx-auto px-4">
                    <Heading text="GOLD AND SILVER RETAIL RATES" />
                    
                    <div className="flex flex-col xl:flex-row items-center justify-center gap-4 xl:gap-8 mt-4">
                        {/* LEFT IMAGE: Gold Bars (Desktop Only) */}
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="hidden xl:block w-[20%] max-w-[300px]"
                        >
                            <img 
                                src="/Untitled design (38).webp" 
                                alt="Gold Bars" 
                                className="w-full h-auto object-contain drop-shadow-luxury"
                            />
                        </motion.div>

                        {/* CENTER: Rate Table */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="w-full max-w-[850px] bg-white/10 backdrop-blur-md rounded-[32px] p-4 md:p-6 border border-white/20 shadow-luxury"
                        >
                            {/* Table Header */}
                            <div className="grid grid-cols-[1.4fr_1.1fr_1.1fr_1.1fr] gap-1.5 md:gap-3 mb-1.5 md:mb-3 px-1.5 md:px-3">
                                <span className="text-[8px] md:text-xs font-black text-slate-900 uppercase tracking-widest text-left opacity-60 pl-1 md:pl-2">Products</span>
                                <span className="text-[8px] md:text-xs font-black text-slate-900 uppercase tracking-widest text-center opacity-60">Buy</span>
                                <span className="text-[8px] md:text-xs font-black text-slate-900 uppercase tracking-widest text-center opacity-60">Sell</span>
                                <span className="text-[8px] md:text-xs font-black text-slate-900 uppercase tracking-widest text-center opacity-60 pr-0.5 md:pr-1">High / Low</span>
                            </div>

                            <div className="flex flex-col gap-1.5 md:gap-2">
                                {(() => {
                                    const rtgsItems = [
                                        rates.rtgs.find(r => r.id === '945') || { name: 'Gold 999 (10 Grams)', buy: '-', sell: '-', high: '-', low: '-', id: 'gold_default' },
                                        rates.rtgs.find(r => r.name.toLowerCase().includes('30 kg')) || { name: 'Silver 999 (30 Kgs)', buy: '-', sell: '-', high: '-', low: '-', id: 'silver_30_default' },
                                        (() => {
                                            const raw30 = rates.rtgs.find(r => r.name.toLowerCase().includes('10 kg') || r.id === '2987');
                                            if (!raw30) return { name: 'Silver 999 (5 Kgs)', buy: '-', sell: '-', high: '-', low: '-', id: 'silver_5_default' };
                                            return {
                                                ...raw30,
                                                name: 'Silver 999 (5 Kgs)',
                                                buy: typeof raw30.buy === 'number' ? raw30.buy / 2 : raw30.buy,
                                                sell: typeof raw30.sell === 'number' ? raw30.sell / 2 : raw30.sell,
                                                high: typeof raw30.high === 'number' ? raw30.high / 2 : raw30.high,
                                                low: typeof raw30.low === 'number' ? raw30.low / 2 : raw30.low,
                                                id: 'silver_5_kg'
                                            };
                                        })()
                                    ];

                                    return rtgsItems.map((item, idx) => (
                                        <motion.div
                                            key={`retail-${item.id}-${idx}`}
                                            className="bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-1.5 md:p-3 border border-slate-100/50 shadow-sm"
                                        >
                                            <div className="grid grid-cols-[1.4fr_1.1fr_1.1fr_1.1fr] items-center gap-1.5 md:gap-3">
                                                {/* Product Name */}
                                                <div className="flex flex-col pl-1 md:pl-2">
                                                    <span className="text-[12px] md:text-[18px] font-black text-slate-900 leading-tight uppercase font-poppins">
                                                        {item.name.split('(')[0].trim()}
                                                    </span>
                                                    <span className="text-[8px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest md:tracking-[0.2em] mt-0.5 md:mt-1">
                                                        {item.name.match(/\(([^)]+)\)/)?.[1] || (item.name.toLowerCase().includes('gold') ? '10 Grams' : '5 Kgs')}
                                                    </span>
                                                </div>

                                                {/* BUY Box */}
                                                <div className="flex justify-center w-full">
                                                    <motion.div 
                                                        animate={{ backgroundColor: getPriceClass('rtgs', item.id, 'buy') === 'price-up' ? '#00c853' : getPriceClass('rtgs', item.id, 'buy') === 'price-down' ? '#ff1744' : '#FFD700' }}
                                                        className="w-full h-8 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center border-[1.5px] md:border-2 border-slate-900 shadow-[2px_2px_0px_#000000] md:shadow-[3px_3px_0px_#000000]"
                                                    >
                                                        <span className={`text-[11px] md:text-[21px] font-black font-poppins ${['price-up', 'price-down'].includes(getPriceClass('rtgs', item.id, 'buy')) ? 'text-white' : 'text-slate-900'}`}>
                                                            {item.buy !== '-' ? <>₹{fmt(item.buy)}</> : '—'}
                                                        </span>
                                                    </motion.div>
                                                </div>

                                                {/* SELL Box */}
                                                <div className="flex justify-center w-full">
                                                    <motion.div 
                                                        animate={{ backgroundColor: getPriceClass('rtgs', item.id, 'sell') === 'price-up' ? '#00c853' : getPriceClass('rtgs', item.id, 'sell') === 'price-down' ? '#ff1744' : '#FFD700' }}
                                                        className="w-full h-8 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center border-[1.5px] md:border-2 border-slate-900 shadow-[2px_2px_0px_#000000] md:shadow-[3px_3px_0px_#000000]"
                                                    >
                                                        <span className={`text-[11px] md:text-[21px] font-black font-poppins ${['price-up', 'price-down'].includes(getPriceClass('rtgs', item.id, 'sell')) ? 'text-white' : 'text-slate-900'}`}>
                                                            {item.sell !== '-' ? <>₹{fmt(item.sell)}</> : '—'}
                                                        </span>
                                                    </motion.div>
                                                </div>

                                                {/* HIGH/LOW Box */}
                                                <div className="flex flex-col gap-0.5 md:gap-1 pr-0.5 md:pr-1">
                                                    <div className="bg-[#00c853] rounded-md md:rounded-lg py-0.5 md:py-1 px-1.5 md:px-2 flex items-center justify-between shadow-sm">
                                                        <span className="text-[6px] md:text-[9px] font-black text-white/90 uppercase">HI</span>
                                                        <span className="text-[8px] md:text-[13px] font-black text-white">
                                                            {item.high !== '-' ? <>₹{fmt(item.high)}</> : '—'}
                                                        </span>
                                                    </div>
                                                    <div className="bg-[#ff1744] rounded-md md:rounded-lg py-0.5 md:py-1 px-1.5 md:px-2 flex items-center justify-between shadow-sm">
                                                        <span className="text-[6px] md:text-[9px] font-black text-white/90 uppercase">LO</span>
                                                        <span className="text-[8px] md:text-[13px] font-black text-white">
                                                            {item.low !== '-' ? <>₹{fmt(item.low)}</> : '—'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ));
                                })()}
                            </div>
                        </motion.div>

                        {/* RIGHT IMAGE: Silver Bars (Desktop Only) */}
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="hidden xl:block w-[20%] max-w-[300px]"
                        >
                            <img 
                                src="/ChatGPT Image Mar 17, 2026, 10_58_54 AM.webp" 
                                alt="Silver Bars" 
                                className="w-full h-auto object-contain drop-shadow-luxury inv-x"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Ticker below Table 2 */}
            <div className="w-full relative z-20 py-0 my-0">
                <Ticker />
            </div>

            {/* Music Toggle - Mobile Only (below tables) */}
            <div className="flex md:hidden justify-center pt-4 pb-6">
                <button
                    onClick={toggleMusic}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg transition-all border-2 font-poppins font-bold text-xs uppercase tracking-widest ${isMusicEnabled ? 'bg-magenta-600 border-magenta-400 text-white animate-pulse' : 'bg-white/80 border-slate-200 text-slate-700'} hover:scale-105`}
                    title={isMusicEnabled ? 'Turn Off Music' : 'Turn On Music'}
                >
                    <Music size={16} />
                    {isMusicEnabled ? 'Music On' : 'Music Off'}
                </button>
            </div>


        </motion.div>
    );
};

export default Hero;
