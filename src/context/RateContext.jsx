import React, { createContext, useContext, useState, useEffect } from 'react';

const RateContext = createContext();

// Primary/live API endpoint and template ID you requested
const POTENTIAL_ENDPOINTS = [
    'https://bcast.rbgoldspot.com:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/'
];
const POTENTIAL_IDS = ['rbgold'];

const CORS_PROXIES = [
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    url => `https://thingproxy.freeboard.io/fetch/${url}`,
];

const INITIAL_SPOT_CONFIG = [
    { id: '3101', name: 'GOLD ($)' },
    { id: '3107', name: 'SILVER ($)' },
    { id: '3103', name: 'USD-INR (₹)' }
];

const INITIAL_RTGS_CONFIG = [
    { id: '945', name: 'Gold 999 (10 grams)' },
    { id: '2966', name: 'Silver 999 (30 KGS)' },
    { id: '2987', name: 'Silver 999 (5 KGS)' }
];

const getPlaceholders = () => {
    return {
        spot: INITIAL_SPOT_CONFIG.map(it => ({ ...it, bid: '-', ask: '-', high: '-', low: '-', stock: false })),
        rtgs: INITIAL_RTGS_CONFIG.map(it => ({ ...it, buy: '-', sell: '-', stock: false }))
    };
};

