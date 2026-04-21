import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import fs from "fs/promises";
import pathLib from "path";
import os from "os";
import codegen from "../codegen";
import type { Config } from "../types";

let tmpDir: string;

const sampleTree = {
    images: {
        logo_png: "/public/images/logo.png",
        hero_png: "/public/images/hero.png",
    },
    css: {
        style_css: "/public/css/style.css",
    },
};

function baseConfig(overrides: Partial<Config> = {}): Config {
    return {
        outputPath: pathLib.join(tmpDir, "output"),
        variableName: "staticFolder",
        typeName: "StaticFolder",
        ...overrides,
    };
}

beforeEach(async () => {
    tmpDir = await fs.mkdtemp(pathLib.join(os.tmpdir(), "gensf-codegen-"));
});

afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("codegen — JS output", () => {
    it("writes a .js file with the variable declaration", async () => {
        await codegen(sampleTree, baseConfig({ extension: "js" }));

        const content = await fs.readFile(pathLib.join(tmpDir, "output.js"), "utf8");
        expect(content).toContain("const staticFolder =");
        expect(content).toContain("logo_png");
    });

    it("writes a .d.ts file alongside the .js file", async () => {
        await codegen(sampleTree, baseConfig({ extension: "js" }));

        const dts = await fs.readFile(pathLib.join(tmpDir, "output.d.ts"), "utf8");
        expect(dts).toContain("export declare const staticFolder:");
        expect(dts).toContain("export { staticFolder }");
    });
});

describe("codegen — TS output", () => {
    it("writes a .ts file with the variable and type export", async () => {
        await codegen(sampleTree, baseConfig({ extension: "ts" }));

        const content = await fs.readFile(pathLib.join(tmpDir, "output.ts"), "utf8");
        expect(content).toContain("const staticFolder =");
        expect(content).toContain("export type StaticFolder = typeof staticFolder");
        expect(content).toContain("export { staticFolder }");
    });

    it("uses the custom variableName and typeName from config", async () => {
        await codegen(sampleTree, baseConfig({
            extension: "ts",
            variableName: "myPaths",
            typeName: "MyPaths",
        }));

        const content = await fs.readFile(pathLib.join(tmpDir, "output.ts"), "utf8");
        expect(content).toContain("const myPaths =");
        expect(content).toContain("export type MyPaths = typeof myPaths");
    });

    it("creates parent directories if they don't exist", async () => {
        await codegen(sampleTree, baseConfig({
            extension: "ts",
            outputPath: pathLib.join(tmpDir, "deep/nested/output"),
        }));

        const stat = await fs.stat(pathLib.join(tmpDir, "deep/nested/output.ts"));
        expect(stat.isFile()).toBe(true);
    });
});
