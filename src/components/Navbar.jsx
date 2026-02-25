import React from 'react';
import { Smartphone, MessageCircle, Bell, Search, Globe, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useRates } from '../context/RateContext';

const Navbar = () => {
    const { rates } = useRates();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const location = useLocation();

    // Close menu when route changes
    React.useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    const fmt = (val) => {
        if (typeof val !== 'number') return '-';
        return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const usdRate = rates.spot?.[2]?.ask || '-';

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-50 w-full bg-slate-950 border-b border-white/5 shadow-luxury px-0 md:px-6 py-2 md:py-3 flex items-center justify-between"
        >
            {/* Left: Logo & Brand */}
            <div className="flex items-center gap-2 md:gap-4 pl-4 md:pl-0">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden p-1.5 text-magenta-600 hover:bg-magenta-50 rounded-lg transition-colors"
                >
                    {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                <Link to="/" className="flex items-center gap-2 md:gap-3 group cursor-pointer">
                    <div className="w-8 h-8 md:w-10 md:h-10 gradient-luxury rounded-lg flex items-center justify-center shadow-gold-glow">
                        <span className="text-gold-400 font-playfair font-black text-lg md:text-xl">A</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-magenta-600 font-playfair font-black text-lg md:text-xl tracking-tight leading-none">ABHINAV</span>
                        <span className="text-magenta-700 font-poppins font-bold text-[8px] md:text-[10px] tracking-[0.2em] leading-tight">GOLD & SILVER</span>
                    </div>
                </Link>
            </div>

            {/* Center: Menu */}
            <div className="hidden md:flex items-center gap-8">
                {[
                    { name: 'Home', path: '/' },
                    { name: 'Rates', path: '/rates' },
                    { name: 'Alerts', path: '/alerts' },
                    { name: 'Videos', path: '/videos' }
                ].map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`font-poppins font-semibold text-sm transition-all relative group ${location.pathname === item.path ? 'text-magenta-600' : 'text-slate-300 hover:text-magenta-600'
                            }`}
                    >
                        {item.name}
                        <span className={`absolute -bottom-1 left-0 h-0.5 bg-magenta-600 transition-all ${location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'
                            }`}></span>
                    </Link>
                ))}
            </div>

            {/* Right: Icons & Info */}
            <div className="flex items-center gap-2 md:gap-4 pr-4 md:pr-0">
                {/* Rate Display */}
                <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/20">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">USD price</span>
                    </div>
                    <span className="text-sm font-black text-white font-poppins">₹{fmt(usdRate)}</span>
                </div>

                <div className="flex items-center gap-1.5 md:gap-3">
                    <button className="hidden sm:block p-2 text-magenta-600 hover:bg-magenta-50 rounded-full transition-colors">
                        <Search size={20} />
                    </button>
                    <a
                        href="https://wa.me/919848012345"
                        target="_blank"
                        className="p-2 md:p-2.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-transform hover:scale-110 shadow-lg"
                    >
                        <MessageCircle size={18} />
                    </a>
                    <button className="p-2 md:p-2.5 bg-gold-400 text-magenta-700 rounded-full hover:bg-gold-500 transition-transform hover:scale-110 shadow-lg">
                        <Bell size={18} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl md:hidden flex flex-col pt-24 px-8 gap-6"
                    >
                        <div className="flex flex-col gap-6">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'Rates', path: '/rates' },
                                { name: 'Alerts', path: '/alerts' },
                                { name: 'Videos', path: '/videos' }
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`font-poppins font-black text-2xl uppercase tracking-tighter transition-all ${location.pathname === item.path ? 'text-magenta-600 ml-4' : 'text-slate-400'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {location.pathname === item.path && (
                                            <motion.span
                                                layoutId="active-indicator"
                                                className="w-2 h-8 bg-magenta-600 rounded-full"
                                            />
                                        )}
                                        {item.name}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-auto pb-12 flex flex-col gap-4">
                            <div className="p-4 glass rounded-2xl flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">USD Gold</span>
                                <span className="text-lg font-black text-magenta-600 font-poppins">₹{fmt(usdRate)}</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-300 text-center uppercase tracking-widest">© 2026 Abhinav Gold & Silver</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
