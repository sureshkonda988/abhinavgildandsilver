import React from 'react';
import { useRates } from '../context/RateContext';
import { motion } from 'framer-motion';

const SpotBar = () => {
    const { rates } = useRates();

    const fmt = (val) => {
        if (typeof val !== 'number') return '-';
        return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const gold = rates.spot?.[0] || { bid: '-', ask: '-', name: 'GOLD' };
    const silver = rates.spot?.[1] || { bid: '-', ask: '-', name: 'SILVER' };
    const inr = rates.spot?.[2] || { bid: '-', ask: '-', name: 'USD/INR' };

    const items = [
        { label: 'GOLD', value: gold.ask, symbol: '$' },
        { label: 'SILVER', value: silver.ask, symbol: '$' },
        { label: 'USD/INR', value: inr.ask, symbol: '₹' }
    ];

    return (
        <div className="w-full bg-transparent flex flex-row flex-wrap items-center justify-end gap-3 md:gap-12 px-4 md:px-12">
            {items.map((item, idx) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="flex flex-col items-center group md:flex-initial"
                >
                    <span className="text-gold-400 font-poppins font-black text-[7px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.3em] mb-0.5 drop-shadow-md">
                        {item.label}
                    </span>
                    <div className="flex items-baseline gap-1 md:gap-2 px-0 py-0 bg-transparent transition-all w-auto justify-center">
                        <span className="text-white/60 font-playfair font-black text-[9px] md:text-lg">{item.symbol}</span>
                        <span className="text-white font-playfair font-black text-sm md:text-5xl tracking-tighter whitespace-nowrap drop-shadow-lg">
                            {fmt(item.value)}
                        </span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default SpotBar;
