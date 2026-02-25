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
            className="pb-32 px-6 pt-10 max-w-7xl mx-auto"
        >
            <h1 className="text-3xl md:text-5xl font-playfair font-black text-white mb-10 text-center uppercase tracking-tighter drop-shadow-luxury px-4">Live Market Rates</h1>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Spot Rates Table */}
                <div className="flex flex-col gap-6">
                    <div className="gradient-luxury p-4 rounded-t-2xl shadow-lg">
                        <h2 className="text-white font-poppins font-bold text-lg uppercase tracking-widest">Global Spot Market</h2>
                    </div>
                    <div className="glass rounded-b-2xl overflow-x-hidden shadow-luxury">
                        <table className="w-full text-left">
                            <thead className="bg-white/10 border-b border-white/10">
                                <tr>
                                    <th className="px-1 md:px-6 py-4 text-[9px] md:text-[12px] font-black text-white/80 uppercase tracking-tighter md:tracking-widest">Product</th>
                                    <th className="px-0.5 md:px-6 py-4 text-[9px] md:text-[12px] font-black text-white/80 uppercase tracking-tighter md:tracking-widest text-center">Bid</th>
                                    <th className="px-0.5 md:px-6 py-4 text-[9px] md:text-[12px] font-black text-white/80 uppercase tracking-tighter md:tracking-widest text-center">Ask</th>
                                    <th className="px-0.5 md:px-6 py-4 text-[9px] md:text-[12px] font-black text-white/80 uppercase tracking-tighter md:tracking-widest text-center">High</th>
                                    <th className="px-0.5 md:px-6 py-4 text-[9px] md:text-[12px] font-black text-white/80 uppercase tracking-tighter md:tracking-widest text-right">Low</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {rates.spot.map((item, idx) => {
                                    const isUsd = item.name.includes('($)');
                                    const isInr = item.name.includes('(₹)');
                                    const symbol = isUsd ? '$' : (isInr ? '₹' : '');
                                    return (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-1 md:px-6 py-4 text-[10px] md:text-sm font-bold text-white whitespace-nowrap">{item.name}</td>
                                            <td className="px-0.5 md:px-6 py-4 text-[10px] md:text-sm font-black text-white/70 text-center">{symbol}{fmt(item.bid)}</td>
                                            <td className="px-0.5 md:px-6 py-4 text-[10px] md:text-sm font-black text-gold-400 text-center group-hover:text-white">{symbol}{fmt(item.ask)}</td>
                                            <td className="px-0.5 md:px-6 py-4 text-[10px] md:text-sm font-bold text-white/50 text-center">{symbol}{fmt(item.high)}</td>
                                            <td className="px-0.5 md:px-6 py-4 text-[10px] md:text-sm font-bold text-white/50 text-right">{symbol}{fmt(item.low)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Product Rates Table */}
                <div className="flex flex-col gap-6">
                    <div className="gradient-luxury p-4 rounded-t-2xl shadow-lg">
                        <h2 className="text-white font-poppins font-bold text-lg uppercase tracking-widest">Physical Inventory</h2>
                    </div>
                    <div className="glass rounded-b-2xl overflow-x-hidden shadow-luxury">
                        <table className="w-full text-left">
                            <thead className="bg-white/10 border-b border-white/10">
                                <tr>
                                    <th className="px-1 md:px-6 py-4 text-[9px] md:text-[12px] font-black text-white/80 uppercase tracking-tighter md:tracking-widest">Item Name</th>
                                    <th className="px-0.5 md:px-6 py-4 text-[9px] md:text-[12px] font-black text-white/80 uppercase tracking-tighter md:tracking-widest text-center">Buy (INR)</th>
                                    <th className="px-0.5 md:px-6 py-4 text-[9px] md:text-[12px] font-black text-white/80 uppercase tracking-tighter md:tracking-widest text-center">Sell (INR)</th>
                                    <th className="px-0.5 md:px-6 py-4 text-[9px] md:text-[12px] font-black text-white/80 uppercase tracking-tighter md:tracking-widest text-right">Stock</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {rates.rtgs.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-1 md:px-6 py-4 text-[10px] md:text-sm font-bold text-white whitespace-nowrap">{item.name}</td>
                                        <td className="px-0.5 md:px-6 py-4 text-[10px] md:text-sm font-black text-white/70 text-center">₹{fmt(item.buy)}</td>
                                        <td className="px-0.5 md:px-6 py-4 text-[10px] md:text-sm font-black text-gold-400 text-center group-hover:text-white">₹{fmt(item.sell)}</td>
                                        <td className="px-0.5 md:px-6 py-4 text-right">
                                            <span className={`px-1.5 md:px-3 py-1 rounded-full text-[8px] md:text-[12px] font-black uppercase whitespace-nowrap ${item.stock ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                                                {item.stock ? 'In' : 'Out'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RatesPage;
