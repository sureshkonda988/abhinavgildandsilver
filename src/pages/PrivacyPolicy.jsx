import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-slate-300 font-poppins"
        >
            <h1 className="text-4xl font-playfair font-black text-white mb-8 uppercase tracking-widest text-center">Privacy Policy</h1>
            <div className="space-y-6 bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10">
                <section>
                    <h2 className="text-xl font-bold text-gold-400 mb-4 uppercase tracking-wider">Introduction</h2>
                    <p className="leading-relaxed">
                        At Abhinav Gold & Silver, we prioritize the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by our website and how we use it.
                    </p>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-gold-400 mb-4 uppercase tracking-wider">Information Collection</h2>
                    <p className="leading-relaxed">
                        We collect information you provide directly to us, such as when you contact us for inquiries about bullion rates or market alerts. This may include your name, email, and phone number.
                    </p>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-gold-400 mb-4 uppercase tracking-wider">How We Use Your Info</h2>
                    <ul className="list-disc list-inside space-y-2 text-slate-400">
                        <li>To provide and maintain our live rate services.</li>
                        <li>To communicate with you regarding market updates.</li>
                        <li>To ensure transparency in all bullion transactions.</li>
                    </ul>
                </section>
                <footer className="pt-8 border-t border-white/10 text-xs text-slate-500 italic">
                    Last updated: March 2026. For further queries, contact our main branch.
                </footer>
            </div>
        </motion.div>
    );
};

export default PrivacyPolicy;
