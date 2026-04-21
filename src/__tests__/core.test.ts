import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import fs from "fs/promises";
import pathLib from "path";
import os from "os";
import { recursiveChecking } from "../core.ts";

let tmpDir: string;

async function createFile(relativePath: string, content = "") {
    const full = pathLib.join(tmpDir, relativePath);
    await fs.mkdir(pathLib.dirname(full), { recursive: true });
    await fs.writeFile(full, content);
}

beforeEach(async () => {
    tmpDir = await fs.mkdtemp(pathLib.join(os.tmpdir(), "gensf-test-"));
});

afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("recursiveChecking", () => {
    it("builds a nested tree from a flat directory", async () => {
        await createFile("images/logo.png");
        await createFile("images/hero.png");

        const result = await recursiveChecking(tmpDir, tmpDir, {}, {
            slugStyle: "snake",
            pathMode: "relative",
        });

        expect(result).toMatchObject({
            images: {
                logo_png: expect.any(String),
                hero_png: expect.any(String),
            },
        });
    });

    it("stores relative paths when pathMode is 'relative'", async () => {
        await createFile("css/style.css");

        const result = await recursiveChecking(tmpDir, tmpDir, {}, {
            slugStyle: "snake",
            pathMode: "relative",
        });

        expect((result as any).css.style_css).toBe("css/style.css");
    });

    it("stores absolute paths when pathMode is 'absolute'", async () => {
        await createFile("css/style.css");

        const result = await recursiveChecking(tmpDir, tmpDir, {}, {
            slugStyle: "snake",
            pathMode: "absolute",
        });

        expect((result as any).css.style_css).toStartWith("/");
    });

    it("applies snake_case slugification to keys", async () => {
        await createFile("my folder/my file.txt");

        const result = await recursiveChecking(tmpDir, tmpDir, {}, {
            slugStyle: "snake",
            pathMode: "relative",
        });

        expect(result).toHaveProperty("my_folder");
        expect((result as any).my_folder).toHaveProperty("my_file_txt");
    });

    it("preserves original key names when slugStyle is 'preserve'", async () => {
        await createFile("assets/Logo.PNG");

        const result = await recursiveChecking(tmpDir, tmpDir, {}, {
            slugStyle: "preserve",
            pathMode: "relative",
        });

        expect(result).toHaveProperty("assets");
        expect((result as any).assets["Logo.PNG"]).toBeDefined();
    });

    it("handles nested subdirectories", async () => {
        await createFile("a/b/c/deep.txt");

        const result = await recursiveChecking(tmpDir, tmpDir, {}, {
            slugStyle: "snake",
            pathMode: "relative",
        });

        expect((result as any).a.b.c.deep_txt).toBe("a/b/c/deep.txt");
    });

    it("throws when the path does not exist", async () => {
        await expect(
            recursiveChecking("/non/existent/path", "/non/existent/path", {}, {
                slugStyle: "snake",
                pathMode: "relative",
            })
        ).rejects.toThrow("Path doesn't exist");
    });
});
