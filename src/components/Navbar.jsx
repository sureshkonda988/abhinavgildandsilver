import React from 'react';
import { Smartphone, MessageCircle, Bell, Search, Globe, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useRates } from '../context/RateContext';

const Navbar = () => {
    const { rates } = useRates();
    const location = useLocation();

    const fmt = (val) => {
        if (typeof val !== 'number') return '-';
        return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const usdRate = rates.spot?.[2]?.ask || '-';

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Rates', path: '/rates' },
        { name: 'Alerts', path: '/alerts' },
        { name: 'Videos', path: '/videos' }
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-50 w-full bg-slate-950 border-b border-white/10 shadow-luxury px-2 md:px-6 py-0 md:py-0.5 hidden md:flex items-center justify-between min-h-[36px] md:min-h-[44px]"
        >
            {/* Left Section: Logo - Compact for Mobile */}
            <div className="flex items-center">
                <Link to="/" className="flex items-center gap-1.5 md:gap-3 group cursor-pointer">
                    <div className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center shrink-0 relative">
                        <img 
                            src="/logofd.png" 
                            alt="Abhinav Logo" 
                            className="w-12 h-12 md:w-20 md:h-20 object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-xl" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-magenta-600 font-playfair font-black text-[14px] md:text-xl tracking-tight leading-none uppercase">ABHINAV</span>
                        <span className="text-[7px] md:text-[10px] text-magenta-700/80 font-poppins font-bold tracking-[0.1em] leading-tight hidden sm:block">GOLD & SILVER</span>
                    </div>
                </Link>
            </div>

            {/* Middle Section: Integrated Nav Buttons (Desktop & Mobile) */}
            <div className="hidden md:flex items-center gap-2 md:gap-8 px-2">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`font-poppins font-bold text-[9px] md:text-sm transition-all relative group flex flex-col items-center gap-0.5 ${location.pathname === item.path ? 'text-white' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <span className="uppercase tracking-widest">{item.name}</span>
                        {/* Active Indicator Line */}
                        <motion.span
                            initial={false}
                            animate={{
                                width: location.pathname === item.path ? '100%' : '0%',
                                opacity: location.pathname === item.path ? 1 : 0
                            }}
                            className="h-[2px] bg-gold-400 rounded-full"
                        />
                    </Link>
                ))}
            </div>

            {/* Right Section: Quick Icons */}
            <div className="flex items-center gap-1.5 md:gap-4">
                {/* Rate Display (Desktop only) */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">USD</span>
                    <motion.span
                        key={usdRate}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.1, 1] }}
                        className={`text-xs font-black transition-colors duration-300 ${rates.spot?.[2]?.trend === 'up' ? 'text-emerald-400' : rates.spot?.[2]?.trend === 'down' ? 'text-rose-400' : 'text-white'}`}
                    >
                        ₹{fmt(usdRate)}
                    </motion.span>
                </div>

                <div className="hidden md:flex items-center gap-1 md:gap-3">
                    <a
                        href="https://wa.me/919848012345"
                        target="_blank"
                        className="p-1.5 md:p-2 bg-green-500/90 text-white rounded-lg hover:bg-green-600 transition-all hover:scale-105 active:scale-95 shadow-md flex items-center justify-center shrink-0"
                    >
                        <MessageCircle size={14} className="md:w-5 md:h-5" />
                    </a>
                    <button className="p-1.5 md:p-2 bg-gold-400 text-magenta-950 rounded-lg hover:bg-gold-500 transition-all hover:scale-105 active:scale-95 shadow-md flex items-center justify-center shrink-0">
                        <Bell size={14} className="md:w-5 md:h-5" />
                    </button>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
