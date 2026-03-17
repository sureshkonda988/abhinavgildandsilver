import React, { useState, useEffect } from 'react';
import { Play, PlayCircle, ChevronLeft, ChevronRight, Settings, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRates } from '../context/RateContext';

const VideoCard = ({ video, isActive, position, onClick }) => {
    const [isMuted, setIsMuted] = useState(true);

    // Calculate position and scale based on index distance from activeIndex
    const isNext = position === 1 || position === 2;
    const isPrev = position === -1 || position === -2;

    const variants = {
        center: { x: '0%', scale: 1, zIndex: 10, opacity: 1, rotateY: 0 },
        prev: { x: '-60%', scale: 0.75, zIndex: 5, opacity: 0.6, rotateY: 30 },
        prevFar: { x: '-110%', scale: 0.6, zIndex: 2, opacity: 0.3, rotateY: 45 },
        next: { x: '60%', scale: 0.75, zIndex: 5, opacity: 0.6, rotateY: -30 },
        nextFar: { x: '110%', scale: 0.6, zIndex: 2, opacity: 0.3, rotateY: -45 },
        hidden: { x: '0%', scale: 0.4, zIndex: 0, opacity: 0 }
    };

    let currentVariant = 'hidden';
    if (position === 0) currentVariant = 'center';
    else if (position === -1) currentVariant = 'prev';
    else if (position === -2) currentVariant = 'prevFar';
    else if (position === 1) currentVariant = 'next';
    else if (position === 2) currentVariant = 'nextFar';

    return (
        <motion.div
            animate={currentVariant}
            variants={variants}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`absolute w-full max-w-[240px] md:max-w-[300px] aspect-[9/16] cursor-pointer perspective-1000`}
            onClick={() => position !== 0 && onClick()}
        >
            <div className={`relative w-full h-full bg-black rounded-[24px] md:rounded-[40px] overflow-hidden shadow-2xl border border-white/10 transition-all duration-500 ${isActive ? 'ring-2 ring-gold-400' : ''}`}>
                {/* Video / Thumbnail */}
                <div className="absolute inset-0 w-full h-full">
                    {isActive ? (
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${video.videoId}&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="w-full h-full relative group">
                            <img
                                src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                                alt={video.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                                    <Play fill="currentColor" size={24} className="ml-1" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls (Top Right Overlay) */}
                {isActive && (
                    <div className="absolute top-4 right-4 flex flex-col gap-3 z-50">
                        <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="p-3 bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-black/60 transition-all">
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                        <button className="p-3 bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-black/60 transition-all">
                            <Maximize2 size={18} />
                        </button>
                    </div>
                )}

                {/* Subtitle / Brand Branding (Bottom Overlay) */}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-2">
                    <span className="text-gold-400 font-poppins font-black text-[10px] uppercase tracking-widest drop-shadow-md">Abhinav Gold</span>
                    <h3 className="text-white font-playfair font-black text-lg md:text-2xl leading-tight drop-shadow-lg">{video.title}</h3>
                </div>
            </div>
        </motion.div>
    );
};

const VideosPage = () => {
    const { videos } = useRates();
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        // We now rely on RateContext's videos state
    }, []);

    const handleNext = () => setActiveIndex((prev) => (prev + 1) % videos.length);
    const handlePrev = () => setActiveIndex((prev) => (prev - 1 + videos.length) % videos.length);

    const validVideos = videos.filter(v => v.videoId && v.videoId.length === 11);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full relative py-12 px-6 flex flex-col items-center select-none"
        >


            {/* Carousel Container */}
            <div className="relative w-full h-[450px] md:h-[580px] flex items-center justify-center overflow-hidden">
                {/* Navigation Arrows */}
                <button
                    onClick={handlePrev}
                    className="absolute left-4 md:left-20 z-50 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white text-white hover:text-magenta-900 rounded-full flex items-center justify-center border border-white/20 transition-all shadow-xl hover:scale-110 active:scale-95 group"
                >
                    <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
                </button>

                <button
                    onClick={handleNext}
                    className="absolute right-4 md:right-20 z-50 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white text-white hover:text-magenta-900 rounded-full flex items-center justify-center border border-white/20 transition-all shadow-xl hover:scale-110 active:scale-95 group"
                >
                    <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Cards Container */}
                <div className="relative w-full max-w-7xl h-full flex items-center justify-center">
                    <AnimatePresence initial={false}>
                        {validVideos.map((video, idx) => {
                            let position = idx - activeIndex;

                            // Handle large differences due to circularity
                            if (position > 2) position -= validVideos.length;
                            if (position < -2) position += validVideos.length;

                            // Only render the active one and 2 on each side
                            if (position < -2 || position > 2) return null;

                            return (
                                <VideoCard
                                    key={`${video.videoId}-${idx}`}
                                    video={video}
                                    isActive={idx === activeIndex}
                                    position={position}
                                    onClick={() => setActiveIndex(idx)}
                                />
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Indicator / Progress */}
            <div className="mt-12 flex gap-4 items-center">
                <div className="flex gap-2">
                    {validVideos.map((_, idx) => (
                        <div
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`h-1.5 transition-all duration-500 rounded-full cursor-pointer ${activeIndex === idx ? 'w-8 bg-gold-400 shadow-[0_0_10px_rgba(255,215,0,0.5)]' : 'w-2 bg-white/20'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Global CTA */}
            <div className="mt-16">
                <button className="px-10 py-5 bg-gold-400 text-magenta-900 rounded-full font-poppins font-black text-sm uppercase tracking-widest shadow-luxury hover:scale-105 transition-all flex items-center gap-3">
                    <PlayCircle size={24} />
                    Explore Live Sessions
                </button>
            </div>
        </motion.div>
    );
};

export default VideosPage;
