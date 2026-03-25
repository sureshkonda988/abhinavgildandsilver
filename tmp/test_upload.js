import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function testUpload() {
    const form = new FormData();
    // Create a dummy mp3 file if it doesn't exist
    const dummyPath = path.resolve('tmp/dummy.mp3');
    if (!fs.existsSync('tmp')) fs.mkdirSync('tmp');
    fs.writeFileSync(dummyPath, 'dummy audio data');

    form.append('file', fs.createReadStream(dummyPath));
    form.append('type', 'home');

    try {
        const response = await axios.post('http://localhost:5000/api/music/upload', form, {
            headers: form.getHeaders(),
        });
        console.log('Upload Success:', response.data);
    } catch (error) {
        console.error('Upload Failed:', error.response?.data || error.message);
    }
}

testUpload();
