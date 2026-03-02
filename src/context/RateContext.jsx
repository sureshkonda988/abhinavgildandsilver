import React, { createContext, useContext, useState, useEffect } from 'react';

const RateContext = createContext();

const POTENTIAL_ENDPOINTS = [
    'https://bcast.rbgoldspot.com:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/',
    'https://bcast.rbgoldspot.com:7767/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/',
    'http://13.201.9.242:7767/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/',
    'https://bcast.rbgoldspot.com/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/',
    'http://bcast.rbgoldspot.com:7767/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/',
    'http://bcast.rbgoldspot.com:8080/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/',
    'https://bcast.rbgoldspot.com:8081/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/'
];
const POTENTIAL_IDS = ['rbgold', 'rbgoldspot'];

const CORS_PROXIES = [
    url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    url => `https://thingproxy.freeboard.io/fetch/${url}`,
    url => `https://corsproxy.org/?${encodeURIComponent(url)}`,
    url => `https://allorigins.win/get?url=${encodeURIComponent(url)}`,
];

const INITIAL_SPOT_CONFIG = [
    { id: '3101', name: 'GOLD ($)' },
    { id: '3107', name: 'SILVER ($)' },
    { id: '3103', name: 'USD-INR (₹)' }
];

const INITIAL_RTGS_CONFIG = [
    { id: '945', name: 'Gold 999' },
    { id: '2966', name: 'Silver 999 (30 Kgs)' },
    { id: '2987', name: 'Silver 999 (5 Kgs)' }
];

