/**
 * Converts hex color to RGB values
 * @param {string} hex - Hex color string (e.g., "#FF5733" or "FF5733")
 * @returns {Object} Object with r, g, b values
 */
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Handle 3-digit hex codes
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

/**
 * Converts RGB values to HSL
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {Object} Object with h, s, l values
 */
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Converts HSL values to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {Object} Object with r, g, b values
 */
function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    };
    
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/**
 * Converts RGB values to hex string
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color string
 */
function rgbToHex(r, g, b) {
    const toHex = (value) => {
        const hex = Math.max(0, Math.min(255, Math.round(value))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Creates a slight variant of the given hex color
 * @param {string} hexColor - Original hex color (e.g., "#FF5733")
 * @param {Object} options - Variation options
 * @param {number} options.hueShift - Hue shift in degrees (-360 to 360, default: random -15 to 15)
 * @param {number} options.saturationShift - Saturation shift percentage (-50 to 50, default: random -10 to 10)
 * @param {number} options.lightnessShift - Lightness shift percentage (-30 to 30, default: random -8 to 8)
 * @returns {string} Variant hex color
 */
function createColorVariant(hexColor, options = {}) {
    // Default random variations for subtle changes
    const hueShift = options.hueShift ?? (Math.random() * 30 - 15); // -15 to 15 degrees
    const saturationShift = options.saturationShift ?? (Math.random() * 20 - 10); // -10 to 10%
    const lightnessShift = options.lightnessShift ?? (Math.random() * 16 - 8); // -8 to 8%
    
    // Convert hex to RGB
    const { r, g, b } = hexToRgb(hexColor);
    
    // Convert RGB to HSL
    const { h, s, l } = rgbToHsl(r, g, b);
    
    // Apply variations
    let newH = (h + hueShift) % 360;
    if (newH < 0) newH += 360;
    
    const newS = Math.max(0, Math.min(100, s + saturationShift));
    const newL = Math.max(0, Math.min(100, l + lightnessShift));
    
    // Convert back to RGB
    const newRgb = hslToRgb(newH, newS, newL);
    
    // Convert to hex
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

module.exports = {
    createColorVariant,
    hexToRgb,
    rgbToHsl,
    hslToRgb,
    rgbToHex
};