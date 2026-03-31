const fetch = require('node-fetch');

async function checkRates() {
  try {
    const res = await fetch('https://bcast.rbgoldspot.com:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/rbgold');
    const text = await res.text();
    console.log(text);
  } catch (e) {
    console.error(e);
  }
}

checkRates();
