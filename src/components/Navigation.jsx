import React from 'react';
import { MessageCircle, Bell, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useRates } from '../context/RateContext';

const Navigation = () => {
    const { rates, isMusicEnabled, toggleMusic } = useRates();
    const location = useLocation();
    const isRatesPage = location.pathname === '/rates';
    const isHomePage = location.pathname === '/';
    const showMusicBtn = isRatesPage || isHomePage;


    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Rates', path: '/rates' },
        { name: 'Videos', path: '/videos' },
        { name: 'Alerts', path: '/alerts' }
    ];



    return (
        <>
            {/* Main Header Container */}
            <div className="absolute lg:relative top-0 w-full z-50 p-0">
                <div className="max-w-full mx-auto px-0 py-0">
                    {/* Desktop View (≥1024px) */}
                    <nav className="hidden lg:flex items-center justify-between bg-[#0b0e14] border-b border-white/5 px-6 py-0.5 shadow-2xl">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <img 
                                src="/logofd.png" 
                                alt="Abhinav Logo" 
                                className="w-10 h-10 object-contain" 
                            />
                            <div className="flex flex-col">
                                <span className="text-[#f4cb4c] font-playfair font-black text-xl tracking-tight leading-none uppercase">ABHINAV</span>
                                <span className="text-[#f4cb4c] font-poppins font-bold text-[9px] tracking-[0.1em] leading-tight">GOLD & SILVER</span>
                            </div>
                        </Link>

                        {/* Navigation Links */}
                        <div className="flex items-center gap-10">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`font-poppins font-bold text-sm uppercase tracking-widest transition-all relative py-2 ${
                                            isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {item.name}
                                        {isActive && (
                                            <motion.div 
                                                layoutId="navUnderline"
                                                className="absolute -bottom-0.5 left-0 right-0 h-1 bg-[#f4cb4c] rounded-full"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-6">
                            {/* Music Toggle - Home & Rates Desktop */}
                            {showMusicBtn && (
                                <button
                                    onClick={toggleMusic}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg border-0 transition-all hover:scale-110 ${
                                        isMusicEnabled ? 'bg-gold-500 text-white animate-pulse' : 'bg-slate-700 text-slate-300'
                                    }`}
                                    title={isMusicEnabled ? 'Turn Off Music' : 'Turn On Music'}
                                >
                                    <Music size={18} strokeWidth={2.5} />
                                </button>
                            )}
                            <div className="flex items-center gap-3">
                                <a
                                    href="https://wa.me/919848012345"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 bg-[#1eb858] text-white rounded-xl hover:bg-green-500 transition-all flex items-center justify-center shadow-lg border-0"
                                >
                                    <MessageCircle size={18} strokeWidth={2.5} />
                                </a>
                                <button className="w-9 h-9 bg-[#f4cb4c] text-slate-900 rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center shadow-lg border-0">
                                    <Bell size={18} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </nav>

                    {/* Mobile View - Buttons removed per user request */}
                    <div className="lg:hidden pointer-events-none px-4 py-4" />
                </div>
            </div>


        </>
    );
};

export default Navigation;
