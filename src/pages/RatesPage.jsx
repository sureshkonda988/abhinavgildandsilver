import React from 'react';
import { useRates } from '../context/RateContext';
import { motion } from 'framer-motion';

const RatesPage = () => {
    const { rates, rawRates, loading, error, getPriceClass } = useRates();

    const fmt = (val) => {
        if (typeof val !== 'number') return '-';
        return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getKaratClass = (key, field) => {
        const cls = getPriceClass('purities', key, field);
        if (cls === 'price-up' || cls === 'price-down') return cls;
        return 'gold-default';
    };

    // Derive silver rows from rtgs data (5kg item = ID 2987)
    const silver5kg = rawRates.rtgs.find(r => r.id === '2987');
    const silverBase = typeof silver5kg?.sell === 'number' ? silver5kg.sell : null;

    const silverRows = [
        {
            name: 'Silver 10g',
            sell: silverBase !== null ? Math.round((silverBase / 5000) * 10 * 100) / 100 : '-',
            low: typeof silver5kg?.low === 'number' ? Math.round((silver5kg.low / 5000) * 10 * 100) / 100 : '-',
            high: typeof silver5kg?.high === 'number' ? Math.round((silver5kg.high / 5000) * 10 * 100) / 100 : '-',
        },
        {
            name: 'Silver 1 Kg',
            sell: silverBase !== null ? Math.round(silverBase / 5 * 100) / 100 : '-',
            low: typeof silver5kg?.low === 'number' ? Math.round(silver5kg.low / 5 * 100) / 100 : '-',
            high: typeof silver5kg?.high === 'number' ? Math.round(silver5kg.high / 5 * 100) / 100 : '-',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-16 px-4 pt-4 max-w-7xl mx-auto md:-mt-[430px] md:w-[48%] md:ml-auto md:mr-0 md:pr-2"
        >
            <h1 className="text-2xl font-poppins font-black text-white mb-2 text-center uppercase tracking-tighter drop-shadow-luxury px-2">
                Live Retail Rates with GST
            </h1>

            {(loading && !rates.rtgs.some(r => r.sell !== '-')) && (
                <div className="flex justify-center mb-4 animate-pulse text-gold-400 font-bold uppercase tracking-widest text-xs">
                    Connecting to live market...
                </div>
            )}

            {error && (
                <div className="max-w-md mx-auto mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-center text-xs font-bold uppercase tracking-wider">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-3">

                {/* Gold Rates Table */}
                <div className="flex flex-col">
                    <div className="gradient-luxury p-3 rounded-t-2xl shadow-lg flex justify-between items-center">
                        <h2 className="text-white font-poppins font-bold text-sm uppercase tracking-widest">Retail Gold Rates (10g)</h2>
                        <span className="text-white/40 text-[9px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-full">RTGS / 999 Base</span>
                    </div>
                    <div className="glass rounded-b-2xl overflow-x-auto shadow-luxury">
                        <table className="w-full text-left min-w-[360px]">
                            <thead className="bg-white/10 border-b border-white/10">
                                <tr>
                                    <th className="px-2 py-2 text-[9px] font-black text-white/80 uppercase tracking-widest">Purity</th>
                                    <th className="px-2 py-2 text-[9px] font-black text-white/80 uppercase tracking-widest text-center">Sell</th>
                                    <th className="px-2 py-2 text-[9px] font-black text-red-400/80 uppercase tracking-widest text-center">Low</th>
                                    <th className="px-2 py-2 text-[9px] font-black text-green-400/80 uppercase tracking-widest text-right">High</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {rates.purities.map((karat, idx) => {
                                    const sellVal = karat.sell !== '-' && karat.sell !== undefined ? fmt(karat.sell) : '-';
                                    const lowVal = karat.low !== '-' && karat.low !== undefined ? fmt(karat.low) : '-';
                                    const highVal = karat.high !== '-' && karat.high !== undefined ? fmt(karat.high) : '-';
                                    return (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-2 py-2 text-[10px] md:text-sm font-bold text-white whitespace-nowrap">{karat.name}</td>
                                            <td className="px-2 py-2 text-center font-poppins whitespace-nowrap">
                                                <motion.span
                                                    key={sellVal}
                                                    animate={{ scale: [1, 1.05, 1] }}
                                                    className={`text-[10px] md:text-sm font-black ${getKaratClass(karat.key, 'sell')}`}
                                                >
                                                    {sellVal !== '-' ? `₹${sellVal}` : '-'}
                                                </motion.span>
                                            </td>
                                            <td className="px-2 py-2 text-[10px] md:text-sm font-black text-red-400 text-center font-poppins whitespace-nowrap">
                                                {lowVal !== '-' ? `₹${lowVal}` : '-'}
                                            </td>
                                            <td className="px-2 py-2 text-[10px] md:text-sm font-black text-green-400 text-right font-poppins whitespace-nowrap">
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
                <div className="flex flex-col">
                    <div className="bg-slate-700 p-3 rounded-t-2xl shadow-lg flex justify-between items-center">
                        <h2 className="text-white font-poppins font-bold text-sm uppercase tracking-widest">Silver Rates</h2>
                        <span className="text-white/40 text-[9px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-full">999 Purity</span>
                    </div>
                    <div className="glass rounded-b-2xl overflow-x-auto shadow-luxury">
                        <table className="w-full text-left min-w-[360px]">
                            <thead className="bg-white/10 border-b border-white/10">
                                <tr>
                                    <th className="px-2 py-2 text-[9px] font-black text-white/80 uppercase tracking-widest">Weight</th>
                                    <th className="px-2 py-2 text-[9px] font-black text-white/80 uppercase tracking-widest text-center">Sell</th>
                                    <th className="px-2 py-2 text-[9px] font-black text-red-400/80 uppercase tracking-widest text-center">Low</th>
                                    <th className="px-2 py-2 text-[9px] font-black text-green-400/80 uppercase tracking-widest text-right">High</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {silverRows.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                        <td className="px-2 py-2 text-[10px] md:text-sm font-bold text-white whitespace-nowrap">{row.name}</td>
                                        <td className="px-2 py-2 text-[10px] md:text-sm font-black text-center font-poppins whitespace-nowrap silver-default">
                                            {typeof row.sell === 'number' ? `₹${fmt(row.sell)}` : '-'}
                                        </td>
                                        <td className="px-2 py-2 text-[10px] md:text-sm font-black text-red-400 text-center font-poppins whitespace-nowrap">
                                            {typeof row.low === 'number' ? `₹${fmt(row.low)}` : '-'}
                                        </td>
                                        <td className="px-2 py-2 text-[10px] md:text-sm font-black text-green-400 text-right font-poppins whitespace-nowrap">
                                            {typeof row.high === 'number' ? `₹${fmt(row.high)}` : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>


                {/* Market Information */}
                <div className="flex flex-col gap-3 opacity-60">
                    <div className="flex items-center gap-4 px-4">
                        <div className="h-px flex-1 bg-white/10"></div>
                        <span className="text-white/40 font-poppins font-bold text-[9px] uppercase tracking-widest">Market Information</span>
                        <div className="h-px flex-1 bg-white/10"></div>
                    </div>
                    <p className="text-center text-white/40 font-poppins text-[10px] px-6">
                        Retail prices are indicative and subject to change based on local market conditions and taxes.
                    </p>
                </div>

            </div>
        </motion.div>
    );
};

export default RatesPage;
