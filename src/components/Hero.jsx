import React from 'react';
import { motion } from 'framer-motion';
import { useRates } from '../context/RateContext';
import SpotRatesCard from './SpotRatesCard';
import SpotBar from './SpotBar';

import Ticker from './Ticker';

const Hero = () => {
    const { rates, rawRates, loading, error } = useRates();

    const fmt = (val) => {
        if (typeof val !== 'number') return '-';
        return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="w-full inventory-section">
            {/* Rates Table Section - Restored for detailed data */}
            <section className="max-w-7xl mx-auto px-4 md:px-6 w-full mt-0 md:mt-6 relative z-10 mb-8 md:mb-12 pb-0">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="flex flex-col gap-12"
                >
                    <div className="flex flex-col gap-8 md:gap-16">
                        {/* Physical Inventory Column */}
                        <div className="flex flex-col gap-6">
                            {loading && !rates.rtgs.length && (
                                <div className="text-center font-poppins font-bold text-xs text-gold-400 animate-pulse uppercase tracking-widest">
                                    Fetching Live Market Data...
                                </div>
                            )}
                            {error && (
                                <div className="text-center font-poppins font-black text-[10px] text-red-500 bg-red-50 py-2 rounded-xl uppercase tracking-widest border border-red-100">
                                    Connection Alert: {error}
                                </div>
                            )}
                            <div className="bg-white rounded-2xl overflow-hidden shadow-luxury border border-slate-200">
                                <div className="gradient-vibrant p-3">
                                    <span className="text-white font-poppins font-bold text-xs uppercase tracking-widest">Inventory Rates</span>
                                </div>
                                <div className="p-0 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                                    <table className="w-full text-left border-collapse min-w-full md:min-w-0">
                                        <thead>
                                            <tr className="border-b border-slate-100 whitespace-nowrap bg-slate-50/50">
                                                <th className="py-2 px-3 md:py-3 md:px-4 text-[9px] md:text-[11px] font-extrabold text-slate-500 uppercase tracking-tight md:tracking-widest text-left">Item Name</th>
                                                <th className="py-2 px-3 md:py-3 md:px-4 text-[9px] md:text-[11px] font-extrabold text-slate-500 uppercase tracking-tight md:tracking-widest text-center">Buy (INR)</th>
                                                <th className="py-2 px-3 md:py-3 md:px-4 text-[9px] md:text-[11px] font-extrabold text-slate-500 uppercase tracking-tight md:tracking-widest text-center">Sell (INR)</th>
                                                <th className="py-2 px-3 md:py-3 md:px-4 text-[9px] md:text-[11px] font-extrabold text-red-500/60 uppercase tracking-tight md:tracking-widest text-center">Low</th>
                                                <th className="py-2 px-3 md:py-3 md:px-4 text-[9px] md:text-[11px] font-extrabold text-green-500/60 uppercase tracking-tight md:tracking-widest text-center">High</th>
                                                <th className="py-2 px-3 md:py-3 md:px-4 text-[9px] md:text-[11px] font-extrabold text-slate-500 uppercase tracking-tight md:tracking-widest text-right">Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {rates.rtgs.map((item, idx) => {
                                                const rawItem = rawRates.rtgs.find(r => r.id === item.id || (r.name && r.name === item.name)) || item;
                                                return (
                                                    <tr key={idx} className="hover:bg-slate-50 transition-colors group whitespace-nowrap">
                                                        <td className="py-3 px-3 md:py-4 md:px-4 text-[10px] md:text-[13px] font-bold text-slate-900 font-poppins">{item.name}</td>
                                                        <td className="py-3 px-3 md:py-4 md:px-4 text-[11px] md:text-[13px] font-black text-slate-900 text-center font-poppins">₹{item.buy !== '-' ? fmt(item.buy) : '-'}</td>
                                                        <td className="py-3 px-3 md:py-4 md:px-4 text-[11px] md:text-[13px] font-black text-magenta-600 text-center font-poppins group-hover:text-magenta-800 transition-colors">₹{fmt(rawItem.sell)}</td>
                                                        <td className="py-3 px-3 md:py-4 md:px-4 text-[10px] md:text-[12px] font-black text-red-600 text-center font-poppins">₹{rawItem.low !== '-' ? fmt(rawItem.low) : fmt(rawItem.sell)}</td>
                                                        <td className="py-3 px-3 md:py-4 md:px-4 text-[10px] md:text-[12px] font-black text-green-600 text-center font-poppins">₹{rawItem.high !== '-' ? fmt(rawItem.high) : fmt(rawItem.sell)}</td>
                                                        <td className="py-3 px-3 md:py-4 md:px-4 text-right">
                                                            <span className={`px-1.5 md:px-2 py-0.5 rounded-full text-[7px] md:text-[10px] font-black uppercase whitespace-nowrap ${item.stock ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                                                                {item.stock ? 'In Stock' : 'Out'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default Hero;
