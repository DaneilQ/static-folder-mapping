import codegen from "./codegen";
import { recursiveChecking } from "./core";
import type { Config } from "./types";
import { defaultConfig } from "./types";

export async function init(path: string, config?: Config) {
  const cfg = { ...defaultConfig, ...(config ?? {}) };
  const result = await recursiveChecking(path, path, {}, cfg);
  await codegen(result, cfg);
}