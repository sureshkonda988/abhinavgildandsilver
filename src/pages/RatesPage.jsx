import React from 'react';
import { useRates } from '../context/RateContext';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

const RatesPage = () => {
    const { rates, rawRates, loading, error, getPriceClass, isMusicEnabled, toggleMusic, music } = useRates();

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
            className="pb-16 md:pb-32 md:min-h-[90vh] px-4 pt-4 max-w-7xl mx-auto mt-2 md:-mt-[420px] md:w-full md:ml-auto md:mr-0 md:pr-10"
        >
            {error && (
                <div className="max-w-md mx-auto mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-center text-xs font-bold uppercase tracking-wider">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-3">
                <div className="flex flex-col md:flex-col-reverse gap-6">
                    <h1 className="text-xl font-poppins font-black text-white/80 mt-2 md:mt-10 mb-1 text-center md:text-right md:-translate-x-32 uppercase tracking-tighter drop-shadow-luxury px-2 md:order-2">
                        Live Retail Rates with GST
                    </h1>
                    
                    {/* Separate Tables Grid */}
                    <div className="flex flex-col gap-4 md:order-1">
                        
                        {/* Gold Rates Table */}
                        <div className="flex flex-col w-[95%] min-w-[210px] md:max-w-[550px] max-w-[450px] mx-auto md:mx-0 md:self-end md:-mt-8">
                            <div className="gradient-luxury px-3 py-2 md:px-4 md:py-1.5 rounded-t-xl shadow-lg flex justify-between items-center">
                                <h2 className="text-white font-poppins font-bold text-[12px] md:text-[14px] uppercase tracking-widest">Gold Rates</h2>
                                <span className="text-white/40 text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-full">GST INCL</span>
                            </div>
                            <div className="glass rounded-b-xl overflow-hidden shadow-luxury">
                                <table className="w-full text-left">
                                    <thead className="bg-white/10 border-b border-white/10">
                                        <tr>
                                            <th className="px-3 py-2 md:px-4 md:py-1 text-[10px] md:text-[12px] font-black text-white/80 uppercase tracking-widest">Purity</th>
                                            <th className="px-3 py-2 md:px-4 md:py-1 text-[10px] md:text-[12px] font-black text-white/80 uppercase tracking-widest text-right">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {rates.purities.map((gold, idx) => {
                                            const gSellVal = gold?.sell !== '-' && gold?.sell !== undefined ? fmt(gold.sell) : '-';
                                            return (
                                                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-3 py-2.5 md:px-4 md:py-1 text-[13px] md:text-[18px] font-bold text-white whitespace-nowrap">
                                                        {gold.name}
                                                    </td>
                                                    <td className="px-3 py-2.5 md:px-4 md:py-1 text-right whitespace-nowrap">
                                                        <motion.span
                                                            key={gSellVal}
                                                            animate={{ scale: [1, 1.05, 1] }}
                                                            className={`font-bold text-[14px] md:text-[22px] ${getKaratClass(gold.key, 'sell')}`}
                                                        >
                                                            <span className="font-sans">₹</span>{gSellVal}
                                                        </motion.span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Silver Rates Table */}
                        <div className="flex flex-col w-[95%] min-w-[210px] md:max-w-[270px] max-w-[450px] mx-auto md:mx-0 md:self-start md:translate-x-80">
                            <div className="gradient-luxury px-3 py-2 md:px-2.5 md:py-2 rounded-t-xl shadow-lg flex justify-between items-center">
                                <h2 className="text-white font-poppins font-bold text-[12px] md:text-[11px] uppercase tracking-widest">Silver Rates</h2>
                                <span className="text-white/40 text-[9px] md:text-[7px] font-black uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded-full">GST INCL</span>
                            </div>
                            <div className="glass rounded-b-xl overflow-hidden shadow-luxury">
                                <table className="w-full text-left">
                                    <thead className="bg-white/10 border-b border-white/10">
                                        <tr>
                                            <th className="px-3 py-2 md:px-3 md:py-1.5 text-[10px] md:text-[9px] font-black text-white/80 uppercase tracking-widest">Silver</th>
                                            <th className="px-3 py-2 md:px-3 md:py-1.5 text-[10px] md:text-[9px] font-black text-white/80 uppercase tracking-widest text-right">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {silverRows.map((silver, idx) => {
                                            const sSellVal = typeof silver?.sell === 'number' ? fmt(silver.sell) : '-';
                                            return (
                                                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-3 py-2.5 md:px-3 md:py-2 text-[13px] md:text-[13px] font-bold text-white whitespace-nowrap">
                                                        {silver.name}
                                                    </td>
                                                    <td className="px-3 py-2.5 md:px-3 md:py-2 text-right whitespace-nowrap">
                                                        <span className="font-bold text-[14px] md:text-[15px] silver-default">
                                                            <span className="font-sans">₹</span>{sSellVal}
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



                {(loading && !rates.rtgs.some(r => r.sell !== '-')) && (
                    <div className="flex justify-center mb-4 animate-pulse text-gold-400 font-bold uppercase tracking-widest text-xs">
                        Connecting to live market...
                    </div>
                )}

                {/* Music Toggle - Mobile Only (below tables) */}
                <div className="flex md:hidden justify-center pb-4 mt-4">
                    <button
                        onClick={toggleMusic}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg transition-all border-2 font-poppins font-bold text-xs uppercase tracking-widest ${
                            isMusicEnabled ? 'bg-gold-500 border-gold-400 text-white animate-pulse' : 'bg-white/20 border-white/30 text-white'
                        } ${
                            !(music.ratesMusic?.sourceType === 'local' ? music.ratesMusic?.fileUrl : music.ratesMusic?.videoId) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                        }`}
                        title={isMusicEnabled ? 'Turn Off Music' : 'Turn On Music'}
                    >
                        <Music size={16} />
                        {isMusicEnabled ? 'Music On' : 'Music Off'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default RatesPage;
