import sharp from 'sharp';

async function convert() {
    try {
        console.log('Starting ticker background conversion...');
        await sharp('public/1000029434.jpg.jpeg')
            .webp({ quality: 80 })
            .toFile('public/bg-ticker.webp');
        console.log('Ticker background conversion successful: public/bg-ticker.webp');
    } catch (err) {
        console.error('Conversion failed:', err);
        process.exit(1);
    }
}

convert();
