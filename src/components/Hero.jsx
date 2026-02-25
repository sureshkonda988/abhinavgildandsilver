import React from 'react';
import { motion } from 'framer-motion';
import { useRates } from '../context/RateContext';
import SpotRatesCard from './SpotRatesCard';
import SpotBar from './SpotBar';

const Hero = () => {
    const { rates } = useRates();

    const fmt = (val) => {
        if (typeof val !== 'number') return '-';
        return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="w-full inventory-section">
            {/* Full Header Image Section - Edge to Edge */}
            <section className="relative w-full overflow-hidden bg-transparent">
                <motion.img
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    src="/Your paragraph text.png"
                    alt="Abhinav Gold & Silver Header"
                    className="w-full h-auto block"
                />

                {/* Overlaid Spot Rates Bar - Absolute on both Mobile & Desktop */}
                <div className="absolute top-[65%] md:top-[75%] lg:top-[75%] left-0 w-full z-20">
                    <SpotBar />
                </div>
            </section>

            {/* Rates Table Section - Restored for detailed data */}
            <section className="max-w-7xl mx-auto px-4 md:px-6 w-full mt-0 md:-mt-40 relative z-10 mb-12 pb-0">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="flex flex-col gap-12"
                >
                    <div className="flex flex-col gap-16">
                        {/* Detailed Spot Rates */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-magenta-600 animate-pulse"></div>
                                </div>
                                <h3 className="text-lg font-poppins font-black text-white uppercase tracking-widest drop-shadow-md">Market Bid/Ask</h3>
                            </div>
                            <SpotRatesCard />
                        </div>

                        {/* Physical Inventory Column */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-gold-600"></div>
                                </div>
                                <h3 className="text-lg font-poppins font-black text-white uppercase tracking-widest drop-shadow-md">Physical Inventory (RTGS)</h3>
                            </div>
                            <div className="glass rounded-2xl overflow-hidden shadow-luxury border-white/40">
                                <div className="gradient-luxury p-3">
                                    <span className="text-white font-poppins font-bold text-xs uppercase tracking-widest">Inventory Rates</span>
                                </div>
                                <div className="p-2 md:p-4 overflow-x-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="py-2 text-[10px] md:text-[11px] font-extrabold text-white/80 uppercase tracking-tight md:tracking-widest text-left">Item Name</th>
                                                <th className="py-2 text-[10px] md:text-[11px] font-extrabold text-white/80 uppercase tracking-tight md:tracking-widest text-center px-1">Buy (INR)</th>
                                                <th className="py-2 text-[10px] md:text-[11px] font-extrabold text-white/80 uppercase tracking-tight md:tracking-widest text-center px-1">Sell (INR)</th>
                                                <th className="py-2 text-[10px] md:text-[11px] font-extrabold text-white/80 uppercase tracking-tight md:tracking-widest text-right">Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {rates.rtgs.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                                    <td className="py-3 text-[11px] md:text-[13px] font-bold text-white font-poppins">{item.name}</td>
                                                    <td className="py-3 text-[12px] md:text-[13px] font-black text-white/70 text-center font-poppins px-1">₹{fmt(item.buy)}</td>
                                                    <td className="py-3 text-[12px] md:text-[13px] font-black text-gold-400 text-center font-poppins group-hover:text-white transition-colors px-1">₹{fmt(item.sell)}</td>
                                                    <td className="py-3 text-right">
                                                        <span className={`px-1.5 md:px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-black uppercase whitespace-nowrap ${item.stock ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                                                            {item.stock ? 'In Stock' : 'Out'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
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
