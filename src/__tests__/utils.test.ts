import { describe, it, expect } from "bun:test";
import {
    slugifyDefault,
    slugifySnake,
    slugifyLower,
    pickSlugify,
} from "../utils";

describe("slugifyDefault", () => {
    it("lowercases text", () => {
        expect(slugifyDefault("Hello World")).toBe("hello-world");
    });

    it("replaces spaces with hyphens", () => {
        expect(slugifyDefault("foo bar baz")).toBe("foo-bar-baz");
    });

    it("collapses multiple hyphens", () => {
        expect(slugifyDefault("foo--bar---baz")).toBe("foo-bar-baz");
    });

    it("strips leading and trailing hyphens", () => {
        expect(slugifyDefault("-foo-bar-")).toBe("foo-bar");
    });
});

describe("slugifySnake", () => {
    it("converts hyphens to underscores", () => {
        expect(slugifySnake("hello world")).toBe("hello_world");
    });

    it("replaces non-word characters with underscores", () => {
        expect(slugifySnake("foo.bar!baz")).toBe("foo_bar_baz");
    });
});

describe("slugifyLower", () => {
    it("lowercases and replaces non-word chars with underscores", () => {
        expect(slugifyLower("Hello World")).toBe("hello_world");
    });

    it("preserves digits", () => {
        expect(slugifyLower("File 2025")).toBe("file_2025");
    });
});

describe("pickSlugify", () => {
    it("returns slugifyDefault when no style is given", () => {
        expect(pickSlugify()).toBe(slugifyDefault);
    });

    it("returns slugifyDefault for 'default' style", () => {
        expect(pickSlugify("default")).toBe(slugifyDefault);
    });

    it("returns slugifySnake for 'snake' style", () => {
        expect(pickSlugify("snake")).toBe(slugifySnake);
    });

    it("returns slugifyLower for 'lower' style", () => {
        expect(pickSlugify("lower")).toBe(slugifyLower);
    });

    it("returns identity function for 'preserve' style", () => {
        const preserve = pickSlugify("preserve");
        expect(preserve("Hello World")).toBe("Hello World");
    });

    it("prefers a custom function over style", () => {
        const custom = (t: string) => t.toUpperCase();
        expect(pickSlugify("snake", custom)).toBe(custom);
    });
});
