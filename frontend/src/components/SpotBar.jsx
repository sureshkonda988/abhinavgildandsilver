import React from 'react';
import { useRates } from '../context/RateContext';

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
        <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-1 md:gap-1 px-1 md:px-4 py-0.5 md:py-1">
            <div className="flex items-center justify-center gap-1.5 md:gap-3">
                {items.map((item, idx) => {
                    const pClass = getPriceClass('spot', item.id, 'ask');
                    const bColor = pClass === 'price-up' ? '#4ade80' : pClass === 'price-down' ? '#f87171' : item.label.includes('USD-INR') ? '#f8fafc' : item.label.includes('GOLD') ? '#facc15' : '#E5E5E5';
                    
                    return (
                        <div key={idx} className="flex flex-col items-center">
                            <span className="text-[7px] md:text-[13px] font-bold text-slate-800 uppercase tracking-tight font-poppins mb-1 md:mb-1.5">{item.label}</span>
                            <div
                                style={{ backgroundColor: bColor }}
                                className={`border-[1.5px] md:border-2 border-slate-200 rounded-lg md:rounded-xl px-1 md:px-8 py-2 md:py-3 flex flex-col items-center ${item.label.includes('USD-INR') ? 'min-w-[115px] md:min-w-[220px]' : 'min-w-[125px] md:min-w-[250px]'} shadow-lg group relative overflow-hidden`}
                            >
                                <div className="flex items-center gap-1.5 md:gap-2">
                                    <span style={{ fontFamily: 'Inter, system-ui, sans-serif', color: 'black' }} className="text-[9px] md:text-lg font-bold opacity-60">{item.symbol}</span>
                                    <span style={{ color: 'black' }} className="text-[18px] md:text-4xl font-black font-poppins">{item.value}</span>
                                </div>
                                <div className="flex items-center gap-0.5 md:gap-2 text-[7px] md:text-[11px] font-bold text-black/50 font-mono whitespace-nowrap">
                                    <span>H:{item.h}</span><span className="opacity-30">|</span><span>L:{item.l}</span>
                                </div>
                                {(pClass === 'price-up' || pClass === 'price-down') && <div className="absolute top-0 right-0 w-1 md:w-2 h-full bg-white opacity-20" />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SpotBar;
