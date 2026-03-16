import React from 'react';
import { useRates } from '../context/RateContext';
import { motion } from 'framer-motion';

const SpotBar = () => {
    const { rates, getPriceClass } = useRates();

    const fmt = (val) => {
        if (typeof val !== 'number') return '-';
        return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const gold = rates.spot?.[0] || { bid: '-', ask: '-', name: 'GOLD' };
    const silver = rates.spot?.[1] || { bid: '-', ask: '-', name: 'SILVER' };
    const inr = rates.spot?.[2] || { bid: '-', ask: '-', name: 'USD/INR' };

    const items = [
        { label: 'USD-INR (₹)', value: fmt(inr.ask), h: fmt(inr.high), l: fmt(inr.low), symbol: '₹', id: inr.id },
        { label: 'GOLD ($)', value: fmt(gold.ask), h: fmt(gold.high), l: fmt(gold.low), symbol: '$', id: gold.id },
        { label: 'SILVER ($)', value: fmt(silver.ask), h: fmt(silver.high), l: fmt(silver.low), symbol: '$', id: silver.id }
    ];

    if (!rates) return null;

    return (
        <div className="flex flex-wrap md:flex-nowrap items-center justify-end gap-1 md:gap-1 px-1 md:px-4 md:pr-14 py-1 md:py-3">
            {/* Mobile Layout: USD-INR centered above Gold & Silver cluster */}
            <div className="flex flex-col items-center md:flex-row md:items-center gap-1 md:gap-1">
                {/* Top Row: USD-INR */}
                <div className="md:w-auto">
                    {(() => {
                        const item = items[0];
                        const pClass = getPriceClass('spot', item.id, 'ask');
                        const bColor = pClass === 'price-up' ? '#00c853' : pClass === 'price-down' ? '#ff1744' : '#0f172a';
                        const isDarkText = false;

                        return (
                            <motion.div
                                animate={{ scale: pClass === 'price-up' || pClass === 'price-down' ? 1.02 : 1 }}
                                style={{ backgroundColor: bColor }}
                                className="border border-black/10 rounded-lg md:rounded-xl px-0.5 md:px-1 py-0 md:py-1 flex flex-col items-center min-w-[65px] md:min-w-[110px] shadow-lg group relative overflow-hidden"
                            >
                                <span className="text-[6px] md:text-[9px] font-bold text-white/60 uppercase tracking-tight font-poppins">{item.label}</span>
                                <div className="flex items-center gap-0.5 md:gap-1 my-0 md:my-0.5">
                                    <span style={{ fontFamily: 'Inter, system-ui, sans-serif' }} className="text-[7px] md:text-sm font-bold text-white/40">₹</span>
                                    <motion.span key={`val-${item.value}-${item.id}`} animate={{ scale: [1, 1.05, 1] }} className="text-[9px] md:text-xl font-black font-poppins text-white">{item.value}</motion.span>
                                </div>
                                <div className="flex items-center gap-0.5 md:gap-2 text-[5px] md:text-[8px] font-bold text-white/50 font-mono whitespace-nowrap">
                                    <span>H : {item.h}</span><span className="opacity-30">|</span><span>L : {item.l}</span>
                                </div>
                                {(pClass === 'price-up' || pClass === 'price-down') && <div className="absolute top-0 right-0 w-1 md:w-2 h-full bg-white opacity-20" />}
                            </motion.div>
                        );
                    })()}
                </div>

                {/* Bottom Row: Gold & Silver */}
                <div className="flex gap-1 md:gap-1">
                    {[items[1], items[2]].map((item, idx) => {
                        const pClass = getPriceClass('spot', item.id, 'ask');
                        const bColor = pClass === 'price-up' ? '#00c853' : pClass === 'price-down' ? '#ff1744' : item.label.includes('GOLD') ? '#FFD700' : '#E5E5E5';
                        const isDarkText = bColor === '#FFD700' || bColor === '#E5E5E5';

                        return (
                            <motion.div
                                key={idx}
                                animate={{ scale: pClass === 'price-up' || pClass === 'price-down' ? 1.02 : 1 }}
                                style={{ backgroundColor: bColor }}
                                className="border border-black/10 rounded-lg md:rounded-xl px-0.5 md:px-2 py-1 md:py-2 flex flex-col items-center min-w-[80px] md:min-w-[130px] shadow-lg group relative overflow-hidden"
                            >
                                <span className={`text-[6px] md:text-[9px] font-bold ${isDarkText ? 'text-black/60' : 'text-white/60'} uppercase tracking-tight font-poppins`}>{item.label}</span>
                                <div className="flex items-center gap-0.5 md:gap-1 my-0 md:my-0.5">
                                    <span className={`text-[7px] md:text-sm font-bold ${isDarkText ? 'text-black/40' : 'text-white/40'}`}>{item.symbol}</span>
                                    <motion.span key={`val-${item.value}-${item.id}`} animate={{ scale: [1, 1.05, 1] }} className={`text-[9px] md:text-xl font-black font-poppins ${isDarkText ? 'text-black' : 'text-white'}`}>{item.value}</motion.span>
                                </div>
                                <div className={`flex items-center gap-0.5 md:gap-2 text-[5px] md:text-[8px] font-bold ${isDarkText ? 'text-black/50' : 'text-white/50'} font-mono whitespace-nowrap`}>
                                    <span>H : {item.h}</span><span className="opacity-30">|</span><span>L : {item.l}</span>
                                </div>
                                {(pClass === 'price-up' || pClass === 'price-down') && <div className="absolute top-0 right-0 w-1 md:w-2 h-full bg-white opacity-20" />}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SpotBar;
