import React from 'react';
import { Bell, Info, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const AlertsPage = () => {
    const alerts = [
        { id: 1, title: 'Gold Market Update', msg: 'Market is showing significant bullish momentum today.', date: '21 Feb 2026', type: 'info' },
        { id: 2, title: 'Holiday Notice', msg: 'Office will be closed on March 5th for traditional festival.', date: '20 Feb 2026', type: 'urgent' },
        { id: 3, title: 'New Arrival', msg: 'Special edition 24K gold coins now available in stock.', date: '19 Feb 2026', type: 'info' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-32 px-6 pt-10 max-w-4xl mx-auto"
        >
            <div className="flex items-center gap-4 mb-10 justify-center">
                <div className="p-3 bg-white/5 rounded-2xl shadow-gold-glow border border-white/20">
                    <Bell className="text-gold-400" size={32} />
                </div>
                <h1 className="text-3xl md:text-5xl font-playfair font-black text-white uppercase tracking-tighter leading-none drop-shadow-luxury">Market Alerts</h1>
            </div>

            <div className="flex flex-col gap-6">
                {alerts.map((alert, idx) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass p-6 rounded-3xl shadow-luxury border-l-8 border-magenta-600 hover:scale-[1.02] transition-transform cursor-default"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-xl font-playfair font-black text-white">{alert.title}</h3>
                                <div className="flex items-center gap-2 text-white/50">
                                    <Calendar size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest font-poppins">{alert.date}</span>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${alert.type === 'urgent' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}`}>
                                {alert.type}
                            </span>
                        </div>
                        <p className="text-white/70 font-poppins text-sm leading-relaxed">{alert.msg}</p>
                    </motion.div>
                ))}
            </div>

            <div className="mt-16 bg-white/5 p-10 rounded-3xl border border-white/20 text-center backdrop-blur-sm">
                <Info className="mx-auto text-gold-400 mb-4" size={40} />
                <p className="text-white/60 font-poppins text-sm">Stay tuned for real-time market updates and exclusive offers from Abhinav Gold & Silver.</p>
            </div>
        </motion.div>
    );
};

export default AlertsPage;
