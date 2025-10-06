module.exports = {
  fileName: "./data/portland-neighborhood-example.geojson",
  city: "Portland, OR",
  scale: 1,
  simplifyFactor: 0.001,
  outputType: "svg",
  customOptions: {
    title: {
      getTitle: () => null
    },
    anchorTag: {
      getHref: () => null
    },
    filterCallback: (feature) => feature,
    getMetaData: () => null,
    assignNeighborhoodRegionColors: () => null
  }
};