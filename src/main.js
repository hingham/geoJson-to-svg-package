
const { getNameForNeighborhoodLookup, getSimplifiedPolygonPaths } = require('./helpers');
const { getGeoJsonData, writeFile } = require('./parseData');

// This actually works pretty well
// Next steps - can we render text? Can we link out to the actual neighborhoods...

/**
 * Reads the GeoJSON file and extracts polygons and neighborhood names
 * @returns {Object} Object containing arrays of coordinates and names
 */
function readAndParseGeoJSON(geoJsonData, filterCallback, metaDataCallback) {
    try {
        const allCoordinates = [];
        const metaData = [];

        // Process each feature
        const filtered = filterCallback ? geoJsonData.features.filter(filterCallback) : geoJsonData.features;

        for (const feature of filtered || []) {
            const metaDataForFeature = metaDataCallback ? metaDataCallback(feature) : ""

            const geometry = feature.geometry;

            if (geometry && geometry.coordinates) {
                if (geometry.type === 'Polygon') {
                    // Single polygon - extract coordinates from the first ring (exterior)
                    const coordinateRings = geometry.coordinates;
                    if (coordinateRings && coordinateRings.length > 0) {
                        const exteriorRing = coordinateRings[0];
                        if (exteriorRing && exteriorRing.length > 0) {
                            // const coordString = convertCoordinatesToString(exteriorRing);

                            allCoordinates.push(exteriorRing);
                            metaData.push(metaDataForFeature)
                        }
                    }
                } else if (geometry.type === 'MultiPolygon') {
                    // Multiple polygons - process each one
                    const polygons = geometry.coordinates;
                    for (const polygon of polygons) {
                        if (polygon && polygon.length > 0) {
                            const exteriorRing = polygon[0]; // First ring is exterior
                            if (exteriorRing && exteriorRing.length > 0) {
                                // const coordString = convertCoordinatesToString(exteriorRing);
                                allCoordinates.push(exteriorRing);
                                metaData.push(metaDataForFeature)
                            }
                        }
                    }
                }
            }
        }

        return { coordinates: allCoordinates, metaData };


    } catch (error) {
        console.error('Error reading GeoJSON file:', error);
        return { coordinates: [], metaData: [] };
    }
}

const getSvg = (fileName, scale, simplifyFactor, { anchorTag, title, filterCallback, getMetaData, assignNeighborhoodRegionColors }) => {
    const geoJsonData = getGeoJsonData(fileName)
    const { coordinates, metaData } = readAndParseGeoJSON(geoJsonData, filterCallback, getMetaData)

    if (coordinates && coordinates.length !== metaData.length) {
        throw new Error("metaData and polygon coordinates are of different lengths")
    }



    // Generate SVG with GeoJSON data
    if (coordinates.length > 0) {
        console.log('\n--- Generating SVG ---');
        // const svg = getSimplifiedPolygonPaths(geoJsonData.coordinates, geoJsonData.names, geoJsonData.hoods, scale, simplifyFactor);
        return getSimplifiedPolygonPaths(
            coordinates, scale, simplifyFactor, metaData, anchorTag.getHref, title.getTitle, assignNeighborhoodRegionColors
        );
    }
}

module.exports = {getSvg}