import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    computeGoldTableSell,
    computeNavarsu8gSell,
    computeSilver10gSell,
    normalizeRatesPageSettings
} from '../utils/ratesPageCalculations';

const RateContext = createContext();
const BACKEND_ORIGIN = 'https://wrinkle-depict-regally.ngrok-free.dev';
const MUSIC_API_URL = `${BACKEND_ORIGIN}/api/music`;
const SETTINGS_API_URL = `${BACKEND_ORIGIN}/api/rates/settings`;
const LIVE_RATES_API_URL = `${BACKEND_ORIGIN}/api/rates/live`;

// Primary/live API endpoint and template ID you requested
const POTENTIAL_ENDPOINTS = [
    'https://bcast.rbgoldspot.com:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/'
];
const POTENTIAL_IDS = ['rbgold'];

const CORS_PROXIES = [
    // Intentionally disabled: use only the configured backend endpoint.
];


const INITIAL_SPOT_CONFIG = [
    { id: '3101', name: 'GOLD ($)' },
    { id: '3107', name: 'SILVER ($)' },
    { id: '3103', name: 'USD-INR (₹)' }
];

const INITIAL_RTGS_CONFIG = [
    { id: '945', name: 'Gold 999 (100 grams)', factor: 10 },
    { id: '2966', name: 'Silver 999 (30 KGS)', factor: 1 },
    { id: '2987', name: 'Silver 999 (5 KGS)', factor: 1 }
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
    const sessionHighLow = React.useRef({}); // { id: { high: N, low: N } }

    // Proxy rotation state
    const currentProxyIndex = React.useRef(0);

    const API_BASE = `${BACKEND_ORIGIN}/api`;

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
            goldTable: { mode: 'amount', value: 0 },
            navarsuTable: { mode: 'amount', value: 0 },
            silverTable: { mode: 'amount', value: 0 },
            showModified: false
        },
        marketStatus: {
            mode: 'regular',
            modifiedStatus: 'open',
            openTime: '10:00',
            closeTime: '20:00'
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
        try {
            return localStorage.getItem('abhinav_music_enabled') === 'true';
        } catch {
            return false;
        }
    });
    const [musicSettings, setMusicSettings] = useState(null);

    // (homeAudio and ratesAudio removed as they are now static in MusicPlayer)

    const setMusicEnabled = (val) => {
        setIsMusicEnabled(val);
        localStorage.setItem('abhinav_music_enabled', val.toString());
    };

    const toggleMusic = () => {
        setMusicEnabled(!isMusicEnabled);
    };

    // Use a ref for settings synchronization to avoid infinite loops if needed
    const syncSettingsWithMongoDB = async () => {
        try {
            // Disable browser cache for this request explicitly
            const res = await fetch(`${SETTINGS_API_URL}?_=${Date.now()}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (res.ok) {
                const data = await res.json();
                console.log("[DEBUG] Received settings from backend:", data);
                if (data) {
                    const ratesPageSettings = normalizeRatesPageSettings(data.ratesPage || {});
                    setAdj({
                        gold: data.gold || { mode: 'amount', value: 0 },
                        silver: data.silver || { mode: 'amount', value: 0 },
                        baseModifications: data.baseModifications || {
                            gold999: { mode: 'amount', value: 0 },
                            silver999: { mode: 'amount', value: 0 }
                        },
                        stockOverrides: data.stockOverrides || {},
                        ratesPage: ratesPageSettings,
                        marketStatus: data.marketStatus || {
                            mode: 'regular',
                            modifiedStatus: 'open',
                            openTime: '10:00',
                            closeTime: '20:00'
                        }
                    });
                    if (data.showModified !== undefined) setShowModified(data.showModified);
                    if (data.ticker) setTicker(data.ticker);
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
        syncMusicWithMongoDB();
    }, []);

    const syncMusicWithMongoDB = async () => {
        try {
            const res = await fetch(`${MUSIC_API_URL}?_=${Date.now()}`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            if (res.ok) {
                const data = await res.json();
                setMusicSettings(data);
            }
        } catch (e) {
            console.error("Failed to sync music:", e);
        }
    };

    const syncVideosWithMongoDB = async () => {
        try {
            const res = await fetch(`${API_BASE}/videos?_=${Date.now()}`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
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
                headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
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
        console.log("[DEBUG] updateSettings called with payload:", payload);
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

        // 2. Prepare the full payload for MongoDB sync using the newly evaluated adj
        try {
            const body = {
                gold: newAdj.gold,
                silver: newAdj.silver,
                baseModifications: newAdj.baseModifications,
                stockOverrides: newAdj.stockOverrides,
                ratesPage: newAdj.ratesPage,
                marketStatus: newAdj.marketStatus,
                ticker: payload.ticker !== undefined ? payload.ticker : ticker,
                showModified: payload.showModified !== undefined ? payload.showModified : showModified
            };

            const res = await fetch(`${API_BASE}/rates/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            
            // Prevent background sync from overwriting our new state immediately
            lastSettingsFetch.current = Date.now();
            
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
                cache: 'no-store',
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            clearTimeout(id);
            return res;
        } catch (e) {
            clearTimeout(id);
            throw e;
        }
    };

    const parseRateText = (text, backendRates = null) => {
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

            // Session-based High/Low tracking for Sell (ask) rates
            const sellPrice = it.ask;
            const bRate = backendRates ? backendRates[conf.id] : null;

            if (typeof sellPrice === 'number' && !bRate) {
                const current = sessionHighLow.current[conf.id] || { high: -Infinity, low: Infinity };
                if (sellPrice > current.high) current.high = sellPrice;
                if (sellPrice < current.low) current.low = sellPrice;
                sessionHighLow.current[conf.id] = current;
            }

            const sh = sessionHighLow.current[conf.id];

            return {
                id: it.id,
                name: conf.name,
                buy: it.bid,
                sell: it.ask,
                stock: it.stock,
                low: bRate ? bRate.low : (sh ? sh.low : it.low),
                high: bRate ? bRate.high : (sh ? sh.high : it.high),
                factor: conf.factor || 1
            };
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

        // 0. Background Settings Sync (Ticker, Market Status) - Every 1 minute
        if (Date.now() - lastSettingsFetch.current > 60000) {
            syncSettingsWithMongoDB();
            lastSettingsFetch.current = Date.now();
        }

        // 1. Background News Fetch (Throttled) - Every 5 minutes
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

            // PRIMARY PIPELINE: Always fetch direct from the required ngrok live rates endpoint
            try {
                const liveUrl = `${LIVE_RATES_API_URL}?_=${iterationTimestamp}`;
                const res = await fetchWithTimeout(liveUrl, 5000);
                if (res.ok) {
                    const json = await res.json();
                    const text = json?.text || '';
                    if (text && text.length > 20) {
                        const data = parseRateText(text, json?.rates || null);
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
                console.warn("MongoDB/live rate fetch failed:", e);
            }

            // SYNC SETTINGS FROM MONGODB (User Requirement #1 & #3)
            // This ensures all devices are in sync with admin changes
            // DECOUPLED to avoid blocking the fast rate loop
            const now = Date.now();
            if (now - lastSettingsFetch.current > 15000) {
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
                    // Use quick polling when healthy, exponential backoff when backend/tunnel is down.
                    const baseDelay = Math.max(50, 800 - elapsed);
                    const backoffDelay = Math.min(15000, 800 * Math.pow(2, Math.min(failureCount.current, 5)));
                    const delay = failureCount.current > 0 ? Math.max(baseDelay, backoffDelay) : baseDelay;
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
            const delta = a.value || 0;
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
                    const delta = sellMod.value || 0;
                    sell = liveSell !== 0 ? parseFloat((liveSell + delta).toFixed(2)) : '-';
                }

                // Buy Calculation: LiveBuy + BuyMod
                const liveBuy = parseFloat(r.buy) || 0;
                if (buyOffset) {
                    const delta = buyOffset.value || 0;
                    buy = liveBuy !== 0 ? parseFloat((liveBuy + delta).toFixed(2)) : '-';
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

        const rawGold999 = rawRates.rtgs.find(r => r.id === '945' || r.name?.toLowerCase().includes('gold 999'));
        const live999Sell = parseFloat(rawGold999?.sell) || 0;
        const live999Trend = rawGold999?.trend || 'stable';

        const purities = [
            { label: 'Gold 24 KT', key: '24K', factor: 1.0 },
            { label: 'Gold 22 KT', key: '22K', factor: 0.916 },
            { label: 'Gold 18 KT', key: '18K', factor: 0.75 },
            { label: 'Gold 14 KT', key: '14K', factor: 0.583 }
        ].map(p => {
            const trend = live999Trend;

            // Base Karat price from LIVE 999
            const karatBase = Math.round(live999Sell * p.factor);

            let sell, buy;

            if (showModified) {
                // Sell = KaratBase + GoldSellMod (Flat)
                const sMod = adj.baseModifications.gold999;
                const sDelta = sMod.value || 0;
                sell = Math.round(karatBase + sDelta);

                // Buy = KaratBase + GoldBuyMod (Flat, ensuring consistent spread)
                const bMod = adj.gold;
                const bDelta = bMod.value || 0;
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
            const trend = live999Trend;
            const sell = computeGoldTableSell(
                live999Sell,
                p.factor,
                adj.ratesPage.showModified,
                adj.ratesPage.goldTable
            );

            return {
                name: p.label,
                key: p.key,
                sell: live999Sell !== 0 ? sell : '-',
                trend
            };
        });

        const rawSilver999 = rawRates.rtgs.find(r => r.id === '2987');
        const liveSilverSell = parseFloat(rawSilver999?.sell) || 0;
        const ratesPageSilverSell = computeSilver10gSell(
            liveSilverSell,
            adj.ratesPage.showModified,
            adj.ratesPage.silverTable
        );

        const ratesPageSilver = {
            sell: liveSilverSell !== 0 ? ratesPageSilverSell : '-'
        };

        const navarsuRate8g = computeNavarsu8gSell(
            live999Sell,
            adj.ratesPage.showModified,
            adj.ratesPage.navarsuTable
        );
        
        return { spot, rtgs, purities, ratesPagePurities, ratesPageSilver, navarsuRate: navarsuRate8g, musicSettings, syncMusicWithMongoDB };
    }, [rawRates, adj, showModified, musicSettings]);

    const getMarketStatus = () => {
        const config = adj.marketStatus;
        if (!config) return { isOpen: true, message: 'Market Open', timings: 'Open 10 AM Closed 8 PM' };

        const now = new Date();
        
        // Check if it's Sunday in Indian Standard Time
        const istDay = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            weekday: 'short',
        }).format(now);
        
        if (istDay === 'Sun') {
            return {
                isOpen: false,
                message: 'Market Closed (Sunday)',
                timings: 'Opens Monday 10:00 AM'
            };
        }

        const istTime = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
        }).format(now);

        const [hours, minutes] = istTime.split(':').map(Number);
        const currentMinutes = hours * 60 + minutes;

        if (config.mode === 'modified') {
            const [oH, oM] = config.openTime.split(':').map(Number);
            const [cH, cM] = config.closeTime.split(':').map(Number);
            const openMin = oH * 60 + oM;
            const closeMin = cH * 60 + cM;

            const timeRangeOpen = currentMinutes >= openMin && currentMinutes < closeMin;
            const isOpen = config.modifiedStatus === 'open' && timeRangeOpen;

            const formatTime = (t) => {
                const [h, m] = t.split(':').map(Number);
                const suffix = h >= 12 ? 'PM' : 'AM';
                const h12 = h % 12 || 12;
                return `${h12}:${m.toString().padStart(2, '0')} ${suffix}`;
            };

            return {
                isOpen,
                message: isOpen ? 'Market Open' : 'Market Closed',
                timings: `Open ${formatTime(config.openTime)} Closed ${formatTime(config.closeTime)}`
            };
        } else {
            const isOpen = currentMinutes >= 600 && currentMinutes < 1200;
            return {
                isOpen,
                message: isOpen ? 'Market Open' : 'Market Closed',
                timings: 'Open 10:00 AM Closed 08:00 PM'
            };
        }
    };

    return (
        <RateContext.Provider value={{ rates, rawRates, loading, error, news, adj, showModified, settingsLoaded, ticker, videos, videosLoaded, isMusicEnabled, toggleMusic, setMusicEnabled, musicSettings, syncMusicWithMongoDB, updateSettings, updateVideos, refreshRates: fetchAllRates, getPriceClass, getMarketStatus }}>

            {children}
        </RateContext.Provider>
    );
};

export const useRates = () => useContext(RateContext);
