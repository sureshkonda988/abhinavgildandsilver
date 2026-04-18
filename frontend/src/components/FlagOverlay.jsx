import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const FlagOverlay = ({ isVisible, onClose }) => {
    // Generate 30 slices for the flag to create a wave effect
    const sliceCount = 30;
    const slices = Array.from({ length: sliceCount });

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden"
                >
                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-10 right-10 z-[210] p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors group cursor-pointer border-0 outline-none"
                    >
                        <X size={32} className="text-white group-hover:rotate-90 transition-transform duration-300" />
                    </button>

                    {/* Wind/Air Hit Decoration */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, x: -500 }}
                        animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.5, 2], x: [ -500, 500, 1500] }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white/30 to-transparent skew-x-12"
                    />

                    {/* Flag Container */}
                    <motion.div 
                        initial={{ scale: 0.1, rotateY: -90, x: -200, opacity: 0 }}
                        animate={{ 
                            scale: 1, 
                            rotateY: 0, 
                            x: 0, 
                            opacity: 1,
                            transition: {
                                type: "spring",
                                stiffness: 100,
                                damping: 12,
                                delay: 0.1
                            }
                        }}
                        exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.2 } }}
                        className="relative flex h-[30vh] md:h-[50vh] w-[90vw] md:w-[70vw] shadow-[0_50px_100px_rgba(0,0,0,0.8)] preserve-3d"
                    >
                        {slices.map((_, i) => (
                            <div 
                                key={i}
                                className="h-full flex-1 relative flex flex-col"
                                style={{
                                    animation: `indian-wave 2.5s ease-in-out infinite`,
                                    animationDelay: `${i * 0.08}s`,
                                    transformStyle: 'preserve-3d',
                                    backfaceVisibility: 'hidden'
                                }}
                            >
                                {/* Saffron */}
                                <div className="flex-1 bg-[#FF9933] relative">
                                    <div className="absolute inset-0 bg-black/10" style={{ opacity: Math.sin(i * 0.3) * 0.2 + 0.2 }} />
                                </div>
                                {/* White */}
                                <div className="flex-1 bg-white relative flex items-center justify-center">
                                    <div className="absolute inset-0 bg-black/5" style={{ opacity: Math.sin(i * 0.3) * 0.15 + 0.15 }} />
                                    {/* Ashoka Chakra (only on middle slices) */}
                                    {i >= Math.floor(sliceCount * 0.4) && i <= Math.ceil(sliceCount * 0.6) && (
                                        <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                                            <div 
                                                className="w-full aspect-square border-[1px] md:border-2 border-[#000080] rounded-full flex items-center justify-center"
                                                style={{ 
                                                    maxWidth: '85%', 
                                                    transform: `translateX(${(i - (sliceCount - 1) / 2) * -(100 / (sliceCount * 0.2)) }%)`
                                                }}
                                            >
                                                <div className="w-[10%] h-[10%] bg-[#000080] rounded-full z-20" />
                                                <div className="absolute inset-0 animate-spin-slow">
                                                    {Array.from({ length: 24 }).map((_, spoke) => (
                                                        <div 
                                                            key={spoke}
                                                            className="absolute top-1/2 left-1/2 w-[50%] h-[1px] bg-[#000080] origin-left"
                                                            style={{ transform: `translateX(0%) rotate(${spoke * 15}deg)` }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Green */}
                                <div className="flex-1 bg-[#138808] relative">
                                    <div className="absolute inset-0 bg-black/10" style={{ opacity: Math.sin(i * 0.3) * 0.2 + 0.2 }} />
                                </div>
                            </div>
                        ))}

                        {/* Subtle Reflection */}
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 via-transparent to-black/20" />
                    </motion.div>

                    {/* Text Overlay */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute bottom-[10%] flex flex-col items-center gap-2"
                    >
                        <h2 className="text-white font-playfair font-black text-4xl md:text-7xl uppercase tracking-[0.5em] drop-shadow-lg scale-y-110">
                            Jai Hind
                        </h2>
                        <div className="h-1 w-24 bg-[#FF9933] rounded-full mt-2" />
                    </motion.div>
                </motion.div>
            )}

            <style>{`
                @keyframes indian-wave {
                    0%, 100% {
                        transform: translateZ(0) translateY(0) rotateY(12deg);
                    }
                    50% {
                        transform: translateZ(60px) translateY(-10px) rotateY(-12deg);
                    }
                }
                .preserve-3d {
                    transform-style: preserve-3d;
                }
                .animate-spin-slow {
                    animation: spin-chakra 15s linear infinite;
                }
                @keyframes spin-chakra {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </AnimatePresence>
    );
};

export default FlagOverlay;
