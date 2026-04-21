import codegen from "./codegen";
import { recursiveChecking } from "./core";
import type { Config } from "./types";
import { defaultConfig } from "./types";
import pathLib from "path";

export async function init(path: string, config?: Config) {
  const cfg = { ...defaultConfig, ...(config ?? {}) };

  // Resolve base for relative paths: explicit config.basePath or the current working directory
  const base = cfg.basePath ? pathLib.resolve(cfg.basePath) : process.cwd();

  // Treat provided `path` as relative to base unless it's already absolute
  const inputPath = pathLib.isAbsolute(path) ? path : pathLib.resolve(base, path);

  const result = await recursiveChecking(inputPath, inputPath, {}, cfg);
  await codegen(result, cfg);
}