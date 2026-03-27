const sharp = require('sharp');
const path = require('path');

const inputPath = 'c:\\Users\\samue\\Downloads\\abhanav-website\\public\\logo.webp';
const outputPath = 'c:\\Users\\samue\\Downloads\\abhanav-website\\apk\\assets\\images\\icon.png';

sharp(inputPath)
  .png()
  .toFile(outputPath)
  .then(() => {
    console.log('Successfully converted logo.webp to icon.png');
  })
  .catch(err => {
    console.error('Error converting image:', err);
    process.exit(1);
  });
