import React from 'react';
import { Bell, Info, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRates } from '../context/RateContext';

const AlertsPage = () => {
    const { news } = useRates();

    const staticAlerts = [
        {
            id: 'static-1',
            title: 'Gold Breaks $5,400 Mark',
            msg: 'Spot gold has surged past $5,400 per ounce, marking a historic intraday gain of over 2.5% on COMEX as investors rush to safe-haven assets.',
            date: '02 Mar 2026',
            type: 'urgent'
        },
        {
            id: 'static-2',
            title: 'MCX Futures Surge 3.5%',
            msg: 'Indian gold futures for April delivery climbed over ₹5,800 to trade at ₹1,67,915 per 10g. MCX Silver futures also advanced steeply to ₹2,84,490 per kg.',
            date: '02 Mar 2026',
            type: 'urgent'
        },
        {
            id: 'static-3',
            title: 'Geopolitical Price Rally',
            msg: 'Precious metals are tracking a sharp global rally following coordinated strikes in the Middle East. Mumbai physical 24K gold surged to ₹1,73,090 per 10g today.',
            date: '02 Mar 2026',
            type: 'info'
        },
    ];

    const displayAlerts = news && news.length > 0 ? news : staticAlerts;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-32 px-6 pt-4 max-w-4xl mx-auto"
        >
            <div className="flex items-center gap-4 mb-10 justify-center">
                <div className="p-3 bg-white/5 rounded-2xl shadow-gold-glow border border-white/20">
                    <Bell className="text-gold-400" size={24} />
                </div>
                <h1 className="text-3xl md:text-5xl font-playfair font-black text-black uppercase tracking-tighter leading-none drop-shadow-luxury">Market Alerts</h1>
            </div>

            <div className="flex flex-col gap-6">
                {displayAlerts.map((alert, idx) => (
                    <motion.div
                        key={alert.id || idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass p-6 rounded-3xl shadow-luxury border-l-8 border-magenta-600 hover:scale-[1.02] transition-transform cursor-default overflow-hidden relative group"
                    >
                        {/* Hover Glow */}
                        <div className="absolute inset-0 bg-gold-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-xl font-playfair font-black text-black group-hover:text-gold-500 transition-colors uppercase tracking-tight">{alert.title}</h3>
                                <div className="flex items-center gap-2 text-black/60">
                                    <Calendar size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest font-poppins">{alert.date}</span>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${alert.type === 'urgent' ? 'bg-red-500/20 text-red-600' : 'bg-blue-500/20 text-blue-600'}`}>
                                {alert.type}
                            </span>
                        </div>
                        <p className="text-black font-poppins text-sm font-semibold leading-relaxed relative z-10">{alert.msg}</p>

                    </motion.div>
                ))}
            </div>

            <div className="mt-16 bg-white/5 p-10 rounded-3xl border border-white/20 text-center backdrop-blur-sm">
                <Info className="mx-auto text-gold-400 mb-4" size={40} />
                <p className="text-black/80 font-poppins font-bold text-sm">Stay tuned for real-time market updates and exclusive offers from Abhinav Gold & Silver.</p>
            </div>
        </motion.div>
    );
};

export default AlertsPage;
