// Color code conversions

export function hexToRGBA(hexColor: string) {
    const hex = hexColor.split("#").pop() as string;
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b, a: 255 };
}
export function RGBAToHex(rgba: RGBA) {
    const hex = "#" + componentToHex(rgba.r) + componentToHex(rgba.g) + componentToHex(rgba.b);
    return hex;
}
export function componentToHex(c: number) {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

// Misc

export function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
