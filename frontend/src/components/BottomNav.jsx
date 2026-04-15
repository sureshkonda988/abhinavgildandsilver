import { Home, BarChart2, Bell, PlayCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/rates', icon: BarChart2, label: 'Rates' },
    { to: '/videos', icon: PlayCircle, label: 'Videos' },
    { to: '/alerts', icon: Bell, label: 'Alerts' },
];

const BottomNav = () => {
    const location = useLocation();

    return (
        <>
            {/* Spacer so content doesn't hide behind the nav - Mobile Only */}
            <div className="h-20 md:hidden" />

            <nav
                className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
                style={{
                    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0f0f1a 100%)',
                    borderTop: '1px solid rgba(212,175,55,0.25)',
                    boxShadow: '0 -8px 32px rgba(0,0,0,0.6), 0 -1px 0 rgba(212,175,55,0.15)',
                }}
            >
                {/* Gold accent line at top */}
                <div
                    className="w-full h-[2px]"
                    style={{
                        background: 'linear-gradient(90deg, transparent 0%, #d4af37 20%, #f5d060 50%, #d4af37 80%, transparent 100%)',
                    }}
                />

                <div className="flex items-stretch justify-around px-2 py-1 max-w-screen-sm mx-auto">
                    {navItems.map(({ to, icon: Icon, label }) => {
                        const isActive = location.pathname === to;
                        return (
                            <Link
                                key={to}
                                to={to}
                                className="relative flex flex-col items-center justify-center flex-1 py-2 gap-1 group"
                                style={{ minHeight: 56 }}
                            >
                                {/* Active background glow */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.span
                                            layoutId="bottomNavActive"
                                            className="absolute inset-x-2 inset-y-1 rounded-xl"
                                            initial={{ opacity: 0, scale: 0.85 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.85 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(178,34,85,0.35) 0%, rgba(120,20,60,0.25) 100%)',
                                                border: '1px solid rgba(212,175,55,0.3)',
                                                boxShadow: '0 0 16px rgba(178,34,85,0.4)',
                                            }}
                                        />
                                    )}
                                </AnimatePresence>

                                {/* Icon */}
                                <motion.div
                                    animate={isActive
                                        ? { y: -2, scale: 1.15 }
                                        : { y: 0, scale: 1 }
                                    }
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    className="relative z-10"
                                    style={{ color: isActive ? '#d4af37' : 'rgba(148,163,184,0.7)' }}
                                >
                                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />

                                    {/* Dot indicator */}
                                    {isActive && (
                                        <motion.span
                                            layoutId="bottomNavDot"
                                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                                            style={{ background: '#d4af37', boxShadow: '0 0 6px #d4af37' }}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                                        />
                                    )}
                                </motion.div>

                                {/* Label */}
                                <span
                                    className="relative z-10 font-poppins font-bold uppercase tracking-widest transition-all duration-200"
                                    style={{
                                        fontSize: '9px',
                                        color: isActive ? '#d4af37' : 'rgba(148,163,184,0.6)',
                                        letterSpacing: '0.12em',
                                    }}
                                >
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* iOS safe area padding */}
                <div className="h-safe-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
            </nav>
        </>
    );
};

export default BottomNav;
