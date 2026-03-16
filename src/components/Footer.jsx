import React from 'react';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter, Chrome, ShieldAlert, Volume2, VolumeX, ShieldCheck, Award, Music } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useRates } from '../context/RateContext';

const Footer = () => {
    const { isMusicEnabled, toggleMusic, music } = useRates();
    const location = useLocation();
    const isRatesPage = location.pathname === '/rates';
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 pt-16 pb-8 px-6 text-slate-400 font-poppins relative overflow-hidden">
            {/* Music Toggle - Rates Page (Footer) */}
            {isRatesPage && (
                <div className="absolute top-0 right-6 md:right-12 z-50">
                    <button
                        onClick={toggleMusic}
                        className={`p-4 rounded-full shadow-2xl transition-all border-2 transform -translate-y-1/2 ${isMusicEnabled ? 'bg-gold-500 border-gold-400 text-white animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-400'} ${!(music.ratesMusic?.sourceType === 'local' ? music.ratesMusic?.fileUrl : music.ratesMusic?.videoId) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                        title={!(music.ratesMusic?.sourceType === 'local' ? music.ratesMusic?.fileUrl : music.ratesMusic?.videoId) ? "No music set for Rates page" : (isMusicEnabled ? "Turn Off Music" : "Turn On Music")}
                    >
                        <Music size={24} />
                    </button>
                    {!(music.ratesMusic?.sourceType === 'local' ? music.ratesMusic?.fileUrl : music.ratesMusic?.videoId) && <span className="absolute top-full right-0 mt-2 text-[8px] text-slate-500 whitespace-nowrap bg-slate-800 px-2 py-1 rounded">No music set</span>}
                </div>
            )}
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-magenta-900/10 blur-[120px] rounded-full -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-900/10 blur-[120px] rounded-full translate-y-1/2" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
                    <div className="flex flex-col gap-6">
                        <h4 className="text-white font-playfair font-bold text-lg mb-2 uppercase tracking-widest text-center lg:text-left">Bank QR</h4>
                        <div className="flex flex-col items-center lg:items-start gap-4">
                            <a 
                                href="https://wa.me/919848012345" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-white p-2.5 rounded-[22px] shadow-luxury border-2 border-gold-400/30 group relative overflow-hidden w-max block hover:border-gold-400 transition-all"
                            >
                                <img src="/qr-code.png" alt="Scan QR Bank" className="w-24 h-24 object-contain transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gold-400/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </a>
                            <div className="flex flex-col lg:items-start items-center gap-2">
                                <span className="text-white font-poppins font-black text-[9px] uppercase tracking-[0.2em]">Bank Details</span>
                                <a 
                                    href="https://wa.me/919848012345" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[8px] bg-gold-400/10 text-gold-400 px-3 py-1 rounded-full border border-gold-400/20 hover:bg-gold-400 hover:text-slate-900 transition-all font-bold uppercase tracking-widest"
                                >
                                    Open Link
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Brand Section */}
                    <div className="flex flex-col gap-6">
                        <Link to="/" className="flex items-center gap-3">
                            <img src="/logofd.png" alt="Abhinav Logo" className="w-12 h-12 object-contain" />
                            <div className="flex flex-col">
                                <span className="text-white font-playfair font-black text-xl tracking-tight leading-none uppercase">ABHINAV</span>
                                <span className="text-[10px] text-gold-400 font-poppins font-bold tracking-[0.2em] leading-tight">GOLD & SILVER</span>
                            </div>
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-400 font-poppins">
                            Purity you can trust, quality you can wear. Abhinav Gold & Silver delivers the finest bullion and jewelry with a legacy of excellence and transparency.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={<Instagram size={18} />} href="#" />
                            <SocialIcon icon={<Facebook size={18} />} href="#" />
                            <SocialIcon icon={<Twitter size={18} />} href="#" />
                        </div>
                    </div>



                    {/* Features / Why Us */}
                    <div>
                        <h4 className="text-white font-playfair font-bold text-lg mb-6 uppercase tracking-widest">Why Choose Us</h4>
                        <ul className="flex flex-col gap-4">
                            <FeatureItem icon={<ShieldCheck size={16} className="text-gold-400" />} text="100% Purity Guaranteed" />
                            <FeatureItem icon={<Clock size={16} className="text-gold-400" />} text="Real-time Market Rates" />
                            <FeatureItem icon={<Award size={16} className="text-gold-400" />} text="Certified Bullion Dealer" />
                        </ul>
                    </div>

                    {/* Contact Details */}
                    <div>
                        <h4 className="text-white font-playfair font-bold text-lg mb-6 uppercase tracking-widest">Contact Owner</h4>
                        <div className="flex flex-col gap-5">
                            <ContactItem icon={<Phone size={18} />} title="WhatsApp / Call" value="+91 98480 12345" href="https://wa.me/919848012345" />
                            <ContactItem icon={<Mail size={18} />} title="Email Support" value="info@abhinavjewellers.com" href="mailto:info@abhinavjewellers.com" />
                            <ContactItem icon={<MapPin size={18} />} title="Main Branch" value="Jeweler Street, Hyderabad, India" />
                        </div>
                    </div>


                    {/* Location QR - Right Side End */}
                    <div className="flex flex-col gap-6 lg:items-end">
                        <h4 className="text-white font-playfair font-bold text-lg mb-2 uppercase tracking-widest text-center lg:text-right">Location QR</h4>
                        <div className="flex flex-col items-center lg:items-end gap-4">
                            <a 
                                href="https://maps.google.com/?q=Jeweler+Street,Hyderabad,India" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-white p-2.5 rounded-[22px] shadow-luxury border-2 border-gold-400/30 group relative overflow-hidden w-max block hover:border-gold-400 transition-all"
                            >
                                <img src="/qr-code (1).png" alt="Scan QR Location" className="w-24 h-24 object-contain transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gold-400/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </a>
                            <div className="flex flex-col lg:items-end items-center gap-2">
                                <span className="text-white font-poppins font-black text-[9px] uppercase tracking-[0.2em]">📍 Location</span>
                                <a 
                                    href="https://maps.google.com/?q=Jeweler+Street,Hyderabad,India" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[8px] bg-gold-400/10 text-gold-400 px-3 py-1 rounded-full border border-gold-400/20 hover:bg-gold-400 hover:text-slate-900 transition-all font-bold uppercase tracking-widest"
                                >
                                    Open Link
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] md:text-xs font-poppins font-bold uppercase tracking-widest text-slate-500">
                    <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
                        <p>© {currentYear} Abhinav Gold & Silver. All Rights Reserved.</p>
                        <p className="text-[9px] text-slate-600 lowercase font-normal italic">Trusted by thousands for purity and excellence in bullion trading since 1995.</p>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex gap-4">
                            <Link to="/privacy" className="hover:text-gold-400 transition-colors">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-gold-400 transition-colors">Terms of Service</Link>
                        </div>
                        <div className="h-4 w-px bg-white/10 hidden md:block" />
                        <a href="https://stackvil.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
                            <span className="text-[9px] text-slate-600">Designed by</span>
                            <img src="/stackvil logo.jpg" alt="Stackvil" className="h-5 grayscale hover:grayscale-0 transition-all rounded-sm" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const FooterLink = ({ to, label }) => (
    <li>
        <Link to={to} className="text-sm font-poppins text-slate-400 hover:text-gold-400 transition-colors flex items-center gap-2 group">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400/20 group-hover:bg-gold-400 transition-colors" />
            {label}
        </Link>
    </li>
);

const FeatureItem = ({ icon, text }) => (
    <li className="flex items-center gap-3 text-sm font-poppins text-slate-400">
        {icon}
        <span>{text}</span>
    </li>
);

const SocialIcon = ({ icon, href }) => (
    <a href={href} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold-400 hover:text-slate-950 transition-all duration-300 border border-white/10">
        {icon}
    </a>
);

const ContactItem = ({ icon, title, value, href }) => {
    const Content = (
        <div className="flex items-start gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center shrink-0 text-gold-400 group-hover:bg-gold-400 group-hover:text-slate-950 transition-all">
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">{title}</span>
                <span className="text-sm text-slate-300 font-bold group-hover:text-white transition-colors">{value}</span>
            </div>
        </div>
    );

    return href ? <a href={href} className="block">{Content}</a> : Content;
};

export default Footer;
