import React, { useState, useEffect } from 'react';
import { Play, PlayCircle, Clock, ChevronRight, Settings, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const VideosPage = () => {
    // Fetch videos from localStorage or use defaults
    const [videos, setVideos] = useState([]);
    const [activeVideo, setActiveVideo] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('ag_videos');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setVideos(parsed);
                    setActiveVideo(parsed[0]);
                }
            } catch (e) {
                console.error("Failed to load videos:", e);
            }
        }

        // If still empty, use fallback
        if (videos.length === 0 && !stored) {
            const fallback = [
                { videoId: 'dQw4w9WgXcQ', title: 'Welcome to Abhinav Gold & Silver' }
            ];
            setVideos(fallback);
            setActiveVideo(fallback[0]);
        }
    }, []);

    // Filter out any videos that don't have a valid ID
    const validVideos = videos.filter(v => v.videoId && v.videoId.length === 11);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-32 px-6 pt-10 max-w-7xl mx-auto relative"
        >
            <div className="absolute top-4 right-6">
                <Link
                    to="/admin"
                    className="p-3 bg-white/5 hover:bg-gold-400 hover:text-magenta-800 text-white rounded-2xl shadow-luxury border border-white/20 transition-all flex items-center gap-2 font-poppins font-bold text-xs uppercase tracking-widest backdrop-blur-sm"
                >
                    <Settings size={18} />
                    Login
                </Link>
            </div>

            <div className="text-center mb-16 flex flex-col items-center gap-4">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-playfair font-black text-white uppercase tracking-tighter leading-none drop-shadow-luxury px-4">Education Hub</h1>
                <p className="text-white/60 font-poppins max-w-2xl text-base md:text-lg font-medium px-4">Expert insights, market analysis, and educational content to guide your precious metal investments.</p>
            </div>

            <AnimatePresence mode="wait">
                {activeVideo && activeVideo.videoId.length === 11 ? (
                    <motion.div
                        key={activeVideo.videoId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-20 glass rounded-[40px] overflow-hidden shadow-luxury border-white/40"
                    >
                        <div className="relative aspect-video w-full bg-black">
                            <iframe
                                className="absolute inset-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=0&rel=0&modestbranding=1`}
                                title={activeVideo.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="p-8 md:p-12 gradient-luxury flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex-1">
                                <span className="text-gold-400 font-poppins font-black text-xs uppercase tracking-widest mb-2 block">Now Playing</span>
                                <h2 className="text-xl sm:text-3xl md:text-5xl font-playfair font-black text-white leading-tight">{activeVideo.title}</h2>
                            </div>
                            <button className="px-8 py-4 bg-white/5 backdrop-blur-md text-white border border-white/20 rounded-full font-poppins font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                                Video Library
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="mb-20 glass h-[400px] rounded-[40px] flex flex-col items-center justify-center gap-4 text-slate-400">
                        <AlertCircle size={48} />
                        <p className="font-poppins font-bold uppercase tracking-widest">No valid video selected</p>
                    </div>
                )}
            </AnimatePresence>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {validVideos.map((video, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => {
                            setActiveVideo(video);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className={`group relative glass rounded-[35px] overflow-hidden shadow-luxury border-white/40 cursor-pointer transition-all ${activeVideo?.videoId === video.videoId ? 'ring-2 ring-gold-400' : ''}`}
                    >
                        {/* Thumbnail Wrap */}
                        <div className="relative h-48 overflow-hidden bg-slate-900">
                            <img
                                src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                                alt={video.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-magenta-900/40 to-transparent"></div>

                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-gold-400 text-magenta-700 rounded-full flex items-center justify-center opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-gold-glow">
                                    <Play fill="currentColor" size={24} className="ml-0.5" />
                                </div>
                            </div>
                        </div>

                        {/* Title Section */}
                        <div className="p-6 flex justify-between items-center bg-white/5">
                            <h3 className="text-lg font-playfair font-black text-white leading-tight line-clamp-2">{video.title}</h3>
                            <div className="p-2 bg-white/5 text-gold-400 rounded-full group-hover:bg-gold-400 group-hover:text-magenta-800 transition-colors duration-300 shrink-0">
                                <ChevronRight size={18} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {validVideos.length === 0 && (
                <div className="text-center py-20 text-slate-400 font-poppins font-bold uppercase tracking-widest text-sm">
                    The video library is currently being updated. Please check back later.
                </div>
            )}

            <div className="mt-20 flex justify-center">
                <button className="flex items-center gap-4 px-10 py-5 gradient-luxury text-white rounded-full font-poppins font-black text-lg uppercase tracking-widest shadow-luxury hover:scale-105 transition-transform group shadow-gold-glow">
                    <PlayCircle size={28} />
                    View Live Sessions
                    <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
};

export default VideosPage;
