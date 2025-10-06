/*
For each path, pull in the cords.
Split coordinates into an array of values
Run the coordinates through a simplifier
Translate the simplified coordinates back to an array of x,y values
Find the maxLat and minLong with the simplified points
Adjust the points so that the maxLat and minLong are the 0,0 points
Construct the path with the adjusted points. The path is relative to the container

 
 */
const { createColorVariant } = require("../../color-variation.js")


const simplify = require('simplify-js')
const randomcolor = require('randomcolor')


const noNames = {}

const getSimplifiedPolygonPaths = (polygons, scale = 3, simplifyFactor = .001, polygonData, getHref, getTitle, assignNeighborhoodRegionColors) => {
    const simplified = polygons.map((polygon) => {
        let coordArr = polygon
        if (typeof coordArr === 'str') {
            coordArr = polygon.split(', ');
        }
        return getSimplifiedLatLongCoordinates(coordArr, simplifyFactor)
    })

    const { minLong, maxLat } = getMaxMinFromAllPolygons(simplified)
    const { maxLong } = getMaxLong(simplified)

    let allDistrictsColors;
    if (assignNeighborhoodRegionColors) {
        allDistrictsColors = polygonData.reduce((acc, val, index) => {
            const district = assignNeighborhoodRegionColors(val)
            acc[district] = randomcolor()
            return acc
        }, {})
    }

    let svgPaths = ''
    simplified.forEach((simplifiedPolygonCoords, index) => {
        const title = getTitle ? getTitle(polygonData[index]) : null
        const href = getHref ? getHref(polygonData[index]) : null
        const color = assignNeighborhoodRegionColors ? allDistrictsColors[assignNeighborhoodRegionColors(polygonData[index])] : null;
        svgPaths = svgPaths + getSvgPolygonSvgPath(
            simplifiedPolygonCoords, maxLat, minLong, maxLong, scale, title, href, color
        )
    })

    return svgPaths;
}

const getSimplifiedPolygonPath = (polygon, scaleFactor, simplifyFactor, maxLat, minLong, title, href) => {
    const simplified = getSimplifiedLatLongCoordinates(polygon, simplifyFactor)
    return getSvgPolygonSvgPath(simplified, maxLat, minLong, scale, title, href)
}

const parseAndRound = (str) => {
    let number = str
    if (typeof str == "string") {
        number = parseFloat(str)
    }
    const roundedNum = Math.round(number * 1000) / 1000;
    // console.log({roundedNum})
    return roundedNum
}

const getSimplifiedLatLongCoordinates = (cords, simplifyFactor) => {

    const parsedCords = cords.map((cord) => {
        let arr = cord
        if (typeof cord == 'string') {
            arr = cord.split(' ');
        }
        // Swap lat / long so it will be x, y
        return [parseAndRound(arr[1]), parseAndRound(arr[0])];
    });

    // Simplify the polygon
    const points = parsedCords.map(cord => ({ x: cord[0], y: cord[1] }));
    const simplified = simplify(points, simplifyFactor, true); // Adjust tolerance as needed - .0005 seems quite good
    const simplifiedCords = simplified.map(point => [point.x, point.y]);

    return simplifiedCords
}

const getMaxMinFromAllPolygons = (parsedPolygons) => {
    let maxLat = null;
    let minLong = null;
    parsedPolygons.forEach((polygon) => {
        polygon.forEach((cord) => {
            maxLat = maxLat != null ? Math.max(cord[0], maxLat) : cord[0];
            minLong = minLong != null ? Math.min(cord[1], minLong) : cord[1];
        });
    })
    return { maxLat, minLong }
}

const getMaxLong = (parsedPolygons) => {
    let maxLong = null;
    parsedPolygons.forEach((polygon) => {
        polygon.forEach((cord) => {
            maxLong = maxLong != null ? Math.max(cord[1], maxLong) : cord[1];
        });
    })
    return { maxLong }
}


const getSvgPolygonSvgPath = (simplifiedCords, maxLat, minLong, maxLong, scale, title, href, color) => {
    const squareLen = scale * 100; // for example 6 -> 600 px
    const multiplier = squareLen / Math.abs(maxLong - minLong)
    let latInverse = maxLat * -1
    let longInverse = minLong * -1
    const adjustedParsedCords = simplifiedCords.map((cord) => {
        // console.log(cord[0], latInverse, cord[0] + latInverse)
        return [parseAndRound((cord[0] + latInverse) * -1 * multiplier), parseAndRound((cord[1] + longInverse) * 1 * multiplier)]
    })

    let pPath = ""
    for (let i = 0; i < adjustedParsedCords.length; i++) {
        pPath = pPath + `${adjustedParsedCords[i][1]},${adjustedParsedCords[i][0]}` + " "
    }

    const polygonColor = color ? createColorVariant(color) : randomcolor();

    if (href && title) {
        return `<a href=${href}><title>${title}</title><polygon points="${pPath}" stroke="white" stroke-width=".5" fill="${polygonColor}"/></a>`
    }

    if (title) {
        return `<polygon points="${pPath}" stroke="white" stroke-width=".15" fill="${polygonColor}"><title>${title}</title></polygon>`
    }


    return `<polygon points="${pPath}" stroke="white" stroke-width=".3" fill="${randomcolor()}"/>`

}

module.exports = { getSimplifiedPolygonPaths, getSimplifiedLatLongCoordinates, getSimplifiedPolygonPath, getMaxMinFromAllPolygons }
