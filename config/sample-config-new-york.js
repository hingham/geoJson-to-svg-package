module.exports = {
    fileName: "./data/nyc-neighborhoods-example.geojson",
    city: "New York City",
    scale: 1,
    simplifyFactor: 0.005,
    outputType: "svg",
    customOptions: {
        title: {
            getTitle: (data) => data.neighborhoodName + ", " + data.borough
        },
        anchorTag: {
            getHref: null
        },
        filterCallback: (feature) => feature,
        assignNeighborhoodRegionColors: (metaData) => metaData.borough,
        getMetaData: (feature) => {
            const borough = feature.properties?.borough || 'Unknown';
            const neighborhoodName = feature.properties?.neighborhood || 'Unknown';
            return {
                borough,
                neighborhoodName
            }

        }
    }
}