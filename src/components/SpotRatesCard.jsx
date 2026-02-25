import React from 'react';
import { motion } from 'framer-motion';
import { useRates } from '../context/RateContext';

const SpotRatesCard = () => {
    const { rates } = useRates();

    const fmt = (val) => {
        if (typeof val !== 'number') return '-';
        return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="w-full glass rounded-2xl overflow-hidden shadow-luxury border-white/40"
        >
            <div className="gradient-luxury p-3 flex justify-between items-center">
                <span className="text-white font-poppins font-bold text-xs uppercase tracking-widest">Live Spot Market</span>
                <div className="flex gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                </div>
            </div>

            <div className="p-2 md:p-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="py-2 text-[9px] md:text-[11px] font-extrabold text-white/80 uppercase tracking-tighter md:tracking-widest">Product</th>
                            <th className="py-2 text-[9px] md:text-[11px] font-extrabold text-white/80 uppercase tracking-tighter md:tracking-widest text-center px-0.5">Bid</th>
                            <th className="py-2 text-[9px] md:text-[11px] font-extrabold text-white/80 uppercase tracking-tighter md:tracking-widest text-center px-0.5">Ask</th>
                            <th className="py-2 text-[9px] md:text-[11px] font-extrabold text-white/80 uppercase tracking-tighter md:tracking-widest text-center px-0.5">High</th>
                            <th className="py-2 text-[9px] md:text-[11px] font-extrabold text-white/80 uppercase tracking-tighter md:tracking-widest text-right">Low</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {rates.spot.map((rate, idx) => {
                            const isUsd = rate.name.includes('($)');
                            const isInr = rate.name.includes('(₹)');
                            const symbol = isUsd ? '$' : (isInr ? '₹' : '');

                            return (
                                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                    <td className="py-3 text-[10px] md:text-[13px] font-bold text-white font-poppins">{rate.name}</td>
                                    <td className="py-3 text-[10px] md:text-[13px] font-black text-white/70 text-center font-poppins px-0.5">{symbol}{fmt(rate.bid)}</td>
                                    <td className="py-3 text-[10px] md:text-[13px] font-black text-gold-400 text-center font-poppins group-hover:text-white transition-colors px-0.5">{symbol}{fmt(rate.ask)}</td>
                                    <td className="py-3 text-[10px] md:text-[13px] font-bold text-white/50 text-center font-poppins px-0.5">{symbol}{fmt(rate.high)}</td>
                                    <td className="py-3 text-[10px] md:text-[13px] font-bold text-white/50 text-right font-poppins">{symbol}{fmt(rate.low)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default SpotRatesCard;
