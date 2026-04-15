import React from 'react';
import { useRates } from '../context/RateContext';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

const RatesPage = () => {
    const { rates, rawRates, loading, error, getRateChangeType, getRateColor, previousRates, currentRates, isMusicEnabled, toggleMusic } = useRates();

    const fmt = (val) => {
        if (typeof val !== 'number') return '-';
        return val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const gold999Id = '945';
    const silver999Id = '2987';
    
    const prevGold = previousRates?.rtgs?.find(r => r.id === gold999Id);
    const currGold = currentRates?.rtgs?.find(r => r.id === gold999Id);
    const goldChange = getRateChangeType(prevGold?.sell, currGold?.sell);
    
    const prevSilver = previousRates?.rtgs?.find(r => r.id === silver999Id);
    const currSilver = currentRates?.rtgs?.find(r => r.id === silver999Id);
    const silverChange = getRateChangeType(prevSilver?.sell, currSilver?.sell);

    const getKaratStyle = () => {
        return { color: getRateColor(goldChange, '#FFFFFF'), fontWeight: 'bold' };
    };
    
    const getSilverStyle = () => {
        return { color: getRateColor(silverChange, '#FFFFFF'), fontWeight: 'bold' };
    };
    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="pb-2 md:pb-0 md:min-h-0 px-4 pt-1 max-w-7xl mx-auto mt-1 md:relative md:z-10 md:w-full md:max-w-[550px] md:ml-auto md:mr-10 md:-translate-y-[610px] md:h-0 md:overflow-visible"
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
                        <div className="flex flex-col w-[80%] min-w-[190px] md:max-w-[420px] max-w-[100%] ml-auto mr-4 md:mx-auto md:ml-auto md:mr-16">
                            <div className="gradient-luxury px-2 py-1.5 md:px-4 md:py-2.5 rounded-t-xl shadow-lg flex justify-between items-center text-white font-poppins font-black text-[9px] md:text-[14px] uppercase tracking-widest">
                                <span className="w-1/2 text-left px-2 md:px-4">PURITY</span>
                                <span className="w-1/2 text-right pr-2 md:pr-4 tracking-tight md:tracking-widest">10 Grams</span>
                            </div>
                            <div className="glass rounded-b-xl overflow-hidden shadow-luxury">
                                <table className="w-full text-left">
                                    {/* Sub-header row removed as per requirement - consolidated into pink bar above */}
                                    <tbody className="divide-y divide-white/5">
                                        {rates.ratesPagePurities.map((gold, idx) => {
                                            const gSellVal = gold?.sell !== '-' && gold?.sell !== undefined ? fmt(gold.sell) : '-';
                                            return (
                                                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-2 py-1.5 md:px-4 md:py-2.5 text-[12px] md:text-[17px] font-bold text-white whitespace-nowrap w-1/2">
                                                        {gold.name}
                                                    </td>
                                                    <td className="px-2 py-1.5 md:px-4 md:py-2.5 text-right whitespace-nowrap w-1/2">
                                                        <span
                                                            className="text-[15px] md:text-[22px]"
                                                            style={getKaratStyle()}
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

                        {/* Navarsu / Kasu Table */}
                        <div className="flex flex-col w-[80%] min-w-[190px] md:max-w-[420px] max-w-[100%] ml-auto mr-4 md:mx-auto md:ml-auto md:mr-16 mt-2">
                            <div className="gradient-luxury px-2 py-1.5 md:px-4 md:py-2.5 rounded-t-xl shadow-lg flex justify-between items-center text-white font-poppins font-black text-[9px] md:text-[14px] uppercase tracking-widest">
                                <span className="w-1/2 text-left px-1 md:px-0">8 GRAMS</span>
                                <span className="w-1/2 text-right pr-2 md:pr-4">Navarsu / Kasu</span>
                            </div>
                            <div className="glass rounded-b-xl overflow-hidden shadow-luxury">
                                <table className="w-full text-left">
                                    <tbody className="divide-y divide-white/5">
                                        <tr className="hover:bg-white/5 transition-colors group">
                                            <td className="px-2 py-1.5 md:px-4 md:py-2.5 text-[12px] md:text-[17px] font-bold text-white whitespace-nowrap w-1/2">
                                                Gold 22 KT
                                            </td>
                                            <td className="px-2 py-1.5 md:px-4 md:py-2.5 text-right whitespace-nowrap w-1/2">
                                                <span className="text-[15px] md:text-[22px]" style={getKaratStyle()}>
                                                    <span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span>{rates.navarsuRate && rates.navarsuRate !== '-' ? fmt(rates.navarsuRate) : '-'}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Silver 10 Grams Table */}
                        <div className="flex flex-col w-[80%] min-w-[190px] md:max-w-[420px] max-w-[100%] ml-auto mr-4 md:mx-auto md:ml-auto md:mr-16 mt-2">
                            <div className="gradient-luxury px-2 py-1.5 md:px-4 md:py-2.5 rounded-t-xl shadow-lg flex justify-between items-center text-white font-poppins font-black text-[9px] md:text-[14px] uppercase tracking-widest">
                                <span className="w-1/2 text-left px-1 md:px-0">SILVER</span>
                                <span className="w-1/2 text-right pr-2 md:pr-4">10 GRAMS</span>
                            </div>
                            <div className="glass rounded-b-xl overflow-hidden shadow-luxury">
                                <table className="w-full text-left">
                                    <tbody className="divide-y divide-white/5">
                                        <tr className="hover:bg-white/5 transition-colors group">
                                            <td className="px-2 py-1.5 md:px-4 md:py-2.5 text-[12px] md:text-[17px] font-bold text-white whitespace-nowrap w-1/2">
                                                Silver 999
                                            </td>
                                            <td className="px-2 py-1.5 md:px-4 md:py-2.5 text-right whitespace-nowrap w-1/2">
                                                <span className="text-[15px] md:text-[22px]" style={getSilverStyle()}>
                                                    <span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span>{rates.ratesPageSilver?.sell && rates.ratesPageSilver.sell !== '-' ? fmt(rates.ratesPageSilver.sell) : '-'}
                                                </span>
                                            </td>
                                        </tr>
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
                                <img src="/qr-code-location.webp" alt="Scan QR Location" className="w-20 h-20 object-contain" />
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
