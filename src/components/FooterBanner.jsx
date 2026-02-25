import React from 'react';
import { motion } from 'framer-motion';

const FooterBanner = () => {
    const [msg, setMsg] = React.useState(localStorage.getItem('ag_ticker') || 'Welcome to Abhinav Gold & Silver - Quality Purity Guaranteed');

    React.useEffect(() => {
        const handleStorage = () => {
            const val = localStorage.getItem('ag_ticker');
            if (val) setMsg(val);
        };
        window.addEventListener('storage', handleStorage);
        const interval = setInterval(handleStorage, 5000);
        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="w-full overflow-hidden">
            <section className="relative w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                <motion.img
                    initial={{ opacity: 0, scale: 1.1 }}
                    whileInView={{ opacity: 0.6, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5 }}
                    src="/1000029434.jpg.jpeg"
                    alt="Abhinav Gold & Silver Banner"
                    className="w-full h-6 md:h-8 object-cover block"
                />
            </section>

            {/* Ticker Section - Truly Transparent Background */}
            <div className="w-full h-10 md:h-10 flex items-center overflow-hidden relative z-10 bg-transparent -mt-7">
                <div className="flex animate-ticker-rtl whitespace-nowrap w-max items-center">
                    <div className="flex items-center gap-12 px-6 shrink-0">
                        {[1, 2, 3, 4].map((i) => (
                            <span key={i} className="text-white drop-shadow-sm font-poppins font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] flex items-center gap-4">
                                <span className="text-gold-400">✦</span> {msg}
                            </span>
                        ))}
                    </div>
                    {/* Duplicate for seamless looping */}
                    <div className="flex items-center gap-12 px-6 shrink-0">
                        {[1, 2, 3, 4].map((i) => (
                            <span key={i} className="text-white drop-shadow-sm font-poppins font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] flex items-center gap-4">
                                <span className="text-gold-400">✦</span> {msg}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes tickerRTL {
                    from { transform: translate3d(0, 0, 0); }
                    to { transform: translate3d(-50%, 0, 0); }
                }
                .animate-ticker-rtl {
                    animation: tickerRTL 30s linear infinite !important;
                }
            ` }} />
        </div>
    );
};

export default FooterBanner;
