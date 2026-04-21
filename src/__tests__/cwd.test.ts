import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import fs from "fs/promises";
import pathLib from "path";
import os from "os";
import { init } from "..";

let tmpDir: string;
let originalCwd: string;

beforeEach(async () => {
  originalCwd = process.cwd();
  tmpDir = await fs.mkdtemp(pathLib.join(os.tmpdir(), "gensf-cwd-"));
});

afterEach(async () => {
  try {
    process.chdir(originalCwd);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});

async function writeFile(relPath: string, content = "") {
  const full = pathLib.join(process.cwd(), relPath);
  await fs.mkdir(pathLib.dirname(full), { recursive: true });
  await fs.writeFile(full, content);
}

describe("consumer CWD / basePath behavior", () => {
  it("resolves relative input/output paths against consumer cwd by default", async () => {
    process.chdir(tmpDir);
    await writeFile("public/images/logo.png", "data");

    await init("./public", { outputPath: "./output", extension: "js" });

    const stat = await fs.stat(pathLib.join(tmpDir, "output.js"));
    expect(stat.isFile()).toBe(true);
  });

  it("honors config.basePath when provided", async () => {
    // create another tmp dir that will act as base
    const base = await fs.mkdtemp(pathLib.join(os.tmpdir(), "gensf-base-"));
    // inside base create public
    await fs.mkdir(pathLib.join(base, "public", "css"), { recursive: true });
    await fs.writeFile(pathLib.join(base, "public", "css", "style.css"), "x");

    // change cwd to somewhere else
    process.chdir(tmpDir);

    // call init with relative input but basePath set to `base`
    await init("./public", { outputPath: "./generated", basePath: base, extension: "js" });

    // output should be created under the provided basePath
    const out = pathLib.join(base, "generated.js");
    const stat = await fs.stat(out);
    expect(stat.isFile()).toBe(true);

    // cleanup base
    await fs.rm(base, { recursive: true, force: true });
  });

  it("accepts absolute input paths while still writing output relative to cwd (or basePath)", async () => {
    // create public in another place
    const other = await fs.mkdtemp(pathLib.join(os.tmpdir(), "gensf-other-"));
    await fs.mkdir(pathLib.join(other, "public", "a"), { recursive: true });
    await fs.writeFile(pathLib.join(other, "public", "a", "f.txt"), "x");

    // change cwd to tmpDir
    process.chdir(tmpDir);

    // call with absolute input path, default output
    await init(pathLib.join(other, "public"), { outputPath: "./out", extension: "js" });

    const stat = await fs.stat(pathLib.join(tmpDir, "out.js"));
    expect(stat.isFile()).toBe(true);

    // cleanup other
    await fs.rm(other, { recursive: true, force: true });
  });
});
