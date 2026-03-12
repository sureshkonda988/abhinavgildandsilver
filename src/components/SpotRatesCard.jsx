import React from 'react';
import { motion } from 'framer-motion';
import { useRates } from '../context/RateContext';

const SpotRatesCard = () => {
    const { rates, getPriceClass } = useRates();

    const fmt = (val) => {
        if (typeof val !== 'number') return '-';
        return val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };
    const renderSymbol = (sym) => sym === '₹' ? <span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span> : sym;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="w-full bg-white rounded-2xl overflow-hidden shadow-luxury border border-slate-200"
        >
            <div className="gradient-vibrant p-3 flex justify-between items-center">
                <span className="text-white font-poppins font-bold text-xs uppercase tracking-widest">Live Spot Market</span>
                <div className="flex gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                </div>
            </div>

            <div className="p-0 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                <table className="w-full text-left border-collapse min-w-full md:min-w-0">
                    <thead>
                        <tr className="border-b border-slate-100 whitespace-nowrap bg-slate-50/50">
                            <th className="py-2.5 px-3 md:py-3 md:px-4 text-[8px] md:text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Product</th>
                            <th className="py-2.5 px-3 md:py-3 md:px-4 text-[8px] md:text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-center">Bid</th>
                            <th className="py-2.5 px-3 md:py-3 md:px-4 text-[8px] md:text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-center">Ask</th>
                            <th className="py-2.5 px-3 md:py-3 md:px-4 text-[8px] md:text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-center">High</th>
                            <th className="py-2.5 px-3 md:py-3 md:px-4 text-[8px] md:text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-right">Low</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {rates.spot.map((rate, idx) => {
                            const isUsd = rate.name.includes('($)');
                            const isInr = rate.name.includes('(₹)');
                            const symbol = isUsd ? '$' : (isInr ? '₹' : '');

                            return (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors group whitespace-nowrap">
                                    <td className="py-3 px-3 md:py-4 md:px-4 text-[9px] md:text-[13px] font-bold text-slate-900 font-poppins">{rate.name}</td>
                                    <td className={`py-3 px-3 md:py-4 md:px-4 text-[9px] md:text-[13px] font-black text-center font-poppins transition-colors duration-300 ${getPriceClass('spot', rate.id, 'bid')}`}>{renderSymbol(symbol)}{fmt(rate.bid)}</td>
                                    <td className={`py-3 px-3 md:py-4 md:px-4 text-[9px] md:text-[13px] font-black text-center font-poppins group-hover:text-magenta-800 transition-all duration-300 ${getPriceClass('spot', rate.id, 'ask')}`}>{renderSymbol(symbol)}{fmt(rate.ask)}</td>
                                    <td className="py-3 px-3 md:py-4 md:px-4 text-[9px] md:text-[13px] font-bold text-slate-600 text-center font-poppins">{renderSymbol(symbol)}{fmt(rate.high)}</td>
                                    <td className="py-3 px-3 md:py-4 md:px-4 text-[9px] md:text-[13px] font-bold text-slate-600 text-right font-poppins">{renderSymbol(symbol)}{fmt(rate.low)}</td>
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
