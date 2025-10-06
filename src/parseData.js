const fs = require('fs');
const path = require('path');

// This actually works pretty well
// Next steps - can we render text? Can we link out to the actual neighborhoods...

function getGeoJsonData(fileName) {
    try {
        // Read the GeoJSON file
        const geoJsonPath = path.join(__dirname, fileName);
        const geoJsonContent = fs.readFileSync(geoJsonPath, 'utf8');

        // Parse the JSON
        return JSON.parse(geoJsonContent);

    } catch (error) {
        console.error('Error reading GeoJSON file:', error);
        return { coordinates: [], metaData: [] };
    }
}


const writeFile = (fileName, data) => {

    fs.writeFile(fileName, data, (err) => {
        console.error(err)
    })
}

module.exports = { getGeoJsonData, writeFile }