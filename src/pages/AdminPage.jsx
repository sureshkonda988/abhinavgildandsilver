import React, { useState, useEffect } from 'react';
import { useRates } from '../context/RateContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogOut, TrendingUp, Settings, Video, MessageSquare, Play, Trash2, Save, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

const AdminPage = () => {
    const { rates, rawRates, adj, showModified, updateSettings, refreshRates, loading, error, ticker: contextTicker, videos: contextVideos } = useRates();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('rates');

    // Local state for editing, initialized from context
    const [ticker, setTicker] = useState('');
    const [videos, setVideos] = useState([]);
    const [isDirty, setIsDirty] = useState({ ticker: false, videos: false });

    useEffect(() => {
        if (contextTicker && !isDirty.ticker) {
            setTicker(contextTicker);
        }
    }, [contextTicker, isDirty.ticker]);

    useEffect(() => {
        if (contextVideos && !isDirty.videos) {
            setVideos(contextVideos);
        }
    }, [contextVideos, isDirty.videos]);

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

    const saveTicker = () => {
        updateSettings({ ticker });
        setIsDirty(prev => ({ ...prev, ticker: false }));
        alert('Ticker updated and saved to database!');
    };

    const addVideo = () => {
        setVideos([...videos, { videoId: '', title: '' }]);
        setIsDirty(prev => ({ ...prev, videos: true }));
    };

    const removeVideo = (idx) => {
        const v = [...videos];
        v.splice(idx, 1);
        setVideos(v);
        setIsDirty(prev => ({ ...prev, videos: true }));
    };

    const getYouTubeId = (url) => {
        if (!url) return '';
        if (url.length === 11 && !url.includes('/') && !url.includes('.')) return url;
        const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[1].length === 11) ? match[1] : '';
    };

    const saveVideos = () => {
        const processed = videos.map(v => ({
            ...v,
            videoId: getYouTubeId(v.videoId)
        })).filter(v => v.videoId);

        updateVideos(processed);
        setVideos(processed);
        setIsDirty(prev => ({ ...prev, videos: false }));
        alert('Videos updated and saved to database!');
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pt-24 md:pt-32">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass max-w-md w-full p-10 rounded-[40px] shadow-luxury">
                    <div className="flex flex-col items-center gap-6 mb-10">
                        <div className="w-20 h-20 gradient-luxury rounded-3xl flex items-center justify-center shadow-gold-glow">
                            <Lock className="text-gold-400" size={40} />
                        </div>
                        <h1 className="text-3xl font-playfair font-black text-magenta-700 uppercase tracking-widest text-center">Login</h1>
                    </div>
                    <div className="flex flex-col gap-4">
                        <input
                            className="w-full bg-white/50 border border-slate-200 px-6 py-4 rounded-2xl font-poppins focus:ring-2 focus:ring-magenta-600 outline-none transition-all"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            type="password"
                            className="w-full bg-white/50 border border-slate-200 px-6 py-4 rounded-2xl font-poppins focus:ring-2 focus:ring-magenta-600 outline-none transition-all"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        />
                        <button
                            onClick={handleLogin}
                            className="w-full gradient-luxury py-4 rounded-2xl text-white font-poppins font-black uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all mt-4"
                        >
                            Log In
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-32 text-slate-800">
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 gradient-luxury rounded flex items-center justify-center shadow-lg">
                        <Settings className="text-white" size={16} />
                    </div>
                    <span className="font-playfair font-black text-magenta-700 uppercase tracking-widest text-sm md:text-lg">Dashboard</span>
                </div>
                <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-poppins font-bold text-sm transition-colors">
                    <LogOut size={18} />
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
                                <section className="glass p-4 md:p-8 rounded-[30px] md:rounded-[40px] shadow-luxury border-white/40 min-h-[400px]">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-10">
                                        <h3 className="text-lg md:text-xl font-playfair font-black text-magenta-700 uppercase tracking-widest border-b border-magenta-100 pb-2">Base Rate Buy Modification</h3>
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button
                                                onClick={() => toggleDisplayMode('live')}
                                                className={`flex-1 md:flex-none px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${!showModified ? 'gradient-luxury text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}
                                            >
                                                Live Mode
                                            </button>
                                            <button
                                                onClick={() => toggleDisplayMode('modified')}
                                                className={`flex-1 md:flex-none px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${showModified ? 'gradient-luxury text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}
                                            >
                                                Modified Mode
                                            </button>
                                        </div>
                                    </div>

                                    {(!rawRates.rtgs?.length && loading) ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                                            <RefreshCw size={40} className="text-magenta-300 animate-spin" />
                                            <p className="font-poppins font-bold text-slate-400 text-xs uppercase tracking-widest">Connecting to rates service...</p>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <AdjustmentCard
                                                label="Gold Buy Modification"
                                                item={adj?.gold || { mode: 'amount', value: 0 }}
                                                liveRates={(rawRates.rtgs || []).filter(r => r.name.toLowerCase().includes('gold'))}
                                                targetField="buy"
                                                onChange={(val) => updateSettings({ adj: { ...adj, gold: val } })}
                                            />
                                            <AdjustmentCard
                                                label="Silver Buy Modification"
                                                item={adj?.silver || { mode: 'amount', value: 0 }}
                                                liveRates={(rawRates.rtgs || []).filter(r => r.name.toLowerCase().includes('5 kgs'))}
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
                                        <h3 className="text-lg md:text-xl font-playfair font-black text-magenta-700 uppercase tracking-widest mb-6 border-b border-magenta-100 pb-2">Base Rate Sell Modification</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-8 max-w-2xl leading-relaxed">
                                            Modify the base price for Gold 999 and Silver 999. Changing Gold 999 will automatically update the calculated sell prices for all Karats (14K, 18K, etc.).
                                        </p>
                                        <div className="grid sm:grid-cols-2 gap-4 mb-10">
                                            <AdjustmentCard
                                                label="Gold Sell Modification"
                                                item={adj.baseModifications.gold999}
                                                liveRates={rates.rtgs.filter(r => r.id === '945' || r.name?.toLowerCase().includes('gold 999'))}
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
                                                liveRates={rates.rtgs.filter(r => r.id === '2987' || r.name?.toLowerCase().includes('silver 999 (5 kgs)'))}
                                                targetField="sell"
                                                onChange={(newItem) => {
                                                    const newBase = { ...adj.baseModifications };
                                                    newBase.silver999 = newItem;
                                                    updateSettings({ adj: { ...adj, baseModifications: newBase } });
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-12">
                                        <h3 className="text-lg md:text-xl font-playfair font-black text-magenta-700 uppercase tracking-widest mb-6 border-b border-magenta-100 pb-2">Stock Control</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-8 max-w-2xl leading-relaxed">
                                            Manually override the stock status for individual items.
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10 text-slate-500">
                                            {rates.rtgs.map((item) => (
                                                <div key={item.id} className="bg-white/60 p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                                    <span className="font-poppins font-black text-slate-700 text-[11px] uppercase tracking-tight">{item.name}</span>
                                                    <button
                                                        onClick={() => {
                                                            const newStock = { ...adj.stockOverrides };
                                                            newStock[item.id] = !item.stock;
                                                            updateSettings({ adj: { ...adj, stockOverrides: newStock } });
                                                        }}
                                                        className={`px-4 py-2 rounded-xl font-poppins font-black text-[10px] uppercase tracking-widest transition-all min-w-[120px] ${item.stock ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-red-500 text-white shadow-lg shadow-red-100'}`}
                                                    >
                                                        {item.stock ? 'In Stock' : 'Out of Stock'}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={refreshRates}
                                        className="mt-12 flex items-center gap-2 mx-auto px-10 py-4 bg-slate-100 text-slate-500 rounded-full font-poppins font-bold text-xs uppercase tracking-widest hover:bg-magenta-100 hover:text-magenta-600 transition-colors"
                                    >
                                        <RefreshCw size={14} />
                                        Force Manual Refresh
                                    </button>
                                </section>
                            </div>
                        </motion.div>
                    )}

                    {
                        activeTab === 'news' && (
                            <motion.div key="news" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="glass p-4 md:p-8 rounded-[30px] md:rounded-[40px] shadow-luxury border-white/40">
                                    <h3 className="text-lg md:text-xl font-playfair font-black text-magenta-700 uppercase tracking-widest mb-4 md:mb-6">Ticker Message</h3>
                                    <textarea
                                        className="w-full h-32 md:h-40 bg-white/50 border border-slate-200 px-4 md:px-6 py-4 md:py-6 rounded-2xl md:rounded-3xl font-poppins text-sm md:text-lg focus:ring-2 focus:ring-magenta-600 outline-none transition-all resize-none"
                                        value={ticker}
                                        onChange={(e) => {
                                            setTicker(e.target.value);
                                            setIsDirty(prev => ({ ...prev, ticker: true }));
                                        }}
                                        placeholder="Enter market news alert..."
                                    />
                                    <button
                                        onClick={saveTicker}
                                        className="mt-4 md:mt-6 w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 gradient-luxury text-white rounded-xl md:rounded-2xl font-poppins font-black uppercase tracking-widest shadow-gold-glow hover:scale-105 transition-all text-xs md:text-sm"
                                    >
                                        <Save size={18} />
                                        Update Ticker
                                    </button>
                                </div>
                            </motion.div>
                        )
                    }

                    {
                        activeTab === 'videos' && (
                            <motion.div key="videos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="glass p-4 md:p-8 rounded-[30px] md:rounded-[40px] shadow-luxury border-white/40">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
                                        <h3 className="text-lg md:text-xl font-playfair font-black text-magenta-700 uppercase tracking-widest">Media Manager</h3>
                                        <button onClick={addVideo} className="w-full md:w-auto px-6 py-2.5 bg-magenta-50 text-magenta-600 rounded-full font-poppins font-black text-[10px] uppercase tracking-widest hover:bg-magenta-600 hover:text-white transition-all text-center">
                                            + Add Video
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-4 md:gap-6">
                                        {videos.map((vid, i) => {
                                            const extractedId = getYouTubeId(vid.videoId);
                                            const isValid = extractedId.length === 11;

                                            return (
                                                <div key={i} className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col gap-4">
                                                    <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
                                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 ${isValid ? 'bg-green-100 text-green-600' : 'bg-magenta-100 text-magenta-600'}`}>
                                                            {isValid ? <CheckCircle2 size={24} /> : <Video size={20} />}
                                                        </div>
                                                        <div className="relative flex-1">
                                                            <input
                                                                className={`w-full bg-white border px-4 py-2.5 rounded-lg md:rounded-xl font-poppins text-xs md:text-sm outline-none transition-all ${vid.videoId && !isValid ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-200'}`}
                                                                placeholder="YouTube Link or ID"
                                                                value={vid.videoId}
                                                                onChange={(e) => {
                                                                    const v = [...videos];
                                                                    v[i].videoId = e.target.value;
                                                                    setVideos(v);
                                                                    setIsDirty(prev => ({ ...prev, videos: true }));
                                                                }}
                                                            />
                                                            {vid.videoId && (
                                                                <div className="absolute right-3 top-2.5">
                                                                    {isValid ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-red-400" />}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <input
                                                            className="flex-[2] w-full bg-white border border-slate-200 px-4 py-2.5 rounded-lg md:rounded-xl font-poppins text-xs md:text-sm"
                                                            placeholder="Video Title"
                                                            value={vid.title}
                                                            onChange={(e) => {
                                                                const v = [...videos];
                                                                v[i].title = e.target.value;
                                                                setVideos(v);
                                                                setIsDirty(prev => ({ ...prev, videos: true }));
                                                            }}
                                                        />
                                                        <button onClick={() => removeVideo(i)} className="p-2.5 md:p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg md:rounded-xl transition-all self-center md:self-auto">
                                                            <Trash2 size={18} md:size={20} />
                                                        </button>
                                                    </div>
                                                    {vid.videoId && !isValid && (
                                                        <p className="text-[9px] md:text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1 md:ml-16">Invalid YouTube Link. Please check the URL.</p>
                                                    )}
                                                    {isValid && extractedId !== vid.videoId && (
                                                        <p className="text-[9px] md:text-[10px] font-bold text-green-600 uppercase tracking-widest ml-1 md:ml-16 flex items-center gap-1">
                                                            <Play size={10} /> ID: {extractedId}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={saveVideos}
                                        className="mt-6 md:mt-10 flex items-center gap-3 px-8 py-4 gradient-luxury text-white rounded-xl md:rounded-2xl font-poppins font-black uppercase tracking-widest shadow-gold-glow hover:scale-105 transition-all w-full justify-center disabled:opacity-50 text-xs md:text-sm"
                                    >
                                        <Save size={18} md:size={20} />
                                        Save Video Library
                                    </button>
                                </div>
                            </motion.div>
                        )
                    }
                </AnimatePresence >
            </div >
        </div >
    );
};

const TabBtn = ({ id, icon, label, active, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-3xl font-poppins font-bold text-xs md:text-sm tracking-tight transition-all shrink-0 ${active ? 'gradient-luxury text-white shadow-lg' : 'text-slate-500 hover:bg-magenta-50 hover:text-magenta-600'}`}
    >
        {icon}
        {label}
    </button>
);

const AdjustmentCard = ({ label, item, liveRates = [], targetField = 'sell', onChange }) => {
    const initialVal = (item?.value !== undefined && item?.value !== null) ? item.value.toString() : '0';
    const [localVal, setLocalVal] = useState(initialVal);

    useEffect(() => {
        // Sync local value with prop only if it's not currently being edited as a minus sign
        if (item?.value !== undefined && localVal !== '-' && parseFloat(localVal) !== item.value) {
            setLocalVal(item.value.toString());
        }
    }, [item?.value]);

    const handleTextChange = (v) => {
        // Allow only numbers and a single leading minus
        if (v !== '' && v !== '-' && isNaN(parseFloat(v))) return;

        setLocalVal(v);
        if (v === '' || v === '-') return;

        const num = parseFloat(v);
        if (!isNaN(num)) {
            onChange({ ...item, value: num });
        }
    };

    return (
        <div className="bg-slate-50/50 p-4 md:p-6 rounded-[24px] md:rounded-[30px] border border-slate-100 h-full">
            <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="flex-1 pr-2">
                    <span className="text-[9px] md:text-[10px] font-bold text-magenta-600 uppercase tracking-[0.2em] mb-1 block font-poppins">{label}</span>
                    <div className="flex flex-col gap-2">
                        {liveRates.map((r, i) => {
                            const original = r[targetField] || 0;
                            const delta = item.mode === 'amount' ? item.value : (original * item.value) / 100;
                            const modified = original + delta;
                            return (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-wider">Live:</span>
                                        <span className="text-[10px] md:text-[11px] font-bold text-slate-600 font-poppins">₹{original.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] md:text-[9px] font-bold text-green-600 uppercase tracking-wider">Alt:</span>
                                        <span className="text-[11px] md:text-[13px] font-black text-green-600 font-poppins">₹{modified.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="h-[1px] bg-slate-100 w-full mt-0.5"></div>
                                    <span className="text-[7px] md:text-[8px] font-medium text-slate-400 font-poppins uppercase tracking-wider truncate max-w-[120px] md:max-w-none">{r.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="flex flex-col gap-1 min-w-[80px] md:min-w-[100px]">
                    <button
                        onClick={() => onChange({ ...item, mode: 'amount' })}
                        className={`px-2 md:px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-bold transition-all text-right ${item.mode === 'amount' ? 'text-magenta-600 bg-white shadow-sm' : 'text-slate-400'}`}
                    >
                        ₹ Fixed
                    </button>
                    <button
                        onClick={() => onChange({ ...item, mode: 'percent' })}
                        className={`px-2 md:px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-bold transition-all text-right ${item.mode === 'percent' ? 'text-magenta-600 bg-white shadow-sm' : 'text-slate-400'}`}
                    >
                        % Percent
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                <button
                    onClick={() => handleTextChange('-')}
                    className="w-8 h-8 md:w-10 md:h-10 bg-white shadow-sm rounded-lg md:rounded-xl text-magenta-600 font-bold hover:scale-110 active:scale-90 transition-all font-poppins text-sm"
                >
                    −
                </button>
                <input
                    type="text"
                    inputMode="numeric"
                    className="flex-1 bg-white border border-slate-200 text-center py-1.5 md:py-2.5 rounded-lg md:rounded-xl font-poppins font-bold text-magenta-700 text-sm md:text-lg min-w-0"
                    value={localVal}
                    onChange={(e) => handleTextChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.currentTarget.blur();
                        }
                    }}
                />
                <button
                    onClick={() => onChange({ ...item, value: item.value + 1 })}
                    className="w-8 h-8 md:w-10 md:h-10 bg-white shadow-sm rounded-lg md:rounded-xl text-magenta-600 font-bold hover:scale-110 active:scale-90 transition-all font-poppins text-sm"
                >
                    +
                </button>
            </div>
        </div>
    );
};


export default AdminPage;
