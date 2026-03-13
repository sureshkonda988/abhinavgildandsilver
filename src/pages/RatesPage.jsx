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
        },
        {
            name: 'Silver 1 Kg',
            sell: silverBase !== null ? Math.round(silverBase / 5 * 100) / 100 : '-',
        },
    ];

    // Combine Gold and Silver rows for a 4-column layout
    const maxRows = Math.max(rates.purities.length, silverRows.length);
    const combinedRows = Array.from({ length: maxRows }).map((_, idx) => ({
        gold: rates.purities[idx] || null,
        silver: silverRows[idx] || null,
    }));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-16 px-4 pt-2 max-w-7xl mx-auto md:-mt-[580px] md:w-[48%] md:ml-auto md:mr-0 md:pr-2"
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

                {/* Combined Gold & Silver Rates Table */}
                <div className="flex flex-col">
                    <div className="gradient-luxury p-3 rounded-t-2xl shadow-lg flex justify-between items-center">
                        <h2 className="text-white font-poppins font-bold text-sm uppercase tracking-widest hidden md:block">Retail Rates (Gold & Silver)</h2>
                        <h2 className="text-white font-poppins font-bold text-sm uppercase tracking-widest md:hidden">Live Rates</h2>
                        <span className="text-white/40 text-[9px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-full">GST INCLUDED</span>
                    </div>
                    <div className="glass rounded-b-2xl overflow-x-auto shadow-luxury">
                        <table className="w-full text-left min-w-[360px]">
                            <thead className="bg-white/10 border-b border-white/10">
                                <tr>
                                    <th className="px-2 md:px-4 py-3 text-[10px] md:text-xs font-black text-white/80 uppercase tracking-widest text-left w-1/4">Gold Purity</th>
                                    <th className="px-2 md:px-4 py-3 text-[10px] md:text-xs font-black text-white/80 uppercase tracking-widest text-center w-1/4 pr-4">Sell</th>
                                    {/* Vertical divider applied via CSS border on the left of this th/td */}
                                    <th className="px-2 md:px-4 py-3 text-[10px] md:text-xs font-black text-white/80 uppercase tracking-widest text-left border-l border-white/10 w-1/4">Silver</th>
                                    <th className="px-2 md:px-4 py-3 text-[10px] md:text-xs font-black text-white/80 uppercase tracking-widest text-center w-1/4">Sell</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {combinedRows.map((row, idx) => {
                                    const gold = row.gold;
                                    const silver = row.silver;

                                    const gSellVal = gold?.sell !== '-' && gold?.sell !== undefined ? fmt(gold.sell) : '-';
                                    const sSellVal = typeof silver?.sell === 'number' ? fmt(silver.sell) : '-';

                                    return (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                            {/* Gold Columns */}
                                            <td className="px-2 md:px-4 py-2 text-[11px] md:text-sm font-bold text-white whitespace-nowrap">
                                                {gold ? gold.name.replace('kt', 'Karat') : ''}
                                            </td>
                                            <td className="px-2 md:px-4 py-2 text-center whitespace-nowrap pr-4">
                                                {gold && (
                                                    <motion.span
                                                        key={gSellVal}
                                                        animate={{ scale: [1, 1.05, 1] }}
                                                        className={`font-bold text-[13px] md:text-[16px] ${getKaratClass(gold.key, 'sell')}`}
                                                    >
                                                        <span className="font-sans">₹</span>{gSellVal !== '-' ? gSellVal : '-'}
                                                    </motion.span>
                                                )}
                                            </td>
                                            
                                            {/* Silver Columns */}
                                            <td className="px-2 md:px-4 py-2 text-[11px] md:text-sm font-bold text-white whitespace-nowrap border-l border-white/10">
                                                {silver ? silver.name : ''}
                                            </td>
                                            <td className="px-2 md:px-4 py-2 text-center whitespace-nowrap">
                                                {silver && (
                                                    <span className="font-bold text-[13px] md:text-[16px] silver-default">
                                                        <span className="font-sans">₹</span>{sSellVal !== '-' ? sSellVal : '-'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
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