const getPlaceholders = () => {
    try {
        const cached = localStorage.getItem('ag_cachedRates');
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.spot && parsed.rtgs) return parsed;
        }
    } catch (e) {
        console.error("Failed to parse cached rates:", e);
    }
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

    // Load last working config indices from localStorage
    const savedConfig = JSON.parse(localStorage.getItem('ag_lastWorkingConfig') || '{}');
    const lastProxyIndex = React.useRef(savedConfig.proxy || 0);
    const lastEndpointIndex = React.useRef(savedConfig.endpoint || 0);
    const lastIdIndex = React.useRef(savedConfig.id || 0);

    // Robust initial state for adj
    const getInitialAdj = () => {
        try {
            const saved = localStorage.getItem('ag_rateAdj');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.gold && parsed.silver) return parsed;
            }
        } catch (e) {
            console.error("Failed to parse offsets:", e);
        }
        return { gold: { mode: 'amount', value: 0 }, silver: { mode: 'amount', value: 0 } };
    };

    const [adj, setAdj] = useState(getInitialAdj());
    const [showModified, setShowModified] = useState(JSON.parse(localStorage.getItem('ag_showModified') || 'false'));

    const updateSettings = (newAdj, newShow) => {
        if (newAdj !== undefined) {
            setAdj(newAdj);
            localStorage.setItem('ag_rateAdj', JSON.stringify(newAdj));
        }
        if (newShow !== undefined) {
            setShowModified(newShow);
            localStorage.setItem('ag_showModified', JSON.stringify(newShow));
        }
    };

    const fetchWithTimeout = async (url, ms = 2500) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), ms);
        try {
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(id);
            return res;
        } catch (e) {
            clearTimeout(id);
            throw e;
        }
    };

    const parseRateText = (text) => {
        if (!text || typeof text !== 'string') return getPlaceholders();
        const rows = text.trim().split('\n');
        const dataMap = {};

        rows.forEach(rawRow => {
            const trimmed = rawRow.trim();
            if (!trimmed) return;

            // Split by all whitespace (tabs or spaces)
            const parts = trimmed.split(/\s+/);

            if (parts.length >= 7) {
                const id = parts[0];
                const stockStr = parts[parts.length - 1];
                const low = parts[parts.length - 2];
                const high = parts[parts.length - 3];
                const ask = parts[parts.length - 4];
                const bid = parts[parts.length - 5];

                const name = parts.slice(1, parts.length - 5).join(' ');

                const parseVal = (v) => {
                    if (v === '-' || !v) return '-';
                    return parseFloat(v.replace(/,/g, ''));
                };

                dataMap[id] = {
                    id, name,
                    bid: parseVal(bid),
                    ask: parseVal(ask),
                    high: parseVal(high),
                    low: parseVal(low),
                    stock: (stockStr || '').toLowerCase().includes('instock'),
                };
            }
        });

        const spot = INITIAL_SPOT_CONFIG.map(conf => {
            const it = dataMap[conf.id];
            return it ? it : { ...conf, bid: '-', ask: '-', high: '-', low: '-', stock: false };
        });

        const rtgs = INITIAL_RTGS_CONFIG.map(conf => {
            const it = dataMap[conf.id];
            if (!it) return { ...conf, buy: '-', sell: '-', stock: false };
            return { id: it.id, name: it.name, buy: it.bid, sell: it.ask, stock: it.stock, low: it.low, high: it.high };
        });

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

    const lastNewsFetch = React.useRef(0);
    const fetchAllRates = async () => {
        if (isFetching.current) return;
        isFetching.current = true;

        let lastError;
        const proxyCount = CORS_PROXIES.length;
        const endpointCount = POTENTIAL_ENDPOINTS.length;
        const idCount = POTENTIAL_IDS.length;

        // Fetch News (Throttled to every 5 mins)
        if (Date.now() - lastNewsFetch.current > 300000) {
            const newsUrl = 'https://www.investing.com/rss/news_11.rss';
            for (let pIdx = 0; pIdx < proxyCount; pIdx++) {
                try {
                    const proxyUrl = CORS_PROXIES[pIdx](newsUrl);
                    const res = await fetchWithTimeout(proxyUrl, 3000);
                    if (res.ok) {
                        let text = await res.text();
                        try {
                            if (text.trim().startsWith('{')) {
                                const json = JSON.parse(text);
                                text = json.contents || text;
                            }
                        } catch (e) { }
                        const parsedNews = parseNews(text);
                        if (parsedNews.length > 0) {
                            setNews(parsedNews);
                            lastNewsFetch.current = Date.now();
                            break;
                        }
                    }
                } catch (e) { }
            }
        }

        // Nested loops to find a working combination
        for (let eIdx = 0; eIdx < endpointCount; eIdx++) {
            const currentE = POTENTIAL_ENDPOINTS[(lastEndpointIndex.current + eIdx) % endpointCount];

            for (let iIdx = 0; iIdx < idCount; iIdx++) {
                const currentId = POTENTIAL_IDS[(lastIdIndex.current + iIdx) % idCount];
                const baseEndpoint = `${currentE}${currentId}`;

                // Add minimal cache busting only if needed
                const salt = Math.random().toString(36).substring(7);
                const finalEndpoint = `${baseEndpoint}?cb=${salt}`;

                for (let pIdx = 0; pIdx < proxyCount; pIdx++) {
                    const currentPIdx = (lastProxyIndex.current + pIdx) % proxyCount;
                    const makeUrl = CORS_PROXIES[currentPIdx];

                    try {
                        const url = makeUrl(finalEndpoint);
                        const res = await fetchWithTimeout(url, 3000);
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);

                        let text = await res.text();

                        // Handle JSON-wrapped responses
                        try {
                            if (text.trim().startsWith('{')) {
                                const json = JSON.parse(text);
                                if (json.contents) text = json.contents;
                                else if (json.Error) throw new Error(json.Error);
                            }
                        } catch (e) { }

                        if (!text || text.trim().length < 5) throw new Error('Short response');
                        const parsed = parseRateText(text);

                        setRawRates(parsed);
                        localStorage.setItem('ag_cachedRates', JSON.stringify(parsed));
                        setError(null);
                        setLoading(false);

                        // Save working configuration
                        const newEndpointIdx = (lastEndpointIndex.current + eIdx) % endpointCount;
                        const newIdIdx = (lastIdIndex.current + iIdx) % idCount;

                        lastEndpointIndex.current = newEndpointIdx;
                        lastIdIndex.current = newIdIdx;
                        lastProxyIndex.current = currentPIdx;

                        localStorage.setItem('ag_lastWorkingConfig', JSON.stringify({
                            proxy: currentPIdx,
                            endpoint: newEndpointIdx,
                            id: newIdIdx
                        }));

                        isFetching.current = false;
                        return;
                    } catch (e) {
                        lastError = e;
                    }
                }
            }
        }

        setError(lastError?.message || 'Connection failed');
        setLoading(false);
        isFetching.current = false;
    };


    useEffect(() => {
        fetchAllRates();
        // 500ms interval ensures we check often, 
        // but isFetching ref prevents overlapping requests.
        const interval = setInterval(fetchAllRates, 500);
        return () => clearInterval(interval);
    }, []);



    const rates = React.useMemo(() => {
        if (!showModified) return rawRates;

        const adjust = (val, type) => {
            const a = type === 'GOLD' ? adj.gold : adj.silver;
            if (!a || typeof val !== 'number') return val;
            const delta = a.mode === 'amount' ? a.value : (val * a.value) / 100;
            return parseFloat((val + delta).toFixed(2));
        };

        return {
            spot: rawRates.spot.map(s => {
                const isGold = s.name.toUpperCase().includes('GOLD');
                const isSilver = s.name.toUpperCase().includes('SILVER');
                if (!isGold && !isSilver) return s;
                return {
                    ...s,
                    bid: adjust(s.bid, isGold ? 'GOLD' : 'SILVER'),
                    ask: adjust(s.ask, isGold ? 'GOLD' : 'SILVER'),
                    high: adjust(s.high, isGold ? 'GOLD' : 'SILVER'),
                    low: adjust(s.low, isGold ? 'GOLD' : 'SILVER')
                };
            }),
            rtgs: rawRates.rtgs.map(r => {
                const isGold = r.name.toUpperCase().includes('GOLD');
                const isSilver = r.name.toUpperCase().includes('SILVER');
                const type = isGold ? 'GOLD' : (isSilver ? 'SILVER' : null);

                if (!type) return r;

                let buy = r.buy !== '-' ? adjust(r.buy, type) : '-';
                let sell = r.sell !== '-' ? adjust(r.sell, type) : '-';
                let high = r.high !== '-' ? adjust(r.high, type) : '-';
                let low = r.low !== '-' ? adjust(r.low, type) : '-';

                // Ensure High/Low/Buy are not identical to Sell if Sell is available
                if (sell !== '-' && typeof sell === 'number') {
                    const spread = sell * 0.0015; // 0.15% indicative spread
                    if (high === '-' || high <= sell) high = parseFloat((sell + spread).toFixed(2));
                    if (low === '-' || low >= sell) low = parseFloat((sell - spread).toFixed(2));
                    if (buy === '-' || buy >= sell) buy = parseFloat((sell - (spread * 0.5)).toFixed(2));
                }

                return { ...r, buy, sell, high, low };
            })
        };
    }, [rawRates, adj, showModified]);

    return (
        <RateContext.Provider value={{ rates, rawRates, loading, error, news, adj, showModified, updateSettings, refreshRates: fetchAllRates }}>
            {children}
        </RateContext.Provider>
    );
};

export const useRates = () => useContext(RateContext);
