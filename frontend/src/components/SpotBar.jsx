import React, { useState, useEffect, useRef } from 'react';
import { useRates } from '../context/RateContext';

const SpotCard = ({ item, isUSDINR, noBoxes, getRateColor, idx }) => {
    // Local state for the trend, initialized with context trend
    const [displayTrend, setDisplayTrend] = useState(item.trend || 'stable');
    const prevValueRef = useRef(item.value);
    const timerRef = useRef(null);

    // Sync with context trend when no session timer is active
    // This handles initial load and returns control to context after timer expires
    useEffect(() => {
        if (!timerRef.current) {
            setDisplayTrend(item.trend || 'stable');
        }
    }, [item.trend]);

    // Effect to handle color persistence timer for LIVE price changes in the current session
    useEffect(() => {
        const newValue = item.value;
        const oldValue = prevValueRef.current;

        // Compare values to detect a genuine change
        if (newValue !== oldValue && newValue !== '-' && oldValue !== '-') {
            const p = parseFloat(oldValue.replace(/,/g, ''));
            const c = parseFloat(newValue.replace(/,/g, ''));

            if (!isNaN(p) && !isNaN(c)) {
                if (c !== p) {
                    // Price changed: Apply Green/Red immediately
                    const newTrend = c > p ? 'increase' : 'decrease';
                    setDisplayTrend(newTrend);

                    // Clear any existing timer
                    if (timerRef.current) clearTimeout(timerRef.current);

                    // Set 2-second persistence for ALL live session changes
                    timerRef.current = setTimeout(() => {
                        timerRef.current = null;
                        // Return to whatever the current context trend is
                        setDisplayTrend(item.trend || 'stable');
                    }, 2000);
                }
            }
            prevValueRef.current = newValue;
        }
    }, [item.value, item.trend]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // Original bright colors for the boxes on main Home page
    const boxDefault = isUSDINR ? '#ffffff' : item.label.includes('GOLD') ? '#facc15' : '#CFE9E1';
    // White text for Home Page 1 (noBoxes)
    const textDefault = isUSDINR ? '#ffffff' : item.label.includes('GOLD') ? '#facc15' : '#CFE9E1';

    const effectiveDefault = noBoxes ? textDefault : boxDefault;
    const bColor = getRateColor(displayTrend, effectiveDefault);

    return (
        <div className="flex flex-col items-center">
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
                {(!noBoxes && (displayTrend === 'increase' || displayTrend === 'decrease')) && <div className="absolute top-0 right-0 w-1 md:w-2 h-full bg-white opacity-20" />}
            </div>
        </div>
    );
};

const SpotBar = ({ noBoxes }) => {
    const { rates, getRateColor } = useRates();

    if (!rates) return null;

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

    return (
        <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-1 md:gap-1 px-1 md:px-4 py-0.5 md:py-1">
            <div className="flex items-center justify-center gap-1.5 md:gap-3">
                {items.map((item, idx) => (
                    <SpotCard 
                        key={idx} 
                        item={item} 
                        isUSDINR={item.label.includes('USD-INR')} 
                        noBoxes={noBoxes} 
                        getRateColor={getRateColor} 
                        idx={idx}
                    />
                ))}
            </div>
        </div>
    );
};

export default SpotBar;
