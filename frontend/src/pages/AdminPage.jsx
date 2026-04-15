import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRates } from '../context/RateContext';
import { motion, AnimatePresence } from 'framer-motion';
import { computeNavarsu8gBase } from '../utils/ratesPageCalculations';
// ReactPlayer removed as audio preview is gone
import { Lock, LogOut, TrendingUp, Video, MessageSquare, Play, Pause, Trash2, Save, RefreshCw, CheckCircle2, AlertCircle, Upload, Youtube, HardDrive, Clock, Music } from 'lucide-react';

const BACKEND_ORIGIN = 'https://wrinkle-depict-regally.ngrok-free.dev';

const AdminPage = () => {
    const { rates, rawRates, adj, showModified, settingsLoaded, videosLoaded, updateSettings, updateVideos, refreshRates, loading, error, ticker: contextTicker, videos: contextVideos, musicSettings, syncMusicWithMongoDB } = useRates();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('rates');
    const [musicLibrary, setMusicLibrary] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadTarget, setUploadTarget] = useState('library'); // 'library', 'homeMusic', or 'ratesMusic'
    const API_BASE = `${BACKEND_ORIGIN}/api`;

    // Local state for editing, initialized from context
    const [ticker, setTicker] = useState('');
    const [videos, setVideos] = useState([]);
    const [isInitialized, setIsInitialized] = useState({ ticker: false, videos: false });

    // (Audio preview logic removed)

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

    useEffect(() => {
        if (isLoggedIn) {
            fetchMusicLibrary();
        }
    }, [isLoggedIn]);

    const fetchMusicLibrary = async () => {
        try {
            const res = await fetch(`${API_BASE}/music/library`);
            if (res.ok) {
                const data = await res.json();
                setMusicLibrary(data);
            }
        } catch (error) {
            console.error("Fetch Music Error:", error);
        }
    };

    const handleMusicUpload = async (e, directTarget = null) => {
        const file = e.target.files[0];
        if (!file) return;

        const target = directTarget || uploadTarget;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', uploadTitle || file.name);

        try {
            const res = await fetch(`${API_BASE}/music/library/upload`, {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            if (result.success) {
                if (target !== 'library') {
                    await setAsBackgroundMusic(result.data, target, true);
                } else {
                    alert('Music uploaded successfully!');
                }
                setUploadTitle('');
                fetchMusicLibrary();
            } else {
                alert('Upload failed: ' + result.message);
            }
        } catch (error) {
            alert('Upload error: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const setAsBackgroundMusic = async (track, type, silent = false) => {
        try {
            const res = await fetch(`${API_BASE}/music`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    [type]: {
                        sourceType: 'local',
                        fileUrl: track.url,
                        title: track.title
                    }
                })
            });
            if (res.ok) {
                if (syncMusicWithMongoDB) await syncMusicWithMongoDB();
                if (!silent) alert(`Set as ${type === 'homeMusic' ? 'Home' : 'Rates'} music successfully!`);
            }
        } catch (error) {
            if (!silent) alert('Error setting background music: ' + error.message);
        }
    };

    const deleteMusic = async (id) => {
        if (!confirm('Are you sure you want to delete this music?')) return;
        try {
            const res = await fetch(`${API_BASE}/music/library/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMusicLibrary(prev => prev.filter(m => m._id !== id));
            }
        } catch (error) {
            console.error("Delete Music Error:", error);
        }
    };

    const clearBackgroundMusic = async (type) => {
        try {
            const res = await fetch(`${API_BASE}/music`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    [type]: {
                        sourceType: 'local',
                        fileUrl: '',
                        title: ''
                    }
                })
            });
            if (res.ok) {
                alert(`Cleared ${type === 'homeMusic' ? 'Home' : 'Rates'} music.`);
                if (window.location.reload) window.location.reload();
            }
        } catch (error) {
            alert('Error clearing music: ' + error.message);
        }
    };

    // Removed database-based audio state syncing from context
    useEffect(() => {
        // Just initialize local inputs if needed, though they are mostly for display now
    }, [settingsLoaded]);



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

    // Keep 8g admin card aligned with Rates page calculation.
    const gold999LiveSell = Number((rawRates.rtgs || []).find(r => r.id === '945')?.sell) || 0;
    const navarsu8gLiveBase = computeNavarsu8gBase(gold999LiveSell);

    // (Audio upload logic removed)

    if (!isLoggedIn) {
        return (
            <div 
                className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-fixed bg-center bg-cover"
                style={{ backgroundImage: "url('/bg-internal.webp')" }}
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
                            src="/logo.webp" 
                            alt="Abhinav Logo" 
                            className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-luxury" 
                        />
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
            style={{ backgroundImage: "url('/bg-internal.webp')" }}
        >
            {/* Preview logic removed */}
            <div className="bg-black/90 backdrop-blur-md border-b border-white/20 px-6 py-3 flex justify-between items-center sticky top-0 z-30 shadow-md">
                <div className="flex items-center gap-3">
                    <img src="/logo.webp" alt="Abhinav Logo" className="w-10 h-10 object-contain" />
                    <div className="flex flex-col">
                        <span className="font-playfair font-black text-[#f4cb4c] uppercase tracking-widest text-sm md:text-lg leading-none">ABHINAV</span>
                        <span className="text-[8px] text-[#f4cb4c]/80 font-poppins font-bold tracking-[0.2em] uppercase">Admin Dashboard</span>
                    </div>
                </div>
                <button onClick={() => {
                    setIsLoggedIn(false);
                    navigate('/');
                }} className="flex items-center gap-2 text-[#f4cb4c] hover:text-white font-poppins font-bold text-sm transition-colors bg-white/5 hover:bg-white/10 border border-[#f4cb4c]/30 hover:border-[#f4cb4c]/60 px-4 py-2 rounded-full shadow-sm">
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
                    <TabBtn id="music" icon={<Music size={18} />} label="Music" active={activeTab === 'music'} onClick={setActiveTab} />
                    <TabBtn id="market" icon={<Clock size={18} />} label="Market" active={activeTab === 'market'} onClick={setActiveTab} />
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
                                        <div className="grid sm:grid-cols-2 gap-4 mb-10">
                                            <AdjustmentCard
                                                label="Gold Sell Modification"
                                                item={adj.baseModifications.gold999}
                                                liveRates={(rawRates.rtgs || []).filter(r => r.id === '945')}
                                                targetField="sell"
                                                onChange={(newItem) => {
                                                    updateSettings({ adjFn: (prev) => ({ ...prev, baseModifications: { ...prev.baseModifications, gold999: newItem } }) });
                                                }}
                                            />
                                            <AdjustmentCard
                                                label="Silver Sell Modification"
                                                item={adj.baseModifications.silver999}
                                                liveRates={(rawRates.rtgs || []).filter(r => r.id === '2987')}
                                                targetField="sell"
                                                onChange={(newItem) => {
                                                    updateSettings({ adjFn: (prev) => ({ ...prev, baseModifications: { ...prev.baseModifications, silver999: newItem } }) });
                                                }}
                                            />

                                        </div>
                                    </div>

                                    <div className="mt-12 pt-12 border-t border-white/10">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-10">
                                            <div>
                                                <h3 className="text-lg md:text-xl font-playfair font-black text-[#f4cb4c] uppercase tracking-widest border-b border-[#f4cb4c]/20 pb-2">Rates Page Modification</h3>
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em] mt-2 max-w-2xl leading-relaxed">
                                                    Independent modifications specifically for the Rates Page. These do not affect the Home Page.<br/><br/>
                                                    Configure separate values for each table: Gold 10g table, 8g Navarsu table, and Silver 10g table.
                                                </p>
                                            </div>
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <button
                                                    onClick={() => updateSettings({ adjFn: (prev) => ({ ...prev, ratesPage: { ...prev.ratesPage, showModified: false } }) })}
                                                    className={`flex-1 md:flex-none px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${!adj.ratesPage.showModified ? 'bg-[#f4cb4c] text-slate-900 shadow-lg' : 'bg-white/10 text-white/60'}`}
                                                >
                                                    Live Mode
                                                </button>
                                                <button
                                                    onClick={() => updateSettings({ adjFn: (prev) => ({ ...prev, ratesPage: { ...prev.ratesPage, showModified: true } }) })}
                                                    className={`flex-1 md:flex-none px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${adj.ratesPage.showModified ? 'bg-[#f4cb4c] text-slate-900 shadow-lg' : 'bg-white/10 text-white/60'}`}
                                                >
                                                    Modified Mode
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-8">
                                            <AdjustmentCard
                                                label="Rates Gold Table Modification"
                                                item={adj.ratesPage.goldTable}
                                                liveRates={(rawRates.rtgs || []).filter(r => r.id === '945')}
                                                targetField="sell"
                                                onChange={(val) => updateSettings({ adjFn: (prev) => ({ ...prev, ratesPage: { ...prev.ratesPage, goldTable: val } }) })}
                                            />
                                            <AdjustmentCard
                                                label="Rates Navarsu 8g Modification"
                                                item={adj.ratesPage.navarsuTable}
                                                liveRates={[{
                                                    id: 'navarsu-8g',
                                                    name: '8g Gold 22 KT',
                                                    sell: navarsu8gLiveBase
                                                }]}
                                                targetField="sell"
                                                onChange={(val) => updateSettings({ adjFn: (prev) => ({ ...prev, ratesPage: { ...prev.ratesPage, navarsuTable: val } }) })}
                                            />
                                            <AdjustmentCard
                                                label="Rates Silver 10g Modification"
                                                item={adj.ratesPage.silverTable}
                                                liveRates={(rawRates.rtgs || []).filter(r => r.id === '2987')}
                                                targetField="sell"
                                                onChange={(val) => updateSettings({ adjFn: (prev) => ({ ...prev, ratesPage: { ...prev.ratesPage, silverTable: val } }) })}
                                            />
                                        </div>

                                    </div>

                                    <div className="mt-12">
                                        <h3 className="text-lg md:text-xl font-playfair font-black text-[#f4cb4c] uppercase tracking-widest mb-6 border-b border-[#f4cb4c]/20 pb-2">Stock Control</h3>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em] mb-8 max-w-2xl leading-relaxed">
                                            Manually override the stock status for individual items.
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10 text-slate-500">
                                            {rates.rtgs.filter(item => !(item.name.toLowerCase().includes('silver') && (item.name.toLowerCase().includes('10 kg') || item.name.toLowerCase().includes('5 kg')))).map((item) => (
                                                <div key={item.id} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center justify-between shadow-sm hover:bg-white/20 transition-all">
                                                    <span className="font-poppins font-black text-white text-[11px] uppercase tracking-tight">{item.name}</span>
                                                    <button
                                                        onClick={() => {
                                                            updateSettings({ adjFn: (prev) => ({ ...prev, stockOverrides: { ...prev.stockOverrides, [item.id]: !item.stock } }) });
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

                    {activeTab === 'music' && (
                        <motion.div key="music" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="glass p-4 md:p-8 rounded-[30px] md:rounded-[40px] shadow-luxury border-white/20">
                                <h3 className="text-lg md:text-xl font-playfair font-black text-[#f4cb4c] uppercase tracking-widest mb-8 border-b border-[#f4cb4c]/20 pb-2">Music Library</h3>
                                
                                <div className="grid md:grid-cols-2 gap-6 mb-10">
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-3 opacity-10">
                                            <Music size={40} className="text-[#f4cb4c]" />
                                        </div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-black text-[#f4cb4c] uppercase tracking-widest block">Active Home Music</span>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="file" 
                                                    accept="audio/*" 
                                                    onChange={(e) => handleMusicUpload(e, 'homeMusic')}
                                                    className="hidden" 
                                                    id="home-direct-upload"
                                                />
                                                <label 
                                                    htmlFor="home-direct-upload" 
                                                    className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-poppins font-black text-[9px] uppercase tracking-widest shadow-lg ${isUploading ? 'bg-white/5 text-white/40 pointer-events-none' : 'bg-[#f4cb4c] text-slate-900 hover:scale-105'}`}
                                                >
                                                    {isUploading ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}
                                                    {isUploading ? '...' : 'Upload'}
                                                </label>
                                                {musicSettings?.homeMusic?.title && (
                                                    <button onClick={() => clearBackgroundMusic('homeMusic')} className="p-1.5 bg-white/10 hover:bg-red-500 hover:text-white rounded-lg transition-all text-[#f4cb4c]" title="Clear Music">
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-poppins font-bold text-white truncate">
                                                {musicSettings?.homeMusic?.title || 'No audio selected'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-3 opacity-10">
                                            <Music size={40} className="text-[#f4cb4c]" />
                                        </div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-black text-[#f4cb4c] uppercase tracking-widest block">Active Rates Music</span>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="file" 
                                                    accept="audio/*" 
                                                    onChange={(e) => handleMusicUpload(e, 'ratesMusic')}
                                                    className="hidden" 
                                                    id="rates-direct-upload"
                                                />
                                                <label 
                                                    htmlFor="rates-direct-upload" 
                                                    className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-poppins font-black text-[9px] uppercase tracking-widest shadow-lg ${isUploading ? 'bg-white/5 text-white/40 pointer-events-none' : 'bg-[#f4cb4c] text-slate-900 hover:scale-105'}`}
                                                >
                                                    {isUploading ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}
                                                    {isUploading ? '...' : 'Upload'}
                                                </label>
                                                {musicSettings?.ratesMusic?.title && (
                                                    <button onClick={() => clearBackgroundMusic('ratesMusic')} className="p-1.5 bg-white/10 hover:bg-red-500 hover:text-white rounded-lg transition-all text-[#f4cb4c]" title="Clear Music">
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-poppins font-bold text-white truncate">
                                                {musicSettings?.ratesMusic?.title || 'No audio selected'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mb-10">
                                    <h4 className="text-[10px] font-black text-[#f4cb4c] uppercase tracking-widest mb-4">Upload New Audio</h4>
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <input 
                                            type="text"
                                            placeholder="Song Title (Optional)"
                                            className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white font-poppins text-sm outline-none focus:ring-1 focus:ring-[#f4cb4c]"
                                            value={uploadTitle}
                                            onChange={(e) => setUploadTitle(e.target.value)}
                                        />
                                        <div className="relative flex-1">
                                            <input 
                                                type="file" 
                                                accept="audio/*" 
                                                onChange={handleMusicUpload}
                                                className="hidden" 
                                                id="music-upload"
                                                disabled={isUploading}
                                            />
                                            <label 
                                                htmlFor="music-upload"
                                                className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-poppins font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer ${isUploading ? 'bg-white/5 text-white/40 cursor-not-allowed' : 'bg-[#f4cb4c] text-slate-900 shadow-lg'}`}
                                            >
                                                {isUploading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                                                {isUploading ? 'Uploading...' : 'Choose & Upload File'}
                                            </label>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-white/40 font-bold uppercase mt-3 ml-2">Supports .mp3 and .wav files</p>
                                </div>

                                <div className="grid gap-4">
                                    {musicLibrary.length === 0 ? (
                                        <div className="text-center py-10 text-white/40 font-poppins text-xs uppercase tracking-widest">
                                            No music files uploaded yet
                                        </div>
                                    ) : (
                                        musicLibrary.map((track) => (
                                            <div key={track._id} className="bg-white/5 p-4 md:p-6 rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-[#f4cb4c]/10 flex items-center justify-center text-[#f4cb4c]">
                                                        <Music size={20} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-poppins font-bold text-white tracking-tight">{track.title}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] text-white/40 font-black uppercase">{track.filename}</span>
                                                            <span className="text-[9px] text-white/20">•</span>
                                                            <span className="text-[9px] text-white/40 font-black uppercase">
                                                                {new Date(track.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col md:flex-row gap-2">
                                                        <button 
                                                            onClick={() => setAsBackgroundMusic(track, 'homeMusic')}
                                                            className="px-3 py-1 bg-white/10 hover:bg-[#f4cb4c] hover:text-slate-900 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                                        >
                                                            Set Home
                                                        </button>
                                                        <button 
                                                            onClick={() => setAsBackgroundMusic(track, 'ratesMusic')}
                                                            className="px-3 py-1 bg-white/10 hover:bg-[#f4cb4c] hover:text-slate-900 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                                        >
                                                            Set Rates
                                                        </button>
                                                    </div>
                                                    <audio src={track.url} controls className="h-8 max-w-[120px] opacity-40 hover:opacity-100 transition-opacity hidden lg:block" />
                                                    <button 
                                                        onClick={() => deleteMusic(track._id)}
                                                        className="p-2 text-white/20 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'market' && (
                        <motion.div key="market" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="glass p-4 md:p-8 rounded-[30px] md:rounded-[40px] shadow-luxury border-white/20">
                                <h3 className="text-lg md:text-xl font-playfair font-black text-[#f4cb4c] uppercase tracking-widest mb-6 border-b border-[#f4cb4c]/20 pb-2">Market Status Settings</h3>
                                
                                <div className="grid gap-8">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1 bg-white/5 p-6 rounded-3xl border border-white/10">
                                            <span className="text-[10px] font-black text-[#f4cb4c] uppercase tracking-widest mb-4 block">Operation Mode</span>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => updateSettings({ adjFn: (prev) => ({ ...prev, marketStatus: { ...prev.marketStatus, mode: 'regular' } }) })}
                                                    className={`flex-1 py-3 rounded-xl font-poppins font-black text-[10px] uppercase tracking-widest transition-all ${adj.marketStatus.mode === 'regular' ? 'bg-[#f4cb4c] text-slate-900' : 'bg-white/10 text-white/60'}`}
                                                >
                                                    Regular (10am-8pm)
                                                </button>
                                                <button
                                                    onClick={() => updateSettings({ adjFn: (prev) => ({ ...prev, marketStatus: { ...prev.marketStatus, mode: 'modified' } }) })}
                                                    className={`flex-1 py-3 rounded-xl font-poppins font-black text-[10px] uppercase tracking-widest transition-all ${adj.marketStatus.mode === 'modified' ? 'bg-[#f4cb4c] text-slate-900' : 'bg-white/10 text-white/60'}`}
                                                >
                                                    Modified
                                                </button>
                                            </div>
                                        </div>

                                        <div className={`flex-1 bg-white/5 p-6 rounded-3xl border border-white/10 transition-opacity ${adj.marketStatus.mode === 'modified' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                            <span className="text-[10px] font-black text-[#f4cb4c] uppercase tracking-widest mb-4 block">Manual Override</span>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => updateSettings({ adjFn: (prev) => ({ ...prev, marketStatus: { ...prev.marketStatus, modifiedStatus: 'open' } }) })}
                                                    className={`flex-1 py-3 rounded-xl font-poppins font-black text-[10px] uppercase tracking-widest transition-all ${adj.marketStatus.modifiedStatus === 'open' ? 'bg-green-500 text-white' : 'bg-white/10 text-white/60'}`}
                                                >
                                                    Force Open
                                                </button>
                                                <button
                                                    onClick={() => updateSettings({ adjFn: (prev) => ({ ...prev, marketStatus: { ...prev.marketStatus, modifiedStatus: 'closed' } }) })}
                                                    className={`flex-1 py-3 rounded-xl font-poppins font-black text-[10px] uppercase tracking-widest transition-all ${adj.marketStatus.modifiedStatus === 'closed' ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60'}`}
                                                >
                                                    Force Closed
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`bg-white/5 p-6 rounded-3xl border border-white/10 transition-opacity ${adj.marketStatus.mode === 'modified' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                        <span className="text-[10px] font-black text-[#f4cb4c] uppercase tracking-widest mb-6 block">Custom Timings (24-Hour Format)</span>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Opening Time</label>
                                                <input
                                                    type="time"
                                                    value={adj.marketStatus.openTime}
                                                    onChange={(e) => updateSettings({ adjFn: (prev) => ({ ...prev, marketStatus: { ...prev.marketStatus, openTime: e.target.value } }) })}
                                                    className="bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-poppins text-lg focus:ring-2 focus:ring-[#f4cb4c] outline-none transition-all"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Closing Time</label>
                                                <input
                                                    type="time"
                                                    value={adj.marketStatus.closeTime}
                                                    onChange={(e) => updateSettings({ adjFn: (prev) => ({ ...prev, marketStatus: { ...prev.marketStatus, closeTime: e.target.value } }) })}
                                                    className="bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-poppins text-lg focus:ring-2 focus:ring-[#f4cb4c] outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-[#f4cb4c]/10 border border-[#f4cb4c]/20 p-6 rounded-3xl flex items-start gap-4">
                                        <AlertCircle className="text-[#f4cb4c] shrink-0 mt-1" size={20} />
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[11px] font-black text-[#f4cb4c] uppercase tracking-widest">Timing Note</span>
                                            <p className="text-[10px] text-white/60 font-bold uppercase leading-relaxed tracking-wider">
                                                All timings follow India Standard Time (IST). Custom timings in "Modified" mode will only apply if "Manual Override" is set to "Force Open". "Regular" mode consistently follows 10:00 AM to 08:00 PM IST.<br/><br/>
                                                NOTE: The market is automatically forced closed every Sunday in IST, regardless of the settings above.
                                            </p>
                                        </div>
                                    </div>
                                </div>
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
                console.log(`[DEBUG] AdjustmentCard ${label} triggered onChange with:`, num);
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
                            const delta = item.value || 0;
                            const modified = original + delta;
                            return (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] md:text-[9px] font-bold text-white/40 uppercase tracking-wider">Live:</span>
                                        <span className="text-[10px] md:text-[11px] font-bold text-white/80 font-poppins"><span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span>{original.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] md:text-[9px] font-bold text-green-500 uppercase tracking-wider">Alt:</span>
                                        <span className="text-[11px] md:text-[13px] font-black text-green-500 font-poppins"><span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span>{modified.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="h-[1px] bg-white/5 w-full mt-0.5"></div>
                                    <span className="text-[7px] md:text-[8px] font-medium text-white/40 font-poppins uppercase tracking-wider truncate max-w-[120px] md:max-w-none">{r.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="flex flex-col gap-1 min-w-[80px] md:min-w-[100px]">
                    <div className="px-2 md:px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-bold text-[#f4cb4c] bg-white/10 shadow-sm text-right">
                        <span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>₹</span> Fixed Amount
                    </div>
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
