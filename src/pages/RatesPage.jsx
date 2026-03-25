import React from 'react';
import { useRates } from '../context/RateContext';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

const RatesPage = () => {
    const { rates, rawRates, loading, error, getPriceClass, isMusicEnabled, toggleMusic } = useRates();

    const fmt = (val) => {
        if (typeof val !== 'number') return '-';
        return val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const getKaratClass = (key, field) => {
        const cls = getPriceClass('purities', key, field);
        if (cls === 'price-up' || cls === 'price-down') return cls;
        return 'gold-default';
    };
    return (
        <motion.div
            initial={{ opacity: 1 }}
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
                    <div className="flex justify-center mb-3">
                        <h1 className="text-white/90 font-poppins font-bold text-sm md:text-lg uppercase tracking-wider text-center drop-shadow-luxury">
                            Live Retail Rates with GST
                        </h1>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        {/* Gold Rates Table */}
                        <div className="flex flex-col w-[95%] min-w-[210px] md:max-w-[480px] max-w-[450px] mx-auto md:ml-auto md:mr-4">
                            <div className="gradient-luxury px-3 py-2 md:px-4 md:py-2.5 rounded-t-xl shadow-lg flex justify-between items-center text-white font-poppins font-black text-[10px] md:text-[13px] uppercase tracking-widest">
                                <span className="w-1/3 text-left">PURITY</span>
                                <h2 className="w-1/3 text-center text-[12px] md:text-[16px]">Gold Rates</h2>
                                <span className="w-1/3 text-right">RATES</span>
                            </div>
                            <div className="glass rounded-b-xl overflow-hidden shadow-luxury">
                                <table className="w-full text-left">
                                    {/* Sub-header row removed as per requirement - consolidated into pink bar above */}
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

                {/* QR Codes - Mobile Only */}
                <div className="flex md:hidden flex-col gap-8 mt-6 pb-8 border-t border-white/10 pt-8">
                    <div className="flex flex-row justify-center gap-10">
                        {/* Bank QR */}
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-white/80 font-poppins font-black text-[10px] uppercase tracking-[0.2em]">Bank QR</span>
                            <a 
                                href="https://wa.me/919441055916" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-white p-2 rounded-[18px] shadow-luxury border-2 border-gold-400/30 w-max block"
                            >
                                <img src="/qr-code.webp" alt="Scan QR Bank" className="w-20 h-20 object-contain" />
                            </a>
                            <a 
                                href="https://wa.me/919441055916" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[9px] bg-gold-400/20 text-gold-400 px-4 py-1.5 rounded-full border border-gold-400/30 font-bold uppercase tracking-widest"
                            >
                                Pay Now
                            </a>
                        </div>

                        {/* Location QR */}
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-white/80 font-poppins font-black text-[10px] uppercase tracking-[0.2em]">Location QR</span>
                            <a 
                                href="https://www.google.com/maps?rlz=1C5MACD_enIN1163IN1164&gs_lcrp=EgZjaHJvbWUqDQgBEC4YrwEYxwEYgAQyBwgAEAAYgAQyDQgBEC4YrwEYxwEYgAQyBggCEEUYOTINCAMQLhivARjHARiABDIHCAQQABiABDIGCAUQRRg8MgYIBhBFGDwyBggHEEUYPNIBCDY0MzFqMGo3qAIAsAIA&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KU2BXT4JBko6MVOetju5q7TR&daddr=D/o.16-8-15/a,+AkkalabasavhaiStreet,+Main+Road,+opp.+gudivada+Hanumantharao+Shop,+Tenali,+522201" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-white p-2 rounded-[18px] shadow-luxury border-2 border-gold-400/30 w-max block"
                            >
                                <img src="/qr-code (1).webp" alt="Scan QR Location" className="w-20 h-20 object-contain" />
                            </a>
                            <a 
                                href="https://www.google.com/maps?rlz=1C5MACD_enIN1163IN1164&gs_lcrp=EgZjaHJvbWUqDQgBEC4YrwEYxwEYgAQyBwgAEAAYgAQyDQgBEC4YrwEYxwEYgAQyBggCEEUYOTINCAMQLhivARjHARiABDIHCAQQABiABDIGCAUQRRg8MgYIBhBFGDwyBggHEEUYPNIBCDY0MzFqMGo3qAIAsAIA&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KU2BXT4JBko6MVOetju5q7TR&daddr=D/o.16-8-15/a,+AkkalabasavhaiStreet,+Main+Road,+opp.+gudivada+Hanumantharao+Shop,+Tenali,+522201" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[9px] bg-gold-400/20 text-gold-400 px-4 py-1.5 rounded-full border border-gold-400/30 font-bold uppercase tracking-widest"
                            >
                                Direction
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RatesPage;
