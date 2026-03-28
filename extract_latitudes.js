const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'tehsils_lat_long.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const latitudes = data.filter(item => item.latitude !== null).map(item => item.latitude.toFixed(3));

console.log(latitudes.join('\n'));