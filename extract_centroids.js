const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'geojson', 'pakistan_tehsils.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const results = [];

data.features.forEach(feature => {
    const name = feature.properties.ADM3_EN;
    const coords = feature.geometry.coordinates[0]; // the polygon ring
    let sumLat = 0, sumLng = 0, count = 0;
    coords.forEach(coord => {
        sumLng += coord[0];
        sumLat += coord[1];
        count++;
    });
    const avgLng = sumLng / count;
    const avgLat = sumLat / count;
    results.push({ name, latitude: avgLat, longitude: avgLng });
});

const outputPath = path.join(__dirname, 'tehsils_lat_long.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
console.log(`Results saved to ${outputPath}`);