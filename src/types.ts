export type PathMode = 'absolute' | 'relative';
export type SlugStyle = 'default' | 'snake' | 'lower' | 'preserve';
export type OutputPath = string;
export type Extension = "ts" | "js";

export type Config = {
    extension?: Extension;
    outputPath?: OutputPath;
    typeName?: string;
    pathMode?: PathMode;
    slugStyle?: SlugStyle;
    variableName?: string;
    slugify?: (text: string) => string;
};

export const defaultConfig: Config = {
    extension: 'js',
    outputPath: './output',
    pathMode: 'absolute',
    variableName: 'staticFolder',
    typeName: 'StaticFolder',
    slugStyle: 'snake',
};
