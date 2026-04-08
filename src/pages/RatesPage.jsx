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
            className="pb-12 md:pb-8 md:min-h-0 px-4 pt-1 max-w-7xl mx-auto mt-1 md:absolute md:top-24 md:right-4 md:z-40 md:w-full md:max-w-[700px]"
        >
            {error && (
                <div className="max-w-md mx-auto mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-center text-xs font-bold uppercase tracking-wider">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-3">
                <div className="relative">
                    <div className="flex justify-center mb-3">
                        <h1 className="text-white/90 font-poppins font-bold text-sm md:text-xl uppercase tracking-wider text-center drop-shadow-luxury">
                            Live Retail Rates with GST
                        </h1>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        {/* Gold Rates Table */}
                        <div className="flex flex-col w-[92%] min-w-[210px] md:max-w-[540px] max-w-[100%] ml-auto mr-8 md:mx-auto md:ml-auto md:mr-16">
                            <div className="gradient-luxury px-2 py-2 md:px-5 md:py-3 rounded-t-xl shadow-lg flex justify-between items-center text-white font-poppins font-black text-[10px] md:text-[16px] uppercase tracking-widest">
                                <span className="w-1/2 text-left">PURITY</span>
                                <span className="w-1/2 text-right pr-1 md:pr-4 tracking-tight md:tracking-widest">Gold Rates</span>
                            </div>
                            <div className="glass rounded-b-xl overflow-hidden shadow-luxury">
                                <table className="w-full text-left">
                                    {/* Sub-header row removed as per requirement - consolidated into pink bar above */}
                                    <tbody className="divide-y divide-white/5">
                                        {rates.ratesPagePurities.map((gold, idx) => {
                                            const gSellVal = gold?.sell !== '-' && gold?.sell !== undefined ? fmt(gold.sell) : '-';
                                            return (
                                                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-2 py-2 md:px-5 md:py-3 text-[24px] md:text-[34px] font-bold text-white whitespace-nowrap">
                                                        {gold.name}
                                                    </td>
                                                    <td className="px-2 py-2 md:px-5 md:py-3 text-right pr-1 md:pr-4 whitespace-nowrap">
                                                        <span
                                                            className={`font-bold text-[42px] md:text-[56px] ${getKaratClass(gold.key, 'sell')}`}
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

            {/* Music Toggle - Mobile Only (at bottom of content) */}
            <div className="flex md:hidden justify-center pt-8 pb-12">
                <button
                    onClick={toggleMusic}
                    className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-xl transition-all border-2 font-poppins font-bold text-xs uppercase tracking-widest ${isMusicEnabled ? 'bg-magenta-600 border-magenta-400 text-white' : 'bg-white border-slate-200 text-slate-700'} hover:scale-105 active:scale-95`}
                >
                    <Music size={18} strokeWidth={2.5} />
                    {isMusicEnabled ? 'Music On' : 'Music Off'}
                </button>
            </div>
        </motion.div>
    );
};

export default RatesPage;
