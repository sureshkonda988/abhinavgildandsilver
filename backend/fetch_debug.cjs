const https = require('https');

const url = 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://bcast.rbgoldspot.com:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/rbgold');

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const text = json.contents;
            console.log("RAW TEXT RESPONSE:");
            console.log(text);

            if (!text) {
                console.log("No text in response");
                return;
            }

            const rows = text.trim().split('\n');
            rows.forEach(row => {
                const parts = row.trim().split(/\s+/);
                if (parts.length >= 7) {
                    console.log(`ID: ${parts[0]} | Name: ${parts.slice(1, parts.length - 5).join(' ')}`);
                }
            });
        } catch (e) {
            console.error("Parse error:", e);
            console.log("Data was:", data);
        }
    });
}).on('error', (err) => {
    console.error("Fetch error:", err);
});
