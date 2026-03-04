import React, { createContext, useContext, useState, useEffect } from 'react';

const RateContext = createContext();

// Primary/live API endpoint and template ID you requested
const POTENTIAL_ENDPOINTS = [
    'https://bcast.rbgoldspot.com:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/'
];
const POTENTIAL_IDS = ['rbgold'];

const CORS_PROXIES = [
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    url => `https://corsproxy.org/?${encodeURIComponent(url)}`,
    url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
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
    const lastNewsFetch = React.useRef(0);
    const lastFetchStartTime = React.useRef(0);
    const failureCount = React.useRef(0);

    // Proxy rotation state
    const currentProxyIndex = React.useRef(0);

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
            return { id: it.id, name: it.name, buy: it.bid, sell: it.ask, stock: it.stock, low: it.low, high: it.high };
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
                    const res = await fetchWithTimeout(localUrl, 3000);
                    if (res.ok) {
                        const text = await res.text();
                        if (text && text.length > 20) {
                            const data = parseRateText(text);
                            if (currentFetchId > lastProcessedTimestamp.current) {
                                lastProcessedTimestamp.current = currentFetchId;
                                setRawRates(data);
                                localStorage.setItem('ag_cachedRates', JSON.stringify(data));
                                setError(null);
                                setLoading(false);
                            }
                            success = true;
                            failureCount.current = 0;
                        }
                    }
                } catch (e) {
                    // Fall back to public proxies if local proxy fails for some reason
                }
            }

            if (!success) {
                const targetUrl = `${POTENTIAL_ENDPOINTS[0]}${POTENTIAL_IDS[0]}`;
                const backupUrl = `http://13.201.9.242:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/${POTENTIAL_IDS[0]}`;

                // Try first 3 proxies for speed
                const proxyIndices = [
                    currentProxyIndex.current,
                    (currentProxyIndex.current + 1) % CORS_PROXIES.length,
                    (currentProxyIndex.current + 2) % CORS_PROXIES.length
                ].filter((v, i, a) => a.indexOf(v) === i);

                for (const idx of proxyIndices) {
                    if (success) break;
                    const proxyFn = CORS_PROXIES[idx];
                    // Prioritize HTTP IP to avoid SSL handshake issues (525/520) seen on the domain
                    const urlsToTry = [backupUrl, targetUrl];

                    for (const u of urlsToTry) {
                        if (success) break;
                        try {
                            // 5s timeout for individual requests in the pipeline
                            const proxiedUrl = proxyFn(`${u}${u.includes('?') ? '&' : '?'}_=${iterationTimestamp}`);
                            const res = await fetchWithTimeout(proxiedUrl, 5000);

                            let text = await res.text();

                            if (text.includes('1015') || text.toLowerCase().includes('rate limit')) continue;

                            if (text.trim().startsWith('{')) {
                                try {
                                    const parsed = JSON.parse(text);
                                    text = parsed.contents || text;
                                } catch (e) { }
                            }

                            if (text && text.length > 20) {
                                const data = parseRateText(text);
                                const hasRates = data.rtgs.some(r => r.buy !== '-' || r.sell !== '-') ||
                                    data.spot.some(s => s.bid !== '-' || s.ask !== '-');

                                if (hasRates) {
                                    // TIMESTAMP GUARD: Only update if this data is newer than what we last processed
                                    if (currentFetchId > lastProcessedTimestamp.current) {
                                        lastProcessedTimestamp.current = currentFetchId;
                                        setRawRates(data);
                                        localStorage.setItem('ag_cachedRates', JSON.stringify(data));
                                        currentProxyIndex.current = idx;
                                        setError(null);
                                        setLoading(false);
                                    }
                                    success = true;
                                    failureCount.current = 0;
                                    break;
                                }
                            }
                        } catch (e) { }
                    }
                }
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
        fetchAllRates();
        const interval = setInterval(fetchAllRates, 1000); // Pulse every 1s
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

                // SELL stays original (raw market), BUY gets user-defined offset
                let sell = r.sell;
                let baseBuy = r.buy !== '-' ? r.buy : r.sell;
                let buy = baseBuy !== '-' ? adjust(baseBuy, type) : '-';

                return { ...r, buy, sell };
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
