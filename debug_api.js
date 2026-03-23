const https = require('https');

const url = 'https://bcast.rbgoldspot.com:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/rbgold';

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const text = data;
        console.log("FULL RAW TEXT:");
        console.log(text);
        
        const rows = text.trim().split('\n');
        rows.forEach(row => {
            console.log("ROW:", row);
        });
    });
}).on('error', (err) => {
    console.error("Error:", err);
});
