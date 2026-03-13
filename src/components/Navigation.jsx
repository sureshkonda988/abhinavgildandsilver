import React, { useState } from 'react';
import { Menu, X, MessageCircle, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useRates } from '../context/RateContext';

const Navigation = () => {
    const { rates } = useRates();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Rates', path: '/rates' },
        { name: 'Alerts', path: '/alerts' },
        { name: 'Videos', path: '/videos' }
    ];

    return (
        <>
            {/* Absolute Positioned Triggers over the Header Banner */}
            <div className="absolute top-0 w-full z-50 pointer-events-none">
                <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex justify-between items-start pointer-events-auto">
                    {/* Left: Hamburger Icon */}
                    <button 
                        onClick={() => setIsOpen(true)}
                        className="p-2 md:p-3 bg-black/40 backdrop-blur-md rounded-xl text-white hover:bg-black/60 transition-all shadow-premium border border-white/20"
                    >
                        <Menu size={24} className="md:w-7 md:h-7" />
                    </button>

                    {/* Right: Action Icons (Home Page Only) */}
                    {location.pathname === '/' && (
                        <div className="flex items-center gap-2 md:gap-4">
                            <a
                                href="https://wa.me/919848012345"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 md:p-3 bg-green-500/90 text-white rounded-xl hover:bg-green-600 transition-all hover:scale-105 active:scale-95 shadow-premium flex items-center justify-center border border-white/20"
                            >
                                <MessageCircle size={24} className="md:w-6 md:h-6" />
                            </a>
                            <button className="p-2 md:p-3 bg-[#FFD700]/90 text-slate-900 rounded-xl hover:bg-[#FFD700] transition-all hover:scale-105 active:scale-95 shadow-premium flex items-center justify-center border border-white/20">
                                <Bell size={24} className="md:w-6 md:h-6" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Side Drawer Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Dim Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        />

                        {/* Drawer Panel */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 h-full w-[280px] md:w-[320px] bg-slate-950 shadow-2xl z-[101] flex flex-col border-r border-white/10"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 md:p-8 flex justify-between items-center border-b border-white/10">
                                <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 group cursor-pointer">
                                    <img 
                                        src="/logofd.png" 
                                        alt="Abhinav Logo" 
                                        className="w-10 h-10 object-contain drop-shadow-xl" 
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-magenta-600 font-playfair font-black text-lg tracking-tight leading-none uppercase">ABHINAV</span>
                                        <span className="text-[9px] text-magenta-700/80 font-poppins font-bold tracking-[0.1em] leading-tight">GOLD & SILVER</span>
                                    </div>
                                </Link>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Navigation Links */}
                            <div className="flex flex-col py-6 px-4 gap-2 flex-grow overflow-y-auto">
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.path}
                                            onClick={() => setIsOpen(false)}
                                            className={`font-poppins font-bold text-sm md:text-base px-6 py-4 rounded-xl transition-all flex items-center ${
                                                isActive 
                                                ? 'bg-gradient-to-r from-magenta-600/20 to-transparent text-white border-l-4 border-magenta-500' 
                                                : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                                            }`}
                                        >
                                            <span className="uppercase tracking-widest">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Drawer Footer Info */}
                            <div className="p-6 border-t border-white/10">
                                <div className="flex flex-col gap-1 text-xs text-slate-500 font-poppins text-center">
                                    <span>Terms & Conditions</span>
                                    <span>Privacy Policy</span>
                                    <span className="mt-4 opacity-50">© 2026 Abhinav Jewellers</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navigation;
