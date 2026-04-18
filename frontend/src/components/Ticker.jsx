import React, { useEffect } from 'react';
import { useRates } from '../context/RateContext';

const Ticker = () => {
    const { ticker: msg } = useRates();

    useEffect(() => {
        // Cleanup legacy storage if it exists
        localStorage.removeItem('ag_ticker');
    }, []);

    return (
        <div
            className="relative w-full overflow-hidden flex items-center h-8 md:h-10 bg-[#90034a] z-30"
            style={{
                backgroundImage: 'url(/bg-ticker.webp)',
                backgroundPosition: 'center',
                backgroundRepeat: 'repeat-x',
                backgroundSize: 'auto 100%'
            }}
        >
            {/* The Text Layer - Moves Right to Left */}
            <div className="flex animate-ticker-rtl whitespace-nowrap w-max h-auto items-center">
                <div className="flex items-center gap-12 px-6 shrink-0">
                    <span className="text-white font-poppins font-black text-[13px] md:text-xl uppercase tracking-[0.2em] inline-flex items-center gap-4 drop-shadow-luxury">
                        <span className="text-gold-400 text-lg">✦</span> {msg}
                    </span>
                    <span className="text-white font-poppins font-black text-[13px] md:text-xl uppercase tracking-[0.2em] inline-flex items-center gap-4 drop-shadow-luxury">
                        <span className="text-gold-400 text-lg">✦</span> {msg}
                    </span>
                </div>
                {/* Duplicate for seamless looping */}
                <div className="flex items-center gap-12 px-6 shrink-0">
                    <span className="text-white font-poppins font-black text-[13px] md:text-xl uppercase tracking-[0.2em] inline-flex items-center gap-4 drop-shadow-luxury">
                        <span className="text-gold-400 text-lg">✦</span> {msg}
                    </span>
                    <span className="text-white font-poppins font-black text-[13px] md:text-xl uppercase tracking-[0.2em] inline-flex items-center gap-4 drop-shadow-luxury">
                        <span className="text-gold-400 text-lg">✦</span> {msg}
                    </span>
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

export default Ticker;
