import fs from "fs/promises";
import pathLib from "path";
import {pickSlugify} from "./utils.js";
import type {Config} from "./types.js";

type FileTree = { [key: string]: FileTree | string };

export async function recursiveChecking(
    currentPath: string,
    ogPath: string,
    acc: FileTree = {},
    config: Config,
    slugify = pickSlugify(config.slugStyle, config.slugify)
): Promise<FileTree> {
    try {
        const entries = await fs.readdir(currentPath);

        for (const name of entries) {
            const fullPath = pathLib.join(currentPath, name);
            const stat = await fs.stat(fullPath);

            if (stat.isDirectory()) {
                acc = await recursiveChecking(fullPath, ogPath, acc, config, slugify);
            } else {
                const keys = pathLib.relative(ogPath, fullPath)
                    .split(pathLib.sep)
                    .filter(Boolean)
                    .map(slugify);

                const storedPath =
                    config?.pathMode === "absolute"
                        ? fullPath
                        : "/" + pathLib.relative(ogPath, fullPath);

                acc = setNested(acc, keys, storedPath) as FileTree;
            }
        }

        return acc;
    } catch (err: unknown) {
        console.error(err);
        throw new Error("Path doesn't exist");
    }
}

function setNested(obj: FileTree, keys: string[], value: string): FileTree {
    if (keys.length === 0) return obj;

    const [key, ...rest] = keys as [string, ...string[]];
    const child = obj[key];
    const nested: FileTree = typeof child === "object" ? child : {};

    return {
        ...obj,
        [key]: rest.length > 0 ? setNested(nested, rest, value) : value,
    };
}