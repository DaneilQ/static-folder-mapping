import codegen from "./codegen.ts";
import {recursiveChecking} from "./core.ts";
import type {Config} from "./types";
import {defaultConfig} from "./types";

export async function init(path: string, config?: Config) {
    const cfg = {...defaultConfig, ...(config ?? {})};
    const result = await recursiveChecking(path, path, {}, cfg)
    await codegen(result, cfg);
}