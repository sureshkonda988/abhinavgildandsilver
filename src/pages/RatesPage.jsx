import React from 'react';
import { useRates } from '../context/RateContext';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

const RatesPage = () => {
    const { rates, rawRates, loading, error, getPriceClass, isMusicEnabled, toggleMusic } = useRates();

    const fmt = (val) => {
        if (typeof val !== 'number') return '-';
        return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getKaratClass = (key, field) => {
        const cls = getPriceClass('purities', key, field);
        if (cls === 'price-up' || cls === 'price-down') return cls;
        return 'gold-default';
    };
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-12 md:pb-8 md:min-h-0 px-4 pt-4 max-w-7xl mx-auto mt-2 md:absolute md:top-24 md:right-4 md:z-40 md:w-full md:max-w-[500px]"
        >
            {error && (
                <div className="max-w-md mx-auto mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-center text-xs font-bold uppercase tracking-wider">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-3">
                <div className="relative">
                    <h1 className="text-xl font-poppins font-black text-white/80 mt-2 md:mt-0 mb-3 text-center uppercase tracking-tighter drop-shadow-luxury px-2 md:w-full leading-none">
                        Live Retail Rates with GST
                    </h1>
                    
                    <div className="flex flex-col gap-4">
                        {/* Gold Rates Table */}
                        <div className="flex flex-col w-[95%] min-w-[210px] md:max-w-[480px] max-w-[450px] mx-auto md:ml-auto md:mr-4">
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
                                        {rates.ratesPagePurities.map((gold, idx) => {
                                            const gSellVal = gold?.sell !== '-' && gold?.sell !== undefined ? fmt(gold.sell) : '-';
                                            return (
                                                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-3 py-2.5 md:px-4 md:py-2.5 text-[13px] md:text-[24px] font-bold text-white whitespace-nowrap">
                                                        {gold.name}
                                                    </td>
                                                    <td className="px-3 py-2.5 md:px-4 md:py-2.5 text-right whitespace-nowrap">
                                                        <span
                                                            className={`font-bold text-[14px] md:text-[32px] ${getKaratClass(gold.key, 'sell')}`}
                                                        >
                                                            <span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span>{gSellVal}
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
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg transition-all border-2 font-poppins font-bold text-xs uppercase tracking-widest ${isMusicEnabled ? 'bg-gold-500 border-gold-400 text-white animate-pulse' : 'bg-white/20 border-white/30 text-white'
                            } hover:scale-105`}
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
