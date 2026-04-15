import React from 'react';
import { motion } from 'framer-motion';

const TermsOfService = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-slate-300 font-poppins"
        >
            <h1 className="text-4xl font-playfair font-black text-white mb-8 uppercase tracking-widest text-center">Terms of Service</h1>
            <div className="space-y-6 bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10">
                <section>
                    <h2 className="text-xl font-bold text-gold-400 mb-4 uppercase tracking-wider">1. Acceptance of Terms</h2>
                    <p className="leading-relaxed">
                        By accessing this website, you are agreeing to be bound by these website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws.
                    </p>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-gold-400 mb-4 uppercase tracking-wider">2. Market Rates Disclaimer</h2>
                    <p className="leading-relaxed">
                        All live gold and silver rates displayed are for information purposes only. Final transaction prices are subject to GST and local market adjustments at the time of purchase.
                    </p>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-gold-400 mb-4 uppercase tracking-wider">3. Limitations</h2>
                    <p className="leading-relaxed">
                        Abhinav Gold & Silver shall not be held liable for any damages that will arise with the use or inability to use the materials on this website, even if we have been notified orally or written of the possibility of such damage.
                    </p>
                </section>
                <footer className="pt-8 border-t border-white/10 text-xs text-slate-500 italic">
                    All bullion trading is subject to standard KYC requirements.
                </footer>
            </div>
        </motion.div>
    );
};

export default TermsOfService;
