import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRates } from '../context/RateContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogOut, TrendingUp, Settings, Video, MessageSquare, Play, Trash2, Save, RefreshCw, CheckCircle2, AlertCircle, Music, Upload, Youtube, HardDrive } from 'lucide-react';

const AdminPage = () => {
    const { rates, rawRates, adj, showModified, settingsLoaded, videosLoaded, updateSettings, updateVideos, refreshRates, loading, error, ticker: contextTicker, videos: contextVideos } = useRates();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('rates');

    // Local state for editing, initialized from context
    const [ticker, setTicker] = useState('');
    const [videos, setVideos] = useState([]);
    const [isInitialized, setIsInitialized] = useState({ ticker: false, videos: false });

    useEffect(() => {
        if (settingsLoaded && !isInitialized.ticker) {
            setTicker(contextTicker);
            setIsInitialized(prev => ({ ...prev, ticker: true }));
        }
    }, [contextTicker, settingsLoaded, isInitialized.ticker]);

    useEffect(() => {
        if (videosLoaded && !isInitialized.videos) {
            setVideos(contextVideos || []);
            setIsInitialized(prev => ({ ...prev, videos: true }));
        }
    }, [contextVideos, videosLoaded, isInitialized.videos]);



    const handleLogin = () => {
        const storedPw = 'admin123'; // Logic for backend auth can be added later
        if (username === 'admin' && password === storedPw) {
            setIsLoggedIn(true);
        } else {
            alert('Invalid credentials');
        }
    };

    const saveAdj = (newAdj) => {
        updateSettings({ adj: newAdj });
    };

    const toggleDisplayMode = (mode) => {
        updateSettings({ showModified: mode === 'modified' });
    };

    const saveTicker = async () => {
        const success = await updateSettings({ ticker });
        if (success) {
            alert('Ticker updated and saved to database!');
        } else {
            alert('Failed to save ticker to database. Please check your connection.');
        }
    };

    const addVideo = () => {
        setVideos([...videos, { videoId: '', title: '' }]);
    };

    const removeVideo = (idx) => {
        const v = [...videos];
        v.splice(idx, 1);
        setVideos(v);
    };

    const getYouTubeId = (url) => {
        if (!url) return '';
        if (url.length === 11 && !url.includes('/') && !url.includes('.')) return url;
        const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[1].length === 11) ? match[1] : '';
    };

    const saveVideos = async () => {
        const processed = videos.map(v => ({
            ...v,
            videoId: getYouTubeId(v.videoId)
        })).filter(v => v.videoId);

        const success = await updateVideos(processed);
        if (success) {
            setVideos(processed);
            alert('Videos updated and saved to database!');
        } else {
            alert('Failed to save videos. Please check your connection.');
        }
    };



    if (!isLoggedIn) {
        return (
            <div 
                className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-fixed bg-center bg-cover"
                style={{ backgroundImage: "url('/Untitled design (14).webp')" }}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    className="glass max-w-4xl w-full rounded-[40px] shadow-luxury backdrop-blur-xl border-white/20 overflow-hidden flex flex-col md:flex-row"
                >
                    {/* Left Side: Logo & Branding */}
                    <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col items-center justify-center bg-white/5 border-b md:border-b-0 md:border-r border-white/10">
                        <motion.img 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            src="/logofd.webp" 
                            alt="Abhinav Logo" 
                            className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-luxury mb-8" 
                        />
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col items-center text-center"
                        >
                            <h1 className="text-4xl md:text-5xl font-playfair font-black text-[#f4cb4c] uppercase tracking-widest leading-none mb-2">ABHINAV</h1>
                            <span className="text-xs md:text-sm text-[#f4cb4c]/80 font-poppins font-black tracking-[0.4em] uppercase">Gold & Silver</span>
                        </motion.div>
                    </div>

                    {/* Right Side: Login Form */}
                    <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                        <div className="mb-10">
                            <h2 className="text-2xl font-playfair font-black text-[#f4cb4c] uppercase tracking-widest mb-2">Admin Login</h2>
                            <p className="text-[#f4cb4c]/80 font-poppins text-[10px] font-black uppercase tracking-widest">Enter credentials to manage your store</p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Username</label>
                                <input
                                    className="w-full bg-white/50 border border-slate-200 px-6 py-4 rounded-2xl font-poppins focus:ring-2 focus:ring-[#f4cb4c] outline-none transition-all shadow-sm"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
                                <input
                                    type="password"
                                    className="w-full bg-white/50 border border-slate-200 px-6 py-4 rounded-2xl font-poppins focus:ring-2 focus:ring-[#f4cb4c] outline-none transition-all shadow-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                />
                            </div>
                            <button
                                onClick={handleLogin}
                                className="w-full gradient-luxury py-4 rounded-2xl text-white font-poppins font-black uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all mt-6 flex items-center justify-center gap-3"
                            >
                                <Lock size={18} />
                                Access Dashboard
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div 
            className="min-h-screen pb-32 text-slate-800 bg-fixed bg-center bg-cover"
            style={{ backgroundImage: "url('/Untitled design (14).webp')" }}
        >
            <div className="bg-white/90 backdrop-blur-md border-b border-white/20 px-6 py-3 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <img src="/logofd.webp" alt="Abhinav Logo" className="w-10 h-10 object-contain" />
                    <div className="flex flex-col">
                        <span className="font-playfair font-black text-[#f4cb4c] uppercase tracking-widest text-sm md:text-lg leading-none">ABHINAV</span>
                        <span className="text-[8px] text-[#f4cb4c]/80 font-poppins font-bold tracking-[0.2em] uppercase">Admin Dashboard</span>
                    </div>
                </div>
                <button onClick={() => {
                    setIsLoggedIn(false);
                    navigate('/');
                }} className="flex items-center gap-2 text-slate-500 hover:text-red-500 font-poppins font-bold text-sm transition-colors bg-white/50 border border-white/20 px-4 py-2 rounded-full">
                    <LogOut size={16} />
                    Logout
                </button>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-6 lg:mt-8 flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-6 md:gap-10">
                {/* Sidebar / Navigation Row */}
                <div className="flex flex-row overflow-x-auto lg:flex-col gap-2 pb-4 lg:pb-0 scrollbar-hide no-scrollbar">
                    <TabBtn id="rates" icon={<TrendingUp size={18} />} label="Rates" active={activeTab === 'rates'} onClick={setActiveTab} />
                    <TabBtn id="news" icon={<MessageSquare size={18} />} label="News" active={activeTab === 'news'} onClick={setActiveTab} />
                    <TabBtn id="videos" icon={<Video size={18} />} label="Media" active={activeTab === 'videos'} onClick={setActiveTab} />

                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'rates' && (
                        <motion.div key="rates" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="grid gap-6 md:gap-8">
                                <section className="glass p-4 md:p-8 rounded-[30px] md:rounded-[40px] shadow-luxury border-white/20 min-h-[400px]">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-10">
                                        <h3 className="text-lg md:text-xl font-playfair font-black text-[#f4cb4c] uppercase tracking-widest border-b border-[#f4cb4c]/20 pb-2">Base Rate Buy Modification</h3>
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button
                                                onClick={() => toggleDisplayMode('live')}
                                                className={`flex-1 md:flex-none px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${!showModified ? 'bg-[#f4cb4c] text-slate-900 shadow-lg' : 'bg-white/10 text-white/60'}`}
                                            >
                                                Live Mode
                                            </button>
                                            <button
                                                onClick={() => toggleDisplayMode('modified')}
                                                className={`flex-1 md:flex-none px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${showModified ? 'bg-[#f4cb4c] text-slate-900 shadow-lg' : 'bg-white/10 text-white/60'}`}
                                            >
                                                Modified Mode
                                            </button>
                                        </div>
                                    </div>

                                    {(!rawRates.rtgs?.length && loading) ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                                            <RefreshCw size={40} className="text-[#f4cb4c] animate-spin" />
                                            <p className="font-poppins font-bold text-[#f4cb4c]/60 text-xs uppercase tracking-widest">Connecting to rates service...</p>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <AdjustmentCard
                                                label="Gold Buy Modification"
                                                item={adj?.gold || { mode: 'amount', value: 0 }}
                                                liveRates={(rawRates.rtgs || []).filter(r => r.id === '945')}
                                                targetField="buy"
                                                onChange={(val) => updateSettings({ adj: { ...adj, gold: val } })}
                                            />
                                            <AdjustmentCard
                                                label="Silver Buy Modification"
                                                item={adj?.silver || { mode: 'amount', value: 0 }}
                                                liveRates={(rawRates.rtgs || []).filter(r => r.id === '2987')}
                                                targetField="buy"
                                                onChange={(val) => updateSettings({ adj: { ...adj, silver: val } })}
                                            />
                                        </div>
                                    )}

                                    {error && (
                                        <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-poppins text-xs font-bold animate-pulse">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            Service Connectivity Error: {error}
                                        </div>
                                    )}

                                    <div className="mt-12">
                                        <h3 className="text-lg md:text-xl font-playfair font-black text-[#f4cb4c] uppercase tracking-widest mb-6 border-b border-[#f4cb4c]/20 pb-2">Base Rate Sell Modification</h3>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em] mb-8 max-w-2xl leading-relaxed">
                                            Modify the base price for Gold 999 and Silver 999. Changing Gold 999 will automatically update the calculated sell prices for all Karats (14K, 18K, etc.).
                                        </p>
                                        <div className="grid sm:grid-cols-2 gap-4 mb-10">
                                            <AdjustmentCard
                                                label="Gold Sell Modification"
                                                item={adj.baseModifications.gold999}
                                                liveRates={rates.rtgs.filter(r => r.id === '945')}
                                                targetField="sell"
                                                onChange={(newItem) => {
                                                    const newBase = { ...adj.baseModifications };
                                                    newBase.gold999 = newItem;
                                                    updateSettings({ adj: { ...adj, baseModifications: newBase } });
                                                }}
                                            />
                                            <AdjustmentCard
                                                label="Silver Sell Modification"
                                                item={adj.baseModifications.silver999}
                                                liveRates={rates.rtgs.filter(r => r.id === '2987')}
                                                targetField="sell"
                                                onChange={(newItem) => {
                                                    const newBase = { ...adj.baseModifications };
                                                    newBase.silver999 = newItem;
                                                    updateSettings({ adj: { ...adj, baseModifications: newBase } });
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-12 pt-12 border-t border-white/10">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-10">
                                            <div>
                                                <h3 className="text-lg md:text-xl font-playfair font-black text-[#f4cb4c] uppercase tracking-widest border-b border-[#f4cb4c]/20 pb-2">Rates Page Modification</h3>
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em] mt-2 max-w-2xl leading-relaxed">
                                                    Independent modifications specifically for the Rates Page. These do not affect the Home Page.
                                                </p>
                                            </div>
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <button
                                                    onClick={() => updateSettings({ adj: { ...adj, ratesPage: { ...adj.ratesPage, showModified: false } } })}
                                                    className={`flex-1 md:flex-none px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${!adj.ratesPage.showModified ? 'bg-[#f4cb4c] text-slate-900 shadow-lg' : 'bg-white/10 text-white/60'}`}
                                                >
                                                    Live Mode
                                                </button>
                                                <button
                                                    onClick={() => updateSettings({ adj: { ...adj, ratesPage: { ...adj.ratesPage, showModified: true } } })}
                                                    className={`flex-1 md:flex-none px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${adj.ratesPage.showModified ? 'bg-[#f4cb4c] text-slate-900 shadow-lg' : 'bg-white/10 text-white/60'}`}
                                                >
                                                    Modified Mode
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            <AdjustmentCard
                                                label="Rates Gold Modification"
                                                item={adj.ratesPage.gold}
                                                liveRates={(rawRates.rtgs || []).filter(r => r.id === '945')}
                                                targetField="sell"
                                                onChange={(val) => updateSettings({ adj: { ...adj, ratesPage: { ...adj.ratesPage, gold: val } } })}
                                            />
                                            <AdjustmentCard
                                                label="Rates Silver Modification"
                                                item={adj.ratesPage.silver}
                                                liveRates={(rawRates.rtgs || []).filter(r => r.id === '2987')}
                                                targetField="sell"
                                                onChange={(val) => updateSettings({ adj: { ...adj, ratesPage: { ...adj.ratesPage, silver: val } } })}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-12">
                                        <h3 className="text-lg md:text-xl font-playfair font-black text-[#f4cb4c] uppercase tracking-widest mb-6 border-b border-[#f4cb4c]/20 pb-2">Stock Control</h3>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em] mb-8 max-w-2xl leading-relaxed">
                                            Manually override the stock status for individual items.
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10 text-slate-500">
                                            {rates.rtgs.filter(item => !(item.name.toLowerCase().includes('silver') && item.name.toLowerCase().includes('10 kg'))).map((item) => (
                                                <div key={item.id} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center justify-between shadow-sm hover:bg-white/20 transition-all">
                                                    <span className="font-poppins font-black text-white text-[11px] uppercase tracking-tight">{item.name}</span>
                                                    <button
                                                        onClick={() => {
                                                            const newStock = { ...adj.stockOverrides };
                                                            newStock[item.id] = !item.stock;
                                                            updateSettings({ adj: { ...adj, stockOverrides: newStock } });
                                                        }}
                                                        className={`px-4 py-2 rounded-xl font-poppins font-black text-[10px] uppercase tracking-widest transition-all min-w-[120px] ${item.stock ? 'bg-green-500 text-white shadow-lg shadow-green-900/20' : 'bg-red-500 text-white shadow-lg shadow-red-900/20'}`}
                                                    >
                                                        {item.stock ? 'In Stock' : 'Out of Stock'}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={refreshRates}
                                        className="mt-12 flex items-center gap-2 mx-auto px-10 py-4 bg-white/10 text-[#f4cb4c] border border-[#f4cb4c]/20 rounded-full font-poppins font-bold text-xs uppercase tracking-widest hover:bg-[#f4cb4c] hover:text-slate-900 transition-all"
                                    >
                                        <RefreshCw size={14} />
                                        Force Manual Refresh
                                    </button>
                                </section>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'news' && (
                        <motion.div key="news" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="glass p-4 md:p-8 rounded-[30px] md:rounded-[40px] shadow-luxury border-white/20">
                                <h3 className="text-lg md:text-xl font-playfair font-black text-[#f4cb4c] uppercase tracking-widest mb-4 md:mb-6">Ticker Message</h3>
                                <textarea
                                    className="w-full h-32 md:h-40 bg-white/10 border border-white/10 text-white px-4 md:px-6 py-4 md:py-6 rounded-2xl md:rounded-3xl font-poppins text-sm md:text-lg focus:ring-2 focus:ring-[#f4cb4c] outline-none transition-all resize-none"
                                    value={ticker}
                                    onChange={(e) => setTicker(e.target.value)}
                                    placeholder="Enter market news alert..."
                                />
                                <button
                                    onClick={saveTicker}
                                    className="mt-4 md:mt-6 w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#f4cb4c] text-white rounded-xl md:rounded-2xl font-poppins font-black uppercase tracking-widest shadow-gold-glow hover:scale-105 transition-all text-xs md:text-sm"
                                >
                                    <Save size={18} />
                                    Update Ticker
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'videos' && (
                        <motion.div key="videos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="glass p-4 md:p-8 rounded-[30px] md:rounded-[40px] shadow-luxury border-white/20">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
                                    <h3 className="text-lg md:text-xl font-playfair font-black text-[#f4cb4c] uppercase tracking-widest">Media Manager</h3>
                                    <button onClick={addVideo} className="w-full md:w-auto px-6 py-2.5 bg-white/10 text-[#f4cb4c] border border-[#f4cb4c]/20 rounded-full font-poppins font-black text-[10px] uppercase tracking-widest hover:bg-[#f4cb4c] hover:text-slate-900 transition-all text-center">
                                        + Add Video
                                    </button>
                                </div>

                                <div className="flex flex-col gap-4 md:gap-6">
                                    {videos.map((vid, i) => {
                                        const extractedId = getYouTubeId(vid.videoId);
                                        const isValid = extractedId.length === 11;

                                        return (
                                            <div key={i} className="bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col gap-4 border border-white/5">
                                                <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
                                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 ${isValid ? 'bg-green-100/10 text-green-500' : 'bg-[#f4cb4c]/10 text-[#f4cb4c]'}`}>
                                                        {isValid ? <CheckCircle2 size={24} /> : <Video size={20} />}
                                                    </div>
                                                    <div className="relative flex-1">
                                                        <input
                                                            className={`w-full bg-white/10 border px-4 py-2.5 rounded-lg md:rounded-xl font-poppins text-xs md:text-sm text-white outline-none transition-all ${vid.videoId && !isValid ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-white/10'}`}
                                                            placeholder="YouTube Link or ID"
                                                            value={vid.videoId}
                                                            onChange={(e) => {
                                                                const v = [...videos];
                                                                v[i].videoId = e.target.value;
                                                                setVideos(v);
                                                            }}
                                                        />
                                                        {vid.videoId && (
                                                            <div className="absolute right-3 top-2.5">
                                                                {isValid ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-red-400" />}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input
                                                        className="flex-[2] w-full bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-lg md:rounded-xl font-poppins text-xs md:text-sm"
                                                        placeholder="Video Title"
                                                        value={vid.title}
                                                        onChange={(e) => {
                                                            const v = [...videos];
                                                            v[i].title = e.target.value;
                                                            setVideos(v);
                                                        }}
                                                    />
                                                    <button onClick={() => removeVideo(i)} className="p-2.5 md:p-3 text-white/20 hover:text-red-500 transition-all self-center md:self-auto">
                                                        <Trash2 size={18} md:size={20} />
                                                    </button>
                                                </div>
                                                {vid.videoId && !isValid && (
                                                    <p className="text-[9px] md:text-[10px] font-bold text-red-500/80 uppercase tracking-widest ml-1 md:ml-16">Invalid YouTube Link. Please check the URL.</p>
                                                )}
                                                {isValid && extractedId !== vid.videoId && (
                                                    <p className="text-[9px] md:text-[10px] font-bold text-green-500/80 uppercase tracking-widest ml-1 md:ml-16 flex items-center gap-1">
                                                        <Play size={10} /> ID: {extractedId}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={saveVideos}
                                    className="mt-6 md:mt-10 flex items-center gap-3 px-8 py-4 bg-[#f4cb4c] text-white rounded-xl md:rounded-2xl font-poppins font-black uppercase tracking-widest shadow-gold-glow hover:scale-105 transition-all w-full justify-center disabled:opacity-50 text-xs md:text-sm"
                                >
                                    <Save size={18} md:size={20} />
                                    Save Video Library
                                </button>
                            </div>
                        </motion.div>
                    )}



                </AnimatePresence >
            </div >
        </div >
    );
};

const TabBtn = ({ id, icon, label, active, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-3xl font-poppins font-bold text-xs md:text-sm tracking-tight transition-all shrink-0 ${active ? 'bg-[#f4cb4c] text-slate-900 shadow-lg' : 'text-white/60 hover:bg-white/10 hover:text-[#f4cb4c]'}`}
    >
        {icon}
        {label}
    </button>
);

const AdjustmentCard = ({ label, item, liveRates = [], targetField = 'sell', onChange }) => {
    const initialVal = (item?.value !== undefined && item?.value !== null) ? item.value.toString() : '0';
    const [localVal, setLocalVal] = useState(initialVal);
    const [isFocused, setIsFocused] = useState(false);
    const debounceTimer = React.useRef(null);

    useEffect(() => {
        // Sync local value with prop only if it's not currently being edited
        if (!isFocused && item?.value !== undefined && localVal !== '-' && parseFloat(localVal) !== item.value) {
            setLocalVal(item.value.toString());
        }
    }, [item?.value, isFocused]);

    const handleTextChange = (v) => {
        // Allow only numbers and a single leading minus
        if (v !== '' && v !== '-' && isNaN(parseFloat(v))) return;

        setLocalVal(v);
        if (v === '' || v === '-') return;

        const num = parseFloat(v);
        if (!isNaN(num)) {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => {
                onChange({ ...item, value: num });
            }, 500);
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-md p-4 md:p-6 rounded-[24px] md:rounded-[30px] border border-white/10 h-full">
            <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="flex-1 pr-2">
                    <span className="text-[9px] md:text-[10px] font-bold text-[#f4cb4c] uppercase tracking-[0.2em] mb-1 block font-poppins">{label}</span>
                    <div className="flex flex-col gap-2">
                        {liveRates.map((r, i) => {
                            const original = r[targetField] || 0;
                            const delta = item.mode === 'amount' ? item.value : (original * item.value) / 100;
                            const modified = original + delta;
                            return (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] md:text-[9px] font-bold text-white/40 uppercase tracking-wider">Live:</span>
                                        <span className="text-[10px] md:text-[11px] font-bold text-white/80 font-poppins">₹{original.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] md:text-[9px] font-bold text-green-500 uppercase tracking-wider">Alt:</span>
                                        <span className="text-[11px] md:text-[13px] font-black text-green-500 font-poppins">₹{modified.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="h-[1px] bg-white/5 w-full mt-0.5"></div>
                                    <span className="text-[7px] md:text-[8px] font-medium text-white/40 font-poppins uppercase tracking-wider truncate max-w-[120px] md:max-w-none">{r.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="flex flex-col gap-1 min-w-[80px] md:min-w-[100px]">
                    <button
                        onClick={() => onChange({ ...item, mode: 'amount' })}
                        className={`px-2 md:px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-bold transition-all text-right ${item.mode === 'amount' ? 'text-[#f4cb4c] bg-white/10 shadow-sm' : 'text-white/40'}`}
                    >
                        ₹ Fixed
                    </button>
                    <button
                        onClick={() => onChange({ ...item, mode: 'percent' })}
                        className={`px-2 md:px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-bold transition-all text-right ${item.mode === 'percent' ? 'text-[#f4cb4c] bg-white/10 shadow-sm' : 'text-white/40'}`}
                    >
                        % Percent
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                <button
                    onClick={() => handleTextChange('-')}
                    className="w-8 h-8 md:w-10 md:h-10 bg-white/10 shadow-sm rounded-lg md:rounded-xl text-[#f4cb4c] font-bold hover:scale-110 active:scale-90 transition-all font-poppins text-sm border border-white/10"
                >
                    −
                </button>
                <input
                    type="text"
                    inputMode="numeric"
                    className="flex-1 bg-white/10 border border-white/10 text-center py-1.5 md:py-2.5 rounded-lg md:rounded-xl font-poppins font-bold text-[#f4cb4c] text-sm md:text-lg min-w-0 outline-none focus:ring-1 focus:ring-[#f4cb4c]/30"
                    value={localVal}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => handleTextChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.currentTarget.blur();
                        }
                    }}
                />
                <button
                    onClick={() => onChange({ ...item, value: item.value + 1 })}
                    className="w-8 h-8 md:w-10 md:h-10 bg-white/10 shadow-sm rounded-lg md:rounded-xl text-[#f4cb4c] font-bold hover:scale-110 active:scale-90 transition-all font-poppins text-sm border border-white/10"
                >
                    +
                </button>
            </div>
        </div>
    );
};


export default AdminPage;
