import React from 'react';
import { useRates } from '../context/RateContext';
import { motion } from 'framer-motion';

const RatesPage = () => {
    const { rates } = useRates();

    const fmt = (val) => {
        if (typeof val !== 'number') return '-';
        return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-32 px-6 pt-4 max-w-7xl mx-auto"
        >
            <h1 className="text-3xl md:text-5xl font-playfair font-black text-white mb-10 text-center uppercase tracking-tighter drop-shadow-luxury px-4">Live Retail Market Rates</h1>

            <div className="max-w-4xl mx-auto flex flex-col gap-16">
                {/* Retail Gold Rates Table */}
                <div className="flex flex-col gap-6">
                    <div className="gradient-luxury p-4 rounded-t-2xl shadow-lg flex justify-between items-center">
                        <h2 className="text-white font-poppins font-bold text-lg uppercase tracking-widest">Retail Gold Rates (10g)</h2>
                        <span className="text-white/40 text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">RTGS / 999 Base</span>
                    </div>
                    <div className="glass rounded-b-2xl overflow-hidden shadow-luxury">
                        <table className="w-full text-left">
                            <thead className="bg-white/10 border-b border-white/10">
                                <tr>
                                    <th className="px-4 py-5 text-[10px] md:text-[12px] font-black text-white/80 uppercase tracking-widest whitespace-nowrap">Purity</th>
                                    <th className="px-4 py-5 text-[10px] md:text-[12px] font-black text-white/80 uppercase tracking-widest text-center whitespace-nowrap">Buy</th>
                                    <th className="px-4 py-5 text-[10px] md:text-[12px] font-black text-white/80 uppercase tracking-widest text-center whitespace-nowrap">Sell</th>
                                    <th className="px-4 py-5 text-[10px] md:text-[12px] font-black text-red-400/80 uppercase tracking-widest text-center whitespace-nowrap">Low</th>
                                    <th className="px-4 py-5 text-[10px] md:text-[12px] font-black text-green-400/80 uppercase tracking-widest text-right whitespace-nowrap">High</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {[
                                    { label: 'Gold 14 Karat', factor: 0.583 },
                                    { label: 'Gold 18 Karat', factor: 0.75 },
                                    { label: 'Gold 22 Karat', factor: 0.916 },
                                    { label: 'Gold 24 Karat', factor: 1.0 }
                                ].map((karat, idx) => {
                                    const goldBase = rates.rtgs.find(r => r.id === '945');
                                    const baseSell = goldBase && goldBase.sell !== '-' ? goldBase.sell : 0;
                                    const baseBuy = goldBase && goldBase.buy !== '-' ? goldBase.buy : baseSell; // Fallback to sell if buy missing
                                    const baseLow = (goldBase && goldBase.low && goldBase.low !== '-') ? goldBase.low : baseSell;
                                    const baseHigh = (goldBase && goldBase.high && goldBase.high !== '-') ? goldBase.high : baseSell;

                                    const sellVal = baseSell ? fmt(Math.round(baseSell * karat.factor)) : '-';
                                    const buyVal = baseBuy ? fmt(Math.round(baseBuy * karat.factor)) : '-';
                                    const lowVal = baseLow ? fmt(Math.round(baseLow * karat.factor)) : '-';
                                    const highVal = baseHigh ? fmt(Math.round(baseHigh * karat.factor)) : '-';

                                    return (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-4 py-6 text-sm md:text-lg font-bold text-white whitespace-nowrap">{karat.label}</td>
                                            <td className="px-4 py-6 text-[11px] md:text-xl font-black text-white/50 text-center font-poppins">
                                                {buyVal !== '-' ? `₹${buyVal}` : '-'}
                                            </td>
                                            <td className="px-4 py-6 text-lg md:text-2xl font-black text-gold-400 text-center font-playfair group-hover:scale-105 transition-transform">
                                                {sellVal !== '-' ? `₹${sellVal}` : '-'}
                                            </td>
                                            <td className="px-4 py-6 text-sm md:text-xl font-black text-red-400/60 text-center font-playfair">
                                                {lowVal !== '-' ? `₹${lowVal}` : '-'}
                                            </td>
                                            <td className="px-4 py-6 text-sm md:text-xl font-black text-green-400/60 text-right font-playfair">
                                                {highVal !== '-' ? `₹${highVal}` : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Market Information */}
                <div className="mt-4 flex flex-col gap-6 opacity-60">
                    <div className="flex items-center gap-4 px-4">
                        <div className="h-px flex-1 bg-white/10"></div>
                        <span className="text-white/40 font-poppins font-bold text-[10px] uppercase tracking-widest">Market Information</span>
                        <div className="h-px flex-1 bg-white/10"></div>
                    </div>
                    <p className="text-center text-white/40 font-poppins text-xs px-10">
                        Retail prices are indicative and subject to change based on local market conditions and taxes.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default RatesPage;
