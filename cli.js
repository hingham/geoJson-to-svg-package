#!/usr/bin/env node
// filepath: /Users/Hannah/Documents/projects/svg-map-generator/svg-city-src/cli.js

const fs = require('fs');
const path = require('path');
const { getSvg } = require('./src/main'); // Updated to use relative path since main.js is in same directory

// Parse command line arguments
const args = process.argv.slice(2);

function showHelp() {
    console.log(`
SVG Map Generator CLI

Usage: svg-map-generator <config-file> [options]

Arguments:
  config-file    Path to JS or JSON configuration file

Options:
  -h, --help     Show this help message
  -o, --output   Output file path (default: output.svg)
  -v, --verbose  Verbose output

Example:
  svg-map-generator config/seattle.js -o seattle-map.svg
  svg-map-generator config/seattle.json -o seattle-map.html

JS Config file format (config/seattle.js):
module.exports = {
  fileName: "./data/neighborhoods.geojson",
  city: "Seattle, WA",
  scale: 1,
  simplifyFactor: 0.001,
  outputType: "html", // or "svg"
  customOptions: {
    title: {
      getTitle: (data) => data.neighborhoodName
    },
    anchorTag: {
      getHref: (data) => \`/\${data.neighborhoodHood}\`
    },
    filterCallback: (feature) => feature.properties && feature.properties.city === 'Seattle',
    getMetaData: (feature) => {
      const neighborhoodHood = feature.properties?.nhood || feature.properties?.name || 'Unknown';
      const neighborhoodName = feature.properties?.name || 'Unknown';
      return { neighborhoodHood, neighborhoodName };
    },
    assignNeighborhoodRegionColors: (metaData) => {
      const neighborhoodLookup = require('../geoJson-toSvg-package/neighborhood_districts.json');
      const { getNameForNeighborhoodLookup } = require('./helpers');
      return neighborhoodLookup[getNameForNeighborhoodLookup(metaData.neighborhoodName)];
    }
  }
};
    `);
}

function parseConfig(configPath) {
    try {
        const ext = path.extname(configPath).toLowerCase();
        
        if (ext === '.js') {
            // Clear require cache to allow reloading
            const absolutePath = path.resolve(configPath);
            delete require.cache[absolutePath];
            
            // Require the JS config file
            const config = require(absolutePath);
            return config;
            
        } else {
            throw new Error(`Unsupported config file format: ${ext}. Use .js or .json`);
        }
        
    } catch (error) {
        console.error(`Error reading config file: ${error.message}`);
        process.exit(1);
    }
}

function main() {
    // Check for help flag
    if (args.includes('-h') || args.includes('--help') || args.length === 0) {
        showHelp();
        return;
    }

    const configFile = args[0];
    const outputIndex = args.indexOf('-o') !== -1 ? args.indexOf('-o') : args.indexOf('--output');
    const outputFile = outputIndex !== -1 && args[outputIndex + 1] ? args[outputIndex + 1] : 'output.svg';
    const verbose = args.includes('-v') || args.includes('--verbose');

    if (!fs.existsSync(configFile)) {
        console.error(`Error: Config file '${configFile}' not found`);
        process.exit(1);
    }

    if (verbose) {
        console.log(`Reading config from: ${configFile}`);
        console.log(`Output will be written to: ${outputFile}`);
    }

    const outputFilePath = "./output/" + outputFile 

    // Parse configuration
    const config = parseConfig(configFile);

    try {
        // Generate SVG
        const {svgPaths, xViewLen, yViewLen} = getSvg(
            config.fileName,
            config.scale || 1,
            config.simplifyFactor || 0.001,
            config.customOptions
        );

        if (config.outputType === 'html') {
            // Generate HTML output
            const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.city || 'SVG Map'}</title>
</head>
<body>
    <h1>${config.city || 'SVG Map'}</h1>
    <div class="svg-container">
        <svg id="my-svg" viewBox="0 0 ${xViewLen} ${yViewLen}">${svgPaths}</svg>
    </div>
</body>
</html>`;
            fs.writeFileSync(outputFilePath, html);
        } else {
            // Generate SVG output
            const svg = `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">${svgPaths}</svg>`;
            fs.writeFileSync(outputFilePath, svg);
        }

        console.log(`✅ Successfully generated ${config.outputType || 'svg'} file: ${outputFile}`);

    } catch (error) {
        console.error(`Error generating SVG: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Run the CLI
main();
