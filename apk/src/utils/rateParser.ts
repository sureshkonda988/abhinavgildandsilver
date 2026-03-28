export const parseRateText = (text: string) => {
    if (!text || typeof text !== 'string') return { spot: [], rtgs: [] };

    const cleanText = text.replace(/\r/g, '').trim();
    const rows = cleanText.split('\n');
    const dataMap: any = {};

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

            const parseVal = (v: string) => {
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

        return {
            id: it.id,
            name: conf.name,
            buy: it.bid,
            sell: it.ask,
            stock: it.stock,
            low: it.low,
            high: it.high,
            factor: (conf as any).factor || 1
        };
    });

    const gold999 = rtgs.find(r => r.id === '945' || r.name?.toLowerCase().includes('gold 999'));
    const live999Sell = typeof gold999?.sell === 'number' ? gold999.sell : 0;

    const purities = [
        { name: 'Gold 24 KT', key: '24K', factor: 1.0 },
        { name: 'Gold 22 KT', key: '22K', factor: 0.916 },
        { name: 'Gold 18 KT', key: '18K', factor: 0.75 },
        { name: 'Gold 14 KT', key: '14K', factor: 0.583 }
    ].map(p => ({
        ...p,
        sell: live999Sell !== 0 ? Math.round(live999Sell * p.factor) : '-',
        trend: (gold999 as any)?.trend || 'stable'
    }));

    const silver999 = rtgs.find(r => r.id === '2987' || r.name?.toLowerCase().includes('silver 999'));
    const liveSilverSell = typeof silver999?.sell === 'number' ? silver999.sell : 0;

    return { 
        spot, 
        rtgs, 
        purities, 
        silverSell: liveSilverSell !== 0 ? Math.round(liveSilverSell) : '-',
        ticker: (dataMap as any).ticker || '' 
    };
};
