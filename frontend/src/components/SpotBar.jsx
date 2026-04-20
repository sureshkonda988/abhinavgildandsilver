import React from 'react';
import { useRates } from '../context/RateContext';

const SpotBar = ({ noBoxes }) => {
    const { rates, getRateChangeType, getRateColor, previousRates, currentRates } = useRates();

    const fmt = (val) => {
        if (typeof val !== 'number') return '-';
        return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const gold = rates.spot?.[0] || { bid: '-', ask: '-', name: 'GOLD' };
    const silver = rates.spot?.[1] || { bid: '-', ask: '-', name: 'SILVER' };
    const inr = rates.spot?.[2] || { bid: '-', ask: '-', name: 'USD/INR' };

    const items = [
        { label: 'USD-INR (₹)', value: fmt(inr.ask), h: fmt(inr.high), l: fmt(inr.low), symbol: '₹', id: inr.id, trend: inr.trend },
        { label: 'GOLD ($)', value: fmt(gold.ask), h: fmt(gold.high), l: fmt(gold.low), symbol: '$', id: gold.id, trend: gold.trend },
        { label: 'SILVER ($)', value: fmt(silver.ask), h: fmt(silver.high), l: fmt(silver.low), symbol: '$', id: silver.id, trend: silver.trend }
    ];

    if (!rates) return null;

    return (
        <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-1 md:gap-1 px-1 md:px-4 py-0.5 md:py-1">
            <div className="flex items-center justify-center gap-1.5 md:gap-3">
                {items.map((item, idx) => {
                    const changeType = item.trend || 'stable';
                    
                    // Original bright colors for the boxes on main Home page
                    const boxDefault = item.label.includes('USD-INR') ? '#ffffff' : item.label.includes('GOLD') ? '#facc15' : '#CFE9E1';
                    // User requested white text for Home Page 1 (noBoxes) despite light background
                    const textDefault = item.label.includes('USD-INR') ? '#ffffff' : item.label.includes('GOLD') ? '#facc15' : '#CFE9E1';

                    const effectiveDefault = noBoxes ? textDefault : boxDefault;
                    const bColor = getRateColor(changeType, effectiveDefault);
                    
                    return (
                        <div key={idx} className="flex flex-col items-center">
                            <span 
                                className={`text-[7px] md:text-[13px] font-bold uppercase tracking-tight font-poppins mb-1 md:mb-1.5 transition-colors duration-300 text-slate-900`}
                            >
                                {item.label}
                            </span>
                            <div
                                style={noBoxes ? {} : { backgroundColor: bColor }}
                                className={noBoxes 
                                    ? `flex flex-col items-center ${item.label.includes('USD-INR') ? 'min-w-[100px] md:min-w-[180px]' : 'min-w-[110px] md:min-w-[200px]'} transition-all duration-300`
                                    : `border-[1.5px] md:border-2 border-slate-200 rounded-lg md:rounded-xl px-1 md:px-8 py-2 md:py-3 flex flex-col items-center ${item.label.includes('USD-INR') ? 'min-w-[115px] md:min-w-[220px]' : 'min-w-[125px] md:min-w-[250px]'} shadow-lg group relative overflow-hidden`
                                }
                            >
                                <div className="flex items-center gap-1.5 md:gap-2">
                                    <span 
                                        style={{ fontFamily: 'Inter, system-ui, sans-serif', color: noBoxes ? bColor : 'black' }} 
                                        className={`${noBoxes ? 'text-[11px] md:text-2xl opacity-80' : 'text-[9px] md:text-lg opacity-60'} font-bold`}
                                    >
                                        {item.symbol}
                                    </span>
                                    <span 
                                        style={{ color: noBoxes ? bColor : 'black' }} 
                                        className={`${noBoxes ? 'text-[20px] md:text-5xl filter drop-shadow-sm' : 'text-[18px] md:text-4xl'} font-black font-poppins`}
                                    >
                                        {item.value}
                                    </span>
                                </div>
                                <div 
                                    className="flex items-center gap-0.5 md:gap-2 text-[7px] md:text-[11px] font-bold font-mono whitespace-nowrap"
                                    style={{ color: noBoxes ? bColor : 'rgba(0,0,0,0.5)' }}
                                >
                                    <span>H:{item.h}</span><span className="opacity-30">|</span><span>L:{item.l}</span>
                                </div>
                                {(!noBoxes && (changeType === 'increase' || changeType === 'decrease')) && <div className="absolute top-0 right-0 w-1 md:w-2 h-full bg-white opacity-20" />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SpotBar;
