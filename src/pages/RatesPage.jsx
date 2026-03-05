import React from 'react';
import { useRates } from '../context/RateContext';
import { motion } from 'framer-motion';

const RatesPage = () => {
    const { rates, rawRates, loading, error, adj, showModified } = useRates();

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
            <h1 className="text-3xl md:text-5xl font-poppins font-black text-white mb-10 text-center uppercase tracking-tighter drop-shadow-luxury px-4">Live Retail Market Rates</h1>

            {(loading && !rates.rtgs.some(r => r.sell !== '-')) && (
                <div className="flex justify-center mb-8 animate-pulse text-gold-400 font-bold uppercase tracking-widest text-xs">
                    Connecting to live market...
                </div>
            )}

            {error && (
                <div className="max-w-md mx-auto mb-8 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-xs font-bold uppercase tracking-wider">
                    {error}
                </div>
            )}

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
                                {rates.purities.map((karat, idx) => {
                                    const sellNum = karat.sell;
                                    const buyNum = karat.buy;
                                    const baseLow = karat.low;
                                    const baseHigh = karat.high;

                                    const sellVal = sellNum !== '-' && sellNum !== undefined ? fmt(sellNum) : '-';
                                    const buyVal = buyNum !== '-' && buyNum !== undefined ? fmt(buyNum) : '-';
                                    const lowVal = baseLow !== '-' && baseLow !== undefined ? fmt(baseLow) : '-';
                                    const highVal = baseHigh !== '-' && baseHigh !== undefined ? fmt(baseHigh) : '-';

                                    return (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-4 py-6 text-sm md:text-lg font-bold text-white whitespace-nowrap">{karat.name}</td>
                                            <td className="px-4 py-6 text-[11px] md:text-xl font-black text-white text-center font-poppins">
                                                {buyVal !== '-' ? `₹${buyVal}` : '-'}
                                            </td>
                                            <td className="px-4 py-6 text-lg md:text-2xl font-black text-gold-400 text-center font-poppins group-hover:scale-105 transition-transform">
                                                {sellVal !== '-' ? `₹${sellVal}` : '-'}
                                            </td>
                                            <td className="px-4 py-6 text-sm md:text-xl font-black text-red-400 text-center font-poppins">
                                                {lowVal !== '-' ? `₹${lowVal}` : '-'}
                                            </td>
                                            <td className="px-4 py-6 text-sm md:text-xl font-black text-green-400 text-right font-poppins">
                                                {highVal !== '-' ? `₹${highVal}` : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Silver Rates Table */}
                <div className="flex flex-col gap-6">
                    <div className="gradient-luxury p-4 rounded-t-2xl shadow-lg flex justify-between items-center">
                        <h2 className="text-white font-poppins font-bold text-lg uppercase tracking-widest">Silver Rates</h2>
                        <span className="text-white/40 text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">RTGS / Base</span>
                    </div>
                    <div className="glass rounded-b-2xl overflow-hidden shadow-luxury">
                        <table className="w-full text-left">
                            <thead className="bg-white/10 border-b border-white/10">
                                <tr>
                                    <th className="px-4 py-5 text-[10px] md:text-[12px] font-black text-white/80 uppercase tracking-widest whitespace-nowrap">Item</th>
                                    <th className="px-4 py-5 text-[10px] md:text-[12px] font-black text-white/80 uppercase tracking-widest text-center whitespace-nowrap">Buy</th>
                                    <th className="px-4 py-5 text-[10px] md:text-[12px] font-black text-white/80 uppercase tracking-widest text-center whitespace-nowrap">Sell</th>
                                    <th className="px-4 py-5 text-[10px] md:text-[12px] font-black text-red-400/80 uppercase tracking-widest text-center whitespace-nowrap">Low</th>
                                    <th className="px-4 py-5 text-[10px] md:text-[12px] font-black text-green-400/80 uppercase tracking-widest text-right whitespace-nowrap">High</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {rates.rtgs.filter(r => r.name.toUpperCase().includes('SILVER')).map((item, idx) => {
                                    const rawItem = rawRates.rtgs.find(r => r.id === item.id || (r.name && r.name === item.name)) || item;

                                    return (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-4 py-6 text-sm md:text-lg font-bold text-white whitespace-nowrap">{item.name}</td>
                                            <td className="px-4 py-6 text-[11px] md:text-xl font-black text-white text-center font-poppins">
                                                ₹{item.buy !== '-' ? fmt(item.buy) : '-'}
                                            </td>
                                            <td className="px-4 py-6 text-lg md:text-2xl font-black text-gold-400 text-center font-poppins group-hover:scale-105 transition-transform">
                                                ₹{item.sell !== '-' ? fmt(item.sell) : '-'}
                                            </td>
                                            <td className="px-4 py-6 text-sm md:text-xl font-black text-red-400 text-center font-poppins">
                                                ₹{rawItem.low !== '-' ? fmt(rawItem.low) : '-'}
                                            </td>
                                            <td className="px-4 py-6 text-sm md:text-xl font-black text-green-400 text-right font-poppins">
                                                ₹{rawItem.high !== '-' ? fmt(rawItem.high) : '-'}
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