export const RateProvider = ({ children }) => {
    const [rawRates, setRawRates] = useState(getPlaceholders());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isFetching = React.useRef(false);
    const lastNewsFetch = React.useRef(0);
    const lastFetchStartTime = React.useRef(0);
    const failureCount = React.useRef(0);
    const lastSettingsFetch = React.useRef(0);

    // Proxy rotation state
    const currentProxyIndex = React.useRef(0);

    const API_BASE = '/api';

    // Robust initial state for adj
    const getInitialAdj = () => ({
        gold: { mode: 'amount', value: 0 },
        silver: { mode: 'amount', value: 0 },
        baseModifications: {
            gold999: { mode: 'amount', value: 0 },
            silver999: { mode: 'amount', value: 0 }
        },
        stockOverrides: {}, // { itemId: boolean }
        ratesPage: {
            gold: { mode: 'amount', value: 0 },
            silver: { mode: 'amount', value: 0 },
            showModified: false
        }
    });

    const [adj, setAdjState] = useState(getInitialAdj());
    const adjRef = React.useRef(getInitialAdj());
    const setAdj = (newAdj) => {
        adjRef.current = newAdj;
        setAdjState(newAdj);
    };

    const [showModified, setShowModified] = useState(false);
    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const [priceChangeMap, setPriceChangeMap] = useState({});
    const [ticker, setTicker] = useState('Welcome to Abhinav Gold & Silver - Quality Purity Guaranteed');
    const [videos, setVideos] = useState([]);
    const [videosLoaded, setVideosLoaded] = useState(false);
    const [isMusicEnabled, setIsMusicEnabled] = useState(() => {
        const persisted = localStorage.getItem('abhinav_music_enabled');
        return persisted === 'true'; // Defaults to false if never set
    });
    const [homeAudio, setHomeAudio] = useState('');
    const [ratesAudio, setRatesAudio] = useState('');

    const toggleMusic = () => {
        const nextValue = !isMusicEnabled;
        setIsMusicEnabled(nextValue);
        localStorage.setItem('abhinav_music_enabled', nextValue.toString());
        
        // Persist globally to MongoDB
        updateSettings({ isMusicEnabled: nextValue });
    };

    // Use a ref for settings synchronization to avoid infinite loops if needed
    const syncSettingsWithMongoDB = async () => {
        try {
            // Disable browser cache for this request explicitly
            const res = await fetch(`${API_BASE}/rates/settings?_=${Date.now()}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setAdj({
                        gold: data.goldOffset || { mode: 'amount', value: 0 },
                        silver: data.silverOffset || { mode: 'amount', value: 0 },
                        baseModifications: data.baseModifications || {
                            gold999: { mode: 'amount', value: 0 },
                            silver999: { mode: 'amount', value: 0 }
                        },
                        stockOverrides: data.stockOverrides || {},
                        ratesPage: data.ratesPage || {
                            gold: { mode: 'amount', value: 0 },
                            silver: { mode: 'amount', value: 0 },
                            showModified: false
                        }
                    });
                    if (data.showModified !== undefined) setShowModified(data.showModified);
                    if (data.ticker) setTicker(data.ticker);
                    if (data.homeAudio !== undefined) setHomeAudio(data.homeAudio);
                    if (data.ratesAudio !== undefined) setRatesAudio(data.ratesAudio);
                    if (data.isMusicEnabled !== undefined) {
                        setIsMusicEnabled(data.isMusicEnabled);
                        localStorage.setItem('abhinav_music_enabled', data.isMusicEnabled.toString());
                    }
                    setSettingsLoaded(true);
                }
            }
        } catch (error) {
            console.error("Failed to sync settings from MongoDB:", error);
        }
    };

    // Initial fetch on mount
    useEffect(() => {
        syncSettingsWithMongoDB();
        syncVideosWithMongoDB();
    }, []);

    const syncVideosWithMongoDB = async () => {
        try {
            const res = await fetch(`${API_BASE}/videos?_=${Date.now()}`);
            if (res.ok) {
                const list = await res.json();
                if (Array.isArray(list)) {
                    setVideos(list);
                    setVideosLoaded(true);
                }
            }
        } catch (e) {
            console.error("Failed to sync videos:", e);
        }
    };

    const updateVideos = async (newList) => {
        setVideos(newList);
        try {
            const res = await fetch(`${API_BASE}/videos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ list: newList })
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return true;
        } catch (e) {
            console.error("Failed to save videos:", e);
            return false;
        }
    };



    const updateSettings = async (payload) => {
        // Evaluate the new adj correctly against the absolute latest ref state
        // to prevent stale closures and race conditions when typing and clicking fast.
        let newAdj = adjRef.current;
        
        if (payload.adjFn) {
            newAdj = payload.adjFn(adjRef.current);
            setAdj(newAdj);
        } else if (payload.adj !== undefined) {
            newAdj = payload.adj;
            setAdj(newAdj);
        }

        if (payload.showModified !== undefined) {
            setShowModified(payload.showModified);
        }
        if (payload.ticker !== undefined) setTicker(payload.ticker);
        
        // Update local audio state if provided in payload
        if (payload.homeAudio !== undefined) setHomeAudio(payload.homeAudio);
        if (payload.ratesAudio !== undefined) setRatesAudio(payload.ratesAudio);

        // 2. Prepare the full payload for MongoDB sync using the newly evaluated adj
        try {
            const body = {
                gold: newAdj.gold,
                silver: newAdj.silver,
                baseModifications: newAdj.baseModifications,
                stockOverrides: newAdj.stockOverrides,
                ratesPage: newAdj.ratesPage,
                ticker: payload.ticker !== undefined ? payload.ticker : ticker,
                showModified: payload.showModified !== undefined ? payload.showModified : showModified,
                isMusicEnabled: payload.isMusicEnabled !== undefined ? payload.isMusicEnabled : isMusicEnabled
            };
            
            // Only send massive audio fields if they are explicitly being updated
            if (payload.homeAudio !== undefined) body.homeAudio = payload.homeAudio;
            if (payload.ratesAudio !== undefined) body.ratesAudio = payload.ratesAudio;

            const res = await fetch(`${API_BASE}/rates/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return true;
        } catch (e) {
            console.error("Failed to sync modifications to MongoDB:", e);
            return false;
        }
    };

    const fetchWithTimeout = async (url, ms = 4000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), ms);
        try {
            // Force no-store to prevent any layer of browser/CDN caching from serving stale rates
            const res = await fetch(url, {
                signal: controller.signal,
                cache: 'no-store'
            });
            clearTimeout(id);
            return res;
        } catch (e) {
            clearTimeout(id);
            throw e;
        }
    };

    const parseRateText = (text) => {
        if (!text || typeof text !== 'string') return getPlaceholders();

        const cleanText = text.replace(/\r/g, '').trim();
        const rows = cleanText.split('\n');
        const dataMap = {};

        rows.forEach(rawRow => {
            const trimmed = rawRow.trim();
            if (!trimmed) return;

            const parts = trimmed.split(/\s+/);

            if (parts.length >= 4) {
                const id = parts[0];

                let stockStr = '', low = '-', high = '-', ask = '-', bid = '-';
                let nameEndIdx = parts.length;

                const lastPart = parts[parts.length - 1].toLowerCase();
                const hasStock = lastPart.includes('stock');

                if (hasStock) {
                    stockStr = parts[parts.length - 1];
                    low = parts[parts.length - 2];
                    high = parts[parts.length - 3];
                    ask = parts[parts.length - 4];
                    bid = parts[parts.length - 5];
                    nameEndIdx = parts.length - 5;
                } else {
                    low = parts[parts.length - 1];
                    high = parts[parts.length - 2];
                    ask = parts[parts.length - 3];
                    bid = parts[parts.length - 4];
                    nameEndIdx = parts.length - 4;
                }

                const name = parts.slice(1, nameEndIdx).join(' ');

                const parseVal = (v) => {
                    if (!v || v === '-') return '-';
                    const num = parseFloat(v.replace(/,/g, ''));
                    return isNaN(num) ? '-' : num;
                };

                const pBid = parseVal(bid);
                const pAsk = parseVal(ask);

                const data = {
                    id, name,
                    bid: pBid !== '-' ? pBid : pAsk,
                    ask: pAsk,
                    high: parseVal(high),
                    low: parseVal(low),
                    stock: hasStock ? stockStr.toLowerCase().includes('instock') : true,
                };

                dataMap[id] = data;
                if (name) dataMap[name.toLowerCase()] = data;
            }
        });

        const spot = INITIAL_SPOT_CONFIG.map(conf => {
            const it = dataMap[conf.id] || dataMap[conf.name.toLowerCase()];
            return it ? it : { ...conf, bid: '-', ask: '-', high: '-', low: '-', stock: false };
        });

        const rtgs = INITIAL_RTGS_CONFIG.map(conf => {
            const it = dataMap[conf.id] || (conf.name && dataMap[conf.name.toLowerCase()]);
            if (!it) return { ...conf, buy: '-', sell: '-', stock: false };
            return { id: it.id, name: conf.name, buy: it.bid, sell: it.ask, stock: it.stock, low: it.low, high: it.high };
        });

        console.log("[DEBUG] Parsed RTGS (Inventory):", rtgs.filter(r => r.sell !== '-').length, "items found.");
        return { spot, rtgs };
    };

    const [news, setNews] = useState([]);

    const parseNews = (xml) => {
        if (!xml) return [];
        const items = xml.match(/<item>([\s\S]*?)<\/item>/g);
        if (!items) return [];

        return items.map((it, idx) => {
            const titleMatch = it.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || it.match(/<title>(.*?)<\/title>/);
            const title = titleMatch?.[1];
            const pubDate = it.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
            const link = it.match(/<link>(.*?)<\/link>/)?.[1];

            // Format date: "2026-03-02 09:43:12" -> "02 Mar 2026"
            let dateStr = pubDate || '';
            if (dateStr.includes('-')) {
                const [y, m, dayParts] = dateStr.split('-');
                const day = dayParts.split(' ')[0];
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                dateStr = `${day} ${monthNames[parseInt(m) - 1]} ${y}`;
            }

            return {
                id: `news-${idx}`,
                title: title?.replace(/&amp;/g, '&'),
                msg: title?.replace(/&amp;/g, '&'), // Using title as message for standard alerts
                date: dateStr,
                link,
                type: (title?.toLowerCase().includes('surge') || title?.toLowerCase().includes('fall')) ? 'urgent' : 'info'
            };
        }).slice(0, 10);
    };

    const lastProcessedTimestamp = React.useRef(0);
    const activeFetchesCount = React.useRef(0);
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.');

    const fetchAllRates = async () => {
        // Safety: Prevent excessive concurrent requests if network is extremely slow
        if (activeFetchesCount.current >= 10) return;

        activeFetchesCount.current++;
        const currentFetchId = Date.now();

        // 1. Background News Fetch (Throttled)
        if (Date.now() - lastNewsFetch.current > 300000) {
            (async () => {
                const newsUrl = isLocal ? '/api-news/rss/news_11.rss' : 'https://www.investing.com/rss/news_11.rss';
                const proxies = isLocal ? [url => url] : CORS_PROXIES;

                for (const p of proxies.slice(0, 3)) {
                    try {
                        const res = await fetchWithTimeout(p(newsUrl), 4000);
                        if (res.ok) {
                            let text = await res.text();
                            if (text.trim().startsWith('{')) {
                                try { text = JSON.parse(text).contents || text; } catch (e) { }
                            }
                            const parsed = parseNews(text);
                            if (parsed.length) { setNews(parsed); lastNewsFetch.current = Date.now(); break; }
                        }
                    } catch (e) { }
                }
            })();
        }

        try {
            let success = false;
            const iterationTimestamp = Date.now();

            if (isLocal) {
                // Local Development: Use Vite Proxy (/api-rates -> bcast.rbgoldspot.com)
                try {
                    const localUrl = `/api-rates/${POTENTIAL_IDS[0]}?_=${iterationTimestamp}`;
                    const res = await fetchWithTimeout(localUrl, 5000);
                    if (res.ok) {
                        const text = await res.text();
                        if (text && text.length > 20) {
                            const data = parseRateText(text);
                            if (currentFetchId > lastProcessedTimestamp.current) {
                                lastProcessedTimestamp.current = currentFetchId;
                                const nextPriceMap = {};

                                const recordFieldChange = (section, id, key, oldVal, newVal) => {
                                    const toNum = (v) => (typeof v === 'number' ? v : Number.isFinite(parseFloat(v)) ? parseFloat(v) : null);
                                    const o = toNum(oldVal); const n = toNum(newVal);
                                    if (o === null || n === null) { nextPriceMap[`${section}-${id}-${key}`] = 'neutral'; return; }
                                    if (n > o) nextPriceMap[`${section}-${id}-${key}`] = 'up';
                                    else if (n < o) nextPriceMap[`${section}-${id}-${key}`] = 'down';
                                    else nextPriceMap[`${section}-${id}-${key}`] = 'neutral';
                                };

                                const calculateTrend = (section, newList, oldList) => {
                                    const now = Date.now();
                                    return newList.map(newItem => {
                                        const oldItem = oldList.find(o => o.id === newItem.id);
                                        if (!oldItem) return { ...newItem, trend: 'stable', trendExpiry: 0 };
                                        let change = 0;
                                        const keys = newItem.buy !== undefined ? ['buy', 'sell'] : ['bid', 'ask'];
                                        keys.forEach(key => {
                                            recordFieldChange(section, newItem.id || newItem.name, key, oldItem[key], newItem[key]);
                                            const nv = parseFloat(newItem[key]); const ov = parseFloat(oldItem[key]);
                                            if (change === 0 && !isNaN(nv) && !isNaN(ov) && nv !== ov) change = nv > ov ? 1 : -1;
                                        });
                                        let trend = oldItem.trend || 'stable';
                                        let trendExpiry = oldItem.trendExpiry || 0;
                                        if (change !== 0) { trend = change === 1 ? 'up' : 'down'; trendExpiry = now + 5000; }
                                        else if (now > trendExpiry) { trend = 'stable'; trendExpiry = 0; }
                                        return { ...newItem, trend, trendExpiry };
                                    });
                                };

                                setRawRates(prev => {
                                    const newFinal = {
                                        spot: calculateTrend('spot', data.spot, prev.spot),
                                        rtgs: calculateTrend('rtgs', data.rtgs, prev.rtgs)
                                    };
                                    return newFinal;
                                });
                                setPriceChangeMap(nextPriceMap);
                                setError(null); setLoading(false);
                            }
                        }
                        success = true;
                        failureCount.current = 0;
                    }
                } catch (e) {
                    // Fall back to public proxies if local proxy fails for some reason
                }
            }

            if (!success) {
                // PRODUCTION PIPELINE (Phase 1): Attempt direct raw API fetch via proxies first
                // This ensures truly raw data for the "Live" table
                const rawUrl = `${POTENTIAL_ENDPOINTS[0]}${POTENTIAL_IDS[0]}`;
                for (const proxyFn of CORS_PROXIES.slice(0, 3)) {
                    try {
                        const res = await fetchWithTimeout(proxyFn(rawUrl), 4000);
                        if (res.ok) {
                            const text = await res.text();
                            if (text && text.length > 50) {
                                const data = parseRateText(text);
                                if (currentFetchId > lastProcessedTimestamp.current) {
                                    lastProcessedTimestamp.current = currentFetchId;
                                    const nextPriceMap = {};
                                    const recordFieldChange = (section, id, key, oldVal, newVal) => {
                                        const toNum = (v) => (typeof v === 'number' ? v : Number.isFinite(parseFloat(v)) ? parseFloat(v) : null);
                                        const o = toNum(oldVal); const n = toNum(newVal);
                                        if (o === null || n === null) { nextPriceMap[`${section}-${id}-${key}`] = 'neutral'; return; }
                                        if (n > o) nextPriceMap[`${section}-${id}-${key}`] = 'up';
                                        else if (n < o) nextPriceMap[`${section}-${id}-${key}`] = 'down';
                                        else nextPriceMap[`${section}-${id}-${key}`] = 'neutral';
                                    };
                                    const calculateTrend = (section, newList, oldList) => {
                                        const now = Date.now();
                                        return newList.map(newItem => {
                                            const oldItem = oldList.find(o => o.id === newItem.id);
                                            if (!oldItem) return { ...newItem, trend: 'stable', trendExpiry: 0 };
                                            let change = 0;
                                            const keys = newItem.buy !== undefined ? ['buy', 'sell'] : ['bid', 'ask'];
                                            keys.forEach(key => {
                                                recordFieldChange(section, newItem.id || newItem.name, key, oldItem[key], newItem[key]);
                                                const nv = parseFloat(newItem[key]); const ov = parseFloat(oldItem[key]);
                                                if (change === 0 && !isNaN(nv) && !isNaN(ov) && nv !== ov) change = nv > ov ? 1 : -1;
                                            });
                                            let trend = oldItem.trend || 'stable'; let trendExpiry = oldItem.trendExpiry || 0;
                                            if (change !== 0) { trend = change === 1 ? 'up' : 'down'; trendExpiry = now + 5000; }
                                            else if (now > trendExpiry) { trend = 'stable'; trendExpiry = 0; }
                                            return { ...newItem, trend, trendExpiry };
                                        });
                                    };
                                    setRawRates(prev => ({
                                        spot: calculateTrend('spot', data.spot, prev.spot),
                                        rtgs: calculateTrend('rtgs', data.rtgs, prev.rtgs)
                                    }));
                                    setPriceChangeMap(nextPriceMap);
                                    setError(null); setLoading(false);
                                    success = true;
                                    failureCount.current = 0;
                                    break; // Success with proxy
                                }
                            }
                        }
                    } catch (e) { }
                }
            }

            if (!success) {
                // PRODUCTION PIPELINE (Phase 2): Fall back to MongoDB persistence layer
                // This ensures availability even if proxies are blocked
                try {
                    const res = await fetchWithTimeout(`${API_BASE}/rates/live?_=${iterationTimestamp}`, 3000);
                    if (res.ok) {
                        const json = await res.json();
                        const text = json.text;
                        if (text && text.length > 50) {
                            const data = parseRateText(text);
                            if (currentFetchId > lastProcessedTimestamp.current) {
                                lastProcessedTimestamp.current = currentFetchId;
                                const nextPriceMap = {};
                                const recordFieldChange = (section, id, key, oldVal, newVal) => {
                                    const toNum = (v) => (typeof v === 'number' ? v : Number.isFinite(parseFloat(v)) ? parseFloat(v) : null);
                                    const o = toNum(oldVal); const n = toNum(newVal);
                                    if (o === null || n === null) { nextPriceMap[`${section}-${id}-${key}`] = 'neutral'; return; }
                                    if (n > o) nextPriceMap[`${section}-${id}-${key}`] = 'up';
                                    else if (n < o) nextPriceMap[`${section}-${id}-${key}`] = 'down';
                                    else nextPriceMap[`${section}-${id}-${key}`] = 'neutral';
                                };
                                const calculateTrend = (section, newList, oldList) => {
                                    const now = Date.now();
                                    return newList.map(newItem => {
                                        const oldItem = oldList.find(o => o.id === newItem.id);
                                        if (!oldItem) return { ...newItem, trend: 'stable', trendExpiry: 0 };
                                        let change = 0;
                                        const keys = newItem.buy !== undefined ? ['buy', 'sell'] : ['bid', 'ask'];
                                        keys.forEach(key => {
                                            recordFieldChange(section, newItem.id || newItem.name, key, oldItem[key], newItem[key]);
                                            const nv = parseFloat(newItem[key]); const ov = parseFloat(oldItem[key]);
                                            if (change === 0 && !isNaN(nv) && !isNaN(ov) && nv !== ov) change = nv > ov ? 1 : -1;
                                        });
                                        let trend = oldItem.trend || 'stable'; let trendExpiry = oldItem.trendExpiry || 0;
                                        if (change !== 0) { trend = change === 1 ? 'up' : 'down'; trendExpiry = now + 5000; }
                                        else if (now > trendExpiry) { trend = 'stable'; trendExpiry = 0; }
                                        return { ...newItem, trend, trendExpiry };
                                    });
                                };
                                setRawRates(prev => ({
                                    spot: calculateTrend('spot', data.spot, prev.spot),
                                    rtgs: calculateTrend('rtgs', data.rtgs, prev.rtgs)
                                }));
                                setPriceChangeMap(nextPriceMap);
                                setError(null); setLoading(false);
                                success = true;
                                failureCount.current = 0;
                            }
                        }
                    }
                } catch (e) {
                    console.warn("MongoDB rate fetch failed:", e);
                }
            }

            // SYNC SETTINGS FROM MONGODB (User Requirement #1 & #3)
            // This ensures all devices are in sync with admin changes
            // DECOUPLED to avoid blocking the fast rate loop
            const now = Date.now();
            if (now - lastSettingsFetch.current > 3000) {
                lastSettingsFetch.current = now;
                syncSettingsWithMongoDB().catch(e => console.error("Background settings sync failed", e));
            }

            if (!success) throw new Error('Refresh failed');
        } catch (e) {
            failureCount.current++;
            if (failureCount.current >= 10) { // Increased threshold for stability
                setError("Syncing...");
            }
        } finally {
            activeFetchesCount.current--;
        }
    };

    useEffect(() => {
        let active = true;
        let timeoutId = null;

        const runFetch = async () => {
            if (!active) return;
            const startTime = Date.now();

            try {
                await fetchAllRates();
            } finally {
                if (active) {
                    const elapsed = Date.now() - startTime;
                    // Target 800ms pulse for consistent 1s feel
                    const delay = Math.max(50, 800 - elapsed);
                    timeoutId = setTimeout(runFetch, delay);
                }
            }
        };

        runFetch();
        return () => {
            active = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    const getPriceClass = (section, id, field) => {
        const key = `${section}-${id}-${field}`;
        const dir = priceChangeMap[key];
        if (dir === 'up') return 'price-up';
        if (dir === 'down') return 'price-down';

        let name = '';
        if (rawRates[section]) {
            const item = rawRates[section].find(r => r.id === id || r.name === id);
            if (item && item.name) name = item.name.toLowerCase();
        }

        if (name.includes('gold') || id === '3101' || id === '945') return 'gold-default';
        if (name.includes('silver') || id === '3107' || id === '2966' || id === '2987') return 'silver-default';

        return 'price-neutral';
    };

    const rates = React.useMemo(() => {
        const adjust = (val, type, customAdj) => {
            const a = customAdj || (type === 'GOLD' ? adj.gold : adj.silver);
            if (!a || typeof val !== 'number') return val;
            const delta = a.mode === 'amount' ? a.value : (val * a.value) / 100;
            return parseFloat((val + delta).toFixed(2));
        };

        // 1. Spot Rates - ALWAYS LIVE as requested
        const spot = rawRates.spot;


        // 2. RTGS Rates & Base Modifications
        const rtgs = rawRates.rtgs.map(r => {
            const isGold = r.name.toUpperCase().includes('GOLD');
            const isSilver = r.name.toUpperCase().includes('SILVER');

            // benchmark choice for sell modification
            const sellMod = isGold ? adj.baseModifications?.gold999 : (isSilver ? adj.baseModifications?.silver999 : null);
            // benchmark choice for buy modification
            const buyOffset = isGold ? adj.gold : adj.silver;

            const liveSell = parseFloat(r.sell) || 0;
            let sell = r.sell;
            let buy = r.buy;

            if (showModified) {
                // Sell Calculation: Live + SellMod
                if (sellMod && sellMod.value !== 0) {
                    const delta = sellMod.mode === 'amount' ? sellMod.value : (liveSell * sellMod.value) / 100;
                    sell = parseFloat((liveSell + delta).toFixed(2));
                }

                // Buy Calculation: LiveBuy + BuyMod
                const liveBuy = parseFloat(r.buy) || 0;
                if (buyOffset) {
                    const delta = buyOffset.mode === 'amount' ? buyOffset.value : (liveBuy * buyOffset.value) / 100;
                    buy = parseFloat((liveBuy + delta).toFixed(2));
                }

            }

            // Apply Stock Override if exists
            const stock = adj.stockOverrides?.[r.id] !== undefined ? adj.stockOverrides[r.id] : r.stock;

            return { ...r, buy, sell, stock, isModified: showModified && sellMod && sellMod.value !== 0 };
        });

        // 3. Gold Purities (Home Page)
        const goldBaseItem = rtgs.find(r => r.id === '945' || (r.name && r.name.toLowerCase().includes('gold 999')));
        const baseSell999 = (goldBaseItem && typeof goldBaseItem.sell === 'number') ? goldBaseItem.sell : null;
        const baseLow999 = (goldBaseItem && typeof goldBaseItem.low === 'number') ? goldBaseItem.low : baseSell999;
        const baseHigh999 = (goldBaseItem && typeof goldBaseItem.high === 'number') ? goldBaseItem.high : baseSell999;

        const purities = [
            { label: 'Gold 24 KT', key: '24K', factor: 1.0 },
            { label: 'Gold 22 KT', key: '22K', factor: 0.916 },
            { label: 'Gold 18 KT', key: '18K', factor: 0.75 },
            { label: 'Gold 14 KT', key: '14K', factor: 0.583 }
        ].map(p => {
            const rawGold999 = rawRates.rtgs.find(r => r.id === '945' || r.name?.toLowerCase().includes('gold 999'));
            const live999Sell = parseFloat(rawGold999?.sell) || 0;
            const trend = rawGold999?.trend || 'stable';

            // Base Karat price from LIVE 999
            const karatBase = Math.round(live999Sell * p.factor);

            let sell, buy;

            if (showModified) {
                // Sell = KaratBase + GoldSellMod (Flat)
                const sMod = adj.baseModifications.gold999;
                const sDelta = sMod.mode === 'amount' ? sMod.value : (live999Sell * sMod.value) / 100;
                sell = Math.round(karatBase + sDelta);

                // Buy = KaratBase + GoldBuyMod (Flat, ensuring consistent spread)
                const bMod = adj.gold;
                const bDelta = bMod.mode === 'amount' ? bMod.value : (live999Sell * bMod.value) / 100;
                buy = Math.round(karatBase + bDelta);
            } else {
                sell = karatBase;
                buy = karatBase;
            }

            return {
                name: p.label,
                key: p.key,
                sell: live999Sell !== 0 ? sell : '-',
                buy: live999Sell !== 0 ? buy : '-',
                low: baseLow999 !== null ? Math.round(baseLow999 * p.factor) : '-',
                high: baseHigh999 !== null ? Math.round(baseHigh999 * p.factor) : '-',
                trend,
                isModified: showModified && adj.baseModifications.gold999.value !== 0
            };
        });

        // 4. Rates Page Independent Data
        const ratesPagePurities = [
            { label: 'Gold 24 KT', key: '24K', factor: 1.0 },
            { label: 'Gold 22 KT', key: '22K', factor: 0.916 },
            { label: 'Gold 18 KT', key: '18K', factor: 0.75 },
            { label: 'Gold 14 KT', key: '14K', factor: 0.583 }
        ].map(p => {
            const rawGold999 = rawRates.rtgs.find(r => r.id === '945' || r.name?.toLowerCase().includes('gold 999'));
            const live999Sell = parseFloat(rawGold999?.sell) || 0;
            const trend = rawGold999?.trend || 'stable';
            const karatBase = Math.round(live999Sell * p.factor);

            let sell = karatBase;
            if (adj.ratesPage.showModified) {
                const sMod = adj.ratesPage.gold;
                const sDelta = sMod.mode === 'amount' ? sMod.value : (karatBase * sMod.value) / 100;
                sell = Math.round(karatBase + sDelta);
            }

            return {
                name: p.label,
                key: p.key,
                sell: live999Sell !== 0 ? sell : '-',
                trend
            };
        });

        const rawSilver999 = rawRates.rtgs.find(r => r.id === '2987');
        const liveSilverSell = parseFloat(rawSilver999?.sell) || 0;
        let ratesPageSilverSell = liveSilverSell;
        if (adj.ratesPage.showModified) {
            const sMod = adj.ratesPage.silver;
            const sDelta = sMod.mode === 'amount' ? sMod.value : (liveSilverSell * sMod.value) / 100;
            ratesPageSilverSell = Math.round(liveSilverSell + sDelta);
        }

        const ratesPageSilver = {
            sell: liveSilverSell !== 0 ? ratesPageSilverSell : '-'
        };

        return { spot, rtgs, purities, ratesPagePurities, ratesPageSilver };
    }, [rawRates, adj, showModified]);

    return (
        <RateContext.Provider value={{ rates, rawRates, loading, error, news, adj, showModified, settingsLoaded, ticker, videos, videosLoaded, isMusicEnabled, toggleMusic, homeAudio, setHomeAudio, ratesAudio, setRatesAudio, updateSettings, updateVideos, refreshRates: fetchAllRates, getPriceClass }}>

            {children}
        </RateContext.Provider>
    );
};

export const useRates = () => useContext(RateContext);
