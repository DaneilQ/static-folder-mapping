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
    // If provided, relative input/output paths will be resolved against this instead of process.cwd()
    basePath?: string;
};

export const defaultConfig: Config = {
    extension: 'js',
    outputPath: './output',
    pathMode: 'relative',
    variableName: 'staticFolder',
    typeName: 'StaticFolder',
    slugStyle: 'snake',
};
