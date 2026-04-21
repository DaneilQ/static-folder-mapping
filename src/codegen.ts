import fs from "fs/promises";
import pathLib from "path";

import {type Config, type Extension} from "./types.js";

export default async (result: Record<string, unknown>, config: Config): Promise<void> => {

    const rawOutput = config.outputPath ?? './output';
    // Resolve output against explicit basePath if provided, otherwise consumer cwd
    const base = config.basePath ? pathLib.resolve(config.basePath) : process.cwd();
    const output = pathLib.isAbsolute(rawOutput) ? rawOutput : pathLib.resolve(base, rawOutput);

    const extension: Extension = config.extension ?? 'js';
    const variableName = config.variableName ?? 'staticFolder';

    let jsPath: string | undefined;
    let dtsPath: string | undefined;
    let tsPath: string | undefined;

    if (extension === 'js') {
        jsPath = output.endsWith('.js') ? output : `${output}.js`;
        dtsPath = jsPath.replace(/\.js$/, '.d.ts');
    } else {
        tsPath = output.endsWith('.ts') ? output : `${output}.ts`;
    }

    if (jsPath) await fs.mkdir(pathLib.dirname(jsPath), {recursive: true});
    if (dtsPath) await fs.mkdir(pathLib.dirname(dtsPath), {recursive: true});
    if (tsPath) await fs.mkdir(pathLib.dirname(tsPath), {recursive: true});

    const jsonText = JSON.stringify(result, null, 2);

    const toTsLiteral = (val: unknown): string => {
        if (typeof val === 'string') return JSON.stringify(val);
        if (Array.isArray(val)) return `[${val.map((v) => toTsLiteral(v)).join(', ')}]`;
        if (val && typeof val === 'object') {
            const obj = val as Record<string, unknown>;
            const entries: string[] = Object.keys(obj).map((k: string) => `${JSON.stringify(k)}: ${toTsLiteral(obj[k])}`);
            return `{ ${entries.join(', ')} }`;
        }
        return JSON.stringify(val);
    };

    const mainContent = `const ${variableName} = ${jsonText} as const;`;

    if (extension === 'js') {
        await fs.writeFile(jsPath as string, mainContent);

        const tsLiteral = toTsLiteral(result);

        const dts = [
            `export declare const ${variableName}: ${tsLiteral};`,
            `export { ${variableName} };`,
            ''
        ].join('\n');

        await fs.writeFile(dtsPath as string, dts);
    } else {
        const tsContent = [
            mainContent,
            '',
            `export type ${config.typeName} = typeof ${variableName};`,
            `export { ${variableName} };`,
            ''
        ].join('\n');

        await fs.writeFile(tsPath as string, tsContent);
    }
}