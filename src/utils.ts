export function slugifyDefault(text: string) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
}

export function slugifySnake(text: string) {
    return slugifyDefault(text).replace(/-/g, "_").replace(/[^\w\-]+/g, "_");
}

export function slugifyLower(text: string) {
    return text.toString().toLowerCase().replace(/[^\w\-]+/g, "_");
}

export type SlugStyle = 'default' | 'snake' | 'lower' | 'preserve';

export function pickSlugify(style?: SlugStyle, custom?: ((t: string) => string)) {
    if (typeof custom === 'function') return custom;
    switch (style) {
        case 'snake':
            return slugifySnake;
        case 'lower':
            return slugifyLower;
        case 'preserve':
            return (t: string) => t;
        default:
            return slugifyDefault;
    }
}
